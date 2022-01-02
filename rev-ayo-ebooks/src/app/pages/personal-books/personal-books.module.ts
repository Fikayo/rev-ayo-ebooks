import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { BooksetComponentModule } from "src/app/components/bookset/bookset.module";
import { PersonalBooksPage } from "./personal-books.component";
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        BooksetComponentModule,
        RouterModule.forChild([{path: '', component: PersonalBooksPage}]),
        // SuperTabsModule,
        SuperTabsModule.forRoot(),
    ],
    declarations: [PersonalBooksPage],
    // exports: [PersonalBooksComponent]
  })
  export class PersonalBooksModule {}
  