import { Component, inject } from '@angular/core';
import { Cover } from '../../shared/components/cover';
import { Icon } from '../../shared/components/icon';
import { DurationPipe } from '../../shared/pipes/duration-pipe';
import { PlayerViewModel } from './player-viewmodel';

@Component({
  selector: 'app-player-bar',
  imports: [Cover, Icon, DurationPipe],
  providers: [PlayerViewModel],
  templateUrl: './player-bar.html',
  styleUrl: './player-bar.css',
})
export class PlayerBar {
  protected readonly vm = inject(PlayerViewModel);

  protected onSeek(event: Event): void {
    this.vm.seekPercent(Number((event.target as HTMLInputElement).value));
  }

  protected onVolume(event: Event): void {
    this.vm.setVolume(Number((event.target as HTMLInputElement).value) / 100);
  }
}
