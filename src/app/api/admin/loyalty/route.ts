import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getCurrenciesSettings } from "@/lib/server/currencies-store";
import {
  deleteCoupon,
  getLoyaltySettings,
  listCoupons,
  saveLoyaltySettings,
  upsertCoupon,
} from "@/lib/loyalty/store";
import { isLoyaltyService } from "@/lib/loyalty/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") || "coupons";
  const currencies = await getCurrenciesSettings();
  const currencyCodes = currencies.currencies.filter((c) => c.enabled).map((c) => c.code);

  if (tab === "settings") {
    const settings = await getLoyaltySettings();
    return NextResponse.json({ ok: true, settings, currencyCodes });
  }

  const coupons = await listCoupons();
  return NextResponse.json({ ok: true, coupons, currencyCodes });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action || "save");
  try {
    if (action === "settings") {
      const settings = await saveLoyaltySettings(body);
      return NextResponse.json({ ok: true, settings });
    }
    if (action === "delete") {
      const id = String(body.id || "");
      const ok = await deleteCoupon(id);
      return NextResponse.json({ ok });
    }
    if (action === "save") {
      if (body.service && !isLoyaltyService(body.service)) {
        return NextResponse.json({ ok: false, error: "service" }, { status: 400 });
      }
      const coupon = await upsertCoupon(body, body.id ? String(body.id) : undefined);
      return NextResponse.json({ ok: true, coupon });
    }
    return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
