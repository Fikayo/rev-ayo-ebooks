import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReaderPage } from '../reader/reader.component';
import { BookDetailsPage } from './book-details.component';

const routes: Routes = [
  {
    path: '',
    component: BookDetailsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailsRoutingModule {}
