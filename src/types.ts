export interface LastFmImage {
  size: string;
  "#text": string;
}

export interface LastFmTrack {
  name: string;
  url: string;
  artist: { "#text": string; name?: string; mbid?: string };
  album?: { "#text": string; mbid?: string };
  image: LastFmImage[];
  date?: { uts: string; "#text": string };
  "@attr"?: { nowplaying?: string };
}

export interface RecentTracksResponse {
  recenttracks: {
    "@attr": { user: string };
    track: LastFmTrack | LastFmTrack[];
  };
}

export interface TrackInfoResponse {
  track: {
    name: string;
    album?: {
      title: string;
      image: LastFmImage[];
    };
    artist: { name: string };
    image: LastFmImage[];
  };
}

export interface TrackData {
  name: string;
  artist: string;
  album: string;
  url: string;
  isNowPlaying: boolean;
  playedAt: number | null;
  imageUrl: string | null;
}

export interface CardTheme {
  bg: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  coverBg: string;
}

export type CoverStyle = "square" | "cd" | "vinyl";

/** When the disc cover rotates: always, only while now playing, or never. */
export type SpinMode = "always" | "playing" | "never";

export interface CardOptions {
  width: number;
  theme: CardTheme;
  showAlbum: boolean;
  coverStyle: CoverStyle;
  spinMode: SpinMode;
  /** Seconds per full rotation (3–30). */
  spinDuration: number;
}
