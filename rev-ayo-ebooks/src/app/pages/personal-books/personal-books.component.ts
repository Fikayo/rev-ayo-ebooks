import { Component, OnInit, ViewChild, ViewChildren, NgZone } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { BookTitle } from 'src/app/services/bookstore/bookstore.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-personal-books',
  templateUrl: './personal-books.component.html',
  styleUrls: ['./personal-books.component.scss']
})
export class PersonalBooksComponent implements OnInit {
    @ViewChild(MatTabGroup) group!: any;
    @ViewChildren(MatTab) tabs!: any;

    public myBooks!: BookTitle[];
    public wishlist!: BookTitle[];

    public tab_num: number = 0;
    public selectedIndex: number = 0;

    constructor(
        private router: Router,
        private user: UserService,
        private zone: NgZone) { }

    ngOnInit(): void {
        this.user.fetchMyBooks().subscribe({
            next: (b) => {
                this.zone.run(() => {
                    this.myBooks = b;
                    console.debug("fetched my books", b);
                });
            },
            error: () => console.error("Failed to fetch my books!")
        });

        this.user.fetchWishlist().subscribe({
            next: (b) => {
                this.zone.run(() => {
                    this.wishlist = b;
                    console.debug("fetched wishlist", b);
                });
            },
            error: () => console.error("Failed to fetch wishlist!")
        });
    }

    public openShop() {
        this.router.navigate([`books/store`]);
    }

    public openSearch() {
        this.router.navigate(['/searchpage']);
    }
}
