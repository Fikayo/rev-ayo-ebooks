import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookstoreService, BookInfo } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'ebook-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {

    public popularBooks: BookInfo[] = [];
    public featuredBooks: BookInfo[] = [];
    public otherBooks: BookInfo[] = [];
    public searching: boolean = false;
    public filter!: string;
    public searchResults: BookInfo[] = [];
    
    private allBooks: BookInfo[] = [];


    // public showFeatures = true;
    // public noResults = false;

    constructor(
        private router: Router,        
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService) {console.log("store con"); }

    ngOnInit(): void {
        console.log("store init");
        // this.activatedRoute.queryParams.subscribe(param => {
        //     this.filterList(param['filter']);
        // });

        this.bookstore.fetchAllTitles().subscribe({    
            complete: () => {console.log("complete")}, 
            next: (b) => {
                this.allBooks = b; 
                console.log("fetched: ", this.allBooks);

                this.popularBooks = this.allBooks;
                this.featuredBooks = this.allBooks;
                this.otherBooks = this.allBooks;

                // this.filterList(this.activatedRoute.snapshot.queryParams['filter']);
            },
            error: () => console.error("failed to fetch titles from bookstore")
        });   
    }

    get showFeatures(): boolean {
        return !this.searching;
    }

    get noResults(): boolean {
        return this.searchResults.length == 0 && this.searching;
    }

    public openSearch() {
        this.router.navigate(['/searchpage']);
    }

    // private selectBook(book: BookTitle) {
    //     this.router.navigate([`/details/${book.ISBN}/`]);
    // }
    
    // private filterList(filter: string) {
    //     this.searching = true;
    //     this.searchResults = [];
    //     if (filter === '' || filter === null || filter === undefined || this.allBooks == null) {
    //         this.searching = false;
    //         return;
    //     } 

    //     console.log("search filter", filter);
    //     filter = decodeURIComponent(filter);
    //     console.log(" decoded search filter", filter);
    //     this.filter = filter;

    //     this.searchResults = this.allBooks.filter(s => s.title.toLowerCase().indexOf(filter.toLowerCase()) != -1);
    //     if (this.searchResults.length == 1) {
    //         this.selectBook(this.searchResults[0]);
    //     }
    // }
}
