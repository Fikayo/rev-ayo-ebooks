import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { ComponentsModule } from "src/app/components/components.module";
import { SearchPage } from "./searchpage.page";

@NgModule({
    imports: [
        IonicModule,
        // BrowserModule,
        CommonModule, 
        FormsModule,
        // ReactiveFormsModule,
        RouterModule.forChild([{ path: '', component: SearchPage }]),
        ComponentsModule,
    ],
    declarations: [SearchPage],
    // exports: [SearchpageComponent]
  })
  export class SearchpageModule {}
  