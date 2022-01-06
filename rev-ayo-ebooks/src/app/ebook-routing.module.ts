import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [

    { 
        path: '', 
        loadChildren:() => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) 
    },
    { 
        path: 'books', 
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) 
    },    
    { 
        path: 'searchpage', 
        loadChildren:() => import('./pages/searchpage/searchpage.module').then(m => m.SearchpageModule) 
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class EbookRoutingModule { }