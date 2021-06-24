import { NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BookSelectorComponent } from './pages/book-selector/book-selector.component';
import { EbookRoutingModule } from './ebook-routing.module';
import { MatGridListModule } from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import { ReaderComponent } from './pages/reader/reader.component';
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

@NgModule({
  declarations: [
    AppComponent,
    BookSelectorComponent,
    ReaderComponent,
    BooksetComponent,
    SearchBarComponent,
    BookDetailsComponent,
    PersonalBooksComponent,
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

    // Bootstrap
    NgbModule,

    // PDF Reader
    NgxExtendedPdfViewerModule,

    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    EbookRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [
    BookstoreService,
    UserService,
    {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
