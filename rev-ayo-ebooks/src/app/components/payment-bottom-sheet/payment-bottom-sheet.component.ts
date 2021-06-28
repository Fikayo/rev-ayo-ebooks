import { Component, OnInit } from '@angular/core';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { BookTitle } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'app-payment-bottom-sheet',
  templateUrl: './payment-bottom-sheet.component.html',
  styleUrls: ['./payment-bottom-sheet.component.scss']
})
export class PaymentBottomSheetComponent implements OnInit {

	public book!: BookTitle;

	constructor(
        private store: InAppPurchase2) { }

	ngOnInit(): void {
	}

	public makeOrder() {
		this.store.order(this.book.productID);
	}

}
