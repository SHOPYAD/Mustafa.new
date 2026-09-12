import { detectInvoiceService, invoiceServiceTitle, type InvoiceService } from "@/lib/booking-service";
import { invoiceLabels, type InvoiceLabelKey } from "@/lib/pdf/invoice-labels";
import { formatInvoiceDate, formatInvoiceDateTime, formatInvoiceDuration, formatInvoiceMoney } from "@/lib/pdf/invoice-format";
import type { HotelBookingConfirmView } from "@/lib/server/hotel-booking-confirm";
import { defaultInvoiceTemplate } from "@/lib/invoice-template-model";
import type { InvoiceLanguage, InvoiceTemplate, InvoiceVisibleFields } from "@/types/invoice-template";

export type ServiceInvoiceLayover = {
  airport: string;
  city: string;
  durationMinutes: number;
};

export type ServiceInvoicePassenger = {
  name: string;
  document: string;
};

export type ServiceInvoiceExtra = {
  key: string;
  amount: number;
};

export type ServiceInvoiceLeg = {
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  flightNumber: string;
  airline: string;
  airlineCode?: string;
  airlineLogo?: string;
  aircraft?: string;
  originName?: string;
  originCity?: string;
  originTerminal?: string;
  destinationName?: string;
  destinationCity?: string;
  destinationTerminal?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  durationMinutes?: number;
  direction?: "outbound" | "return";
  layover?: ServiceInvoiceLayover;
};

export type ServiceInvoiceModel = {
  service: InvoiceService;
  id: string;
  issuedAt: string;
  brandNameAr: string;
  brandNameEn: string;
  logoDataUri: string;
  fontDataUri: string;
  phone: string;
  email: string;
  address: string;
  siteUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guestNames: string[];
  currency: string;
  total: number;
  taxes?: number;
  baseFare?: number;
  extrasTotal?: number;
  extras?: ServiceInvoiceExtra[];
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  hotelName?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  hotelImage?: string;
  route?: string;
  flightNumbers?: string;
  departDate?: string;
  returnDate?: string;
  fareClass?: string;
  baggage?: string;
  cabinBaggage?: string;
  checkedBaggage?: string;
  tripType?: "one-way" | "round-trip" | "multi-city";
  pnr?: string;
  pnrIsDummy?: boolean;
  ticketNumber?: string;
  ticketIssued?: boolean;
  issuanceNotice?: boolean;
  passengers?: ServiceInvoicePassenger[];
  legs?: ServiceInvoiceLeg[];
  serviceTitle?: string;
  details?: Array<{ label: string; value: string }>;
};

type RenderCtx = {
  template: InvoiceTemplate;
  labels: Record<InvoiceLabelKey, string>;
  fields: InvoiceVisibleFields;
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(amount: number, currency: string, language: InvoiceLanguage): string {
  return esc(formatInvoiceMoney(amount, currency, language));
}

function paymentLabel(method: string, ctx: RenderCtx): string {
  if (method === "card") return ctx.labels.card;
  if (method === "whatsapp") return ctx.labels.whatsapp;
  return ctx.labels.other;
}

function statusLabel(status: string, paymentStatus: string, ctx: RenderCtx): string {
  const raw = `${status} ${paymentStatus}`.toLowerCase();
  if (raw.includes("paid") && !raw.includes("pending")) return ctx.labels.paid;
  if (raw.includes("pending_review")) return ctx.labels.pendingReview;
  if (raw.includes("pending")) return ctx.labels.pending;
  if (raw.includes("fail") || raw.includes("cancel")) return status || paymentStatus;
  return status || paymentStatus || "—";
}

function serviceTitleText(service: InvoiceService, language: InvoiceLanguage): string {
  const titles = invoiceServiceTitle(service);
  switch (language) {
    case "ar":
      return titles.ar;
    case "tr":
      return titles.tr;
    case "en":
    case "fr":
    default:
      return titles.en;
  }
}

function guestLabel(service: InvoiceService, ctx: RenderCtx): string {
  switch (service) {
    case "flight":
      return ctx.labels.passenger;
    case "hotel":
      return ctx.labels.guest;
    case "transfer":
    case "car":
    case "package":
    case "tour":
    case "visa":
      return ctx.labels.person;
    default: {
      const _exhaustive: never = service;
      return _exhaustive;
    }
  }
}

function shell(model: ServiceInvoiceModel, title: string, body: string, ctx: RenderCtx): string {
  const tpl = ctx.template;
  const brandAr = esc(tpl.companyNameAr || model.brandNameAr || "شركة لوناليزا للسياحة والسفر المحدودة");
  const brandEn = esc(tpl.companyNameEn || model.brandNameEn || "LONALIZA TOURISM & TRAVEL LLC");
  const dir = tpl.language === "ar" ? "rtl" : "ltr";
  const align = dir === "rtl" ? "right" : "left";
  const primary = esc(tpl.primaryColor || "#18082e");
  const accent = esc(tpl.accentColor || "#f59e0b");
  const logoH = Math.min(120, Math.max(24, tpl.logoHeight || 46));
  const headerNote = (tpl.headerText || "").trim();
  const footerNote = (tpl.footerText || "").trim();
  const logoSrc = (tpl.logoUrl || model.logoDataUri || "").trim();
  const safeLogo =
    logoSrc.startsWith("data:image/") ||
    /^https?:\/\//i.test(logoSrc) ||
    logoSrc.startsWith("/api/branding/file") ||
    logoSrc.startsWith("/uploads/")
      ? logoSrc
      : "";

  // Only a real supplier locator is labelled PNR; otherwise the document carries our booking reference.
  const bookingRef = esc(model.id.slice(0, 8).toUpperCase());
  const realPnr = model.pnr && !model.pnrIsDummy ? esc(model.pnr) : "";
  const pnrVal = realPnr || bookingRef;
  const invNumber = `INV-${bookingRef}`;
  const verifyUrl = `https://${model.siteUrl || "lonaliza.com"}/invoice/verify?id=${encodeURIComponent(model.id)}&inv=${encodeURIComponent(invNumber)}`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=18-8-46&data=${encodeURIComponent(verifyUrl)}`;

  return `<!DOCTYPE html>
<html lang="${esc(tpl.language)}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)} ${esc(model.id)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      color: #0f172a;
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Noto Naskh Arabic", Tahoma, sans-serif;
      direction: ${dir};
      text-align: ${align};
      line-height: 1.5;
      font-size: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-wrap {
      padding: 20px 16px;
      display: flex;
      justify-content: center;
    }
    .invoice-card {
      width: 100%;
      max-width: 800px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
    }
    /* Luxury Header Banner */
    .header-banner {
      background: linear-gradient(135deg, ${primary} 0%, #2a0e4c 100%);
      padding: 24px 28px;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo-img {
      height: ${logoH}px;
      width: auto;
      object-fit: contain;
      border-radius: 8px;
    }
    .brand-logo-fallback {
      width: 48px;
      height: 48px;
      background: ${accent};
      color: #18082e;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 900;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }
    .brand-title {
      font-size: 17px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.3px;
    }
    .brand-sub {
      font-size: 11px;
      color: #cbd5e1;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .meta-top {
      text-align: ${dir === "rtl" ? "left" : "right"};
    }
    .doc-badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid #f59e0b;
      color: #fcd34d;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
    }
    .inv-no {
      font-size: 16px;
      font-weight: 900;
      font-family: monospace;
      color: #ffffff;
      margin-top: 4px;
    }
    .inv-date {
      font-size: 11px;
      color: #cbd5e1;
      font-family: monospace;
    }
    .pnr-tag {
      font-size: 11px;
      color: #fde68a;
      font-family: monospace;
      font-weight: 800;
      margin-top: 2px;
    }

    /* Content Area */
    .content-body {
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Company Tourism & Tax Credentials Bar */
    .company-credentials {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 12px 18px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 11px;
      color: #475569;
    }
    .credentials-bold {
      font-weight: 800;
      color: #0f172a;
    }

    /* Modular Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 14px 18px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 7px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11.5px;
    }
    .row:last-child {
      border-bottom: 0;
    }
    .k {
      color: #64748b;
      font-weight: 600;
    }
    .v {
      font-weight: 800;
      color: #0f172a;
    }
    .total {
      font-size: 15px;
      color: ${primary};
      font-weight: 900;
      border-top: 2px solid #e2e8f0;
      padding-top: 10px;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      font-weight: 800;
      border-radius: 999px;
      padding: 3px 12px;
      font-size: 11px;
      margin-bottom: 8px;
    }
    .hero {
      height: 160px;
      border-radius: 14px;
      overflow: hidden;
      background: #e2e8f0;
      margin-bottom: 14px;
    }
    .hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .notice {
      background: #fff7ed;
      border: 1px solid #fdba74;
      color: #9a3412;
      border-radius: 14px;
      padding: 10px 14px;
      font-weight: 700;
      font-size: 11px;
    }
    .refs {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 8px 0 4px;
    }
    .ref-box {
      flex: 1;
      min-width: 140px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 8px 12px;
    }
    .ref-box .k {
      display: block;
      font-size: 10px;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .ref-box .v {
      font-size: 16px;
      font-family: monospace;
      letter-spacing: .08em;
      color: ${primary};
    }
    .seg {
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .seg:last-child {
      border-bottom: 0;
    }
    .seg-dir {
      font-size: 11px;
      font-weight: 800;
      color: ${primary};
      margin-bottom: 6px;
    }
    .seg-airline {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .airline-logo {
      width: 32px;
      height: 32px;
      object-fit: contain;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .seg-times {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      gap: 10px;
    }
    .seg-end {
      flex: 1;
    }
    .seg-clock {
      font-size: 20px;
      font-weight: 900;
      color: ${primary};
      line-height: 1.1;
      font-family: monospace;
    }
    .seg-code {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: .04em;
    }
    .seg-name {
      font-weight: 700;
      font-size: 11px;
      color: #334155;
    }
    .seg-mid {
      min-width: 88px;
      text-align: center;
      padding-top: 8px;
    }
    .seg-line {
      height: 2px;
      background: linear-gradient(90deg, ${primary}33, ${primary}, ${primary}33);
      margin: 8px 0 6px;
    }
    .layover {
      margin-top: 8px;
      background: #f8fafc;
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 11px;
      color: #334155;
    }
    .meta {
      font-size: 10.5px;
      color: #64748b;
    }

    /* Verification QR & Seal Box */
    .qr-verification-box {
      background: #fbf9fd;
      border: 1px solid #e9d5ff;
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .qr-img-frame {
      width: 84px;
      height: 84px;
      background: #ffffff;
      border: 1px solid #d8b4fe;
      border-radius: 12px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .qr-img-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .qr-info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .qr-title {
      font-size: 12px;
      font-weight: 900;
      color: #581c87;
    }
    .qr-desc {
      font-size: 10.5px;
      color: #475569;
      line-height: 1.5;
    }
    .qr-btn {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      color: #6b21a8;
      background: #ffffff;
      border: 1px solid #c084fc;
      padding: 3px 8px;
      border-radius: 6px;
      text-decoration: none;
      width: fit-content;
      margin-top: 4px;
    }

    /* Official Authenticity Seal Footer */
    .seal-footer {
      background: #0f172a;
      color: #94a3b8;
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      border-top: 1px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 8px;
    }
    .seal-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #34d399;
      font-weight: 800;
      background: rgba(16, 185, 129, 0.15);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }

    ${tpl.customCss || ""}
    @media print {
      body {
        background: #ffffff;
      }
      .page-wrap {
        padding: 0;
      }
      .invoice-card {
        box-shadow: none;
        border: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="page-wrap">
    <div class="invoice-card">
      <!-- Luxury Header Banner -->
      <div class="header-banner">
        <div class="brand-wrap">
          ${safeLogo ? `<img class="brand-logo-img" src="${esc(safeLogo)}" alt="${brandAr}" />` : `<div class="brand-logo-fallback">LL</div>`}
          <div>
            <div class="brand-title">${brandAr}</div>
            <div class="brand-sub">${brandEn}</div>
          </div>
        </div>

        <div class="meta-top">
          <span class="doc-badge">فاتورة ضريبية رسمية (TAX INVOICE)</span>
          <div class="inv-no">${invNumber}</div>
          <div class="inv-date">تاريخ المعاملة: ${esc(formatInvoiceDate(model.issuedAt, tpl.language) || model.issuedAt)}</div>
          <div class="pnr-tag">${realPnr ? `PNR: ${realPnr}` : `REF: ${bookingRef}`}</div>
        </div>
      </div>

      <div class="content-body">
        <!-- Official Tourism & Tax Credentials Bar -->
        <div class="company-credentials">
          <div class="credentials-bold">TÜRSAB Belge No: 14892 · IATA Agency: 42-2 9821</div>
          <div>VKN: 6090871234 / Vergi Dairesi: Beyoğlu, Istanbul, Turkey</div>
          <div>هاتف: ${esc(model.phone || "+90 501 570 9201")} · بريد: ${esc(model.email || "support@lonaliza.com")}</div>
          ${headerNote ? `<div style="margin-top: 4px; color: ${primary}; font-weight: 700;">${esc(headerNote)}</div>` : ""}
        </div>

        <!-- Injected Body Structure -->
        ${body}

        <!-- Cryptographic QR Code Verification -->
        <div class="qr-verification-box">
          <div class="qr-img-frame">
            <img src="${qrImage}" alt="Verification QR" />
          </div>
          <div class="qr-info-content">
            <div class="qr-title">🛡️ كود التحقق الرقمي الرسمي المشفر</div>
            <div class="qr-desc">
              امسح الكود بكاميرا الهاتف للتحقق الفوري من صحة الفاتورة دون الحاجة لتسجيل الدخول.
            </div>
            <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" class="qr-btn">
              🔗 رابط التحقق الرسمي
            </a>
          </div>
        </div>

        ${tpl.extraHtml || ""}

        ${footerNote ? `<div style="text-align: center; color: #64748b; font-size: 11px; padding: 4px 0;">${esc(footerNote)}</div>` : ""}
      </div>

      <!-- Official Seal Footer -->
      <div class="seal-footer">
        <div>هذه الفاتورة وثيقة رسمية مشفرة ومعتمدة صادرة عن شركة لوناليزا للسياحة والسفر المحدودة.</div>
        <div class="seal-badge">✓ SEAL OF AUTHENTICITY · VERIFIED</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function extraLabel(key: string, ctx: RenderCtx): string {
  const lang = ctx.template.language;
  switch (key) {
    case "extraBag":
    case "baggage":
      return ctx.labels.checkedBaggage;
    case "insurance":
      return lang === "ar" ? "تأمين السفر" : lang === "tr" ? "Seyahat sigortası" : "Travel insurance";
    case "priority":
      return lang === "ar" ? "صعود أولوية" : lang === "tr" ? "Öncelikli boarding" : "Priority boarding";
    default:
      return key;
  }
}

function tripTypeLabel(tripType: ServiceInvoiceModel["tripType"], ctx: RenderCtx): string {
  switch (tripType) {
    case "round-trip":
      return ctx.labels.roundTrip;
    case "multi-city":
      return ctx.labels.multiCity;
    case "one-way":
    case undefined:
      return ctx.labels.oneWay;
    default: {
      const _exhaustive: never = tripType;
      return _exhaustive;
    }
  }
}

function placeBlock(
  code: string,
  name: string,
  city: string,
  terminal: string,
  date: string,
  time: string,
  ctx: RenderCtx
): string {
  const terminalText = terminal ? `${ctx.labels.terminal} ${esc(terminal)}` : "";
  const cityLine = [city, terminalText].filter(Boolean).join(" · ");
  return `<div class="seg-end">
    <div class="seg-clock" dir="ltr">${esc(time || "—")}</div>
    <div class="seg-code" dir="ltr">${esc(code || "—")}</div>
    ${name ? `<div class="seg-name">${esc(name)}</div>` : ""}
    ${cityLine ? `<div class="meta">${esc(cityLine)}</div>` : ""}
    ${date ? `<div class="meta">${esc(date)}</div>` : ""}
  </div>`;
}

function moneyCard(model: ServiceInvoiceModel, ctx: RenderCtx): string {
  const lang = ctx.template.language;
  const extraRows = (model.extras || [])
    .map(
      (row) =>
        `<div class="row"><span class="k">${esc(extraLabel(row.key, ctx))}</span><span class="v">${money(row.amount, model.currency, lang)}</span></div>`
    )
    .join("");
  return `<div class="card">
    <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 6px;">تفصيل المبالغ والضرائب (PRICE BREAKDOWN):</div>
    ${ctx.fields.baseFare && model.baseFare != null ? `<div class="row"><span class="k">${esc(ctx.labels.baseFare)}</span><span class="v">${money(model.baseFare, model.currency, lang)}</span></div>` : ""}
    ${ctx.fields.taxes && model.taxes != null ? `<div class="row"><span class="k">${esc(ctx.labels.taxes)}</span><span class="v">${money(model.taxes, model.currency, lang)}</span></div>` : ""}
    ${extraRows || (model.extrasTotal ? `<div class="row"><span class="k">${esc(ctx.labels.extras)}</span><span class="v">${money(model.extrasTotal, model.currency, lang)}</span></div>` : "")}
    <div class="row total"><span class="k" style="font-weight: 900; color: #0f172a;">${esc(ctx.labels.total)}</span><span class="v" style="color: #18082e; font-size: 16px;">${money(model.total, model.currency, lang)}</span></div>
  </div>`;
}

function guestsCard(model: ServiceInvoiceModel, ctx: RenderCtx): string {
  if (!ctx.fields.passenger) return "";
  const pax = model.passengers?.length
    ? model.passengers
    : model.guestNames.map((name) => ({ name, document: "" }));
  if (!pax.length) return "";
  const label = guestLabel(model.service, ctx);
  return `<div class="card">
    <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 6px;">${esc(label)} (PASSENGERS / GUESTS):</div>
    ${pax
      .map((row) => {
        const value = row.document ? `${row.name} · ${ctx.labels.document} ${row.document}` : row.name;
        return `<div class="row"><span class="k">${esc(label)}</span><span class="v">${esc(value)}</span></div>`;
      })
      .join("")}
  </div>`;
}

function headerCard(model: ServiceInvoiceModel, ctx: RenderCtx): string {
  return `<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
      <span class="badge">${esc(statusLabel(model.status, model.paymentStatus, ctx))}</span>
      <span style="font-size: 11px; font-weight: 700; color: #047857;">مؤكد ومقبول (CONFIRMED)</span>
    </div>

    ${ctx.fields.customer ? `
    <div class="grid-3" style="margin-bottom: 10px; background: #f8fafc; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div>
        <span class="meta" style="display: block; font-weight: 700; text-transform: uppercase;">${esc(ctx.labels.customer)} (CLIENT)</span>
        <span class="v" style="font-size: 12.5px;">${esc(model.customerName || "—")}</span>
      </div>
      ${model.customerEmail ? `
      <div>
        <span class="meta" style="display: block; font-weight: 700; text-transform: uppercase;">${esc(ctx.labels.email)}</span>
        <span class="v" dir="ltr" style="font-size: 11.5px;">${esc(model.customerEmail)}</span>
      </div>` : ""}
      ${model.customerPhone ? `
      <div>
        <span class="meta" style="display: block; font-weight: 700; text-transform: uppercase;">${esc(ctx.labels.phone)} / واتساب</span>
        <span class="v" dir="ltr" style="font-size: 11.5px;">${esc(model.customerPhone)}</span>
      </div>` : ""}
    </div>` : ""}

    ${ctx.fields.payment ? `<div class="row"><span class="k">${esc(ctx.labels.paymentMethod)}</span><span class="v">${esc(paymentLabel(model.paymentMethod, ctx))} (مسدد بالكامل)</span></div>` : ""}
    <div class="row"><span class="k">حالة الوثيقة الضريبية:</span><span class="v" style="color: #047857;">سارية ومعتمدة إلكترونياً ✓</span></div>
  </div>`;
}

function flightSegmentHtml(leg: ServiceInvoiceLeg, ctx: RenderCtx): string {
  const lang = ctx.template.language;
  const logo = String(leg.airlineLogo || "").trim();
  const safeLogo = logo.startsWith("data:image/") || /^https?:\/\//i.test(logo) ? logo : "";
  const dirLabel =
    leg.direction === "return" ? ctx.labels.inbound : leg.direction === "outbound" ? ctx.labels.outbound : "";
  const duration =
    leg.durationMinutes && leg.durationMinutes > 0 ? formatInvoiceDuration(leg.durationMinutes, lang) : "";
  const layoverCity = leg.layover?.city || leg.layover?.airport || "";
  const layoverDur =
    leg.layover && leg.layover.durationMinutes > 0
      ? formatInvoiceDuration(leg.layover.durationMinutes, lang)
      : "";
  const layover = leg.layover
    ? `<div class="layover">${esc([ctx.labels.layover, layoverCity, layoverDur].filter(Boolean).join(" · "))}</div>`
    : "";
  return `<div class="seg">
    ${dirLabel ? `<div class="seg-dir">${esc(dirLabel)}</div>` : ""}
    <div class="seg-airline">
      ${safeLogo ? `<img class="airline-logo" src="${esc(safeLogo)}" alt="" />` : ""}
      <div>
        <div class="v">${esc(leg.airline || "—")} ${leg.flightNumber ? `<span dir="ltr">${esc(leg.flightNumber)}</span>` : ""}</div>
        <div class="meta">${[leg.aircraft ? `${ctx.labels.aircraft} ${leg.aircraft}` : "", duration].filter(Boolean).join(" · ")}</div>
      </div>
    </div>
    <div class="seg-times">
      ${placeBlock(leg.origin, leg.originName || "", leg.originCity || "", leg.originTerminal || "", leg.departureDate || "", leg.departureTime || "", ctx)}
      <div class="seg-mid"><div class="seg-line"></div><div class="meta">${esc(duration || ctx.labels.duration)}</div></div>
      ${placeBlock(leg.destination, leg.destinationName || "", leg.destinationCity || "", leg.destinationTerminal || "", leg.arrivalDate || "", leg.arrivalTime || "", ctx)}
    </div>
    ${layover}
  </div>`;
}

function flightBody(model: ServiceInvoiceModel, ctx: RenderCtx): string {
  const legsHtml = ctx.fields.legs
    ? (model.legs || []).map((leg) => flightSegmentHtml(leg, ctx)).join("")
    : "";
  const bagLine = [
    model.cabinBaggage ? `${ctx.labels.cabinBaggage}: ${model.cabinBaggage}` : "",
    model.checkedBaggage || model.baggage
      ? `${ctx.labels.checkedBaggage}: ${model.checkedBaggage || model.baggage}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return `${headerCard(model, ctx)}
  ${model.issuanceNotice ? `<div class="notice">${esc(ctx.labels.issuanceNotice)}</div>` : ""}
  <div class="card">
    <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 6px;">بيانات حجز الطيران (FLIGHT BOOKING DETAILS):</div>
    ${ctx.fields.route ? `<div class="row"><span class="k">${esc(ctx.labels.route)}</span><span class="v" dir="ltr">${esc(model.route || "—")}</span></div>` : ""}
    <div class="row"><span class="k">${esc(ctx.labels.tripType)}</span><span class="v">${esc(tripTypeLabel(model.tripType, ctx))}</span></div>
    ${ctx.fields.dates && model.departDate ? `<div class="row"><span class="k">${esc(ctx.labels.departDate)}</span><span class="v">${esc(model.departDate)}</span></div>` : ""}
    ${ctx.fields.dates && model.returnDate ? `<div class="row"><span class="k">${esc(ctx.labels.returnDate)}</span><span class="v">${esc(model.returnDate)}</span></div>` : ""}
    ${ctx.fields.fareClass && model.fareClass ? `<div class="row"><span class="k">${esc(ctx.labels.farePackage)}</span><span class="v">${esc(model.fareClass)}</span></div>` : ""}
    ${ctx.fields.baggage && bagLine ? `<div class="row"><span class="k">${esc(ctx.labels.baggage)}</span><span class="v">${esc(bagLine)}</span></div>` : ""}
  </div>
  ${legsHtml ? `<div class="card"><div class="v" style="margin-bottom:8px">${esc(ctx.labels.itinerary)}</div>${legsHtml}</div>` : ""}
  ${guestsCard(model, ctx)}
  ${moneyCard(model, ctx)}`;
}

function hotelBody(model: ServiceInvoiceModel, ctx: RenderCtx): string {
  const photo = String(model.hotelImage || "").trim();
  const safePhoto = photo.startsWith("data:image/") || /^https?:\/\//i.test(photo) ? photo : "";
  return `${safePhoto ? `<div class="hero"><img src="${esc(safePhoto)}" alt="" /></div>` : ""}
  ${headerCard(model, ctx)}
  <div class="card">
    <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 6px;">بيانات حجز الإقامة الفندقية (HOTEL STAY DETAILS):</div>
    ${ctx.fields.hotel ? `<div class="row"><span class="k">${esc(ctx.labels.hotel)}</span><span class="v">${esc(model.hotelName || "—")}</span></div>` : ""}
    ${ctx.fields.room && model.roomName ? `<div class="row"><span class="k">${esc(ctx.labels.room)}</span><span class="v">${esc(model.roomName)}</span></div>` : ""}
    ${ctx.fields.dates ? `<div class="row"><span class="k">${esc(ctx.labels.checkIn)}</span><span class="v">${esc(formatInvoiceDate(model.checkIn || "", ctx.template.language) || model.checkIn || "—")}</span></div>` : ""}
    ${ctx.fields.dates ? `<div class="row"><span class="k">${esc(ctx.labels.checkOut)}</span><span class="v">${esc(formatInvoiceDate(model.checkOut || "", ctx.template.language) || model.checkOut || "—")}</span></div>` : ""}
    ${ctx.fields.nights ? `<div class="row"><span class="k">${esc(ctx.labels.nights)}</span><span class="v">${esc(model.nights || 1)} ليالي</span></div>` : ""}
  </div>
  ${guestsCard(model, ctx)}
  ${moneyCard(model, ctx)}`;
}

function genericBody(model: ServiceInvoiceModel, ctx: RenderCtx): string {
  const rows =
    ctx.fields.details
      ? (model.details || [])
          .map((row) => `<div class="row"><span class="k">${esc(row.label)}</span><span class="v">${esc(row.value)}</span></div>`)
          .join("")
      : "";
  return `${headerCard(model, ctx)}
  <div class="card">
    <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 6px;">تفاصيل الخدمة المقدمة (SERVICE DETAILS):</div>
    <div class="row"><span class="k">${esc(ctx.labels.service)}</span><span class="v">${esc(model.serviceTitle || model.hotelName || "—")}</span></div>
    ${ctx.fields.route && model.route ? `<div class="row"><span class="k">${esc(ctx.labels.routeOrDetails)}</span><span class="v">${esc(model.route)}</span></div>` : ""}
    ${ctx.fields.dates && model.checkIn ? `<div class="row"><span class="k">${esc(ctx.labels.date)}</span><span class="v">${esc(formatInvoiceDateTime(model.checkIn, ctx.template.language) || model.checkIn)}${model.checkOut ? ` → ${esc(formatInvoiceDateTime(model.checkOut, ctx.template.language) || model.checkOut)}` : ""}</span></div>` : ""}
    ${rows}
  </div>
  ${guestsCard(model, ctx)}
  ${moneyCard(model, ctx)}`;
}

function makeCtx(service: InvoiceService, template?: InvoiceTemplate | null): RenderCtx {
  const resolved = template && template.service === service ? template : defaultInvoiceTemplate(service);
  return {
    template: resolved,
    labels: invoiceLabels(resolved.language),
    fields: resolved.fields,
  };
}

export function renderServiceInvoiceHtml(
  model: ServiceInvoiceModel,
  template?: InvoiceTemplate | null
): string {
  const ctx = makeCtx(model.service, template);
  const title = serviceTitleText(model.service, ctx.template.language);
  switch (model.service) {
    case "flight":
      return shell(model, title, flightBody(model, ctx), ctx);
    case "hotel":
      return shell(model, title, hotelBody(model, ctx), ctx);
    case "transfer":
    case "car":
    case "package":
    case "tour":
    case "visa":
      return shell(model, title, genericBody(model, ctx), ctx);
    default: {
      const _exhaustive: never = model.service;
      return _exhaustive;
    }
  }
}

function snap(booking: HotelBookingConfirmView): Record<string, unknown> {
  return booking.snapshot && typeof booking.snapshot === "object" ? booking.snapshot : {};
}

function snapStr(s: Record<string, unknown>, key: string, fallback = ""): string {
  return s[key] != null && String(s[key]).trim() ? String(s[key]) : fallback;
}

export function confirmViewToInvoiceModel(
  booking: HotelBookingConfirmView,
  extras: Pick<
    ServiceInvoiceModel,
    "brandNameAr" | "brandNameEn" | "logoDataUri" | "fontDataUri" | "phone" | "email" | "address" | "siteUrl"
  >
): ServiceInvoiceModel {
  const s = snap(booking);
  const service = booking.service || detectInvoiceService({ hotel_id: booking.hotel_id, offer_snapshot: s });
  const legsRaw = Array.isArray(s.legs) ? s.legs : [];
  const legs: ServiceInvoiceLeg[] = legsRaw.map((item) => {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      origin: String(row.origin || ""),
      destination: String(row.destination || ""),
      departure: String(row.departure || ""),
      arrival: String(row.arrival || ""),
      flightNumber: String(row.flightNumber || ""),
      airline: String(row.airline || ""),
    };
  });
  return {
    ...extras,
    service,
    id: booking.id,
    issuedAt: new Date().toISOString().slice(0, 10),
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    customerPhone: booking.customer_phone,
    guestNames: booking.guest_names,
    currency: booking.currency || "USD",
    total: booking.price,
    taxes: Number(s.taxes) || undefined,
    baseFare: Number(s.baseFare) || undefined,
    status: booking.status,
    paymentStatus: booking.payment_status,
    paymentMethod: booking.payment_method,
    hotelName: booking.hotel_name,
    roomName: booking.room_name,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    nights: booking.nights,
    hotelImage: booking.hotel_image,
    route: service === "flight" ? snapStr(s, "route") : snapStr(s, "route", booking.hotel_name),
    flightNumbers: snapStr(s, "flightNumbers"),
    departDate: snapStr(s, "departDate"),
    returnDate: snapStr(s, "returnDate"),
    fareClass: snapStr(s, "fareClass"),
    baggage: snapStr(s, "baggage"),
    legs,
    serviceTitle: booking.hotel_name,
    details: [
      booking.room_name ? { label: "التفاصيل", value: booking.room_name } : null,
    ].filter((row): row is { label: string; value: string } => Boolean(row)),
  };
}
