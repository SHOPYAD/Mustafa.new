import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { launchAds } from "@/lib/ads/launch";
import type { AdsLaunchInput } from "@/lib/ads/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: AdsLaunchInput;
  try {
    body = (await req.json()) as AdsLaunchInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const result = await launchAds(body);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "launch_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
