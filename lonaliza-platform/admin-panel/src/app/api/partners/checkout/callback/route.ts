import { NextRequest, NextResponse } from "next/server";
import { retrieveCheckout } from "@/lib/server/iyzico";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { getServerEnv } from "@/lib/server/env-store";
import {
  initCompanyProgress,
  issueLicenseForCompany,
} from "@/lib/server/resale-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const siteUrl = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));

  try {
    const formData = await req.formData();
    const token = String(formData.get("token") || "").trim();

    if (!token) {
      return NextResponse.redirect(`${siteUrl}/partners/dashboard?payment=token_missing`, 302);
    }

    const pb = await createAdminPocketBase();
    const orderRecords = await pb.collection("reseller_orders").getFullList({
      filter: `iyzicoToken="${token}"`,
      limit: 1,
    });

    if (orderRecords.length === 0) {
      return NextResponse.redirect(`${siteUrl}/partners/dashboard?payment=order_not_found`, 302);
    }

    const order = orderRecords[0];
    const retrieveResult = await retrieveCheckout(token);

    if (!retrieveResult.paid) {
      await pb.collection("reseller_orders").update(order.id, {
        status: "failed",
        notes: `Payment failed: ${retrieveResult.error || "unknown"}`,
      });
      return NextResponse.redirect(
        `${siteUrl}/partners/dashboard?payment=failed&error=${encodeURIComponent(retrieveResult.error || "payment_failed")}`,
        302
      );
    }

    // Payment Succeeded!
    await pb.collection("reseller_orders").update(order.id, {
      status: "paid",
      iyzicoPaymentId: retrieveResult.paymentId || "",
    });

    // Update Company to Paid / Provisioning
    await pb.collection("reseller_companies").update(order.company, {
      status: "paid",
    });

    // Issue License Key for this company
    await issueLicenseForCompany(order.company);

    // Initialize 10 Delivery Stages
    await initCompanyProgress(order.company);

    // Send super admin notification
    try {
      await pb.collection("admin_notifications").create({
        title: "طلب ترخيص جديد مدفوع",
        message: `تم دفع باقة الترخيص بنجاح (${order.amount} ${order.currency}) لطلب رقم ${order.id}. يرجى البدء بتجهيز السيرفر.`,
        type: "booking",
        read: false,
      });
    } catch {
      /* non-blocking */
    }

    return NextResponse.redirect(`${siteUrl}/partners/dashboard?payment=success`, 302);
  } catch (err) {
    console.error("[partners/checkout/callback] error:", err);
    return NextResponse.redirect(`${siteUrl}/partners/dashboard?payment=server_error`, 302);
  }
}
