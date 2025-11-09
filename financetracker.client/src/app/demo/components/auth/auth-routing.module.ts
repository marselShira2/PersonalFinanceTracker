import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { mfaGuard } from '../../../guards/auth.guard';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'error', loadChildren: () => import('./error/error.module').then(m => m.ErrorModule) },
        { path: 'access', loadChildren: () => import('./access/access.module').then(m => m.AccessModule) },
      //  { path: 'loginCredential', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
      { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
     // { path: 'login1', loadChildren: () => import('./login1/login1.module').then(m => m.Login1Module) },
        { path: 'mfa', loadChildren: () => import('./mfa/mfa.module').then(m => m.MfaModule), canActivate: [mfaGuard] },
        { path: 'passwordReset', loadChildren: () => import('./Password/passwordReset.module').then(m => m.PasswordResetModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
