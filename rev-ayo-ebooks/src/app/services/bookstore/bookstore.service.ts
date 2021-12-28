import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { Observable, Subject } from 'rxjs';
import { BookTable, EbooksSQL, ProductTable, SQLQuery } from 'src/app/models/WebSQLConnection';
import { ApiService } from '../api/api.service';

export interface BookInfo {
    ISBN: string;
    title: string;
    displayName: string;
    author?: string;
    cover?: string;
    description?: string;
    price?: string;
    productID: string;
    [key: string]: any;
} 

export interface ProductInfo {
    ISBN: string;
    productID: string;
}


@Injectable({
  providedIn: 'root'
})
export class BookstoreService {

    constructor(
        private http: HttpClient,
        private api: ApiService) { 
    }

    public fetchAllBooks(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();

        this.api.get('/bookstore')
        .then(res => {
            const books: BookInfo[] = [];
            if (res) {
                res.forEach((book: any) => {
                    books.push(BookstoreService.parseBookDb(book));
                });
            }

            sub.next(books);
        })
        .catch(error => {
            console.error("Error fetching books", error);
            sub.error(error);
        });

        return sub.asObservable();
    }

    public fetchBook(bookID: string): Observable<BookInfo> {
        const sub = new Subject<BookInfo>();

        this.api.get(`/book/${bookID}`)
        .then(res => {
            let book: BookInfo | undefined;           
            if (res) {
               book = BookstoreService.parseBookDb(res);
            }

            sub.next(book);
        })
        .catch(error => {
            console.error(`Error fetching book with ID ${bookID}`, error);
            sub.error(error);
        });

        return sub.asObservable();
    }

    // public fetchBookPDFPath(bookID: string): Observable<string> {
    //     const sub = new Subject<string>();
        
    //     let query = new SQLQuery(`SELECT ${BookTable.Title} FROM Books WHERE ${BookTable.BookId}=?`, [bookID]);
    //     this.sql.execute(query, 
    //         (_, results: any) => {
    //             console.debug("fetched book", results);
    //             let path = ""
    //             if (results.rows.length > 0) {
    //                 let row = results.rows.item(0);
    //                 path = `./assets/books/${row.Title.toLowerCase()}/pdf.pdf`;
    //             } 

    //             sub.next(path);
    //         },

    //         (_, error) => {
    //             let msg = `Error fetching book ${bookID}: ${error.message}`;
    //             console.error(msg, error);
    //             sub.error(msg); 
    //         }
    //     );
        
    //     return sub.asObservable();
    // }

    public fetchBookPDF(bookID: string): Observable<Blob> {
        const sub = new Subject<Blob>();

    //     this.http.get(`${API}/book/${bookID}`)
    //     .subscribe({
    //        next: (res: any) => {   
    //             let book: BookInfo | undefined;           
    //             if (res.data) {
    //                book = BookstoreService.parseBookDb(res.data);
    //                res.data.DataSource;
    //             }

    //            sub.next();
    //        },
    //        error: () => console.error(`Error fetching book with ID ${bookID}`)
    //    });

    //     return sub.asObservable();

        // let path = "./assets/books/how to be happy and stay happy/pdf.pdf"
        // if (bookID == "unknown") {
        //     path =  "./assets/books/becoming a better you/pdf.pdf";
        // }

        // this.http.get(path, { responseType: 'blob' })
        // .subscribe({
        //     next: (res) => sub.next(res),
        //     error: () => console.log(`failed to fetch book "${bookID}"`)
        // });

        return sub.asObservable();
    }

    public fetchProdutinfo(): Observable<ProductInfo[]> {
        const sub = new Subject<ProductInfo[]>();

        this.api.get(`/product`)
        .then(res => {
            const products: ProductInfo[] = [];
            if (res) {
                res.forEach((p: any) => {
                    products.push({
                        ISBN: p.BookId, 
                        productID: p.ProducId
                    });
                });
            }

            sub.next(products)
        })
        .catch(error => {
            console.error(`Error fetching products`, error);
            sub.error(error);
        });

        return sub.asObservable();
    }

    public updateProduct(bookID: string, iapproduct: IAPProduct): Observable<boolean> { 
        const sub = new Subject<boolean>();

        const prodID = iapproduct.id.slice(0, -6);
        const isNaira = iapproduct.id.toLowerCase().indexOf("naira") != -1;
        const region = isNaira ? "nigeria" : "world";
        this.api.post(`/product/${prodID}`, {
            ProductId: prodID,
            price: iapproduct.price,
            region: region
        })
        .then(res => {           
            if (res.affectedRows  == 0) {
                let msg = `no rows updated while updating book ${bookID} to ${JSON.stringify(iapproduct)}`;
                console.error(msg);
                sub.error('update failed');
            }

            sub.next(true);            
        })
        .catch(error => {
            console.error(`error updating book ${bookID} to ${JSON.stringify(iapproduct)}`);
            sub.error(error);
        });

        return sub.asObservable();
    }
    
    public static parseBookDb(b: any): BookInfo {
        let book = b as BookInfo;
        for(var key in b) {
            var newKey = `${key[0].toLowerCase()}${key.substr(1)}`
            book[newKey as any] = b[key];
        }
        book.ISBN = b.BookId;
        book.cover = `./assets/books/${b.Title.toLowerCase()}/cover.jpg`;
        book.price = `₦${b.PriceNaira}`;
        console.log("parsed book", book);
        console.log("title:", book.title);
        return book;
    }
}
