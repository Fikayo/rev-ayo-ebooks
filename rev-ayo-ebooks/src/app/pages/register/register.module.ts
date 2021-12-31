import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { ComponentsModule } from "src/app/components/components.module";
import { RegisterComponent } from "./register.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        RouterModule.forChild([{ path: '', component: RegisterComponent }])
    ],
    declarations: [RegisterComponent]
  })
  export class RegisterModule {}
  