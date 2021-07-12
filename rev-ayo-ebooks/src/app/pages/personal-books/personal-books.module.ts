import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { BooksetComponentModule } from "src/app/components/bookset/bookset.module";
import { PersonalBooksComponent } from "./personal-books.component";
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        BooksetComponentModule,
        RouterModule.forChild([{path: '', component: PersonalBooksComponent}]),
        // SuperTabsModule,
        SuperTabsModule.forRoot(),
    ],
    declarations: [PersonalBooksComponent],
    // exports: [PersonalBooksComponent]
  })
  export class PersonalBooksModule {}
  