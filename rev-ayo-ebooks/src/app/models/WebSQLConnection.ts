export const DBState: string = "DBState";
export const User: string = "User";
export const UserPurchased: string = "UserPurchased";
export const UserWishlist: string = "UserWishlist";
export const UserProgress: string = "UserBookProgress";
export const Books: string = "Books";
export const Products: string = "Products";
export const BookProducts: string = "BookProducts";
const TableNames: string[] = [DBState, User, UserPurchased, UserWishlist, UserProgress, Books];

export const BookTable = {
    BookId: "BookId",
    Title: "Title",
    DisplayName: "DisplayName",
    Author: "Author",
    Description: "Description",
    GCSLocation: "DataSource",
}

export const ProductTable = {
    ProductId: "ProductId",
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

    `CREATE TABLE IF NOT EXISTS [${UserPurchased}] (
        [UserId] STRING NOT NULL,
        [BookId] STRING NOT NULL,
        FOREIGN KEY (UserId) REFERENCES [${User}] (UserId) ON DELETE CASCADE,
        FOREIGN KEY (BookId) REFERENCES [${Books}] (BookId) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS [${UserWishlist}] (
        [UserId] STRING NOT NULL,
        [BookId] STRING NOT NULL,
        FOREIGN KEY (UserId) REFERENCES [${User}] (UserId) ON DELETE CASCADE,
        FOREIGN KEY (BookId) REFERENCES [${Books}] (BookId) ON DELETE CASCADE
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
        [${BookTable.GCSLocation}] STRING NOT NULL,
        PRIMARY KEY (${BookTable.BookId}),
    );`,

    `CREATE TABLE IF NOT EXISTS [${Products}] (
        [ProductID] STRING NOT NULL,
        [PriceNaira] STRING NOT NULL,
        [PriceWorld] STRING NOT NULL,
        PRIMARY KEY (ProductID)
    );`,

    `CREATE TABLE IF NOT EXISTS [${BookProducts}] (
        [BookID] STRING NOT NULL,
        [ProductID] STRING NOT NULL,
        FOREIGN KEY (ProductId) REFERENCES [${Products}] (ProductId) ON DELETE CASCADE,
        FOREIGN KEY (BookId) REFERENCES [${Books}] (${BookTable.BookId})
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

