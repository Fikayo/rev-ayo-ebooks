import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { BooksTable, PurchasedTable, UserTable , WishlistTable,  } from 'src/app/models/WebSQLConnection';
import { BookInfo, BookInfoBe, ParseBookDb } from "../../models/BookInfo";
import { emptyCollection, emptyUser, User, UserCollection } from '../../models/User';
import { DatabaseService } from '../database/database.service';
import { ApiService } from '../api/api.service';

const ALLOW_FAKE_LOGIN = false
const TESTEMAIL = "test@email.com"

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private readonly _user: User;
    private readonly userSource: BehaviorSubject<User>;

    constructor(
        private api: ApiService,
        private db: DatabaseService) {
            this._user = emptyUser();
            this.userSource = new BehaviorSubject(this._user);

            this.loginIfloggedOut()
            .then(user => {
                if (!user || !user.userID) {                    
                    console.log("user not logged in");
                    
                    this.loginUser(TESTEMAIL)
                    .then(id => this._user.userID = id);
    
                    return;
                }
    
                console.log("user logged in");
                this._user.userID = user.userID;
                this._user.region = user.region;
                this.updateUser();
            })
            .catch(error => {
                console.error(`Error logging in`, error);
            });
    }


    public get user(): Observable<User> {
        return this.userSource.asObservable();
    }

    public async fetchCollection(): Promise<UserCollection> {
        if(!this._user.userID) {
            return emptyCollection();
        }

        const refreshRequired = this.db.expired(WishlistTable);
        
        if (refreshRequired) {
            try {
                const apiCol = await this.refreshCollection()
                this.updateUser();
                return apiCol;

            } catch(error) {
                console.error("Error fetching user collection books:", error)
                return Promise.reject(error);
            }
        }        

        if(this._user.collection) {
            console.debug("Fetchiing cached collection");
            this.updateUser();
            return this._user.collection;
        }

        try {
            console.debug("Fetchiing collection from DB");
            const purchProm = this.db.fetch(`${PurchasedTable} p JOIN ${BooksTable} b ON b.BookId = p.BookId`)      
            const wishProm = this.db.fetch(`${WishlistTable} p JOIN ${BooksTable} b ON b.BookId = p.BookId`)      
            
            const collection = await Promise.all([purchProm, wishProm])
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
            this._user.collection = userCol;
            this.updateUser();
            return userCol;
            
        } catch(err) {
            console.error("Error fetching collecton from db", err);
            return Promise.reject(err);
        }        
    }

    /**
     * Also removes from wishlist
     * @param bookID 
     * @returns 
     */
     public async purchaseBook(bookID: string): Promise<void> {
        if(!this._user.userID) {
            throw Error("User not logged in. Aborting call");
        }

        try {
            const p1 = this.api.post(`/user/${this._user.userID}/buy?bookId=${bookID}`, {})
            const p2 = this.db.insert(PurchasedTable, bookID);
            const p3 = this.db.fetch(BooksTable, {BookId: bookID});
            const results = await Promise.all([p1, p2, p3]);

            const book: BookInfoBe = results[2];
            this._user.collection?.purchased.push(this.parseBook(book));

            await this.removeFromWishList(bookID)
            this.updateUser();
        } catch (error) {
            return Promise.reject(error);
        }   
    }

    public async updateBookProgress(bookID: string, currentPage: number): Promise<number> {
        try {
            if(!this._user.userID) {
                return Promise.reject("User not logged in. Aborting call");
            }

            const res = await this.api.post(`/user/${this._user.userID}/progress/${bookID}`, {
                userId: this._user.userID,
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

    public async toggleInWishList(bookID: string): Promise<boolean> {
        if(!this._user.userID) {
            throw Error("User not logged in. Aborting call");
        }

        if (!this._user.collection) {
            return this.addToWishList(bookID);
        }

        const found = this._user.collection.wishlist.find(b => b.ISBN == bookID);
        if(found) {
            return this.removeFromWishList(bookID);
        }

        return this.addToWishList(bookID);
    }

    public async isLoggedIn(): Promise<boolean> {
        if(this._user.userID) {
            return true;
        }

        try {
            const user = await this.loginIfloggedOut()
            if (!user || !user.userID) {                    
                console.log("user not logged in");

                if (ALLOW_FAKE_LOGIN){
                    const id = await this.loginUser(TESTEMAIL);
                    this._user.userID = id;
                    return true;
                }

                return false;
            }

            console.log("user logged in");
            this._user.userID = user.userID;
            this._user.region = user.region;
            this.updateUser();
            return true;
        } catch(error) {
            console.error(`Error logging in`, error);
            return Promise.reject(error);
        }
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

            this._user.userID = userID;
            this._user.region = region;
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

            this._user.userID = userID;
            this._user.region = region;
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

    private async addToWishList(bookID: string): Promise<boolean> {
        try {
            await this.api.post(`/user/${this._user.userID}/wishlist/add`, {
                wishlist: [bookID]
            });
            const bookProm = this.db.fetch(BooksTable, {BookId: bookID});
            const insertProm = this.db.insert(WishlistTable, {BookId: bookID});
            const results = await Promise.all([bookProm, insertProm]);
            const book = results[0][0] as BookInfoBe;
            this._user.collection?.wishlist.push(this.parseBook(book));
            this.updateUser();
            return true;
        } catch(error) {
            console.error(`Error adding book to wishlist ${bookID}`, error);
            return Promise.reject(error);
        }
    }
    
    private async removeFromWishList(bookID: string): Promise<boolean> {
        try{
            await this.api.post(`/user/${this._user.userID}/wishlist/delete`, {
                wishlist: [bookID]
            });

            await this.db.delete(WishlistTable, {BookId: bookID});
            if (!this._user.collection) {
                return true;
            }

            let idx = 0;            
            for (const b of this._user.collection.wishlist) {                
                if(b.ISBN == bookID) {
                    break; 
                }

                idx++;
            }

            this._user.collection.wishlist.splice(idx, 1);
            this.updateUser();
            return true;
        }catch(error) {
            console.error(`Error removing book to wishlist ${bookID}`, error);
            return Promise.reject(error);
        }
    }

    private async refreshCollection(): Promise<UserCollection> {
        if(!this._user.userID) {
            return emptyCollection();
        }

        return new Promise((resolve, reject) => {
            console.log("my user id is", this._user.userID);
            this.api.get(`/user/${this._user.userID}/collection`)
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

                this._user.collection = collection;
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
        return ParseBookDb(book, this._user.region);
    }

    private updateUser() {
        this.userSource.next(this._user);
    }
  
    public fetchBookCurrentPage(bookID: string): Observable<number> {
        const sub = new Subject<number>();
        if(!this._user.userID) {
            return throwError("User not logged in. Aborting call");
        }

        this.api.get(`/user/${this._user.userID}/progress/${bookID}`)
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
}