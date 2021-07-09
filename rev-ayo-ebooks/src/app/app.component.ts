import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { UserService } from './services/user/user.service';
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

    public showTopToolbar!: boolean;
    public showBottomMenu!: boolean;
    public toolbarIsBlack!: boolean;
    public showSearch!: boolean;
    public showMiniSearch!: boolean;
    public storeActive!: boolean;
    public personalActive!: boolean;
    public showBack!: boolean;

    constructor(
        private router: Router,
        private location: Location,
        private dialog: MatDialog,
        private payment: PaymentService,
        platform: Platform,
    ) {
        this.monitorNavigation();
        // this.fixReload();
        platform.ready().then(() => {
            this.payment.initStore();
        });
    }

    public goBack() {
        this.location.back();
    }

    public openStore() {
        this.router.navigate([`/store`]);
    }

    public openSearch() {
        this.router.navigate([`/searchpage`]);
    }

    public openPersonal() {
        this.router.navigate([`/personal`]);
    }

    public openDialog() {
        this.dialog.open(SettingsDialogComponent, { panelClass: "ebook-dialog" });
    }

    private defaultUI() {
        this.showTopToolbar = true;
        this.showBottomMenu = true;
        this.toolbarIsBlack = true;
        this.showSearch = true;
        this.showMiniSearch = false;
        this.showBack = false;
    }

    private monitorNavigation() {
        this.router.events.subscribe({ 
            next: (event) => {
                if (event instanceof NavigationEnd) {
                    this.defaultUI();
                    let url = this.router.url;
                    console.log("router url", url);
                    if (url.startsWith("/read")) {
                        this.showTopToolbar = false;
                        this.showBottomMenu = false;
                    }                    
                    if (url.startsWith("/details")) {
                        this.showBack = true;
                        this.showSearch = false;
                        this.showMiniSearch = true;
                    }
                    if (url.startsWith("/searchpage")) {
                        this.showTopToolbar = false;
                        this.showBottomMenu = false;
                    }
                    if (url.startsWith("/settings")) {
                        this.showBack = true;
                        this.showSearch = false;
                        this.showBottomMenu = false;
                    }

                    this.storeActive = url.startsWith("/store");
                    this.personalActive = url.startsWith("/personal");
                    
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
