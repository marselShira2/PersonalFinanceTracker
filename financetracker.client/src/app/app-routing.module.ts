import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layout components
import { LayoutComponent } from './_metronic/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';



const routes: Routes = [
  // ✅ Main app layout (with sidebar, header, footer)
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent }
    ],
  },

  // ✅ Auth layout (no sidebar/header/footer)
  //{
  //  path: 'auth',
  //  component: AuthLayoutComponent,
  //  children: [
  //    { path: 'login', component: LoginComponent },
  //    { path: 'register', component: RegisterComponent },
  //  ],
  //},

  //// ✅ Wildcard route (404)
  //{ path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
