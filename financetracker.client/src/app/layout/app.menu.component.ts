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
        label: 'MENU.HOME',
        items: [
          { label: 'MENU.DASHBOARD', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }
        ]
      },
      {
        label: 'MENU.FINANCE_TRACKING',
        items: [
          {
            label: 'MENU.TRANSACTIONS',
            icon: 'pi pi-fw pi-list',
            routerLink: ['/transactions']
          },
          {
            label: 'MENU.CALENDAR_VIEW',
            icon: 'pi pi-fw pi-calendar',
            routerLink: ['/transaction-calendar']
          },
          {
            label: 'MENU.CATEGORIES',
            icon: 'pi pi-fw pi-folder-open',
            routerLink: ['/category']
          },
          {
            label: 'MENU.EXPENSE_LIMIT',
            icon: 'pi pi-fw pi-chart-pie',
            routerLink: ['/expense-limit']
          }
        ]
      },
      {
        label: 'MENU.SETTINGS',
        items: [
          {
            label: 'MENU.USER_PROFILE',
            icon: 'pi pi-fw pi-user',
            routerLink: ['/userProfile']
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
