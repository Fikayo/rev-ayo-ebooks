import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookstoreService, BookTitle } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'ebook-selector',
  templateUrl: './book-selector.component.html',
  styleUrls: ['./book-selector.component.scss']
})
export class BookSelectorComponent implements OnInit {

    public popularBooks: BookTitle[] = [];
    public featuredBooks: BookTitle[] = [];
    public otherBooks: BookTitle[] = [];
    public selectBookBounded = this.selectBook.bind(this);
    public searching: boolean = false;
    public searchResults: BookTitle[] = [];
    
    private allBooks: BookTitle[] = [];


    // public showFeatures = true;
    // public noResults = false;

    constructor(
        private router: Router,        
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService) { }

    ngOnInit(): void {
        
        this.activatedRoute.queryParams.subscribe(param => {
            let filter = this.activatedRoute.snapshot.queryParams['filter'];
            if (this.allBooks != null) {
                this.filterList(filter);
            }
        });

        this.bookstore.fetchTitles().subscribe({    
            complete: () => {console.log("complete")}, 
            next: (b) => {
                this.allBooks = b; 
                console.log("fetched: ", this.allBooks);

                this.popularBooks = this.allBooks;
                this.featuredBooks = this.allBooks;
                this.otherBooks = this.allBooks;

                let filter = this.activatedRoute.snapshot.queryParams['filter'];
                this.filterList(filter);
            },
            error: () => console.log("failed to fetch titles from bookstore")
        });   
    }

    get showFeatures(): boolean {
        return !this.searching;
    }

    get noResults(): boolean {
        return this.searchResults.length == 0 && this.searching;
    }

    public selectBook(book: BookTitle) {
        this.router.navigate([`/details/${book.ISBN}/`]);
    }

    public onSelectedFilter(e: any) {  
        this.filterList(e);
    }
    
    private filterList(filter: string) {
        this.searching = true;
        this.searchResults = [];
        console.log("search filter", filter);
        if (filter === '' || filter === null || filter === undefined) {
            this.searching = false;
            return;
        } 

        this.searchResults = this.allBooks.filter(s => s.title.toLowerCase().indexOf(filter.toLowerCase()) != -1);
        if (this.searchResults.length == 1) {
            this.selectBook(this.searchResults[0]);
        }
    }

    // private filterList(filter: string): BookTitle[] {
    //     if (filter === '' || filter === null || filter === undefined) {
    //         return [];
    //     }

    //     return filter ? this.allBooks.filter(s => s.title.toLowerCase().indexOf(filter.toLowerCase()) != -1) : [];
    // }

}
