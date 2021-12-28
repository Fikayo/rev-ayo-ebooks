import { Component, Inject, Input, OnInit } from '@angular/core';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { LoadingController, ToastController } from '@ionic/angular';
import { BookInfo } from "src/app/models/BookInfo";

@Component({
  selector: 'ebook-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModal implements OnInit {

	@Input() public book!: BookInfo;

	constructor(
        private store: InAppPurchase2,
		private loadingCtrl: LoadingController,
		private toastCtrl: ToastController) 
	{
	}

	ngOnInit(): void {
	}

	public makeOrder() {
		this.showLoader();
		this.orderTimer();
		this.store.order(this.book.productID).then((data: any) => {
			console.log('order success : ' + JSON.stringify(data));
			this.hideLoader();
		}, (error: any) => {
			this.hideLoader();

			console.debug(`Failed to order book ${this.book.ISBN}`, error);
			this.showError("An unexpected error occured. Please try again.");
		});

	}

	private showLoader() {
		this.loadingCtrl.create({
			backdropDismiss: false,
			translucent: true,
			cssClass:'ion-loading-class',
		}).then((res) => {
			res.present();
		});
	}

	private hideLoader() {
		this.loadingCtrl.dismiss();
	}

	private async showError(message: string) {
		console.log("showing error message: " + message);
		const toast = await this.toastCtrl.create({
			message: message,
			duration: 3000
		});
		
		toast.present();
	}

	private orderTimer() {
		const timeout = 60000 * 5; // 5 minutes
		setTimeout(() => {
			this.hideLoader();
			this.showError("The order took too long to process. Please try again.");
		}, timeout);
	}
}
