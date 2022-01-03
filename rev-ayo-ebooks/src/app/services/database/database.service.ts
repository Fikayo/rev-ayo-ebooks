import { Injectable } from '@angular/core';
import { EbooksSQL, SQLQuery } from 'src/app/models/WebSQLConnection';

const DBExpiry = 1000 * 3600 * 24 // 24 hours;

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

    public get maxDuration(): number {
        const oneDay = 1000 * 3600 * 24;
        return oneDay * 6;
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

        // try {
        //     const results = await this.query(query, [...condValues]);
        //     console.debug(`DB fetch ${query} results`, results);
        //     let data: any | undefined;
        //     if (results.rows && results.rows.length > 0) {
        //         data = [];
        //         for (const b of results.rows) {
        //             data.push(b);
        //         }
        //     }

        //     return data;
        // } catch (error) {
        //     console.error(`Error fetching data from local db: query: ${query}`, error);
        //     return Promise.reject(error);
        // }
        return new Promise((resolve, reject) => {
            this.sql.execute(new SQLQuery(query, ...condValues),
                (_, results: any) => {
                    console.debug(`DB fetch ${query} results`, results);
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

        let query = new SQLQuery(`UPDATE ${table} SET ${pairs.join(",")} WHERE ${conds.join(" AND ")};`, ...values, ...condValues);

        return new Promise(async (resolve, reject) => {            
            this.updatedb(query)
            .then(_ => resolve())
            .catch(error => {
                console.error(`update error during ${query}:`, error);
                // Try to insert instead.
                this.insert(table, data)
                .then(_ => resolve())
                .catch(err => reject(err));
            });
        });
    }

    public async delete(table: string, conditions?: any): Promise<void> {        
        let query = `DELETE FROM ${table}`;
        let condValues: any[] = [];
        if (conditions) {
            query += " WHERE "
            const columns = Object.keys(conditions);
            condValues = Object.values(conditions);
            const conds: string[] = [];
            columns.forEach(col => {
                const val = conditions[col];
                if (Array.isArray(val)) {
                    conds.push(`${col} IN (?)`);
                } else {
                    conds.push(`${col}=?`);
                }
            });
        
            query += conds.join(" AND ")
        }

        return this.updatedb(new SQLQuery(query, ...condValues), true);
    }

    public async query(sql: string, params: any[] | undefined): Promise<any> {
        let query = new SQLQuery(sql, params);
        return new Promise((resolve, reject) => {            
            this.sql.execute(query, 
                (_, results: any) => {  
                    console.debug(`direct query ${query} results`, results);                 
                    resolve(results);
                },

                (_, error) => {
                    console.error(`Error while performing query: ${query}: `, error, query);
                    reject(error);
                }
            );
        });
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
        // try {
        //     const results = await this.query(query.sql, query.params);
        //     console.debug(`updatedb ${query} results`, results, "ignore affected rows", ignoreAffectedRows);
        //     if (ignoreAffectedRows) return;
            
        //     if (results.rowsAffected <= 0) {
        //         return Promise.reject('no rows updated');
        //     } 
        // } catch (error) {
        //     console.error(`Error while updating table: ${query}: `, error);
        //     return Promise.reject(error);
        // }
        return new Promise((resolve, reject) => {            
            this.sql.execute(query, 
                (_, results: any) => {
                    console.debug(`updatedb ${query} results`, results, "ignore affected rows", ignoreAffectedRows);
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
