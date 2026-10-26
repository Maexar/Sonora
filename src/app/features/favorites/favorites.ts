import { Component, computed, inject } from '@angular/core';
import { LibraryStore } from '../../core/services/library-store';
import { PlayerService } from '../../core/services/player';
import { Icon } from '../../shared/components/icon';
import { TrackTable } from '../../shared/components/track-table';
import { DurationPipe } from '../../shared/pipes/duration-pipe';

@Component({
  selector: 'app-favorites',
  imports: [TrackTable, Icon, DurationPipe],
  templateUrl: './favorites.html',
})
export class Favorites {
  private readonly store = inject(LibraryStore);
  private readonly player = inject(PlayerService);

  protected readonly favorites = this.store.favorites;
  protected readonly duration = computed(() =>
    this.favorites().reduce((sum, t) => sum + t.duration, 0),
  );

  protected playAll(): void {
    if (this.favorites().length > 0) {
      this.player.playQueue(this.favorites());
    }
  }
}
