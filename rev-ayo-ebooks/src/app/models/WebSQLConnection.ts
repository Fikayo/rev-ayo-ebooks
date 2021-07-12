import { Observable, Subject } from "rxjs";

export const User: string = "User";
export const UserLibrary: string = "UserLibrary";
export const UserProgress: string = "UserProgress";
const TableNames: string[] = [User, UserLibrary, UserProgress];

const TABLES: string[] = [

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
        FOREIGN KEY (UserId) REFERENCES [${User}] (UserId) ON DELETE CASCADE
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
    }

    private initDB() {
        this.db = (<any>window).openDatabase(this.name, this.version, this.displayName, this.estimatedSize);
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

    static loaded: boolean = false;

    protected deleteTables(): void {        
        TableNames.forEach(t => {
            this.execute( new SQLQuery(`DROP TABLE IF EXISTS [${t}]`));
        });
    }

    protected createTables(): void {

        TABLES.forEach(t => {
            this.execute(new SQLQuery(t));
        });
        
    }

    public prefetchData() {
        this.loadData();
    }

    private loadData(): void {
        if (EbooksSQL.loaded) return;

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

        console.debug("loading data: ", JSON.stringify(myBooks), JSON.stringify(wishlist))

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
                                EbooksSQL.loaded = true;
                                console.debug("done loading");
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

