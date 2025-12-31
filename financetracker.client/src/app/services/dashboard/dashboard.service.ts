import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalTransactions: number;
}

export interface PeriodData {
  period: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  categoryName: string;
  amount: number;
  type: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  periodData: PeriodData[];
  categoryBreakdown: CategoryBreakdown[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl + '/Dashboard';

  constructor(private http: HttpClient) { }

  getAllTimeSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`);
  }

  getDashboardData(period: string = 'year', categoryId?: number): Observable<DashboardResponse> {
    let params = new HttpParams().set('period', period);
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get<DashboardResponse>(this.apiUrl, { params });
  }

  getDashboardDataWithParams(parameters: any): Observable<DashboardResponse> {
    let params = new HttpParams();
    Object.keys(parameters).forEach(key => {
      if (parameters[key] !== null && parameters[key] !== undefined) {
        params = params.set(key, parameters[key].toString());
      }
    });
    console.log('Making API call with URL params:', params.toString());
    return this.http.get<DashboardResponse>(this.apiUrl, { params });
  }
}
