import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TwoFactorAuthService {
 
  private apiUrl = environment.apiUrl+'/Account';
  constructor(private http: HttpClient) { }

  generateQrCode(email: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/twofactor/generate-qr-code?email=${email}`);
  }

  verifyCode(request: { email: string | null, code: string, secretKey: string }): Observable<any> {
     return this.http.post<any>(`${this.apiUrl}/twofactor/verify-code`, request);
  }

  verifyMfaCode(request: { email: string | null, code: string, secretKey: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/twofactor/verify-mfa-code`, request);
  }

  getTwoFactorStatus(email: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/twofactor/status?email=${email}`);
  }

  generateOtp(email: string | null): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/twofactor/generate-otp`, { email });
  }

  verifyOtp(request: { email: string | null, otp: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/twofactor/verify-otp`, request);
  }

  verifyMfaOtp(request: { email: string | null, otp: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/twofactor/verify-mfa-otp`, request);
  }
  verifyPasswordResetOtp(request: { email: string | null, otp: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/twofactor/verify-passwordReset-otp`, request);
  }
}
