export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  /** Duração em segundos. */
  duration: number;
  /** Matiz (0–360) usada para gerar a arte de capa. */
  hue: number;
  favorite: boolean;
  addedAt: number;
  audioUrl?: string;
}

export interface TrackDraft {
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl?: string;
}
