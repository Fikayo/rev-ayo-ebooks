export const UserTable: string = "User";
export const PurchasedTable: string = "Purchased";
export const WishlistTable: string = "Wishlist";
export const BookProgressTable: string = "BookProgress";
export const BooksTable: string = "Books";
const TableNames: string[] = [UserTable, PurchasedTable, WishlistTable, BookProgressTable, BooksTable];

export const BookTable = {
    BookId: "BookId",
    Title: "Title",
    DisplayName: "DisplayName",
    Author: "Author",
    Description: "Description",
    ImageSource: "ImageSource",
    FileSource: "FileSource",
    ProductId: "ProductId",
    PriceNaira: "PriceNaira",
    PriceWorld: "PriceWorld",
}

const TABLES: string[] = [

    `CREATE TABLE IF NOT EXISTS [${UserTable}] (
        [UserId] varchar(50) NOT NULL UNIQUE,
        [Region] varchar(20) NOT NULL,
        PRIMARY KEY (UserId)
    );`,
    
    `CREATE TABLE IF NOT EXISTS [${PurchasedTable}] (
        [BookId] varchar(50) NOT NULL UNIQUE,
        FOREIGN KEY (BookId) REFERENCES [${BooksTable}] (${BookTable.BookId})
    );`,

    `CREATE TABLE IF NOT EXISTS [${WishlistTable}] (
        [BookId] varchar(50) NOT NULL UNIQUE,
        FOREIGN KEY (BookId) REFERENCES [${BooksTable}] (${BookTable.BookId})
    );`,

    `CREATE TABLE IF NOT EXISTS [${BookProgressTable}] (
        [BookId] STRING NOT NULL UNIQUE,
        [CurrentPage] INT NOT NULL,
        FOREIGN KEY (BookId) REFERENCES [${BooksTable}] (${BookTable.BookId})
    );`,

    `CREATE TABLE IF NOT EXISTS [${BooksTable}] (
        [${BookTable.BookId}] varchar(50) NOT NULL,
        [${BookTable.Title}] STRING NOT NULL,
        [${BookTable.DisplayName}] STRING NOT NULL,
        [${BookTable.Author}] STRING NOT NULL,
        [${BookTable.Description}] STRING NOT NULL,
        [${BookTable.ImageSource}] STRING NOT NULL,
        [${BookTable.FileSource}] STRING,
        [${BookTable.ProductId}] STRING NOT NULL,
        [${BookTable.PriceNaira}] STRING,
        [${BookTable.PriceWorld}] STRING,
        PRIMARY KEY (${BookTable.BookId})
    );`,

];

export class SQLQuery
{
    public readonly sql: string;
    public readonly params: any[] | undefined;

    constructor(sql: string, ...params: any[]) {
        this.sql = sql;
        this.params = params[0] == undefined ? undefined : params;
    }

    public toString(): string {
        return `[SQLQuery] Query: '${this.sql}'  Params(${this.params?.length}): [${this.params}]`;
    }
}

export type SQLCallback = (tx: any, result: any) => void;

export interface Transaction {
    executeSql: (sql: string, params?: any[], successCB?: SQLCallback, errorCB?: SQLCallback) => void;
}

abstract class WebSQLConnection
{
    protected readonly dbName = "ayo.ebooks.database";
    private readonly version = "1.01";
    private readonly displayName = "Ayo Odunayo Ebooks DB";
    private readonly estimatedSize = 2 * 1024 * 1024;

    private db: any;
    
    constructor() {
        this.openDB();
        // this.deleteTables();
        this.createTables();
    }

    private openDB() {
        this.db = (<any>window).openDatabase(this.dbName, this.version, this.displayName, this.estimatedSize);
        console.debug("opened db, ", this.db);
    }

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
            // if (t != UserTable) return;
            this.execute(new SQLQuery(`DROP TABLE IF EXISTS [${t}]`), undefined, 
                (_, error) => console.error(`Error deleting table "${t}"`, error)
            );
        });
    }

    protected createTables(): void {
        TABLES.forEach(t => {
            this.execute(new SQLQuery(t), undefined, 
                (_, error) => console.error(`Error creating table with query: "${t}"`, error)
            );
        });        
    }

}

