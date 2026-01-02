import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserRoleService } from './../services/user-role.services';
import { AuthService } from '../services/auth.service';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {

  model: any[] = [];
  role: string = "";

  constructor(
    public layoutService: LayoutService,
    private translate: TranslateService,
    private cookieService: CookieService,
    private router: Router,
    private userRightsService: UserRoleService,
    private authService: AuthService,
    private primengConfig: PrimeNGConfig,
    private cdr: ChangeDetectorRef
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.layoutService.HideSideLine();
  }

  ngOnInit() {
    // --- 🎯 NEW: Call the method to load the menu items
    this.loadMenu();

    const savedLanguage = this.cookieService.get('selectedLanguage') || 'sq';
    this.translate.setDefaultLang('sq');
    this.translate.use(savedLanguage);
    this.translate.onLangChange.subscribe(() => {
    });

  }

  // --- 🎯 NEW: Method to define your menu structure
  loadMenu() {
    this.model = [
      {
        label: 'HOME',
        items: [
          // Updated to use the explicit /dashboard path
          { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }
        ]
      },
      {
        label: 'FINANCE TRACKING',
        items: [
          // 💰 Transactions Page Item
          {
            label: 'Transactions',
            icon: 'pi pi-fw pi-list',
            routerLink: ['/transactions'] // Matches router path
          },
          // 📁 Categories Page Item (Updated Icon)
          {
            label: 'Categories',
            icon: 'pi pi-fw pi-folder-open', // New, distinct icon
            routerLink: ['/category']        // Matches router path
          },
          // 💳 Expense Limit Page Item
          {
            label: 'Expense Limit',
            icon: 'pi pi-fw pi-chart-pie',
            routerLink: ['/expense-limit']
          }
        ]
      },
      //{
      //  label: 'ADMINISTRATION',
      //  items: [
      //    // Fixed path to match /userProfile route
      //    { label: 'User Profile', icon: 'pi pi-fw pi-user' },
      //    // Added missing usersList path
      //    { label: 'Users List', icon: 'pi pi-fw pi-users'}
      //  ]
      //}
    ];
  }
}
