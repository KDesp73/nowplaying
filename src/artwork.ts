const FETCH_TIMEOUT_MS = 5000;
const PLACEHOLDER_MARKER = "2a96cbd8b46e442fc41c2b86b821562f";

export function isPlaceholderArt(url: string | null): boolean {
  return !url || url.includes(PLACEHOLDER_MARKER);
}

export async function fetchImageAsDataUri(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) return null;

    const mime = contentType.split(";")[0].trim() || "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
