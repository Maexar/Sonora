import { Injectable, computed, inject, signal } from '@angular/core';
import { LibraryStore } from '../../core/services/library-store';
import { ToastService } from '../../core/services/toast';
import { Playlist } from '../../core/models/playlist';

export interface PlaylistCard {
  playlist: Playlist;
  count: number;
  duration: number;
  hues: number[];
}

/** ViewModel da listagem de playlists. */
@Injectable()
export class PlaylistsViewModel {
  private readonly store = inject(LibraryStore);
  private readonly toast = inject(ToastService);

  readonly createOpen = signal(false);

  readonly cards = computed<PlaylistCard[]>(() =>
    this.store.playlists().map((playlist) => {
      const tracks = this.store.tracksOf(playlist);
      return {
        playlist,
        count: tracks.length,
        duration: tracks.reduce((sum, t) => sum + t.duration, 0),
        hues: tracks.slice(0, 4).map((t) => t.hue),
      };
    }),
  );

  create(name: string, description: string): void {
    const playlist = this.store.createPlaylist(name.trim(), description.trim());
    this.toast.show(`Playlist “${playlist.name}” criada`);
    this.createOpen.set(false);
  }
}
