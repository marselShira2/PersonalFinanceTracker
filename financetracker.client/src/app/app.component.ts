import { Component, OnInit, Renderer2 } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { InactivityService } from './services/ValidationFunctions/ActivityRefreshToken';
import { AuthService } from './services/auth.service';
import { CurrencyService } from './services/currency.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private startTime: number = 0;
  private endTime: number = 0;
  public loadTimeSec: string = '';

  constructor(
    private primengConfig: PrimeNGConfig,
    private router: Router,
    private renderer: Renderer2,
    private inactivityService: InactivityService,
    private authService: AuthService,
    private currencyService: CurrencyService
  ) { }

  async ngOnInit() {
    this.primengConfig.ripple = true;
   
    if (await this.authService.isLoggedIn()) {
      this.inactivityService.startMonitoring();
      // Initialize currency service if user is already logged in
      this.currencyService.initializeCurrency();
    }
  }

  setFooterColorBasedOnLoadTime(loadTime: number) {
    const footerElement = document.getElementById('time-counter');
    if (footerElement) {
      if (loadTime < 0.03) {
        this.renderer.setStyle(footerElement, 'color', 'green');
      } else if (loadTime >= 0.03 && loadTime <= 0.066) {
        this.renderer.setStyle(footerElement, 'color', 'orange');
      } else if (loadTime > 0.06) {
        this.renderer.setStyle(footerElement, 'color', 'red');
      }
    }
  }
}
