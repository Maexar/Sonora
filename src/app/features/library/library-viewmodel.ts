import { Injectable, computed, inject, signal } from '@angular/core';
import { LibraryStore } from '../../core/services/library-store';
import { PlayerService } from '../../core/services/player';
import { ToastService } from '../../core/services/toast';
import { Track, TrackDraft } from '../../core/models/track';

export type LibrarySort = 'recent' | 'title' | 'artist';

/** ViewModel da biblioteca: filtro, ordenação e comandos da View. */
@Injectable()
export class LibraryViewModel {
  private readonly store = inject(LibraryStore);
  private readonly player = inject(PlayerService);
  private readonly toast = inject(ToastService);

  readonly search = signal('');
  readonly sort = signal<LibrarySort>('recent');
  readonly formOpen = signal(false);
  readonly editing = signal<Track | null>(null);

  readonly tracks = computed(() => {
    const term = this.search().trim().toLowerCase();
    const filtered = this.store
      .tracks()
      .filter(
        (t) =>
          term === '' ||
          [t.title, t.artist, t.album].some((value) => value.toLowerCase().includes(term)),
      );
    const sorted = [...filtered];
    switch (this.sort()) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
        break;
      case 'artist':
        sorted.sort((a, b) => a.artist.localeCompare(b.artist, 'pt-BR'));
        break;
      case 'recent':
        sorted.sort((a, b) => b.addedAt - a.addedAt);
        break;
    }
    return sorted;
  });

  readonly totalDuration = computed(() =>
    this.tracks().reduce((sum, track) => sum + track.duration, 0),
  );

  playAll(): void {
    if (this.tracks().length > 0) {
      this.player.playQueue(this.tracks());
    }
  }

  openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  openEdit(track: Track): void {
    this.editing.set(track);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(draft: TrackDraft): void {
    const editing = this.editing();
    if (editing) {
      this.store.updateTrack(editing.id, draft);
      const updated = this.store.trackById(editing.id);
      if (updated) this.player.sync(updated);
      this.toast.show('Música atualizada');
    } else {
      this.store.addTrack(draft);
      this.toast.show(`“${draft.title}” entrou na biblioteca`);
    }
    this.formOpen.set(false);
  }

  remove(track: Track): void {
    this.player.purge(track.id);
    this.store.removeTrack(track.id);
    this.toast.show('Música removida da biblioteca');
  }
}
