import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { BookInfo, BookStore } from "src/app/models/BookInfo";
import { IonSearchbar } from '@ionic/angular';

@Component({
    selector: 'ebook-searchpage',
    templateUrl: './searchpage.page.html',
    styleUrls: ['./searchpage.page.scss']
  })
export class SearchPage implements OnInit, AfterViewInit, OnDestroy {

    public allTitles: BookInfo[] = [];
    public autoCompleteList!: any[];

    @ViewChild('searchInput')
    public searchInput!: IonSearchbar;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
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
        if(this.searchInput) {
            setTimeout(() => { this.searchInput.setFocus(); }, 150); 
        }
    }
    
    public onInput(event: any){
        const input = event.target.value;
        this.autoCompleteList = this.filterList(input);
    }

    private filterList(val: string): BookInfo[] {
        if (val === '' || val === null || val === undefined) {
            return [];
        }

        return val ? this.allTitles.filter(s => s.title.toLowerCase().indexOf(val.toLowerCase()) != -1)
            : this.allTitles;
    }
}
