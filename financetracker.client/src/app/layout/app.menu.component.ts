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
    const savedLanguage = this.cookieService.get('selectedLanguage') || 'sq';
    this.translate.setDefaultLang('sq');
    this.translate.use(savedLanguage);
    this.translate.onLangChange.subscribe(() => {
    });

  }
   


 
   
   
}
