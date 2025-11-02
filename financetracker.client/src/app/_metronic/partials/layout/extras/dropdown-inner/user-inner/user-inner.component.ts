import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../../../modules/auth/auth.service';
import { JwtService } from '../../../../../../services/jwt/jwt.service';
import { UserService as UserServiceV2 } from '../../../../../../services/user/user.service';
import { PhotoDTO } from '../../../../../../interfaces/photo.model';
@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';
  defaultImage = './assets/media/avatars/user-photo.png';
  userId: string | undefined;
  fullname: string | undefined;
  userImageUrl: string;

  language: LanguageFlag;
/*  user$: Observable<UserType>;*/
  langs = languages;
  private unsubscribe: Subscription[] = [];

  constructor(
    private auth: AuthService,
    //private translationService: TranslationService,
    private jwtService: JwtService,
    private userServiceV2: UserServiceV2,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    /*    this.user$ = this.auth.currentUserSubject.asObservable();*/
    this.userImageUrl = this.defaultImage;
    this.userId = this.jwtService.decodeToken() != null ? this.jwtService.decodeToken()?.UserID : "";
    this.fullname = this.jwtService.decodeToken() != null ? this.jwtService.decodeToken()?.username : "";
    //this.setLanguage(this.translationService.getSelectedLanguage());
    this.loadUserImage();
    this.cdr.detectChanges();
  }

  logout() {
    this.auth.logout();
   // document.location.reload();
  }

  selectLanguage(lang: string) {
   /* this.translationService.setLanguage(lang);*/
    this.setLanguage(lang);
    // document.location.reload();
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  loadUserImage(): void {
    this.userServiceV2.getUserPhoto(this.userId).subscribe(
      (response: PhotoDTO) => {
        if (response.content) {
          this.userImageUrl = `data:image/${response.extension};base64,${response.content}`;
          this.cdr.detectChanges();
        }
      },
      error => {
        console.error("Error fetching user image:", error);
      }
    );
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: './assets/media/flags/united-states.svg',
  },
  {
    lang: 'zh',
    name: 'Mandarin',
    flag: './assets/media/flags/china.svg',
  },
  {
    lang: 'es',
    name: 'Spanish',
    flag: './assets/media/flags/spain.svg',
  },
  {
    lang: 'ja',
    name: 'Japanese',
    flag: './assets/media/flags/japan.svg',
  },
  {
    lang: 'de',
    name: 'German',
    flag: './assets/media/flags/germany.svg',
  },
  {
    lang: 'fr',
    name: 'French',
    flag: './assets/media/flags/france.svg',
  },
];
