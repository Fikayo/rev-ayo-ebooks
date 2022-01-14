import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
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

    ionViewDidEnter() {  
        this.bookstore.fetchAllBooks()
        .catch(err => console.error("Error fetching booksore in store init", err));
    }

    public openSearch() {
        this.transtion.fade('/searchpage', {duration: 200});
    }

    public doRefresh(event: any) {
        console.debug("refreshing store page");
        this.otherBooks = [];
        this.bookGroupings = [];
        this.bookstore.fetchAllBooks(true)
        .then(_ => {
            event.target.complete();            
            console.debug("done refreshing store");
        })
        .catch(err => {
            event.target.complete();
            console.error("An error occured while refreshing store page", err);
        });
    }
}
