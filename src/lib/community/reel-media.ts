/** Shared reel copy, mock detection, and poster URL helpers (community / reels only). */

const MEDIA_URL_RE =
  /https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|webp|gif|mp4|webm|mov)(?:\?[^\s]*)?/gi;

const DEMO_REEL_ID_RE = /^(home_reel_|nostr_travel_post_)/i;
const DEMO_PUBKEY_RE = /^npub1(lonaliza|trabzonlover|cappadocia|vipguest)/i;
const DEMO_VIDEO_RE =
  /(?:^|\/)videos\/reels\/|assets\.mixkit\.co|images\.unsplash\.com\/photo-/i;

export function stripMediaUrls(text: string): string {
  return String(text || "")
    .replace(MEDIA_URL_RE, " ")
    .replace(/\uFFFD/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function wordSafeTruncate(text: string, maxChars: number): string {
  const cleaned = stripMediaUrls(text);
  if (!cleaned) return "";
  if (cleaned.length <= maxChars) return cleaned;
  const slice = cleaned.slice(0, maxChars);
  const breakAt = Math.max(
    slice.lastIndexOf(" "),
    slice.lastIndexOf("\n"),
    slice.lastIndexOf("،"),
    slice.lastIndexOf("."),
  );
  const cut = breakAt >= Math.floor(maxChars * 0.45) ? slice.slice(0, breakAt) : slice;
  return cut.replace(/[\s.,،…]+$/g, "").trim();
}

export function splitReelCopy(content: string): { title: string; description: string } {
  const cleaned = stripMediaUrls(content);
  if (!cleaned) return { title: "", description: "" };

  const firstLine = (cleaned.split(/\n+/)[0] || cleaned).trim();
  const title = wordSafeTruncate(firstLine, 48);
  let description = cleaned;
  if (title && description.startsWith(title)) {
    description = description.slice(title.length).replace(/^[\s.,،…]+/, "").trim();
  }
  if (!description || description === title) {
    description = cleaned;
  }
  return { title: title || cleaned.slice(0, 48), description };
}

export function isMockReelSource(input: {
  id?: string;
  pubkey?: string;
  videoUrl?: string;
}): boolean {
  if (input.id && DEMO_REEL_ID_RE.test(input.id)) return true;
  if (input.pubkey && DEMO_PUBKEY_RE.test(input.pubkey)) return true;
  if (input.videoUrl && DEMO_VIDEO_RE.test(input.videoUrl)) return true;
  return false;
}

/** Blossom/CDN convention: same hash with a still-image extension. */
export function guessBlossomPoster(videoUrl: string): string | undefined {
  if (!videoUrl) return undefined;
  const clean = videoUrl.split("?")[0];
  if (!/\.(mp4|webm|mov|m4v)$/i.test(clean)) return undefined;
  if (/^blob:|^data:/i.test(videoUrl)) return undefined;
  return clean.replace(/\.(mp4|webm|mov|m4v)$/i, ".jpg");
}

export function posterFromImages(images?: string[] | null): string | undefined {
  if (!images?.length) return undefined;
  const still = images.find((u) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(u));
  return still || images[0];
}

export function resolveReelPoster(input: {
  posterUrl?: string;
  videoPoster?: string;
  images?: string[];
  videoUrl?: string;
}): string | undefined {
  return (
    input.posterUrl ||
    input.videoPoster ||
    posterFromImages(input.images) ||
    (input.videoUrl ? guessBlossomPoster(input.videoUrl) : undefined)
  );
}

export function probeImageUrl(url: string): Promise<boolean> {
  if (!url || url.startsWith("data:image/")) return Promise.resolve(Boolean(url));
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok: boolean) => {
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };
    img.onload = () => done(img.naturalWidth > 16 && img.naturalHeight > 16);
    img.onerror = () => done(false);
    window.setTimeout(() => done(false), 2500);
    img.src = url;
  });
}

export function captureVideoFrame(video: HTMLVideoElement, quality = 0.78): string | null {
  try {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return null;
  }
}

export async function seekAndCapturePoster(
  video: HTMLVideoElement,
  atSeconds = 0.45,
): Promise<string | null> {
  if (!video) return null;
  if (video.videoWidth >= 8 && !video.paused && video.currentTime > 0.05) {
    return captureVideoFrame(video);
  }
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const target =
    duration > 0 ? Math.min(Math.max(0.12, atSeconds), Math.max(0.12, duration * 0.12)) : atSeconds;

  const previous = video.currentTime;
  const wasPaused = video.paused;
  await new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener("seeked", done);
      resolve();
    };
    video.addEventListener("seeked", done);
    try {
      video.currentTime = target;
    } catch {
      resolve();
    }
    window.setTimeout(done, 900);
  });

  const frame = captureVideoFrame(video);
  try {
    if (wasPaused) video.currentTime = previous || 0;
  } catch {
    /* ignore */
  }
  return frame;
}
