import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BooksTable, PurchasedTable, UserTable , WishlistTable,  } from 'src/app/models/WebSQLConnection';
import { ParseBookDb } from 'src/app/util';
import { BookInfo } from "../../models/BookInfo";
import { User, UserCollection } from '../../models/User';
import { DatabaseService } from '../database/database.service';
import { ApiService } from '../api/api.service';

const TESTEMAIL = "test@email.com"

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private user: User = {};

    constructor(
        private api: ApiService,
        private db: DatabaseService) {

            this.loginIfloggedOut()
            .then(id => {
                if (!id) {
                    this.loginUser(TESTEMAIL)
                    .then(id => this.user.userID = id);
                }

                this.user.userID = id;
            })
            .catch(error => {
                console.error(`Error logging in`, error);
            });
    }

    public get isLoggedIn(): boolean {
        if(this.user.userID) return true;
        return false;
    }

    /**
     * Also removes from wishlist
     * @param bookID 
     * @returns 
     */
    public purchaseBook(bookID: string): Observable<void> {
        const sub = new Subject<void>();
        this.api.post(`/user/${this.user.userID}/buy?bookId=${bookID}`, {})
        .then(_ => {
            sub.next();
        })
        .catch(error => {
            console.error(`Error buying book ${bookID}`, error);
            sub.error(error);
        });

        return sub.asObservable();
    }


    public toggleInWishList(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        sub.next(true);
        return sub.asObservable();
    }


    public fetchBookCurrentPage(bookID: string): Observable<number> {
        const sub = new Subject<number>();
        this.api.get(`/user/${this.user.userID}/progress/${bookID}`)
        .then((res: any) => {
            let page: number = 1;
            if (res) {
                page = res.Page as number;
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
        this.api.post(`/user/${this.user.userID}/progress/${bookID}`, {
            userId: this.user.userID,
            bookID: bookID,
            page: currentPage
        })
        .then((res: any) => {;
            if (res.page != currentPage) {
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
    
    public fetchCollection(): Observable<UserCollection> {
        const sub = new Subject<UserCollection>();
        const refreshRequired = this.db.expired(WishlistTable);
        
        if (refreshRequired) {
            this.refreshCollection()
            .then(res => sub.next(res))
            .catch(error => {
                console.error("Error fetching user collection books:", error)
                sub.error(error);
            });

            return sub.asObservable();
        } 
        

        if(this.user.collection) {
            sub.next(this.user.collection);
            return sub.asObservable();
        }

        const purchProm = this.db.fetch(`${PurchasedTable} p JOIN ${BooksTable} b ON b.BookId = p.BookId`)      
        const wishProm = this.db.fetch(`${WishlistTable} p JOIN ${BooksTable} b ON b.BookId = p.BookId`)      
        
        Promise.all([purchProm, wishProm])
        .then(collection => {
            const purchased: BookInfo[] = [];
            const wishlist: BookInfo[] = [];
            if (collection[0]) {
                collection[0].forEach((book: any) => {
                    purchased.push(ParseBookDb(book));
                });
            }

            if (collection[1]) {
                collection[1].forEach((book: any) => {
                    wishlist.push(ParseBookDb(book));
                });
            }

            sub.next({purchased: purchased, wishlist: wishlist});
        })
        .catch(err => {
            console.error("Error fetching collecton from db", err);
            sub.error(err);
        });

        return sub.asObservable();
    }

    public async loginUser(email: string): Promise<string> {
        const res = await this.api.post(`/user/login`, {
            email: email
        });

        let userID: string = '';
        try {
            console.debug("loginUser data", res);
            if (res) {
                userID = res.UserId;
                await this.db.insert(UserTable, {UserId: userID});
            }

            this.user.userID = userID;
            return userID;
        } catch (error: any) {
            console.log("Error from login", error);
            if (error.code && error.code === 6) {
                // Unique constraint. Id already in DB - return the userID
                return userID;
            }

            return Promise.reject(error);
        }
    }

    private async refreshCollection(): Promise<UserCollection> {
        if(!this.user.userID) {
            return {purchased: [], wishlist: []};
        }

        return new Promise((resolve, reject) => {
            console.log("my user id is", this.user.userID);
            this.api.get(`/user/${this.user.userID}/collection`)
            .then(async (res: any) => {
                console.info("refreshed collection", res);
                const purchased: BookInfo[] = [];
                const wishlist: BookInfo[] = [];
                if (res) {
                    const promises: Promise<void>[] = [];
                    await this.db.delete(PurchasedTable);
                    await this.db.delete(WishlistTable);
                    if (res.purchased) {
                        res.purchased.forEach((book: any) => {
                            purchased.push(ParseBookDb(book));
                            promises.push(this.db.insert(PurchasedTable, {
                                BookId: book.BookId
                            }));
                        });
                    }

                    if (res.wishlist) {
                        res.wishlist.forEach((book: any) => {
                            wishlist.push(ParseBookDb(book));
                            promises.push(this.db.insert(WishlistTable, {
                                BookId: book.BookId
                            }));
                        });
                    }

                    console.log("new purch and wish", purchased, wishlist);
                    await Promise.all(promises);
                }

                this.db.updateLastUpdateTime(PurchasedTable);
                this.db.updateLastUpdateTime(WishlistTable);
                const collection = {
                    purchased: purchased,
                    wishlist: wishlist,
                };

                this.user.collection = collection;
                resolve(collection);
            })
            .catch(error => {
                console.error("Error fetching user collection:", error)
                reject(error);
            })
        });  
    }

    private async loginIfloggedOut(): Promise<string> {
        const sub = new Subject<string>();
        const res = await this.db.fetch(UserTable);
        console.debug("TEST loginUser data", res);
        if (res) {
            return res[0].UserId;
        }

        return '';
    }
}
