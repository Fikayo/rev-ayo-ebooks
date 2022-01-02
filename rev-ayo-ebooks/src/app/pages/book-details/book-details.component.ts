import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BottomMenuComponent } from 'src/app/components/bottom-menu/bottom-menu.component';
import { PaymentModal } from 'src/app/components/payment-modal/payment-modal.component';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { BookInfo } from "src/app/models/BookInfo";
import { UserService } from 'src/app/services/user/user.service';
import { UserCollection } from 'src/app/models/User';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss']
})
export class BookDetailsPage implements OnInit {
    
    public book!: BookInfo;
    public suggestions: BookInfo[] = [];
    public actionText!: string;  
    public bookInWishList!: boolean;
    public bookIsPurchased!: boolean;

    private destroy$: Subject<boolean> = new Subject<boolean>();


    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService,
        private user: UserService,
        private toastCtrl: ToastController,
        private modalCtrl: ModalController,
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
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    public openSearch() {
        this.router.navigate(['/searchpage']);
    }

    public async onActionClick(book: BookInfo) {
        if (this.bookIsPurchased) {
            console.log("reading");
            this.router.navigate([`../../read/${book.ISBN}/`], {relativeTo: this.activatedRoute});
        } else {
            console.log("opening sheet");
            const presentModal = await this.modalCtrl.create({
                component: PaymentModal,
                componentProps: {
                    book: this.book,
                },
                showBackdrop: true,
                cssClass: 'payment-modal'
            });

            presentModal.onWillDismiss().then((data: any) => {
                console.log("dismiss data", data);
                if(data.role == 'success') {
                    this.zone.run(() => {
                        this.setPurchasedBook(true);
                    });

                }
            });

            return await presentModal.present();

            // this.user.addToMyBooks(this.book.ISBN).subscribe({
            //     next: () => {
                    
            //         this.zone.run(() => {
            //             this.snackbar.open("Added to book list", 'Dismiss', {
            //                 duration: 1500,
            //             });
                        
            //             this.setPurchasedBook(true);
            //         });
            //     },
    
            //     error: () => {
            //         this.zone.run(() => {
            //             console.error("failed to buy book");
            //             this.snackbar.open("Unfortunately, an error occured. Please try again", 'Dismiss', {
            //                 duration: 2000,
            //             });                    
            //         });
            //     },
            // });
        }
    }

    public toggleBookInList() {
        this.user.toggleInWishList(this.book.ISBN)        
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (inList) => {
                
                this.zone.run(async () => {
                    this.bookInWishList = inList;
                    console.info("book toggled in wishlist: ", inList);
                    
                    let message = "Added to Wishlist";
                    if (!inList) message = "Remove from Wishlist";
                    const toast = await this.toastCtrl.create({
                        message: message,
                        duration: 1500
                    });
                    
                    toast.present();                    
                });
            },

            error: () => {
                this.zone.run(async () => {
                    console.error("failed to toggle wishlist");
                    const toast = await this.toastCtrl.create({
                        message: "Unfortunately, an error occured. Please try again",
                        duration: 2000
                    });

                    toast.present();                  
                });
            },
        });
    }

    private setPurchasedBook(purchased: boolean) {
        if (!this.book) return;
        
        console.log(`${this.book.title} purchased: ${purchased}`);
        this.bookIsPurchased = purchased;
        if(this.bookIsPurchased) {
            this.actionText = "Read";
        } else {                                    
            this.actionText = `Buy ${this.book.price}`;
        }
    }
}
