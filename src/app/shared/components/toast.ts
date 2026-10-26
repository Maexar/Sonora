import { Component, input } from '@angular/core';

@Component({
  selector: 'app-toast',
  template: `<div class="toast" [style.bottom.px]="112 + offset() * 52">{{ message() }}</div>`,
  styles: `
    .toast {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      z-index: 200;
      padding: 10px 18px;
      border-radius: 999px;
      background: var(--panel-2);
      border: 1px solid var(--line);
      color: var(--ink);
      font-size: 13.5px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
      animation: toast-in 0.25s ease both;
      white-space: nowrap;
    }
    @keyframes toast-in {
      from { opacity: 0; transform: translate(-50%, 8px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  `,
})
export class Toast {
  readonly message = input('');
  readonly offset = input(0);
}
