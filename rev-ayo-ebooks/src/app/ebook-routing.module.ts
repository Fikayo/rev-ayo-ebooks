import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { StoreComponent } from './pages/store/store.component';
import { PersonalBooksComponent } from './pages/personal-books/personal-books.component';
import { ReaderComponent } from './pages/reader/reader.component';
import { SearchpageComponent } from './pages/searchpage/searchpage.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';

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