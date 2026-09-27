import { NextResponse } from "next/server";
import { listMergedPackages } from "@/lib/server/packages-store";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";

export const runtime = "nodejs";

export async function GET() {
  const channels = await getChannelServices();
  const enabled = appEnabledKeys(channels);
  if (!enabled.includes("holiday") && !enabled.includes("tours")) {
    return NextResponse.json({ ok: true, packages: [], empty: true });
  }
  const packages = await listMergedPackages();
  return NextResponse.json({ ok: true, packages });
}
