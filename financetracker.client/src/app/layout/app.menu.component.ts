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
    // You can use the translate service here if you support multiple languages
    this.model = [
      {
        label: 'HOME',
        items: [
          { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
        ]
      },
      {
        label: 'FINANCE TRACKING',
        items: [
          // 👈 This is the new item for the Transactions Page
          {
            label: 'Transactions',
            icon: 'pi pi-fw pi-list',
            routerLink: ['/transactions'] // 🎯 Matches your route path
          },
          // Add other finance-related links here (e.g., categories, accounts)
          // { label: 'Accounts', icon: 'pi pi-fw pi-wallet', routerLink: ['/accounts'] }
        ]
      },
      {
        label: 'SETTINGS',
        items: [
          { label: 'Profile', icon: 'pi pi-fw pi-user', routerLink: ['/profile'] }
        ]
      },
      // You can add a separator if needed
      // { separator: true }
    ];
  }
}
