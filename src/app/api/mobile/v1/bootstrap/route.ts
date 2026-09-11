import { NextResponse } from "next/server";
import { getBranding } from "@/lib/server/branding-store";
import { getCurrenciesSettings } from "@/lib/server/currencies-store";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";
import { BUILTIN_LOCALES } from "@/lib/i18n/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [branding, currencies, channels] = await Promise.all([
    getBranding(),
    getCurrenciesSettings(),
    getChannelServices(),
  ]);

  return NextResponse.json(
    {
      ok: true,
      branding: {
        colors: branding.colors,
        logoUrl: branding.logoUrl,
        brandNameAr: branding.brandNameAr,
        brandNameEn: branding.brandNameEn,
      },
      services: appEnabledKeys(channels).map((key) => ({ key })),
      locales: [...BUILTIN_LOCALES],
      currencies: currencies.currencies.filter((row) => row.enabled).map((row) => row.code),
    },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
