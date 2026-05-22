import type {
  LastFmImage,
  LastFmTrack,
  RecentTracksResponse,
  TrackData,
  TrackInfoResponse,
} from "./types";

const API_BASE = "https://ws.audioscrobbler.com/2.0/";

function getApiKey(): string {
  const key = process.env.LASTFM_API_KEY;
  if (!key) {
    throw new Error("LASTFM_API_KEY is not configured");
  }
  return key;
}

async function lastFmFetch<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(API_BASE);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Last.fm API error: ${response.status}`);
  }

  const data = (await response.json()) as T & { error?: number; message?: string };
  if ("error" in data && data.error) {
    throw new Error(data.message ?? `Last.fm error ${data.error}`);
  }

  return data;
}

function pickLargestImage(images: LastFmImage[]): string | null {
  const order = ["extralarge", "large", "medium", "small"];
  for (const size of order) {
    const match = images.find((img) => img.size === size && img["#text"]);
    if (match?.["#text"]) return match["#text"];
  }
  const fallback = images.find((img) => img["#text"]);
  return fallback?.["#text"] ?? null;
}

function getArtistName(track: LastFmTrack): string {
  if (typeof track.artist === "string") return track.artist;
  return track.artist.name ?? track.artist["#text"] ?? "Unknown Artist";
}

function normalizeTrack(track: LastFmTrack): TrackData {
  const isNowPlaying = track["@attr"]?.nowplaying === "true";
  const playedAt = isNowPlaying ? null : track.date ? Number(track.date.uts) : null;

  return {
    name: track.name || "Unknown Track",
    artist: getArtistName(track),
    album: track.album?.["#text"] ?? "",
    url: track.url?.startsWith("http") ? track.url : `https://www.last.fm${track.url ?? ""}`,
    isNowPlaying,
    playedAt,
    imageUrl: pickLargestImage(track.image ?? []),
  };
}

async function enrichTrackArt(track: TrackData): Promise<TrackData> {
  if (track.imageUrl && !track.imageUrl.includes("2a96cbd8b46e442fc41c2b86b821562f")) {
    return track;
  }

  try {
    const info = await lastFmFetch<TrackInfoResponse>({
      method: "track.getInfo",
      artist: track.artist,
      track: track.name,
      ...(track.album ? { album: track.album } : {}),
    });

    const albumImages = info.track.album?.image ?? [];
    const trackImages = info.track.image ?? [];
    const imageUrl =
      pickLargestImage(albumImages) ?? pickLargestImage(trackImages) ?? track.imageUrl;

    return {
      ...track,
      album: info.track.album?.title || track.album,
      imageUrl,
    };
  } catch {
    return track;
  }
}

export async function getLatestTrack(username: string): Promise<TrackData> {
  const data = await lastFmFetch<RecentTracksResponse>({
    method: "user.getRecentTracks",
    user: username,
    limit: "1",
  });

  const raw = data.recenttracks.track;
  const track = Array.isArray(raw) ? raw[0] : raw;

  if (!track) {
    throw new Error(`No recent tracks found for user "${username}"`);
  }

  const normalized = normalizeTrack(track);
  return enrichTrackArt(normalized);
}
