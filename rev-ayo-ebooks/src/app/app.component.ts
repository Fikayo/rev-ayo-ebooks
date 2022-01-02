import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LoadingController, Platform } from '@ionic/angular';
import { PaymentService } from './services/payment/payment.service';
import { UserService } from './services/user/user.service';

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
        loadingCtrl: LoadingController,
        platform: Platform,
    ) {
        this.router.navigate(['/welcome']);
        this.monitorNavigation();
        // this.fixReload();

        platform.ready().then(async () => {
            
            // const loading = await loadingCtrl.create();
            // await loading.present();
            
            this.payment.initStore();
            this.payment.ready.asObservable().subscribe({
                next: (pReady) => {
                    if(pReady) {
                        console.log("AppStore Ready!");
                        this.setStatusBar();
                        // loading.dismiss();
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
                    console.info("router url", this.router.url);                    
                    
                    // trick the Router into believing it's last link wasn't previously loaded
                    this.router.navigated = false;
                    // if you need to scroll back to top, here is the right place
                    window.scrollTo(0, 0);
                }

                if (event instanceof NavigationError) {
                    // Present error to user
                    console.error("navigation error", event.error);
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
