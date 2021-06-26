import { Component, ElementRef, OnInit, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { BookstoreService, BookTitle } from 'src/app/services/bookstore/bookstore.service';
import { Router } from '@angular/router';

@Component({
    selector: 'ebook-searchpage',
    templateUrl: './searchpage.component.html',
    styleUrls: ['./searchpage.component.scss']
  })
export class SearchpageComponent implements OnInit, AfterViewInit {

    public searchBox = new FormControl();
    public placeholder: string = "Search...";

    public filteredOptions!: Observable<string[]>;
    public allTitles: BookTitle[] = [];
    public autoCompleteList!: any[];

    @ViewChild('autocompleteInput')
    public autocompleteInput!: ElementRef;

    @Output()
    public onSelectedOption = new EventEmitter();

    constructor(
        private router: Router,
        private location: Location,
        public bookstore: BookstoreService) { }

    ngOnInit(): void {
        this.bookstore.fetchTitles().subscribe({    
            next: (b) => this.allTitles = b,
            error: () => console.log("failed to fetch titles from bookstore")
        });   

        // Detect input changes
        this.searchBox.valueChanges.subscribe(userInput => {
            this.autoCompleteExpenseList(userInput);
        });
    }
    
    ngAfterViewInit() {
        this.focusOnPlaceInput();
    }
    
    public goBack() {
        this.location.back();
    }
    
    public search(filter: string) {
        let extras: any = null;
        if (filter != null || filter != undefined) {
            extras = { queryParams: { filter: encodeURIComponent(filter.trim()) } };
        }

        this.router.navigate([`/search/`], extras);
    }

    private autoCompleteExpenseList(input: string) {
        this.autoCompleteList = this.filterList(input);;
    }

    private filterList(val: string): BookTitle[] {
        if (val === '' || val === null || val === undefined) {
            return [];
        }

        return val ? this.allTitles.filter(s => s.title.toLowerCase().indexOf(val.toLowerCase()) != -1)
            : this.allTitles;
    }

    // focus the input field and remove any unwanted text.
    private focusOnPlaceInput() {
        this.autocompleteInput.nativeElement.focus();
        this.autocompleteInput.nativeElement.value = '';
    }

}
