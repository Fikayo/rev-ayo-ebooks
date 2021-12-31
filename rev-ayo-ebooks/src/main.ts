import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { EbooksSQL, SQLQuery, Transaction } from 'src/app/models/WebSQLConnection';
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

    // const sql = new EbooksSQL();
    // const userID = "2259d5fe-cea4-4547-9681-03cc5fb72d8auser";
    // sql.execute(new SQLQuery(`INSERT INTO User (UserId) Values (?)`, userID));
}