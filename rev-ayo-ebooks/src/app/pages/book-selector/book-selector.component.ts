import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookstoreService, BookTitle } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'app-book-selector',
  templateUrl: './book-selector.component.html',
  styleUrls: ['./book-selector.component.scss']
})
export class BookSelectorComponent implements OnInit {

    public books: BookTitle[] = [];

    constructor(
        private router: Router,
        private bookstore: BookstoreService) {

            // this.books = [
            //     {id: 1, title: "How to be happy and stay happy", cover: ""},
            //     {id: 2, title: "Becoming a better you", cover: "./assets/books/Becoming a better you/cover.jpg"},
            // ];
         }

    ngOnInit(): void {
        this.bookstore.fetchTitles().subscribe({    
            complete: () => {console.log("complete")}, 
            next: (b) => { console.log("seeing", b); this.books = b; console.log("fetched: ", this.books)},
            error: () => console.log("failed to fetch titles from bookstore")
        });   
    }

    selectBook(book: BookTitle) {
        this.router.navigate([`/read/${book.id}/`]);
    }

}
