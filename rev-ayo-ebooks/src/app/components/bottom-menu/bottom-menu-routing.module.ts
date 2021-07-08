import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreComponent } from 'src/app/pages/store/store.component';
import { BottomMenuComponent } from './bottom-menu.component';

import { BookDetailsComponent } from 'src/app/pages/book-details/book-details.component';
import { PersonalBooksComponent } from 'src/app/pages/personal-books/personal-books.component';
import { ReaderComponent } from 'src/app/pages/reader/reader.component';
import { SearchpageComponent } from 'src/app/pages/searchpage/searchpage.component';
import { SettingsComponent } from 'src/app/pages/settings/settings.component';

const routes1: Routes = [

    { 
        path: 'books',
        component: BottomMenuComponent,
        children: [
            {
                path: 'store',
                component: StoreComponent,
            },
            {
                path: 'personal',
                component: PersonalBooksComponent,
            }
        ],
    },
    // { path: 'books/store', component: StoreComponent},
    { path: 'details/:isbn', component:BookDetailsComponent},
    { path: 'read/:isbn', component:ReaderComponent},
    // { path: 'books/personal', component:PersonalBooksComponent},
    { path: 'searchpage', component:SearchpageComponent},
    { path: 'settings', component:SettingsComponent},
    // { path: 'home/', redirectTo: 'store' },
    // { path: '**', redirectTo: 'store' },
];

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