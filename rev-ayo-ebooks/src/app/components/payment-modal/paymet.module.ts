import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { PaymentModal } from "./payment-modal.component";

@NgModule({
    imports: [
        CommonModule, 
        IonicModule,
        FormsModule,
    ],    
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [PaymentModal],
    entryComponents: [PaymentModal],
    exports: [PaymentModal]
  })
  export class PaymentModule {}
  