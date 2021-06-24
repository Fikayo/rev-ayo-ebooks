import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationError, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'rev-ayo-ebooks';

    public showToolbar!: boolean;
    public toolbarIsBlack!: boolean;
    public showSearch!: boolean;
    public libActive!: boolean;
    public personalActive!: boolean;
    public showMenu!: boolean;

    constructor(
        private router: Router,
        private location: Location
    ) {
        console.log("MADE IT TO THE CITY");
        this.monitorNavigation();
        this.fixReload();
    }

    public goBack() {
        this.location.back();
    }

    public onSelectedFilter(filter: any) {  
        let extras: any = null;
        if (filter != null || filter != undefined) {
            extras = { queryParams: { filter: encodeURIComponent(filter.trim()) } };
        }

        this.router.navigate([`/search/`], extras);
    }

    public openLibrary() {
        this.router.navigate([`/search`]);
    }

    public openPersonal() {
        this.router.navigate([`/personal`]);
    }

    private defaultUI() {
        this.showToolbar = true;;
        this.toolbarIsBlack = true;
        this.showSearch = true;
        this.showMenu = true;
    }

    private monitorNavigation() {
        this.router.events.subscribe({ 
            next: (event) => {
                if (event instanceof NavigationEnd) {
                    this.defaultUI();
                    let url = this.router.url;
                    console.log("router url", url);
                    if (url.startsWith("/read")) {
                        this.showToolbar = false;
                    }                    
                    if (url.startsWith("/details")) {
                        this.toolbarIsBlack = false;
                        this.showMenu = false;
                    }
                    if (url.startsWith("/personal")) {
                        this.showSearch = false;
                    }

                    this.libActive = url.startsWith("/search") || url.startsWith("/details");
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
