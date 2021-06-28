import { Component, NgZone, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaymentBottomSheetComponent } from 'src/app/components/payment-bottom-sheet/payment-bottom-sheet.component';
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
    public actionText!: string;  
    public bookInWishList!: boolean;

    private bookIsPurchased!: boolean;
    private routeSub!: Subscription;


    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService,
        private user: UserService,
        private snackbar: MatSnackBar,
        private bottomSheet: MatBottomSheet,
        private zone: NgZone) {
    }

    ngOnInit(): void {
        this.routeSub = this.activatedRoute.params.subscribe(params => {
            let bookID = params['isbn'];

            this.bookstore.fetchDetails(bookID)
            .subscribe({
                next: (b) => {
                    this.book = b;

                    this.user.hasPurchasedBook(this.book.ISBN).subscribe({
                        next: (i) => {
                            this.zone.run(() => {
                                this.bookIsPurchased = i;
                                if(this.bookIsPurchased) {
                                    this.actionText = "Read";
                                } else {                                    
                                    this.actionText = `Buy ${this.book.price}`;
                                }
                            });
                        },
                    })

                    this.user.hasBookInWishList(this.book.ISBN).subscribe({
                        next: (i) => {
                            this.zone.run(() => {
                                this.bookInWishList = i; console.log("book in wishlist", this.book.title, this.bookInWishList, i)
                            });
                        },
                    });
                },
                error: () => console.log("failed to fetch book from bookstore")
            });

            this.bookstore.fetchAllTitles().subscribe({    
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
        if (this.bookIsPurchased) {
            console.log("reading");
            this.router.navigate([`/read/${book.ISBN}/`]);
        } else {
            console.log("opening sheet");
            this.bottomSheet.open(PaymentBottomSheetComponent);
        }
    }

    public toggleBookInList() {
        this.user.toggleInWishList(this.book.ISBN).subscribe({
            next: (inList) => {
                
                this.zone.run(() => {
                    console.log("toggled in list: ", inList);
                    let message = "Added to Wishlist";
                    if (!inList) message = "Remove from Wishlist";
                    this.snackbar.open(message, 'Dismiss', {
                        duration: 1500,
                    });
                    
                    this.bookInWishList = inList;
                });
            },

            error: () => {
                this.zone.run(() => {
                    console.error("failed to toggle in wishlist");
                    this.snackbar.open("Unfortunately, an error occured. Please try again", 'Dismiss', {
                        duration: 2000,
                    });                    
                });
            },
        });
    }
}
