import { Component, OnInit, NgZone, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { IonSelect, ToastController } from '@ionic/angular';

@Component({
  selector: 'ebook-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss']
})
export class AccountPage implements OnInit, OnDestroy {

    public userRegion: string = '';
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private transition: TransitionService,
        private toastCtrl: ToastController,
        private user: UserService,
        private zone: NgZone) { }

    ngOnInit(): void {
        this.user.user
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (u: User) => {                
                console.log("ACCOUNT USER UPDATED: ", u);
               
                this.zone.run(() => {
                    setTimeout(() => { 
                        this.userRegion = u.region; 
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
    
    public regionChange(newRegion: any) {
        console.info("region changing to ", newRegion);
        this.user.updateRegion(newRegion)
        .catch(e => {
            console.error("Failed to update region", e);
            this.showToast("Failed to update region");
        })
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
		console.info("showing toast message: " + message);
		const toast = await this.toastCtrl.create({
			message: message,
			duration: 3000
		});
		
		toast.present();
	}
}
