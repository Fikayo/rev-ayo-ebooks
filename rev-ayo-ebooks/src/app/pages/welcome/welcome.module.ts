import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InAppPurchase2 } from "@ionic-native/in-app-purchase-2/ngx";
import { IonicModule } from "@ionic/angular";
import { ComponentsModule } from "src/app/components/components.module";
import { StoreService } from "src/app/services/store/store.service";
import { WelcomeRoutingModule } from "./welcome-routing.module";
import { WelcomePage } from "./welcome.page";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        WelcomeRoutingModule
    ],
    providers: [
        StoreService,
        InAppPurchase2,
    ],
    declarations: [WelcomePage]
  })
  export class WelcomeModule {}
  