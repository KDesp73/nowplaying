import type { CardTheme } from "./types";
import { parseHexColor } from "./utils";

export const THEMES: Record<string, CardTheme> = {
  dark: {
    bg: "121212",
    border: "2a2a2a",
    text: "ffffff",
    muted: "a3a3a3",
    accent: "d51007",
    coverBg: "1e1e1e",
  },
  light: {
    bg: "fafafa",
    border: "e5e5e5",
    text: "171717",
    muted: "737373",
    accent: "d51007",
    coverBg: "f0f0f0",
  },
  midnight: {
    bg: "0f172a",
    border: "1e293b",
    text: "f8fafc",
    muted: "94a3b8",
    accent: "38bdf8",
    coverBg: "1e293b",
  },
};

export function resolveTheme(
  name: string | undefined,
  overrides: Partial<Record<keyof CardTheme, string | undefined>>,
): CardTheme {
  const base = THEMES[name ?? "dark"] ?? THEMES.dark;
  return {
    bg: parseHexColor(overrides.bg, base.bg),
    border: parseHexColor(overrides.border, base.border),
    text: parseHexColor(overrides.text, base.text),
    muted: parseHexColor(overrides.muted, base.muted),
    accent: parseHexColor(overrides.accent, base.accent),
    coverBg: parseHexColor(overrides.coverBg, base.coverBg),
  };
}
