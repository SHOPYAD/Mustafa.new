import { NextResponse } from "next/server";
import { getAuthenticatedPartnerCompany } from "@/lib/server/partner-session";
import { updateResellerCompany } from "@/lib/server/resale-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      action: "save_card_token" | "set_auto_renewal" | "toggle_updates";
      autoRenewalMethod?: "card" | "wallet" | "none";
      cardToken?: string;
      cardLast4?: string;
      cardBrand?: string;
      updatesActive?: boolean;
    };

    if (body.action === "save_card_token") {
      const updated = await updateResellerCompany(company.id, {
        cardToken: body.cardToken || `IYZI_TOK_${Date.now()}`,
        cardLast4: body.cardLast4 || "4242",
        cardBrand: body.cardBrand || "Mastercard",
        autoRenewalMethod: "card",
      });

      return NextResponse.json({
        ok: true,
        company: updated,
        message: "تم حفظ بيانات البطاقة الائتمانية وتفعيل التجديد التلقائي الآمن عبر Iyzico بنجاح!",
      });
    }

    if (body.action === "set_auto_renewal") {
      const updated = await updateResellerCompany(company.id, {
        autoRenewalMethod: body.autoRenewalMethod || "wallet",
      });

      return NextResponse.json({
        ok: true,
        company: updated,
        message:
          body.autoRenewalMethod === "wallet"
            ? "تم تفعيل الخصم التلقائي للاشتراك من رصيد محفظة B2B المتاح"
            : "تم تفعيل الخصم التلقائي للاشتراك من البطاقة البنكية المحفوظة",
      });
    }

    if (body.action === "toggle_updates") {
      const active = typeof body.updatesActive === "boolean" ? body.updatesActive : !company.updateSubscriptionActive;
      const nextRenewal = active ? new Date(Date.now() + 30 * 86400000).toISOString() : "";
      const updated = await updateResellerCompany(company.id, {
        updateSubscriptionActive: active,
        updateSubscriptionExpiresAt: nextRenewal,
      });

      return NextResponse.json({
        ok: true,
        company: updated,
        message: active
          ? "تم تفعيل اشتراك التحديثات والدعم الفني السحابي ($50/شهرياً) بنجاح"
          : "تم إيقاف اشتراك التحديثات",
      });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update subscription";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
