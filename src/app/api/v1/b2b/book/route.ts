import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  deductBookingFromWallet,
  getCompanyWallet,
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

export async function POST(req: Request) {
  try {
    const apiKey = extractKey(req);
    const check = await verifyB2BPartnerKey(apiKey);

    if (!check.ok || !check.company) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: check.errorCode || "unauthorized",
          errorMessage: check.errorMessage || "المفتاح البرمجي غير مصرح له أو رصيد الديبوزيت غير كافٍ.",
        },
        { status: 403 }
      );
    }

    const body = (await req.json()) as {
      serviceType: "flight" | "hotel" | "transfer";
      amount: number;
      passengerName: string;
      customerEmail?: string;
      customerPhone?: string;
      itemTitle: string;
      details?: Record<string, unknown>;
    };

    const amount = Number(body.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: "قيمة الحجز غير صالحة" },
        { status: 400 }
      );
    }

    const settings = await getWhiteLabelSettings();
    const wallet = await getCompanyWallet(check.company.id);

    if (wallet.availableBalance < amount) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "insufficient_balance",
          error: `رصيد المحفظة غير كافٍ ($${wallet.availableBalance.toLocaleString()}). تكلفة الحجز هي ($${amount.toLocaleString()}). يرجى شحن الرصيد من لوحة الشركاء.`,
          availableBalance: wallet.availableBalance,
          requiredAmount: amount,
        },
        { status: 402 }
      );
    }

    // Determine platform markup and supplier cost
    const markupPercent =
      body.serviceType === "flight"
        ? settings.flightsMarkupPercent
        : body.serviceType === "hotel"
        ? settings.hotelsMarkupPercent
        : settings.transfersMarkupPercent;

    const supplierCost = Math.round((amount / (1 + markupPercent / 100)) * 100) / 100;
    const platformMarkup = Math.round((amount - supplierCost) * 100) / 100;

    const bookingRef = `BK-LONA-${Date.now().toString().slice(-6)}-${randomBytes(2).toString("hex").toUpperCase()}`;
    const pnr = `PNR${randomBytes(3).toString("hex").toUpperCase()}`;

    // Execute automatic deduction from partner's B2B wallet
    const deduction = await deductBookingFromWallet({
      companyId: check.company.id,
      amount,
      serviceType: body.serviceType,
      bookingRef,
      supplierId: `lona_${body.serviceType}_master`,
      supplierCost,
      platformMarkup,
      passengerName: body.passengerName,
      customerEmail: body.customerEmail,
      ticketData: {
        itemTitle: body.itemTitle,
        pnr,
        details: body.details,
        confirmedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      confirmed: true,
      bookingRef,
      pnr,
      serviceType: body.serviceType,
      passengerName: body.passengerName,
      totalCharged: amount,
      remainingWalletBalance: deduction.remainingBalance,
      voucherUrl: `https://lonaliza.com/voucher/${bookingRef}`,
      message: "تم تأكيد الحجز بنجاح واقتطاع القيمة من محفظة الديبوزيت. التذكرة جاهزة للتحميل.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Booking execution failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
