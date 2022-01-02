import { Component, Inject, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ViewController } from '@ionic/core';
import { BookInfo } from "src/app/models/BookInfo";
import { PaymentService } from 'src/app/services/payment/payment.service';

@Component({
  selector: 'ebook-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModal implements OnInit {

	@Input() public book!: BookInfo;
	private paymentTimeout!: any;

	constructor(
        private payment: PaymentService,
		private loadingCtrl: LoadingController,
		private toastCtrl: ToastController,
		private modalCtrl: ModalController) 
	{
	}

	ngOnInit(): void {
	}

	public async makeOrder() {
		console.log("Ordering book", this.book);
		await this.showLoader();
		this.orderTimer();
		this.payment.orderBook(this.book.ISBN).then(_ => {
			this.hideLoader();
			this.successfulPurchase();
		})
		.catch(error => {
			this.hideLoader();
			console.error(`Failed to order book ${this.book.ISBN}`, error);
			this.showError("An unexpected error occured. Please try again.");
		});

	}

	private async showLoader() {
		const loader = await this.loadingCtrl.create({
			backdropDismiss: false,
			translucent: true,
			cssClass:'ion-loading-class',
		});

		loader.present();
	}

	private hideLoader() {
		if(this.paymentTimeout) {
			clearTimeout(this.paymentTimeout);
		}

		this.loadingCtrl.dismiss();
	}

	private successfulPurchase() {
		this.modalCtrl.dismiss({}, "success");
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
		const timeout = 60000 * (45/60); // 45 seconds
		this.paymentTimeout = setTimeout(() => {
			this.hideLoader();
			this.showError("The order took too long to process. Please try again.");
		}, timeout);
	}
}
