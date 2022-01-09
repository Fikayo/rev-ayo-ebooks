import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartComponent } from './start/start.component';
import { LogoComponent } from './logo/logo.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SearchbuttonComponent } from './searchbutton/searchbutton.component';
import { BooksetComponentModule } from './bookset/bookset.module';



@NgModule({
  declarations: [
    StartComponent,
    LogoComponent,
    SearchbuttonComponent,
    BooksetComponentModule,
  ],
  exports: [
    StartComponent,
    LogoComponent,    
    SearchbuttonComponent,
    BooksetComponentModule,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ]
})
export class ComponentsModule { }
