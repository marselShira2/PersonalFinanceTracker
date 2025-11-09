import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from "../../../environments/environment";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SectorService {
  apiUrl: string = environment.apiUrl;
  sectorType: string = 'finance';
  constructor(private http: HttpClient, private router: Router) { }
   
}
