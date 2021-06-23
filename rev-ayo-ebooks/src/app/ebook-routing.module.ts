import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { BookSelectorComponent } from './pages/book-selector/book-selector.component';
import { ReaderComponent } from './pages/reader/reader.component';

const routes: Routes = [

    { path: 'search', component: BookSelectorComponent},
    { path: 'details/:isbn', component:BookDetailsComponent},
    { path: 'read/:isbn', component:ReaderComponent},
    { path: 'home/', redirectTo: 'search' },
    { path: '**', redirectTo: 'search' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class EbookRoutingModule { }