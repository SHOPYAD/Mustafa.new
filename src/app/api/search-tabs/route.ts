import { NextResponse } from "next/server";
import { getSearchTabsConfig } from "@/lib/server/search-tabs-store";

export const runtime = "nodejs";

/** Public search-tab visibility — same payload on every breakpoint/device. */
export async function GET() {
  const config = await getSearchTabsConfig();
  return NextResponse.json({ ok: true, ...config });
}
