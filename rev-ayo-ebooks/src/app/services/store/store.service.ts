import { Injectable } from '@angular/core';
import { IAPProduct, IAPProducts, InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { BookstoreService } from '../bookstore/bookstore.service';
import { ProductInfo } from "../../models/ProductInfo";
import { UserService } from '../user/user.service';
import { flatten } from '@angular/compiler';
import { User } from 'src/app/models/User';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
    private readonly productInfos: Map<string, ProductInfo[]> = new Map();
    private paymentReady = new BehaviorSubject(false);
    
    private userRegion: string = '';
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private user: UserService,
        private bookstore: BookstoreService,
        
        private iap: InAppPurchase2) { 
    }

    public get ready(): BehaviorSubject<boolean> {
        return this.paymentReady;
    }

    public initStore() {
        console.info("initialising store service");
        this.bookstore.fetchProdutinfo()
        .then((info: ProductInfo[]) => {
            console.log("fetched product info", info);
            this.productInfos.clear();
            info.forEach(p => {
                const naira: ProductInfo = {
                    ISBN: p.ISBN,
                    productID: this.getNairaProductId(p.productID)
                }

                const world: ProductInfo = {
                    ISBN: p.ISBN,
                    productID: this.getWorldProductId(p.productID)
                }

                this.productInfos.set(p.ISBN, [naira, world]);
            });

            this.prepareStore();
        })
        .catch((err) => console.error("Failed to fetch product info from backend", err));

        this.user.user
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (u: User) => {
                console.log("USER UPDATED: ", u);
                this.userRegion = u.region;                
            },
            error: (err) => console.error(`failed to subscribe to user`, err)
        });
    }

    public destroy(): void {   
        this.destroy$.next(true);
        this.destroy$.unsubscribe();         
    }

    public async orderBook(bookID: string): Promise<void> {
        console.log("attempting to purchase", bookID);
        if(!this.productInfos.has(bookID)) {
            console.debug(`can't find productInfo for book ${bookID}. Returning`);
            return;
        }
        
        try {
            const prods = this.productInfos.get(bookID) as ProductInfo[];
            const regionProd = this.userRegion == "nigeria" ? prods[0] : prods[1];

            console.log("calling store with ", regionProd)
            await this.iap.order(regionProd.productID);
            console.log('order in progress');
        } catch (error) {
           return Promise.reject(error);
        }     
    }

    public refresh() {
        console.debug("Store Refreshed!");
        this.iap.refresh();
    }

    private prepareStore() {
        console.info("preparing store", this.productInfos);
        const storeEvents = this.iap.when('') as any;
        if (storeEvents.error && storeEvents.error == "cordova_not_available") {
            console.error("Cordova likely not avaiable - try on a device. Error: ", storeEvents);
            this.paymentReady.next(true);
            return;
        }

        this.iap.verbosity = this.iap.DEBUG;
        const allproducts: ProductInfo[] = flatten(Array.from(this.productInfos.values()));
        allproducts.forEach(p => {
            console.log("registering product ", p);
            this.registerProduct(p);
            this.registerHandlers(p);
        });
              
        this.iap.error(function(error: any) {
            console.error('STORE ERROR ' + error.code + ': ' + error.message);
        });
        
        this.iap.ready((data: any) => {            
            console.info("Store ready data", data);
            console.info("Store ready by callback - products", this.iap.products);
            const prod = this.iap.get('test_id_1_naira')
            console.log("gotten p", prod);
            this.tryStoreReady(this.iap.products);
        });

        this.refresh();
        this.tryStoreReady(this.iap.products);
    }

    private registerProduct(p: ProductInfo) { 
        this.iap.register({
            id:    p.productID,
            type:  this.iap.NON_CONSUMABLE,
            alias: p.ISBN
        });
    }

    private registerHandlers(p: ProductInfo) {  
        this.iap.when(p.productID).approved(this.productApproved.bind(this));
        this.iap.when(p.productID).cancelled(this.productCancelled.bind(this));        
        this.iap.when(p.productID).error(this.productError.bind(this));        
        this.iap.when(p.productID).updated(this.productUpdated.bind(this));
        this.iap.when(p.productID).verified(this.productVerified.bind(this));
        this.iap.when(p.productID).finished(this.productFinished.bind(this));
    }

    private tryStoreReady(storeProducts: IAPProducts) {
        console.log("checking if store is ready");
        if (!storeProducts) return;

        let productsExist = false;
        storeProducts.forEach((p: IAPProduct) => {
            if (p.price == null) {
                console.debug("skipping product with null price", JSON.stringify(p), p);
                return;
            }

            console.log("updating ready store product", p);
            let isbn: string = p.alias ?? "";
            this.bookstore.updateProduct(isbn, p)
            .catch((err) => console.error("Failed to update product", p, err))

            productsExist = true
            console.log("PRODUCTS EXIST!!");
        });
                
        console.info('Store Products: ', storeProducts);
        if (productsExist) {
            this.paymentReady.next(true);
        } else {
            console.log("no ready products exist yet");
        }
    }

    private getNairaProductId(prodID: string): string {
        return `${prodID}_naira`;
    }

    private getWorldProductId(prodID: string): string {
        return `${prodID}_world`;
    }

    private productApproved(product: IAPProduct) {
        console.log("product approved", product);

        // Ensure to download book if needed
        let isbn: any = product.alias;
        this.user.purchaseBook(isbn)
        .then(() => product.verify())
        .catch((err) => console.error("Failed to acquire purchased book", err))
    }

    private productCancelled(product: IAPProduct) {
        console.log("product cancelled", product);
    }
    
    private productError(error: any) {
        console.error("product error", error);
    }
    
    private productUpdated(product: IAPProduct) {
        if(product.price == null) {
            console.debug("product price is null, returning", JSON.stringify(product), product);
            return;
        }

        const isbn = product.alias ?? "";
        this.bookstore.updateProduct(isbn, product)
        .then(() => console.log("product updated", product))
        .catch((err) => console.error("Failed to update product", err));
    }
    
    private productVerified(product: IAPProduct) {
        console.log("product verified", product);
        product.finish();
    }

    private productFinished(product: IAPProduct) {
        console.log("product finished", product);
    }
}
