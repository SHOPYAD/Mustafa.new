import { NextResponse } from "next/server";
import {
  getWhiteLabelSettings,
  verifyB2BPartnerKey,
} from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

function extractKey(req: Request): string {
  const header = req.headers.get("x-lonaliza-b2b-key") || req.headers.get("x-api-key") || "";
  if (header) return header.trim();

  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();

  const url = new URL(req.url);
  return url.searchParams.get("apiKey") || "";
}

export async function GET(req: Request) {
  const key = extractKey(req);
  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "missing_api_key",
        errorMessage: "يرجى تزويد مفتاح API Key في الترويسة x-lonaliza-b2b-key أو Authorization",
      },
      { status: 401 }
    );
  }

  const check = await verifyB2BPartnerKey(key);
  if (!check.ok || !check.company) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: check.errorCode || "unauthorized",
        errorMessage: check.errorMessage || "المفتاح البرمجي غير صالح",
      },
      { status: 403 }
    );
  }

  const settings = await getWhiteLabelSettings();
  const suppliers =
    check.module === "flights"
      ? settings.flightsEnabledSuppliers
      : check.module === "hotels"
      ? settings.hotelsEnabledSuppliers
      : settings.transfersEnabledSuppliers;

  return NextResponse.json({
    ok: true,
    connected: true,
    channel: "Lonaliza Global B2B Redistribution Network",
    module: check.module,
    moduleName:
      check.module === "flights"
        ? "طيران لوناليزا (Lonaliza Flights)"
        : check.module === "hotels"
        ? "فنادق لوناليزا (Lonaliza Hotels)"
        : "سيارات وترانسفير لوناليزا (Lonaliza Transfers)",
    companyName: check.company.companyName,
    companyEmail: check.company.email,
    planType: check.company.planType,
    walletBalance: check.availableBalance,
    minDepositRequired: settings.minDepositAmount,
    minDepositMet: check.minDepositMet,
    activeSuppliersAggregated: suppliers.length,
    timestamp: new Date().toISOString(),
    message: "تم الاتصال بنجاح بقنوات توزيع لوناليزا العالمية. كافة المحركات جاهزة للاستخدام.",
  });
}

export async function POST(req: Request) {
  return GET(req);
}
