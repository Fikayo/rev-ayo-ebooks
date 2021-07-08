import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SettingsComponent } from "./settings.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
    ],
    declarations: [SettingsComponent],
    // exports: [SettingsComponent]
  })
  export class SettingsComponentModule {}
  