import { Injectable } from '@angular/core';
import { IAPProduct, InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { BookstoreService } from '../bookstore/bookstore.service';
import { ProductInfo } from "../../models/ProductInfo";
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
    private productInfos: ProductInfo[] = [{ISBN: "unknwon", productID: "test_id_1"}];
    private paymentReady = new BehaviorSubject(false);

    constructor(
        private user: UserService,
        private bookstore: BookstoreService,
        private store: InAppPurchase2) 
    { }

    public get ready(): BehaviorSubject<boolean> {
        return this.paymentReady;
    }

    public initStore() {
        this.bookstore.fetchProdutinfo().subscribe({
            next: (info: ProductInfo[]) => {
                const prods: ProductInfo[] = [];
                info.forEach(p => {
                    const naira: ProductInfo = {
                        ISBN: p.ISBN,
                        productID: this.getNairaProductId(p.productID)
                    }

                    const world: ProductInfo = {
                        ISBN: p.ISBN,
                        productID: this.getWorldProductId(p.productID)
                    }

                    prods.push(naira);
                    prods.push(world);
                });

                this.productInfos = prods;
                this.prepareStore();
            }
        });

        this.store.ready(() => {
            console.info("Store ready");
            this.store.products.forEach((p: IAPProduct) => {
                let isbn: string = p.alias??"";
                this.bookstore.updateProduct(isbn, p);
            });
            
            console.info('Store Products: ' + JSON.stringify(this.store.products));
            this.paymentReady.next(true);
        });
    }

    private prepareStore() {
        console.info("store product infos", this.productInfos);
        const storeEvents = this.store.when('') as any
        if (storeEvents.error) {
            console.error("Cordova likely not avaiable - try on a device. Error: ", storeEvents.error);
            this.paymentReady.next(true);
            return;
        }

        this.store.verbosity = this.store.DEBUG;
        this.productInfos.forEach(p => {
            this.store.register({
                id:    p.productID,
                type:  this.store.NON_CONSUMABLE,
                alias: p.ISBN
            });

            this.store.when(p.productID).approved(this.productApproved.bind(this));
            this.store.when(p.productID).cancelled(this.productCancelled.bind(this));        
            this.store.when(p.productID).error(this.productError.bind(this));        
            this.store.when(p.productID).updated(this.productUpdated.bind(this));
        });

        this.store.error(function(error: any) {
            console.log('ERROR ' + error.code + ': ' + error.message);
        });

        this.store.refresh();
    }

    private getNairaProductId(prodID: string): string {
        return `${prodID}_NAIRA`;
    }

    private getWorldProductId(prodID: string): string {
        return `${prodID}_WORLD`;
    }

    private productApproved(product: IAPProduct) {
        console.log("product approved", product);

        // Ensure to download book if needed
        let isbn: any = product.alias;
        this.user.purchaseBook(isbn).subscribe({
            next: () => {
                product.finish();
            }
        });
    }

    private productCancelled(product: IAPProduct) {
        console.log("product cancelled", product);
    }
    
    private productError(product: IAPProduct) {
        console.log("product error", product);
    }
    
    private productUpdated(product: IAPProduct) {
        console.log("product updated", product);
    }
}
