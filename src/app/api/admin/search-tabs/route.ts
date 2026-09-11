import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getSearchTabsConfig,
  resetSearchTabsConfig,
  saveSearchTabsConfig,
} from "@/lib/server/search-tabs-store";
import {
  getChannelServices,
  resetAppChannel,
  saveChannelServices,
} from "@/lib/server/channel-services-store";
import type { SearchTabKey, SearchTabVisibility } from "@/data/search-tabs";
import type { NavServiceKey, NavVisibility } from "@/data/nav-visibility";

export const runtime = "nodejs";

async function payload() {
  const [tabs, channels] = await Promise.all([getSearchTabsConfig(), getChannelServices()]);
  return {
    ...tabs,
    websiteEnabled: channels.websiteEnabled,
    appEnabled: channels.appEnabled,
    navVisibility: channels.navVisibility,
    navOrder: channels.navOrder,
  };
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, ...(await payload()) });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      visibility?: SearchTabVisibility;
      websiteEnabled?: SearchTabVisibility;
      appEnabled?: SearchTabVisibility;
      order?: SearchTabKey[];
      navVisibility?: NavVisibility;
      navOrder?: NavServiceKey[];
      reset?: boolean;
      resetApp?: boolean;
    };

    const websiteFlags = body.websiteEnabled ?? body.visibility;

    if (body.reset) {
      const tabs = await resetSearchTabsConfig();
      await saveChannelServices({
        websiteEnabled: tabs.visibility,
        order: tabs.order,
        appEnabled: body.appEnabled,
      });
    } else if (websiteFlags || body.order) {
      await saveSearchTabsConfig({
        visibility: websiteFlags,
        order: body.order,
      });
    }

    if (body.resetApp) {
      await resetAppChannel();
    } else if (
      !body.reset &&
      (websiteFlags || body.appEnabled || body.navVisibility || body.navOrder)
    ) {
      await saveChannelServices({
        websiteEnabled: websiteFlags,
        appEnabled: body.appEnabled,
        order: body.order,
        navVisibility: body.navVisibility,
        navOrder: body.navOrder,
      });
    }

    return NextResponse.json({ ok: true, ...(await payload()) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 400 }
    );
  }
}
