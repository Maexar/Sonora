import { Component, input, output } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-modal',
  imports: [Icon],
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (open()) {
      <div class="backdrop" (click)="close.emit()">
        <div class="panel" role="dialog" [attr.aria-label]="title()" (click)="$event.stopPropagation()">
          <header class="panel-head">
            <h2>{{ title() }}</h2>
            <button class="icon-btn" type="button" (click)="close.emit()" aria-label="Fechar">
              <app-icon name="close" [size]="16" />
            </button>
          </header>
          <ng-content />
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 120;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgba(8, 9, 14, 0.66);
      backdrop-filter: blur(6px);
      animation: fade-in 0.18s ease both;
    }
    .panel {
      width: min(460px, 100%);
      max-height: min(78vh, 640px);
      overflow-y: auto;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 22px 24px 24px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
      animation: rise-in 0.22s ease both;
    }
    .panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .panel-head h2 {
      font-family: var(--font-display);
      font-size: 21px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    @keyframes fade-in { from { opacity: 0; } }
    @keyframes rise-in { from { opacity: 0; transform: translateY(10px); } }
    @media (prefers-reduced-motion: reduce) {
      .backdrop, .panel { animation: none; }
    }
  `,
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly close = output<void>();

  protected onEscape(): void {
    if (this.open()) this.close.emit();
  }
}
