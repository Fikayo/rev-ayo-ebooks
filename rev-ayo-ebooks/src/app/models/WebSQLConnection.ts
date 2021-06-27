import { Observable, Subject } from "rxjs";

const TABLES: string[] = [`

    CREATE TABLE IF NOT EXISTS [User] (
        UserId STRING NOT NULL,
        PRIMARY KEY (UserId)
    );`,

    `CREATE TABLE IF NOT EXISTS [UserLibrary] (
        [UserId] STRING NOT NULL UNIQUE,
        [Books] TEXT,
        [Wishlist] TEXT,
        FOREIGN KEY (UserId) REFERENCES [User] (UserId) ON DELETE CASCADE
    );`

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

    public executeTx(sqlQuery: SQLQuery, successCB?: (tx: any, result: any) => void, errorCB?: (error: any) => void) {
        this.batchTx([sqlQuery], successCB, errorCB);
    }

    public batchTx(sqlQueries: SQLQuery[], successCB?: (tx: any, result: any) => void, errorCB?: (tx: any, error: any) => void) {
        
        let noErrorCb = errorCB == null;
        try {
            this.db.transaction(function (tx: { executeSql: (arg0: string, arg1: any[] | undefined, arg2: ((tx: any, result: any) => void) | undefined, arg3: ((tx: any, error: any) => void) | undefined) => void; }) {

                for(let sqlQuery of sqlQueries) {


                    if (noErrorCb) {
                        errorCB = (tx, error) => {
                            console.error(`Error during sql ${sqlQuery.sql}, ${sqlQuery.params}: `, error);
                        }
                    }

                    tx.executeSql(sqlQuery.sql, sqlQuery.params, successCB, errorCB);
                }
            });

        } catch(e) {
            console.error("Error during db transaction: ", e);
        }
    }
} 


export class EbooksSQL extends WebSQLConnection {

    protected deleteTables(): void {
        let queries: SQLQuery[] = [
            new SQLQuery(`DROP TABLE IF EXISTS [User]`),
            new SQLQuery(`DROP TABLE IF EXISTS [UserLibrary]`),
        ];

        this.batchTx(queries);
    }

    protected createTables(): void {
        // this.deleteTables();

        TABLES.forEach(t => {
            this.executeTx(new SQLQuery(t));
        });

        // this.loadData();
    }

    private loadData(): void {
        // let queries: SQLQuery[] = [
        //     new SQLQuery(`INSERT INTO [User] (UserId) VALUES ('fikayoid123')`),
        //     new SQLQuery(`INSERT INTO [UserLibrary] (UserId, Books, Wishlist) VALUES ('fikayoid123', 'unknown', '975-978-57020-4-0')`),
        // ];

        // this.batchTx(queries);

        this.executeTx(new SQLQuery(`INSERT INTO [User] (UserId) VALUES ('fikayoid123')`));
        this.executeTx(new SQLQuery(`INSERT INTO [UserLibrary] (UserId, Books, Wishlist) VALUES ('fikayoid123', 'unknown, unknown', '975-978-57020-4-0, 975-978-57020-4-0')`));
    }

}

