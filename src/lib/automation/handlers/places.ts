import { promises as fs } from "fs";
import path from "path";
import { getServerEnv } from "@/lib/server/env-store";
import { automationDataDir } from "@/lib/server/automation/paths";
import type { AutomationJobContext, AutomationJobResult } from "@/lib/automation/types";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/g;

function stripPersonal(text: string): string {
  return String(text || "")
    .replace(EMAIL_RE, "[removed]")
    .replace(PHONE_RE, "[removed]")
    .replace(/\s+/g, " ")
    .trim();
}

export type PlaceReview = {
  text: string;
  rating?: number;
  time?: string;
};

export type PlaceListing = {
  name: string;
  address?: string;
  rating?: number;
  reviews: PlaceReview[];
  queriedAt: string;
  query: string;
};

type PlacesStoreFile = {
  version: 1;
  listings: PlaceListing[];
  updatedAt: string;
};

function storeFile(): string {
  return path.join(automationDataDir(), "places-reviews.json");
}

async function readStore(): Promise<PlacesStoreFile> {
  try {
    const raw = JSON.parse(await fs.readFile(storeFile(), "utf8")) as PlacesStoreFile;
    return {
      version: 1,
      listings: Array.isArray(raw.listings) ? raw.listings : [],
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  } catch {
    return { version: 1, listings: [], updatedAt: new Date().toISOString() };
  }
}

async function saveListing(listing: PlaceListing): Promise<void> {
  const file = await readStore();
  const next = [listing, ...file.listings.filter((row) => row.name !== listing.name)].slice(0, 40);
  await fs.mkdir(path.dirname(storeFile()), { recursive: true });
  await fs.writeFile(
    storeFile(),
    JSON.stringify({ version: 1, listings: next, updatedAt: new Date().toISOString() }, null, 2),
    { mode: 0o600 }
  );
}

export async function loadRecentPlaceListings(limit = 5): Promise<PlaceListing[]> {
  const file = await readStore();
  return file.listings.slice(0, Math.max(1, limit));
}

async function fetchPlaceListing(query: string, apiKey: string): Promise<PlaceListing | { error: string }> {
  const search = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  search.searchParams.set("input", query);
  search.searchParams.set("inputtype", "textquery");
  search.searchParams.set("fields", "place_id,name,formatted_address,rating");
  search.searchParams.set("key", apiKey);
  const foundRes = await fetch(search, { cache: "no-store" });
  const found = (await foundRes.json()) as {
    status?: string;
    error_message?: string;
    candidates?: Array<{ place_id?: string; name?: string; formatted_address?: string; rating?: number }>;
  };
  if (found.status !== "OK" || !found.candidates?.[0]?.place_id) {
    return { error: found.error_message || found.status || "place_not_found" };
  }
  const candidate = found.candidates[0];
  const placeId = candidate.place_id;
  if (!placeId) return { error: "place_not_found" };
  const details = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  details.searchParams.set("place_id", placeId);
  details.searchParams.set("fields", "name,formatted_address,rating,reviews");
  details.searchParams.set("key", apiKey);
  details.searchParams.set("language", "ar");
  details.searchParams.set("reviews_no_translations", "true");
  const detRes = await fetch(details, { cache: "no-store" });
  const det = (await detRes.json()) as {
    status?: string;
    error_message?: string;
    result?: {
      name?: string;
      formatted_address?: string;
      rating?: number;
      reviews?: Array<{ text?: string; rating?: number; time?: number }>;
    };
  };
  if (det.status !== "OK" || !det.result) {
    return { error: det.error_message || det.status || "place_details_failed" };
  }
  const reviews = (det.result.reviews || [])
    .map((row) => ({
      text: stripPersonal(row.text || ""),
      rating: row.rating,
      time: row.time ? new Date(row.time * 1000).toISOString() : undefined,
    }))
    .filter((row) => row.text.length > 0);
  return {
    name: det.result.name || candidate.name || query,
    address: det.result.formatted_address || candidate.formatted_address,
    rating: det.result.rating ?? candidate.rating,
    reviews,
    queriedAt: new Date().toISOString(),
    query,
  };
}

export async function runPlacesReviews(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const dryRun = Boolean(ctx.dryRun);
  const settings = { ...(ctx.job?.settings || {}), ...(ctx.job?.payload || {}) };
  const query = String(settings.query || settings.place || "Alrayyan Tourism Trabzon").trim();
  const apiKey =
    (await getServerEnv("GOOGLE_PLACES_API_KEY")) ||
    (await getServerEnv("GOOGLE_MAPS_API_KEY")) ||
    (await getServerEnv("GOOGLE_PLACES_KEY"));
  if (!apiKey) {
    return {
      ok: false,
      processed: 0,
      message: "أضيفوا GOOGLE_PLACES_API_KEY من إعدادات الأتمتة. نجلب اسم النشاط ونص التقييم فقط — بلا هواتف شخصية.",
      dryRun,
    };
  }
  if (dryRun) {
    return {
      ok: true,
      processed: 0,
      message: `تجريبي: سيُجلب نشاط «${query}» ونصوص التقييمات بعد إزالة الإيميل/الهاتف.`,
      dryRun: true,
    };
  }
  const listing = await fetchPlaceListing(query, apiKey);
  if ("error" in listing) {
    return { ok: false, processed: 0, message: listing.error, dryRun };
  }
  await saveListing(listing);
  return {
    ok: true,
    processed: listing.reviews.length,
    message: `${listing.name} — ${listing.reviews.length} تقييم نصي (محفوظ للأفكار والملخص)`,
    dryRun,
    details: {
      name: listing.name,
      address: listing.address,
      rating: listing.rating,
      reviews: listing.reviews,
      policy: "business listing + review text only; personal phones/emails stripped; never scrape Maps comments for contacts",
    },
  };
}
