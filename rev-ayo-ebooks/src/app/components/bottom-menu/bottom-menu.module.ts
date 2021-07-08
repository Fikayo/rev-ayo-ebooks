import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { BottomMenuRoutingModule } from "./bottom-menu-routing.module";
import { BottomMenuComponent } from "./bottom-menu.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        BottomMenuRoutingModule,
    ],
    declarations: [BottomMenuComponent],
    // exports: [BottomMenuComponent]
  })
  export class BottomMenuModule {}
  