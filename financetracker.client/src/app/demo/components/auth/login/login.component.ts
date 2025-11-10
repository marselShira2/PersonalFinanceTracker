import { Component, inject } from '@angular/core';
import { LayoutService } from '../../../../layout/service/app.layout.service';
import { AuthService, ForgotPasswordRequest, ResetPasswordRequest } from '../../../../services/auth.service';
import { LoginRequest } from '../../../../interfaces/login-request';
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
  rememberMe: boolean = false;

  mode: 'login' | 'forgot' | 'reset' = 'login';
  isSendingEmailConfirmationCode: boolean = false;

  languages = [
    { code: 'sq', labelKey: 'LANGUAGE_SQ', flag: 'assets/flag/al-flag.png' },
    { code: 'en', labelKey: 'LANGUAGE_EN', flag: 'assets/flag/uk-flag.png' }
  ];
  selectedLanguage: string;
  selectedLanguageFlag: string;
  dropdownVisible: boolean = false;

  resetCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

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
    await this.authService.isLoggedIn();
    this.updateTranslations();
    this.translate.onLangChange.subscribe(() => this.updateTranslations());
  }

  updateTranslations() {
    this.translate.get([
      'LNG_PASSWORD_INCORRECT',
      'LNG_USER_NOT_EXISTS',
      'LNG_USER_IS_INACTIVE',
      'ERROR',
      'SUKSES'
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
  }

  onLogin() {
    const loginRequest: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.cookieService.set('rememberMeChecked', this.rememberMe ? 'true' : 'false');
    this.cookieService.set('rememberMeCheckedUsername', btoa(this.email));

    this.authService.login(loginRequest).subscribe({
      next: response => {
        if (response.token) {
          localStorage.setItem('user', JSON.stringify(response));
          this.router.navigate(['/dashboard']);
        } else {
          this.messageService.add({
            key: 'responseToast',
            severity: 'error',
            summary: this.translatedLabels['ERROR'],
            detail: this.translatedLabels[response.message]
          });
        }
      },
      error: error => {
        this.messageService.add({
          key: 'responseToast',
          severity: 'error',
          summary: this.translatedLabels['ERROR'],
          detail: this.translatedLabels[error.error.message]
        });
      }
    });
  }

  onForgotPassword() {
    if (!this.email) {
      this.messageService.add({
        key: 'responseToast',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter your email before resetting password.'
      });
      return;
    }

    this.isSendingEmailConfirmationCode = true;
    const payload: ForgotPasswordRequest = { email: this.email };

    this.authService.forgotPassword(payload).subscribe({
      next: response => {
        this.messageService.add({
          key: 'responseToast',
          severity: 'success',
          summary: 'Success',
          detail: response.message
        });
        this.mode = 'reset';
      },
      error: err => {
        this.messageService.add({
          key: 'responseToast',
          severity: 'error',
          summary: 'Error',
          detail: err.error || 'An error occurred.'
        });
      },
      complete: () => (this.isSendingEmailConfirmationCode = false)
    });
  }

  get enterEmailText(): string {
    const translated = this.translate.instant('ENTER_EMAIL_RESET_CODE');
    return translated && translated !== 'ENTER_EMAIL_RESET_CODE'
      ? translated
      : 'Enter your email to receive a 6-digit reset code.';
  }

  onResetPassword() {
    if (!this.resetCode || !this.newPassword || !this.confirmPassword) {
      this.messageService.add({
        key: 'responseToast',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all fields.'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({
        key: 'responseToast',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Passwords do not match.'
      });
      return;
    }

    const payload: ResetPasswordRequest = {
      email: this.email,
      token: this.resetCode,
      newPassword: this.newPassword
    };

    this.authService.resetPasswordWithCode(payload).subscribe({
      next: response => {
        this.messageService.add({
          key: 'responseToast',
          severity: 'success',
          summary: 'Success',
          detail: response.message
        });
        this.mode = 'login';
        this.resetCode = this.newPassword = this.confirmPassword = '';
      },
      error: err => {
        this.messageService.add({
          key: 'responseToast',
          severity: 'error',
          summary: 'Error',
          detail: err.error || 'Invalid or expired code.'
        });
      }
    });
  }

  onSignUp() {
    this.router.navigate(['/auth/register']);
  }

  checkCookies(): void {
    const rememberMeChecked = this.cookieService.get('rememberMeChecked');
    const rememberMeCheckedUsername = this.cookieService.get('rememberMeCheckedUsername');

    if (rememberMeChecked === 'true') {
      this.rememberMe = true;
      this.email = atob(rememberMeCheckedUsername);
    } else {
      this.email = '';
      this.rememberMe = false;
    }
  }
}
