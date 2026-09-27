import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { applyEmailPlaceholders, type EmailVisualDocument } from "@/lib/email/visual-doc";
import { getEmailBrand } from "@/lib/server/email/brand";
import { getTemplate } from "@/lib/server/email/campaigns";
import { compileVisualTemplate, resolveVisualDocument } from "@/lib/server/email/compile-visual";
import { renderTemplateMessage } from "@/lib/server/email/send";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      templateId?: string;
      html?: string;
      subject?: string;
      document?: EmailVisualDocument | Record<string, unknown>;
      vars?: Record<string, string>;
    };
    const brand = await getEmailBrand();
    const sample = {
      name: "محمد أحمد",
      company: brand.brandNameAr,
      email: "",
      offer_title: "عرض من " + brand.brandNameAr,
      offer_detail: "تفاصيل العرض حسب اختيارك.",
      cta_url: `${brand.siteUrl}/account`,
      cta_label_ar: "عرض التفاصيل",
      cta_label_en: "View details",
      route: "",
      depart_date: "",
      return_date: "",
      passengers: "",
      hotel_name: "",
      room_name: "",
      check_in: "",
      check_out: "",
      nights: "",
      bookingId: "BK-PREVIEW",
      booking_id: "BK-PREVIEW",
      service_name: "",
      detail_ar: "",
      detail_en: "",
      amount: "—",
      currency: "",
      invoice_url: brand.siteUrl,
      payment_ref: "",
      ...(body.vars || {}),
    };

    if (body.document) {
      const compiled = compileVisualTemplate(
        resolveVisualDocument({ html_ar: "", html_en: "", document: body.document }, brand),
        brand
      );
      return NextResponse.json({
        ok: true,
        html: applyEmailPlaceholders(compiled.html, sample),
        subject: applyEmailPlaceholders(String(body.subject || ""), sample),
        document: compiled.document,
        brand,
      });
    }

    if (body.templateId) {
      const template = await getTemplate(body.templateId);
      const locale = String(body.vars?.locale || "ar");
      const rendered = await renderTemplateMessage(template, sample, brand, locale);
      return NextResponse.json({
        ok: true,
        ...rendered,
        document: resolveVisualDocument(template, brand),
        brand,
      });
    }

    const fake = {
      id: "preview",
      slug: "preview",
      kind: "custom" as const,
      name: "preview",
      subject_ar: String(body.subject || "معاينة"),
      subject_en: String(body.subject || "Preview"),
      html_ar: String(body.html || ""),
      html_en: String(body.html || ""),
      text_ar: "",
      text_en: "",
      is_builtin: false,
      source: "manual" as const,
    };
    const rendered = await renderTemplateMessage(fake, sample, brand, "ar");
    return NextResponse.json({ ok: true, ...rendered, brand });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّرت المعاينة" },
      { status: 400 }
    );
  }
}
