import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { BooksetComponentModule } from "src/app/components/bookset/bookset.module";
import { BookDetailsPage } from "./book-details.page";
import { DetailsRoutingModule } from "./details-routing.module";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        BooksetComponentModule,
        DetailsRoutingModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [BookDetailsPage],
  })
  export class BookDetailsModule {}
  