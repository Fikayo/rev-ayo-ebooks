import { Component, OnInit, ViewChild, ViewChildren, NgZone } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { BookInfo } from "src/app/models/BookInfo";
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-personal-books',
  templateUrl: './personal-books.component.html',
  styleUrls: ['./personal-books.component.scss']
})
export class PersonalBooksComponent implements OnInit {
    @ViewChild(MatTabGroup) group!: any;
    @ViewChildren(MatTab) tabs!: any;

    public myBooks!: BookInfo[];
    public wishlist!: BookInfo[];

    public tab_num: number = 0;
    public selectedIndex: number = 0;

    constructor(
        private router: Router,
        private user: UserService,
        private zone: NgZone) {}

    ngOnInit(): void {
        this.init();
    }
    
    // ionViewWillEnter() {
    //     this.init();
    // }

    private init(): void {        
        this.user.fetchCollection().subscribe({
            next: (collection) => {
                if(!collection) return;
                this.zone.run(() => {
                    this.myBooks = collection.purchased;
                    this.wishlist = collection.wishlist;
                    console.debug("fetched collection", collection, this.myBooks, this.wishlist);
                });
            },

            error: (err) => console.error("Error fetching collection:", err),
        });
    }

    public openShop() {
        this.router.navigate([`books/store`]);
    }

    public openSearch() {
        this.router.navigate(['/searchpage']);
    }
}
