import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchImageAsDataUri, isPlaceholderArt } from "../src/artwork";
import { getLatestTrack } from "../src/lastfm";
import { renderErrorCard, renderTrackCard } from "../src/svg";
import { resolveTheme } from "../src/themes";
import type { CardOptions } from "../src/types";
import { clamp } from "../src/utils";

function getQueryParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

function buildOptions(req: VercelRequest): CardOptions {
  const width = clamp(Number(getQueryParam(req.query.width)) || 420, 280, 800);

  return {
    width,
    showAlbum: parseBoolean(getQueryParam(req.query.show_album), true),
    theme: resolveTheme(getQueryParam(req.query.theme), {
      bg: getQueryParam(req.query.bg),
      border: getQueryParam(req.query.border),
      text: getQueryParam(req.query.text),
      muted: getQueryParam(req.query.muted),
      accent: getQueryParam(req.query.accent),
    }),
  };
}

function sendSvg(res: VercelResponse, svg: string, cacheSeconds = 300): void {
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`);
  res.status(200).send(svg);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const options = buildOptions(req);
  const user = getQueryParam(req.query.user)?.trim();

  if (!user) {
    sendSvg(res, renderErrorCard("Missing ?user= Last.fm username", options), 60);
    return;
  }

  try {
    const track = await getLatestTrack(user);

    let coverDataUri: string | null = null;
    if (track.imageUrl && !isPlaceholderArt(track.imageUrl)) {
      coverDataUri = await fetchImageAsDataUri(track.imageUrl);
    }

    const svg = renderTrackCard(track, coverDataUri, options);
    sendSvg(res, svg);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load track";
    const cacheSeconds = message.includes("LASTFM_API_KEY") ? 60 : 120;
    sendSvg(res, renderErrorCard(message, options), cacheSeconds);
  }
}
