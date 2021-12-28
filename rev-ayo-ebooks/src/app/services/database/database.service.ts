import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonSQLite } from '@capacitor-community/sqlite';
import { Plugins } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { NpmBuildCLI } from '@ionic/cli/lib/build';
import { BehaviorSubject } from 'rxjs';
import { EbooksSQL, SQLQuery } from 'src/app/models/WebSQLConnection';
const {CapacitorSQLite, Device, Storage}  = Plugins;

const DBExpiry = 1000 * 60 * 30 // 30 mninutes;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
    private lastDBupdate: Date;
    private sql: EbooksSQL;

    constructor() {
        this.sql = new EbooksSQL();
        this.lastDBupdate = this.fetchLastUpdateTime();
    }

    public get expired(): boolean {
        const duration = new Date().valueOf() - this.lastDBupdate.valueOf();
        return duration > DBExpiry;
    }

    public updateLastUpdateTime() {
        const now = new Date();
        localStorage.setItem('lastUpdate',  now.toUTCString());
        this.lastDBupdate = now;
    }

    public async fetch(table: string, conditions?: any): Promise<any> {        
        let query = `SELECT * FROM ${table}`;
        if (conditions) {
            query += " WHERE "
            const columns = Object.keys(conditions);
            const conds: string[] = [];
            columns.forEach(col => {
                conds.push(`{${col}=${conditions[col]}}`);
            });
        
            query += conds.join(" AND ")
        }

        return new Promise((resolve, reject) => {
            this.sql.execute(new SQLQuery(query),
                (_, results: any) => {
                    console.debug("results", results);
                    let data: any | undefined;
                    if (results.rows) {
                        data = results.rows;
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
        
        return this.updatedb(query);
    }

    public async update(table: string, data: any): Promise<void> {
        const columns = Object.keys(data);
        const values = Object.values(data);

        const query = new SQLQuery(`
            INSERT INTO ${table} (${columns}) VALUES (${'?, '.repeat(columns.length - 1)}?);
        `, ...values);
        
        return this.updatedb(query);
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

        return this.updatedb(new SQLQuery(query));
    }

    private fetchLastUpdateTime(): Date {
        const update = localStorage.getItem('lastUpdate');
        if (!update) {
            return new Date();
        }

        return new Date(update);
    }

    private async updatedb(query: SQLQuery): Promise<void> {
        return new Promise((resolve, reject) => {            
            this.sql.execute(query, 
                (_, results: any) => {
                    if (results.rows.length > 0) {
                        resolve();                   
                    } else {
                        reject('nothing updated');
                    }
                }
            );
        });
    }
}
