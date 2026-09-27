import { NextResponse } from "next/server";
import { getAuthenticatedPartnerCompany } from "@/lib/server/partner-session";
import {
  createWalletDeposit,
  getCompanyTransactions,
  getCompanyWallet,
  getWhiteLabelSettings,
} from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const [wallet, transactions, settings] = await Promise.all([
      getCompanyWallet(company.id),
      getCompanyTransactions(company.id),
      getWhiteLabelSettings(),
    ]);

    return NextResponse.json({
      ok: true,
      wallet,
      transactions,
      settings: {
        minDepositAmount: settings.minDepositAmount,
        cardFeePercent: settings.cardFeePercent,
        cardHoldDays: settings.cardHoldDays,
        bankName: settings.bankName,
        bankBeneficiary: settings.bankBeneficiary,
        bankIban: settings.bankIban,
        bankSwift: settings.bankSwift,
        bankCurrency: settings.bankCurrency,
        bankInstructions: settings.bankInstructions,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load wallet";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      amount: number;
      method: "card" | "bank";
      addFeeOnTop?: boolean;
      referenceId?: string;
      notes?: string;
      proofFile?: string;
    };

    const amount = Number(body.amount);
    if (!amount || amount < 2000) {
      return NextResponse.json(
        { ok: false, error: "الحد الأدنى لرفع الديبوزيت في المحفظة هو 2,000 دولار أمريكي." },
        { status: 400 }
      );
    }

    if (body.method !== "card" && body.method !== "bank") {
      return NextResponse.json(
        { ok: false, error: "طريقة الدفع غير صالحة. يرجى الاختيار بين البطاقة الائتمانية أو التحويل البنكي." },
        { status: 400 }
      );
    }

    const result = await createWalletDeposit({
      companyId: company.id,
      amount,
      method: body.method,
      addFeeOnTop: Boolean(body.addFeeOnTop),
      referenceId: body.referenceId,
      notes: body.notes,
      proofFile: body.proofFile,
    });

    const updatedWallet = await getCompanyWallet(company.id);

    return NextResponse.json({
      ok: true,
      transaction: result.transaction,
      wallet: updatedWallet,
      message: result.message,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process deposit";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
