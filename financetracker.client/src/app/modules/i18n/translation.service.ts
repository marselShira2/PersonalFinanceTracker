import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root' // ensures it can be injected anywhere
})
export class TranslationService {
  private languageSubject = new BehaviorSubject<string>('en');
  currentLanguage$ = this.languageSubject.asObservable();

  constructor() { }

  // get current language
  getCurrentLanguage(): string {
    return this.languageSubject.value;
  }

  // change language
  setLanguage(lang: string) {
    this.languageSubject.next(lang);
  }

  // dummy translate function
  translate(key: string): string {
    // for now, just return the key
    return key;
  }
}
