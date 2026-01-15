import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './interceptor/token.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DragDropModule, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { PickListModule } from 'primeng/picklist';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CookieService } from 'ngx-cookie-service';
import { UserListComponent } from './Views/userList/userList.component';
import { TabViewModule } from 'primeng/tabview';
import { TreeTableModule } from 'primeng/treetable';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu'; 
import { RegisterComponent } from './demo/components/auth/register/register.component';  
import { UserProfileComponent } from './Views/userProfile/userProfile.component';
import { SliderModule } from 'primeng/slider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BadgeModule } from 'primeng/badge';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChipModule } from 'primeng/chip';
import { BlockUIModule } from 'primeng/blockui';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessagesModule } from 'primeng/messages';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { CarouselModule } from 'primeng/carousel';
import { ProgressBarModule } from 'primeng/progressbar';
import { RouterModule } from '@angular/router';
import { InputOtpModule } from 'primeng/inputotp';
 
import { AppFooterComponent } from './layout/app.footer.component';
import { DashboardComponent } from '../../src/app/demo/components/dashboard/dashboard.component';
import { OrderListModule } from 'primeng/orderlist';

import { PasswordModule } from 'primeng/password';
import { DatePipe } from '@angular/common';
import { SpeedDialModule } from 'primeng/speeddial';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload'; 
/// 
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';  

//pages
import { TransactionsListComponent } from './Views/Transactions/transactions-list.component';
import { TransactionCalendarComponent } from './Views/transaction-calendar/transaction-calendar.component';
import { CategoryManagementComponent } from './Views/Category/category-management.component';
import { ExpenseLimitComponent } from './Views/expense-limit/expense-limit.component';
import { NotificationsPageComponent } from './Views/notifications/notifications-page.component';
import { FullCalendarModule } from '@fullcalendar/angular';


/////
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    TransactionsListComponent,
    TransactionCalendarComponent,
    CategoryManagementComponent,
    ExpenseLimitComponent,
    NotificationsPageComponent,
    AppFooterComponent,
    DashboardComponent,
    NotfoundComponent,
    UserListComponent,
    UserProfileComponent
  ],


    imports: [AppRoutingModule, OrderListModule, CarouselModule, ChartModule, FullCalendarModule,AppLayoutModule, SkeletonModule, BadgeModule, MenuModule, SplitButtonModule, TableModule, CheckboxModule, TreeTableModule, ConfirmPopupModule, ConfirmDialogModule, TabViewModule,
    DialogModule, CommonModule, ButtonModule, InputTextModule, DropdownModule, InputTextareaModule, FormsModule, ReactiveFormsModule, ToastModule, RatingModule, CardModule, TagModule, InputNumberModule, MessageModule,
    IconFieldModule, DividerModule, InputIconModule,  HttpClientModule, ToggleButtonModule, InputSwitchModule, PasswordModule, MultiSelectModule, TimelineModule, FloatLabelModule, DialogModule, InputTextModule, InputOtpModule, 
    BreadcrumbModule, RadioButtonModule, CalendarModule, PickListModule, CdkDrag, CdkDropList, DragDropModule, TooltipModule, SliderModule, RippleModule,  OverlayPanelModule,  InputOtpModule, FileUploadModule,
    ProgressSpinnerModule, SliderModule, DynamicDialogModule, MessagesModule, BrowserModule, TabMenuModule, BrowserAnimationsModule, ChipModule, SpeedDialModule, BlockUIModule, ProgressBarModule, RouterModule, TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    provideHttpClient(withInterceptors([tokenInterceptor])),
    CountryService, CustomerService, EventService, IconService, NodeService,
    PhotoService, ProductService, MessageService, ConfirmationService, CookieService, DatePipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]

})
export class AppModule { }
