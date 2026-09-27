// src/app/api/transfers/flight-tracker/route.ts (Storefront proxy to Admin API)
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { search } = new URL(req.url);
    const targetUrl = `http://127.0.0.1:3048/api/transfers/flight-tracker${search}`;
    const res = await fetch(targetUrl, {
      headers: { "User-Agent": "LonalizaStorefrontProxy/1.0" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: "تعذر الاتصال بمحرك تتبع الطيران", details: error.message },
      { status: 500 }
    );
  }
}
