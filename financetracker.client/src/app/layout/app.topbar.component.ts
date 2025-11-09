import { Component, ElementRef, OnInit, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { DomSanitizer } from '@angular/platform-browser';
import { usersprofileservice } from '../services/userprofile.services';
import { NotificationsComponent } from '../../../src/app/Views/notifications/notifications.component';



@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

  @ViewChild(NotificationsComponent) notificationsComponent!: NotificationsComponent;

  items!: MenuItem[];
  profileLabel!: string;
  tieredItems: MenuItem[] = [];
  profileImage: any = null;
  role: string = "";

  languages = [
    { code: 'sq', labelKey: 'LANGUAGE_SQ', flag: 'assets/flag/al-flag.png' },
    { code: 'en', labelKey: 'LANGUAGE_EN', flag: 'assets/flag/uk-flag.png' }
  ];
  selectedLanguage: string;
  selectedLanguageFlag: string;
  dropdownVisible: boolean = false;
  userDropdownVisible: boolean = false;
  notificationsDropdownVisible: boolean = false;

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private userprofileservice: usersprofileservice,
    private cookieService: CookieService,
    private primengConfig: PrimeNGConfig

  ) {

    this.userprofileservice.profileImageChanged$.subscribe(() => {
      this.loadProfileImage(); // Reload the image
    });
    const savedLanguage = this.cookieService.get('selectedLanguage') || 'sq';
    this.selectedLanguage = savedLanguage;
    this.selectedLanguageFlag = this.languages.find(lang => lang.code === savedLanguage)?.flag || 'assets/flag/al-flag.png';
    this.translate.setDefaultLang('sq');
    this.translate.use(savedLanguage);

    //this.userprofileservice.profileImageChanged$.subscribe(() => {
    //  this.loadProfileImage(); // Reload the image
    //});
  }

  ngOnInit() { 
    this.updateProfileLabel();
    this.updateTieredItems();
   /* this.loadProfileImage();*/
    this.translate.onLangChange.subscribe(() => {
      this.updateProfileLabel();
      this.updateTieredItems();
    });
  }

  async updateProfileLabel() {
    const isLoggedIn = await this.authService.isLoggedIn(); // Await the asynchronous call

    if (isLoggedIn) {
      const userDetail = this.authService.getUserDetail();
      this.profileLabel = userDetail && userDetail.fullName ? userDetail.fullName : this.translate.instant('PROFILE');
    } else {
      this.profileLabel = this.translate.instant('PROFILE');
    }
  }

  updateTieredItems() {
    this.tieredItems = [
      {
        label: this.profileLabel,
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: this.translate.instant('VIEWPROFILE'),
            icon: 'pi pi-fw pi-id-card',
            command: () => this.viewProfile()
          },
          {
            label: this.translate.instant('LOGOUT'),
            icon: 'pi pi-fw pi-sign-out',
            command: () => this.logout()
          },
        ]
      },
    ];
  }

   
  viewProfile() {
    this.router.navigate(['/userProfile']);
  }
  showDropdown() {
    this.dropdownVisible = true;
  }

  hideDropdown() {
    this.dropdownVisible = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Close all dropdowns when clicking outside
    if (!targetElement.closest('.user-dropdown') && !targetElement.closest('.user-icon')) {
      this.userDropdownVisible = false;
    }

    if (!targetElement.closest('.dropdown') && !targetElement.closest('.language-selector')) {
      this.dropdownVisible = false;
    }

    if (!targetElement.closest('.notifications-dropdown') && !targetElement.closest('.bell-container')) {
      this.notificationsDropdownVisible = false;
    }
  }

  closeAllDropdowns(): void {
    this.userDropdownVisible = false;
    this.notificationsDropdownVisible = false;
    this.dropdownVisible = false;
  }

  selectLanguage(language: any) {
    this.selectedLanguage = language.code;
    this.selectedLanguageFlag = language.flag;
    this.dropdownVisible = false;
    this.translate.use(this.selectedLanguage);
    this.cookieService.set('selectedLanguage', this.selectedLanguage, 365);
    console.log('Language changed to:', this.selectedLanguage);
  }



  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearLocalStorage();
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Error during logout:', err);

      }
    });

  }


  
  toggleUserDropdown(event: Event): void {
    this.notificationsComponent.notificationsDropdownVisible = false;
    this.dropdownVisible = false;
    this.userDropdownVisible = !this.userDropdownVisible; 
  }

 
  toggleLanguageDropdown(event: Event): void {
    this.notificationsComponent.notificationsDropdownVisible = false;
    this.userDropdownVisible = false;
    this.dropdownVisible = !this.dropdownVisible; 
  }



  loadProfileImage(): void {
    this.userprofileservice.getProfileImage().subscribe(
      (data: Blob) => {
        if (data && data.size > 0) {
          const objectURL = URL.createObjectURL(data);
          this.profileImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        } else {
          this.setDefaultProfileImage();
        }
      },
      (error) => {
        this.setDefaultProfileImage();
      }
    );
  }

  setDefaultProfileImage(): void {
    this.profileImage = 'assets/layout/images/default-user.png';  
  }

  
}
