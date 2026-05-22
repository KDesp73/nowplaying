import { renderCover, coverOffsetY } from "./cover";
import { LAYOUT } from "./config";
import type { CardOptions, CoverStyle, SpinMode, TrackData } from "./types";
import { escapeXml, formatTimeAgo, truncate } from "./utils";

const FONT = LAYOUT.font;

function maxChars(width: number, startX: number, size = 7.2): number {
  return Math.max(12, Math.floor((width - startX - LAYOUT.padding) / size));
}

function shouldSpin(style: CoverStyle, mode: SpinMode, isNowPlaying: boolean): boolean {
  if (style === "square") return false;
  if (mode === "never") return false;
  if (mode === "always") return true;
  return isNowPlaying;
}

function equalizerBars(x: number, y: number, color: string): string {
  const bars = [
    { h: 5, delay: "0s" },
    { h: 9, delay: "0.12s" },
    { h: 4, delay: "0.24s" },
  ];
  return bars
    .map((bar, i) => {
      const bx = x + i * 4;
      const by = y + 10 - bar.h;
      return `
        <rect x="${bx}" y="${by}" width="2.5" height="${bar.h}" rx="1" fill="#${color}">
          <animate attributeName="height" values="${bar.h};${bar.h + 5};${bar.h}" dur="0.75s" repeatCount="indefinite" begin="${bar.delay}"/>
          <animate attributeName="y" values="${by};${by - 5};${by}" dur="0.75s" repeatCount="indefinite" begin="${bar.delay}"/>
        </rect>
      `;
    })
    .join("");
}

function statusBadge(
  status: string,
  isNowPlaying: boolean,
  x: number,
  y: number,
  theme: CardOptions["theme"],
): string {
  const label = escapeXml(status.toUpperCase());
  const approxWidth = status.length * 6.2 + (isNowPlaying ? 22 : 14);
  const bx = x - approxWidth;

  const icon = isNowPlaying
    ? equalizerBars(bx + 6, y - 10, theme.accent)
    : `<circle cx="${bx + 8}" cy="${y - 4}" r="2.5" fill="#${theme.accent}"/>`;

  const textX = isNowPlaying ? bx + 20 : bx + 14;

  return `
    <rect x="${bx - 6}" y="${y - 14}" width="${approxWidth + 10}" height="20" rx="10" fill="#${theme.accent}" opacity="0.12"/>
    ${icon}
    <text x="${textX}" y="${y}" fill="#${theme.accent}" font-family="${FONT}" font-size="10" font-weight="700" letter-spacing="0.06em">${label}</text>
  `;
}

function renderInfoPanel(
  track: TrackData,
  options: CardOptions,
  textX: number,
): string {
  const { width, theme, showAlbum } = options;
  const chars = maxChars(width, textX);

  const status = track.isNowPlaying
    ? "Now Playing"
    : track.playedAt
      ? formatTimeAgo(track.playedAt)
      : "Last played";

  const title = escapeXml(truncate(track.name, chars));
  const artist = escapeXml(truncate(track.artist, chars + 4));
  const album =
    showAlbum && track.album ? escapeXml(truncate(track.album, chars + 4)) : "";

  const badgeX = width - LAYOUT.padding;

  return `
    <text x="${textX}" y="30" fill="#${theme.muted}" font-family="${FONT}" font-size="10" font-weight="600" letter-spacing="0.12em">LAST.FM</text>
    ${statusBadge(status, track.isNowPlaying, badgeX, 30, theme)}

    <text x="${textX}" y="58" fill="#${theme.text}" font-family="${FONT}" font-size="17" font-weight="700">${title}</text>

    <text x="${textX}" y="78" fill="#${theme.muted}" font-family="${FONT}" font-size="12">
      <tspan fill="#${theme.muted}" opacity="0.75">by </tspan>
      <tspan fill="#${theme.text}" font-weight="600">${artist}</tspan>
    </text>

    ${
      album
        ? `
    <g transform="translate(${textX}, 94)">
      <rect width="10" height="10" rx="2" fill="#${theme.accent}" opacity="0.2"/>
      <circle cx="5" cy="5" r="2.5" fill="#${theme.accent}" opacity="0.85"/>
      <text x="16" y="9" fill="#${theme.muted}" font-family="${FONT}" font-size="11">${album}</text>
    </g>`
        : ""
    }
  `;
}

export function renderErrorCard(message: string, options: CardOptions): string {
  const { width, theme } = options;
  const idPrefix = "err";
  const cover = renderCover({
    style: "square",
    coverDataUri: null,
    theme,
    spin: false,
    spinDuration: 6,
    idPrefix,
  });
  const coverY = coverOffsetY(cover.size, LAYOUT.cardHeight);
  const textX = LAYOUT.padding + cover.size + LAYOUT.textGap;

  return wrapSvg(
    width,
    LAYOUT.cardHeight,
    `
  <rect width="${width}" height="${LAYOUT.cardHeight}" rx="12" fill="#${theme.bg}" stroke="#${theme.border}" stroke-width="1"/>
  <g transform="translate(${LAYOUT.padding}, ${coverY})">${cover.markup}</g>
  <text x="${textX}" y="52" fill="#${theme.text}" font-family="${FONT}" font-size="15" font-weight="700">Last.fm</text>
  <text x="${textX}" y="74" fill="#${theme.muted}" font-family="${FONT}" font-size="12">${escapeXml(truncate(message, maxChars(width, textX)))}</text>
`,
  );
}

export function renderTrackCard(
  track: TrackData,
  coverDataUri: string | null,
  options: CardOptions,
): string {
  const { width, theme, coverStyle, spinMode, spinDuration } = options;
  const idPrefix = "card";
  const spin = shouldSpin(coverStyle, spinMode, track.isNowPlaying);
  const cover = renderCover({
    style: coverStyle,
    coverDataUri,
    theme,
    spin,
    spinDuration,
    idPrefix,
  });

  const coverY = coverOffsetY(cover.size, LAYOUT.cardHeight);
  const textX = LAYOUT.padding + cover.size + LAYOUT.textGap;
  const coverAnchor =
    coverStyle === "square"
      ? `translate(${LAYOUT.padding}, ${coverY})`
      : `translate(${LAYOUT.padding + cover.size / 2}, ${coverY + cover.size / 2})`;

  return wrapSvg(
    width,
    LAYOUT.cardHeight,
    `
  <rect width="${width}" height="${LAYOUT.cardHeight}" rx="12" fill="#${theme.bg}" stroke="#${theme.border}" stroke-width="1"/>
  <line x1="${textX - 8}" y1="36" x2="${textX - 8}" y2="${LAYOUT.cardHeight - 20}" stroke="#${theme.border}" stroke-width="1" opacity="0.6"/>
  <a href="${escapeXml(track.url)}" target="_blank">
    <g transform="${coverAnchor}">${cover.markup}</g>
    <g>${renderInfoPanel(track, options, textX)}</g>
  </a>
  <title>${escapeXml(`${track.artist} — ${track.name}`)}</title>
`,
  );
}

function wrapSvg(width: number, height: number, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${body}
</svg>`;
}
