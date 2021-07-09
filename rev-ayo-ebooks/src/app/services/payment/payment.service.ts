import { Injectable } from '@angular/core';
import { IAPProduct, InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';
import { ProductInfo, BookstoreService } from '../bookstore/bookstore.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
    private productIDs: ProductInfo[] = [{ISBN: "unknwon", productID: "test_id_1"}];

    constructor(
        private user: UserService,
        private bookstore: BookstoreService,
        private store: InAppPurchase2) 
    { }

    public initStore() {
        this.bookstore.fetchProdutinfo().subscribe({
            next: (info) => {
                this.productIDs = info;
                this.prepare();
            }
        });
    }

    private prepare() {
        this.store.verbosity = this.store.DEBUG;
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

        this.store.ready(() =>  {
            console.log('Store is ready');
            console.log('Products: ' + JSON.stringify(this.store.products));
            console.log(JSON.stringify(this.store.get("test_id_1")));
        });

        this.store.error(function(error: any) {
            console.log('ERROR ' + error.code + ': ' + error.message);
        });

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
