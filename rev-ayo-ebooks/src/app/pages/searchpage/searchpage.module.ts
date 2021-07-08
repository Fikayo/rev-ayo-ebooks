import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { BooksetComponentModule } from "src/app/components/bookset/bookset.module";
import { SearchpageComponent } from "./searchpage.component";

@NgModule({
    imports: [
        IonicModule,
        // BrowserModule,
        CommonModule, 
        FormsModule,
        // ReactiveFormsModule,
        RouterModule.forChild([{ path: '', component: SearchpageComponent }]),
        BooksetComponentModule,
    ],
    declarations: [SearchpageComponent],
    // exports: [SearchpageComponent]
  })
  export class SearchpageModule {}
  