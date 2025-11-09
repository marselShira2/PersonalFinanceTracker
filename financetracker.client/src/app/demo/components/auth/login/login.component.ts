import { Component, inject } from '@angular/core';
import { LayoutService } from '../../../../layout/service/app.layout.service';
import { AuthService } from '../../../../services/auth.service';
import { LoginRequest } from '../../../../interfaces/login-request';
import { PasswordResetRequest } from '../../../../interfaces/password-reset-request';
import { AuthResponse } from '../../../../interfaces/auth-response';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: './login.component.html'
})

export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  valCheck: string[] = ['remember'];
  isCollapsedMobile = 'no-block';
  email!: string;
  password!: string;
  rememberMe: boolean = false; // Added for "Remember Me" functionality


  isSendingEmailConfirmationCode: boolean = false;

  languages = [
    { code: 'sq', labelKey: 'LANGUAGE_SQ', flag: 'assets/flag/al-flag.png' },
    { code: 'en', labelKey: 'LANGUAGE_EN', flag: 'assets/flag/uk-flag.png' }
  ];
  selectedLanguage: string;
  selectedLanguageFlag: string;
  dropdownVisible: boolean = false;

  translatedLabels: any = {};

  constructor(
    public layoutService: LayoutService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private translate: TranslateService,
    private http: HttpClient

  ) {
    this.selectedLanguage = this.cookieService.get('selectedLanguage') || 'sq';
    this.selectedLanguageFlag = this.languages.find(lang => lang.code === this.selectedLanguage)?.flag || 'assets/flag/al-flag.png';
    this.translate.addLangs(['sq', 'en']);
    this.translate.setDefaultLang('sq');
    this.translate.use(this.selectedLanguage);
    this.checkCookies();
  }

  async ngOnInit(): Promise<void> {
    const isLoggedIn = await this.authService.isLoggedIn(); // Await the asynchronous call

    this.updateTranslations();

    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  updateTranslations() {
    this.translate.get([
      'LNG_PASSWORD_INCORRECT', 'LNG_USER_NOT_EXISTS','LNG_USER_IS_INACTIVE', 'ERROR', 'SUKSES'
    ]).subscribe(translations => {
      this.translatedLabels = translations;
    });
  }


  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  selectLanguage(language: any) {
    this.selectedLanguage = language.code;
    this.selectedLanguageFlag = language.flag;
    this.dropdownVisible = false;
    this.translate.use(this.selectedLanguage);
    this.cookieService.set('selectedLanguage', this.selectedLanguage);
    console.log('Language changed to:', this.selectedLanguage);
  }

  onLogin() {
    const loginRequest: LoginRequest = {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe // Include rememberMe in the request
    }

    this.cookieService.set('rememberMeChecked', this.rememberMe ? 'true' : 'false');
    this.cookieService.set('rememberMeCheckedUsername', btoa(this.email));
    /*this.cookieService.set('rememberCheckedPassword', btoa(this.password));*/

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          if (response.twoFactorAuthenticationChecked) {
            this.messageService.add({ key: 'responseToast', severity: 'success', summary: this.translatedLabels['SUKSES'], detail: this.translatedLabels[response.message],  });
            this.router.navigate(['/dashboard']);
          }
          else {
            this.router.navigate(['/auth/mfa']);
          }
        }
        else {
          this.messageService.add({ key: 'responseToast', severity: 'error', summary: this.translatedLabels['ERROR'], detail: this.translatedLabels[response.message] });
        }
      },
      error: (error) => {
        this.messageService.add({ key: 'responseToast', severity: 'error', summary: this.translatedLabels['ERROR'], detail: this.translatedLabels[error.error.message] });
      }
    });
  }

  checkCookies(): void {
    const rememberMeChecked = this.cookieService.get('rememberMeChecked');
    const rememberMeCheckedUsername = this.cookieService.get('rememberMeCheckedUsername');
    /*const rememberMeCheckedPassword = this.cookieService.get('rememberCheckedPassword');*/

    if (rememberMeChecked === 'true') {
      this.rememberMe = true;
      this.email = atob(rememberMeCheckedUsername);
      /*this.password = atob(rememberMeCheckedPassword);*/
      console.log('rememberMeChecked is set to:', rememberMeChecked);
      console.log('rememberMeCheckedUsername is set to:', rememberMeCheckedUsername);
    } else {
      this.email = "";
      this.rememberMe = false;
      console.log('rememberMeChecked is not set.');
      console.log('rememberMeCheckedUsername is not set.');
    }
  }
}
