import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookInfo } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'ebook-bookset',
  templateUrl: './bookset.component.html',
  styleUrls: ['./bookset.component.scss']
})
export class BooksetComponent implements OnInit {
    // const styles = ["carousel", "grid"];

    @Input() title: string = "";
    @Input() books: BookInfo[] = [];    
    @Input() onSelect!: (book: BookInfo) => void;
    @Input() style: string = "carousel";
    @Input() showTitle: boolean = true;
    @Input() showPrice: boolean = true;
    @Input() size: string = "xlarge";

    slideOpts = {
        slidesPerView: 'auto',
        freeMode: false,
        zoom: false,
        grabCursor: true,
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }
      }

    constructor(private router: Router) { }

    ngOnInit(): void {
        if (this.title.trim() === "" || this.title == null) {
            this.showTitle = false;
        }
    }
    
    selectBook(book: BookInfo) {
        if(this.onSelect) {
            this.onSelect(book);
        } else {
            this.router.navigate([`books/store/details/${book.ISBN}/`]);
        }
    }
}
