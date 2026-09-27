import { NextResponse } from "next/server";
import { getPublicTranslationsPayload } from "@/lib/server/translations-store";
import { cacheControlPublic, ttlGet, ttlSet } from "@/lib/server/ttl-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = ttlGet<Record<string, unknown>>("public-translations");
    const payload =
      cached ||
      ttlSet("public-translations", { ok: true, ...(await getPublicTranslationsPayload()) }, 180_000);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": cacheControlPublic(180, 300) },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "تعذّر تحميل الترجمات." },
      { status: 500 }
    );
  }
}
