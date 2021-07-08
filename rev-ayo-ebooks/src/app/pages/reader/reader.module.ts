import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { ReaderRoutingModule } from "./reader-routing.module";
import { ReaderComponent } from "./reader.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule, 
        FormsModule,        
        NgxExtendedPdfViewerModule,
        PdfViewerModule,
        ReaderRoutingModule,
    ],
    declarations: [ReaderComponent],
    // exports: [ReaderComponent]
  })
  export class ReaderModule {}
  