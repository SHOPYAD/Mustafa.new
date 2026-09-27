import { NextRequest, NextResponse } from "next/server";
import { getGeminiPublicConfig } from "@/lib/server/gemini";
import { buildLiveQuote, type QuoteTrip } from "@/lib/server/ai-quote";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteTrip;
    const config = await getGeminiPublicConfig();
    const quote = await buildLiveQuote(body, config.salesMarkupPercent);
    if (!quote) {
      return NextResponse.json(
        { ok: false, error: "destination required" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, ...quote });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "quote failed" },
      { status: 500 }
    );
  }
}
