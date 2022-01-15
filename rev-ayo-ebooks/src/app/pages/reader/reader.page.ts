import { Component, HostListener, Input, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookInfo, BookStore } from 'src/app/models/BookInfo';
import { BookstoreService } from 'src/app/services/bookstore/bookstore.service';
import { UserService } from 'src/app/services/user/user.service';
import { PdfViewerComponent } from 'ng2-pdf-viewer';

const zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width', 0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 1.25, 1.5];
@Component({
  selector: 'ebook-reader',
  templateUrl: './reader.page.html',
  styleUrls: ['./reader.page.scss']
})
export class ReaderPage implements OnInit, OnDestroy {
    @ViewChild(PdfViewerComponent, {static: false}) private pdfComponent!: PdfViewerComponent;   

    // Progress bar
    public progressType: string = "indeterminate";
    public progressColor: string = "primary";
    public totalPages: number = 1;

    // Pdf 
    public srcUrl!: string;
    public currentPage: number = 1;
    public pdfZoom = 1; 

    private bookID!: string;
    private pinchZoomEnabled = false;
    private pageTurnEnabled = false;
    
    private destroy$: Subject<boolean> = new Subject<boolean>();
    private domListener!: () => void;

    constructor(
        private activatedRoute: ActivatedRoute,
        private user: UserService,
        private bookstore: BookstoreService) {
            const tabs = document.querySelectorAll('ion-tab-bar');
            Object.keys(tabs).map((key: any) => {
                tabs[key].style.display = 'none';
            });
    }

    nextPage() {
        if (this.currentPage == this.totalPages) return;
        this.currentPage++ 
    }

    prevPage() { 
        if (this.currentPage == 1) return;
        this.currentPage--;
    }

    zoomIn() { 
        if(this.pdfZoom >= 10) return; 
        this.pdfZoom += 0.7; 
    }

    zoomOut() { 
        if(this.pdfZoom <= 0.3) return; 
        this.pdfZoom -= 0.2; 
    }

    zoomReset() { this.pdfZoom = 1; }

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

        if(this.domListener) {
            this.domListener();
        }
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

    ngAfterViewInit() {
        if (/iphone|ipad|ipod|android|blackberry|bb10|mini|windows\sce|palm/i.test(navigator.userAgent)) {
            const metaEl = document.createElement('meta');
            metaEl.setAttribute('name', 'viewport');
            metaEl.setAttribute('content', 'width=device-width, initial-scale=1, user-scalable=no');
            document.getElementsByTagName('head')[0].appendChild(metaEl);
        }

        if (!this.pinchZoomEnabled) {
            this.pinchZoomEnabled = true;
            this.enablePinchZoom(
                this.pdfComponent.pdfViewerContainer.nativeElement,
                this.pdfComponent.pdfViewerContainer.nativeElement.children[0]
            );
        }

        if (!this.pageTurnEnabled) {
            this.pageTurnEnabled = true;
            this.enablePageTurn(this.pdfComponent.pdfViewerContainer.nativeElement);
        }
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

    private enablePinchZoom(container: HTMLDivElement, viewer: HTMLDivElement) {
        const MAX_PINCH_SCALE_VALUE = 3;
        const MAX_SCALE = 10.0;
        const MIN_PINCH_SCALE_DELTA = 0.01;
        const MIN_PINCH_SCALE_VALUE = 0.25;
        const MIN_SCALE = 0.1;
        let scaledXOffset: number;
        let scaledYOffset: number;
        let originalXOffset: number;
        let originalYOffset: number;
        let originalDistance = 0;
        let pinchScale = 1;
    
        document.addEventListener('touchstart', (event: any) => {
            if (event.touches.length < 2) {
                originalDistance = 0;
                return;
            }

            const touchMidpoint = event.pageX && event.pageY ? [event.pageX, event.pageY]
                    : getMidpoint(
                        event.touches[0].pageX,
                        event.touches[0].pageY,
                        event.touches[1].pageX,
                        event.touches[1].pageY,
                    );
    
            // Set the scale point based on the pinch midpoint and scroll offsets
            scaledXOffset = container.scrollLeft - viewer.offsetLeft + touchMidpoint[0];
            scaledYOffset = container.scrollTop - viewer.offsetTop + touchMidpoint[1];// + 15;
    
            (<any>viewer).style['transform-origin'] = `${scaledXOffset}px ${scaledYOffset}px`;
    
            // Preserve the original touch offset
            originalXOffset = touchMidpoint[0];
            originalYOffset = touchMidpoint[1];
    
            // Used by non-iOS browsers that do not provide a scale value
            originalDistance = getDistance(
                event.touches[0].pageX,
                event.touches[0].pageY,
                event.touches[1].pageX,
                event.touches[1].pageY,
            );           
        });

        document.addEventListener('touchmove', (event: any) => {
            if (originalDistance <= 0 || event.touches.length < 2) { return; }
            // scale non-standard (missing where?) property exposing distance between two fingers/touches
            if ((event as any).scale !== 1) { event.preventDefault(); } // Prevent native iOS page zoom
        
            const scale = event.scale ? event.scale
                : getDistance(
                    event.touches[0].pageX,
                    event.touches[0].pageY,
                    event.touches[1].pageX,
                    event.touches[1].pageY,
                ) / originalDistance;
        
            const proposedNewScale = this.pdfZoom * scale;
            if (
                scale === 1 ||
                Math.abs(pinchScale - scale) < MIN_PINCH_SCALE_DELTA ||
                proposedNewScale >= MAX_SCALE ||
                proposedNewScale <= MIN_SCALE ||
                scale > MAX_PINCH_SCALE_VALUE ||
                scale < MIN_PINCH_SCALE_VALUE
            ) {
                return;
            }
            
            pinchScale = scale;            
            viewer.style.transform = `scale(${pinchScale})`;
        });//, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (originalDistance <= 0) { return; }
        
            // PDF.js zoom
            this.pdfZoom = this.pdfZoom * pinchScale;
        
            (<any>viewer.style).transform = null;
            (<any>viewer.style)['transform-origin'] = null;
        
            // Scroll to correct position after zoom
            // this.zone.run(() => {
            //     setTimeout(() => {
            //         // container.scroll(
            //         //     scaledXOffset * pinchScale - originalXOffset,
            //         //     scaledYOffset * pinchScale - originalYOffset + viewer.offsetTop,
            //         // );
            //         container.scrollLeft = scaledXOffset * pinchScale - originalXOffset;
            //         container.scrollTop = scaledYOffset * pinchScale - originalYOffset + viewer.offsetTop;
            //     }, 100);
            // });

            console.debug("new pos",  scaledXOffset * pinchScale - originalXOffset,
            scaledYOffset * pinchScale - originalYOffset + viewer.offsetTop);
        
            originalDistance = 0;
            pinchScale = 1;
        });
    }
      
    @HostListener('scroll') onScrollHost(e: Event): void {
        console.log("console.log random scroller");
      }

    onWindowScroll(e:any) {
        console.log("all hail scrolling");
    }
    private enablePageTurn(container: HTMLDivElement) {
        if(!container) return;

        const X_MIN_DELTA = 0.01;
        const Y_MIN_DELTA = 30;
        const Y_MAX_DELTA = 550;
        const MIN_SLOPE = 2;
        
        let scrollDetected = false, scrollStarted = false;
        let startX = 0, startY = 0, finalX = 0, finalY = 0;
        let scrollUp = false;

        document.addEventListener('touchstart', (event: any) => {
            if (event.touches.length != 1) {
                return;
            }

            startX = event.touches[0].pageX;
            startY = event.touches[0].pageY;
            scrollDetected = true;        
        });

        document.addEventListener('touchmove', (event: any) => {
            if(!scrollDetected) return;

            const curX = event.touches[0].pageX;
            const curY = event.touches[0].pageY;

            let slope = Infinity;
            if(curX != startX && Math.abs(startX - curX) > X_MIN_DELTA) {
                slope = (curY - startY) / (curX - startX);    
            }

            if(Math.abs(slope) < MIN_SLOPE) return;
            
            scrollUp = curY > startY;
            scrollStarted = true;

            finalX = curX;
            finalY = curY;
        });

        document.addEventListener('touchend', (event: any) => {
            if(!scrollStarted || !container.clientHeight) return;

            const yDelta = Math.abs(finalY - startY);
            if(yDelta <= Y_MIN_DELTA || yDelta > Y_MAX_DELTA) return;

            if(scrollUp) {
                if(container.scrollTop <= 0) {
                    this.prevPage();
                }
            } else {
                if((container.offsetHeight + container.scrollTop) >= container.scrollHeight) {
                    this.nextPage();
                }
            }

            scrollDetected = scrollStarted = false;
            startX = startY = 0;
        });
    }
      
}

function getMidpoint(x1: number, y1: number, x2: number, y2: number): number[] {
    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;
    return [x, y];
}
  
function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
