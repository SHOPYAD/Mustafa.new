import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { listBuddies, matchBuddies, upsertBuddy } from "@/lib/server/lonaliza-social-commerce";
import { filterCompanionsByCity } from "@/lib/travel-companions";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cityQuery = url.searchParams.get("city") || url.searchParams.get("q") || "";
  const user = await getRequestCustomer(req);
  if (user) {
    const matched = await matchBuddies({
      userId: user.id,
      cityQuery,
    });
    return NextResponse.json({ ok: true, ...matched, buddies: matched.matches });
  }
  const all = (await listBuddies()).filter((b) => b.city || b.destination);
  const filtered = cityQuery ? filterCompanionsByCity(cityQuery, all) : all;
  return NextResponse.json({ ok: true, me: null, matches: filtered, buddies: filtered, cityQuery });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const city = String(body.city || "").trim();
  const destination = String(body.destination || "").trim();
  if (!city && !destination) {
    return NextResponse.json({ ok: false, error: "city_or_destination_required" }, { status: 400 });
  }
  const profile = await upsertBuddy({
    userId: user.id,
    name: String(body.name || user.name || "مسافر"),
    city,
    destination,
    dateFrom: body.dateFrom ? String(body.dateFrom) : undefined,
    dateTo: body.dateTo ? String(body.dateTo) : undefined,
    language: body.language ? String(body.language) : undefined,
    bio: body.bio ? String(body.bio) : undefined,
    avatarUrl: body.avatarUrl ? String(body.avatarUrl) : undefined,
    nostrPubkey: body.nostrPubkey ? String(body.nostrPubkey) : undefined,
  });
  const matched = await matchBuddies({
    userId: user.id,
    city: profile.city,
    destination: profile.destination,
    cityQuery: String(body.cityQuery || ""),
  });
  return NextResponse.json({ ok: true, profile, ...matched });
}
