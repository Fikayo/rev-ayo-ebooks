import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatTabsModule } from "@angular/material/tabs";
import { IonicModule } from "@ionic/angular";
import { BooksetComponentModule } from "src/app/components/bookset/bookset.module";
import { PersonalBooksComponent } from "./personal-books.component";
import { PersonalRoutingModule } from "./personal-routing.module";
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        BooksetComponentModule,
        // MatTabsModule,
        PersonalRoutingModule,
        // SuperTabsModule,
        SuperTabsModule.forRoot(),
    ],
    declarations: [PersonalBooksComponent],
    // exports: [PersonalBooksComponent]
  })
  export class PersonalBooksModule {}
  