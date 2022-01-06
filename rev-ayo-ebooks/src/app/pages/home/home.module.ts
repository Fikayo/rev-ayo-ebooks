import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ComponentsModule } from "src/app/components/components.module";
import { HomeRoutingModule } from "./home-routing.module";
import { HomePage } from "./home.page";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        HomeRoutingModule
    ],
    declarations: [HomePage]
  })
  export class HomeModule {}
  