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
  const brandAr = esc(tpl.companyNameAr || model.brandNameAr || "لوناليزا للسياحة");
  const brandEn = esc(tpl.companyNameEn || model.brandNameEn || "Lonaliza Tourism");
  const dir = tpl.language === "ar" ? "rtl" : "ltr";
  const align = dir === "rtl" ? "right" : "left";
  const primary = esc(tpl.primaryColor || "#051741");
  const accent = esc(tpl.accentColor || "#10b981");
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
  return `<!DOCTYPE html>
<html lang="${esc(tpl.language)}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)} ${esc(model.id)}</title>
  <style>
    @font-face {
      font-family: "Noto Naskh Arabic";
      src: url("${model.fontDataUri || ""}") format("truetype");
      font-weight: 400 700;
      font-style: normal;
      font-display: block;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+0000-00FF;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #f4efe6; color: #122033; font-family: "Noto Naskh Arabic", Tahoma, sans-serif; direction: ${dir}; text-align: ${align}; }
    body { font-size: 13.5px; line-height: 1.75; }
    .page { padding: 18px 20px 22px; }
    .brand { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 14px; border-bottom: 2px solid ${primary}; }
    .brand img { height: ${logoH}px; width: auto; }
    .brand-name { font-size: 18px; font-weight: 800; color: ${primary}; }
    .brand-en { color: #64748b; font-size: 12px; }
    h1 { margin: 16px 0 6px; font-size: 22px; color: ${primary}; }
    .sub { margin: 0 0 16px; color: #475569; }
    .card { background: #fff; border: 1px solid #e4d8c4; border-radius: 16px; padding: 14px 16px; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid #f1ebe1; }
    .row:last-child { border-bottom: 0; }
    .k { color: #64748b; }
    .v { font-weight: 700; color: #102033; }
    .total { font-size: 16px; color: ${primary}; }
    .badge { display: inline-block; background: ${accent}22; color: ${accent}; font-weight: 800; border-radius: 999px; padding: 4px 12px; margin-bottom: 8px; }
    .hero { height: 160px; border-radius: 16px; overflow: hidden; background: #dbe3ee; margin-bottom: 16px; }
    .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .foot { margin-top: 18px; color: #64748b; font-size: 11px; text-align: center; line-height: 1.8; }
    .meta { font-size: 11px; color: #64748b; }
    .notice { background: #fff7ed; border: 1px solid #fdba74; color: #9a3412; border-radius: 14px; padding: 10px 14px; margin-bottom: 12px; font-weight: 700; }
    .refs { display: flex; gap: 10px; flex-wrap: wrap; margin: 8px 0 4px; }
    .ref-box { flex: 1; min-width: 140px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 8px 10px; }
    .ref-box .k { display: block; font-size: 10px; letter-spacing: .04em; text-transform: uppercase; }
    .ref-box .v { font-size: 16px; letter-spacing: .08em; }
    .seg { padding: 12px 0; border-bottom: 1px solid #f1ebe1; }
    .seg:last-child { border-bottom: 0; }
    .seg-dir { font-size: 11px; font-weight: 800; color: ${primary}; margin-bottom: 6px; }
    .seg-airline { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .airline-logo { width: 36px; height: 36px; object-fit: contain; border-radius: 8px; background: #f8fafc; }
    .seg-times { display: flex; align-items: stretch; justify-content: space-between; gap: 10px; }
    .seg-end { flex: 1; }
    .seg-clock { font-size: 22px; font-weight: 800; color: ${primary}; line-height: 1.1; }
    .seg-code { font-size: 15px; font-weight: 800; letter-spacing: .04em; }
    .seg-name { font-weight: 700; }
    .seg-mid { min-width: 88px; text-align: center; padding-top: 8px; }
    .seg-line { height: 2px; background: linear-gradient(90deg, ${primary}33, ${primary}, ${primary}33); margin: 8px 0 6px; }
    .layover { margin-top: 8px; background: #f8fafc; border-radius: 10px; padding: 6px 10px; font-size: 12px; color: #334155; }
    ${tpl.customCss || ""}
  </style>
</head>
<body>
  <div class="page">
    <div class="brand">
      ${safeLogo ? `<img src="${esc(safeLogo)}" alt="${brandAr}" />` : ""}
      <div>
        <div class="brand-name">${brandAr}</div>
        <div class="brand-en">${brandEn}</div>
      </div>
    </div>
    <h1>${esc(title)}</h1>
    <p class="sub">${esc(headerNote || `${ctx.labels.officialReceipt} — ${model.siteUrl || "lonaliza.com"} · ${formatInvoiceDate(model.issuedAt, tpl.language) || model.issuedAt}`)}</p>
    ${body}
    ${tpl.extraHtml || ""}
    <p class="foot">
      ${footerNote ? `${esc(footerNote)}<br/>` : ""}
      ${brandAr} — ${brandEn}<br/>
      ${esc(model.phone)}${model.email ? ` · ${esc(model.email)}` : ""}<br/>
      ${esc(model.address)}
    </p>
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
    ${ctx.fields.baseFare && model.baseFare != null ? `<div class="row"><span class="k">${esc(ctx.labels.baseFare)}</span><span class="v">${money(model.baseFare, model.currency, lang)}</span></div>` : ""}
    ${ctx.fields.taxes && model.taxes != null ? `<div class="row"><span class="k">${esc(ctx.labels.taxes)}</span><span class="v">${money(model.taxes, model.currency, lang)}</span></div>` : ""}
    ${extraRows || (model.extrasTotal ? `<div class="row"><span class="k">${esc(ctx.labels.extras)}</span><span class="v">${money(model.extrasTotal, model.currency, lang)}</span></div>` : "")}
    <div class="row total"><span class="k">${esc(ctx.labels.total)}</span><span class="v">${money(model.total, model.currency, lang)}</span></div>
  </div>`;
}

function guestsCard(model: ServiceInvoiceModel, ctx: RenderCtx): string {
  if (!ctx.fields.passenger) return "";
  const pax = model.passengers?.length
    ? model.passengers
    : model.guestNames.map((name) => ({ name, document: "" }));
  if (!pax.length) return "";
  const label = guestLabel(model.service, ctx);
  return `<div class="card">${pax
    .map((row) => {
      const value = row.document ? `${row.name} · ${ctx.labels.document} ${row.document}` : row.name;
      return `<div class="row"><span class="k">${esc(label)}</span><span class="v">${esc(value)}</span></div>`;
    })
    .join("")}</div>`;
}

function headerCard(model: ServiceInvoiceModel, ctx: RenderCtx): string {
  const ticket = model.ticketIssued
    ? model.ticketNumber || ""
    : model.ticketNumber && model.ticketNumber !== "PENDING"
      ? model.ticketNumber
      : ctx.labels.ticketPending;
  const refs =
    model.service === "flight"
      ? `<div class="refs">
      ${model.pnr ? `<div class="ref-box"><span class="k">${esc(ctx.labels.bookingReference)}</span><span class="v" dir="ltr">${esc(model.pnr)}</span></div>` : ""}
      <div class="ref-box"><span class="k">${esc(ctx.labels.ticketNumber)}</span><span class="v" dir="ltr">${esc(ticket)}</span></div>
    </div>`
      : "";
  return `<div class="card">
    <span class="badge">${esc(statusLabel(model.status, model.paymentStatus, ctx))}</span>
    <div class="row"><span class="k">${esc(ctx.labels.invoiceNo)}</span><span class="v" dir="ltr">${esc(model.id)}</span></div>
    ${refs}
    ${ctx.fields.payment ? `<div class="row"><span class="k">${esc(ctx.labels.paymentMethod)}</span><span class="v">${esc(paymentLabel(model.paymentMethod, ctx))}</span></div>` : ""}
    ${ctx.fields.customer ? `<div class="row"><span class="k">${esc(ctx.labels.customer)}</span><span class="v">${esc(model.customerName || "—")}</span></div>` : ""}
    ${ctx.fields.customer && model.customerEmail ? `<div class="row"><span class="k">${esc(ctx.labels.email)}</span><span class="v" dir="ltr">${esc(model.customerEmail)}</span></div>` : ""}
    ${ctx.fields.customer && model.customerPhone ? `<div class="row"><span class="k">${esc(ctx.labels.phone)}</span><span class="v" dir="ltr">${esc(model.customerPhone)}</span></div>` : ""}
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
    ${ctx.fields.hotel ? `<div class="row"><span class="k">${esc(ctx.labels.hotel)}</span><span class="v">${esc(model.hotelName || "—")}</span></div>` : ""}
    ${ctx.fields.room && model.roomName ? `<div class="row"><span class="k">${esc(ctx.labels.room)}</span><span class="v">${esc(model.roomName)}</span></div>` : ""}
    ${ctx.fields.dates ? `<div class="row"><span class="k">${esc(ctx.labels.checkIn)}</span><span class="v">${esc(formatInvoiceDate(model.checkIn || "", ctx.template.language) || model.checkIn || "—")}</span></div>` : ""}
    ${ctx.fields.dates ? `<div class="row"><span class="k">${esc(ctx.labels.checkOut)}</span><span class="v">${esc(formatInvoiceDate(model.checkOut || "", ctx.template.language) || model.checkOut || "—")}</span></div>` : ""}
    ${ctx.fields.nights ? `<div class="row"><span class="k">${esc(ctx.labels.nights)}</span><span class="v">${esc(model.nights || 1)}</span></div>` : ""}
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
