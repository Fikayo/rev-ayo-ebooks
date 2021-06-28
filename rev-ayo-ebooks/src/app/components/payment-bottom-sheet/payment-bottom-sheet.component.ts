import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
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
		@Inject(MAT_BOTTOM_SHEET_DATA)
		public data: {book: BookTitle},
        private store: InAppPurchase2) 
	{
		this.book = data.book;
	}

	ngOnInit(): void {
	}

	public makeOrder() {
		this.store.order(this.book.productID);
	}

}
