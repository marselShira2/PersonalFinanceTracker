/// <reference path="../../../environments/environment.ts" />

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LogsDTO } from '../../Models/logs-dto.model';
import { environment } from '../../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class LogsService {
  
  private apiUrl: string = environment.apiUrl;
 
  

  constructor(private http: HttpClient) { }

 
  getAllLogs(): Observable<LogsDTO[]> {
    return this.http.get<LogsDTO[]>(`${this.apiUrl}/Logs`);
  }
}
