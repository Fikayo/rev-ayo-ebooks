export const User: string = "User";
export const Purchased: string = "Purchased";
export const Wishlist: string = "Wishlist";
export const BookProgress: string = "BookProgress";
export const Books: string = "Books";
const TableNames: string[] = [User, Purchased, Wishlist, BookProgress, Books];

export const BookTable = {
    BookId: "BookId",
    Title: "Title",
    DisplayName: "DisplayName",
    Author: "Author",
    Description: "Description",
    DataSource: "DataSource",
    ProductId: "ProductId",
    PriceNaira: "PriceNaira",
    PriceWorld: "PriceWorld",
}

const TABLES: string[] = [

    `CREATE TABLE IF NOT EXISTS [${User}] (
        [UserId] varchar(50) NOT NULL UNIQUE,
        PRIMARY KEY (UserId)
    );`,
    
    `CREATE TABLE IF NOT EXISTS [${Purchased}] (
        [BookId] varchar(50) NOT NULL UNIQUE,
        FOREIGN KEY (BookId) REFERENCES [${Books}] (${BookTable.BookId})
    );`,

    `CREATE TABLE IF NOT EXISTS [${Wishlist}] (
        [BookId] varchar(50) NOT NULL UNIQUE,
        FOREIGN KEY (BookId) REFERENCES [${Books}] (${BookTable.BookId})
    );`,

    `CREATE TABLE IF NOT EXISTS [${BookProgress}] (
        [BookId] STRING NOT NULL UNIQUE,
        [CurrentPage] INT NOT NULL,
        FOREIGN KEY (BookId) REFERENCES [${Books}] (${BookTable.BookId})
    );`,

    `CREATE TABLE IF NOT EXISTS [${Books}] (
        [${BookTable.BookId}] varchar(50) NOT NULL,
        [${BookTable.Title}] STRING NOT NULL,
        [${BookTable.DisplayName}] STRING NOT NULL,
        [${BookTable.Author}] STRING NOT NULL,
        [${BookTable.Description}] STRING NOT NULL,
        [${BookTable.DataSource}] STRING NOT NULL,
        [${BookTable.ProductId}] STRING NOT NULL,
        [${BookTable.PriceNaira}] STRING NOT NULL,
        [${BookTable.PriceWorld}] STRING NOT NULL,
        PRIMARY KEY (${BookTable.BookId})
    );`,

];

export class SQLQuery
{
    public sql: string;
    public params: any[] | undefined = [];

    constructor(sql: string, ...params: any[]) {
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
        this.openDB();
        this.createTables();
    }

    private openDB() {
        this.db = (<any>window).openDatabase(this.name, this.version, this.displayName, this.estimatedSize);
        console.log("opened db, ", this.db);
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
            this.execute(new SQLQuery(`DROP TABLE IF EXISTS [${t}]`), undefined, 
                (_, error) => console.error(`Error deleting table "${t}"`, error)
            );
        });
    }

    protected createTables(): void {
        this.deleteTables();
        TABLES.forEach(t => {
            this.execute(new SQLQuery(t), undefined, 
                (_, error) => console.error(`Error creating table with query: "${t}"`, error)
            );

            console.log(t);
        });        
    }

}

