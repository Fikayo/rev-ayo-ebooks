import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BookSelectorComponent } from './pages/book-selector/book-selector.component';
import { EbookRoutingModule } from './ebook-routing.module';
import {MatGridListModule} from '@angular/material/grid-list';
import { ReadComponent } from './pages/read/read.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    BookSelectorComponent,
    ReadComponent
  ],
  imports: [
    // Angular Material Modules
    MatGridListModule,

    // PDF Reader
    NgxExtendedPdfViewerModule,

    HttpClientModule,
    BrowserModule,
    EbookRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
