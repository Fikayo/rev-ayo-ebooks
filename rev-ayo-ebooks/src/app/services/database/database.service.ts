import { Injectable } from '@angular/core';
import { EbooksSQL, SQLQuery } from 'src/app/models/WebSQLConnection';

const DBExpiry = 1000 * 60 * 30 // 30 mninutes;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
    private readonly sql: EbooksSQL;
    private readonly lastTableUpdate: Map<string, Date>;

    constructor() {
        this.sql = new EbooksSQL();
        this.lastTableUpdate = this.fetchLastUpdateTime();
    }

    public get expiryDuration(): number {
        return DBExpiry;
    }

    public expired(table: string): boolean {
        const now = new Date();
        let lastDBupdate = this.lastTableUpdate.get(table);
        if (!lastDBupdate) {
            lastDBupdate = new Date(now.valueOf() - DBExpiry - 10)
        }

        const duration = now.valueOf() - lastDBupdate.valueOf();
        const expired = duration > DBExpiry;
        if (expired) {
            console.info(`Table '${table}' Expired. API Refresh required!`);
        }

        return expired;
    }

    public updateLastUpdateTime(table: string) {
        const now = new Date();
        localStorage.setItem(`lastUpdate-${table}`,  now.toUTCString());
        this.lastTableUpdate.set(table, now);

        console.info(`Updating ${table} Refresh time to `, now);
    }

    public async fetch(table: string, conditions?: any): Promise<any> {        
        let query = `SELECT * FROM ${table}`;
        let condValues: string[] = [];
        if (conditions) {
            query += " WHERE "
            const columns = Object.keys(conditions);
            condValues = Object.values(conditions);
            const conds: string[] = [];
            columns.forEach(col => {
                conds.push(`${col}=?`);
            });
        
            query += conds.join(" AND ")
        }

        return new Promise((resolve, reject) => {
            this.sql.execute(new SQLQuery(query, ...condValues),
                (_, results: any) => {
                    console.debug("fetch results", results);
                    let data: any | undefined;
                    if (results.rows && results.rows.length > 0) {
                        data = [];
                        for (const b of results.rows) {
                            data.push(b);
                        }
                    }

                    resolve(data);
                },

                (_, error) => {
                    console.error(`Error fetching data from local db: query: ${query}`, error);
                    reject(error) ;
                }
            );
        });
    }

    public async insert(table: string, data: any): Promise<void> {
        const columns = Object.keys(data);
        const values = Object.values(data);

        const query = new SQLQuery(`
            INSERT INTO ${table} (${columns}) VALUES (${'?, '.repeat(columns.length - 1)}?);
        `, ...values);
        
        await this.updatedb(query);
    }

    public async update(table: string, data: any, conditions: any): Promise<void> {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const pairs: any[] = [];
        columns.forEach(c => {
            pairs.push(`${c}=?`);
        })

        
        const condColumns = Object.keys(conditions);
        const condValues = Object.values(conditions);
        const conds: string[] = [];
        condColumns.forEach(col => {
            conds.push(`${col}=?`);
        });

        let query = `UPDATE ${table} SET ${pairs.join(",")} WHERE ${conds.join(" AND ")};`;

        return new Promise(async (resolve, reject) => {            
            this.updatedb(new SQLQuery(query, ...values, ...condValues))
            .then(_ => resolve())
            .catch(error => {
                console.debug(`update error during ${query}:`, error);
                // Try to insert instead
                this.insert(table, data)
                .then(_ => resolve())
                .catch(err => reject(err));
            });
        });
    }

    public async delete(table: string, conditions?: any): Promise<void> {        
        let query = `DELETE FROM ${table}`;
        if (conditions) {
            query += " WHERE "
            const columns = Object.keys(conditions);
            const conds: string[] = [];
            columns.forEach(col => {
                conds.push(`{${col}=${conditions[col]}}`);
            });
        
            query += conds.join(" AND ")
        }

        return this.updatedb(new SQLQuery(query), true);
    }

    private fetchLastUpdateTime(): Map<string, Date> {
        const prefix = 'lastUpdate-';

        const updates: Map<string, Date> = new Map()
        let i = 0;
        let key: string | null = "";
        while (key !== null) {
            key = localStorage.key(i++);
            if (key?.startsWith(prefix)) {
                const update = localStorage.getItem(key);
                const tableName = key.replace(prefix, '');
                updates.set(tableName, new Date(update as string))
            }
        }
    
        return updates;
    }

    private async updatedb(query: SQLQuery, ignoreAffectedRows = false): Promise<void> {
        return new Promise((resolve, reject) => {            
            this.sql.execute(query, 
                (_, results: any) => {
                    console.debug("updatedb results", results, "ignore affected rows", ignoreAffectedRows);
                    if (ignoreAffectedRows) resolve();
                    
                    if (results.rowsAffected <= 0) {
                        reject('no rows updated');
                        return;                  
                    } 

                    resolve();
                },

                (_, error) => {
                    console.error(`Error while updating table: ${query}: `, error);
                    reject(error);
                }
            );
        });
    }
}
