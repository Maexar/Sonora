import { Directive, ElementRef, inject } from '@angular/core';

/** Realce radial que segue o ponteiro sobre o elemento. */
@Directive({
  selector: '[appGlow]',
  host: {
    class: 'glow',
    '(pointermove)': 'onMove($event)',
  },
})
export class GlowDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onMove(event: PointerEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.el.nativeElement.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    this.el.nativeElement.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }
}
