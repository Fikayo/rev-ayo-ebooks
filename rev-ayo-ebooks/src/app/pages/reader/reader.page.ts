import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookInfo, BookStore } from 'src/app/models/BookInfo';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-reader',
  templateUrl: './reader.page.html',
  styleUrls: ['./reader.page.scss']
})
export class ReaderPage implements OnInit, OnDestroy {
    public enablePinchOnMobile = true;
    public mobileFriendlyZoom = "150%";
    public showSecondaryToolbarButton = true;  
    public showPrintButton = false;
    public showOpenFileButton = false;
    public showDownloadButton = false;
    public showBookmarkButton = false;
    public srcBlob!: Blob;

    public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width',
    0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 
    1.25, 1.5];

    public progressType: string = "indeterminate";
    public progressColor: string = "primary";
    public totalPages: number = 1;

    public srcUrl!: string;
    public currentPage: number = 1;

    private bookID!: string;

    
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private activatedRoute: ActivatedRoute,
        private user: UserService,
        private bookstore: BookstoreService) {
    }

    ngOnInit(): void {
        this.activatedRoute.params
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
            let bookID = params['isbn'];
            this.bookID = bookID;

            this.bookstore.bookstore
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (store: BookStore) => {
                    if(!store.byID || !store.byID.has(bookID)) return;
                    const book = store.byID.get(bookID) as BookInfo;
                    if (book.pdfPath) {
                        this.srcUrl = book.pdfPath;
                    }
                },

                error: (err) => console.error("failed to subscribe to bookstore:", err),
            });
        });
    }

    ngOnDestroy(): void {
        this.user.updateBookProgress(this.bookID, this.currentPage);
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    ionViewDidEnter() {  
        this.bookstore.fetchBookPDFPath(this.bookID)
        .then((path) => {
            this.srcUrl = path
        })
        .catch((err) => {
            console.error(`failed to fetch ${this.bookID} PDF url from bookstore`, err)
        })

        this.user.fetchBookCurrentPage(this.bookID)
        .pipe(takeUntil(this.destroy$))            
        .subscribe({
            next: (page) => {
                console.log("current page: ", page);
                this.currentPage = page;
            },
            error: () => console.log(`failed to fetch current page for book ${this.bookID}`)
        });
    }

    ionViewWillLeave() {
        console.info("reader page leaving");
        this.user.updateBookProgress(this.bookID, this.currentPage);
    }

    public onPageChange(page: number) {
        let progress = page / this.totalPages;

        if(progress >= 0.95) {
            this.progressColor = "success";
        } else if(progress >= 0.1) {
            this.progressColor = "secondary";
        } else {
            this.progressColor = "primary";
        }
    }

    public onLoadComplete(pdf: PDFDocumentProxy) {
        this.progressType = "determinate";
        this.totalPages = pdf.numPages;
        console.log("totalPages, ", this.totalPages);
    }
      
}
