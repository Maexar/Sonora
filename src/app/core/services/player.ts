import { Injectable, computed, inject, signal } from '@angular/core';
import { Track } from '../models/track';
import { YoutubeAudioEngine, youtubeVideoId } from './youtube-audio';

export type RepeatMode = 'off' | 'all' | 'one';

/**
 * Motor de reprodução (Model). Escolhe a fonte conforme a faixa:
 * URL do YouTube toca via IFrame Player API (somente áudio, iframe oculto),
 * URL direta de arquivo toca com HTMLAudioElement e, sem URL, a
 * reprodução é simulada com um relógio interno.
 */
@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly youtube = inject(YoutubeAudioEngine);

  private readonly queueSig = signal<Track[]>([]);
  private readonly indexSig = signal(-1);

  readonly isPlaying = signal(false);
  readonly progress = signal(0);
  readonly volume = signal(0.8);
  readonly shuffle = signal(false);
  readonly repeat = signal<RepeatMode>('off');

  readonly queue = this.queueSig.asReadonly();
  readonly current = computed<Track | null>(() => this.queueSig()[this.indexSig()] ?? null);

  /** Duração real informada pelo YouTube, quando difere da cadastrada. */
  private readonly durationOverride = signal<number | null>(null);
  readonly duration = computed(() => this.durationOverride() ?? this.current()?.duration ?? 0);

  private timer: ReturnType<typeof setInterval> | null = null;
  private audio: HTMLAudioElement | null = null;
  private audioTrackId: string | null = null;
  private youtubeTrackId: string | null = null;

  constructor() {
    this.youtube.onTime = (seconds) => this.progress.set(seconds);
    this.youtube.onDuration = (seconds) => this.durationOverride.set(seconds);
    this.youtube.onEnded = () => this.onEnded();
  }

  playQueue(tracks: Track[], startIndex = 0): void {
    if (tracks.length === 0) return;
    this.queueSig.set([...tracks]);
    this.startAt(Math.min(startIndex, tracks.length - 1));
  }

  toggle(): void {
    if (!this.current()) return;
    if (this.isPlaying()) {
      this.isPlaying.set(false);
      this.stopEngine();
    } else {
      this.isPlaying.set(true);
      this.startEngine();
    }
  }

  next(): void {
    const length = this.queueSig().length;
    if (length === 0) return;
    if (this.shuffle() && length > 1) {
      this.startAt(this.randomIndex());
    } else {
      this.startAt((this.indexSig() + 1) % length);
    }
  }

  previous(): void {
    const length = this.queueSig().length;
    if (length === 0) return;
    if (this.progress() > 3) {
      this.seek(0);
      return;
    }
    this.startAt((this.indexSig() - 1 + length) % length);
  }

  seek(seconds: number): void {
    const track = this.current();
    if (!track) return;
    const value = Math.min(Math.max(seconds, 0), this.duration());
    this.progress.set(value);
    if (this.youtubeTrackId === track.id) {
      this.youtube.seek(value);
    } else if (this.audio && this.audioTrackId === track.id) {
      this.audio.currentTime = value;
    }
  }

  setVolume(value: number): void {
    const volume = Math.min(Math.max(value, 0), 1);
    this.volume.set(volume);
    if (this.audio) this.audio.volume = volume;
    if (this.youtubeTrackId !== null) this.youtube.setVolume(volume);
  }

  toggleShuffle(): void {
    this.shuffle.update((v) => !v);
  }

  cycleRepeat(): void {
    this.repeat.update((mode) => (mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off'));
  }

  /** Remove uma música da fila (chamado quando ela sai da biblioteca). */
  purge(trackId: string): void {
    const queue = this.queueSig();
    if (!queue.some((t) => t.id === trackId)) return;
    if (this.current()?.id === trackId) {
      this.stopEngine();
      this.youtube.stop();
      this.disposeAudio();
      this.youtubeTrackId = null;
      this.isPlaying.set(false);
      this.progress.set(0);
      this.durationOverride.set(null);
      this.queueSig.set([]);
      this.indexSig.set(-1);
      return;
    }
    const currentId = this.current()?.id ?? null;
    const next = queue.filter((t) => t.id !== trackId);
    this.queueSig.set(next);
    this.indexSig.set(next.findIndex((t) => t.id === currentId));
  }

  /** Sincroniza a fila após a edição de uma música. */
  sync(track: Track): void {
    this.queueSig.update((queue) => queue.map((t) => (t.id === track.id ? track : t)));
  }

  private startAt(index: number): void {
    this.stopEngine();
    this.indexSig.set(index);
    this.progress.set(0);
    this.durationOverride.set(null);
    this.isPlaying.set(true);
    this.startEngine();
  }

  private onEnded(): void {
    if (this.repeat() === 'one') {
      this.startAt(this.indexSig());
      return;
    }
    const length = this.queueSig().length;
    if (this.shuffle() && length > 1) {
      this.startAt(this.randomIndex());
      return;
    }
    const nextIndex = this.indexSig() + 1;
    if (nextIndex < length) {
      this.startAt(nextIndex);
    } else if (this.repeat() === 'all') {
      this.startAt(0);
    } else {
      this.stopEngine();
      this.isPlaying.set(false);
      this.progress.set(this.duration());
    }
  }

  private randomIndex(): number {
    const length = this.queueSig().length;
    let index = this.indexSig();
    while (index === this.indexSig()) {
      index = Math.floor(Math.random() * length);
    }
    return index;
  }

  private startEngine(): void {
    const track = this.current();
    if (!track) return;

    const videoId = track.audioUrl ? youtubeVideoId(track.audioUrl) : null;
    if (videoId) {
      this.startYoutube(track, videoId);
      return;
    }
    // A faixa atual não é do YouTube: garante silêncio no iframe
    if (this.youtubeTrackId !== null) {
      this.youtube.stop();
      this.youtubeTrackId = null;
    }
    if (track.audioUrl) {
      this.startAudio(track);
      return;
    }
    this.timer = setInterval(() => {
      const playing = this.current();
      if (!playing) return;
      const value = this.progress() + 0.25;
      if (value >= playing.duration) {
        this.onEnded();
      } else {
        this.progress.set(value);
      }
    }, 250);
  }

  private startYoutube(track: Track, videoId: string): void {
    this.disposeAudio();
    if (this.youtubeTrackId === track.id) {
      this.youtube.resume();
    } else {
      this.youtubeTrackId = track.id;
      this.youtube.play(videoId, this.progress(), this.volume());
    }
  }

  private startAudio(track: Track): void {
    if (!this.audio || this.audioTrackId !== track.id) {
      this.disposeAudio();
      this.audio = new Audio(track.audioUrl);
      this.audioTrackId = track.id;
      this.audio.volume = this.volume();
      this.audio.addEventListener('timeupdate', () => {
        this.progress.set(this.audio?.currentTime ?? 0);
      });
      this.audio.addEventListener('ended', () => this.onEnded());
    }
    this.audio.currentTime = this.progress();
    void this.audio.play().catch(() => {
      // URL inacessível: mantém a simulação parada sem quebrar a interface
      this.isPlaying.set(false);
    });
  }

  private stopEngine(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.audio?.pause();
    if (this.youtubeTrackId !== null) this.youtube.pause();
  }

  private disposeAudio(): void {
    this.audio?.pause();
    this.audio = null;
    this.audioTrackId = null;
  }
}
