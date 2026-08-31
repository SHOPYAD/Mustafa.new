import type PocketBase from "pocketbase";
import {
  createBlock,
  defaultVisualDocument,
  type EmailVisualDocument,
} from "@/lib/email/visual-doc";
import { compileVisualTemplate } from "@/lib/server/email/compile-visual";
import { defaultDirForCode } from "@/lib/i18n/catalog";
import {
  brandDisplayName,
  EMAIL_FOOTER_END,
  EMAIL_FOOTER_START,
  EMAIL_LOGO_END,
  EMAIL_LOGO_START,
  emailFooterInner,
  emailLogoInner,
  escHtml,
  getEmailBrand,
  type EmailBrand,
} from "@/lib/server/email/brand";
import { EMAIL_TEMPLATE_KIND_LABELS, KIND_SLUG, seedValue } from "@/lib/server/email/i18n-keys";
import { emailT } from "@/lib/server/email/template-i18n";
import {
  assertNeverKind,
  type EmailTemplateKind,
  type EmailTemplateRecord,
} from "@/lib/server/email/types";

const SERVICE_VARS = [
  "name",
  "company",
  "booking_id",
  "bookingId",
  "service_name",
  "detail_ar",
  "detail_en",
  "amount",
  "currency",
  "cta_url",
];

export const TEMPLATE_VARIABLES: Record<EmailTemplateKind, string[]> = {
  offers_reminder: [
    "name",
    "company",
    "offer_title",
    "offer_detail",
    "cta_url",
    "cta_label_ar",
    "cta_label_en",
  ],
  flight_reminder: [
    "name",
    "company",
    "route",
    "depart_date",
    "return_date",
    "passengers",
    "amount",
    "currency",
    "cta_url",
  ],
  hotel_reminder: [
    "name",
    "company",
    "hotel_name",
    "check_in",
    "check_out",
    "nights",
    "room_name",
    "amount",
    "currency",
    "cta_url",
  ],
  package_reminder: SERVICE_VARS,
  tour_reminder: SERVICE_VARS,
  transfer_reminder: SERVICE_VARS,
  car_reminder: SERVICE_VARS,
  visa_reminder: SERVICE_VARS,
  booking_success: SERVICE_VARS,
  hotel_success: SERVICE_VARS,
  flight_success: SERVICE_VARS,
  package_success: SERVICE_VARS,
  tour_success: SERVICE_VARS,
  transfer_success: SERVICE_VARS,
  car_success: SERVICE_VARS,
  visa_success: SERVICE_VARS,
  invoice: [
    "name",
    "company",
    "booking_id",
    "bookingId",
    "service_name",
    "detail_ar",
    "detail_en",
    "amount",
    "currency",
    "invoice_url",
    "payment_ref",
  ],
  custom: ["name", "company", "bookingId", "amount", "email", "cta_url"],
};

export function kindLabel(kind: EmailTemplateKind, locale = "ar"): string {
  if (kind === "custom") {
    if (locale === "en") return "Custom template";
    if (locale === "tr") return "Özel şablon";
    return "قالب مخصّص";
  }
  const row = EMAIL_TEMPLATE_KIND_LABELS[kind];
  if (!row) return assertNeverKind(kind as never);
  if (locale === "en") return row.en;
  if (locale === "tr") return row.tr;
  return row.ar;
}

function wrapEmail(brand: EmailBrand, inner: string, locale = "ar"): string {
  const name = escHtml(brandDisplayName(brand, locale));
  const primary = escHtml(brand.primary);
  const accent = escHtml(brand.accent);
  const dir = defaultDirForCode(locale);
  const align = dir === "rtl" ? "right" : "left";

  return `<!DOCTYPE html>
<html lang="${escHtml(locale)}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${name}</title>
</head>
<body style="margin:0;padding:0;background:#f4efe6;font-family:Tahoma,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #eadfcd;">
          <tr>
            <td style="background:${accent};padding:18px 28px;">
              ${EMAIL_LOGO_START}${emailLogoInner(brand, brand.logoUrl, locale)}${EMAIL_LOGO_END}
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${primary};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 28px;direction:${dir};text-align:${align};color:#122033;">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="background:#faf6ef;padding:18px 28px;color:#6b5b4b;font-size:12px;line-height:1.7;text-align:center;">
              ${EMAIL_FOOTER_START}${emailFooterInner(brand, locale)}${EMAIL_FOOTER_END}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function cta(brand: EmailBrand, hrefKey: string, label: string): string {
  const href = `{{${hrefKey}}}`;
  const color = escHtml(brand.button);
  return `<p style="margin:22px 0 8px;"><a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;">${label}</a></p>`;
}

function card(rows: Array<[string, string]>): string {
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 0;color:#6b5b4b;font-size:13px;">${k}</td><td style="padding:7px 0;font-weight:700;font-size:13px;">${v}</td></tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" style="background:#faf6ef;border-radius:12px;padding:4px 14px;margin:16px 0;">${body}</table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 10px;font-size:22px;">${text}</h1>`;
}

function lead(text: string): string {
  return `<p style="margin:0;color:#5b4d3e;line-height:1.8;">${text}</p>`;
}

function detailField(locale: string): string {
  return locale === "en" || locale === "tr" ? "{{detail_en}}" : "{{detail_ar}}";
}

function builtinInner(
  kind: EmailTemplateKind,
  brand: EmailBrand,
  locale: string,
  t: (key: string) => string
): { subject: string; html: string; text: string } {
  const slug = kind === "custom" ? "custom" : KIND_SLUG[kind];
  const k = (part: string) => t(`email.templates.${slug}.${part}`);
  const L = (part: string) => t(`email.templates.common.label.${part}`);
  const C = (part: string) => t(`email.templates.common.cta.${part}`);

  switch (kind) {
    case "offers_reminder":
      return {
        subject: k("subject"),
        html: `${heading(k("heading"))}
<p style="margin:0 0 8px;color:#8a735a;font-size:13px;">{{company}}</p>
${lead(k("lead"))}
<h2 style="margin:18px 0 8px;font-size:18px;color:${escHtml(brand.primary)};">{{offer_title}}</h2>
<p style="margin:0;line-height:1.8;">{{offer_detail}}</p>
${cta(brand, "cta_url", "{{cta_label}}")}`,
        text: k("text"),
      };
    case "flight_reminder":
      return {
        subject: k("subject"),
        html: `${heading(k("heading"))}
${lead(k("lead"))}
${card([
  [L("route"), "{{route}}"],
  [L("depart"), "{{depart_date}}"],
  [L("return"), "{{return_date}}"],
  [L("passengers"), "{{passengers}}"],
  [L("fare"), "{{currency}} {{amount}}"],
])}
${cta(brand, "cta_url", C("completeBooking"))}`,
        text: k("text"),
      };
    case "hotel_reminder":
      return {
        subject: k("subject"),
        html: `${heading(k("heading"))}
${lead(k("lead"))}
${card([
  [L("hotel"), "{{hotel_name}}"],
  [L("room"), "{{room_name}}"],
  [L("checkIn"), "{{check_in}}"],
  [L("checkOut"), "{{check_out}}"],
  [L("nights"), "{{nights}}"],
  [L("total"), "{{currency}} {{amount}}"],
])}
${cta(brand, "cta_url", C("continueBooking"))}`,
        text: k("text"),
      };
    case "booking_success":
      return {
        subject: k("subject"),
        html: `${heading(k("heading"))}
${lead(k("lead"))}
${card([
  [L("bookingId"), "{{booking_id}}"],
  [L("service"), "{{service_name}}"],
  [L("details"), detailField(locale)],
  [L("amount"), "{{currency}} {{amount}}"],
])}
${cta(brand, "cta_url", C("viewBooking"))}`,
        text: k("text"),
      };
    case "invoice":
      return {
        subject: k("subject"),
        html: `${heading(k("heading"))}
${lead(k("lead"))}
${card([
  [L("bookingId"), "{{booking_id}}"],
  [L("service"), "{{service_name}}"],
  [L("details"), detailField(locale)],
  [L("paid"), "{{currency}} {{amount}}"],
  [L("paymentRef"), "{{payment_ref}}"],
])}
${cta(brand, "invoice_url", C("downloadInvoice"))}`,
        text: k("text"),
      };
    case "custom":
      return {
        subject:
          locale === "en"
            ? "A note from Alrayyan Tourism"
            : locale === "tr"
              ? "Alrayyan Turizm’den bir not"
              : "رسالة من الريان للسياحة",
        html: `${heading(
          locale === "en" ? "Hello {{name}}" : locale === "tr" ? "Merhaba {{name}}" : "مرحباً {{name}}"
        )}
<p style="margin:0 0 8px;color:#8a735a;font-size:13px;">{{company}}</p>`,
        text: locale === "en" ? "Hello {{name}}" : locale === "tr" ? "Merhaba {{name}}" : "مرحباً {{name}}",
      };
    case "package_reminder":
    case "tour_reminder":
    case "transfer_reminder":
    case "car_reminder":
    case "visa_reminder":
      return {
        subject: k("subject"),
        html: `${heading(k("heading"))}
${lead(k("lead"))}
${card([
  [L("service"), "{{service_name}}"],
  [L("details"), detailField(locale)],
  [L("amount"), "{{currency}} {{amount}}"],
])}
${cta(brand, "cta_url", C("continueRequest"))}`,
        text: k("text"),
      };
    case "hotel_success":
    case "flight_success":
    case "package_success":
    case "tour_success":
    case "transfer_success":
    case "car_success":
    case "visa_success":
      return {
        subject: k("subject"),
        html: `${heading(k("heading"))}
${lead(k("lead"))}
${card([
  [L("requestId"), "{{booking_id}}"],
  [L("service"), "{{service_name}}"],
  [L("details"), detailField(locale)],
  [L("amount"), "{{currency}} {{amount}}"],
])}
${cta(brand, "cta_url", C("viewRequest"))}`,
        text: k("text"),
      };
    default:
      return assertNeverKind(kind);
  }
}

function seedLocale(locale: string): "ar" | "en" | "tr" {
  if (locale === "en" || locale === "tr") return locale;
  return "ar";
}

export async function renderBuiltinHtml(
  kind: EmailTemplateKind,
  brand: EmailBrand,
  locale = "ar"
): Promise<{ html: string; subject: string; text: string }> {
  const resolved = builtinInner(kind, brand, locale, (key) => key);
  const keys = new Set<string>();
  const collect = (value: string) => {
    if (value.startsWith("email.templates.")) keys.add(value);
  };
  collect(resolved.subject);
  collect(resolved.text);
  for (const match of `${resolved.html}`.matchAll(/email\.templates\.[a-zA-Z0-9_.-]+/g)) {
    keys.add(match[0]);
  }
  const map: Record<string, string> = {};
  for (const key of keys) map[key] = await emailT(locale, key);
  const filled = builtinInner(kind, brand, locale, (key) => map[key] || seedValue(key, seedLocale(locale)));
  return {
    html: wrapEmail(brand, filled.html, locale),
    subject: filled.subject,
    text: filled.text,
  };
}

export function wrapCustomHtml(brand: EmailBrand, html: string, locale = "ar"): string {
  return wrapEmail(brand, html, locale);
}

export async function buildMailCheckHtml(brand: EmailBrand, locale = "ar"): Promise<string> {
  const name = brandDisplayName(brand, locale);
  const host = brand.siteHost;
  const headingText = await emailT(locale, "email.templates.common.mailCheck.heading");
  const p1 = (await emailT(locale, "email.templates.common.mailCheck.p1"))
    .replaceAll("{{brand}}", name)
    .replaceAll("{{host}}", host);
  const p2 = await emailT(locale, "email.templates.common.mailCheck.p2");
  const p3 = (await emailT(locale, "email.templates.common.mailCheck.p3"))
    .replaceAll("{{brand}}", name)
    .replaceAll("{{host}}", host);
  return wrapEmail(
    brand,
    `<h1 style="margin:0 0 12px;font-size:20px;">${escHtml(headingText)}</h1>
<p style="margin:0 0 12px;color:#5b4d3e;line-height:1.85;">${escHtml(p1)}</p>
<p style="margin:0 0 12px;color:#5b4d3e;line-height:1.85;">${escHtml(p2)}</p>
<p style="margin:0;color:#5b4d3e;line-height:1.85;">${escHtml(p3)}</p>`,
    locale
  );
}

const BUILTIN_SPECS: Array<{
  slug: string;
  kind: Exclude<EmailTemplateKind, "custom">;
}> = [
  { slug: "offers-reminder", kind: "offers_reminder" },
  { slug: "flight-reminder", kind: "flight_reminder" },
  { slug: "hotel-reminder", kind: "hotel_reminder" },
  { slug: "package-reminder", kind: "package_reminder" },
  { slug: "tour-reminder", kind: "tour_reminder" },
  { slug: "transfer-reminder", kind: "transfer_reminder" },
  { slug: "car-reminder", kind: "car_reminder" },
  { slug: "visa-reminder", kind: "visa_reminder" },
  { slug: "booking-success", kind: "booking_success" },
  { slug: "hotel-success", kind: "hotel_success" },
  { slug: "flight-success", kind: "flight_success" },
  { slug: "package-success", kind: "package_success" },
  { slug: "tour-success", kind: "tour_success" },
  { slug: "transfer-success", kind: "transfer_success" },
  { slug: "car-success", kind: "car_success" },
  { slug: "visa-success", kind: "visa_success" },
  { slug: "booking-invoice", kind: "invoice" },
];

function visualDocumentForKind(kind: EmailTemplateKind, brand: EmailBrand): EmailVisualDocument {
  const doc = defaultVisualDocument(brand);
  const heading = doc.blocks.find((b) => b.type === "heading");
  const para = doc.blocks.find((b) => b.type === "paragraph");
  const button = doc.blocks.find((b) => b.type === "button");
  if (heading) heading.text = kindLabel(kind, "ar");
  if (para) {
    para.text = `مرحباً {{name}}\n{{company}}\nتفاصيل من ${brand.brandNameAr}.`;
  }
  if (button) {
    button.text = "متابعة من حسابك";
    button.hrefKey = kind.includes("flight")
      ? "flights"
      : kind.includes("hotel")
        ? "hotels"
        : kind.includes("success") || kind === "invoice"
          ? "account"
          : "home";
  }
  const table = createBlock("bookingTable", brand);
  table.rows = [
    { label: "رقم الحجز", value: "{{bookingId}}" },
    { label: "المبلغ", value: "{{amount}}" },
  ];
  const footerIndex = doc.blocks.findIndex((b) => b.type === "footer");
  doc.blocks.splice(footerIndex < 0 ? doc.blocks.length : footerIndex, 0, table);
  return doc;
}

export async function buildBuiltinTemplateRecords(): Promise<EmailTemplateRecord[]> {
  const brand = await getEmailBrand();
  const rows: EmailTemplateRecord[] = [];
  for (const spec of BUILTIN_SPECS) {
    const [renderedAr, renderedEn] = await Promise.all([
      renderBuiltinHtml(spec.kind, brand, "ar"),
      renderBuiltinHtml(spec.kind, brand, "en"),
    ]);
    const document = visualDocumentForKind(spec.kind, brand);
    const compiled = compileVisualTemplate(document, brand);
    rows.push({
      id: `local:${spec.slug}`,
      slug: spec.slug,
      kind: spec.kind,
      name: kindLabel(spec.kind, "ar"),
      subject_ar: renderedAr.subject,
      subject_en: renderedEn.subject,
      html_ar: compiled.html || renderedAr.html,
      html_en: compiled.html || renderedEn.html,
      text_ar: compiled.text || renderedAr.text,
      text_en: renderedEn.text,
      is_builtin: true,
      source: "builtin" as const,
      variables: [...TEMPLATE_VARIABLES[spec.kind], "bookingId"],
      document,
    });
  }
  return rows;
}

export async function seedBuiltinTemplates(pb: PocketBase): Promise<void> {
  const brand = await getEmailBrand();
  for (const spec of BUILTIN_SPECS) {
    const [renderedAr, renderedEn] = await Promise.all([
      renderBuiltinHtml(spec.kind, brand, "ar"),
      renderBuiltinHtml(spec.kind, brand, "en"),
    ]);
    const payload = {
      slug: spec.slug,
      kind: spec.kind,
      name: kindLabel(spec.kind, "ar"),
      subject_ar: renderedAr.subject,
      subject_en: renderedEn.subject,
      html_ar: renderedAr.html,
      html_en: renderedEn.html,
      text_ar: renderedAr.text,
      text_en: renderedEn.text,
      is_builtin: true,
      source: "builtin",
      variables: [...TEMPLATE_VARIABLES[spec.kind], "bookingId"],
      document: visualDocumentForKind(spec.kind, brand),
    };
    try {
      const existing = await pb
        .collection("email_templates")
        .getFirstListItem<EmailTemplateRecord>(`slug="${spec.slug}"`);
      const currentVars = Array.isArray(existing.variables)
        ? existing.variables.map(String)
        : [];
      const mergedVars = [...new Set([...currentVars, ...payload.variables])];
      const isBuiltin = existing.is_builtin || existing.source === "builtin";
      if (isBuiltin) {
        await pb.collection("email_templates").update(existing.id, payload);
      } else if (!existing.html_ar) {
        await pb.collection("email_templates").update(existing.id, payload);
      } else if (mergedVars.length !== currentVars.length) {
        await pb.collection("email_templates").update(existing.id, { variables: mergedVars });
      }
    } catch {
      try {
        await pb.collection("email_templates").create(payload);
      } catch {
        try {
          await pb.collection("email_templates").create({ ...payload, kind: "custom" });
        } catch {
          /* local store is the fallback */
        }
      }
    }
  }
}
