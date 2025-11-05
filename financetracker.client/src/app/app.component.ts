import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';
import { AuthService } from './modules/auth/auth.service';
import { PrimeNGConfig } from 'primeng/api'; 

@Component({
  // tslint:disable-next-line:component-selector
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor( 
    private modeService: ThemeModeService,
    private authService: AuthService,
    private primengConfig: PrimeNGConfig, 
  ) {
    // register translations
    
  }

  ngOnInit() {
    this.modeService.init();
    this.configureCalendarLocale(); // Kalendari shqip 
  }

  private configureCalendarLocale() {
    this.primengConfig.setTranslation({
      dayNames: ["E Diel", "E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"],
      dayNamesShort: ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"],
      dayNamesMin: ["D", "H", "M", "M", "E", "P", "S"],
      monthNames: [
        "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
        "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"
      ],
      monthNamesShort: ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"],
      today: "Sot",
      clear: "Pastro"
    });
  }


}
