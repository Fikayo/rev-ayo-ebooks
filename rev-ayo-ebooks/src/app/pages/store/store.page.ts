import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { BookInfo, BookStore, BookstoreGroup } from "src/app/models/BookInfo";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TransitionService } from 'src/app/services/transition/transition.service';

@Component({
  selector: 'ebook-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss']
})
export class StorePage implements OnInit, OnDestroy {

    public bookGroupings: BookstoreGroup[] = [];
    public otherBooks: BookInfo[] = [];
    
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private transtion: TransitionService,
        private zone: NgZone,
        private bookstore: BookstoreService) {
        }

    ngOnInit(): void {
        console.log("store init");

        this.bookstore.fetchAllBooks()
        .catch(err => console.error("Error fetching booksore in store init", err));

        this.bookstore.bookstore
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (store: BookStore) => {
                this.zone.run(() => {   
                    console.log("fetched: ", store);

                    const groups = store.groups;
                    if (groups && groups.length > 0) {
                        this.bookGroupings = groups.splice(0, groups.length - 1)
                        this.otherBooks = groups[groups.length - 1].books;
                    }
                })
            },

            error: (err) => console.error("failed to subscribe to bookstore:", err),
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();        
    }

    public openSearch() {
        this.transtion.fade('/searchpage', {duration: 200});
    }
}
