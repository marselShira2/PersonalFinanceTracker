import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../services/auth.service';
import { RegisterRequest } from '../../../../interfaces/register-request';
import { CookieService } from 'ngx-cookie-service';

@Component({
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  authService = inject(AuthService);

  username: string = '';
  email: string = '';
  password: string = '';
  verificationCode: string = '';
  isVerifying: boolean = false;
  rememberMe: boolean = false;

  languages = [
    { code: 'sq', labelKey: 'LANGUAGE_SQ', flag: 'assets/flag/al-flag.png' },
    { code: 'en', labelKey: 'LANGUAGE_EN', flag: 'assets/flag/uk-flag.png' }
  ];
  selectedLanguage: string;
  selectedLanguageFlag: string;
  dropdownVisible: boolean = false;
  translatedLabels: any = {};

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {
    this.selectedLanguage = this.cookieService.get('selectedLanguage') || 'sq';
    this.selectedLanguageFlag = this.languages.find(lang => lang.code === this.selectedLanguage)?.flag || 'assets/flag/al-flag.png';
    this.translate.addLangs(['sq', 'en']);
    this.translate.setDefaultLang('sq');
    this.translate.use(this.selectedLanguage);
    this.checkCookies();
    console.log('[RegisterComponent] Initialized');
  }

  onRegister() {
    console.log('[RegisterComponent] Register clicked', { username: this.username, email: this.email });
    const registerRequest: RegisterRequest = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log('[RegisterComponent] Register response:', response);
        if (response.success) {
          this.messageService.add({
            key: 'responseToast',
            severity: 'success',
            summary: 'Success',
            detail: response.message
          });

          localStorage.setItem('verifyEmail', response.email);

          console.log('[RegisterComponent] Switching to verification mode');
          this.isVerifying = true;
        } else {
          console.warn('[RegisterComponent] Register warning:', response.message);
          this.messageService.add({
            key: 'responseToast',
            severity: 'warn',
            summary: 'Warning',
            detail: response.message
          });
        }
      },
      error: (error) => {
        console.error('[RegisterComponent] Register error:', error);
        this.messageService.add({
          key: 'responseToast',
          severity: 'error',
          summary: 'Error',
          detail: error.error || 'Registration failed. Please try again.'
        });
      }
    });
  }

  onVerifyCode() {
    console.log('[RegisterComponent] Verify code clicked', { code: this.verificationCode });
    const verifyData = {
      email: localStorage.getItem('verifyEmail')!,
      code: this.verificationCode
    };

    this.authService.verifyCode(verifyData).subscribe({
      next: (response) => {
        console.log('[RegisterComponent] Verify response:', response);
        if (response.success) {
          this.messageService.add({
            key: 'responseToast',
            severity: 'success',
            summary: 'Success',
            detail: response.message
          });
          console.log('[RegisterComponent] Verification successful, navigating to login');
          this.router.navigate(['/auth/login']);
        } else {
          console.warn('[RegisterComponent] Verification warning:', response.message);
          this.messageService.add({
            key: 'responseToast',
            severity: 'warn',
            summary: 'Warning',
            detail: response.message
          });
        }
      },
      error: (error) => {
        console.error('[RegisterComponent] Verification error:', error);
        this.messageService.add({
          key: 'responseToast',
          severity: 'error',
          summary: 'Error',
          detail: error.error || 'Invalid or expired verification code.'
        });
      }
    });
  }

  onResendCode() {
    const email = localStorage.getItem('verifyEmail');
    if (!email) {
      console.warn('[RegisterComponent] No email found for resend');
      return;
    }

    console.log('[RegisterComponent] Resend code clicked for email:', email);
    this.authService.resendVerificationCode(email).subscribe({
      next: (response) => {
        console.log('[RegisterComponent] Resend code response:', response);
        this.messageService.add({
          key: 'responseToast',
          severity: 'success',
          summary: 'Code Sent',
          detail: response.message
        });
      },
      error: (err) => {
        console.error('[RegisterComponent] Resend code error:', err);
        this.messageService.add({
          key: 'responseToast',
          severity: 'error',
          summary: 'Error',
          detail: 'Could not resend verification code.'
        });
      }
    });
  }

  onBack() {
    console.log('[RegisterComponent] Back clicked, navigating to login');
    this.router.navigate(['/auth/login']);
  }

  checkCookies(): void {
    const rememberMeChecked = this.cookieService.get('rememberMeChecked');
    const rememberMeCheckedUsername = this.cookieService.get('rememberMeCheckedUsername');
    console.log('[RegisterComponent] Checking cookies:', { rememberMeChecked, rememberMeCheckedUsername });
    if (rememberMeChecked === 'true') {
      this.rememberMe = true;
      this.email = atob(rememberMeCheckedUsername);
    } else {
      this.email = "";
      this.rememberMe = false;
    }
  }
}
