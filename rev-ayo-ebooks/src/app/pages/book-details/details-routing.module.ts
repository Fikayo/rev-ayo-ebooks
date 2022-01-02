import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReaderPage } from '../reader/reader.page';
import { BookDetailsPage } from './book-details.page';

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
