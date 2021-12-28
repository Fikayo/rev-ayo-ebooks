import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BottomMenuComponent } from 'src/app/components/bottom-menu/bottom-menu.component';
import { PaymentModal } from 'src/app/components/payment-modal/payment-modal.component';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { BookInfo } from "src/app/models/BookInfo";
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss']
})
export class BookDetailsComponent implements OnInit {
    
    public book!: BookInfo;
    public suggestions: BookInfo[] = [];
    public actionText!: string;  
    public bookInWishList!: boolean;
    public bookIsPurchased!: boolean;

    private routeSub!: Subscription;


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
        this.routeSub = this.activatedRoute.params.subscribe(params => {
            let bookID = params['isbn'];

            this.bookstore.fetchBook(bookID)
            .subscribe({
                next: (b: BookInfo) => {
                    this.zone.run(() => {                 
                        this.book = b;
                    });

                    // this.user.hasPurchasedBook(this.book.ISBN).subscribe({
                    //     next: (i) => {
                    //         this.zone.run(() => {
                    //             if (this.book.ISBN == "unknown") {
                    //                 i = true;
                    //             }
                                
                    //             this.setPurchasedBook(i);
                    //         });
                    //     },
                    // })

                    // this.user.hasBookInWishList(this.book.ISBN).subscribe({
                    //     next: (i) => {
                    //         this.zone.run(() => {
                    //             this.bookInWishList = i; console.log("book in wishlist", this.book.title, this.bookInWishList, i)
                    //         });
                    //     },
                    // });
                },
                error: () => console.log("failed to fetch book from bookstore")
            });

            this.bookstore.fetchAllBooks().subscribe({    
                complete: () => {console.log("complete")}, 
                next: (b) => {
                    this.zone.run(() => {                 
                        this.suggestions = b;
                    });
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

            presentModal.onWillDismiss().then((data) => {
                console.log("dismiss data", data);
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
        this.user.toggleInWishList(this.book.ISBN).subscribe({
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
        console.log(`${this.book.title} purchased: ${purchased}`);
        this.bookIsPurchased = purchased;
        if(this.bookIsPurchased) {
            this.actionText = "Read";
        } else {                                    
            this.actionText = `Buy ${this.book.price}`;
        }
    }
}
