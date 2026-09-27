import { NextResponse } from "next/server";
import { listMergedTours } from "@/lib/server/tours-store";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";

export const runtime = "nodejs";

export async function GET() {
  const channels = await getChannelServices();
  if (!appEnabledKeys(channels).includes("tours") && !appEnabledKeys(channels).includes("holiday")) {
    return NextResponse.json({ ok: true, tours: [], empty: true });
  }
  const tours = (await listMergedTours()).filter((row) => row.isActive !== false);
  return NextResponse.json({ ok: true, tours });
}
