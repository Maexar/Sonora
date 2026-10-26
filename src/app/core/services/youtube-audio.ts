import { Injectable } from '@angular/core';

/** Extrai o id do vídeo de qualquer formato de URL do YouTube; null se não for YouTube. */
export function youtubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, '');
  const isValid = (id: string | null): id is string => !!id && /^[\w-]{11}$/.test(id);

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0];
    return isValid(id) ? id : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    const fromQuery = parsed.searchParams.get('v');
    if (isValid(fromQuery)) return fromQuery;
    const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
    return match ? match[1] : null;
  }
  return null;
}

/* Tipagem mínima da YouTube IFrame Player API (carregada em tempo de execução). */
interface YTPlayer {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  getDuration(): number;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    config: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: () => void;
        onStateChange: (event: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Motor de áudio para músicas do YouTube, via IFrame Player API.
 * O player fica em um iframe invisível fora da tela: só o áudio chega ao usuário.
 */
@Injectable({ providedIn: 'root' })
export class YoutubeAudioEngine {
  /** Definidos pelo PlayerService. */
  onTime: (seconds: number) => void = () => {};
  onDuration: (seconds: number) => void = () => {};
  onEnded: () => void = () => {};

  private player: YTPlayer | null = null;
  private videoId: string | null = null;
  private ready = false;
  private pendingSeek: number | null = null;
  private poll: ReturnType<typeof setInterval> | null = null;

  /** Carrega (ou retoma) um vídeo e inicia a reprodução a partir de `startAt`. */
  play(videoId: string, startAt: number, volume: number): void {
    if (this.player && this.ready && this.videoId === videoId) {
      this.player.setVolume(Math.round(volume * 100));
      this.player.seekTo(startAt, true);
      this.player.playVideo();
      this.startPolling();
      return;
    }
    this.videoId = videoId;
    this.pendingSeek = startAt;
    void this.loadApi().then((yt) => {
      // Outra música pode ter sido pedida enquanto a API carregava
      if (this.videoId !== videoId) return;
      if (this.player && this.ready) {
        this.player.loadVideoById(videoId);
        this.player.setVolume(Math.round(volume * 100));
        this.applyPendingSeek();
        this.startPolling();
        return;
      }
      if (this.player) return; // criação já em andamento
      this.player = new yt.Player(this.createHost(), {
        videoId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1 },
        events: {
          onReady: () => {
            this.ready = true;
            this.player?.setVolume(Math.round(volume * 100));
            this.applyPendingSeek();
            this.player?.playVideo();
            this.startPolling();
          },
          onStateChange: (event) => this.onStateChange(event.data, yt),
        },
      });
    });
  }

  resume(): void {
    this.player?.playVideo();
    this.startPolling();
  }

  pause(): void {
    this.stopPolling();
    if (this.ready) this.player?.pauseVideo();
  }

  stop(): void {
    this.stopPolling();
    this.videoId = null;
    if (this.ready) this.player?.stopVideo();
  }

  seek(seconds: number): void {
    if (this.ready) {
      this.player?.seekTo(seconds, true);
    } else {
      this.pendingSeek = seconds;
    }
  }

  setVolume(volume: number): void {
    if (this.ready) this.player?.setVolume(Math.round(volume * 100));
  }

  private onStateChange(state: number, yt: YTNamespace): void {
    if (state === yt.PlayerState.ENDED) {
      this.stopPolling();
      this.onEnded();
    } else if (state === yt.PlayerState.PLAYING) {
      const duration = this.player?.getDuration() ?? 0;
      if (duration > 0) this.onDuration(duration);
    }
  }

  private applyPendingSeek(): void {
    if (this.pendingSeek !== null && this.pendingSeek > 0) {
      this.player?.seekTo(this.pendingSeek, true);
    }
    this.pendingSeek = null;
  }

  private startPolling(): void {
    this.stopPolling();
    this.poll = setInterval(() => {
      if (this.ready && this.player) this.onTime(this.player.getCurrentTime());
    }, 250);
  }

  private stopPolling(): void {
    if (this.poll !== null) {
      clearInterval(this.poll);
      this.poll = null;
    }
  }

  /** Elemento fora da tela que abriga o iframe: reprodução sem vídeo visível. */
  private createHost(): HTMLElement {
    const host = document.createElement('div');
    host.style.cssText =
      'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
    document.body.appendChild(host);
    return host;
  }

  private loadApi(): Promise<YTNamespace> {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    return new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT as YTNamespace);
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }
    });
  }
}
