import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome.component';

const routes: Routes = [
    {
        path: '',
        component: WelcomeComponent,
        // children: [
        //     {
        //         path: 'login',
        //         loadChildren: () => import('../login/login.module').then(m => m.LoginModule)
        //     },
        //     {
        //         path: 'register',
        //         loadChildren: () => import('../register/register.module').then(m => m.RegisterModule)
        //     }
        // ]
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