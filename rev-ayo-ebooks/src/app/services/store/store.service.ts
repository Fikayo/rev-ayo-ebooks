import { Injectable, OnDestroy } from '@angular/core';
import { IAPProduct, IAPProducts, InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { BookstoreService } from '../bookstore/bookstore.service';
import { ProductInfo } from "../../models/ProductInfo";
import { UserService } from '../user/user.service';
import { CurrencyToRegion, StoreRegion } from 'src/app/models/Region';
import { StoreRegionService } from '../store-region.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService implements OnDestroy {
    private readonly productInfos: Map<string, ProductInfo> = new Map();
    private appstoreReady = new BehaviorSubject(false);
    private storeRegion: StoreRegion = StoreRegion.UNKNOWN;
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private user: UserService,
        private bookstore: BookstoreService, 
        private regionService: StoreRegionService,       
        private iap: InAppPurchase2) {
    }

    public ready(): Observable<boolean> {
        return this.appstoreReady.asObservable();
    }

    public initStore() {
        if(this.appstoreReady.getValue()) {
            this.appstoreReady.next(true);
            return;
        }

        console.debug("initialising store service");
        this.bookstore.fetchProdutinfo()
        .then((infos: ProductInfo[]) => {
            console.log("fetched product info", infos);
            this.productInfos.clear();
            infos.forEach(p => {
                this.productInfos.set(p.ISBN, {ISBN: p.ISBN, productID: `${p.productID}_world`});
            });

            this.prepareStore();
        })
        .catch((err) => console.error("Failed to fetch product info from backend", err));
    }

    public ngOnDestroy(): void {   
        this.destroy$.next(true);
        this.destroy$.unsubscribe();         
    }

    public async orderBook(bookID: string): Promise<void> {
        console.debug("attempting to purchase", bookID);
        if(!this.productInfos.has(bookID)) {
            console.debug(`can't find productInfo for book ${bookID}. Returning`);
            return;
        }
        
        try {
            const prod = this.productInfos.get(bookID) as ProductInfo;
            console.debug("calling store with ", prod)
            await this.iap.order(prod.productID);
            console.debug('order in progress');
        } catch (error) {
           return Promise.reject(error);
        }     
    }

    public refresh() {
        console.debug("Store Refreshed!");
        this.iap.refresh();
    }

    private prepareStore() {
        const storeEvents = this.iap.when('') as any;
        if (storeEvents.error && storeEvents.error == "cordova_not_available") {
            console.error("Cordova likely not avaiable - try on a device. Error: ", storeEvents);
            this.appstoreReady.next(true);
            this.regionService.updateStoreRegion(StoreRegion.WORLD);
            return;
        }

        this.iap.verbosity = this.iap.DEBUG;
        this.productInfos.forEach(p => {
            this.registerProduct(p);
            this.registerHandlers(p);
        });
              
        this.iap.error(function(error: any) {
            console.error('STORE ERROR ' + error.code + ': ' + error.message);
        });
        
        this.iap.ready(() => {
            this.onStoreReady(this.iap.products);
        });

        this.refresh();
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

    private onStoreReady(storeProducts: IAPProducts) {
        if (!storeProducts) return;

        storeProducts.forEach((p: IAPProduct) => {
            if (p.price == null) {
                console.debug("skipping product with null price", JSON.stringify(p), p);
                return;
            }

            const region = this.updateStoreRegion(p.currency);
            let isbn: string = p.alias ?? "";
            this.bookstore.updateProduct(isbn, p, region)
            .catch((err) => console.error("Failed to update product", p, err));
        });

        console.debug('Store Products: ', storeProducts);
        this.appstoreReady.next(true);
    }

    private updateStoreRegion(currency: string): StoreRegion {
        this.storeRegion = CurrencyToRegion(currency);
        this.regionService.updateStoreRegion(this.storeRegion);
        return this.storeRegion;
    }

    private productApproved(product: IAPProduct) {
        console.debug("product approved", product);

        // Ensure to download book if needed
        let isbn: any = product.alias;
        this.user.purchaseBook(isbn)
        .then(() => product.verify())
        .catch((err) => console.error("Failed to acquire purchased book", err))
    }

    private productCancelled(product: IAPProduct) {
        console.debug("product cancelled", product);
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
        this.bookstore.updateProduct(isbn, product, this.storeRegion)
        .then(() => console.log("product updated", product))
        .catch((err) => console.error("Failed to update product", err));
    }
    
    private productVerified(product: IAPProduct) {
        console.debug("product verified", product);
        product.finish();
    }

    private productFinished(product: IAPProduct) {
        console.debug("product finished", product);
    }
}
