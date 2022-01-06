import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
   enableProdMode();
   console.log("production mode enabled");
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
}