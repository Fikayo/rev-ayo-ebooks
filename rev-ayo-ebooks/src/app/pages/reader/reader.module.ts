import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { ReaderRoutingModule } from "./reader-routing.module";
import { ReaderPage } from "./reader.page";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,        
        PdfViewerModule,
        ReaderRoutingModule,
    ],
    declarations: [ReaderPage]
  })
  export class ReaderModule {}
  