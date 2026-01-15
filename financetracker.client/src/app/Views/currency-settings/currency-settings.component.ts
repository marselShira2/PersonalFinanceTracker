import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../../services/currency.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-currency-settings',
  template: `
    <p-card [header]="'CURRENCY.SETTINGS_TITLE' | translate" [subheader]="'CURRENCY.SETTINGS_SUBTITLE' | translate">
      <div class="p-fluid">
        <div class="field">
          <label for="currency">{{ 'CURRENCY.DEFAULT_CURRENCY' | translate }}</label>
          <p-dropdown 
            id="currency"
            [options]="currencies" 
            [(ngModel)]="selectedCurrency"
            optionLabel="name" 
            optionValue="code"
            [placeholder]="'CURRENCY.SELECT_PLACEHOLDER' | translate"
            (onChange)="onCurrencyChange()">
            <ng-template pTemplate="selectedItem">
              <div class="flex align-items-center gap-2" *ngIf="selectedCurrency">
                <span>{{getCurrencyDisplay(selectedCurrency)}}</span>
              </div>
            </ng-template>
            <ng-template let-currency pTemplate="item">
              <div class="flex align-items-center gap-2">
                <span>{{currency.code}} - {{currency.name}}</span>
              </div>
            </ng-template>
          </p-dropdown>
        </div>
        
        <div class="flex justify-content-end gap-2 mt-3">
          <p-button 
            [label]="'CURRENCY.SAVE_BTN' | translate" 
            icon="pi pi-check" 
            (onClick)="saveCurrency()"
            [disabled]="!selectedCurrency || saving">
          </p-button>
        </div>
      </div>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 1rem;
    }
  `]
})
export class CurrencySettingsComponent implements OnInit {
  currencies: Array<{code: string, name: string}> = [];
  selectedCurrency: string = '';
  saving = false;

  constructor(
    private currencyService: CurrencyService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currencies = this.currencyService.getSupportedCurrencies();
    this.loadCurrentCurrency();
  }

  loadCurrentCurrency(): void {
    this.currencyService.getCurrentCurrency().subscribe({
      next: (response) => {
        this.selectedCurrency = response.currency;
      },
      error: (error) => {
        console.error('Failed to load current currency:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('CURRENCY.ERROR_TITLE'),
          detail: this.translate.instant('CURRENCY.LOAD_ERROR')
        });
      }
    });
  }

  onCurrencyChange(): void {
    // Optional: Add any immediate feedback here
  }

  saveCurrency(): void {
    if (!this.selectedCurrency) return;

    this.saving = true;
    this.currencyService.updateDefaultCurrency(this.selectedCurrency).subscribe({
      next: (response) => {
        this.currencyService.setCurrency(this.selectedCurrency);
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('CURRENCY.SUCCESS_TITLE'),
          detail: this.translate.instant('CURRENCY.UPDATE_SUCCESS', { currency: this.selectedCurrency })
        });
        this.saving = false;
      },
      error: (error) => {
        console.error('Failed to update currency:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('CURRENCY.ERROR_TITLE'),
          detail: this.translate.instant('CURRENCY.UPDATE_ERROR')
        });
        this.saving = false;
      }
    });
  }

  getCurrencyDisplay(code: string): string {
    const currency = this.currencies.find(c => c.code === code);
    return currency ? `${code} - ${currency.name}` : code;
  }
}