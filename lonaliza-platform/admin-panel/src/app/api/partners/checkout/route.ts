import { NextResponse } from "next/server";
import { getAuthenticatedPartnerCompany } from "@/lib/server/partner-session";
import { getResellerSettings } from "@/lib/server/resale-store";
import { createCheckout } from "@/lib/server/iyzico";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { getServerEnv } from "@/lib/server/env-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      orderType?: "lifetime" | "update_subscription";
      method?: "iyzico" | "whatsapp_bank";
    };

    const orderType = body.orderType === "update_subscription" ? "update_subscription" : "lifetime";
    const method = body.method === "whatsapp_bank" ? "whatsapp_bank" : "iyzico";
    const settings = await getResellerSettings();
    const siteUrl = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));

    const amount = orderType === "lifetime" ? settings.lifetimePrice : settings.updatePrice;
    const currency = settings.currency || "USD";
    const pb = await createAdminPocketBase();

    // 1. WhatsApp Bank Transfer Checkout
    if (method === "whatsapp_bank") {
      const order = await pb.collection("reseller_orders").create({
        company: company.id,
        orderType,
        amount,
        currency,
        method: "whatsapp_bank",
        status: "pending",
        notes: `Order created for ${company.companyName} via WhatsApp Bank`,
      });

      const cleanPhone = settings.supportWhatsapp.replace(/[^\d+]/g, "");
      const msg = encodeURIComponent(
        `مرحباً، أود إتمام دفع باقة ترخيص LIOTRIP عبر التحويل البنكي.\nاسم الشركة: ${company.companyName}\nالبريد: ${company.email}\nرقم الطلب: ${order.id}\nالمبلغ: ${amount} ${currency}`
      );
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${msg}`;

      return NextResponse.json({
        ok: true,
        method: "whatsapp_bank",
        orderId: order.id,
        whatsappUrl,
      });
    }

    // 2. iyzico Hosted Form Checkout
    const conversationId = `resale_${company.id}_${Date.now()}`;
    const orderId = `order_${Date.now()}`;
    const callbackUrl = `${siteUrl}/api/partners/checkout/callback`;

    const checkoutResult = await createCheckout({
      bookingId: orderId,
      conversationId,
      price: amount,
      currency,
      hotelName: "LIOTRIP Tourism Platform",
      roomName: orderType === "lifetime" ? "Lifetime License + 1-Year Contabo VPS" : "Monthly Updates Subscription",
      callbackUrl,
      buyer: {
        id: company.id,
        name: company.companyName.split(" ")[0] || "Partner",
        surname: company.companyName.split(" ").slice(1).join(" ") || "Company",
        email: company.email,
        phone: company.phone || "+905350000000",
        city: "Istanbul",
        country: "Turkey",
        address: "Partner Headquarters",
      },
    });

    if (!checkoutResult.ok || !checkoutResult.paymentPageUrl) {
      return NextResponse.json(
        { ok: false, error: checkoutResult.error || "Failed to initialize iyzico payment form" },
        { status: 400 }
      );
    }

    // Store pending order in PocketBase
    await pb.collection("reseller_orders").create({
      company: company.id,
      orderType,
      amount,
      currency,
      method: "iyzico",
      iyzicoToken: checkoutResult.token || "",
      status: "pending",
      notes: `iyzico conversationId: ${conversationId}`,
    });

    return NextResponse.json({
      ok: true,
      method: "iyzico",
      paymentPageUrl: checkoutResult.paymentPageUrl,
      token: checkoutResult.token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process checkout";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
