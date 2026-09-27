import { NextResponse } from "next/server";
import { getPublicFx } from "@/lib/server/fx-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const payload = await getPublicFx();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: true,
        base: "USD",
        defaultCode: "USD",
        liveFxEnabled: true,
        currencies: [
          {
            code: "USD",
            symbol: "$",
            nameAr: "دولار أمريكي",
            nameEn: "US Dollar",
            nameTr: "ABD Doları",
            flag: "🇺🇸",
            enabled: true,
            rate: 1,
          },
        ],
        source: "unavailable",
        at: new Date().toISOString(),
        stale: true,
        error: "fx_unavailable",
      },
      { status: 200 }
    );
  }
}
