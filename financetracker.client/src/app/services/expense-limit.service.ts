import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    return this.http.post(`${this.apiUrl}`, request);
  }

  getAllLimits(userId: number, month?: number, year?: number): Observable<ExpenseLimitStatus[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    return this.http.get<ExpenseLimitStatus[]>(`${this.apiUrl}/${userId}?${params}`);
  }

  getLimitStatus(userId: number, categoryId: number, month?: number, year?: number): Observable<ExpenseLimitStatus> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    return this.http.get<ExpenseLimitStatus>(`${this.apiUrl}/${userId}/category/${categoryId}?${params}`);
  }

  deleteLimit(userId: number, categoryId: number, month?: number, year?: number): Observable<any> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    return this.http.delete(`${this.apiUrl}/${userId}/category/${categoryId}?${params}`);
  }

  updateLimit(userId: number, categoryId: number, amount: number, isActive: boolean, month?: number, year?: number): Observable<any> {
    const request = { userId, categoryId, amount, isActive, month, year };
    return this.http.post(`${this.apiUrl}`, request);
  }

  toggleLimit(userId: number, categoryId: number, month?: number, year?: number): Observable<any> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    return this.http.put(`${this.apiUrl}/${userId}/category/${categoryId}/toggle?${params}`, {});
  }
}