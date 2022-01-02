import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { ComponentsModule } from "src/app/components/components.module";
import { RegisterPage } from "./register.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        RouterModule.forChild([{ path: '', component: RegisterPage }])
    ],
    declarations: [RegisterPage]
  })
  export class RegisterModule {}
  