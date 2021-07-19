import booksList from '../../assets/books/list.json';

export const DBState: string = "DBState";
export const User: string = "User";
export const UserLibrary: string = "UserLibrary";
export const UserProgress: string = "UserProgress";
export const Books: string = "Books";
const TableNames: string[] = [DBState, User, UserLibrary, UserProgress, Books];

export const BookTable = {
    BookId: "BookId",
    Title: "Title",
    DisplayName: "DisplayName",
    Author: "Author",
    Description: "Description",
    ProductID: "ProductID",
    PriceNaira: "PriceNaira",
    PriceWorld: "PriceWorld",
}

const TABLES: string[] = [

    `CREATE TABLE IF NOT EXISTS [${DBState}] (
        [Initiliased] INT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS [${User}] (
        UserId STRING NOT NULL,
        PRIMARY KEY (UserId)
    );`,

    `CREATE TABLE IF NOT EXISTS [${UserLibrary}] (
        [UserId] STRING NOT NULL UNIQUE,
        [Books] TEXT,
        [Wishlist] TEXT,
        FOREIGN KEY (UserId) REFERENCES [${User}] (UserId) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS [${UserProgress}] (
        [UserId] STRING NOT NULL UNIQUE,
        [BookId] STRING NOT NULL UNIQUE,
        [CurrentPage] INT NOT NULL,
        FOREIGN KEY (UserId) REFERENCES [${User}] (UserId) ON DELETE CASCADE,
        FOREIGN KEY (BookId) REFERENCES [${Books}] (${BookTable.BookId})
    );`,

    `CREATE TABLE IF NOT EXISTS [${Books}] (
        [${BookTable.BookId}] STRING NOT NULL,
        [${BookTable.Title}] STRING NOT NULL,
        [${BookTable.DisplayName}] STRING NOT NULL,
        [${BookTable.Author}] STRING NOT NULL,
        [${BookTable.Description}] STRING NOT NULL,
        [${BookTable.ProductID}] STRING NOT NULL,
        [${BookTable.PriceNaira}] Float NOT NULL,
        [${BookTable.PriceWorld}] Float NOT NULL,
        PRIMARY KEY (${BookTable.BookId})
    );`,

];

export class SQLQuery
{
    public sql: string;
    public params: any[] | undefined = [];

    constructor(sql: string, params?: any[]) {
        this.sql = sql;
        this.params = params;
    }
}

export type SQLCallback = (tx: any, result: any) => void;

export interface Transaction {
    executeSql: (sql: string, params?: any[], successCB?: SQLCallback, errorCB?: SQLCallback) => void;
}

abstract class WebSQLConnection
{
    private readonly name = "ayo.ebooks.database";
    private readonly version = "1.01";
    private readonly displayName = "Ayo Odunayo Ebooks DB";
    private readonly estimatedSize = 2 * 1024 * 1024;

    private db: any;
    
    constructor() {
        this.initDB();
        this.createTables();
        this.init();
    }

    private initDB() {
        this.db = (<any>window).openDatabase(this.name, this.version, this.displayName, this.estimatedSize);
    }

    protected init() {}

    protected abstract deleteTables(): void;

    protected abstract createTables(): void;

    public execute(sqlQuery: SQLQuery, successCB?: SQLCallback, errorCB?: SQLCallback) {
        this.runTransaction((tx: Transaction) => {
            tx.executeSql(sqlQuery.sql, sqlQuery.params, successCB, errorCB);
        });
    }

    public runTransaction(func: (tx: Transaction) => void) {
        try {
            this.db.transaction(func);
        } catch(e) {
            console.error("Error during db transaction: ", e);
        }
    }
} 


export class EbooksSQL extends WebSQLConnection {

    static loadedTestData: boolean = false;
    static initialised: boolean = false;

    protected deleteTables(): void {        
        TableNames.forEach(t => {
            this.execute( new SQLQuery(`DROP TABLE IF EXISTS [${t}]`));
        });
    }

    protected createTables(): void {
        // this.deleteTables();
        TABLES.forEach(t => {
            this.execute(new SQLQuery(t), undefined, 
                (_, error) => console.error(`Error creating table with query: "${t}"`, error)
            );
        });        
    }

    protected init() {
        console.log("inside init func", EbooksSQL.initialised);
        if (EbooksSQL.initialised) return;

        this.runTransaction((tx: Transaction) => {

            tx.executeSql(`SELECT Initiliased FROM ${DBState}`, [], 
                (_, results) => {
                    let isInit = false;
                    console.log("reading init value", results);
                    if (results.rows.length > 0) {
                        let row = results.rows.item(0);
                        isInit = row.Initiliased == 1;
                    }

                    if(isInit) return;
                    
                    console.log("loading booklist", booksList);        
                    booksList.books.forEach(b => {
                        let q = new SQLQuery(
                            `INSERT INTO ${Books} (${BookTable.BookId}, ${BookTable.Title}, ${BookTable.DisplayName}, ${BookTable.Author}, ${BookTable.Description}, ${BookTable.ProductID}, ${BookTable.PriceNaira}, ${BookTable.PriceWorld}) 
                            VALUES (?,?,?,?,?,?,?,?)`,
                            [b.ISBN, b.title, b.displayName, b.author, b.description, b.productID, b.price.naira, b.price.world]
                        );
                    
                        tx.executeSql(q.sql, q.params, undefined, 
                            (_, error) => console.debug(`Failed to load book ${b.ISBN} into table: ${error.message}`, b, error)
                        );
                    });

                    tx.executeSql(`INSERT INTO ${DBState} (Initiliased) VALUES (1)`, [], undefined, 
                        (_, error) => console.error("Failed to set db to initialised", error)
                    );
                }
            );
        });

        EbooksSQL.initialised = true;
    }

    public prefetchData() {
        this.loadData();
    }

    private loadData(): void {
        if (EbooksSQL.loadedTestData) return;

        const numMyBooks = 5;
        const numWishlist = 8;
        const allBooks = ['975-978-57020-4-0', 'unknown'];

        let myBooks: string[] = [];
        let wishlist: string[] = [];

        for(let i = 0; i < numMyBooks; i++) {
            myBooks.push(allBooks[i % allBooks.length]);
        }

        for(let i = 0; i < numWishlist; i++) {
            wishlist.push(allBooks[i % allBooks.length]);
        }

        console.debug("loading test data: ", JSON.stringify(myBooks), JSON.stringify(wishlist))

        this.runTransaction((tx: Transaction) => {

            tx.executeSql("SELECT UserId from User", [], 
            (_, results) => {
                if (results.rows.length > 0) {
                    let row = results.rows.item(0);
                    console.debug("result row", row);
                    if (row.UserId) {
                        let userID = row.UserId;                   
                        tx.executeSql(`UPDATE UserLibrary SET Books = ?, Wishlist = ? WHERE UserId = ?`, [myBooks, wishlist, userID],
                        (_, results) => {
                            if (results.rowsAffected > 0) {
                                EbooksSQL.loadedTestData = true;
                                console.debug("done loading test data");
                            } else {
                                console.error("no rows affected loading data");
                            }
                        },
                        (_, error) => console.error("Failed to load data", error),
                        );
                    }
                }
                
            },
            (_, error) => {
                console.error("Error reading userID", error);
            }
            );
        });
    }

}

