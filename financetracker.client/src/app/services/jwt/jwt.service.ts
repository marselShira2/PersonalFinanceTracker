import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'  
})
export class JwtService {
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  decodeToken(): any { return {}; }
  getUserPermissions(): string[] { return []; }
}
