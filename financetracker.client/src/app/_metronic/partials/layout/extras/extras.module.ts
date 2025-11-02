import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {InlineSVGModule} from 'ng-inline-svg-2';
import {NotificationsInnerComponent} from './dropdown-inner/notifications-inner/notifications-inner.component';
import {QuickLinksInnerComponent} from './dropdown-inner/quick-links-inner/quick-links-inner.component';
import {UserInnerComponent} from './dropdown-inner/user-inner/user-inner.component';
import { LayoutScrollTopComponent } from './scroll-top/scroll-top.component'; 
import {SearchResultInnerComponent} from "./dropdown-inner/search-result-inner/search-result-inner.component";
import {NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SharedModule } from "../../../shared/shared.module";
import { TooltipModule } from 'primeng/tooltip';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [
    NotificationsInnerComponent,
    QuickLinksInnerComponent,
    SearchResultInnerComponent,
    UserInnerComponent,
    LayoutScrollTopComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    InlineSVGModule,
    RouterModule, 
    NgbTooltipModule,
    SharedModule,
    ToastModule,
    TooltipModule,
    BlockUIModule,
    ProgressSpinnerModule,

  ],
  providers: [
    MessageService
  ],
  exports: [
    NotificationsInnerComponent,
    QuickLinksInnerComponent,
    SearchResultInnerComponent,
    UserInnerComponent,
    LayoutScrollTopComponent,
  ],
})
export class ExtrasModule {
}
