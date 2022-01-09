import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { BooksetComponentModule } from "src/app/components/bookset/bookset.module";
import { ComponentsModule } from "src/app/components/components.module";
import { StoreRoutingModule } from "./store-routing.module";
import { StorePage } from "./store.page";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        StoreRoutingModule,
    ],
    declarations: [StorePage],
    // exports: [StoreComponent]
  })
  export class StoreModule {}
  