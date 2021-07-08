import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonalBooksComponent } from './personal-books.component';

const routes: Routes = [
  {
    path: '',
    component: PersonalBooksComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalRoutingModule {}
