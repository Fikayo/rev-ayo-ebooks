import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { BookInfo } from "src/app/models/BookInfo";
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
    selector: 'ebook-bookset',
    templateUrl: './bookset.component.html',
    styleUrls: ['./bookset.component.scss'],
    animations: [
        trigger('fadeBook', [
            transition('void => show', animate(600, keyframes([
                style({opacity: 0}),
                style({opacity: 1}),
            ]))),
        ])
    ]
})
export class BooksetComponent implements OnInit, AfterViewInit {
    // const styles = ["carousel", "grid"];

    @Input() title: string = "";
    @Input() books!: BookInfo[];    
    @Input() onSelect!: (book: BookInfo) => void;
    @Input() style: string = "carousel";
    @Input() showTitle: boolean = true;
    @Input() showPrice: boolean = true;
    @Input() size: string = "xlarge";

    constructor(private transition: TransitionService) { }

    ngOnInit(): void {
        
    }

    public get showBooks(): string {
        return this.books == undefined || this.books.length <= 0 ? 'hide' : 'show';
    }

    public get showFakes(): string {
        return this.books == undefined || this.books.length <= 0 ? 'show' : 'hide';
    }

    ngAfterViewInit(): void {
        if (this.title.trim() === "" || this.title == null) {
            this.showTitle = false;
        }
    }

    selectBook(book: BookInfo) {
        if(this.onSelect) {
            this.onSelect(book);
        } else {
            this.transition.fade(`books/store/details/${book.ISBN}/`);
        }
    }
}
