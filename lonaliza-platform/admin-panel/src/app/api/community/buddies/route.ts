import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { listBuddies, matchBuddies, upsertBuddy } from "@/lib/server/lonaliza-social-commerce";
import { filterCompanionsByCity } from "@/lib/travel-companions";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cityQuery = url.searchParams.get("city") || url.searchParams.get("q") || "";
  const user = await getRequestCustomer(req);
  const all = (await listBuddies()).filter((b) => b.city || b.destination);
  all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  let me = user ? all.find((b) => b.userId === user.id) || null : null;
  if (user?.avatarUrl) {
    if (me && (!me.avatarUrl || me.avatarUrl.includes("unsplash.com"))) {
      me = { ...me, avatarUrl: user.avatarUrl };
    }
    const idx = all.findIndex((b) => b.userId === user.id);
    if (idx !== -1 && (!all[idx].avatarUrl || all[idx].avatarUrl.includes("unsplash.com"))) {
      all[idx] = { ...all[idx], avatarUrl: user.avatarUrl };
    }
  }
  const filtered = cityQuery ? filterCompanionsByCity(cityQuery, all) : all;
  return NextResponse.json({
    ok: true,
    me,
    userAvatar: user?.avatarUrl,
    userName: user?.name,
    matches: filtered,
    buddies: filtered,
    all,
    cityQuery,
  });
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
  const all = (await listBuddies()).filter((b) => b.city || b.destination);
  all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return NextResponse.json({ ok: true, profile, me: profile, matches: all, buddies: all });
}
