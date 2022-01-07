import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { BookInfo, BookStore } from "src/app/models/BookInfo";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TransitionService } from 'src/app/services/transition/transition.service';

@Component({
  selector: 'ebook-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss']
})
export class StorePage implements OnInit, OnDestroy {

    public popularBooks: BookInfo[] = [];
    public featuredBooks: BookInfo[] = [];
    public otherBooks: BookInfo[] = [];
    public searching: boolean = false;
    public filter!: string;
    public searchResults: BookInfo[] = [];
    
    private allBooks: BookInfo[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private transtion: TransitionService,        
        private activatedRoute: ActivatedRoute,
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
                    this.allBooks = store.books; 
                    console.log("fetched: ", this.allBooks);

                    this.popularBooks = this.allBooks;
                    this.featuredBooks = this.allBooks;
                    this.otherBooks = this.allBooks;
                })
            },

            error: (err) => console.error("failed to subscribe to bookstore:", err),
        });

        // this.activatedRoute.queryParams.subscribe(param => {
        //     this.filterList(param['filter']);
        // });

    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();        
    }

    get showFeatures(): boolean {
        return !this.searching;
    }

    get noResults(): boolean {
        return this.searchResults.length == 0 && this.searching;
    }

    public openSearch() {
        this.transtion.fade('/searchpage', {duration: 200});
    }
}
