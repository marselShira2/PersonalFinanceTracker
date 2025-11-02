import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './_metronic/shared/shared.module';
import { LayoutModule } from './_metronic/layout/layout.module';
import { Dashboard } from './pages/dashboard/dashboard';
//

import { NotificationsWidget } from './pages/dashboard/components/notificationswidget';
import { StatsWidget } from './pages/dashboard/components/statswidget';
import { RecentSalesWidget } from './pages/dashboard/components/recentsaleswidget';
import { BestSellingWidget } from './pages/dashboard/components/bestsellingwidget';
import { RevenueStreamWidget } from './pages/dashboard/components/revenuestreamwidget';
@NgModule({
  declarations: [AppComponent, Dashboard],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    SharedModule,
    LayoutModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
