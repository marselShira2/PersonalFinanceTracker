import { Component, inject } from '@angular/core';
import { LayoutService } from '../../../../layout/service/app.layout.service';
import { AuthService } from '../../../../services/auth.service';
import { LoginRequest } from '../../../../interfaces/login-request';
import { AuthResponse } from '../../../../interfaces/auth-response';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { TwoFactorAuthService } from '../../../../services/twofactorauth.service';


@Component({
  selector: 'app-mfa',
  templateUrl: './mfa.component.html',
  styles: [
    `
        .custom-otp-input {
            width: 48px;
            font-size: 40px;
            border: 0 none;
            appearance: none;
            text-align: center;
            transition: all 0.2s;
            background: transparent;
            border-bottom: 2px solid var(--surface-500);
            border-radius: 0px;
            margin: 0 0.2rem;
        }

        .custom-otp-input:focus {
            outline: 0 none;
            box-shadow: none;
            border-bottom-color: var(--primary-color);
        }

        .p-button {
          font-size: 15px !important;
        }

        .p-button.p-button-link {
          color: red !important;
        }
        `
  ],
})

export class MfaComponent {
  otpvalue: any;
  authService = inject(AuthService)
  twoFactorAuthService = inject(TwoFactorAuthService)
  router = inject(Router)
  private userKey = 'user'
  displayText: string = "";

  get textKey(): string {
    const user = localStorage.getItem("user");
    const userDetail: AuthResponse = JSON.parse(user!);
    const twoFactorAuthenticationMethod = userDetail.twoFactorAuthenticationMethod;
    return twoFactorAuthenticationMethod == "GoogleAuthenticator" ? "AUTHENTICATOR_PROMPT" : "EMAIL_PROMPT";
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

  languages = [
    { code: 'sq', labelKey: 'LANGUAGE_SQ', flag: 'assets/flag/al-flag.png' },
    { code: 'en', labelKey: 'LANGUAGE_EN', flag: 'assets/flag/uk-flag.png' }
  ];
  selectedLanguage: string;
  selectedLanguageFlag: string;
  dropdownVisible: boolean = false;

  constructor(
    public layoutService: LayoutService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private translate: TranslateService) {
    this.selectedLanguage = this.cookieService.get('selectedLanguage') || 'sq';
    this.selectedLanguageFlag = this.languages.find(lang => lang.code === this.selectedLanguage)?.flag || 'assets/flag/al-flag.png';
    this.translate.addLangs(['sq', 'en']);
    this.translate.setDefaultLang('sq');
    this.translate.use(this.selectedLanguage);
  }

  submit(event: any) {
    this.submitOtp();
  }

  submitOtp() {
    const user = localStorage.getItem("user");
    const userDetail: AuthResponse = JSON.parse(user!);
    const twoFactorAuthenticationMethod = userDetail.twoFactorAuthenticationMethod;

    if (twoFactorAuthenticationMethod == "GoogleAuthenticator") {
      const request = {
        email: userDetail!.email,
        code: this.otpvalue,
        secretKey: ""
      };

      this.twoFactorAuthService.verifyMfaCode(request).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.translate.get(['MFA_MESSAGE', 'LOGIN_SUCCESSFUL']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'success', summary: translations['MFA_MESSAGE'], detail: translations['LOGIN_SUCCESSFUL'] });
            });
            localStorage.setItem(this.userKey, JSON.stringify(response))
            this.router.navigate(['/dashboard']);
          } else {
            this.translate.get(['MFA_MESSAGE', 'INVALID_CODE']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'error', summary: translations['MFA_MESSAGE'], detail: translations['INVALID_CODE'] });
            });
          }
        },
        error: () => {
          this.translate.get(['MFA_MESSAGE', 'VERIFICATION_PROBLEM']).subscribe(translations => {
            this.messageService.add({ key: 'responseToast', severity: 'error', summary: translations['MFA_MESSAGE'], detail: translations['VERIFICATION_PROBLEM'] });
          });
        }
      });
    }
    else {
      const request = {
        email: userDetail!.email,
        otp: this.otpvalue
      };

      this.twoFactorAuthService.verifyMfaOtp(request).subscribe({

        next: (response) => {
          if (response.isSuccess) {
            this.translate.get(['MFA_MESSAGE', 'LOGIN_SUCCESSFUL']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'success', summary: translations['MFA_MESSAGE'], detail: translations['LOGIN_SUCCESSFUL'] });
            });
            localStorage.setItem(this.userKey, JSON.stringify(response))
            this.router.navigate(['/dashboard']);
          } else {
            this.translate.get(['MFA_MESSAGE', 'INVALID_CODE']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'error', summary: translations['MFA_MESSAGE'], detail: translations['INVALID_CODE'] });
            });
          }
        },
        error: () => {
          this.translate.get(['MFA_MESSAGE', 'VERIFICATION_PROBLEM']).subscribe(translations => {
            this.messageService.add({ key: 'responseToast', severity: 'error', summary: translations['MFA_MESSAGE'], detail: translations['VERIFICATION_PROBLEM'] });
          });
        }
      });
    }
  }

  resendOtp() {
    const user = localStorage.getItem("user");
    const userDetail: AuthResponse = JSON.parse(user!);
    const twoFactorAuthenticationMethod = userDetail.twoFactorAuthenticationMethod;
    if (twoFactorAuthenticationMethod == "GoogleAuthenticator") {
    }
    else {
      this.twoFactorAuthService.generateOtp(userDetail!.email).subscribe({
        next: (response) => {
          if (response.success) {
            this.translate.get(['MFA_MESSAGE', 'CODE_RESEND']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'success', summary: translations['MFA_MESSAGE'], detail: translations['CODE_RESEND'] });
            });
          }
          else {
            this.translate.get(['MFA_MESSAGE', 'PROBLEM_CODE_RESEND']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'error', summary: translations['MFA_MESSAGE'], detail: translations['PROBLEM_CODE_RESEND'] });
            });
          }
        },
        error: () => {
          this.translate.get(['MFA_MESSAGE', 'PROBLEM_CODE_RESEND']).subscribe(translations => {
            this.messageService.add({ key: 'responseToast', severity: 'error', summary: translations['MFA_MESSAGE'], detail: translations['PROBLEM_CODE_RESEND'] });
          });
        }
      });
    }
  }

  get resendButtonDisabled(): boolean {
    const user = localStorage.getItem("user");
    const userDetail: AuthResponse = JSON.parse(user!);
    const twoFactorAuthenticationMethod = userDetail.twoFactorAuthenticationMethod;
    return twoFactorAuthenticationMethod == "GoogleAuthenticator";
  }
}
