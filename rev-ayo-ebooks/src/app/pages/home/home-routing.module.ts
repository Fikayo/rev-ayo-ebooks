import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [    
    { 
        path: '',
        component: HomePage,
        children: [
            {
                path: 'store',
                loadChildren: () => import('../store/store.module').then(m => m.StoreModule)
            },
            {
                path: 'personal',
                loadChildren: () => import('../personal-books/personal-books.module').then(m => m.PersonalBooksModule)
            }
        ],
    },
    {
        path: '',
        redirectTo: 'books/store',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
})
export class HomeRoutingModule { }