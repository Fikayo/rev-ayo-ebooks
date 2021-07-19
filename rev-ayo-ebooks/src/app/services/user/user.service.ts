import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EbooksSQL, SQLQuery, Transaction } from 'src/app/models/WebSQLConnection';
import { BookstoreService, BookInfo } from '../bookstore/bookstore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private id!: string;
    private sql: EbooksSQL;

    private count = 0;

    constructor(private bookstore: BookstoreService) { 
        this.sql = new EbooksSQL();
        this.fetchUserID().subscribe({
            next: (id) => {
                this.id = id;
                console.log("userID", this.userID);
            },
            error: () => console.error("Failed to fetch user ID from table")
        });
    }

    private get userID(): string {
        return this.id;
    }

    public fetchMyBooks(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();
        let query = new SQLQuery(`
            SELECT Books FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let myIDs: string[] = [];
        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("results", results);
                if (results.rows.length > 0) {
                    let row = results.rows.item(0);
                    console.debug("result row", row);
                    if (row.Books) {
                        myIDs = row.Books.split(",").map((item: string)=>item.trim());
                    } else {
                        sub.next([]);
                    }

                    this.bookstore.fetchBooks(myIDs).subscribe({
                        next: (b) => {
                            sub.next(b);
                        }
                    });
                } else {
                    sub.next([]);
                }
            }
        );

        return sub.asObservable();
    }

    /**
     * Also removes from wishlist
     * @param bookID 
     * @returns 
     */
    public addToMyBooks(bookID: string): Observable<void> {
        const sub = new Subject<void>();
        let query = new SQLQuery(`
            SELECT Books, Wishlist FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        this.sql.runTransaction((tx: Transaction) => {       
            let myIDs: string[] = [];
            let wishlist: string[] = [];
            tx.executeSql(query.sql, query.params, 
                (_, results: any) => {
                    console.debug("results", results);
                    if (results.rows.length > 0) {
                        let row = results.rows.item(0);
                        console.debug("result row", row);
                        if(row.Books) {
                            myIDs = row.Books.split(",").map((item: string)=>item.trim());
                        }
                        if (row.Wishlist) {
                            wishlist = row.Wishlist.split(",").map((item: string)=>item.trim());
                        }

                        if (!myIDs.includes(bookID)) {
                            myIDs.push(bookID);                    
                        }

                        if (wishlist.includes(bookID)) {
                            wishlist = wishlist.filter(b => b != bookID);
                        }

                        tx.executeSql(`UPDATE UserLibrary SET Books = ?, Wishlist = ? WHERE UserId = ?`, [myIDs, wishlist, this.userID],
                            (_, __) => {
                                sub.next();
                            }
                        );
                    }
                }
            );
        });
        return sub.asObservable();
    }

    public fetchWishlist(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();
        let query = new SQLQuery(`
            SELECT Wishlist FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let wishlist: string[] = [];
        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("results", results);
                if (results.rows.length > 0) {
                    let row = results.rows.item(0);
                    console.debug("result row", row);
                    if (row.Wishlist) {
                        wishlist = row.Wishlist.split(",").map((item: string)=>item.trim());
                    } else {
                        sub.next([]);
                    }
                
                    this.bookstore.fetchBooks(wishlist).subscribe({
                        next: (b) => {
                            console.log("fetched wish books", b);
                            sub.next(b);
                        }
                    });
                } else {
                    sub.next([]);
                }
            }
        );

        return sub.asObservable();
    }

    public toggleInWishList(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        let query = new SQLQuery(`
            SELECT Wishlist FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        this.sql.runTransaction((tx: Transaction) => {
        
            let wishlist: string[] = [];
            tx.executeSql(query.sql, query.params, 
                (_, results: any) => {
                    console.debug("results", results);
                    if (results.rows.length > 0) {
                        let row = results.rows.item(0);
                        console.debug("result row", row);
                        if (row.Wishlist) {
                            wishlist = row.Wishlist.split(",").map((item: string)=>item.trim());
                        }
                    }

                    if (wishlist.includes(bookID)) {
                        wishlist = wishlist.filter(b => b != bookID);
                    } else {
                        wishlist.push(bookID);
                    }

                    console.log("new wishlist", wishlist);
                    tx.executeSql(`UPDATE UserLibrary SET Wishlist=? WHERE UserId=?`, [wishlist, this.userID],
                        (_, results) => {
                            if (results.rowsAffected > 0) {
                                sub.next(wishlist.includes(bookID));
                            } else {
                                let msg = `no rows updated while updating wishlist to be [${wishlist}] for user ${this.userID}`;
                                console.error(msg);
                                sub.error(msg);
                            }  
                        },
                        
                        (_, error) => {
                            let msg = `updating wishlist to be [${wishlist}]: ${error.message}`;
                            console.error(msg, error);
                            sub.error(msg);
                        }
                    );                
                }, 

                (_, error: any) => {
                    let msg = `toggling book ${bookID} in wishlist failed: ${error.message}`;
                    console.error(msg, error);
                    sub.error(msg);            
                }
            );
        });

        return sub.asObservable();
    }

    public hasBookInWishList(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        let query = new SQLQuery(`
            SELECT Wishlist FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let wishlist: string[] = [];
        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("results", results);
                if (results.rows.length > 0) {
                    let row = results.rows.item(0);
                    console.debug("result row", row);
                    if (row.Wishlist) {
                        wishlist = row.Wishlist.split(",").map((item: string)=>item.trim());
                    }
                }

                sub.next(wishlist.includes(bookID));
            }
        );

        return sub.asObservable();
    }

    public hasPurchasedBook(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        let query = new SQLQuery(`
            SELECT Books FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let myIDs: string[] = [];
        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("results", results);
                if (results.rows.length > 0) {
                    let row = results.rows.item(0);
                    console.debug("result row", row);
                    if (row.Books) {
                        myIDs = row.Books.split(",").map((item: string)=>item.trim());
                    }
                }
                    
                sub.next(myIDs.includes(bookID));               
            }
        );

        return sub.asObservable();
    }

    public fetchBookCurrentPage(bookID: string): Observable<number> {
        const sub = new Subject<number>();
        let query = new SQLQuery(`
            SELECT CurrentPage FROM UserProgress p WHERE p.UserId = ? AND p.BookId = ?;
        `, [this.userID, bookID]);

        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("results", results);

                let page = 1;
                if (results.rows.length > 0) {
                    let row = results.rows.item(0);
                    console.debug("result row", row);
                    page = row.CurrentPage;
                }

                sub.next(page);
            },

            (_, error) => {
                let msg = `error fetching current page from book [${bookID}]: ${error.message}`;
                console.error(msg, error);
                sub.error(msg);
            }
        );

        return sub.asObservable();
    }

    public updateBookProgress(bookID: string, currentPage: number): Observable<number> {
        let sub = new Subject<number>();
        let query = new SQLQuery(`
            SELECT CurrentPage FROM UserProgress p WHERE p.UserId = ? AND p.BookId = ?;
        `, [this.userID, bookID]);

        this.sql.runTransaction((tx: Transaction) => {
                tx.executeSql(query.sql, query.params, 
                (_, results: any) => {
                    console.debug("results", results);
                    if (results.rows.length > 0) {
                        tx.executeSql(`UPDATE UserProgress SET CurrentPage=? WHERE UserId=?`, [currentPage, this.userID],
                            (_, results) => {
                                if (results.rowsAffected > 0) {
                                    sub.next(currentPage);
                                } else {
                                    let msg = `no rows updated while updating book ${bookID} progress to be [${currentPage}] for user ${this.userID}`;
                                    console.error(msg);
                                    sub.error(msg);
                                }  
                            },
                            
                            (_, error) => {
                                let msg = `updating current page to be [${currentPage}]: ${error.message}`;
                                console.error(msg, error);
                                sub.error(msg);
                            }
                        );    
                    }  else {
                        tx.executeSql(`INSERT INTO UserProgress (UserId, BookId, CurrentPage) VALUES (?, ?, ?)`, [this.userID, bookID, currentPage],
                            (_, results) => {
                                if (results.rowsAffected > 0) {
                                    sub.next(currentPage);
                                } else {
                                    let msg = `no rows updated while updating book ${bookID} progress to be [${currentPage}] for user ${this.userID}`;
                                    console.error(msg);
                                    sub.error(msg);
                                }  
                            },
                            
                            (_, error) => {
                                let msg = `updating current page to be [${currentPage}]: ${error.message}`;
                                console.error(msg, error);
                                sub.error(msg);
                            }
                        );    
                    }            
                }, 

                (_, error: any) => {
                    let msg = `updating reading progress for book ${bookID} to page ${currentPage}: ${error.message}`;
                    console.error(msg, error);
                    sub.error(msg);            
                }
            );
        });

        return sub.asObservable();
    }

    private fetchUserID(): Observable<string> {
        const sub = new Subject<string>();

        this.sql.runTransaction((tx: Transaction) => {
            console.log("tx object", tx);
            let query = new SQLQuery(`SELECT UserId FROM User`);
            tx.executeSql(query.sql, query.params, 
                (_, results: any) => {
                    console.debug("results", results);
                    let userID: string;
                    if (results.rows.length > 0) {
                        let row = results.rows.item(0);
                        userID = row.UserId;
                        sub.next(userID);
                    }            
                },
                
                (_, error) => {
                    let err = `Reading useriD from User table: ${error.message}`;
                    console.error(err);
                    sub.error(err);
                }
            );           
        });

        return sub.asObservable();
    }
}
