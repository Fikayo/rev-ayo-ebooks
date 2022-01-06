import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { PaymentService } from './services/payment/payment.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'rev-ayo-ebooks';
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private router: Router,
        private payment: PaymentService,
        private platform: Platform,
    ) {
        // this.fixReload();    
    }

    ngOnInit(): void {
        console.debug("initialising main app");
        this.monitorNavigation();
        this.platform.ready().then(async () => {
                
            this.setStatusBar();
        }); 
    }

    ngOnDestroy(): void {
        console.debug("destroying main app");
        this.destroy$.next(true);
        this.destroy$.unsubscribe();        
    }

    private async setStatusBar() {
        StatusBar.setBackgroundColor({color:"#ffffff"});
        await StatusBar.setStyle({ style: Style.Light });
        StatusBar.show();
    }

    private monitorNavigation() {
        this.router.events
        .pipe(takeUntil(this.destroy$))
        .subscribe({ 
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
