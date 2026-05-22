export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function formatTimeAgo(uts: number): string {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - uts));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(uts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function parseHexColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const hex = value.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) return fallback;
  return hex.length === 3
    ? hex
        .split("")
        .map((c) => c + c)
        .join("")
    : hex;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
