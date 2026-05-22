import type { CardOptions, TrackData } from "./types";
import { escapeXml, formatTimeAgo, truncate } from "./utils";

const COVER_SIZE = 72;
const PADDING = 14;
const CARD_HEIGHT = 100;

function placeholderCover(theme: CardOptions["theme"]): string {
  return `
    <rect width="${COVER_SIZE}" height="${COVER_SIZE}" rx="8" fill="#${theme.coverBg}"/>
    <path d="M${COVER_SIZE / 2 - 10} ${COVER_SIZE / 2 + 8} L${COVER_SIZE / 2 - 4} ${COVER_SIZE / 2 - 6} L${COVER_SIZE / 2 + 10} ${COVER_SIZE / 2 + 8} Z" fill="#${theme.muted}" opacity="0.5"/>
    <circle cx="${COVER_SIZE / 2}" cy="${COVER_SIZE / 2 - 2}" r="12" fill="none" stroke="#${theme.muted}" stroke-width="2" opacity="0.4"/>
  `;
}

function equalizerBars(x: number, y: number, color: string): string {
  const bars = [
    { h: 6, delay: "0s" },
    { h: 10, delay: "0.15s" },
    { h: 4, delay: "0.3s" },
  ];
  return bars
    .map((bar, i) => {
      const bx = x + i * 5;
      return `
        <rect x="${bx}" y="${y + 12 - bar.h}" width="3" height="${bar.h}" rx="1" fill="#${color}">
          <animate attributeName="height" values="${bar.h};${bar.h + 6};${bar.h}" dur="0.8s" repeatCount="indefinite" begin="${bar.delay}"/>
          <animate attributeName="y" values="${y + 12 - bar.h};${y + 12 - bar.h - 6};${y + 12 - bar.h}" dur="0.8s" repeatCount="indefinite" begin="${bar.delay}"/>
        </rect>
      `;
    })
    .join("");
}

export function renderErrorCard(message: string, options: CardOptions): string {
  const { width, theme } = options;
  const textX = PADDING + COVER_SIZE + 16;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${CARD_HEIGHT}" viewBox="0 0 ${width} ${CARD_HEIGHT}">
  <rect width="${width}" height="${CARD_HEIGHT}" rx="10" fill="#${theme.bg}" stroke="#${theme.border}" stroke-width="1"/>
  <g transform="translate(${PADDING}, ${(CARD_HEIGHT - COVER_SIZE) / 2})">
    ${placeholderCover(theme)}
  </g>
  <text x="${textX}" y="42" fill="#${theme.text}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="14" font-weight="600">Last.fm</text>
  <text x="${textX}" y="62" fill="#${theme.muted}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="12">${escapeXml(truncate(message, 60))}</text>
</svg>`;
}

export function renderTrackCard(
  track: TrackData,
  coverDataUri: string | null,
  options: CardOptions,
): string {
  const { width, theme, showAlbum } = options;
  const textX = PADDING + COVER_SIZE + 16;

  const status = track.isNowPlaying
    ? "Now Playing"
    : track.playedAt
      ? formatTimeAgo(track.playedAt)
      : "Last played";

  const title = escapeXml(truncate(track.name, 42));
  const artist = escapeXml(truncate(track.artist, 36));
  const album = showAlbum && track.album ? escapeXml(truncate(track.album, 36)) : "";

  const coverContent = coverDataUri
    ? `<image href="${coverDataUri}" width="${COVER_SIZE}" height="${COVER_SIZE}" preserveAspectRatio="xMidYMid slice" clip-path="url(#coverClip)"/>`
    : placeholderCover(theme);

  const statusIcon = track.isNowPlaying
    ? equalizerBars(textX, 24, theme.accent)
    : `<circle cx="${textX + 4}" cy="30" r="3" fill="#${theme.muted}"/>`;

  const statusX = track.isNowPlaying ? textX + 20 : textX + 12;

  const albumLine =
    album &&
    `<text x="${textX}" y="78" fill="#${theme.muted}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="11">${album}</text>`;

  const artistY = album ? 62 : 68;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${CARD_HEIGHT}" viewBox="0 0 ${width} ${CARD_HEIGHT}">
  <defs>
    <clipPath id="coverClip">
      <rect width="${COVER_SIZE}" height="${COVER_SIZE}" rx="8"/>
    </clipPath>
  </defs>
  <rect width="${width}" height="${CARD_HEIGHT}" rx="10" fill="#${theme.bg}" stroke="#${theme.border}" stroke-width="1"/>
  <a href="${escapeXml(track.url)}" target="_blank">
    <g transform="translate(${PADDING}, ${(CARD_HEIGHT - COVER_SIZE) / 2})">
      <rect width="${COVER_SIZE}" height="${COVER_SIZE}" rx="8" fill="#${theme.coverBg}"/>
      ${coverContent}
    </g>
    <g>
      ${statusIcon}
      <text x="${statusX}" y="34" fill="#${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="11" font-weight="600" letter-spacing="0.02em">${escapeXml(status.toUpperCase())}</text>
      <text x="${textX}" y="52" fill="#${theme.text}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="15" font-weight="600">
        <tspan>${title}</tspan>
      </text>
      <text x="${textX}" y="${artistY}" fill="#${theme.muted}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="12">${artist}</text>
      ${albumLine ?? ""}
    </g>
  </a>
  <title>${escapeXml(`${track.artist} — ${track.name}`)}</title>
</svg>`;
}
