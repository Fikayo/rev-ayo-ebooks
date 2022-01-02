import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { BooksetComponentModule } from "src/app/components/bookset/bookset.module";
import { PaymentModule } from "src/app/components/payment-modal/paymet.module";
import { BookDetailsPage } from "./book-details.component";
import { DetailsRoutingModule } from "./details-routing.module";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        BooksetComponentModule,
        PaymentModule,
        DetailsRoutingModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [BookDetailsPage],
    // exports: [BookDetailsComponent]
  })
  export class BookDetailsModule {}
  