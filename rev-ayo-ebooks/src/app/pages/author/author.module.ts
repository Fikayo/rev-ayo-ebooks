import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ComponentsModule } from "src/app/components/components.module";
import { AuthorRoutingModule } from "./author-routing.module";
import { AuthorPage } from "./author.page";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,
        ComponentsModule,
        AuthorRoutingModule
    ],
    declarations: [AuthorPage]
  })
  export class AuthorModule {}
  