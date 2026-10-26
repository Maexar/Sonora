import { Injectable, computed, effect, signal } from '@angular/core';
import { Playlist } from '../models/playlist';
import { Track, TrackDraft } from '../models/track';

const STORAGE_KEY = 'sonora.library.v2';

interface LibraryState {
  tracks: Track[];
  playlists: Playlist[];
}

/**
 * Camada de Model do MVVM: única fonte de verdade da biblioteca.
 * Estado exposto por signals somente leitura; mutações apenas via métodos.
 */
@Injectable({ providedIn: 'root' })
export class LibraryStore {
  private readonly state = signal<LibraryState>(load());

  readonly tracks = computed(() => this.state().tracks);
  readonly playlists = computed(() => this.state().playlists);
  readonly favorites = computed(() => this.state().tracks.filter((t) => t.favorite));

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
    });
  }

  trackById(id: string): Track | undefined {
    return this.state().tracks.find((t) => t.id === id);
  }

  playlistById(id: string): Playlist | undefined {
    return this.state().playlists.find((p) => p.id === id);
  }

  tracksOf(playlist: Playlist): Track[] {
    const byId = new Map(this.state().tracks.map((t) => [t.id, t] as const));
    return playlist.trackIds
      .map((id) => byId.get(id))
      .filter((t): t is Track => t !== undefined);
  }

  addTrack(draft: TrackDraft): Track {
    const track: Track = {
      id: uid(),
      title: draft.title,
      artist: draft.artist,
      album: draft.album,
      duration: draft.duration,
      audioUrl: draft.audioUrl,
      hue: Math.floor(Math.random() * 360),
      favorite: false,
      addedAt: Date.now(),
    };
    this.state.update((s) => ({ ...s, tracks: [track, ...s.tracks] }));
    return track;
  }

  updateTrack(id: string, draft: TrackDraft): void {
    this.state.update((s) => ({
      ...s,
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, ...draft } : t)),
    }));
  }

  removeTrack(id: string): void {
    this.state.update((s) => ({
      tracks: s.tracks.filter((t) => t.id !== id),
      playlists: s.playlists.map((p) => ({
        ...p,
        trackIds: p.trackIds.filter((tid) => tid !== id),
      })),
    }));
  }

  toggleFavorite(id: string): void {
    this.state.update((s) => ({
      ...s,
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)),
    }));
  }

  createPlaylist(name: string, description: string): Playlist {
    const playlist: Playlist = {
      id: uid(),
      name,
      description,
      trackIds: [],
      createdAt: Date.now(),
    };
    this.state.update((s) => ({ ...s, playlists: [...s.playlists, playlist] }));
    return playlist;
  }

  renamePlaylist(id: string, name: string, description: string): void {
    this.state.update((s) => ({
      ...s,
      playlists: s.playlists.map((p) => (p.id === id ? { ...p, name, description } : p)),
    }));
  }

  removePlaylist(id: string): void {
    this.state.update((s) => ({
      ...s,
      playlists: s.playlists.filter((p) => p.id !== id),
    }));
  }

  /** Retorna false quando a música já estava na playlist. */
  addToPlaylist(playlistId: string, trackId: string): boolean {
    const playlist = this.playlistById(playlistId);
    if (!playlist || playlist.trackIds.includes(trackId)) return false;
    this.state.update((s) => ({
      ...s,
      playlists: s.playlists.map((p) =>
        p.id === playlistId ? { ...p, trackIds: [...p.trackIds, trackId] } : p,
      ),
    }));
    return true;
  }

  removeFromPlaylist(playlistId: string, trackId: string): void {
    this.state.update((s) => ({
      ...s,
      playlists: s.playlists.map((p) =>
        p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p,
      ),
    }));
  }

  moveInPlaylist(playlistId: string, index: number, delta: number): void {
    this.state.update((s) => ({
      ...s,
      playlists: s.playlists.map((p) => {
        if (p.id !== playlistId) return p;
        const target = index + delta;
        if (target < 0 || target >= p.trackIds.length) return p;
        const trackIds = [...p.trackIds];
        [trackIds[index], trackIds[target]] = [trackIds[target], trackIds[index]];
        return { ...p, trackIds };
      }),
    }));
  }
}

function uid(): string {
  return crypto.randomUUID();
}

function load(): LibraryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LibraryState;
  } catch {
    // estado corrompido: recomeça vazio
  }
  return { tracks: [], playlists: [] };
}
