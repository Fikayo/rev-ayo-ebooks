import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { EbooksSQL, SQLQuery, Transaction } from 'src/app/models/WebSQLConnection';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));

const bootstrap = () => {
  platformBrowserDynamic().bootstrapModule(AppModule);
};

if (typeof window['cordova' as any] !== 'undefined') {
    document.addEventListener('deviceready', deviceReady, false);
} else {
    deviceReady();
}


function deviceReady() {
    console.log("device is ready");
    bootstrap();
    registerUser();
}

function registerUser() {
    let sql = new EbooksSQL();
    sql.runTransaction((tx: Transaction) => {
        let query = new SQLQuery(`SELECT UserId FROM User`);
        tx.executeSql(query.sql, query.params, 
            (_, results: any) => {
                console.debug("results", results);
                if (results.rows.length == 0) {
                    let userID = `${uuidv4()}user`;
                    insertUserID(tx, userID);
                }            
            },
            
            (_, error) => {
                let err = `Reading useriD from User table: ${error.message}`;
                console.error(err);
            }
        );      
    });

    sql.PRELOADTESTDATA();
}

function insertUserID(tx: Transaction, userID: string) {
    console.log("inserting user", userID);

    let query = new SQLQuery(`INSERT INTO User (UserId) VALUES (?)`, [userID]);
    tx.executeSql(query.sql, query.params,
        (_, __) => { },
        (_, error) => {
            let err = `Writing new userID ${userID} to User table: ${error.message}`;
            console.error(err);
        }
    );  
    
    query = new SQLQuery(`INSERT INTO UserLibrary (UserId) VALUES (?)`, [userID]);
    tx.executeSql(query.sql, query.params,
        (_, __) => { },
        (_, error) => {
            let err = `Writing new userID ${userID} to UserLibrary table: ${error.message}`;
            console.error(err);
        }
    );  
}