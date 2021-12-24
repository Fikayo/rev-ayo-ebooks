import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { UserService } from './services/user/user.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { LoadingController, Platform } from '@ionic/angular';
import { PaymentService } from './services/payment/payment.service';
import { DatabaseService } from './services/database/database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'rev-ayo-ebooks';

    constructor(
        private router: Router,
        private payment: PaymentService,
        private db: DatabaseService,
        loadingCtrl: LoadingController,
        platform: Platform,
    ) {
        this.monitorNavigation();
        // this.fixReload();

        platform.ready().then(async () => {
            const loading = await loadingCtrl.create();
            await loading.present();

            this.db.init();
            this.db.ready.asObservable().subscribe({
                next: (ready) => {
                    if(ready) {
                        console.log("Database Ready!");

                        this.payment.initStore();
                        this.payment.ready.asObservable().subscribe({
                            next: (pReady) => {
                                if(pReady) {
                                    console.log("AppStore Ready!");
                                    this.setStatusBar();
                                    loading.dismiss();
                                }
                            }
                        });
                        
                    }
                }
            });

           
        });        
    }

    private async setStatusBar() {
        StatusBar.setBackgroundColor({color:"#ffffff"});
        await StatusBar.setStyle({ style: Style.Light });
        StatusBar.show();
    }

    private monitorNavigation() {
        this.router.events.subscribe({ 
            next: (event) => {
                if (event instanceof NavigationEnd) {
                    console.log("router url", this.router.url);                    
                    
                    // trick the Router into believing it's last link wasn't previously loaded
                    this.router.navigated = false;
                    // if you need to scroll back to top, here is the right place
                    window.scrollTo(0, 0);
                }

                if (event instanceof NavigationError) {
                    // Present error to user
                    console.log("navigation error", event.error);
                }
            },
        });
    }

    private fixReload(): void {
        // override the route reuse strategy
        this.router.routeReuseStrategy.shouldReuseRoute = function(){
            return false;
        }
    }
}
