import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ComponentsModule } from "src/app/components/components.module";
import { BookDetailsPage } from "./book-details.page";
import { DetailsRoutingModule } from "./details-routing.module";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        DetailsRoutingModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [BookDetailsPage],
  })
  export class BookDetailsModule {}
  