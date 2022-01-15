import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { BookInfo, BookStore } from "src/app/models/BookInfo";
import { UserService } from 'src/app/services/user/user.service';
import { emptyUser, User } from 'src/app/models/User';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { StoreService } from 'src/app/services/store/store.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.page.html',
  styleUrls: ['./book-details.page.scss']
})
export class BookDetailsPage implements OnInit, OnDestroy {

    public book!: BookInfo;
    public suggestions: BookInfo[] = [];
    public actionText!: string;  
    public bookInWishList!: boolean;
    public bookIsPurchased!: boolean;
    public orderInProgress = false;

    private _user: User = emptyUser();
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

            this.bookstore.bookstore
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (store: BookStore) => {
                    console.log("BOOKS UPDATED: ", store);
                    if(!store.byID || !store.byID.has(bookID)) return;

                    const book = store.byID.get(bookID) as BookInfo;                    
                    this.zone.run(() => {                 
                        this.book = book;
                        this.actionText = `Buy ${this.book.price}`;
                        this.suggestions = store.books;

                        if (this._user.collection) {
                            const bookPurchased = this._user.collection.purchased.filter((book: BookInfo) => book.ISBN == bookID).length > 0;
                            this.setPurchasedBook(bookPurchased);
                        }
                    });
                    
                },

                error: (err) => console.error("failed to subscribe to bookstore:", err),
            });
            
            this.user.user
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (u: User) => {
                    console.log("USER UPDATED: ", u);
                    this._user = u;
                    if(!u.collection) return;

                    const bookPurchased = u.collection.purchased.filter((book: BookInfo) => book.ISBN == bookID).length > 0;
                    const bookWishful = u.collection.wishlist.filter((book: BookInfo) => book.ISBN == bookID).length > 0;
                    this.zone.run(() => {    
                        this.orderInProgress = false;   
                        console.log("setting order in progress to: ", this.orderInProgress);
                        this.setPurchasedBook(bookPurchased);
                        this.bookInWishList = bookWishful;
                    });
                },
                error: (err) => console.error(`failed to subscribe to user`, err)
            });
        });
    }

    ionViewDidEnter() {
        this.user.fetchCollection()
        .catch(err => console.error("Error fetching collection", err))
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
        .then((success: boolean) => {
            if(!success) return;              
            if(!this._user.collection) return;

            const bookWishful = this._user.collection.wishlist.filter((book: BookInfo) => book.ISBN == bookID).length > 0;
            console.info("book toggled in wishlist: ", bookWishful);
            this.zone.run(async () => {                
                let message = "Added to Wishlist";
                if (!bookWishful) message = "Remove from Wishlist";
                this.showToast(message);
            });
        })
        .catch((error) => {
            this.zone.run(async () => {
                console.error("failed to toggle wishlist", error);
                this.showToast("Unfortunately, an error occured. Please try again");               
            });
        })
    }

    private setPurchasedBook(purchased: boolean) {
        if (!this.book) return;
        
        setTimeout(() => { 
            this.orderInProgress = false;
            console.log(`${this.book.title} purchased: ${purchased}`);
            this.bookIsPurchased = purchased;
            if(this.bookIsPurchased) {
                this.actionText = "Read";
            } else {                                    
                this.actionText = `Buy ${this.book.price}`;
            }
        },0) 
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
