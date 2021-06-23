import { Component, Input, OnInit } from '@angular/core';
import { BookTitle } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'ebook-bookset',
  templateUrl: './bookset.component.html',
  styleUrls: ['./bookset.component.scss']
})
export class BooksetComponent implements OnInit {
    // const styles = ["row", "grid"];

    @Input()
    public title: string = "";

    @Input()
    public books: BookTitle[] = [];
    
    @Input()
    public onSelect!: (book: BookTitle) => void;

    @Input() style: string = "row";
    @Input() showTitle: boolean = true;

    constructor() { }

    ngOnInit(): void {
        if (this.title.trim() === "" || this.title == null) {
            this.showTitle = false;
        }
    }
    
    selectBook(book: BookTitle) {
        this.onSelect(book);
    }
}
