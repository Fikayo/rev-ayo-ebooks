import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

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

    constructor(
        private router: Router,
        private location: Location
    ) {
        this.monitorNavigation();
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
                    }
                    if (url.startsWith("/personal")) {
                        this.showSearch = false;
                    }

                    this.libActive = url.startsWith("/search") || url.startsWith("/details");
                    this.personalActive = url.startsWith("/personal");
                }

                if (event instanceof NavigationError) {
                    // Present error to user
                    console.log(event.error);
                }
            },
        });
    }
}
