import { NextRequest, NextResponse } from "next/server";
import { vipDailyTours } from "@/data/vip-daily-tours";
import { uid } from "@/lib/planner/geo";
import { listLiveIdeas, resolveDestinationCenter } from "@/lib/planner/live-places";
import { fetchNearbyPois, type NearbyCategory } from "@/lib/planner/nearby-overpass";
import { listPublicPackages } from "@/lib/server/packages-store";
import type { PlannerIdea, PlannerStopKind } from "@/types/planner";

export const runtime = "nodejs";

function matchesDest(hay: string, q: string): boolean {
  const tokens = String(q || "")
    .toLowerCase()
    .split(/[\s,/]+/)
    .filter((t) => t.length > 2);
  const t = hay.toLowerCase();
  return tokens.some((tok) => t.includes(tok));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const kind = req.nextUrl.searchParams.get("kind") as PlannerStopKind | null;
  if (!q.trim()) return NextResponse.json({ ok: true, ideas: [] });
  const ideas: PlannerIdea[] = await listLiveIdeas(q, kind || undefined);
  const nearbyKind: NearbyCategory =
    kind === "food" ? "food" : kind === "shopping" ? "shopping" : kind === "hotel" ? "hotels" : "attractions";
  if (nearbyKind) {
    const center = await resolveDestinationCenter(q);
    if (center.lat && center.lng) {
      const extra = await fetchNearbyPois(center.lat, center.lng, nearbyKind);
      for (const p of extra) {
        ideas.push({
          id: uid("near"),
          day: 0,
          order: ideas.length + 1,
          kind: p.kind,
          category: p.kind,
          titleAr: p.titleAr,
          titleEn: p.titleEn,
          lat: p.lat,
          lng: p.lng,
          hours: p.hours,
        });
      }
    }
  }

  if (!kind || kind === "attraction" || kind === "custom") {
    for (const tour of vipDailyTours) {
      const hay = `${tour.titleEn} ${tour.titleAr} ${tour.routeFrom} ${tour.routeTo}`;
      if (!matchesDest(hay, q)) continue;
      for (const stop of tour.mapRoute || []) {
        ideas.push({
          id: uid("vip"),
          day: 0,
          order: ideas.length + 1,
          kind: "attraction",
          category: "attraction",
          titleAr: stop.labelAr,
          titleEn: stop.labelEn,
          detailAr: stop.descriptionAr,
          detailEn: stop.descriptionEn,
          lat: stop.lat,
          lng: stop.lng,
          image: stop.photo || tour.images[0],
          visitMinutes: 75,
          rating: 4.7,
          href: `/vip-tours/${tour.slug}`,
        });
      }
    }
  }

  try {
    const packages = await listPublicPackages();
    for (const pkg of packages.slice(0, 12)) {
      const hay = `${pkg.destination || ""} ${pkg.titleEn || ""} ${pkg.titleAr || ""}`;
      if (!matchesDest(hay, q)) continue;
      for (const pt of pkg.mapPoints || []) {
        ideas.push({
          id: uid("pkg"),
          day: 0,
          order: ideas.length + 1,
          kind: "attraction",
          category: "attraction",
          titleAr: pt.labelAr,
          titleEn: pt.labelEn,
          detailAr: pt.descriptionAr,
          detailEn: pt.descriptionEn,
          lat: pt.lat,
          lng: pt.lng,
          href: `/package/${pkg.slug}`,
        });
      }
    }
  } catch {
    /* catalog-only fallback */
  }

  if ((!kind || kind === "hotel") && ideas[0]?.lat && ideas[0]?.lng) {
    ideas.push({
      id: uid("live-hotel"),
      day: 0,
      order: ideas.length + 1,
      kind: "hotel",
      category: "hotel",
      titleAr: `فنادق حية في ${q}`,
      titleEn: `Live hotels in ${q}`,
      lat: ideas[0].lat,
      lng: ideas[0].lng,
      href: `/hotels?q=${encodeURIComponent(q)}`,
      rating: 8.4,
    });
  }

  const seen = new Set<string>();
  const unique = ideas.filter((idea) => {
    const key = `${idea.titleEn}|${idea.lat.toFixed(3)}|${idea.lng.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ ok: true, ideas: unique.slice(0, 120) });
}
