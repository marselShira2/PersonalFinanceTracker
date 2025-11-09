import { Injectable, Injector } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../interfaces/login-request';
import { PasswordResetRequest } from '../interfaces/password-reset-request';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { CheckMfa } from '../interfaces/check-mfa'; 
import { InactivityService } from  './ValidationFunctions/ActivityRefreshToken'

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  nameid?: string;
  name?: string;
  email?: string;
  role?: string[] | string;
  rights?: string[];
}
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  apiUrl: string = environment.apiUrl;
  private userKey = 'user'
  private lastTime = 0;
  private _inactivityService: InactivityService | undefined;
  constructor(
    private http: HttpClient,
    private injector: Injector) { }

  private get inactivityService(): InactivityService {
    // If the service hasn't been fetched yet, get it from the injector.
    if (!this._inactivityService) {
      this._inactivityService = this.injector.get(InactivityService);
    }
    return this._inactivityService;
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/account/login`, data)
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            
            localStorage.setItem(this.userKey, JSON.stringify(response))
            this.inactivityService.startMonitoring();
          }
          if (response.authSource) {
            localStorage.setItem('authSource', response.authSource);
          } else {
            // Fallback logic if `authSource` is not returned
            localStorage.setItem('authSource', 'system');
          }
          return response;
        })
      );
  }
   

  setToLocalStorage(response: { token: string, email: string, authSource: string, refreshTokenValidity: Date,refreshToken: string}): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(" setToLocalStorage " + JSON.stringify(response))

        localStorage.setItem('user', JSON.stringify(response)); 
        localStorage.setItem('authSource', response.authSource); 
        resolve();  
      } catch (error) {
        console.log("Error: " + error)
        reject(error);  
      }
    });
  }
 
  validateParameters(userId: string, refreshToken: string, email: string): Observable<boolean> {
    const requestPayload = { userId, refreshToken, email }; 
    return this.http
      .post<boolean>(`${this.apiUrl}/account/validate-login`, requestPayload)
      .pipe(
        map((response) => {
          return response;  // Return the boolean value indicating the success/failure
        })
      );
  }
   

  // SSO Login Method
  ssoLogin(accessToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/account/loginoauth`, { access_token: accessToken })
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            localStorage.setItem(this.userKey, JSON.stringify(response));
          }
          return response;
        })
      );
  }
  //Ben resetimin dhe dergimin e password te ri
  passwordReset(passwordResetRequest: PasswordResetRequest): Observable<AuthResponse> {
      
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/account/passwordReset`, passwordResetRequest) 
      .pipe(
        map((response) => {
          if (response.isSuccess) { 
            var useremail = passwordResetRequest.email.replace(/['"]+/g, '');
            localStorage.setItem("userEmail", useremail); 
          }
          return response;
        })
      )
  }

  getUserDetail = () => {
    const token = this.getToken();
    if (!token) return null;
    const decodedToken = jwtDecode<JwtPayload>(token); // Assert the type here
    
    const userDetail = {
      id: decodedToken.nameid,
      fullName: decodedToken.name,
      email: decodedToken.email,
      roles: decodedToken.role || [],
        rights: decodedToken.rights || "",
        selfDeclaration: decodedToken.jti,
    };
    return userDetail;
  }

  getToken = (): string | null => {
    const user = localStorage.getItem(this.userKey);
    if (!user) return null;
    const userDetail: AuthResponse = JSON.parse(user);
    return userDetail.token
  }

  getRefreshToken = (): string | null => { 
    const user = localStorage.getItem(this.userKey);
    if (!user) return null;
    const userDetail: AuthResponse = JSON.parse(user);
    return userDetail.refreshToken
  }

  getRefreshTokenExpiryTime = (): string | null => {
    const user = localStorage.getItem(this.userKey);
    if (!user) return null;
    const userDetail: AuthResponse = JSON.parse(user);
    return userDetail.refreshTokenValidity;
  }

  isLoggedIn = async (): Promise<boolean> => {
    const token = this.getToken();
    if (!token) return false;
    // Wait for the isTokenExpired to resolve
    return !(await this.isTokenExpired());
  }

  isLoggedInBeforeMfa = (): boolean => {
    const user = localStorage.getItem(this.userKey);
    if (!user) return false;
    const userDetail: AuthResponse = JSON.parse(user);
    if (userDetail.email == null || userDetail.email == undefined || userDetail.email == ""
      || userDetail.credential == null || userDetail.credential == undefined || userDetail.credential == "") {
      return false;
    }
    return true;
  } 
   
  private async isTokenExpired(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return true;

    const decodedToken = jwtDecode(token);
    const isExpired = Date.now() >= (decodedToken.exp ?? 0) * 1000;

    if (isExpired) {
      console.log("Token expired. Attempting refresh as a fallback..."); 
      const success = await this.refreshesToken().toPromise();
      return !success;  
    }

    return false; // Not expired
  }
   
   logout(): Observable<any> {
    this.inactivityService.stopMonitoring();
    localStorage.removeItem(this.userKey);
    const authSource = localStorage.getItem("authSource");
    return this.http.post<void>(`${this.apiUrl}/Logs/logout`, {});
  } 
  clearLocalStorage(): void {
    this.inactivityService.stopMonitoring();
    localStorage.removeItem(this.userKey);
  }

  refreshToken = (data: {
    email: string,
    token: string,
    refreshToken: string
  }): Observable<AuthResponse> =>
    this.http.post<AuthResponse>(`${this.apiUrl}/account/refresh-token`, data);

     
  refreshesToken(): Observable<boolean> {
    return this.refreshToken({
      email: this.getUserDetail()?.email || "",
      token: this.getToken() || "",
      refreshToken: this.getRefreshToken() || ""
    }).pipe(
      map((response) => {
        if (response.isSuccess) {
          localStorage.setItem(this.userKey, JSON.stringify(response));
          return true; // Token refreshed successfully
        }
        return false; // Token refresh failed
      }),
      catchError((err) => {
        console.error("Error refreshing token:", err);
        return of(false); // Return false in case of error
      })
    );
  }
   
}
