import { Injectable } from '@angular/core';
import { IAPProduct, InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';
import { ProductInfo, BookstoreService } from '../bookstore/bookstore.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class InAppPurchasesService {
    private productIDs: ProductInfo[] = [{ISBN: "unknwon", productID: "test_id_1"}];

    constructor(
        private user: UserService,
        private bookstore: BookstoreService,
        private platform: Platform,
        private store: InAppPurchase2) 
    {
        platform.ready().then(() => {
            this.bookstore.fetchProdutinfo().subscribe({
                next: (info) => {
                    this.productIDs = info;
                    this.prepare();
                }
            });
        });
    }

    private prepare() {
        this.productIDs.forEach(p => {
            this.store.register({
                id:    this.getCompleteProductId(p.productID),
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

        // ... MORE HERE SOON

        this.store.refresh();
    }

    private getCompleteProductId(prodID: string): string {
        return prodID;
    }

    private productApproved(product: IAPProduct) {
        console.log("product approved", product);

        // Ensure to download book if needed
        let isbn: any = product.alias;
        this.user.addToMyBooks(isbn).subscribe({
            next: () => {
                product.finish();
            }
        })
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
