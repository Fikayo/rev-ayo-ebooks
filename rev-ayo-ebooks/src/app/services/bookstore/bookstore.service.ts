import { Injectable } from '@angular/core';
import { IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { Observable, Subject } from 'rxjs';
import { BooksTable } from 'src/app/models/WebSQLConnection';
import { ParseBookDb } from 'src/app/util';
import { ApiService } from '../api/api.service';
import { DatabaseService } from '../database/database.service';
import { BookInfo } from '../../models/BookInfo';
import { ProductInfo } from '../../models/ProductInfo';

@Injectable({
  providedIn: 'root'
})
export class BookstoreService {

    private allBooks: Map<string, BookInfo> = new Map();

    constructor(
        private api: ApiService,
        private db: DatabaseService) { 
    }

    public fetchAllBooks(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();
        const refreshRequired = this.db.expired(BooksTable);
                
        console.info("fetching all books", this.allBooks);

        if (refreshRequired) {
            this.refreshAllBooks()
            .then(books => sub.next(books))
            .catch(err => console.error("Error refreshing books", err));
            return sub.asObservable();
        }
        
        if(this.allBooks.size > 0) {
            sub.next(Array.from(this.allBooks.values()));
            return sub.asObservable();
        }

        this.db.fetch(BooksTable)
        .then(booksResponse => {
            console.info("all books data", booksResponse);
            const books: BookInfo[] = [];
            if (booksResponse) {
                booksResponse.forEach((book: any) => {
                    books.push(ParseBookDb(book));
                });
            }
    
            sub.next(books);
        });
        return sub.asObservable();
    }

    public fetchBook(bookID: string): Observable<BookInfo> {
        const sub = new Subject<BookInfo>();
        const refreshRequired = this.db.expired(BooksTable);
        
        if (refreshRequired) {
            this.refreshAllBooks()
            .then(books => books.filter((book: BookInfo) => book.BookId == bookID)[0])
            .catch(err => console.error("Error refreshing books", err));
            return sub.asObservable();
        } 

        if(this.allBooks.size > 0 && this.allBooks.has(bookID)) {
            sub.next(this.allBooks.get(bookID) as BookInfo);
            return sub.asObservable();
        }
        
        this.db.fetch(BooksTable, {BookId: bookID})
        .then(booksResponse => {
            let book!: BookInfo;
            if (booksResponse) {

                let bookResp = booksResponse[0];
                if(refreshRequired) {
                    bookResp = booksResponse.filter((book: any) => book.BookId == bookID)[0];
                }

                book = ParseBookDb(bookResp);
            }

            sub.next(book);
        });
        return sub.asObservable();
    }

    public fetchBookPDFPath(bookID: string): Observable<string> {
        const sub = new Subject<string>();

        if(this.allBooks.size > 0 && this.allBooks.has(bookID)) {
            const book = this.allBooks.get(bookID);
            if (book?.pdfPath) {
                sub.next(book.pdfPath);
                return sub.asObservable();
            }
        }

        this.api.get(`/books/${bookID}/pdf?duration=${this.db.expiryDuration}`)
        .then(path => {
            if(this.allBooks.has(bookID)) {
                const book = this.allBooks.get(bookID) as BookInfo;
                book.pdfPath = path;
                this.allBooks.set(bookID, book);
            }

            this.db.update(BooksTable, {FileSource: path}, {BookId: bookID}).then(_ => sub.next(path)).catch(err => sub.error(err));
        })
        .catch(error => {
            console.error(`Error buying book ${bookID}`, error);
            sub.error(error);
        });

        return sub.asObservable();
    }

    public fetchProdutinfo(): Observable<ProductInfo[]> {
        const sub = new Subject<ProductInfo[]>();
        const refreshRequired = this.db.expired(BooksTable);
        
        let results: Promise<any>;
        if (refreshRequired) {
            results = this.refreshAllBooks();
        } else {
            results = this.db.fetch(BooksTable);
        }

        results
        .then(res => {
            const products: ProductInfo[] = [];
            if (res) {
                res.forEach((p: any) => {
                    products.push({
                        ISBN: p.BookId, 
                        productID: p.ProductId
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
                PriceNaira: price
            }
        } else {
            dbupdate = {
                PriceWorld: price
            }
        }

        if(this.allBooks.has(bookID)) {
            const book = this.allBooks.get(bookID) as BookInfo;
            book.price = price;
            this.allBooks.set(bookID, book);
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
            
            this.db.update(BooksTable, dbupdate, {BookId: bookID}).then(_ => sub.next(true)).catch(err => sub.error(err));
        })
        .catch(error => {
            console.error(`error updating book ${bookID} to ${JSON.stringify(iapproduct)}`);
            sub.error(error);
        });

        return sub.asObservable();
    }
    
    private async refreshAllBooks(): Promise<BookInfo[]> {      
        console.info("Regreshing all books");  
        return new Promise((resolve, reject) => {
            this.api.get(`/bookstore?duration=${this.db.expiryDuration}`)    
            .then(async res => {
                console.debug("refreshbooks response", res);
                const books: BookInfo[] = [];
                this.allBooks.clear();
                if (res) {    
                    const promises: Promise<void>[] = [];
                    res.forEach((book: any) => {                        
                        promises.push(this.db.update(BooksTable, book, {BookId: book.BookId}));
                        books.push(book);
                        this.allBooks.set(book.BookId, book);
                    });
    
                    console.debug("waiting for book updates");
                    await Promise.all(promises);
                    console.debug("finished waiting");
                }
    
                this.db.updateLastUpdateTime(BooksTable);
                resolve(books);
            })
            .catch(error => {
                console.error("Error refreshing books from api:", error);
                reject(error);
            });
        });        
    }
}
