import { Component, computed, input } from '@angular/core';

/** Arte de capa gerada por gradiente a partir da matiz da música. */
@Component({
  selector: 'app-cover',
  template: `
    <div
      class="cover"
      [class.round]="round()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.background]="background()"
    >
      <span class="letter" [style.font-size.px]="size() * 0.42">{{ letter() }}</span>
    </div>
  `,
  styles: `
    .cover {
      border-radius: 8px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.09);
    }
    .cover.round { border-radius: 50%; }
    .letter {
      font-family: var(--font-display);
      color: rgba(255, 255, 255, 0.88);
      line-height: 1;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
    }
  `,
})
export class Cover {
  readonly hue = input(210);
  readonly label = input('');
  readonly size = input(44);
  readonly round = input(false);

  readonly background = computed(
    () =>
      `linear-gradient(140deg, hsl(${this.hue()} 62% 52%), hsl(${(this.hue() + 50) % 360} 70% 30%))`,
  );

  readonly letter = computed(() => (this.label().trim().charAt(0) || '♪').toUpperCase());
}
