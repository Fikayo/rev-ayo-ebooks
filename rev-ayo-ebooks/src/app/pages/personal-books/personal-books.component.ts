import { Component, OnInit, ViewChild, ViewChildren, NgZone, OnDestroy } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { BookInfo } from "src/app/models/BookInfo";
import { UserService } from 'src/app/services/user/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ebook-personal-books',
  templateUrl: './personal-books.component.html',
  styleUrls: ['./personal-books.component.scss']
})
export class PersonalBooksPage implements OnInit, OnDestroy {
    @ViewChild(MatTabGroup) group!: any;
    @ViewChildren(MatTab) tabs!: any;

    public myBooks!: BookInfo[];
    public wishlist!: BookInfo[];

    public tab_num: number = 0;
    public selectedIndex: number = 0;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private router: Router,
        private user: UserService,
        private zone: NgZone) {}

    ngOnInit(): void {
        this.init();
    }
    
    ngOnDestroy(): void {   
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
    
    // ionViewWillEnter() {
    //     this.init();
    // }

    private init(): void {        
        this.user.fetchCollection()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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
