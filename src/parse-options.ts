import type { VercelRequest } from "@vercel/node";
import { resolveTheme } from "./themes";
import type { CardOptions, CoverStyle, SpinMode } from "./types";
import { clamp } from "./utils";

function getQueryParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

const COVER_STYLES: CoverStyle[] = ["square", "cd", "vinyl"];
const SPIN_MODES: SpinMode[] = ["always", "playing", "never"];

function parseCoverStyle(value: string | undefined): CoverStyle {
  const normalized = value?.toLowerCase().trim();
  if (normalized && COVER_STYLES.includes(normalized as CoverStyle)) {
    return normalized as CoverStyle;
  }
  return "cd";
}

function parseSpinMode(value: string | undefined): SpinMode {
  const normalized = value?.toLowerCase().trim();
  if (normalized === "true" || normalized === "1") return "playing";
  if (normalized === "false" || normalized === "0") return "never";
  if (normalized && SPIN_MODES.includes(normalized as SpinMode)) {
    return normalized as SpinMode;
  }
  return "playing";
}

/** Default rotation period: vinyl slower, CD faster. */
function defaultSpinDuration(coverStyle: CoverStyle): number {
  return coverStyle === "vinyl" ? 8 : 5;
}

export function buildCardOptions(req: VercelRequest): CardOptions {
  const width = clamp(Number(getQueryParam(req.query.width)) || 440, 300, 800);
  const coverStyle = parseCoverStyle(
    getQueryParam(req.query.cover) ?? getQueryParam(req.query.cover_style),
  );
  const spinMode = parseSpinMode(getQueryParam(req.query.spin));

  const spinDuration = clamp(
    Number(getQueryParam(req.query.spin_speed) ?? getQueryParam(req.query.spin_duration)) ||
      defaultSpinDuration(coverStyle),
    3,
    30,
  );

  return {
    width,
    showAlbum: parseBoolean(getQueryParam(req.query.show_album), true),
    coverStyle,
    spinMode,
    spinDuration,
    theme: resolveTheme(getQueryParam(req.query.theme), {
      bg: getQueryParam(req.query.bg),
      border: getQueryParam(req.query.border),
      text: getQueryParam(req.query.text),
      muted: getQueryParam(req.query.muted),
      accent: getQueryParam(req.query.accent),
    }),
  };
}
