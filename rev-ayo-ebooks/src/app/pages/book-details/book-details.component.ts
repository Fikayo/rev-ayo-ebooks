import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookstoreService, BookTitle } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss']
})
export class BookDetailsComponent implements OnInit {
    
    public book!: BookTitle;
    public suggestions: BookTitle[] = [];
    public selectBookBounded = this.selectBook.bind(this);  
    public actionText: string = "Read";  
    private routeSub!: Subscription;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService) {
    }

    ngOnInit(): void {
        this.routeSub = this.activatedRoute.params.subscribe(params => {
            let bookID = params['isbn'];

            this.bookstore.fetchDetails(bookID)
            .subscribe({
                next: (b) => {
                    this.book = b;
                    this.actionText = `Buy for ${this.book.price}`;
                },
                error: () => console.log("failed to fetch book from bookstore")
            });

            this.bookstore.fetchTitles().subscribe({    
                complete: () => {console.log("complete")}, 
                next: (b) => {
                    this.suggestions = b;
                },
                error: () => console.log("failed to fetch titles from bookstore")
            }); 
        });
    }

    ngOnDestroy(): void {            
        if(this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }

    public selectBook(book: BookTitle) {
        this.router.navigate([`/details/${book.ISBN}/`]);
    }

    public onActionClick(book: BookTitle) {
        this.router.navigate([`/read/${book.ISBN}/`]);
    }
}
