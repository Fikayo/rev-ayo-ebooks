import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookSelectorComponent } from './pages/book-selector/book-selector.component';
import { ReadComponent } from './pages/read/read.component';

const routes: Routes = [

    { path: 'home', component: BookSelectorComponent},
    { path: 'read/:bookID', component:ReadComponent},
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class EbookRoutingModule { }