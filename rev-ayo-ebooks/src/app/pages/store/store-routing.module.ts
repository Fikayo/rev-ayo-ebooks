import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookDetailsComponent } from '../book-details/book-details.component';
import { StoreComponent } from './store.component';

const routes: Routes = [
  {
    path: '',
    component: StoreComponent,
    // children: [
    //     {
    //         path: 'details/:isbn',
    //         loadChildren: () => import('../../pages/book-details/book-details.module').then(m => m.BookDetailsComponentModule)
    //     }
    // ]
  },
  {
    path: 'details/:isbn',
    loadChildren: () => import('../../pages/book-details/book-details.module').then(m => m.BookDetailsModule)
  },
  {
    path: 'read/:isbn',
    loadChildren: () => import('../../pages/reader/reader.module').then(m => m.ReaderModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule {}