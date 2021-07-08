import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PDFProgressData } from 'ng2-pdf-viewer';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Subscription } from 'rxjs';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';

@Component({
  selector: 'ebook-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.scss']
})
export class ReaderComponent implements OnInit, OnDestroy {
    public enablePinchOnMobile = true;
    public mobileFriendlyZoom = "150%"
    public showSecondaryToolbarButton = true;  
    public showPrintButton = false;
    public showOpenFileButton = false;
    public showDownloadButton = false;
    public showBookmarkButton = false;
    public srcBlob!: Blob;

    public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width',
    0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 
    1.25, 1.5];

    public srcUrl!: string;
    public currentPage: number = 1;
    private recentPage!: number;

    private routeSub!: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private bookstore: BookstoreService) {
        pdfDefaultOptions.defaultZoomValue = 'page-fit';
        pdfDefaultOptions.doubleTapZoomFactor = "125%";
    }

    ngOnInit(): void {
        this.routeSub = this.activatedRoute.params.subscribe(params => {
            let bookID = params['isbn'];

            this.bookstore.fetchBookPDF(bookID)
            .subscribe({
                next: (b) => this.srcBlob = b,
                error: () => console.log("failed to fetch book from bookstore")
            });

            // this.bookstore.fetchBookPDFObject(bookID)
            // .subscribe({
            //     next: (b) => this.srcObj = b,
            //     error: () => console.log("failed to fetch book from bookstore")
            // });
            this.srcUrl = "/assets/books/how to be happy and stay happy/pdf.pdf";

            this.recentPage = this.currentPage;
        });
    }

    ngOnDestroy(): void {            
        if(this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }

    public pageChange(newPage: number) {
        console.log("new page: ", newPage);
        this.recentPage = newPage;
    }
}
