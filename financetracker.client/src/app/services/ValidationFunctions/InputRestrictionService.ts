import { Injectable } from '@angular/core'; 

@Injectable({
  providedIn: 'root'
})
export class InputRestrictionService {
  restrictAlphanumericInput(value: string): string {
    const restrictedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    // Limit to a maximum of 6 characters
    return restrictedValue.substring(0, 6);
  }
  rectrictWorkGroupCodeInput(value: string): string {
    const restrictedValue = value.replace(/[^a-zA-Z0-9-]/g, '');

    return restrictedValue.substring(0, 15);
  }
  restrictTempalteCodeInput(value: string): string {
    const restrictedValue = value.replace(/[^a-zA-Z0-9]/g, '');

    return restrictedValue.substring(0, 15);
  }
}
