import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { UserService } from './services/user/user.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { Platform } from '@ionic/angular';
import { PaymentService } from './services/payment/payment.service';

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
        platform: Platform,
    ) {
        this.monitorNavigation();
        // this.fixReload();

        platform.ready().then(() => {
            this.payment.initStore();
            this.setStatusBar();
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
