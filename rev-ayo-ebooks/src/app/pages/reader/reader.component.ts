import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    public src!: Blob;

    public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width',
    0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 
    1.25, 1.5];

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

            this.bookstore.fetchBook(bookID)
            .subscribe({
                next: (b) => this.src = b,
                error: () => console.log("failed to fetch book from bookstore")
            });
        });
    }

    ngOnDestroy(): void {            
        if(this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }
}
