import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { BookTitle } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'ebook-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModal implements OnInit {

	@Input() public book!: BookTitle;

	constructor(
        private store: InAppPurchase2) 
	{
	}

	ngOnInit(): void {
	}

	public makeOrder() {
		this.store.order(this.book.productID);
	}

}
