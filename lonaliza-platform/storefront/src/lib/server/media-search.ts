import { getServerEnv } from "@/lib/server/env-store";
import type { MediaAsset, MediaSearchResult } from "@/lib/media/types";

const DEFAULT_PER_PAGE = 18;
const MAX_PER_PAGE = 30;

function clampPage(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), 50);
}

function clampPerPage(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PER_PAGE;
  return Math.min(Math.floor(n), MAX_PER_PAGE);
}

export function parseMediaQuery(search: URLSearchParams): {
  query: string;
  page: number;
  perPage: number;
} {
  return {
    query: (search.get("query") || search.get("q") || "").trim(),
    page: clampPage(search.get("page")),
    perPage: clampPerPage(search.get("perPage") || search.get("per_page")),
  };
}

type PexelsPhoto = {
  id: number;
  photographer?: string;
  photographer_url?: string;
  alt?: string;
  src?: {
    tiny?: string;
    small?: string;
    medium?: string;
    large?: string;
    original?: string;
  };
};

type UnsplashPhoto = {
  id: string;
  alt_description?: string;
  description?: string;
  urls?: {
    thumb?: string;
    small?: string;
    regular?: string;
    full?: string;
  };
  user?: {
    name?: string;
    links?: { html?: string };
  };
};

export async function searchPexels(opts: {
  query: string;
  page: number;
  perPage: number;
}): Promise<MediaSearchResult> {
  const key = await getServerEnv("PEXELS_API_KEY");
  if (!key) {
    throw new Error("PEXELS_API_KEY is not configured");
  }
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", opts.query);
  url.searchParams.set("page", String(opts.page));
  url.searchParams.set("per_page", String(opts.perPage));
  const res = await fetch(url.toString(), {
    headers: { Authorization: key },
    cache: "no-store",
  });
  const payload = (await res.json().catch(() => ({}))) as {
    photos?: PexelsPhoto[];
    total_results?: number;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(payload.error || `Pexels request failed (${res.status})`);
  }
  const items: MediaAsset[] = (payload.photos || []).map((photo) => {
    const thumb = photo.src?.tiny || photo.src?.small || "";
    const preview = photo.src?.medium || photo.src?.large || thumb;
    const full = photo.src?.large || photo.src?.original || preview;
    return {
      id: String(photo.id),
      provider: "pexels",
      mediaType: "image",
      thumbUrl: thumb,
      previewUrl: preview,
      fullUrl: full,
      authorName: [photo.photographer, photo.alt].filter(Boolean).join(" "),
      authorUrl: photo.photographer_url,
    };
  });
  return {
    items,
    total: typeof payload.total_results === "number" ? payload.total_results : items.length,
    page: opts.page,
  };
}

export async function searchUnsplash(opts: {
  query: string;
  page: number;
  perPage: number;
}): Promise<MediaSearchResult> {
  const key = await getServerEnv("UNSPLASH_ACCESS_KEY");
  if (!key) {
    throw new Error("UNSPLASH_ACCESS_KEY is not configured");
  }
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", opts.query);
  url.searchParams.set("page", String(opts.page));
  url.searchParams.set("per_page", String(opts.perPage));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` },
    cache: "no-store",
  });
  const payload = (await res.json().catch(() => ({}))) as {
    results?: UnsplashPhoto[];
    total?: number;
    errors?: string[];
  };
  if (!res.ok) {
    const msg = Array.isArray(payload.errors) ? payload.errors.join(", ") : "";
    throw new Error(msg || `Unsplash request failed (${res.status})`);
  }
  const items: MediaAsset[] = (payload.results || []).map((photo) => {
    const thumb = photo.urls?.thumb || photo.urls?.small || "";
    const preview = photo.urls?.small || photo.urls?.regular || thumb;
    const full = photo.urls?.regular || photo.urls?.full || preview;
    return {
      id: photo.id,
      provider: "unsplash",
      mediaType: "image",
      thumbUrl: thumb,
      previewUrl: preview,
      fullUrl: full,
      authorName: [photo.user?.name, photo.alt_description, photo.description].filter(Boolean).join(" "),
      authorUrl: photo.user?.links?.html,
    };
  });
  return {
    items,
    total: typeof payload.total === "number" ? payload.total : items.length,
    page: opts.page,
  };
}
