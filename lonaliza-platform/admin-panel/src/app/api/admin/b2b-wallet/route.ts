import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getWhiteLabelSettings,
  getCompanyWallet,
  getCompanyTransactions,
  recordWalletTransaction,
  testB2BHandshake,
} from "@/lib/server/reseller-whitelabel-store";
import { getResellerCompanies, getResellerCompany } from "@/lib/server/resale-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");

    // If companyId provided or find the primary company for this instance
    const companies = await getResellerCompanies();
    const targetCompany = companyId
      ? companies.find((c) => c.id === companyId) || companies[0]
      : companies[0];

    const wlSettings = await getWhiteLabelSettings();

    if (!targetCompany) {
      return NextResponse.json({
        ok: true,
        wallet: {
          availableBalance: 0,
          holdBalance: 0,
          totalDeposited: 0,
          totalSpent: 0,
          isDepositSufficient: false,
          minDepositRequired: wlSettings.minDepositAmount || 2000,
          canBook: false,
        },
        transactions: [],
        wlSettings,
        company: null,
      });
    }

    const [wallet, transactions] = await Promise.all([
      getCompanyWallet(targetCompany.id),
      getCompanyTransactions(targetCompany.id),
    ]);

    return NextResponse.json({
      ok: true,
      company: {
        id: targetCompany.id,
        name: targetCompany.companyName,
        planType: targetCompany.planType || "ownership",
        apiKeyMaster: targetCompany.b2bApiKeyMaster || "",
        apiSecret: targetCompany.b2bApiSecret ? "●●●●●●●●" + targetCompany.b2bApiSecret.slice(-6) : "",
      },
      wallet,
      transactions,
      wlSettings,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load wallet data";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      action: "deposit_card" | "deposit_bank" | "test_handshake";
      amount?: number;
      companyId?: string;
      notes?: string;
      apiKey?: string;
      apiSecret?: string;
    };

    if (body.action === "test_handshake") {
      const result = await testB2BHandshake(body.apiKey || "", body.apiSecret || "");
      return NextResponse.json(result);
    }

    const companies = await getResellerCompanies();
    const targetCompany = body.companyId
      ? companies.find((c) => c.id === body.companyId) || companies[0]
      : companies[0];

    if (!targetCompany) {
      return NextResponse.json({ ok: false, error: "No partner company record found" }, { status: 400 });
    }

    const wlSettings = await getWhiteLabelSettings();
    const amount = Number(body.amount) || 0;

    if (amount <= 0) {
      return NextResponse.json({ ok: false, error: "المبلغ غير صالح" }, { status: 400 });
    }

    if (body.action === "deposit_card") {
      const feePercent = wlSettings.cardFeePercent || 2.9;
      const fee = Math.round(amount * (feePercent / 100) * 100) / 100;
      const net = amount;

      await recordWalletTransaction({
        company: targetCompany.id,
        type: "deposit_card",
        amount,
        fee,
        netAmount: net,
        status: "cleared", // Instant clearing for card payment
        notes: body.notes || "شحن فوري بالبطاقة الائتمانية عبر بوابة Iyzico",
      });

      return NextResponse.json({
        ok: true,
        message: `تم إيداع $${net.toLocaleString()} في محفظتك بنجاح وتفعيل الرصيد فوراً!`,
      });
    }

    if (body.action === "deposit_bank") {
      await recordWalletTransaction({
        company: targetCompany.id,
        type: "deposit_bank",
        amount,
        fee: 0,
        netAmount: amount,
        status: "pending",
        notes: body.notes || "طلب إيداع عبر التحويل البنكي — قيد التدقيق الإداري",
      });

      return NextResponse.json({
        ok: true,
        message: "تم رفع إشعار التحويل البنكي بنجاح. سيتم تفعيل الرصيد فور مطابقة الحوالة.",
      });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process wallet action";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
