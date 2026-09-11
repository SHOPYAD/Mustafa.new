import { NextResponse } from "next/server";
import { getSearchTabsConfig } from "@/lib/server/search-tabs-store";
import { getChannelServices } from "@/lib/server/channel-services-store";

export const runtime = "nodejs";

/** Public website search-tab visibility plus header/footer nav hydrate. */
export async function GET() {
  const [config, channels] = await Promise.all([
    getSearchTabsConfig(),
    getChannelServices(),
  ]);
  return NextResponse.json({
    ok: true,
    ...config,
    websiteEnabled: channels.websiteEnabled,
    appEnabled: channels.appEnabled,
    navVisibility: channels.navVisibility,
    navOrder: channels.navOrder,
  });
}
