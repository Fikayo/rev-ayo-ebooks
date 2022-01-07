import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorPage } from './author.page';

const routes: Routes = [    
    { 
        path: '',
        component: AuthorPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
})
export class AuthorRoutingModule { }