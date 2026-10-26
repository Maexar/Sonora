import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LibraryStore } from '../../core/services/library-store';
import { PlayerService } from '../../core/services/player';
import { ToastService } from '../../core/services/toast';
import { Track } from '../../core/models/track';

/** ViewModel do detalhe de playlist. */
@Injectable()
export class PlaylistDetailViewModel {
  private readonly store = inject(LibraryStore);
  private readonly player = inject(PlayerService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  private readonly idSig = signal('');

  readonly editOpen = signal(false);
  readonly addOpen = signal(false);

  readonly playlist = computed(
    () => this.store.playlists().find((p) => p.id === this.idSig()) ?? null,
  );

  readonly tracks = computed(() => {
    const playlist = this.playlist();
    return playlist ? this.store.tracksOf(playlist) : [];
  });

  readonly duration = computed(() => this.tracks().reduce((sum, t) => sum + t.duration, 0));

  readonly hues = computed(() => this.tracks().slice(0, 4).map((t) => t.hue));

  /** Músicas da biblioteca que ainda não estão na playlist. */
  readonly available = computed(() => {
    const playlist = this.playlist();
    if (!playlist) return [];
    return this.store.tracks().filter((t) => !playlist.trackIds.includes(t.id));
  });

  setId(id: string): void {
    this.idSig.set(id);
  }

  playAll(): void {
    if (this.tracks().length > 0) {
      this.player.playQueue(this.tracks());
    }
  }

  add(track: Track): void {
    const playlist = this.playlist();
    if (!playlist) return;
    this.store.addToPlaylist(playlist.id, track.id);
  }

  removeTrack(track: Track): void {
    const playlist = this.playlist();
    if (!playlist) return;
    this.store.removeFromPlaylist(playlist.id, track.id);
    this.toast.show(`“${track.title}” saiu da playlist`);
  }

  reorder(index: number, delta: number): void {
    const playlist = this.playlist();
    if (!playlist) return;
    this.store.moveInPlaylist(playlist.id, index, delta);
  }

  rename(name: string, description: string): void {
    const playlist = this.playlist();
    if (!playlist) return;
    this.store.renamePlaylist(playlist.id, name.trim(), description.trim());
    this.editOpen.set(false);
    this.toast.show('Playlist atualizada');
  }

  destroy(): void {
    const playlist = this.playlist();
    if (!playlist) return;
    this.store.removePlaylist(playlist.id);
    this.toast.show(`Playlist “${playlist.name}” excluída`);
    void this.router.navigate(['/playlists']);
  }
}
