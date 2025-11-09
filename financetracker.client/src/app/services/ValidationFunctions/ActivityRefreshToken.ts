import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, interval } from 'rxjs';
import { AuthResponse } from '../../interfaces/auth-response'; 
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})

export class InactivityService {
  private lastActivityTime: number = Date.now();
  private timerSubscription: Subscription | null = null;

  // Check interval (every 10 minutes)
  private readonly CHECK_INTERVAL = 60 * 60 * 1000;

  // Refresh the token if it's expiring within the next 5 minutes
  private readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; 

  constructor(private router: Router,
    private ngZone: NgZone,
    private authService: AuthService) {
    this.setupActivityListeners();
  }

  private setupActivityListeners() {
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('click', () => this.handleUserActivity());
      document.addEventListener('keypress', () => this.handleUserActivity());
      document.addEventListener('mousemove', () => this.handleUserActivity());
    });
  }

  private handleUserActivity() {
    this.lastActivityTime = Date.now();
  }

  startMonitoring() {
    // Don't start another timer if one is already running
    if (this.timerSubscription) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.timerSubscription = interval(this.CHECK_INTERVAL).subscribe(() => {
        this.checkSessionStatus();
      });
    });
  }

  stopMonitoring() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  private async checkSessionStatus() {
    const token = this.authService.getToken();
    const refreshToken = this.authService.getRefreshToken();
    const refreshTokenExpiry = this.authService.getRefreshTokenExpiryTime();
    const lastActivityDifference = Date.now() - this.lastActivityTime;

    if (!token) {
      this.logoutUser();
      return;
    }
    if (!refreshToken) {
      this.logoutUser();
      return;
    }
    if (!refreshTokenExpiry) {
      this.logoutUser();
      return;
    }
    // If no token, user is logged out, so stop monitoring , 3600000 = 1 ore
    if (lastActivityDifference > (60 * 60 * 1000)) {
      this.logoutUser();
      return;
    }

      const isRefreshTokenExpired = Date.now() >= new Date(refreshTokenExpiry).getTime();
      // If refresh token is expired, log the user out immediately
      if (isRefreshTokenExpired) {
        this.ngZone.run(() => {
          this.logoutUser();
        });
        return;
      }

      // Check the Access Token
      const decodedToken = jwtDecode(token);
      const accessTokenExpiresAt = decodedToken.exp! * 1000;
      const timeUntilExpiry = accessTokenExpiresAt - Date.now();

      // If the access token is within the refresh buffer, refresh it
    if (timeUntilExpiry < this.TOKEN_REFRESH_BUFFER) {

        // We must run the refresh token call inside Angular's zone
        this.ngZone.run(async () => {
          try {
            const success = await this.authService.refreshesToken().toPromise();
            if (success == false) {
              this.logoutUser();
            }
          } catch (error) {
            this.logoutUser();
          }
        });
    }
  }
  logoutUser() {
    this.stopMonitoring();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
