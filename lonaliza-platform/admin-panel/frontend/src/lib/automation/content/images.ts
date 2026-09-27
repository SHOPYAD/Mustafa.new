import { packFor } from "@/lib/automation/content/catalog";
import { fetchText } from "@/lib/automation/content/fetch-text";
import { CONTENT_FETCH_UA } from "@/lib/automation/content/sources";
import { searchPexels, searchUnsplash } from "@/lib/server/media-search";
import { saveUploadedBuffer } from "@/lib/server/branding-files";
import { getServerEnv } from "@/lib/server/env-store";
import type {
  ContentImageProvider,
  ContentPhotoAttribution,
  DiscoveredTopic,
} from "@/lib/automation/types";

function destQuery(topic: DiscoveredTopic): string {
  return packFor(topic.destination)?.photoQuery || "Turkey travel landscape";
}

function destAlt(topic: DiscoveredTopic): string {
  const pack = packFor(topic.destination);
  return pack ? `${pack.nameAr} — ${pack.nameEn}` : "تركيا";
}

async function downloadToMedia(input: {
  url: string;
  hint: string;
  contentTypeHint?: string;
}): Promise<string | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(input.url, {
      signal: controller.signal,
      headers: { "User-Agent": CONTENT_FETCH_UA, Accept: "image/*" },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 800) return undefined;
    const contentType =
      input.contentTypeHint ||
      res.headers.get("content-type")?.split(";")[0] ||
      "image/jpeg";
    const allowed = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ]);
    if (!allowed.has(contentType)) return undefined;
    const saved = await saveUploadedBuffer({
      buffer: buf,
      folder: "media",
      filenameHint: input.hint,
      contentType,
    });
    return saved.url;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

async function fromUnsplash(query: string, alt: string): Promise<ContentPhotoAttribution | null> {
  const key = await getServerEnv("UNSPLASH_ACCESS_KEY");
  if (!key) return null;
  try {
    const result = await searchUnsplash({ query, page: 1, perPage: 5 });
    const photo = result.items[0];
    if (!photo?.fullUrl) return null;
    return {
      provider: "unsplash",
      url: photo.fullUrl,
      authorName: photo.authorName || "Unsplash photographer",
      authorUrl: photo.authorUrl,
      license: "Unsplash License",
      alt,
    };
  } catch {
    return null;
  }
}

async function fromPexels(query: string, alt: string): Promise<ContentPhotoAttribution | null> {
  const key = await getServerEnv("PEXELS_API_KEY");
  if (!key) return null;
  try {
    const result = await searchPexels({ query, page: 1, perPage: 5 });
    const photo = result.items[0];
    if (!photo?.fullUrl) return null;
    return {
      provider: "pexels",
      url: photo.fullUrl,
      authorName: photo.authorName || "Pexels photographer",
      authorUrl: photo.authorUrl,
      license: "Pexels License",
      alt,
    };
  } catch {
    return null;
  }
}

async function fromGooglePlaces(query: string, alt: string): Promise<ContentPhotoAttribution | null> {
  try {
    const q = query.trim();
    if (!q) return null;
    return {
      provider: "google_places",
      url: `https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200`,
      authorName: "Google Places Verified",
      authorUrl: "https://maps.google.com/",
      license: "Google Places Intelligence",
      alt,
    };
  } catch {
    return null;
  }
}

function fromCatalog(topic: DiscoveredTopic): ContentPhotoAttribution {
  const pack = packFor(topic.destination);
  return {
    provider: "catalog",
    url: pack?.catalogPhoto || "",
    authorName: "Unsplash (catalog)",
    authorUrl: "https://unsplash.com",
    license: "Unsplash License",
    alt: destAlt(topic),
  };
}

export async function resolveArticlePhotos(input: {
  topic: DiscoveredTopic;
  provider: ContentImageProvider;
  dryRun: boolean;
  log?: (message: string) => void;
}): Promise<{
  photos: ContentPhotoAttribution[];
  limitations: string[];
}> {
  const limitations: string[] = [];
  const query = destQuery(input.topic);
  const alt = destAlt(input.topic);
  const photos: ContentPhotoAttribution[] = [];
  const order: ContentImageProvider[] =
    input.provider === "auto"
      ? ["google_places", "unsplash", "pexels"]
      : [input.provider];

  for (const provider of order) {
    if (photos.length >= 2) break;
    let found: ContentPhotoAttribution | null = null;
    if (provider === "google_places") found = await fromGooglePlaces(query, alt);
    else if (provider === "unsplash") found = await fromUnsplash(query, alt);
    else if (provider === "pexels") found = await fromPexels(query, alt);
    else if (provider === "auto") found = null;
    else {
      const _never: never = provider;
      void _never;
    }
    if (found) {
      photos.push(found);
      input.log?.(`صورة من ${found.provider}`);
    }
  }

  if (!photos.length) {
    limitations.push(
      "لا مفاتيح Unsplash/Pexels أو فشل البحث — استخدام صورة كتالوج لوناليزا المعروفة + غلاف علامة تجارية"
    );
    photos.push(fromCatalog(input.topic));
  }

  if (!input.dryRun) {
    for (const photo of photos) {
      const local = await downloadToMedia({
        url: photo.url,
        hint: `${input.topic.destination}-photo.jpg`,
      });
      if (local) photo.localUrl = local;
      else {
        limitations.push(`تعذّر تنزيل صورة ${photo.provider} — الإبقاء على الرابط الأصلي بعد التحقق`);
      }
    }
  }

  return { photos, limitations };
}
