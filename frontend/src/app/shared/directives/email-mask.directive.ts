import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appEmailMask]',
  standalone: true
})
export class EmailMaskDirective {
  private el = inject(ElementRef);
  private control = inject(NgControl, { optional: true });

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove spaces and convert to lowercase
    value = value.replace(/\s/g, '').toLowerCase();

    // Update the input element
    input.value = value;

    // Update the form control if it exists
    if (this.control && this.control.control) {
      this.control.control.setValue(value, { emitEvent: false });
    }
  }
}
