import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store/store.service';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { Platform } from '@ionic/angular';

@Component({
    selector: 'ebook-welcome',
    templateUrl: './welcome.page.html',
    styleUrls: ['./welcome.page.scss'],
    animations: [
        trigger('storeReady', [
            state('hide', style({opacity: 0})),
            transition('hide => show', animate(215, keyframes([
                style({opacity: 0}),
                style({opacity: 1}),
            ]))),
            state('show', style({opacity: 1})),
        ]),
        trigger('loadingDone', [
            state('show', style({opacity: 1})),
            transition('show => hide', animate(215, keyframes([
                style({opacity: 1}),
                style({opacity: 0}),
            ]))),
            state('hide', style({opacity: 0, display: 'none'})),
        ]),
        trigger('storeError', [
            state('hide', style({opacity: 0, display: 'none'})),
            transition('hide => show', animate(215, keyframes([
                style({opacity: 0, display: 'block'}),
                style({opacity: 1}),
            ]))),
            state('show', style({opacity: 1, display: 'block'})),
        ]),
    ]
})
export class WelcomePage implements OnInit, OnDestroy {    
    private storeError: boolean = false;
    private entryAllowed: boolean = false;
	private storeTimeout!: any;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private platform: Platform,
        private user: UserService,
        private transition: TransitionService,
        private store: StoreService,
        private zone: NgZone
        ) {    
    }

    ngOnInit(): void {
        this.store.ready()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (pReady: boolean) => {
                if(pReady) {
                    this.zone.run(() => {
                        console.log("AppStore Ready!");
                        this.entryAllowed = true;
                        this.storeError = false;
                        
                        if(this.storeTimeout) {
                            clearTimeout(this.storeTimeout);
                        }
    
                        this.checkLogin();
                    });
                }
            }
        }); 
    }

    ngOnDestroy(): void {
        console.debug("destroying welcome page");
        this.store.destroy();
        this.destroy$.next(true);
        this.destroy$.unsubscribe();        
    }

    ionViewDidEnter() {  
        console.info("Welcome page initialised");
        this.platform.ready()
        .then(() => {
            console.info("platform ready");            
            this.store.initStore();
            this.storeInitWatchdog();
        })
        .catch(e => {
            console.error("Platform could not get ready", e);
        })
    }

    public get allowEntry(): string {
        return this.entryAllowed ? 'show' : 'hide';
    }

    public get showSpinner(): string {
        return this.entryAllowed || this.storeError ? 'hide' : 'show';
    }

    public get showError(): string {
        return this.storeError ? 'show' : 'hide';
    }

    public tryAgain() {
        this.storeError = false;
        this.store.refresh();
    }

    private checkLogin() {
        this.user.isLoggedIn()
        .then((loggedIn) => {
            if(loggedIn) {
                console.log("logged in. Going to bookstore");
                this.transition.slide('/books/store');
            }
        })
        .catch((err) => console.error("Error trying to read login ID", err))
    }

    private storeInitWatchdog() {
		const timeout = 60000 * 2; // 2 minutes
		this.storeTimeout = setTimeout(() => {
            console.error("App store never became ready!");
			this.storeError = true;
		}, timeout);
	}
}
