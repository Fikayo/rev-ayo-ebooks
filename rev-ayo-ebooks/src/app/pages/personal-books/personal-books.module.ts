import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { PersonalBooksPage } from "./personal-books.page";
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { RouterModule } from "@angular/router";
import { ComponentsModule } from "src/app/components/components.module";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        RouterModule.forChild([{path: '', component: PersonalBooksPage}]),
        // SuperTabsModule,
        SuperTabsModule.forRoot(),
    ],
    declarations: [PersonalBooksPage],
    // exports: [PersonalBooksComponent]
  })
  export class PersonalBooksModule {}
  