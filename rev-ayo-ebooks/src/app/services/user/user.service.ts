import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { BooksTable, PurchasedTable, UserTable , WishlistTable,  } from 'src/app/models/WebSQLConnection';
import { BookInfo, BookInfoBe, ParseBookDb } from "../../models/BookInfo";
import { User, UserCollection } from '../../models/User';
import { DatabaseService } from '../database/database.service';
import { ApiService } from '../api/api.service';

const TESTEMAIL = "test@email.com"

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private readonly user: User;

    constructor(
        private api: ApiService,
        private db: DatabaseService) {
            this.user = {userID: '', region: ''};
    }

    public get region(): string {
        return this.user.region;
    }
    
    public inWishlist(bookID: string): boolean {
        if(this.user.collection) {
            const found = this.user.collection.wishlist.find(b => b.ISBN == bookID);
            if(found) {
                return true;
            }
        }

        return false;
    }
    public isLoggedIn(): Observable<boolean> {
        const sub = new Subject<boolean>();

        if(this.user.userID) {
            sub.next(true);
            return sub.asObservable();
        }

        this.loginIfloggedOut()
        .then(user => {
            if (!user || !user.userID) {                    
                console.log("user not logged in");
                // this.loginUser(TESTEMAIL)
                // .then(id => this.user.userID = id);
                sub.next(false);
                return;
            }

            console.log("user logged in");
            this.user.userID = user.userID;
            this.user.region = user.region;
            sub.next(true);
        })
        .catch(error => {
            console.error(`Error logging in`, error);
            sub.error(error);
        });

        return sub.asObservable();
    }

    /**
     * Also removes from wishlist
     * @param bookID 
     * @returns 
     */
    public purchaseBook(bookID: string): Observable<void> {
        const sub = new Subject<void>();
        if(!this.user.userID) {
            return throwError("User not logged in. Aborting call");
        }

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
        if(!this.user.userID) {
            return throwError("User not logged in. Aborting call");
        }

        if (!this.user.collection) {
            return throwError("User has no collection");
        }

        const found = this.user.collection.wishlist.find(b => b.ISBN == bookID);
        if(found) {
            return this.removeFromWishList(bookID);
        }

        return this.addToWishList(bookID);
    }

    private addToWishList(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        this.api.post(`/user/${this.user.userID}/wishlist/add`, {
            wishlist: [bookID]
        })
        .then(async _ => {
            const bookProm = this.db.fetch(BooksTable, {BookId: bookID});
            const insertProm = this.db.insert(WishlistTable, {BookId: bookID});
            const results = await Promise.all([bookProm, insertProm]);
            const book = results[0][0] as BookInfoBe;
            this.user.collection?.wishlist.push(this.parseBook(book));
            sub.next(true);
        })
        .catch(error => {
            console.error(`Error adding book to wishlist ${bookID}`, error);
            sub.error(error);
        });

        return sub.asObservable();
    }
    
    private removeFromWishList(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        this.api.post(`/user/${this.user.userID}/wishlist/delete`, {
            wishlist: [bookID]
        })
        .then(async _ => {
            await this.db.delete(WishlistTable, {BookId: bookID});
            if (!this.user.collection) {
                sub.next(true);
                return;
            }

            let idx = 0;            
            for (const b of this.user.collection.wishlist) {                
                if(b.ISBN == bookID) {
                    break; 
                }

                idx++;
            }

            this.user.collection.wishlist.splice(idx, 1);
            sub.next(true);
        })
        .catch(error => {
            console.error(`Error removing book to wishlist ${bookID}`, error);
            sub.error(error);
        });

        return sub.asObservable();
    }


    public fetchBookCurrentPage(bookID: string): Observable<number> {
        const sub = new Subject<number>();
        if(!this.user.userID) {
            return throwError("User not logged in. Aborting call");
        }

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

    public async updateBookProgress(bookID: string, currentPage: number): Promise<number> {
        try {
            if(!this.user.userID) {
                return Promise.reject("User not logged in. Aborting call");
            }

            const res = await this.api.post(`/user/${this.user.userID}/progress/${bookID}`, {
                userId: this.user.userID,
                bookID: bookID,
                page: currentPage
            })

            if (res.page != currentPage) {
                let msg = `Unexpected result after updating page in ${bookID} to ${currentPage}`;
                console.error(msg);
            }
        } catch(error) {
            console.error(`error updating book page in ${bookID} to ${currentPage}`);
        }
            
        return currentPage;
    }
    
    public fetchCollection(): Observable<UserCollection> {
        const sub = new Subject<UserCollection>();
        if(!this.user.userID) {
            return of();
        }

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
            console.debug("Fetchiing cached collection");
            return of(this.user.collection);
        }

        console.debug("Fetchiing collection from DB");
        const purchProm = this.db.fetch(`${PurchasedTable} p JOIN ${BooksTable} b ON b.BookId = p.BookId`)      
        const wishProm = this.db.fetch(`${WishlistTable} p JOIN ${BooksTable} b ON b.BookId = p.BookId`)      
        
        Promise.all([purchProm, wishProm])
        .then(collection => {
            const purchased: BookInfo[] = [];
            const wishlist: BookInfo[] = [];
            if (collection[0]) {
                collection[0].forEach((book: BookInfoBe) => {
                    purchased.push(this.parseBook(book));
                });
            }

            if (collection[1]) {
                collection[1].forEach((book: BookInfoBe) => {
                    wishlist.push(this.parseBook(book));
                });
            }

            const userCol: UserCollection = {purchased: purchased, wishlist: wishlist};
            this.user.collection = userCol;
            sub.next(userCol);
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
        let region: string = '';
        try {
            console.debug("loginUser data", res);
            if (res) {
                userID = res.UserId;
                region = res.Region;
                await this.db.insert(UserTable, {UserId: userID, Region: region});
            }

            this.user.userID = userID;
            this.user.region = region;
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

    public async registerUser(email: string, region: string): Promise<string> {
        const res = await this.api.post(`/user/register`, {
            email: email,
            region: region
        });

        let userID: string = '';
        try {
            console.debug("registerUser data", res);
            if (res) {

                if (res.Email != email) {
                    console.error(`Registered email don't match user input. got '${res.Email}', want ${email}`);
                    return Promise.reject("Rgistered email don't match");
                }

                userID = res.UserId;
                await this.db.insert(UserTable, {UserId: userID, Region: region});
            }

            this.user.userID = userID;
            this.user.region = region;
            return userID;
        } catch (error: any) {
            console.log("Error from register", error);
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
                        res.purchased.forEach((book: BookInfoBe) => {
                            purchased.push(this.parseBook(book));
                            promises.push(this.db.insert(PurchasedTable, {
                                BookId: book.BookId
                            }));
                        });
                    }

                    if (res.wishlist) {
                        res.wishlist.forEach((book: BookInfoBe) => {
                            wishlist.push(this.parseBook(book));
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

    private async loginIfloggedOut(): Promise<User> {
        const sub = new Subject<string>();
        const res = await this.db.fetch(UserTable);
        console.debug("trying to log in data", res);
        
        let user: User = {userID: '', region: ''};
        if (res) {
           user.userID = res[0].UserId;
           user.region = res[0].Region;
        }

        return user;
    }
    
    private parseBook(book: BookInfoBe): BookInfo {
        return ParseBookDb(book, this.user.region);
    }
}
