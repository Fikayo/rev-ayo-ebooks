export const DBAdmin: string = "DBAdmin";
export const UserTable: string = "User";
export const PurchasedTable: string = "Purchased";
export const WishlistTable: string = "Wishlist";
export const BookProgressTable: string = "BookProgress";
export const BooksTable: string = "Books";
const TableNames: string[] = [UserTable, PurchasedTable, WishlistTable, BookProgressTable, BooksTable];

const EBOOKS_DB_VERSION = "1.01";

export const BookTable = {
    BookId: "BookId",
    Title: "Title",
    DisplayName: "DisplayName",
    Author: "Author",
    Description: "Description",
    AboutBook: "AboutBook",
    ImageSource: "ImageSource",
    FileSource: "FileSource",
    ProductId: "ProductId",
    PriceNaira: "PriceNaira",
    PriceWorld: "PriceWorld",
    Group: "ViewGroup",
}

const DBAdminCreateQuery = 
`CREATE TABLE IF NOT EXISTS [${DBAdmin}] (
    [DBVersion] varchar(50) NOT NULL,
    [TableNames] STRING NOT NULL,
    PRIMARY KEY (DBVersion)
);`

const TABLES: string[] = [

    `CREATE TABLE IF NOT EXISTS [${UserTable}] (
        [UserId] varchar(50) NOT NULL UNIQUE,
        [Region] varchar(20),
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
        [${BookTable.DisplayName}] STRING NOT NULL,
        [${BookTable.Author}] STRING NOT NULL,
        [${BookTable.AboutBook}] STRING NOT NULL,
        [${BookTable.ImageSource}] STRING NOT NULL,
        [${BookTable.FileSource}] STRING,
        [${BookTable.ProductId}] STRING NOT NULL,
        [${BookTable.Title}] STRING NOT NULL,
        [${BookTable.Description}] STRING NOT NULL,
        [${BookTable.PriceNaira}] STRING,
        [${BookTable.PriceWorld}] STRING,
        [${BookTable.Group}] STRING,
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
    }

    public async execute(sqlQuery: SQLQuery): Promise<any> {
        return new Promise((resolve, reject) => {
            this.runTransactionCB((tx: Transaction) => {
                tx.executeSql(sqlQuery.sql, sqlQuery.params, 
                    (tx: any, result: any) => {
                        resolve(result);
                    }, 
                    (tx: any, error: any) => {
                        reject(error);
                    });
            });
        })
    }

    private runTransactionCB(func: (tx: Transaction) => void) {
        try {
            this.db.transaction(func);
        } catch(e) {
            console.error("Error during db transaction: ", e);
        }
    }
        
    protected openDB() {
        this.db = (<any>window).openDatabase(this.dbName, this.version, this.displayName, this.estimatedSize);
        console.debug("opened db, ", this.db);
    }
} 

export class EbooksSQL extends WebSQLConnection {
      
    public async initialiseDatabase(): Promise<void> {
        console.debug("Intialising db on bootstrap");
        
        try {
            await this.execute(new SQLQuery(DBAdminCreateQuery));  
            await this.checkVersion();          
        } catch (error) {
            console.error("Error during db initialisation", error);
            return Promise.reject(error);            
        }
    }  

    public purgeData() {
        this.deleteTables(TableNames);
    }

    private async checkVersion(): Promise<void>{
        let existingVersion = '';
        let existingTables = '';
        try {
            const results = await this.execute(new SQLQuery(`SELECT * FROM ${DBAdmin}`));
            if (results.rows && results.rows.length > 0) {
                existingVersion = results.rows[0]?.DBVersion;
                existingTables = results.rows[0]?.TableNames;
            }
        } catch(error) {
            console.error(`Failed to fetch DBAdmin row`, error);
            return Promise.reject(error);
        }

        try {
            console.debug("Existing Db version", existingVersion, "matches", existingVersion == EBOOKS_DB_VERSION);
            if (existingVersion != EBOOKS_DB_VERSION) {
                console.debug("Recreating all tables");
                if(existingTables) {
                    const tableNames = existingTables.split(",");
                    await this.deleteTables(tableNames);
                }

                const promises: Promise<any>[] = [];
                promises.push(this.createTables());
                const newTables = TableNames.join(",");
                if (!existingVersion) {
                    promises.push(this.execute(new SQLQuery(`INSERT INTO ${DBAdmin} (DBVersion, TableNames) VALUES (?, ?)`, EBOOKS_DB_VERSION, newTables)));
                } else {
                    promises.push(this.execute(new SQLQuery(`UPDATE ${DBAdmin} SET DBVersion=?, TableNames=?`, EBOOKS_DB_VERSION, newTables)));
                }

                await Promise.all(promises);
            }
        } catch(error) {
            console.error(`Failed to Insert/Update DB version from ${existingVersion} to ${EBOOKS_DB_VERSION}`, error);
            return Promise.reject(error);
        }
    }

    private async deleteTables(tableNames: string[]): Promise<void> { 
        console.debug("Deleting tables", tableNames);
        try {
            const promises: Promise<any>[] = [];
            tableNames.forEach(t => {
                promises.push(this.execute(new SQLQuery(`DROP TABLE IF EXISTS [${t}]`)));
            });
            
            await Promise.all(promises);
        } catch (error) {
            console.error("Error while deleting tables", error);
            return Promise.reject(error);
        }

        localStorage.clear();
    }

    private async createTables(): Promise<void> {
        console.debug("Creating all tables");
        try {
            const promises: Promise<any>[] = [];
            TABLES.forEach(t => {
                promises.push(this.execute(new SQLQuery(t)));
            });
            
            await Promise.all(promises);
        } catch (error) {
            console.error("Error while creating tables", error);
            return Promise.reject(error);
        }
    }  

}

