import { findPlaceByQuery } from "@/lib/server/geo-places";
import type { PlannerIdea, PlannerIntake, PlannerStop, PlannerStopKind, PlannerTrip } from "@/types/planner";
import { buildLegs, destKey, haversineKm, uid, validLatLng } from "./geo";
import { buildTripFromIntake, catalogPoisForCity, cityCenter, listIdeas } from "./catalog";
import { fetchWorldPois } from "./world-pois";
import { nominatimSearch } from "./nominatim";
import { writeDayTitle } from "./day-copy";
import { wikiSummary } from "./wiki-summary";
import { fillPlacePhotos, isGenericStockPhoto } from "./place-photos";
import { isJunkPlaceTitle, isTouristPoi, rankTouristPoi } from "./tourist-filter";
import { prefsStyles, styleLabel, stylesFromText } from "./styles";
import type { PlannerStyle } from "@/types/planner";
import { generateIconicItinerary } from "./gemini-landmarks";
import { discoverDestinationPlacesLive } from "@/lib/server/google-places-agent";

const UA = "LonalizaPlanner/1.0 (https://lonaliza.com)";

export type AgentDayHint = {
  day?: number;
  titleAr?: string;
  titleEn?: string;
  detailAr?: string;
  detailEn?: string;
  lat?: number;
  lng?: number;
  items?: Array<{ labelAr?: string; labelEn?: string }>;
};

type LivePoi = {
  titleAr: string;
  titleEn: string;
  detailAr?: string;
  detailEn?: string;
  lat: number;
  lng: number;
  kind: PlannerStopKind;
  image?: string;
  hours?: string;
  rating?: number;
  reviews?: number;
  free?: boolean;
  source?: string;
  styles?: PlannerStyle[];
};

async function nominatimCenter(q: string): Promise<{ lat: number; lng: number; label: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 3600 } });
    const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    const row = rows?.[0];
    if (!row) return null;
    return { lat: Number(row.lat), lng: Number(row.lon), label: row.display_name };
  } catch {
    return null;
  }
}

export async function resolveDestinationCenter(destination: string): Promise<{
  lat: number;
  lng: number;
  labelEn: string;
  labelAr: string;
}> {
  const q = String(destination || "").trim();
  if (!q) {
    return { lat: 0, lng: 0, labelEn: "", labelAr: "" };
  }
  const rec = await findPlaceByQuery(q);
  if (rec?.lat && rec?.lng) {
    return {
      lat: rec.lat,
      lng: rec.lng,
      labelEn: rec.city_name_en,
      labelAr: rec.city_name_ar || rec.city_name_en,
    };
  }
  const geo = await nominatimCenter(q);
  if (geo) {
    return {
      lat: geo.lat,
      lng: geo.lng,
      labelEn: rec?.city_name_en || q,
      labelAr: rec?.city_name_ar || q,
    };
  }
  const fallback = cityCenter(q);
  if (fallback.lat && fallback.lng) {
    return {
      lat: fallback.lat,
      lng: fallback.lng,
      labelEn: rec?.city_name_en || q,
      labelAr: rec?.city_name_ar || q,
    };
  }
  return { lat: 0, lng: 0, labelEn: q, labelAr: q };
}

function kindFromTags(tags: Record<string, string>): PlannerStopKind {
  const tourism = tags.tourism || "";
  const amenity = tags.amenity || "";
  const shop = tags.shop || "";
  if (amenity === "restaurant" || amenity === "cafe" || amenity === "fast_food") return "food";
  if (tourism === "hotel" || amenity === "hotel") return "hotel";
  if (shop) return "shopping";
  if (amenity === "aerodrome" || tags.aeroway) return "airport";
  return "attraction";
}

async function overpassPois(lat: number, lng: number): Promise<LivePoi[]> {
  const query = `[out:json][timeout:22];
(
  nwr["tourism"~"attraction|museum|gallery|viewpoint|theme_park|zoo|artwork|yes"](around:120000,${lat},${lng});
  nwr["historic"~"monument|castle|palace|ruins|archaeological_site|monastery"](around:120000,${lat},${lng});
  nwr["natural"~"valley|cave|rock|peak|waterfall|lake"](around:120000,${lat},${lng});
);
out center 220;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 1800 },
    });
    const json = (await res.json()) as {
      elements?: Array<{
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }>;
    };
    const seen = new Set<string>();
    const out: LivePoi[] = [];
    for (const el of json.elements || []) {
      const tags = el.tags || {};
      const titleEn = tags.name || tags["name:en"] || "";
      const titleAr = tags["name:ar"] || titleEn;
      const plat = el.lat ?? el.center?.lat;
      const plng = el.lon ?? el.center?.lon;
      if (!titleEn || plat == null || plng == null) continue;
      const key = titleEn.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        titleEn,
        titleAr,
        lat: plat,
        lng: plng,
        kind: kindFromTags(tags),
        hours: tags.opening_hours,
        styles: stylesFromText(titleEn),
      });
    }
    return out;
  } catch {
    return [];
  }
}

function nearCity<T extends { lat: number; lng: number }>(rows: T[], lat: number, lng: number, maxKm = 95): T[] {
  if (!validLatLng(lat, lng)) return rows.filter((p) => validLatLng(p.lat, p.lng));
  return rows.filter((p) => validLatLng(p.lat, p.lng) && haversineKm(p, { lat, lng }) <= maxKm);
}

function placeKey(title: string): string {
  return String(title || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 48);
}

function mergeLive(lists: LivePoi[][]): LivePoi[] {
  const seen = new Set<string>();
  const out: LivePoi[] = [];
  for (const p of lists.flat().sort((a, b) => rankTouristPoi(b) - rankTouristPoi(a))) {
    if (!isTouristPoi(p)) continue;
    const key = placeKey(p.titleEn);
    if (!key || seen.has(key) || !validLatLng(p.lat, p.lng)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export async function fetchLivePois(destination: string, lat: number, lng: number, also?: string): Promise<LivePoi[]> {
  const city = also || destination;
  const world = await fetchWorldPois({ city, lat, lng });
  const fromWorld: LivePoi[] = world.map((p) => ({
    titleAr: p.titleAr,
    titleEn: p.titleEn,
    lat: p.lat,
    lng: p.lng,
    kind: p.kind,
    image: p.image,
    hours: p.hours,
    detailAr: p.detailAr,
    detailEn: p.detailEn,
    rating: p.rating,
    reviews: p.reviews,
    free: p.free,
    source: p.source,
    styles: stylesFromText(`${p.titleEn} ${p.titleAr} ${p.detailEn || ""}`),
  }));
  let merged = nearCity(fromWorld.filter(isTouristPoi), lat, lng);
  const catalog = catalogPoisForCity(city).concat(catalogPoisForCity(destination));
  if (catalog.length) {
    const asLive: LivePoi[] = catalog.map((s) => ({
      titleAr: s.titleAr,
      titleEn: s.titleEn,
      lat: s.lat,
      lng: s.lng,
      kind: s.kind,
      image: s.image,
      hours: s.hours,
      rating: s.rating,
      reviews: s.reviews,
      free: s.free,
      source: "catalog",
      styles: (s.styles || []) as PlannerStyle[],
    }));
    merged = nearCity(mergeLive([asLive, merged]), lat, lng, 120);
  }
  const gPlaces = await discoverDestinationPlacesLive(city, { centerLat: lat, centerLng: lng }).catch(() => null);
  if (gPlaces && gPlaces.places.length) {
    const gAsLive: LivePoi[] = gPlaces.places.map((p) => ({
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      lat: p.lat,
      lng: p.lng,
      kind: p.kind,
      image: p.image,
      rating: p.rating,
      reviews: p.reviewsCount,
      source: "google_places_live",
      styles: stylesFromText(`${p.titleEn} ${p.category} ${p.detailEn}`),
    }));
    merged = mergeLive([gAsLive, merged]);
  }
  if (merged.length < 8) {
    const extra = await overpassPois(lat, lng).catch(() => [] as LivePoi[]);
    if (extra.length) merged = nearCity(mergeLive([merged, extra]), lat, lng, 60);
  }
  merged = merged.filter((p) => isTouristPoi(p) && !isJunkPlaceTitle(p.titleEn) && !isJunkPlaceTitle(p.titleAr)).sort((a, b) => rankTouristPoi(b) - rankTouristPoi(a));
  await fillPlacePhotos(merged, city, 100);
  return merged;
}

const SLOTS = [
  { ar: "صباحاً", en: "Morning", minutes: 90 },
  { ar: "قبل الظهر", en: "Late morning", minutes: 75 },
  { ar: "بعد الظهر", en: "Afternoon", minutes: 90 },
  { ar: "عصراً", en: "Late afternoon", minutes: 70 },
  { ar: "مساءً", en: "Evening", minutes: 80 },
  { ar: "ليلاً", en: "Night", minutes: 60 },
] as const;

function asStop(poi: LivePoi, day: number, order: number, slotIndex = 0): PlannerStop {
  const slot = SLOTS[Math.min(slotIndex, SLOTS.length - 1)];
  return {
    id: uid("live"),
    day,
    order,
    kind: poi.kind,
    titleAr: poi.titleAr,
    titleEn: poi.titleEn,
    detailAr: poi.detailAr || poi.detailEn || "",
    detailEn: poi.detailEn || poi.detailAr || "",
    lat: poi.lat,
    lng: poi.lng,
    image: poi.image,
    hours: poi.hours,
    rating: poi.rating,
    reviews: poi.reviews,
    free: poi.free,
    visitMinutes: poi.kind === "hotel" ? 0 : slot.minutes,
    addedToDay: day,
    slotAr: slot.ar,
    slotEn: slot.en,
  };
}

export async function buildLiveTrip(
  intake: PlannerIntake,
  agentDays?: AgentDayHint[]
): Promise<PlannerTrip> {
  const dest = String(intake.destination || "").trim();
  const resolved = dest
    ? await resolveDestinationCenter(dest)
    : { lat: intake.destLat || 0, lng: intake.destLng || 0, labelEn: "", labelAr: "" };
  const center =
    intake.destLat && intake.destLng
      ? {
          lat: intake.destLat,
          lng: intake.destLng,
          labelEn: resolved.labelEn || dest,
          labelAr: resolved.labelAr || dest,
        }
      : resolved;

  // 1. Primary Priority: World-Class Iconic Landmark Itinerary curated by Gemini Flash / OpenRouter
  if (center.lat && center.lng) {
    try {
      const iconicTrip = await generateIconicItinerary(intake, center.lat, center.lng, agentDays);
      if (iconicTrip && iconicTrip.days.length > 0) {
        return iconicTrip;
      }
    } catch {
      /* fallback to local warehouse */
    }
  }

  // 2. Fallback to curated catalog / warehouse with metropolitan and day-trip radius (120km)
  const radiusKm = intake.radiusKm || 50;
  const pois = nearCity(await fetchLivePois(dest, center.lat, center.lng, center.labelEn), center.lat, center.lng, radiusKm)
    .filter((p) => p.kind !== "hotel" && isTouristPoi(p))
    .sort((a, b) => rankTouristPoi(b) - rankTouristPoi(a));
  const daysCount = Math.min(30, Math.max(1, intake.durationDays || agentDays?.length || 5));
  const perDay = intake.prefs.pace === "ambitious" ? 4 : 3;

  if (pois.length < 2) {
    try {
      const fallbackTrip = await generateIconicItinerary(
        intake,
        center.lat || 41.0,
        center.lng || 28.9,
        agentDays
      );
      if (fallbackTrip && fallbackTrip.days.length > 0) {
        return fallbackTrip;
      }
    } catch {
      /* continue */
    }
    if (validLatLng(center.lat, center.lng)) {
      pois.push({
        titleAr: center.labelAr || dest,
        titleEn: center.labelEn || dest,
        lat: center.lat,
        lng: center.lng,
        kind: "attraction",
      });
    }
  }

  const hintNames = (agentDays || []).flatMap((h) => {
    const items = h.items || [];
    if (items.length) return items.map((it) => ({ titleEn: it.labelEn || "", titleAr: it.labelAr || it.labelEn || "" }));
    return [];
  }).filter((h) => (h.titleEn || h.titleAr) && isTouristPoi({ titleEn: h.titleEn, titleAr: h.titleAr, kind: "attraction" }));

  const hintPois = await Promise.all(
    hintNames.slice(0, 10).map(async (h) => {
        const title = h.titleEn || h.titleAr || "";
        if (isJunkPlaceTitle(title)) return null;
        const geo = await nominatimSearch(`${title} ${dest}`, 1);
        const wiki = await wikiSummary(title, "en");
        const hit = geo[0];
        const plat = hit?.lat || 0;
        const plng = hit?.lng || 0;
        if (!validLatLng(plat, plng)) return null;
        if (validLatLng(center.lat, center.lng) && haversineKm({ lat: plat, lng: plng }, center) > 95) {
          return null;
        }
        return {
          titleAr: h.titleAr || title,
          titleEn: h.titleEn || title,
          detailEn: wiki.description,
          lat: plat,
          lng: plng,
          kind: "attraction" as const,
        } satisfies LivePoi;
      })
  );
  for (const p of hintPois) {
    if (p && validLatLng(p.lat, p.lng)) pois.unshift(p);
  }

  const wanted = prefsStyles(intake.prefs);
  const poiStyle = (p: LivePoi) => p.styles?.length ? p.styles : stylesFromText(p.titleEn);
  const featured = pois.filter((p) => p.source === "catalog");
  const rest = pois.filter((p) => p.source !== "catalog");
  const leftover = [...featured, ...rest];
  const buckets: LivePoi[][] = Array.from({ length: daysCount }, () => []);
  for (let i = 0; i < daysCount; i++) {
    const want = wanted[i % wanted.length];
    leftover.sort((a, b) => {
      const am = poiStyle(a).includes(want) ? 0 : 1;
      const bm = poiStyle(b).includes(want) ? 0 : 1;
      if (am !== bm) return am - bm;
      const seed = buckets[i][0] || leftover[0];
      if (seed) return haversineKm(seed, a) - haversineKm(seed, b);
      return rankTouristPoi(b) - rankTouristPoi(a);
    });
    while (buckets[i].length < perDay && leftover.length) buckets[i].push(leftover.shift()!);
  }

  const days = Array.from({ length: daysCount }, (_, i) => {
    const day = i + 1;
    const group = buckets[i] || [];
    const stops = group.map((p, idx) => asStop(p, day, idx + 1, idx));
    const want = wanted[(day - 1) % wanted.length];
    const themeAr = `${styleLabel(want, "ar")} · ${group[0]?.titleAr || center.labelAr}`;
    const themeEn = `${styleLabel(want, "en")} · ${group[0]?.titleEn || center.labelEn}`;
    return {
      day,
      titleAr: themeAr,
      titleEn: themeEn,
      notes: "",
      stops,
      legs: buildLegs(stops, "walk"),
    };
  });
  const later: PlannerStop[] = [];
  const discover = leftover.filter((p) => isTouristPoi(p)).slice(0, 24).map((p, i) => asStop(p, 0, i + 1));
  const locale = intake.locale || "ar";
  const wikiLang = locale === "tr" ? "tr" : locale === "fr" ? "fr" : locale === "en" ? "en" : "ar";
  const needThumbs = [...days.flatMap((d) => d.stops), ...discover].slice(0, 60);
  await Promise.all(
    needThumbs.map(async (stop) => {
      const [local, arabic] = await Promise.all([
        wikiSummary(stop.titleEn || stop.titleAr, wikiLang),
        wikiLang === "ar" ? Promise.resolve(null) : wikiSummary(stop.titleEn || stop.titleAr, "ar"),
      ]);
      if (wikiLang === "ar") {
        if (local.description && !stop.detailAr) stop.detailAr = local.description;
        if (!stop.titleAr && local.title && !isJunkPlaceTitle(local.title)) stop.titleAr = local.title;
      } else {
        if (local.description && !stop.detailEn) stop.detailEn = local.description;
        if (arabic?.description && !stop.detailAr) stop.detailAr = arabic.description;
        if (!stop.titleEn && local.title && !isJunkPlaceTitle(local.title)) stop.titleEn = local.title;
        if (!stop.titleAr && arabic?.title && !isJunkPlaceTitle(arabic.title)) stop.titleAr = arabic.title;
      }
      if (!stop.detailAr && stop.detailEn) stop.detailAr = stop.detailEn;
      if (!stop.detailEn && stop.detailAr) stop.detailEn = stop.detailAr;
    })
  );
  await fillPlacePhotos([...days.flatMap((d) => d.stops), ...discover], center.labelEn || dest, 100);
  for (const day of days) {
    const want = wanted[(day.day - 1) % wanted.length];
    const first = locale === "ar" ? day.stops[0]?.titleAr : day.stops[0]?.titleEn;
    day.titleAr = writeDayTitle(day.day, daysCount, center.labelAr, "ar", day.stops[0]?.titleAr, want);
    day.titleEn = writeDayTitle(day.day, daysCount, center.labelEn, locale === "ar" ? "en" : locale, first, want);
    day.notes = "";
  }

  const topStyles = wanted.slice(0, 2).map((s) => styleLabel(s, "ar")).join(" و");
  const mixAr = topStyles ? `بين ${topStyles}` : "فاخرة ومميزة";
  const mixEn = wanted.slice(0, 2).map((s) => styleLabel(s, "en")).join(" & ") || "Luxury";

  return {
    id: uid("trip"),
    titleAr: `${center.labelAr} — ${daysCount} أيام ${mixAr}`,
    titleEn: `${center.labelEn} — ${daysCount} Days ${mixEn}`,
    origin: intake.origin,
    destination: dest,
    durationDays: daysCount,
    arrivalDate: intake.arrivalDate,
    departureDate: intake.departureDate,
    prefs: intake.prefs,
    days,
    later,
    discover,
    notes: intake.prefs.notes,
    tipsAr: [
      `البرنامج مبني على مخزن معالم لوناليزا حول ${center.labelAr} (ويكي داتا وويكيبيديا وOSM) وليس قالباً ثابتاً.`,
      discover.length
        ? `${discover.length} معلماً حول ${center.labelAr} يمكنك إضافتها من الخريطة أو الأفكار.`
        : "راجع مواعيد الزيارة قبل الخروج، خصوصاً دور العبادة والمتاحف.",
    ],
    tipsEn: [
      `This plan uses Lonaliza's place warehouse around ${center.labelEn} (Wikidata, Wikipedia, OSM).`,
      discover.length
        ? `${discover.length} more places around ${center.labelEn} you can add from the map or ideas.`
        : "Check opening hours before you go, especially museums and places of worship.",
    ],
    defaultMode: "walk",
    center: { lat: center.lat, lng: center.lng },
  };
}

export async function listLiveIdeas(destination: string, kind?: PlannerStopKind): Promise<PlannerIdea[]> {
  const center = await resolveDestinationCenter(destination);
  const pois = await fetchLivePois(destination, center.lat, center.lng, center.labelEn);
  const live = pois
    .filter((p) => (kind ? p.kind === kind : true))
    .map((p, i) => ({
      ...asStop(p, 0, i + 1),
      category: p.kind,
      addedToDay: undefined,
      distanceKm: undefined,
    }));
  if (live.length) return live.slice(0, 120);
  const key = destKey(destination);
  const known =
    (key === "istanbul" && /istanbul|إسطنبول|sultanahmet|fatih/i.test(destination)) ||
    (key === "antalya" && /antalya|أنطاليا/i.test(destination)) ||
    (key === "trabzon" && /trabzon|طرابزون/i.test(destination)) ||
    (key === "cappadocia" && /cappadocia|كابادوكيا|goreme/i.test(destination)) ||
    (key === "riyadh" && /riyadh|الرياض/i.test(destination));
  return known ? listIdeas(destination, kind) : [];
}
