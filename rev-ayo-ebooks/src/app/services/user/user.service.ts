import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Books, EbooksSQL, Purchased, SQLQuery, Transaction, User, Wishlist,  } from 'src/app/models/WebSQLConnection';
import { ParseBookDb } from 'src/app/util';
import { BookstoreService } from '../bookstore/bookstore.service';
import { BookInfo } from "../../models/BookInfo";
import { UserCollection } from '../../models/UserCollection';
import { DatabaseService } from '../database/database.service';
import { ApiService } from '../api/api.service';

const TESTEMAIL = "test@email.com"

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private id!: string;

    constructor(
        private api: ApiService,
        private db: DatabaseService) { 
        this.loginUser(TESTEMAIL).subscribe({
            next: (id) => {
                this.id = id;
                console.log("userID", this.userID);
            },
            error: () => console.error("Failed to fetch user ID from server")
        });
    }

    private get userID(): string {
        return this.id;
    }

    public fetchMyBooks(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();
        const refreshRequired = this.db.expired;
        
        let results: Promise<any>;
        if (refreshRequired) {
            results = this.refreshCollection();   
        } else {
            results = this.db.fetch(`${Purchased} p JOIN ${Books} b ON b.BookId = p.BookId`);
        }

        results
        .then((res: any) => {
            const books: BookInfo[] = [];
            if (res) {

                let purchasedResp = res;
                if(refreshRequired) {
                    purchasedResp = res.purchased;
                }

                purchasedResp.forEach((book: any) => {
                    books.push(ParseBookDb(book));
                });
            }

            sub.next(books)
        })
        .catch(error => {
            console.error("Error fetching purchased books", error)
            sub.error(error);
        })

        return sub.asObservable();
    }

    /**
     * Also removes from wishlist
     * @param bookID 
     * @returns 
     */
    public addToMyBooks(bookID: string): Observable<void> {
        const sub = new Subject<void>();
        sub.next();
        return sub.asObservable();
    }

    public fetchWishlist(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();
        const refreshRequired = this.db.expired;
        
        let results: Promise<any>;
        if (refreshRequired) {
            results = this.refreshCollection();   
        } else {
            results = this.db.fetch(`${Wishlist} p JOIN ${Books} b ON b.BookId = p.BookId`);
        }

        results
        .then((res: any) => {
            const books: BookInfo[] = [];
            if (res) {

                let wishlistResp = res;
                if(refreshRequired) {
                    wishlistResp = res.wishlist;
                }

                wishlistResp.forEach((book: any) => {
                    books.push(ParseBookDb(book));
                });
            }

            sub.next(books)
        })
        .catch(error => {
            console.error("Error fetching wishlist books", error)
            sub.error(error);
        })

        return sub.asObservable();
    }

    public toggleInWishList(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        sub.next(true);
        return sub.asObservable();
    }


    public fetchBookCurrentPage(bookID: string): Observable<number> {
        const sub = new Subject<number>();
        this.api.get(`/user/${this.userID}/progress/${bookID}`)
        .then((res: any) => {
            let page: number | undefined;
            if (res.data) {
                page = res.data.Page as number;
            }
            
            sub.next(page);
        })
        .catch(error => {
            console.error(`Error fetching current page for book ${bookID}`, error);
            sub.error(error);
        });

        return sub.asObservable();
    }

    public updateBookProgress(bookID: string, currentPage: number): Observable<number> {
        let sub = new Subject<number>();
        this.api.post(`/user/${this.userID}/progress/${bookID}`, {
            userId: this.userID,
            bookID: bookID,
            page: currentPage
        })
        .then((res: any) => {;
            if (res.data.page != currentPage) {
                let msg = `Unexpected result after updating page in ${bookID} to ${currentPage}`;
                console.error(msg);
                sub.error(msg);;
                return;
            }

            sub.next(currentPage);
        })
        .catch(error => {
            console.error(`error updating book page in ${bookID} to ${currentPage}`);
            sub.next(error);
        });
       
        return sub.asObservable();
    }

    public loginUser(email: string): Observable<string> {
        const sub = new Subject<string>();

        this.api.post(`/user/login`, {
            email: email
        })
        .then(async (res: any) => {
            if (res.status != 200) {
                sub.error(res.data);
            }

            let userID: string | undefined;
            if (res.data) {
                userID = res.data.UserId;
                await this.db.insert(User, {UserId: userID});
            }

            sub.next(userID);
        })
        .catch(error => {
            console.error(`error fetching userID for email ${email}`, error);
            sub.next(error);
        });

        return sub.asObservable();
    }

    private async refreshCollection(): Promise<UserCollection> {
        return new Promise((resolve, reject) => {
            this.api.get(`/user/${this.userID}/collection`)
            .then(async (res: any) => {
                const purchased: BookInfo[] = [];
                const wishlist: BookInfo[] = [];
                if (res.data) {
                    const promises: Promise<void>[] = [];
                    if (res.data.purchased) {
                        res.data.purchased.forEach((book: any) => {
                            purchased.push(ParseBookDb(book));
                            promises.push(this.db.update(Purchased, {
                                BookId: book.BookId
                            }));
                        });
                    }

                    if (res.data.wishlist) {
                        res.data.wishlist.forEach((book: any) => {
                            wishlist.push(ParseBookDb(book));
                            promises.push(this.db.update(Wishlist, {
                                BookId: book.BookId
                            }));
                        });
                    }

                    await Promise.all(promises);
                }

                this.db.updateLastUpdateTime();
                resolve({
                    purchased: purchased,
                    wishlist: wishlist,
                });
            })
            .catch(error => {
                console.error("Error fetching user collection", error)
                reject(error);
            })
        });  
    }
}
