import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthModel } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://your-api.com/api/auth'; // replace with your backend URL
  private currentUserSubject = new BehaviorSubject<AuthModel | null>(this.getAuthFromLocalStorage());
  public currentUser$: Observable<AuthModel | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  // 🔐 LOGIN
  login(username: string, password: string): Observable<AuthModel> {
    return this.http.post<AuthModel>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((auth) => {
        if (auth && auth.accessToken) {
          this.setAuthToLocalStorage(auth);
          this.currentUserSubject.next(auth);
        }
      })
    );
  }

  // 🚪 LOGOUT
  logout(): void {
    this.removeAuthFromLocalStorage();
    this.currentUserSubject.next(null);
  }

  // 🧠 GET CURRENT USER
  get currentAuthValue(): AuthModel | null {
    return this.currentUserSubject.value;
  }

  // ✅ CHECK IF LOGGED IN
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value?.accessToken;
  }

  // 💾 SAVE AUTH TO LOCAL STORAGE
  private setAuthToLocalStorage(auth: AuthModel): void {
    localStorage.setItem('auth', JSON.stringify(auth));
  }

  // 📦 LOAD AUTH FROM LOCAL STORAGE
  private getAuthFromLocalStorage(): AuthModel | null {
    try {
      const authData = localStorage.getItem('auth');
      return authData ? (JSON.parse(authData) as AuthModel) : null;
    } catch {
      return null;
    }
  }

  // 🗑️ REMOVE AUTH DATA
  private removeAuthFromLocalStorage(): void {
    localStorage.removeItem('auth');
  }
}
