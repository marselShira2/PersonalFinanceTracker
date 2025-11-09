import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[niptOnly]'
})
export class niptOnlyDirective {
  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = input.value.replace(/[^0-9A-Z]/g, ''); // Allow only uppercase letters and digits

    const validPattern = /^[A-Z]\d{8}[A-Z]$/;
    const isValid = validPattern.test(sanitizedValue);

    if (input.value !== sanitizedValue || !isValid) {
      input.value = sanitizedValue;
      this.ngControl.control?.setValue(sanitizedValue);
      this.ngControl.control?.setErrors({ invalid: true });
    } else {
      this.ngControl.control?.setErrors(null); // Clear error if valid
    }
  }
}
