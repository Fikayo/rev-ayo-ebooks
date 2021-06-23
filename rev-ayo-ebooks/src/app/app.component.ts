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

    private defaultUI() {
        this.showToolbar = true;;
        this.toolbarIsBlack = true;
    }

    private monitorNavigation() {
        this.router.events.subscribe({ 
            next: (event) => {
                if (event instanceof NavigationEnd) {
                    this.defaultUI();
                    console.log("router url", this.router.url);
                    if (this.router.url.startsWith("/read")) {
                        this.showToolbar = false;
                    }                    
                    if (this.router.url.startsWith("/details")) {
                        this.toolbarIsBlack = false;
                    }
                }

                if (event instanceof NavigationError) {
                    // Present error to user
                    console.log(event.error);
                }
            },
        });
    }
}
