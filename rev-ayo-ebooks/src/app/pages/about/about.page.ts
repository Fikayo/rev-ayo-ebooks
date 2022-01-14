import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookInfo, BookStore } from 'src/app/models/BookInfo';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'ebook-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss']
})
export class AboutPage implements OnInit, OnDestroy {

    public book!: BookInfo;
    public aboutBook!: string;
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService) { }

    ngOnInit(): void {
        this.activatedRoute.params
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
            let bookID = params['isbn'];
            this.bookstore.bookstore
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (store: BookStore) => {
                    if(!store.byID || !store.byID.has(bookID)) return;
                    const book = store.byID.get(bookID) as BookInfo;

                    this.book = book;
                    this.aboutBook = book.aboutBook.replace(/\n/g, "<br/>");
                },

                error: (err) => console.error("failed to subscribe to bookstore:", err),
            });
        });
    }

    
    ngOnDestroy(): void {   
        console.log("about book destroyed");
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

}
