import type { MediaKind } from "./types";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|heic|avif)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm|m4v|avi|mkv)$/i;

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function classifyMediaUrl(url: string): MediaKind {
  if (!isHttpUrl(url)) return "unknown";
  const path = new URL(url).pathname;
  if (VIDEO_EXT.test(path)) return "video";
  if (IMAGE_EXT.test(path)) return "image";
  return "unknown";
}

export function sanitizeMediaUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const value = String(raw || "").trim();
    if (!value || !isHttpUrl(value) || seen.has(value)) continue;
    if (/^javascript:/i.test(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

export async function classifyMediaUrlWithHead(url: string): Promise<MediaKind> {
  const fromExt = classifyMediaUrl(url);
  if (fromExt !== "unknown") return fromExt;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("image/")) return "image";
  } catch {
    /* keep unknown */
  }
  return "unknown";
}

export function splitMedia(urls: string[]): { images: string[]; videos: string[] } {
  const images: string[] = [];
  const videos: string[] = [];
  for (const url of urls) {
    const kind = classifyMediaUrl(url);
    if (kind === "video") videos.push(url);
    else if (kind === "image") images.push(url);
    else images.push(url);
  }
  return { images, videos };
}
