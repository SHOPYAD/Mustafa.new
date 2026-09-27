import { NextResponse } from "next/server";
import { getLegalSettings } from "@/lib/server/legal-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getLegalSettings();
    return NextResponse.json(
      {
        ok: true,
        identity: settings.identity,
        clauses: settings.clauses.filter((c) => c.enabled),
        retention: settings.retention,
        updatedAt: settings.updatedAt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load legal policies" },
      { status: 500 }
    );
  }
}
