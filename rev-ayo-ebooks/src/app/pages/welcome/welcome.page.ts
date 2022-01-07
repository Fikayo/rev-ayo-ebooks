import { Component, OnDestroy, OnInit } from '@angular/core';
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
        ) {    
    }

    ngOnInit(): void {          
        console.info("Welcome page initialised");
        this.platform.ready()
        .then(() => {
            console.info("platform ready");
            this.init();
        })
        .catch(e => {
            console.error("Platform could not get ready", e);
        })
    }

    ngOnDestroy(): void {
        console.debug("destroying welcome page");
        this.destroy$.next(true);
        this.destroy$.unsubscribe();        
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

    private init() {        
        this.store.initStore();
        this.store.ready.asObservable()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (pReady) => {
                if(pReady) {
                    console.log("AppStore Ready!");
                    this.entryAllowed = true;
                    this.storeError = false;
                    
                    if(this.storeTimeout) {
                        clearTimeout(this.storeTimeout);
                    }

                    this.checkLogin();
                }
            }
        }); 

        this.storeInitWatchdog();
    }

    private checkLogin() {
        this.user.isLoggedIn()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (loggedIn) => {
                if(loggedIn) {
                    this.transition.slide('/books/store');
                }
            },
            error: (err) => console.error("Error trying to read login ID", err)
        });
    }

    private storeInitWatchdog() {
		const timeout = 60000 * 2; // 2 minutes
		this.storeTimeout = setTimeout(() => {
            console.error("App store never became ready!");
			this.storeError = true;
		}, timeout);
	}
}
