import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/server/env-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref") || "";
  if (!ref) return NextResponse.json({ ok: false }, { status: 400 });
  const key =
    (await getServerEnv("GOOGLE_PLACES_API_KEY")) ||
    (await getServerEnv("GOOGLE_MAPS_API_KEY")) ||
    (await getServerEnv("GOOGLE_PLACES_KEY"));
  if (!key) return NextResponse.json({ ok: false }, { status: 404 });
  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.searchParams.set("maxwidth", "800");
  url.searchParams.set("photo_reference", ref);
  url.searchParams.set("key", key);
  return NextResponse.redirect(url.toString(), 302);
}
