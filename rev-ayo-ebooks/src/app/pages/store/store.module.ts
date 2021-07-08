import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { BooksetComponentModule } from "src/app/components/bookset/bookset.module";
import { StoreRoutingModule } from "./store-routing.module";
import { StoreComponent } from "./store.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        BooksetComponentModule,
        StoreRoutingModule,
    ],
    declarations: [StoreComponent],
    // exports: [StoreComponent]
  })
  export class StoreModule {}
  