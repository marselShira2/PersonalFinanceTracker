import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

/* Metronic & ng-bootstrap */
import { DrawersModule, DropdownMenusModule, ModalsModule, EngagesModule } from '../partials';
import { ThemeModeModule } from '../partials/layout/theme-mode-switcher/theme-mode.module';
import {
  NgbDropdownModule,
  NgbProgressbarModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

/* PrimeNG Modules (shortened for clarity) */
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

/* Layout Components (✅ use your actual folder structure here) */
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';

import { DashboardComponent } from '../../../app/pages/dashboard/dashboard.component';

/* Optional Shared */
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [] // Add routes later
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule,
    SharedModule,

    /* Metronic Modules */
    DrawersModule,
    DropdownMenusModule,
    ModalsModule,
    EngagesModule,
    ThemeModeModule,

    /* ng-bootstrap */
    NgbDropdownModule,
    NgbProgressbarModule,
    NgbTooltipModule,

    /* PrimeNG */
    TableModule,
    ButtonModule,
    ToastModule
  ],
  exports: [RouterModule],
  providers: [CookieService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LayoutModule { }
