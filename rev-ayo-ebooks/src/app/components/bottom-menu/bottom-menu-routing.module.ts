import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BottomMenuComponent } from './bottom-menu.component';

const routes: Routes = [    
    { 
        path: 'books',
        component: BottomMenuComponent,
        children: [
            {
                path: 'store',
                loadChildren: () => import('../../pages/store/store.module').then(m => m.StoreModule)
            },
            {
                path: 'personal',
                loadChildren: () => import('../../pages/personal-books/personal-books.module').then(m => m.PersonalBooksModule)
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
export class BottomMenuRoutingModule { }