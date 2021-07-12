import { Component, ElementRef, OnInit, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { BookstoreService, BookInfo } from 'src/app/services/bookstore/bookstore.service';
import { Router } from '@angular/router';

@Component({
    selector: 'ebook-searchpage',
    templateUrl: './searchpage.component.html',
    styleUrls: ['./searchpage.component.scss']
  })
export class SearchpageComponent implements OnInit, AfterViewInit {

    public filteredOptions!: Observable<string[]>;
    public allTitles: BookInfo[] = [];
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
        this.bookstore.fetchAllBooks().subscribe({    
            next: (b) => this.allTitles = b,
            error: () => console.log("failed to fetch titles from bookstore")
        });   

        // Detect input changes
        // this.searchBox.valueChanges.subscribe(userInput => {
        //     console.log("new input");
        //     this.autoCompleteSearchList(userInput);
        // });
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
