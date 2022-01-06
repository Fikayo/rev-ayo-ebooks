import { Injectable } from '@angular/core';
import { IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { Observable, of, Subject } from 'rxjs';
import { BooksTable } from 'src/app/models/WebSQLConnection';
import { ApiService } from '../api/api.service';
import { DatabaseService } from '../database/database.service';
import { BookInfo, BookInfoBe, ParseBookDb } from '../../models/BookInfo';
import { ProductInfo, ProductInfoBe } from '../../models/ProductInfo';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class BookstoreService {

    private allBooks: Map<string, BookInfo> = new Map();

    constructor(
        private api: ApiService,
        private db: DatabaseService,
        private user: UserService) { 
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
            const bookVals = Array.from(this.allBooks.values());
            console.log("returning cached books", bookVals);
            return of(bookVals);
        }

        console.info("fetching books directly from table");
        this.db.fetch(BooksTable)
        .then((booksResponse: BookInfoBe[]) => {
            console.info("all books data", booksResponse);
            const books: BookInfo[] = [];
            if (booksResponse) {
                booksResponse.forEach((book: BookInfoBe) => {
                    const b:BookInfo = this.parseBook(book);
                    books.push(b);
                    this.allBooks.set(book.BookId, b);
                });
            }
    
            console.info("books from table", this.allBooks);
            sub.next(books);
        })
        .catch(err => {
            console.error(`Error fetching books directly from table:`, err);
            sub.next(err);
        });
        return sub.asObservable();
    }

    public fetchBook(bookID: string): Observable<BookInfo> {
        const sub = new Subject<BookInfo>();
        const refreshRequired = this.db.expired(BooksTable);
        
        console.info(`fetching book ${bookID}. Refresh required:`, refreshRequired);
        if (refreshRequired) {
            this.refreshAllBooks()
            .then(books => {
                console.debug("refreshed books for book", bookID, books);
                sub.next(books.filter((book: BookInfo) => book.ISBN == bookID)[0])
            })
            .catch(err => {
                console.error("Error refreshing books", err);
                sub.error(err);
            });
            return sub.asObservable();
        } 

        if(this.allBooks.size > 0 && this.allBooks.has(bookID)) {
            const b: BookInfo = this.allBooks.get(bookID) as BookInfo;
            console.info("cached book", b);
            return of(b);
        }
        
        console.info(`fetching book ${bookID} from DB`);
        this.db.fetch(BooksTable, {BookId: bookID})
        .then((booksResponse: BookInfoBe[]) => {
            let book!: BookInfo;
            if (booksResponse) {

                let bookResp = booksResponse[0];
                if(refreshRequired) {
                    bookResp = booksResponse.filter((book: BookInfoBe) => book.BookId == bookID)[0];
                }

                book = this.parseBook(bookResp);
                this.allBooks.set(bookID, book);
            }

            sub.next(book);
        })
        .catch(err => {
            console.error(`Error fetching book ${bookID} directly from table:`, err);
            sub.next(err);
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

        // Path should last a long time in case the db isn't revisited.
        this.api.get(`/books/${bookID}/pdf?duration=${this.db.maxDuration}`)
        .then((path: string) => {
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
        
        console.log("fetching product info");
        if (refreshRequired) {
            this.refreshAllBooks()
            .then(books => {
                const products: ProductInfo[] = [];
                books.forEach(book => {
                    products.push({
                        ISBN: book.ISBN, 
                        productID: book.productID
                    });
                });

                sub.next(products);
            })
            .catch(err => console.error("Error refreshing books", err));

            return sub.asObservable();
        }

        console.log("fetching products directly from db");
        this.db.fetch(BooksTable)
        .then((res: ProductInfoBe[]) => {
            console.debug("product info response", res)
            const products: ProductInfo[] = [];
            if (res) {
                res.forEach((p: ProductInfoBe) => {
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

        console.log(`updating product ${prodID} to`, {prodID, price, region});
        this.api.post(`/product/${prodID}`, {
            ProductId: prodID,
            price: price,
            region: region
        })
        .then(res => {           
            if (res.affectedRows  == 0) {
                let msg = `no rows updated while updating book ${bookID} to ${JSON.stringify(iapproduct)}`;
                console.error(msg);
                sub.error('update failed');
            }
            
            if(this.allBooks.has(bookID)) {
                const currentBook = this.allBooks.get(bookID) as BookInfo;
                currentBook.price = price;
                this.allBooks.set(bookID, currentBook);
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
        console.info("Refreshing all books");  
        return new Promise((resolve, reject) => {
            
            // Book should last a long time in case the db isn't revisited.
            this.api.get(`/bookstore?duration=${this.db.maxDuration}`)    
            .then(async (books: BookInfoBe[]) => {
                console.debug("refreshbooks response", books);                
                this.allBooks.clear();

                // const books: BookInfo[] = [];
                // if (res) {    
                    // const promises: Promise<void>[] = [];
                    // res.forEach((book: any) => {                        
                        // promises.push(this.db.update(BooksTable, book, {BookId: book.BookId}));
                        // const b = ParseBookDb(book);
                        // books.push(b);
                        // this.allBooks.set(book.BookId, b);
                    // });
    
                    // console.debug("waiting for book updates");
                    // await Promise.all(promises);
                    // console.debug("finished waiting");                    
                // }
                
                const delConds: string[] = [];
                // const bookIds: string[] = [];
                if (books) { 
                    books.forEach((book: BookInfoBe) => {
                        delConds.push(`BookId <> '${book.BookId}'`);
                        // bookIds.push(book.BookId)  
                        this.allBooks.set(book.BookId, this.parseBook(book));
                    });                 
                                
                    const query = `DELETE FROM ${BooksTable} WHERE ${delConds.join(" AND ")};`;
                    await this.db.query(query, undefined);

                    const promises: Promise<void>[] = [];
                    books.forEach((book: BookInfoBe) => {      
                        promises.push(this.db.update(BooksTable, book, {BookId: book.BookId}));
                    });
                }
                
                // if (books) { 
                //     await this.db.delete(BooksTable); 
                //     const promises: Promise<void>[] = [];
                //     books.forEach((book: BookInfoBe) => {      
                //         this.allBooks.set(book.BookId, this.parseBook(book));
                //         promises.push(this.db.insert(BooksTable, book));
                //     });

                //     console.debug("waiting for book updates");
                //     await Promise.all(promises);
                //     console.debug("finished waiting");
                // }

    
                this.db.updateLastUpdateTime(BooksTable);
                // resolve(books);
                resolve(Array.from(this.allBooks.values()));
            })
            .catch(error => {
                console.error("Error refreshing books from api:", error);
                reject(error);
            });
        });        
    }

    private parseBook(book: BookInfoBe): BookInfo {
        return ParseBookDb(book, this.user.region);
    }
}
