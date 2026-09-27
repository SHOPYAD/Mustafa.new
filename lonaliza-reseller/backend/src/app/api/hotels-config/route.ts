import { NextResponse } from "next/server";
import { runtimePrimaryProvider } from "@/lib/hotels-runtime";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";

export const runtime = "nodejs";

export async function GET() {
  const hotelsRuntime = await getHotelsRuntime();
  return NextResponse.json(
    {
      ok: true,
      config: { provider: runtimePrimaryProvider(hotelsRuntime) },
      runtime: {
        mode: hotelsRuntime.mode,
        providers: hotelsRuntime.providers,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
