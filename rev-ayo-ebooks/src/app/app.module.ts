import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BookSelectorComponent } from './pages/book-selector/book-selector.component';
import { EbookRoutingModule } from './ebook-routing.module';
import {MatGridListModule} from '@angular/material/grid-list';

@NgModule({
  declarations: [
    AppComponent,
    BookSelectorComponent
  ],
  imports: [
    // Angular Material Modules
    MatGridListModule,

    BrowserModule,
    EbookRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
