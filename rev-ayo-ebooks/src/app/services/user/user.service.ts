import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookstoreService, BookTitle } from '../bookstore/bookstore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    constructor(private bookstore: BookstoreService) { }

    public fetchMyBooks(): Observable<BookTitle[]> {
        return this.bookstore.fetchTitles();
    }

    public fetchWishlist(): Observable<BookTitle[]> {
        return this.bookstore.fetchTitles();
    }
}
