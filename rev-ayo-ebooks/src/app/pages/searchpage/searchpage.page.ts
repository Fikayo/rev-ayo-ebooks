import { Component, ElementRef, OnInit, EventEmitter, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { BookInfo, BookStore } from "src/app/models/BookInfo";

@Component({
    selector: 'ebook-searchpage',
    templateUrl: './searchpage.page.html',
    styleUrls: ['./searchpage.page.scss']
  })
export class SearchPage implements OnInit, AfterViewInit, OnDestroy {

    public filteredOptions!: Observable<string[]>;
    public allTitles: BookInfo[] = [];
    public autoCompleteList!: any[];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    @ViewChild('autocompleteInput')
    public autocompleteInput!: ElementRef;

    @Output()
    public onSelectedOption = new EventEmitter();

    constructor(
        private location: Location,
        public bookstore: BookstoreService) { }

    ngOnInit(): void {
        this.bookstore.bookstore
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (store: BookStore) => {
                this.allTitles = store.books;
            },
            error: (err) => console.error("failed to fetch titles from bookstore:", err),
        });
    }
    
    ngOnDestroy(): void {   
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    ngAfterViewInit() {
        this.focusOnPlaceInput();
    }
    
    public goBack() {
        this.location.back();
    }
    
    onKeyUp(event: any){
        this.autoCompleteSearchList(event.target.value);
    }

    private autoCompleteSearchList(input: string) {        
        console.log("filter with: " + input);
        this.autoCompleteList = this.filterList(input);
        console.log("filter result: ", this.autoCompleteList);

    }

    private filterList(val: string): BookInfo[] {
        if (val === '' || val === null || val === undefined) {
            return [];
        }

        return val ? this.allTitles.filter(s => s.title.toLowerCase().indexOf(val.toLowerCase()) != -1)
            : this.allTitles;
    }

    // focus the input field and remove any unwanted text.
    private focusOnPlaceInput() {
        if (this.autocompleteInput && this.autocompleteInput.nativeElement) {
            this.autocompleteInput.nativeElement.focus();
            this.autocompleteInput.nativeElement.value = '';
        }
    }

}
