import { NextRequest, NextResponse } from "next/server";
import { CURRENCY_CATALOG } from "@/data/currency-catalog";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getCurrenciesSettings,
  saveCurrenciesSettings,
  setCurrencyEnabled,
} from "@/lib/server/currencies-store";
import { getAdminFxStatus } from "@/lib/server/fx-service";
import type { CurrenciesSettings, SiteCurrency } from "@/types/currency";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const settings = await getCurrenciesSettings();
  const fx = await getAdminFxStatus();
  return NextResponse.json({
    ok: true,
    settings,
    catalogCount: CURRENCY_CATALOG.length,
    fx,
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Partial<CurrenciesSettings> & {
      currency?: Partial<SiteCurrency> & { code?: string; enabled?: boolean };
      enabledCodes?: string[];
    };
    if (body.currency?.code && typeof body.currency.enabled === "boolean") {
      const settings = await setCurrencyEnabled(body.currency.code, body.currency.enabled);
      const fx = await getAdminFxStatus();
      return NextResponse.json({ ok: true, settings, catalogCount: CURRENCY_CATALOG.length, fx });
    }
    const settings = await saveCurrenciesSettings(body);
    const fx = await getAdminFxStatus();
    return NextResponse.json({ ok: true, settings, catalogCount: CURRENCY_CATALOG.length, fx });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 400 }
    );
  }
}
