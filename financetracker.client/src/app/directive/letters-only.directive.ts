import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[lettersOnly]'
})
export class LettersOnlyDirective {
  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const initialValue = input.value;

    // Remove all non-letter characters
    const lettersOnly = initialValue.replace(/[^a-zA-Z]/g, '');
    if (initialValue !== lettersOnly) {
      input.value = lettersOnly;
      this.ngControl.control?.setValue(lettersOnly);
      event.stopPropagation();
    }
  }
}
