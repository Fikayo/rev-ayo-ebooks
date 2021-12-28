import { Injectable } from '@angular/core';
import { IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { Observable, Subject } from 'rxjs';
import { Books } from 'src/app/models/WebSQLConnection';
import { ParseBookDb } from 'src/app/util';
import { ApiService } from '../api/api.service';
import { DatabaseService } from '../database/database.service';
import { BookInfo } from '../../models/BookInfo';
import { ProductInfo } from '../../models/ProductInfo';

@Injectable({
  providedIn: 'root'
})
export class BookstoreService {

    constructor(
        private api: ApiService,
        private db: DatabaseService) { 
    }

    public fetchAllBooks(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();
        const refreshRequired = this.db.expired;
        
        let results: Promise<any>;
        if (refreshRequired) {
            results = this.refreshAllBooks();   
        } else {
            results = this.db.fetch(Books);
        }

        results
        .then(res => {
            const books: BookInfo[] = [];
            if (res) {
                res.forEach((book: any) => {
                    books.push(ParseBookDb(book));
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
        const refreshRequired = this.db.expired;
        
        let results: Promise<any>;
        if (refreshRequired) {
            results = this.refreshAllBooks();
        } else {
            results = this.db.fetch(Books);
        }

        results
        .then(res => {
            let book: BookInfo | undefined;           
            if (res) {

                let bookResp = res;
                if(refreshRequired) {
                    bookResp = res.filter((book: any) => book.BookId == bookID);
                }

                book = ParseBookDb(bookResp);
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
        const refreshRequired = this.db.expired;
        
        let results: Promise<any>;
        if (refreshRequired) {
            results = this.refreshAllBooks();
        } else {
            results = this.db.fetch(Books);
        }

        results
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
        const price = iapproduct.price;
       
        let dbupdate: any = {};
        if (isNaira) {
            dbupdate = {
                BookId: bookID,
                PriceNaira: price
            }
        } else {
            dbupdate = {
                BookId: bookID,
                PriceWorld: price
            }
        }

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
            
            this.db.update(Books, dbupdate).then(_ => sub.next(true)).catch(err => sub.error(err));
        })
        .catch(error => {
            console.error(`error updating book ${bookID} to ${JSON.stringify(iapproduct)}`);
            sub.error(error);
        });

        return sub.asObservable();
    }
    

    private async refreshAllBooks(): Promise<BookInfo[]> {        
        return new Promise((resolve, reject) => {
            this.api.get('/bookstore')    
            .then(async res => {
                const books: BookInfo[] = [];
                if (res) {
    
                    const promises: Promise<void>[] = [];
                    res.forEach((book: any) => {
                        promises.push(this.db.update(Books, book));
                    });
    
                    await Promise.all(promises);
                }
    
                this.db.updateLastUpdateTime();
                resolve(books);
            })
            .catch(error => {
                console.error("Error fetching books", error);
                reject(error);
            });
        });        
    }
}
