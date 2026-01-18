import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CurrencyUpdateDto {
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = environment.apiUrl + '/Users';
  private currentCurrencySubject = new BehaviorSubject<string>('USD');
  public currentCurrency$ = this.currentCurrencySubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentCurrency();
  }

  updateDefaultCurrency(currency: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/currency`, { currency });
  }

  getCurrentCurrency(): Observable<any> {
    return this.http.get(`${this.apiUrl}/currency`);
  }

  private loadCurrentCurrency(): void {
    this.getCurrentCurrency().subscribe({
      next: (response) => {
        this.currentCurrencySubject.next(response.currency);
      },
      error: (error) => {
        console.error('Failed to load current currency:', error);
      }
    });
  }

  setCurrency(currency: string): void {
    this.currentCurrencySubject.next(currency);
  }

  getCurrentCurrencyValue(): string {
    return this.currentCurrencySubject.value;
  }

  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'ALL': 'L',
      'EUR': '€',
      'USD': '$'
    };
    return symbols[currency] || currency;
  }

  getSupportedCurrencies(): Array<{code: string, name: string}> {
    return [
      { code: 'ALL', name: 'Albanian Lek' },
      { code: 'EUR', name: 'Euro' },
      { code: 'USD', name: 'US Dollar' }
    ];
  }
}