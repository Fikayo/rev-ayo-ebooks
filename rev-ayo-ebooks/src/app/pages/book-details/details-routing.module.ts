import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookDetailsPage } from './book-details.page';

const routes: Routes = [
    {
        path: '',
        component: BookDetailsPage,
    },
    {
        path: 'about/:isbn',
        loadChildren: () => import('../about/about.module').then(m => m.AboutModule)
    },
    {
        path: 'author',
        loadChildren: () => import('../author/author.module').then(m => m.AuthorModule)
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailsRoutingModule {}
