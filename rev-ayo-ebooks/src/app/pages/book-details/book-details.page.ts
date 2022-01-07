import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaymentModal } from 'src/app/components/payment-modal/payment-modal.component';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { BookInfo } from "src/app/models/BookInfo";
import { UserService } from 'src/app/services/user/user.service';
import { UserCollection } from 'src/app/models/User';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { StoreService } from 'src/app/services/store/store.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.page.html',
  styleUrls: ['./book-details.page.scss']
})
export class BookDetailsPage implements OnInit {
    
    public book!: BookInfo;
    public suggestions: BookInfo[] = [];
    public actionText!: string;  
    public bookInWishList!: boolean;
    public bookIsPurchased!: boolean;
    public orderInProgress = false;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private transition: TransitionService,
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService,
        private user: UserService,
        private toastCtrl: ToastController,
        private store: StoreService,
        private zone: NgZone) {
    }

    ngOnInit(): void {
        console.log("in book details")
        this.activatedRoute.params
        .pipe(takeUntil(this.destroy$))
        .subscribe((params) => {
            let bookID = params['isbn'];

            this.bookstore.fetchBook(bookID)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (book) => {
                    console.log("returned book detail", book);
                    if(!book) return;
                    this.zone.run(() => {                 
                        this.book = book as BookInfo;
                        this.actionText = `Buy ${this.book.price}`
                    });
                },
                error: (err) => console.error(`failed to fetch book {${bookID}} from bookstore`, err)
            });
            
            this.user.fetchCollection()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (collection: UserCollection) => {
                    console.info("col", collection);
                    if(!collection) return;
                    const bookPurchased = collection.purchased.filter((book: BookInfo) => book.ISBN == bookID).length > 0;
                    const bookWishful = collection.wishlist.filter((book: BookInfo) => book.ISBN == bookID).length > 0;
                    this.zone.run(() => {                            
                        this.setPurchasedBook(bookPurchased);
                        this.bookInWishList = bookWishful;
                    });
                },

                error: (err) => console.error("Error fetching collection:", err),
            });

            this.bookstore.fetchAllBooks()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (books: BookInfo[]) => {
                    console.info("all all books", books);
                    if(!books) return;
                    this.zone.run(() => {                 
                        this.suggestions = books;
                    });
                },
                error: (err) => console.error("failed to fetch titles from bookstore:", err),
            });            
        });
    }

    ngOnDestroy(): void {   
        console.log("book details destroyed");
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    public openSearch() {
        this.transition.flip('/searchpage', {duration: 100, direction: 'left'});
    }

    public async onActionClick() {
        if (this.bookIsPurchased) {
            console.log("reading");
            this.transition.curl(`../../read/${this.book.ISBN}/`, undefined, {relativeTo: this.activatedRoute});
            return;
        } 

        this.buyBook();       
    }

    public toggleBookInList() {
        const bookID = this.book.ISBN;
        this.user.toggleInWishList(this.book.ISBN)        
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (success) => {
                if(!success) return;
                
                this.zone.run(async () => {
                    this.bookInWishList = this.user.inWishlist(bookID);
                    console.info("book toggled in wishlist: ", this.bookInWishList);
                    
                    let message = "Added to Wishlist";
                    if (!this.bookInWishList) message = "Remove from Wishlist";
                    this.showToast(message);
                });
            },

            error: () => {
                this.zone.run(async () => {
                    console.error("failed to toggle wishlist");
                    this.showToast("Unfortunately, an error occured. Please try again");               
                });
            },
        });
    }

    private setPurchasedBook(purchased: boolean) {
        if (!this.book) return;
        
        this.orderInProgress = false;
        console.log(`${this.book.title} purchased: ${purchased}`);
        this.bookIsPurchased = purchased;
        if(this.bookIsPurchased) {
            this.actionText = "Read";
        } else {                                    
            this.actionText = `Buy ${this.book.price}`;
        }
    }

    private async buyBook() {
        if (!this.book) return;

		console.log("Ordering book", this.book);
		this.store.orderBook(this.book.ISBN)
        .then(_ => {
			// Show spinner till book is acquired
            this.orderInProgress = true;
		})
		.catch(error => {
			console.error(`Failed to order book '${this.book.ISBN}'`, error);
			this.showToast("An unexpected error occured. Please try again.");
		});

	}
    
	private async showToast(message: string) {
		console.info("showing toast message: " + message);
		const toast = await this.toastCtrl.create({
			message: message,
			duration: 3000
		});
		
		toast.present();
	}
}
