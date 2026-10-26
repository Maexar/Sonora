import { Component, input } from '@angular/core';

export type IconName =
  | 'play' | 'pause' | 'next' | 'prev' | 'shuffle' | 'repeat'
  | 'heart' | 'plus' | 'search' | 'more' | 'trash' | 'edit'
  | 'music' | 'volume' | 'up' | 'down' | 'close' | 'disc';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('play') {
          <path d="M7.5 4.8v14.4L19 12z" fill="currentColor" stroke="none" />
        }
        @case ('pause') {
          <rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
          <rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
        }
        @case ('next') {
          <path d="M5 5.5v13l9.5-6.5z" fill="currentColor" stroke="none" />
          <rect x="16.5" y="5.5" width="2.4" height="13" rx="1" fill="currentColor" stroke="none" />
        }
        @case ('prev') {
          <path d="M19 5.5v13L9.5 12z" fill="currentColor" stroke="none" />
          <rect x="5.1" y="5.5" width="2.4" height="13" rx="1" fill="currentColor" stroke="none" />
        }
        @case ('shuffle') {
          <path d="M16 3.5h4.5V8" />
          <path d="M3.5 20.5 20.5 3.5" />
          <path d="M20.5 16v4.5H16" />
          <path d="m14.5 14.5 6 6" />
          <path d="m3.5 3.5 6 6" />
        }
        @case ('repeat') {
          <path d="m17 2 4 4-4 4" />
          <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
          <path d="m7 22-4-4 4-4" />
          <path d="M21 13v1a4 4 0 0 1-4 4H3" />
        }
        @case ('heart') {
          <path d="M12 20.5 4.8 13.4A5 5 0 0 1 11.5 6l.5.5.5-.5a5 5 0 0 1 6.7 7.4z" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4-4" />
        }
        @case ('more') {
          <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
        }
        @case ('trash') {
          <path d="M3.5 6.5h17" />
          <path d="M8.5 6.5v-2h7v2" />
          <path d="m6 6.5 1 14h10l1-14" />
        }
        @case ('edit') {
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        }
        @case ('music') {
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        }
        @case ('volume') {
          <path d="M11 5 6 9H2.5v6H6l5 4z" fill="currentColor" stroke="none" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        }
        @case ('up') {
          <path d="m18 15-6-6-6 6" />
        }
        @case ('down') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('close') {
          <path d="M18 6 6 18M6 6l12 12" />
        }
        @case ('disc') {
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; line-height: 0; }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
}
