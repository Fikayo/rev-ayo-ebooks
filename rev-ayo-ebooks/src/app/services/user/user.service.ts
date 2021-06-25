import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BookstoreService, BookTitle } from '../bookstore/bookstore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private wishList: boolean = false;

    constructor(private bookstore: BookstoreService) { }

    public fetchMyBooks(): Observable<BookTitle[]> {
        return this.bookstore.fetchTitles();
    }

    public fetchWishlist(): Observable<BookTitle[]> {
        return this.bookstore.fetchTitles();
    }

    public toggleInWishList(bookID: string): Observable<boolean> {
        this.wishList = !this.wishList;
        return this.hasBookInWishList(bookID);
    }

    public hasBookInWishList(bookID: string): Observable<boolean> {
        const sub = new Subject<boolean>();
        this.fetchMyBooks().subscribe({
            next: (_) => {
                sub.next(this.wishList);
            }
        });

        return sub.asObservable();
    }
}
