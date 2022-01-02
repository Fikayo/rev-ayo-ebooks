import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ComponentsModule } from "src/app/components/components.module";
import { WelcomeRoutingModule } from "./welcome-routing.module";
import { WelcomePage } from "./welcome.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        WelcomeRoutingModule
    ],
    declarations: [WelcomePage]
  })
  export class WelcomeModule {}
  