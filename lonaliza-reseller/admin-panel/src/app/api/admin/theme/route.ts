import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getBranding, saveBranding } from "@/lib/server/branding-store";
import {
  getBrandTheme,
  saveBrandTheme,
} from "@/lib/server/brand-theme-store";
import { ttlDelete } from "@/lib/server/ttl-cache";
import type { BrandTheme } from "@/lib/theme/tokens";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const theme = await getBrandTheme();
  return NextResponse.json({ ok: true, theme });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Partial<BrandTheme> & {
      applyPresetId?: string;
      syncBrandingColors?: boolean;
      reset?: boolean;
    };
    const theme = await saveBrandTheme(body);
    ttlDelete("public-theme");
    ttlDelete("public-branding");
    if (body.syncBrandingColors !== false) {
      const current = await getBranding();
      await saveBranding(
        { colors: { ...current.colors, ...theme.colors } },
        { merge: true }
      );
    }
    return NextResponse.json({ ok: true, theme });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
