import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'rev-ayo-ebooks';

    constructor(
        private router: Router,
        private location: Location) {}

    public goBack() {
        this.location.back();
    }

    public onSelectedFilter(filter: any) {  
        if (filter != null || filter != undefined || filter.trim() != "") {
            this.router.navigate([`/search/`], { queryParams: { filter: encodeURIComponent(filter) } });
        } else {
            this.router.navigate([`/search/`]);
        }
    }
}
