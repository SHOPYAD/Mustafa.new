import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getSearchTabsConfig,
  resetSearchTabsConfig,
  saveSearchTabsConfig,
} from "@/lib/server/search-tabs-store";
import type { SearchTabKey, SearchTabVisibility } from "@/data/search-tabs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const config = await getSearchTabsConfig();
  return NextResponse.json({ ok: true, ...config });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      visibility?: SearchTabVisibility;
      order?: SearchTabKey[];
      reset?: boolean;
    };
    const config = body.reset
      ? await resetSearchTabsConfig()
      : await saveSearchTabsConfig({
          visibility: body.visibility,
          order: body.order,
        });
    return NextResponse.json({ ok: true, ...config });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 400 }
    );
  }
}
