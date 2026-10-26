import { Component, computed, inject, input, output, signal } from '@angular/core';
import { LibraryStore } from '../../core/services/library-store';
import { PlayerService } from '../../core/services/player';
import { ToastService } from '../../core/services/toast';
import { Track } from '../../core/models/track';
import { GlowDirective } from '../directives/glow';
import { DurationPipe } from '../pipes/duration-pipe';
import { Cover } from './cover';
import { Icon } from './icon';

/**
 * Listagem de músicas reutilizada por biblioteca, favoritas e playlists.
 * As flags de entrada ligam ações específicas de cada contexto.
 */
@Component({
  selector: 'app-track-table',
  imports: [Cover, Icon, DurationPipe, GlowDirective],
  host: {
    '(document:click)': 'closeMenu()',
  },
  templateUrl: './track-table.html',
  styleUrl: './track-table.css',
})
export class TrackTable {
  readonly tracks = input.required<Track[]>();
  readonly editable = input(false);
  readonly removable = input(false);
  readonly reorderable = input(false);

  readonly edit = output<Track>();
  readonly deleteTrack = output<Track>();
  readonly removeFromList = output<Track>();
  readonly reorder = output<{ index: number; delta: number }>();

  private readonly player = inject(PlayerService);
  private readonly store = inject(LibraryStore);
  private readonly toast = inject(ToastService);

  protected readonly playlists = this.store.playlists;
  protected readonly menuFor = signal<string | null>(null);
  protected readonly currentId = computed(() => this.player.current()?.id ?? null);
  protected readonly playing = this.player.isPlaying;

  protected play(index: number): void {
    const track = this.tracks()[index];
    if (this.player.current()?.id === track.id) {
      this.player.toggle();
      return;
    }
    this.player.playQueue(this.tracks(), index);
  }

  protected toggleFavorite(track: Track): void {
    this.store.toggleFavorite(track.id);
  }

  protected toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.menuFor.update((open) => (open === id ? null : id));
  }

  protected closeMenu(): void {
    this.menuFor.set(null);
  }

  protected addTo(playlistId: string, track: Track): void {
    const added = this.store.addToPlaylist(playlistId, track.id);
    const name = this.store.playlistById(playlistId)?.name ?? '';
    this.toast.show(added ? `Adicionada a “${name}”` : `Já está em “${name}”`);
    this.closeMenu();
  }
}
