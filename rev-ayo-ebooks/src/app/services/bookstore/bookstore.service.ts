import { Injectable } from '@angular/core';
import { IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { BooksTable } from 'src/app/models/WebSQLConnection';
import { ApiService } from '../api/api.service';
import { DatabaseService } from '../database/database.service';
import { BookInfo, BookInfoBe, BookStore, emptyStore, ParseBookDb } from '../../models/BookInfo';
import { ProductInfo, ProductInfoBe } from '../../models/ProductInfo';
import { UserService } from '../user/user.service';
import { User } from 'src/app/models/User';

@Injectable({
  providedIn: 'root'
})
export class BookstoreService {

    private userRegion: string = '';
    private allBooks: Map<string, BookInfo> = new Map();
    private readonly storeSource: BehaviorSubject<BookStore>;

    constructor(
        private api: ApiService,
        private db: DatabaseService,
        user: UserService) {
        
        this.storeSource = new BehaviorSubject<BookStore>(emptyStore());
        user.user
        .subscribe({
            next: (u: User) => {
                console.log("BOOKSTORE USER UPDATED: ", u);
                if (u.region != this.userRegion) {
                    this.userRegion = u.region;
                    this.allBooks.clear();
                    this.fetchAllBooks();
                }             
            },
            error: (err) => console.error(`failed to subscribe to user`, err)
        });
    }

    public get bookstore(): Observable<BookStore> {
        return this.storeSource.asObservable();
    }

    public async fetchAllBooks(): Promise<BookInfo[]> {
       
        const refreshRequired = this.db.expired(BooksTable);                
        console.info("fetching all books", this.allBooks);

        if (refreshRequired) {
            try {
                const books = await this.refreshAllBooks()
                this.updateBooks();
                return books;
            } catch (err) {
                console.error("Error refreshing books", err)
                return Promise.reject(err);
            }
        }
        
        if(this.allBooks.size > 0) {
            const bookVals = Array.from(this.allBooks.values());
            console.log("returning cached books", bookVals);
            this.updateBooks();
            return bookVals;
        }

        try {
            console.info("fetching books directly from table");
            const booksResponse: BookInfoBe[] = await this.db.fetch(BooksTable)
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
            this.updateBooks();
            return books;
        } catch (err) {
            console.error(`Error fetching books directly from table:`, err);
            return Promise.reject(err);
        }
    }

    public async fetchBookPDFPath(bookID: string): Promise<string> {
        
        if(this.allBooks.size > 0 && this.allBooks.has(bookID)) {
            const book = this.allBooks.get(bookID);
            if (book?.pdfPath) {
                this.updateBooks();
                return book.pdfPath;
            }
        }

        try {
            // Path should last a long time in case the db isn't revisited.
            const path = await this.api.get(`/books/${bookID}/pdf?duration=${this.db.maxDuration}`)
            if(this.allBooks.has(bookID)) {
                const book = this.allBooks.get(bookID) as BookInfo;
                book.pdfPath = path;
                this.allBooks.set(bookID, book);
            }

            await this.db.update(BooksTable, {FileSource: path}, {BookId: bookID});
            this.updateBooks();
            return path;
        } catch(error) {
            console.error(`Error buying book ${bookID}`, error);
            return Promise.reject(error);
        }
    }

    public async fetchProdutinfo(): Promise<ProductInfo[]> {
        const refreshRequired = this.db.expired(BooksTable);
        
        console.log("fetching product info");
        if (refreshRequired) {
            try {
                const books = await this.refreshAllBooks()
                const products: ProductInfo[] = [];
                books.forEach(book => {
                    products.push({
                        ISBN: book.ISBN, 
                        productID: book.productID
                    });
                });
                return products;
            } catch(err) {
                console.error("Error refreshing books", err);
                return Promise.reject(err);
            }
        }

        try {
            console.log("fetching products directly from db");
            const res: ProductInfoBe[] = await this.db.fetch(BooksTable)
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

            return products;
        } catch(error) {
            console.error(`Error fetching products`, error);
            return Promise.reject(error);
        }
    }

    public async updateProduct(bookID: string, product: IAPProduct): Promise<boolean> { 
        const sub = new Subject<boolean>();

        const prodID = product.id.slice(0, -6);
        const isNaira = product.id.toLowerCase().indexOf("naira") != -1;
        const region = isNaira ? "nigeria" : "world";
        const price = product.price;
       
        let dbObject: any = {
            Title: product.title,
            Description: product.description
        }

        if (isNaira) {
            dbObject.PriceNaira = price;
        } else {
            dbObject.PriceWorld = price;
        }

        try {
            console.log(`updating product ${prodID} to`, {prodID, price, region});
            const res = await this.api.post(`/product/${prodID}`, {
                productId: prodID,
                bookId: bookID,
                price: price,
                region: region,
                title: product.title,
                description: product.description
            });
            if (res.affectedRows  == 0) {
                let msg = `no rows updated while updating book ${bookID} to ${JSON.stringify(product)}`;
                console.error(msg);
                sub.error('update failed');
            }
            
            if(this.allBooks.has(bookID)) {
                const currentBook = this.allBooks.get(bookID) as BookInfo;
                currentBook.title = product.title;
                currentBook.description = product.description;
                currentBook.price = price;
                this.allBooks.set(bookID, currentBook);
            }

            await this.db.update(BooksTable, dbObject, {BookId: bookID});
            this.updateBooks();
            return true;
        
        } catch(error) {
            console.error(`error updating book ${bookID} to ${JSON.stringify(product)}`);
            return Promise.reject(error);
        }
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

    private updateBooks() {
        const books = Array.from(this.allBooks.values());
        const groupings = groupBy(books, b => b.viewGroup ?? "More titles");
        const groups = Object.keys(groupings).map(g => {
            return {title: g, books: groupings[g]}
        });

        this.storeSource.next({
            books: books,
            byID: this.allBooks,
            groups: groups,
        });
    }

    private parseBook(book: BookInfoBe): BookInfo {
        return ParseBookDb(book, this.userRegion);
    }
}


const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
}, {} as Record<K, T[]>);
  