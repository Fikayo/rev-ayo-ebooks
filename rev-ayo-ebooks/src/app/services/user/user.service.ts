import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EbooksSQL, SQLQuery, Transaction } from 'src/app/models/WebSQLConnection';
import { BookstoreService, BookTitle } from '../bookstore/bookstore.service';

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

    public fetchMyBooks(): Observable<BookTitle[]> {
        const sub = new Subject<BookTitle[]>();
        let query = new SQLQuery(`
            SELECT Books FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let myIDs: string[] = [];
        this.sql.executeTx(query, 
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

                    this.bookstore.fetchDetailsArray(myIDs).subscribe({
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

        let myIDs: string[] = [];
        let wishlist: string[] = [];
        this.sql.executeTx(query, 
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

                    this.sql.executeTx(
                        new SQLQuery(`UPDATE UserLibrary SET Books = ?, Wishlist = ? WHERE UserId = ?`, [myIDs, wishlist, this.userID]),
                        (_, __) => {
                            sub.next();
                        }
                    );
                }
            }
        );

        return sub.asObservable();
    }

    public fetchWishlist(): Observable<BookTitle[]> {
        const sub = new Subject<BookTitle[]>();
        let query = new SQLQuery(`
            SELECT Wishlist FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let wishlist: string[] = [];
        this.sql.executeTx(query, 
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
                
                    this.bookstore.fetchDetailsArray(wishlist).subscribe({
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

        let wishlist: string[] = [];
        this.sql.executeTx(query, 
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
                this.sql.executeTx(new SQLQuery(`UPDATE UserLibrary SET Wishlist=? WHERE UserId=?`, [wishlist, this.userID]),
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

        return sub.asObservable();
    }

    public hasBookInWishList(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        let query = new SQLQuery(`
            SELECT Wishlist FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let wishlist: string[] = [];
        this.sql.executeTx(query, 
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
        this.sql.executeTx(query, 
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
