import { Injectable, computed, inject } from '@angular/core';
import { PlayerService } from '../../core/services/player';

/** ViewModel da barra de reprodução: estado pronto para a View. */
@Injectable()
export class PlayerViewModel {
  private readonly player = inject(PlayerService);

  readonly track = this.player.current;
  readonly isPlaying = this.player.isPlaying;
  readonly progress = this.player.progress;
  readonly volume = this.player.volume;
  readonly shuffle = this.player.shuffle;
  readonly repeat = this.player.repeat;

  readonly duration = this.player.duration;
  readonly percent = computed(() => {
    const duration = this.duration();
    return duration > 0 ? (this.progress() / duration) * 100 : 0;
  });

  toggle(): void {
    this.player.toggle();
  }

  next(): void {
    this.player.next();
  }

  previous(): void {
    this.player.previous();
  }

  seekPercent(percent: number): void {
    this.player.seek((percent / 100) * this.duration());
  }

  setVolume(value: number): void {
    this.player.setVolume(value);
  }

  toggleShuffle(): void {
    this.player.toggleShuffle();
  }

  cycleRepeat(): void {
    this.player.cycleRepeat();
  }
}
