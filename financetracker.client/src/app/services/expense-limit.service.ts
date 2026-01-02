import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseLimitStatus, SetLimitRequest } from '../Models/expense-limit.model';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ExpenseLimitService {
  private apiUrl = `${environment.apiUrl.replace('/api', '')}/api/ExpenseLimit`;

  constructor(private http: HttpClient, private translate: TranslateService) { }

  setLimit(request: SetLimitRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/set-goal`, request);
  }

  getLimitStatus(userId: number): Observable<ExpenseLimitStatus> {
    const currentLang = this.translate.currentLang || 'en';
    return this.http.get<ExpenseLimitStatus>(`${this.apiUrl}/${userId}?lang=${currentLang}`);
  }

  toggleLimit(userId: number, isActive: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/toggle/${userId}`, isActive);
  }
}