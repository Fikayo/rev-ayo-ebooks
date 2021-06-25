import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookstoreService, BookTitle } from 'src/app/services/bookstore/bookstore.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss']
})
export class BookDetailsComponent implements OnInit {
    
    public book!: BookTitle;
    public suggestions: BookTitle[] = [];
    public actionText: string = "Read";  
    private routeSub!: Subscription;

    public bookInWishList: boolean = false;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService,
        private user: UserService,
        private snackbar: MatSnackBar) {
    }

    ngOnInit(): void {
        this.routeSub = this.activatedRoute.params.subscribe(params => {
            let bookID = params['isbn'];

            this.bookstore.fetchDetails(bookID)
            .subscribe({
                next: (b) => {
                    this.book = b;
                    this.actionText = `Buy ${this.book.price}`;
                    this.user.hasBookInWishList(this.book.ISBN).subscribe({
                        next: (i) => this.bookInWishList = i,
                    })
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

    public onActionClick(book: BookTitle) {
        this.router.navigate([`/read/${book.ISBN}/`]);
    }

    public toggleBookInList() {
        this.user.toggleInWishList(this.book.ISBN).subscribe({
            next: (inList) => {
                console.log("toggled in list: ", inList);
                let message = "Added to Wishlist";
                if (!inList) message = "Remove from Wishlist";
                this.snackbar.open(message, 'Dismiss', {
                    duration: 2000
                });

                this.bookInWishList = inList;
            },

            error: () => console.error("failed to toggle in wishlist"),
        });
    }
}
