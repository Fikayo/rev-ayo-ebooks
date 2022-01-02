import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [

    { path: 'searchpage', loadChildren:() => import('./pages/searchpage/searchpage.module').then(m => m.SearchpageModule) },
    { path: 'welcome', loadChildren:() => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) },
    { path: '', loadChildren: () => import('./components/bottom-menu/bottom-menu.module').then(m => m.BottomMenuModule) }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class EbookRoutingModule { }