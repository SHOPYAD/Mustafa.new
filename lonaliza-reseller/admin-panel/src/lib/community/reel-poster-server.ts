/** Server-only reel poster / media proxy helpers (SSRF-safe). */

import { createHash } from "crypto";
import { guessBlossomPoster } from "./reel-media";

const PRIVATE_HOST_RE =
  /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|\[::1\]|::1$)/i;

export function parseSafeReelMediaUrl(raw: string | null | undefined): URL | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 1800) return null;
  if (/^(javascript|data|blob|file|ftp):/i.test(trimmed)) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (!/^\/(?:uploads|api\/community\/reel-|videos)\//i.test(trimmed)) return null;
    try {
      return new URL(trimmed, "https://lonaliza.com");
    } catch {
      return null;
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;
  if (PRIVATE_HOST_RE.test(parsed.hostname) || PRIVATE_HOST_RE.test(parsed.hostname + ".")) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname) && PRIVATE_HOST_RE.test(parsed.hostname)) {
    return null;
  }
  return parsed;
}

export function siblingStillCandidates(videoUrl: string): string[] {
  const guessed = guessBlossomPoster(videoUrl);
  if (!guessed) return [];
  const base = guessed.replace(/\.jpg$/i, "");
  return [`${base}.jpg`, `${base}.jpeg`, `${base}.webp`, `${base}.png`];
}

export function posterCacheKey(src: string): string {
  return createHash("sha256").update(src).digest("hex");
}

export function isImageContentType(value: string | null): boolean {
  if (!value) return false;
  return /^image\/(jpeg|jpg|png|webp|gif|pjpeg)/i.test(value.split(";")[0].trim());
}

export function isVideoContentType(value: string | null): boolean {
  if (!value) return false;
  return /^video\//i.test(value.split(";")[0].trim()) || /octet-stream/i.test(value);
}
