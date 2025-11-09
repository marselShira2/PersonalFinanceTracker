import { RouterModule, Routes, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { UserProfileComponent } from './Views/userProfile/userProfile.component';
import { authGuard } from './guards/auth.guard'; 
import { LoginComponent } from './demo/components/auth/login/login.component';
//import { Login1Component } from './demo/components/auth/login1/login1.component';
import { DashboardComponent } from './demo/components/dashboard/dashboard.component';
import { RegisterComponent } from './Views/register/register.component';
import { UserListComponent } from './Views/userList/userList.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '', component: AppLayoutComponent,
        children: [
          { path: 'dashboard', component: DashboardComponent},
          { path: 'login', component: LoginComponent },
          //{ path: 'loginCredential', component: Login1Component },
          { path: 'register', component: RegisterComponent, canActivate: [authGuard] },
          { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
          { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule), canActivate: [authGuard] },
          { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule), canActivate: [authGuard] },
          { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule), canActivate: [authGuard] },
          { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule), canActivate: [authGuard] },
          { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule), canActivate: [authGuard] },
          { path: 'userProfile', component: UserProfileComponent, canActivate: [authGuard] },
          { path: 'usersList', component: UserListComponent, canActivate: [authGuard] },
          { path: 'register', component: RegisterComponent, canActivate: [authGuard] },
       
        ]
      },
      { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
      { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
      { path: 'notfound', component: NotfoundComponent },
      { path: '**', redirectTo: '/notfound' },
    ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  private startTime!: number;
  private endTime!: number;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.startTime = performance.now();  // Start tracking
      }

      if (event instanceof NavigationEnd) {
        this.endTime = performance.now();
        console.log("Page Load: " + ((this.endTime - this.startTime) / 1000));
        const loadTimeSec = ((this.endTime - this.startTime) / 1000).toFixed(3);

        // Update the shared service with the load time
      }
    });
  }
}
