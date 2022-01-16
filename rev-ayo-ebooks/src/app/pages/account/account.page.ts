import { Component, OnInit, NgZone, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { IonSelect, ToastController } from '@ionic/angular';
import { StoreRegionService } from 'src/app/services/store-region.service';
import { StoreRegion } from 'src/app/models/Region';

@Component({
  selector: 'ebook-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss']
})
export class AccountPage implements OnInit, OnDestroy {

    public storeRegion: StoreRegion = StoreRegion.UNKNOWN;
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private transition: TransitionService,
        private toastCtrl: ToastController,
        private user: UserService,
        private regionService: StoreRegionService,
        private zone: NgZone) { }

    ngOnInit(): void {
        this.regionService.region()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (sr) => {
                this.zone.run(() => {
                    setTimeout(() => { 
                        this.storeRegion = sr
                    },0);           
                });
            },
            error: (err) => console.error(`failed to subscribe to user`, err)
        });
    }
 
    ngOnDestroy(): void {   
        console.debug("account page destroyed");
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
    
    public logout() {
        this.user.logoutUser()
        .then(() => {
            this.transition.fade("");
        })
        .catch(e => {
            this.showToast("An error occured while logging out Please try again later");
        });
    }

    private async showToast(message: string) {
		const toast = await this.toastCtrl.create({
			message: message,
			duration: 3000
		});
		
		toast.present();
	}
}
