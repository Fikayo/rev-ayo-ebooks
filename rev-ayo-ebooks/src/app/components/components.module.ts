import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartComponent } from './start/start.component';
import { LogoComponent } from './logo/logo.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SearchbuttonComponent } from './searchbutton/searchbutton.component';
import { BooksetComponent } from './bookset/bookset.component';



@NgModule({
  declarations: [
    StartComponent,
    LogoComponent,
    SearchbuttonComponent,
    BooksetComponent,
  ],
  exports: [
    StartComponent,
    LogoComponent,    
    SearchbuttonComponent,
    BooksetComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ]
})
export class ComponentsModule { }
