import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { Observable, Subject } from 'rxjs';

export interface BookInfo {
    ISBN: string;
    title: string;
    displayName: string;
    author?: string;
    cover?: string;
    description?: string;
    price?: string;
    productID: string;
} 

export interface ProductInfo {
    ISBN: string;
    productID: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookstoreService {

    constructor(private http: HttpClient) { }

    public fetchAllTitles(): Observable<BookInfo[]> {
        const titlesSub = new Subject<BookInfo[]>();

        this.http.get("./assets/books/list.json", {responseType: "json"})
        .subscribe({
            next: (data: any) => {
                let titles = []
                for(let b of data["books"]) {
                    titles.push(this.parseBook(b));
                }

                titlesSub.next(titles);
            }
        });

        return titlesSub.asObservable();
    }

    public fetchDetails(bookID: string): Observable<BookInfo> {
        const detailsSub = new Subject<BookInfo>();

        this.fetchAllDetails([bookID]).subscribe({
            next: (books) => {
                if (books.length > 0) {
                    detailsSub.next(books[0]);
                } else {                    
                    detailsSub.next();
                }
            }
        })

        return detailsSub.asObservable();
    }

    public fetchAllDetails(bookIDs: string[]): Observable<BookInfo[]> {
        const detailsSub = new Subject<BookInfo[]>();

        this.http.get("./assets/books/list.json", {responseType: "json"})
        .subscribe({
            next: (data: any) => {
                let books: BookInfo[] = [];

                let allBooks: any[] = data["books"];
                bookIDs.forEach(b => {
                    let found = allBooks.find(el => el.ISBN == b);
                    console.debug("found", found);
                    if (found) {
                        books.push(this.parseBook(found));
                    }
                });

                detailsSub.next(books);
            }
        });

        return detailsSub.asObservable();
    }
    public fetchBookPDFPath(bookID: string): Observable<string> {
        const bookSub = new Subject<string>();
        let path = "./assets/books/how to be happy and stay happy/pdf.pdf"
        if (bookID == "unknown") {
            path =  "./assets/books/becoming a better you/pdf.pdf";
        }

        this.fetchBookPDF(bookID)
        .subscribe({
            next: (res) => bookSub.next(path.replace(".", "")),
            error: () => console.log(`failed to fetch book "${bookID}"`)
        });

        return bookSub.asObservable();
    }

    public fetchBookPDF(bookID: string): Observable<Blob> {
        const bookSub = new Subject<Blob>();
        let path = "./assets/books/how to be happy and stay happy/pdf.pdf"
        if (bookID == "unknown") {
            path =  "./assets/books/becoming a better you/pdf.pdf";
        }

        this.http.get(path, { responseType: 'blob' })
        .subscribe({
            next: (res) => bookSub.next(res),
            error: () => console.log(`failed to fetch book "${bookID}"`)
        });

        // this.http.get("./assets/books/list.json", {responseType: "json"})
        // .subscribe({
        //     next: (data: any) => {
        //         let path = "";
        //         for(let b of data["books"]) {
        //             if (b.id == bookID) {
        //                 path = `./asset/books/${b.title.toLowerCase()}/pdf.pdf`;
        //                 break;
        //             }
        //         }

        //         this.http.get(path, { responseType: 'blob' })
        //         .subscribe({
        //             next: (res) => bookSub.next(res),
        //             error: () => console.log(`failed to fetch book "${bookID}"`)
        //         });
        //     }
        // });


        return bookSub.asObservable();
    }

    public fetchProdutinfo(): Observable<ProductInfo[]> {
        const sub = new Subject<ProductInfo[]>();

        this.http.get("./assets/books/list.json", {responseType: "json"})
        .subscribe({
            next: (data: any) => {
                let infos: ProductInfo[] = [];
                let allBooks: any[] = data["books"];
                allBooks.forEach(b => {
                    infos.push({ISBN: b.ISBN, productID: b.producID});
                });

                sub.next(infos);
            }
        });

        return sub.asObservable();
    }

    public updateProduct(bookID: string, iapproduct: IAPProduct) {
        let isNaira = iapproduct.id.toLowerCase().indexOf("naira") != -1;

        this.http.get("./assets/books/list.json", {responseType: "json"})
        .subscribe({
            next: (data: any) => {
                for(let b of data["books"]) {
                    if (b.ISBN == bookID) {
                        if(isNaira) {
                            b.price.naira = iapproduct.price
                        } else {
                            b.price.world = iapproduct.price;
                        }

                        break;                   
                    }
                }

                //TODO: WRITE TO LOCAL JSON FILE
             }
        });

    }

    private parseBook(b: any): BookInfo {
        let title = b as BookInfo;
        title.cover = `./assets/books/${b.title.toLowerCase()}/cover.jpg`;
        title.price = `₦${b.price.naira}`;
        return title;
    }
}
