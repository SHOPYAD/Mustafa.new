import { NextResponse } from "next/server";
import { getStorefrontInitData } from "@/lib/server/site-init-loader";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceFresh = url.searchParams.get("refresh") === "1";
    const data = await getStorefrontInitData(forceFresh);

    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "max-age=60",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load storefront init data" },
      { status: 500 }
    );
  }
}
