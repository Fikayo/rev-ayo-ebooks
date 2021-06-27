import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { BookSelectorComponent } from './pages/book-selector/book-selector.component';
import { PersonalBooksComponent } from './pages/personal-books/personal-books.component';
import { ReaderComponent } from './pages/reader/reader.component';
import { SearchpageComponent } from './pages/searchpage/searchpage.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [

    { path: 'store', component: BookSelectorComponent},
    { path: 'details/:isbn', component:BookDetailsComponent},
    { path: 'read/:isbn', component:ReaderComponent},
    { path: 'personal', component:PersonalBooksComponent},
    { path: 'searchpage', component:SearchpageComponent},
    { path: 'settings', component:SettingsComponent},
    { path: 'home/', redirectTo: 'store' },
    { path: '**', redirectTo: 'store' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class EbookRoutingModule { }