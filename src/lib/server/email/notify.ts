import { SITE_PUBLIC_URL } from "@/lib/pocketbase/constants";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { listTemplates } from "@/lib/server/email/campaigns";
import type { EnquiryBookingRecord, HotelBookingRecord } from "@/lib/pocketbase/records";
import {
  getHotelBookingRecord,
  toHotelBookingConfirmView,
} from "@/lib/server/hotel-booking-confirm";
import { buildBookingPdfBuffer } from "@/lib/pdf/booking-pdf";
import { buildInvoiceModelFromConfirmView } from "@/lib/pdf/flight-invoice-model";
import { loadInvoiceBrandExtras, renderInvoiceHtmlForService } from "@/lib/pdf/invoice-assets";
import { getInvoiceTemplate } from "@/lib/server/invoice-templates-store";
import { getEmailBrand } from "@/lib/server/email/brand";
import { renderTemplateMessage, sendMail } from "@/lib/server/email/send";
import { resolveRecipientLocale } from "@/lib/server/email/recipient-locale";
import type { EmailTemplateKind, EmailTemplateRecord, MailAttachment } from "@/lib/server/email/types";
import type { FlightBookingSession } from "@/lib/server/flights-bookings";

const ENQUIRY_SUCCESS_KINDS: Record<string, EmailTemplateKind[]> = {
  hotel: ["hotel_success", "booking_success"],
  flight: ["flight_success", "booking_success"],
  package: ["package_success", "booking_success"],
  tour: ["tour_success", "booking_success"],
  transfer: ["transfer_success", "booking_success"],
  car: ["car_success", "booking_success"],
  visa: ["visa_success", "booking_success"],
};

async function findTemplateByKinds(
  kinds: EmailTemplateKind[]
): Promise<EmailTemplateRecord | null> {
  for (const kind of kinds) {
    const found = await findTemplateByKind(kind);
    if (found) return found;
  }
  return null;
}

function snapshotOf(booking: HotelBookingRecord): Record<string, unknown> {
  return booking.offer_snapshot && typeof booking.offer_snapshot === "object"
    ? { ...booking.offer_snapshot }
    : {};
}

async function findTemplateByKind(
  kind: EmailTemplateRecord["kind"]
): Promise<EmailTemplateRecord | null> {
  try {
    const all = await listTemplates();
    return all.find((row) => row.kind === kind) || null;
  } catch {
    return null;
  }
}

async function markBookingEmail(bookingId: string, flag: string): Promise<void> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  try {
    const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    const snap = snapshotOf(booking);
    if (snap[flag]) return;
    await pb.collection("hotel_bookings").update(booking.id, {
      offer_snapshot: { ...snap, [flag]: new Date().toISOString() },
    });
  } catch {
    /* non-blocking */
  }
}

async function alreadySent(booking: HotelBookingRecord, flag: string): Promise<boolean> {
  return Boolean(snapshotOf(booking)[flag]);
}

export async function notifyHotelBookingPlaced(bookingId: string): Promise<void> {
  const booking = await getHotelBookingRecord(bookingId);
  if (!booking?.customer_email) return;
  if (await alreadySent(booking, "email_booking_sent")) return;
  const template = await findTemplateByKinds(["hotel_success", "booking_success"]);
  if (!template) return;
  const view = toHotelBookingConfirmView(booking);
  const brand = await getEmailBrand();
  const detailAr = `${view.hotel_name} · ${view.check_in} → ${view.check_out}`;
  const locale = await resolveRecipientLocale({
    email: view.customer_email,
    bookingLocale: snapshotOf(booking).locale,
  });
  const rendered = await renderTemplateMessage(template, {
    name: view.customer_name,
    email: view.customer_email,
    booking_id: view.id,
    bookingId: view.id,
    service_name: view.hotel_name,
    detail_ar: detailAr,
    detail_en: detailAr,
    amount: view.price,
    currency: view.currency,
    cta_url: `${SITE_PUBLIC_URL}/hotels/book?booking=${view.id}&confirm=${view.confirm}`,
  }, brand, locale);
  const sent = await sendMail({
    to: view.customer_email,
    toName: view.customer_name,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    listUnsubscribe: false,
    locale,
  });
  if (sent.ok) await markBookingEmail(booking.id, "email_booking_sent");
}

export async function notifyFlightBookingPlaced(
  booking: FlightBookingSession
): Promise<void> {
  const email = String(booking.contact.email || "").trim();
  if (!email) return;
  const template = await findTemplateByKinds(["flight_success", "booking_success"]);
  if (!template) return;
  const first = booking.itinerary?.legs[0];
  const last = booking.itinerary?.legs[booking.itinerary.legs.length - 1];
  const route = [
    first?.origin.displayCode || first?.origin.skyId,
    last?.destination.displayCode || last?.destination.skyId,
  ]
    .filter(Boolean)
    .join(" → ");
  const brand = await getEmailBrand();
  const locale = await resolveRecipientLocale({
    email,
    bookingLocale: (booking as { locale?: string }).locale,
  });
  const rendered = await renderTemplateMessage(template, {
    name: booking.contact.name || email,
    email,
    booking_id: booking.id,
    bookingId: booking.id,
    service_name: route || "Flight",
    detail_ar: `رحلة ${route} — ${booking.passengers.adults} بالغ`,
    detail_en: `Flight ${route} — ${booking.passengers.adults} adult(s)`,
    amount: booking.price.client || booking.quotedClient,
    currency: booking.price.currency || "USD",
    cta_url: `${brand.siteUrl}/flights/booking?id=${encodeURIComponent(booking.id)}`,
  }, brand, locale);
  await sendMail({
    to: email,
    toName: booking.contact.name,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    listUnsubscribe: false,
    locale,
  });
}

export async function notifyIyzicoPaymentSuccess(bookingId: string): Promise<void> {
  const booking = await getHotelBookingRecord(bookingId);
  if (!booking?.customer_email) return;
  if (await alreadySent(booking, "email_payment_sent")) return;

  const view = toHotelBookingConfirmView(booking);
  const brand = await getEmailBrand();
  const invoiceUrl = `${SITE_PUBLIC_URL}/api/hotel-bookings/${view.id}/pdf?confirm=${encodeURIComponent(view.confirm)}`;
  const detailAr = `${view.hotel_name} · ${view.check_in} → ${view.check_out}`;
  const template = await findTemplateByKind("invoice");
  if (!template) return;

  let attachments: MailAttachment[] = [];
  let htmlInvoice = "";
  try {
    const pdf = await buildBookingPdfBuffer(view);
    attachments = [
      {
        filename: `alrayyan-invoice-${view.id}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ];
  } catch {
    try {
      const invoiceTpl = await getInvoiceTemplate(view.service);
      const extras = await loadInvoiceBrandExtras(invoiceTpl);
      htmlInvoice = await renderInvoiceHtmlForService(
        await buildInvoiceModelFromConfirmView(view, extras, invoiceTpl.language),
        invoiceTpl
      );
    } catch {
      htmlInvoice = "";
    }
  }

  const locale = await resolveRecipientLocale({
    email: view.customer_email,
    bookingLocale: snapshotOf(booking).locale,
  });
  const rendered = await renderTemplateMessage(template, {
    name: view.customer_name,
    email: view.customer_email,
    booking_id: view.id,
    bookingId: view.id,
    service_name: view.hotel_name,
    detail_ar: detailAr,
    detail_en: detailAr,
    amount: view.price,
    currency: view.currency,
    invoice_url: invoiceUrl,
    payment_ref: String(booking.iyzico_payment_id || "iyzico"),
    cta_url: invoiceUrl,
  }, brand, locale);

  const sent = await sendMail({
    to: view.customer_email,
    toName: view.customer_name,
    subject: rendered.subject,
    html: htmlInvoice || rendered.html,
    text: rendered.text,
    attachments,
    listUnsubscribe: false,
    locale,
  });
  if (sent.ok) await markBookingEmail(booking.id, "email_payment_sent");
}

function enquiryMeta(row: EnquiryBookingRecord): Record<string, unknown> {
  return row.metadata && typeof row.metadata === "object" ? { ...row.metadata } : {};
}

export async function notifyEnquiryPlaced(booking: EnquiryBookingRecord): Promise<void> {
  const email = String(booking.customer_email || "").trim();
  if (!email) return;
  const meta = enquiryMeta(booking);
  if (meta.email_booking_sent) return;

  const kinds = ENQUIRY_SUCCESS_KINDS[booking.type] || ["booking_success"];
  const template = await findTemplateByKinds(kinds);
  if (!template) return;

  const brand = await getEmailBrand();
  const serviceName = String(booking.service_name || booking.destination || booking.type);
  const detailAr = [booking.destination, booking.message].filter(Boolean).join(" — ").slice(0, 400);
  const locale = await resolveRecipientLocale({
    email,
    bookingLocale: meta.locale,
  });
  const rendered = await renderTemplateMessage(template, {
    name: booking.customer_name || email,
    email,
    booking_id: booking.id,
    bookingId: booking.id,
    service_name: serviceName,
    detail_ar: detailAr || serviceName,
    detail_en: detailAr || serviceName,
    amount: String(meta.amount || meta.price || ""),
    currency: String(meta.currency || ""),
    cta_url: brand.siteUrl,
  }, brand, locale);
  const sent = await sendMail({
    to: email,
    toName: booking.customer_name,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    listUnsubscribe: false,
    locale,
  });
  if (!sent.ok) return;
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  try {
    await pb.collection("enquiry_bookings").update(booking.id, {
      metadata: { ...meta, email_booking_sent: new Date().toISOString() },
    });
  } catch {
    /* non-blocking */
  }
}
