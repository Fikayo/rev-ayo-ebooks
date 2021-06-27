import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EbooksSQL, SQLQuery } from 'src/app/models/WebSQLConnection';
import { BookstoreService, BookTitle } from '../bookstore/bookstore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private userID: string = "fikayoid123";
    private wishList: boolean = false;
    private sql = new EbooksSQL();

    constructor(private bookstore: BookstoreService) { 
        this.sql = new EbooksSQL();
    }

    public fetchMyBooks(): Observable<BookTitle[]> {
        const sub = new Subject<BookTitle[]>();
        let query = new SQLQuery(`
            SELECT Books FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let myIDs: string[] = [];
        this.sql.executeTx(query, 
            (tx: any, results: any) => {
                console.debug("results", results);
                let row = results.rows.item(0);
                console.debug("result row", row);
                myIDs = row.Books.split(",").map((item: string)=>item.trim());

                this.bookstore.fetchDetailsArray(myIDs).subscribe({
                    next: (b) => {
                        sub.next(b);
                    }
                });
            }
        );

        return sub.asObservable();
    }
    public addToMyBooks(bookID: string): void {
        let query = new SQLQuery(`
            SELECT Books FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let myIDs: string[] = [];
        this.sql.executeTx(query, 
            (tx: any, results: any) => {
                console.debug("results", results);
                let row = results.rows.item(0);
                console.debug("result row", row);
                myIDs = row.Books.split(",").map((item: string)=>item.trim());

                if (!myIDs.includes(bookID)) {
                    myIDs.push(bookID);                    
                }

                this.sql.executeTx(new SQLQuery(`UPDATE UserLibrary SET Books = ? WHERE UserId = ?`, [myIDs, this.userID]));
            }
        );
    }

    public fetchWishlist(): Observable<BookTitle[]> {
        const sub = new Subject<BookTitle[]>();
        let query = new SQLQuery(`
            SELECT Wishlist FROM UserLibrary l WHERE l.UserId = ?;
        `, [this.userID]);

        let wishlist: string[] = [];
        this.sql.executeTx(query, 
            (tx: any, results: any) => {
                console.debug("results", results);
                let row = results.rows.item(0);
                console.debug("result row", row);
                wishlist = row.Wishlist.split(",").map((item: string)=>item.trim());

                this.bookstore.fetchDetailsArray(wishlist).subscribe({
                    next: (b) => {
                        console.log("fetched wish books", b);
                        sub.next(b);
                    }
                });
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
            (tx: any, results: any) => {
                console.debug("results", results);
                let row = results.rows.item(0);
                console.debug("result row", row);
                wishlist = row.Wishlist.split(",").map((item: string)=>item.trim());

                if (wishlist.includes(bookID)) {
                    wishlist = wishlist.filter(b => b != bookID);
                } else {
                    wishlist.push(bookID);
                }

                this.sql.executeTx(new SQLQuery(`UPDATE UserLibrary SET Wishlist = ? WHERE UserId = ?`, [wishlist, this.userID]));
                sub.next(wishlist.includes(bookID));
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
            (tx: any, results: any) => {
                console.debug("results", results);
                let row = results.rows.item(0);
                console.debug("result row", row);
                wishlist = row.Wishlist.split(",").map((item: string)=>item.trim());

                console.log("in wish list", wishlist, bookID, wishlist.includes(bookID));
                sub.next(wishlist.includes(bookID));
            }
        );

        return sub.asObservable();
    }
}
