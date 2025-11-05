import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from './../environments/environment';
import { CookieService } from 'ngx-cookie-service';
// #fake-start#
// #fake-end#

// PrimeNG imports
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

import { LayoutModule } from './_metronic/layout/layout.module';


function appInitializer() {
  return () => {
    return new Promise((resolve) => {
      //@ts-ignore
    });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    FormsModule,
    DropdownModule,
    CalendarModule,
    BrowserModule,
    BrowserAnimationsModule,
    MultiSelectModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    LayoutModule  ,
    // #fake-start#
    
    // #fake-end#npm install ngx-cookie-service@latest

    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule, 
    ToastModule,
    TableModule,
    CommonModule, 
  ],
  providers: [
    MessageService,
    PrimeNGConfig,
    CookieService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
