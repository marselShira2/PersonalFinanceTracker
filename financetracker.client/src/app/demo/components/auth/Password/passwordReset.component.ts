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
  selector: 'app-passwordReset',
  templateUrl: './passwordReset.component.html',
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

export class PasswordResetComponent {
  otpvalue: any;
  authService = inject(AuthService)
  twoFactorAuthService = inject(TwoFactorAuthService)
  router = inject(Router)
  private userKey = 'user'
  displayText: string = "";
  isResendingCode: boolean = false;
 
  ngAfterViewInit(): void {
    //shfaqet mesazhi informues per vendosjen e kodit te derguar me email per te validuar adresen e emailit
    const state = window.history.state; 
    if (state && state.showMessage) {
      this.translate.get(['EMAIL_CONFIRMATION_CODE', 'EMAIL_CONFIMATION_HEADER']).subscribe(translations => { 
        this.messageService.add({
          key: 'responseToast',
          severity: 'warn',
          summary: translations['EMAIL_CONFIMATION_HEADER'],
          detail: translations['EMAIL_CONFIRMATION_CODE'],
          life: 5000 
        });
      }); 
    }
  }

  get textKey(): string {
    //const user = localStorage.getItem("user");
    //const userDetail: AuthResponse = JSON.parse(user!);
    //const twoFactorAuthenticationMethod = userDetail.twoFactorAuthenticationMethod;
    //return twoFactorAuthenticationMethod == "GoogleAuthenticator" ? "AUTHENTICATOR_PROMPT" : "EMAIL_PROMPT";
    return "EMAIL_PROMPT";
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

  //kontrollon kodin e vendosur
  submitOtp() {
    if (this.otpvalue == "" || this.otpvalue == null) {
    }
    else {
      var email = localStorage.getItem("userEmail");
      const request = {
        email: email,
        otp: this.otpvalue
      };

      this.twoFactorAuthService.verifyPasswordResetOtp(request).subscribe({

        next: (response) => {
          if (response.isSuccess) {

            this.translate.get(['MFA_MESSAGE', 'PASSWORD_RESETED_SUCCESSFULLY']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'success', summary: translations['MFA_MESSAGE'], detail: translations['PASSWORD_RESETED_SUCCESSFULLY'] });
            });
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 3500);
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

  //ridergon kodin e ri 
  resendOtp() {
    this.isResendingCode = true;
    var email = localStorage.getItem("userEmail");
    this.twoFactorAuthService.generateOtp(email).subscribe({
        next: (response) => {
          if (response.success) {
            this.translate.get(['MFA_MESSAGE', 'CODE_RESEND']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'success', summary: translations['MFA_MESSAGE'], detail: translations['CODE_RESEND'] });
            });
            this.isResendingCode = false; 
          }
          else {
            this.translate.get(['MFA_MESSAGE', 'PROBLEM_CODE_RESEND']).subscribe(translations => {
              this.messageService.add({ key: 'responseToast', severity: 'error', summary: translations['MFA_MESSAGE'], detail: translations['PROBLEM_CODE_RESEND'] });
            });
            this.isResendingCode = false;
          }
        },
        error: () => {
          this.translate.get(['MFA_MESSAGE', 'PROBLEM_CODE_RESEND']).subscribe(translations => {
            this.messageService.add({ key: 'responseToast', severity: 'error', summary: translations['MFA_MESSAGE'], detail: translations['PROBLEM_CODE_RESEND'] });
          });
            this.isResendingCode = false;
        }
      }); 
  }
   
}
