import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EbookRoutingModule } from './ebook-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { BookstoreService } from './services/bookstore/bookstore.service';
import { UserService } from './services/user/user.service';
import { SettingsPage } from './pages/settings/settings.page';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
    declarations: [
        AppComponent,
        SettingsPage,
    ],
    entryComponents: [],
    imports: [ 
        SuperTabsModule.forRoot(),
        IonicModule.forRoot(), 

        HttpClientModule,
        BrowserAnimationsModule,
        EbookRoutingModule,
        // ReactiveFormsModule,
        
    ],
    
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        BookstoreService,
        UserService,
        InAppPurchase2,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}

