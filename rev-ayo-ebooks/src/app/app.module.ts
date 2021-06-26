import { NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as hammer from 'hammerjs';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: { direction: hammer.DIRECTION_HORIZONTAL },
    pinch: { enable: false },
    rotate: { enable: false }
  };
}

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BookSelectorComponent } from './pages/book-selector/book-selector.component';
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
import { SearchBarComponent } from './components/search-bar/search-bar.component';
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

@NgModule({
  declarations: [
    AppComponent,
    BookSelectorComponent,
    ReaderComponent,
    BooksetComponent,
    SearchBarComponent,
    BookDetailsComponent,
    PersonalBooksComponent,
    SearchpageComponent,
    SettingsDialogComponent,
    SettingsComponent,
  ],
  imports: [
    // Angular Material Modules
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatListModule,
    MatToolbarModule,
    MatTabsModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatDialogModule,

    // Bootstrap
    NgbModule,

    // PDF Reader
    NgxExtendedPdfViewerModule,
    PdfViewerModule,

    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    EbookRoutingModule,
    BrowserAnimationsModule,
    HammerModule
  ],
  providers: [
    BookstoreService,
    UserService,
    {provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
