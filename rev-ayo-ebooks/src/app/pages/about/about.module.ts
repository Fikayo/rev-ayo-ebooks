import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { AboutPage } from "./about.page";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        RouterModule.forChild([{path: '', component: AboutPage}]),
    ],
    declarations: [AboutPage],
  })
  export class AboutModule {}
  