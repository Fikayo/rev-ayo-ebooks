import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { Observable, Subject } from 'rxjs';
import { BookTable, EbooksSQL, SQLQuery } from 'src/app/models/WebSQLConnection';

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

    private sql: EbooksSQL;

    constructor(private http: HttpClient) { 
        this.sql = new EbooksSQL();
    }

    public fetchAllBooks(): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();
        let query = new SQLQuery(`SELECT * FROM Books`);

        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("books results", results);
                let books: BookInfo[] = [];
                if (results.rows) {
                    for (const b of results.rows) {
                        books.push(this.parseBookDb(b));
                    }

                    console.debug("books read", books);
                } 

                sub.next(books);

            },

            (_, error) => {
                console.error("Error fetching books", error);   
            }
        );

        return sub.asObservable();
    }

    public fetchBook(bookID: string): Observable<BookInfo> {
        const sub = new Subject<BookInfo>();

        // let query = new SQLQuery(`SELECT * FROM Books WHERE ${BookTable.BookId}=?`, [bookID]);
        // this.sql.execute(query, 
        //     (_, result: any) => {
        //         console.debug("fetched book", query, result);
        //         let book: BookInfo | undefined = undefined;
        //         if (result.rows) {
        //             book = this.parseBookDb(result.rows[0]);
        //             console.debug("books read", book);
        //         } 

        //         sub.next(book);
        //     },

        //     (_, error) => {
        //         console.error(`Error fetching book with ID ${bookID} `, error);   
        //     }
        // );

        this.fetchBooks([bookID]).subscribe({
            next: (books) => {
                if (books.length > 0) {
                    sub.next(books[0]);
                } else {                    
                    sub.next();
                }
            }
        });

        return sub.asObservable();
    }

    public fetchBooks(bookIDs: string[]): Observable<BookInfo[]> {
        const sub = new Subject<BookInfo[]>();

        let query = new SQLQuery(`SELECT * FROM Books WHERE ${BookTable.BookId} IN (?)`, bookIDs);
        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("fetched books", results);
                let books: BookInfo[] = [];
                if (results.rows) {
                    for (const b of results.rows) {
                        books.push(this.parseBookDb(b));
                    }

                    console.debug("books read", books);
                } 

                sub.next(books);
            },

            (_, error) => {
                let msg = `Error fetching books ${bookIDs}: ${error.message}`;
                console.error(msg, error);
                sub.error(msg);
            }
        );

        return sub.asObservable();
    }

    public fetchBookPDFPath(bookID: string): Observable<string> {
        const sub = new Subject<string>();
        
        let query = new SQLQuery(`SELECT ${BookTable.Title} FROM Books WHERE ${BookTable.BookId}=?`, [bookID]);
        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("fetched book", results);
                let path = ""
                if (results.rows.length > 0) {
                    let row = results.rows.item(0);
                    path = `./assets/books/${row.Title.toLowerCase()}/pdf.pdf`;
                } 

                sub.next(path);
            },

            (_, error) => {
                let msg = `Error fetching book ${bookID}: ${error.message}`;
                console.error(msg, error);
                sub.error(msg); 
            }
        );
        
        return sub.asObservable();
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

        return bookSub.asObservable();
    }

    public fetchProdutinfo(): Observable<ProductInfo[]> {
        const sub = new Subject<ProductInfo[]>();

        let query = new SQLQuery(`SELECT ${BookTable.BookId}, ${BookTable.ProductID} FROM Books`);
        this.sql.execute(query, 
            (_, results: any) => {
                console.debug("fetched product ids", results);
                let infos: ProductInfo[] = [];
                if (results.rows) {
                    for (const b of results.rows) {
                        infos.push({ISBN: b.BookId, productID: b.ProducID});
                    }
                } 

                sub.next(infos);
            },

            (_, error) => {
                let msg = `Error fetching product ids:${error.message} `;
                console.error(msg, error);   
            }
        );

        return sub.asObservable();
    }

    public updateProduct(bookID: string, iapproduct: IAPProduct) {
        let isNaira = iapproduct.id.toLowerCase().indexOf("naira") != -1;
        let priceColumn = isNaira ? BookTable.PriceNaira : BookTable.PriceWorld;

        let query = new SQLQuery(`UPDATE Books SET [${priceColumn}]=? WHERE ${BookTable.BookId}=?`, [iapproduct.price, bookID]);
        this.sql.execute(query, 
            (_, results) => {
                if (results.rowsAffected == 0) {
                    let msg = `no rows updated while updating book ${bookID} to ${JSON.stringify(iapproduct)}`;
                    console.error(msg);
                }  
            },
            
            (_, error) => {
                let msg = `updating book ${bookID} to ${JSON.stringify(iapproduct)}: ${error.message}`;
                console.error(msg, error);
            }
        );
    }

    private parseBookJson(b: any): BookInfo {
        let book = b as BookInfo;
        book.cover = `./assets/books/${b.title.toLowerCase()}/cover.jpg`;
        book.price = `₦${b.price.naira}`;
        return book;
    }
    
    private parseBookDb(b: any): BookInfo {
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
