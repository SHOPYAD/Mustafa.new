import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getResellerCompanies,
  getResellerCompany,
  updateResellerCompany,
  deleteResellerCompany,
  type ResellerCompany,
} from "@/lib/server/resale-store";
import { getCompanyWallet } from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const companies = await getResellerCompanies();
    const enriched = await Promise.all(
      companies.map(async (c) => {
        const wallet = await getCompanyWallet(c.id);
        return {
          ...c,
          wallet,
        };
      })
    );

    return NextResponse.json({ ok: true, companies: enriched });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load subscriptions";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      action: "change_plan" | "toggle_updates" | "suspend" | "resume" | "cancel" | "delete";
      companyId: string;
      newPlan?: "ownership" | "whitelabel_paid" | "whitelabel_free";
      updatesActive?: boolean;
      expiresAt?: string;
    };

    if (!body.companyId) {
      return NextResponse.json({ ok: false, error: "companyId is required" }, { status: 400 });
    }

    const company = await getResellerCompany(body.companyId);
    if (!company) {
      return NextResponse.json({ ok: false, error: "Company not found" }, { status: 404 });
    }

    if (body.action === "delete") {
      const deleted = await deleteResellerCompany(body.companyId);
      return NextResponse.json({ ok: true, deleted, message: "تم حذف الشريك وبياناته نهائياً" });
    }

    if (body.action === "change_plan") {
      if (!body.newPlan) {
        return NextResponse.json({ ok: false, error: "newPlan is required" }, { status: 400 });
      }
      const updated = await updateResellerCompany(body.companyId, {
        planType: body.newPlan,
        monthlyPlanPrice: body.newPlan === "whitelabel_paid" ? 199 : 0,
        subscriptionStatus: "active",
      });
      return NextResponse.json({ ok: true, company: updated, message: "تم تحديث باقة الشريك بنجاح" });
    }

    if (body.action === "toggle_updates") {
      const active = typeof body.updatesActive === "boolean" ? body.updatesActive : !company.updateSubscriptionActive;
      const nextRenewal = active ? new Date(Date.now() + 30 * 86400000).toISOString() : "";
      const updated = await updateResellerCompany(body.companyId, {
        updateSubscriptionActive: active,
        updateSubscriptionExpiresAt: nextRenewal,
      });
      return NextResponse.json({
        ok: true,
        company: updated,
        message: active ? "تم تفعيل اشتراك التحديثات والدعم ($50/شهرياً)" : "تم إيقاف اشتراك التحديثات والدعم",
      });
    }

    if (body.action === "suspend") {
      const updated = await updateResellerCompany(body.companyId, {
        status: "suspended",
        subscriptionStatus: "suspended",
      });
      return NextResponse.json({ ok: true, company: updated, message: "تم إيقاف حساب الشريك مؤقتاً" });
    }

    if (body.action === "resume") {
      const updated = await updateResellerCompany(body.companyId, {
        status: "active",
        subscriptionStatus: "active",
      });
      return NextResponse.json({ ok: true, company: updated, message: "تمت إعادة تفعيل حساب الشريك" });
    }

    if (body.action === "cancel") {
      const updated = await updateResellerCompany(body.companyId, {
        subscriptionStatus: "cancelled",
        updateSubscriptionActive: false,
      });
      return NextResponse.json({ ok: true, company: updated, message: "تم إلغاء الاشتراك والتجديد التلقائي" });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to execute subscription action";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
