import { NextResponse } from "next/server";
import { listPublicPageLinks } from "@/lib/server/pages-store";

export const runtime = "nodejs";

export async function GET() {
  const pages = await listPublicPageLinks();
  return NextResponse.json(
    { ok: true, pages },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
