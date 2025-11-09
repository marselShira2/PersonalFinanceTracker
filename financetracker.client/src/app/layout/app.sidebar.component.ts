import { Component, ElementRef } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";
import { Router } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    templateUrl: './app.sidebar.component.html'
})
export class AppSidebarComponent {
  constructor(public layoutService: LayoutService, public el: ElementRef, private router: Router) { }
  redirectToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

