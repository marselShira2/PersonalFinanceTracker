import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[phoneNumberOnly]'
})
export class phoneNumberDirective {
  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let sanitizedValue = input.value.replace(/[^0-9]/g, '');

    // Limit to 10 digits
    if (sanitizedValue.length > 10) {
      sanitizedValue = sanitizedValue.slice(0, 10);
    }

    // Regular expression to validate the phone number pattern
    const validPattern = /^06[7-9]\d{7}$/;
    const isValid = validPattern.test(sanitizedValue);

    // Update the input value and form control value
    input.value = sanitizedValue;
    this.ngControl.control?.setValue(sanitizedValue);

    // If the sanitized value is exactly 10 digits and valid, clear the error
    if (sanitizedValue.length === 10 && isValid) {
      this.ngControl.control?.setErrors(null);
    } else {
      this.ngControl.control?.setErrors({ invalid: true });
    }
    if (input.value.length == 0) {
      this.ngControl.control?.setErrors(null);
    };
  }

  @HostListener('focus', ['$event'])
  onFocus(event: Event) { 
    // Clear the error when the input is focused
    this.ngControl.control?.setErrors({ invalid: false });
  }

}
