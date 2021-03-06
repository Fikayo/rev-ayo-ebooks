import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomePage } from './welcome.page';

const routes: Routes = [
    {
        path: '',
        component: WelcomePage
    },
    {
        path: 'login',
        loadChildren: () => import('../login/login.module').then(m => m.LoginModule)
    },
    {
        path: 'register',
        loadChildren: () => import('../register/register.module').then(m => m.RegisterModule)
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WelcomeRoutingModule {}