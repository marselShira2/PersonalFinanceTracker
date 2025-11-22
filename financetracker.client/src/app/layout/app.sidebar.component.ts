import { Component, ElementRef, Output, EventEmitter } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";
import { Router } from '@angular/router';


@Component({
    selector: 'app-sidebar',
    templateUrl: './app.sidebar.component.html',
    styleUrls: ['./app.sidebar.component.css']
})
export class AppSidebarComponent {
  @Output() openTransaction = new EventEmitter<void>();

  constructor(public layoutService: LayoutService, public el: ElementRef, private router: Router) { }
  redirectToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

