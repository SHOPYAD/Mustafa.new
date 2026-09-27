/**
 * Extra holiday packages published by admin import / AI advisor.
 * Merged with the seed catalog so custom programs appear on public pages.
 */

import { promises as fs } from "fs";
import path from "path";
import { defaultPackages } from "@/data/packages";
import { aiProgramToHolidayPackage } from "@/lib/ai-program-to-package";
import {
  isPublicPackage,
  packagesLookSame,
  sortPackagesNewestFirst,
} from "@/lib/packages-sort";
import { slugify } from "@/lib/utils";
import type { SavedAiProgram } from "@/types/ai-program";
import type { HolidayPackage, ImageAsset, ItineraryDay } from "@/types/package";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "published-packages.json");

type StoreFile = {
  packages: HolidayPackage[];
  deletedIds?: string[];
  updatedAt?: string;
};

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-published-packages.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!Array.isArray(parsed.packages)) parsed.packages = [];
    if (!Array.isArray(parsed.deletedIds)) parsed.deletedIds = [];
    return parsed;
  } catch {
    return { packages: [], deletedIds: [] };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    getStoreFile(),
    JSON.stringify(
      {
        ...store,
        packages: store.packages || [],
        deletedIds: store.deletedIds || [],
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v != null ? String(v) : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const next = v.map((x) => String(x)).filter(Boolean);
  return next.length ? next : undefined;
}

function asImages(v: unknown, alt: string): ImageAsset[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((img) => {
      if (typeof img === "string" && /^https?:\/\//i.test(img)) {
        return { url: img, alt, width: 800, height: 600 };
      }
      if (img && typeof img === "object" && "url" in img) {
        const o = img as Record<string, unknown>;
        const url = asString(o.url);
        if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) return null;
        return {
          url,
          alt: asString(o.alt, alt),
          width: asNumber(o.width, 800),
          height: asNumber(o.height, 600),
        };
      }
      return null;
    })
    .filter((x): x is ImageAsset => Boolean(x));
}

function asItinerary(v: unknown): ItineraryDay[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const days = v.map((d, i) => {
    const day = (d || {}) as Record<string, unknown>;
    return {
      day: asNumber(day.day, i + 1),
      title: asString(day.title),
      description: asString(day.description),
      lat: day.lat != null ? asNumber(day.lat) : undefined,
      lng: day.lng != null ? asNumber(day.lng) : undefined,
    };
  });
  return days.length ? days : undefined;
}

function findStoreIndex(
  packages: HolidayPackage[],
  pkg: Pick<HolidayPackage, "id" | "slug" | "title" | "titleAr" | "titleEn" | "durationDays">
): number {
  return packages.findIndex((p) => packagesLookSame(p, pkg as HolidayPackage));
}

export function sanitizeHolidayPackage(
  raw: Partial<HolidayPackage> & Record<string, unknown>,
  existing?: HolidayPackage
): HolidayPackage {
  const now = new Date().toISOString();
  const title = asString(
    raw.title || raw.titleEn || raw.titleAr || existing?.title,
    "برنامج سياحي"
  );
  const titleAr = asString(raw.titleAr || existing?.titleAr, title);
  const titleEn = asString(raw.titleEn || existing?.titleEn, title);
  const destination = asString(
    raw.destination || raw.destinationEn || raw.destinationAr || existing?.destination,
    "Turkey"
  );
  const slug =
    asString(raw.slug || existing?.slug) ||
    slugify(titleEn || titleAr || title) ||
    `package-${Date.now()}`;
  const id =
    asString(raw.id || existing?.id) ||
    `pkg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const images = asImages(raw.images ?? existing?.images, title);
  const durationDays = asNumber(
    raw.durationDays ?? existing?.durationDays,
    5
  );
  const createdAt =
    asString(raw.createdAt || existing?.createdAt) || now;

  return {
    ...existing,
    ...raw,
    id,
    slug,
    title,
    titleAr,
    titleEn,
    titleTr: asString(raw.titleTr || existing?.titleTr, titleEn),
    destination,
    destinationAr: asString(
      raw.destinationAr || existing?.destinationAr,
      destination
    ),
    destinationEn: asString(
      raw.destinationEn || existing?.destinationEn,
      destination
    ),
    destinationTr: asString(
      raw.destinationTr || existing?.destinationTr,
      destination
    ),
    country: asString(raw.country || existing?.country, "Turkey"),
    countryAr: asString(raw.countryAr || existing?.countryAr, "تركيا"),
    countryEn: asString(raw.countryEn || existing?.countryEn, "Turkey"),
    countryTr: asString(raw.countryTr || existing?.countryTr, "Türkiye"),
    destinations: asStringArray(raw.destinations) ?? existing?.destinations,
    destinationsAr: asStringArray(raw.destinationsAr) ?? existing?.destinationsAr,
    destinationsEn: asStringArray(raw.destinationsEn) ?? existing?.destinationsEn,
    durationDays,
    durationNights: asNumber(
      raw.durationNights ?? existing?.durationNights,
      Math.max(1, durationDays - 1)
    ),
    price: asNumber(raw.price ?? existing?.price, 0),
    currency: asString(raw.currency || existing?.currency, "USD"),
    rating: asNumber(raw.rating ?? existing?.rating, 4.8),
    images,
    amenities: asStringArray(raw.amenities) ?? existing?.amenities ?? [],
    amenitiesAr: asStringArray(raw.amenitiesAr) ?? existing?.amenitiesAr,
    isFeatured: raw.isFeatured !== undefined
      ? Boolean(raw.isFeatured)
      : existing?.isFeatured !== undefined
        ? Boolean(existing.isFeatured)
        : true,
    isPublished: raw.isPublished !== undefined
      ? Boolean(raw.isPublished)
      : existing?.isPublished !== false,
    createdAt,
    updatedAt: now,
    description: asString(raw.description || existing?.description, "") || undefined,
    descriptionAr:
      asString(raw.descriptionAr || existing?.descriptionAr, "") || undefined,
    descriptionEn:
      asString(raw.descriptionEn || existing?.descriptionEn, "") || undefined,
    inclusions: asStringArray(raw.inclusions) ?? existing?.inclusions,
    inclusionsAr: asStringArray(raw.inclusionsAr) ?? existing?.inclusionsAr,
    inclusionsEn: asStringArray(raw.inclusionsEn) ?? existing?.inclusionsEn,
    exclusions: asStringArray(raw.exclusions) ?? existing?.exclusions,
    exclusionsAr: asStringArray(raw.exclusionsAr) ?? existing?.exclusionsAr,
    exclusionsEn: asStringArray(raw.exclusionsEn) ?? existing?.exclusionsEn,
    itinerary: asItinerary(raw.itinerary) ?? existing?.itinerary,
    itineraryAr: asItinerary(raw.itineraryAr) ?? existing?.itineraryAr,
    itineraryEn: asItinerary(raw.itineraryEn) ?? existing?.itineraryEn,
  };
}

export async function listExtraPackages(): Promise<HolidayPackage[]> {
  const store = await readStore();
  return store.packages;
}

export async function listMergedPackages(): Promise<HolidayPackage[]> {
  const store = await readStore();
  const deletedSet = new Set(store.deletedIds || []);
  const extraKeys = new Set<string>();
  const merged: HolidayPackage[] = [];

  for (const pkg of store.packages) {
    if (!pkg?.id) continue;
    if (deletedSet.has(pkg.id) || (pkg.slug && deletedSet.has(pkg.slug))) continue;
    extraKeys.add(pkg.id);
    if (pkg.slug) extraKeys.add(pkg.slug);
    merged.push(pkg);
  }
  for (const pkg of defaultPackages) {
    if (deletedSet.has(pkg.id) || (pkg.slug && deletedSet.has(pkg.slug))) continue;
    if (extraKeys.has(pkg.id) || extraKeys.has(pkg.slug)) continue;
    if (store.packages.some((extra) => packagesLookSame(extra, pkg))) continue;
    merged.push(pkg);
  }
  return sortPackagesNewestFirst(merged);
}

export async function listPublicPackages(): Promise<HolidayPackage[]> {
  const packages = await listMergedPackages();
  return packages.filter(isPublicPackage);
}

export async function upsertPublishedPackage(
  incoming: HolidayPackage | (Partial<HolidayPackage> & Record<string, unknown>)
): Promise<HolidayPackage> {
  const store = await readStore();
  const idx = findStoreIndex(store.packages, {
    id: asString(incoming.id),
    slug: asString(incoming.slug),
    title: asString(incoming.title),
    titleAr: asString(incoming.titleAr),
    titleEn: asString(incoming.titleEn),
    durationDays: asNumber(incoming.durationDays, 0),
  });
  const existing = idx >= 0 ? store.packages[idx] : undefined;
  const pkg = sanitizeHolidayPackage(
    incoming as Partial<HolidayPackage> & Record<string, unknown>,
    existing
  );

  // If restoring or updating, remove from deletedIds
  if (store.deletedIds && store.deletedIds.length) {
    store.deletedIds = store.deletedIds.filter(
      (delId) => delId !== pkg.id && delId !== pkg.slug
    );
  }

  if (idx >= 0) store.packages[idx] = pkg;
  else store.packages.unshift(pkg);
  await writeStore(store);
  return pkg;
}

export async function syncPublishedPackages(
  incoming: Array<Partial<HolidayPackage> & Record<string, unknown>>
): Promise<HolidayPackage[]> {
  const saved: HolidayPackage[] = [];
  for (const row of incoming) {
    if (!row || typeof row !== "object") continue;
    saved.push(await upsertPublishedPackage(row));
  }
  return saved;
}

export async function publishAiProgramToCatalog(
  program: SavedAiProgram
): Promise<HolidayPackage> {
  const pkg = aiProgramToHolidayPackage(program);
  return upsertPublishedPackage(pkg);
}

export async function unpublishPackage(id: string): Promise<boolean> {
  const store = await readStore();
  const targetId = String(id || "").trim();
  if (!targetId) return false;

  // Find target if in store or default
  const inStore = store.packages.find((p) => p.id === targetId || p.slug === targetId);
  const inDefault = defaultPackages.find((p) => p.id === targetId || p.slug === targetId);
  const slugToBlock = inStore?.slug || inDefault?.slug || targetId;

  // Filter out of store.packages
  store.packages = store.packages.filter(
    (p) => p.id !== targetId && p.slug !== targetId && p.slug !== slugToBlock
  );

  // Record tombstone in deletedIds
  const deletedSet = new Set(store.deletedIds || []);
  deletedSet.add(targetId);
  if (slugToBlock) deletedSet.add(slugToBlock);
  if (inStore?.id) deletedSet.add(inStore.id);
  if (inDefault?.id) deletedSet.add(inDefault.id);
  store.deletedIds = Array.from(deletedSet);

  await writeStore(store);
  return true;
}

export async function resetExtraPackages(): Promise<HolidayPackage[]> {
  await writeStore({ packages: [], deletedIds: [] });
  return listMergedPackages();
}
