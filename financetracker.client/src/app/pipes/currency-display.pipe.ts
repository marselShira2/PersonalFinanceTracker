import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'currencyDisplay'
})
export class CurrencyDisplayPipe implements PipeTransform {
  
  constructor(private currencyService: CurrencyService) {}

  transform(transaction: any, showOriginal: boolean = false): string {
    if (!transaction) return '';

    if (showOriginal || !transaction.amountConverted) {
      const symbol = this.currencyService.getCurrencySymbol(transaction.currency);
      return `${symbol}${transaction.amount.toFixed(2)}`;
    }

    // Show converted amount
    let currentCurrency = 'USD';
    this.currencyService.currentCurrency$.subscribe(currency => {
      currentCurrency = currency;
    });

    const symbol = this.currencyService.getCurrencySymbol(currentCurrency);
    return `${symbol}${transaction.amountConverted.toFixed(2)}`;
  }
}