import { NextRequest, NextResponse } from "next/server";
import { wikiSummary } from "@/lib/planner/wiki-summary";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const city = req.nextUrl.searchParams.get("city") || "";
  const raw = String(req.nextUrl.searchParams.get("lang") || "en");
  const lang = raw === "ar" || raw === "tr" || raw === "fr" || raw === "en" ? raw : "en";
  if (!q.trim()) return NextResponse.json({ ok: false }, { status: 400 });
  const wiki = await wikiSummary(q, lang, city);
  return NextResponse.json({ ok: true, ...wiki });
}
