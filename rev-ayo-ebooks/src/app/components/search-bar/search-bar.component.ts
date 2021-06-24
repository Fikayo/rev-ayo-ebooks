import { Component, ElementRef, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { BookstoreService, BookTitle } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'ebook-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

    public searchBox = new FormControl();
    public placeholder: string = "Search...";

    public filteredOptions!: Observable<string[]>;
    public allTitles: BookTitle[] = [];
    public autoCompleteList!: any[]

    @ViewChild('autocompleteInput')
    public autocompleteInput!: ElementRef;

    @Output()
    public onSelectedOption = new EventEmitter();

    constructor(public bookstore: BookstoreService) { }

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

    public searchSubmitted() {
        this.autoCompleteList = [];
        this.onSelectedOption.emit(this.searchBox.value);
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

    // after you clicked an autosuggest option, this function will show the field you want to show in input
    public displayFn(book: BookTitle) {
        let k = book ? book.title : book;
        return k;
    }

    public filterBookTitles(event: any) {
        var selected = event.source.value;
        if (selected) { 
            this.onSelectedOption.emit(selected.title);
        }

        this.focusOnPlaceInput();
    }

    // focus the input field and remove any unwanted text.
    private focusOnPlaceInput() {
        this.autocompleteInput.nativeElement.focus();
        this.autocompleteInput.nativeElement.value = '';
    }

}
