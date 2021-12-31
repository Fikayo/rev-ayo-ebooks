import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PDFDocumentProxy, PDFProgressData } from 'ng2-pdf-viewer';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Subscription } from 'rxjs';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { UserService } from 'src/app/services/user/user.service';

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

    public progressType: string = "indeterminate";
    public progressColor: string = "primary";
    public totalPages: number = 1;

    public srcUrl!: string;
    public currentPage: number = 1;

    private routeSub!: Subscription;
    private bookID!: string;

    constructor(
        private activatedRoute: ActivatedRoute,
        private user: UserService,
        private bookstore: BookstoreService) {
        pdfDefaultOptions.defaultZoomValue = 'page-fit';
        pdfDefaultOptions.doubleTapZoomFactor = "125%";
    }

    ngOnInit(): void {
        this.routeSub = this.activatedRoute.params.subscribe(params => {
            let bookID = params['isbn'];
            this.bookID = bookID;

            this.bookstore.fetchBookPDFPath(bookID).subscribe({
                next: (path) => {
                    this.srcUrl = path
                },
                error: (err) => {
                    console.error(`failed to fetch ${bookID} PDF url from bookstore`, err)
                }
            });
                        
            this.user.fetchBookCurrentPage(bookID)
            .subscribe({
                next: (page) => {
                    this.currentPage = page;
                },
                error: () => console.log(`failed to fetch current page for book ${bookID}`)
            });

        });
    }

    ngOnDestroy(): void {            
        if(this.routeSub) {
            this.routeSub.unsubscribe();
        }

        this.user.updateBookProgress(this.bookID, this.currentPage)
        .subscribe({
           error: () => console.error(`Failed to update current page for book ${this.bookID}`) 
        });
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
