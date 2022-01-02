import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SettingsPage } from "./settings.page";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
    ],
    declarations: [SettingsPage],
    // exports: [SettingsComponent]
  })
  export class SettingsComponentModule {}
  