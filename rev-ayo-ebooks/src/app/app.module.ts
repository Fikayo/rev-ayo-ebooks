import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as hammer from 'hammerjs';


import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreComponent } from './pages/store/store.component';
import { EbookRoutingModule } from './ebook-routing.module';
import { MatGridListModule } from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import { ReaderComponent } from './pages/reader/reader.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { BooksetComponent } from './components/bookset/bookset.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BookstoreService } from './services/bookstore/bookstore.service';
import {MatListModule} from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { PersonalBooksComponent } from './pages/personal-books/personal-books.component';
import {MatTabsModule} from '@angular/material/tabs';
import { UserService } from './services/user/user.service';
import {MatSidenavModule} from '@angular/material/sidenav';
import { HammerModule } from '@angular/platform-browser';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { SearchpageComponent } from './pages/searchpage/searchpage.component';
import {MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { PaymentModal } from './components/payment-modal/payment-modal.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
    declarations: [
        AppComponent,

        SettingsDialogComponent,
        SettingsComponent,
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

