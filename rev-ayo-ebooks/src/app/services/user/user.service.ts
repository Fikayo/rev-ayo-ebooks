import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EbooksSQL, SQLQuery, Transaction } from 'src/app/models/WebSQLConnection';
import { BookstoreService, BookInfo } from '../bookstore/bookstore.service';

const API = "https://ebooksserver-jnueslq6ba-ez.a.run.app"
const TESTEMAIL = "test@email.com"

export interface UserCollection {
    purchased: BookInfo[];
    wishlist: BookInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private id!: string;

    constructor(private http: HttpClient) { 
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
        this.http.get(`${API}/user/${this.userID}/purchased`)
        .subscribe({
            next: (res: any) => {
                const books: BookInfo[] = [];
                if (res.data) {
                    res.data.forEach((book: any) => {
                        books.push(BookstoreService.parseBookDb(book));
                    });
                }

                sub.next(books)
            },
           error: () => console.error("Error fetching purchased books")
       });

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

    public fetchCollection(): Observable<UserCollection> {
        const sub = new Subject<UserCollection>();
        this.http.get(`${API}/user/${this.userID}/collection`)
        .subscribe({
            next: (res: any) => {
                const purchased: BookInfo[] = [];
                const wishlist: BookInfo[] = [];
                if (res.data) {
                    if (res.data.purchased) {
                        res.data.purchased.forEach((book: any) => {
                            purchased.push(BookstoreService.parseBookDb(book));
                        });
                    }

                    if (res.data.wishlist) {
                        res.data.wishlist.forEach((book: any) => {
                            wishlist.push(BookstoreService.parseBookDb(book));
                        });
                    }
                }

                sub.next({
                    purchased: purchased,
                    wishlist: wishlist,
                });
            },
           error: () => console.error("Error fetching wishlist books")
       });

        return sub.asObservable();
    }

    public fetchWishlist(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();
        this.http.get(`${API}/user/${this.userID}/wishlist`)
        .subscribe({
            next: (res: any) => {
                const books: BookInfo[] = [];
                if (res.data) {
                    res.data.forEach((book: any) => {
                        books.push(BookstoreService.parseBookDb(book));
                    });
                }

                sub.next(books)
            },
           error: () => console.error("Error fetching wishlist books")
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
        this.http.get(`${API}/user/${this.userID}/progress/${bookID}`)
        .subscribe({
            next: (res: any) => {
                let page: number | undefined;
                if (res.data) {
                    page = res.data.Page as number;
                }
                
                sub.next(page);
            },
           error: () => console.error(`Error fetching current page for book ${bookID}`)
       });

        return sub.asObservable();
    }

    public updateBookProgress(bookID: string, currentPage: number): Observable<number> {
        let sub = new Subject<number>();
        this.http.post(`${API}/user/${this.userID}/progress/${bookID}`, {
            userId: this.userID,
            bookID: bookID,
            page: currentPage
        })
        .subscribe({
            next: (res: any) => {;
                if (res.data.page != currentPage) {
                    let msg = `Unexpected result after updating page in ${bookID} to ${currentPage}`;
                    console.error(msg);
                    sub.error(msg);;
                    return;
                }

                sub.next(currentPage);
            },
            error: () => console.error(`error updating book page in ${bookID} to ${currentPage}`)
        });

        return sub.asObservable();
    }

    public loginUser(email: string): Observable<string> {
        const sub = new Subject<string>();

        this.http.post(`${API}/user/login`, {
            email: email
        })
        .subscribe({
            next: (res: any) => {
                if (res.status != 200) {
                    sub.error(res.data);
                }

                let userID: string | undefined;
                if (res.data) {
                    userID = res.data.UserId;
                }

                sub.next(userID);
            },
            error: () => console.error(`error fetching userID for email ${email}`)
        });

        return sub.asObservable();
    }
}
