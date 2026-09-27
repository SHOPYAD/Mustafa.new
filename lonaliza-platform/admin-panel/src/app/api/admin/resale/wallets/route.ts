import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getResellerCompanies } from "@/lib/server/resale-store";
import {
  approveOrClearTransaction,
  getCompanyTransactions,
  getCompanyWallet,
  getWhiteLabelSettings,
  manualAdjustWallet,
  type B2BWalletSummary,
  type B2BWalletTransaction,
} from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const companies = await getResellerCompanies();
  const settings = await getWhiteLabelSettings();

  const wallets: B2BWalletSummary[] = await Promise.all(
    companies.map((c) => getCompanyWallet(c.id))
  );

  // Fetch all transactions across companies
  const txsNested = await Promise.all(companies.map((c) => getCompanyTransactions(c.id)));
  const allTxs: B2BWalletTransaction[] = txsNested
    .flat()
    .sort((a, b) => (b.created > a.created ? 1 : -1));

  const totalDeposits = wallets.reduce((sum, w) => sum + w.totalDeposited, 0);
  const totalAvailable = wallets.reduce((sum, w) => sum + w.availableBalance, 0);
  const totalHold = wallets.reduce((sum, w) => sum + w.holdBalance, 0);
  const totalSpent = wallets.reduce((sum, w) => sum + w.totalSpent, 0);

  return NextResponse.json({
    ok: true,
    wallets,
    transactions: allTxs,
    settings,
    metrics: {
      totalDeposits,
      totalAvailable,
      totalHold,
      totalSpent,
      walletsCount: wallets.length,
      sufficientWallets: wallets.filter((w) => w.isDepositSufficient).length,
    },
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      action: "approve" | "reject" | "manual_adjust";
      transactionId?: string;
      companyId?: string;
      amount?: number;
      reason?: string;
      adminNotes?: string;
    };

    if (body.action === "approve" || body.action === "reject") {
      if (!body.transactionId) {
        return NextResponse.json({ ok: false, error: "معرّف المعاملة مطلوب" }, { status: 400 });
      }
      const res = await approveOrClearTransaction(body.transactionId, body.action, body.adminNotes);
      return NextResponse.json({ ok: true, message: res.message });
    }

    if (body.action === "manual_adjust") {
      if (!body.companyId || body.amount === undefined || !body.reason) {
        return NextResponse.json(
          { ok: false, error: "بيانات التعديل غير مكتملة (مطلوب: الشركة، المبلغ، والسبب)" },
          { status: 400 }
        );
      }

      const updatedWallet = await manualAdjustWallet({
        companyId: body.companyId,
        amount: Number(body.amount),
        reason: body.reason,
        adminName: "Super Admin",
      });

      return NextResponse.json({
        ok: true,
        wallet: updatedWallet,
        message: "تم تعديل رصيد المحفظة وتوثيق العملية في السجل المالي بنجاح",
      });
    }

    return NextResponse.json({ ok: false, error: "إجراء غير صالح" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process wallet action";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
