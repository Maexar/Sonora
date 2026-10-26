import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[appAutofocus]' })
export class AutofocusDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    setTimeout(() => this.el.nativeElement.focus());
  }
}
