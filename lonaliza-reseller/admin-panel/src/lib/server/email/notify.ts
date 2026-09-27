import { SITE_PUBLIC_URL } from "@/lib/pocketbase/constants";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { listTemplates } from "@/lib/server/email/campaigns";
import type { EnquiryBookingRecord, HotelBookingRecord } from "@/lib/pocketbase/records";
import {
  getHotelBookingRecord,
  toHotelBookingConfirmView,
} from "@/lib/server/hotel-booking-confirm";
import { detectInvoiceService } from "@/lib/booking-service";
import { buildBookingMailPdfs } from "@/lib/pdf/booking-documents";
import { getEmailBrand } from "@/lib/server/email/brand";
import {
  buildBookingEmailVars,
  bookingResumeUrl,
  flightSessionDetail,
} from "@/lib/server/email/booking-message";
import { pendingTemplateKinds, paymentEmailGate, successTemplateKinds } from "@/lib/server/email/payment-gate";
import { renderTemplateMessage, sendMail } from "@/lib/server/email/send";
import { resolveRecipientLocale } from "@/lib/server/email/recipient-locale";
import { wrapCustomHtml as wrapEmailHtml } from "@/lib/server/email/templates";
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

async function attachOfficialEArchive(bookingId: string, attachments: MailAttachment[]): Promise<void> {
  try {
    const { getParasutInvoicePdfBuffer } = await import("@/lib/server/parasut/parasut-invoices-store");
    const eFile = await getParasutInvoicePdfBuffer(bookingId);
    if (eFile?.buffer) {
      attachments.push({
        filename: eFile.filename || `TC-GIB-E-Arsiv-${bookingId}.pdf`,
        content: eFile.buffer,
        contentType: "application/pdf",
      });
    }
  } catch {
    /* non-fatal */
  }
}

/**
 * Checkout-create / unpaid hold. Always a complete-booking reminder — never hotel/flight "ناجح".
 */
export async function notifyBookingAwaitingPayment(bookingId: string): Promise<void> {
  const booking = await getHotelBookingRecord(bookingId);
  if (!booking?.customer_email) return;
  if (paymentEmailGate(booking) === "paid") return;
  if (await alreadySent(booking, "email_pending_sent")) return;

  const view = toHotelBookingConfirmView(booking);
  const template = await findTemplateByKinds(pendingTemplateKinds(view.service));
  if (!template) return;

  const brand = await getEmailBrand();
  const locale = await resolveRecipientLocale({
    email: view.customer_email,
    bookingLocale: snapshotOf(booking).locale,
  });
  const rendered = await renderTemplateMessage(
    template,
    buildBookingEmailVars(view, locale),
    brand,
    locale
  );
  const sent = await sendMail({
    to: view.customer_email,
    toName: view.customer_name,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    listUnsubscribe: false,
    locale,
  });
  if (sent.ok) await markBookingEmail(booking.id, "email_pending_sent");
}

export async function notifyBookingPaymentFailed(bookingId: string): Promise<void> {
  const booking = await getHotelBookingRecord(bookingId);
  if (!booking?.customer_email) return;
  if (paymentEmailGate(booking) === "paid") return;
  if (await alreadySent(booking, "email_payment_failed_sent")) return;

  const view = toHotelBookingConfirmView(booking);
  const brand = await getEmailBrand();
  const locale = await resolveRecipientLocale({
    email: view.customer_email,
    bookingLocale: snapshotOf(booking).locale,
  });
  const vars = buildBookingEmailVars(view, locale);
  const resume = String(vars.cta_url || bookingResumeUrl(view));
  const ar = locale !== "en" && locale !== "tr";
  const subject = ar
    ? `فشل الدفع — أكمل حجزك ${view.id}`
    : locale === "tr"
      ? `Ödeme başarısız — rezervasyonu tamamlayın ${view.id}`
      : `Payment failed — complete your booking ${view.id}`;
  const heading = ar ? "تعذّر تأكيد الدفع" : locale === "tr" ? "Ödeme doğrulanamadı" : "Payment was not confirmed";
  const lead = ar
    ? `مرحباً ${view.customer_name}. لم نستلم دفعاً ناجحاً بعد. يمكنك إكمال الحجز من الرابط أدناه.`
    : locale === "tr"
      ? `Merhaba ${view.customer_name}. Ödemeniz doğrulanmadı. Rezervasyonu aşağıdaki bağlantıdan tamamlayabilirsiniz.`
      : `Hello ${view.customer_name}. We could not confirm payment. Use the link below to complete your booking.`;
  const details = String(vars.detail_ar || vars.detail_en || "");
  const inner = `<h1 style="margin:0 0 10px;font-size:22px;">${heading}</h1>
<p style="margin:0 0 12px;color:#5b4d3e;line-height:1.8;">${lead}</p>
<p style="margin:0 0 12px;line-height:1.8;">${details}</p>
<p style="margin:22px 0 8px;"><a href="${resume}" style="display:inline-block;background:${brand.button};color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;">${
    ar ? "إكمال الحجز" : locale === "tr" ? "Rezervasyonu tamamla" : "Complete booking"
  }</a></p>`;
  const html = wrapEmailHtml(brand, inner, locale);
  const sent = await sendMail({
    to: view.customer_email,
    toName: view.customer_name,
    subject,
    html,
    text: `${subject}\n${details}\n${resume}`,
    listUnsubscribe: false,
    locale,
  });
  if (sent.ok) await markBookingEmail(booking.id, "email_payment_failed_sent");
}

/**
 * Called when a hotel_bookings row is created (checkout session). Sends pending mail unless already paid
 * (loyalty / voucher cover). Never sends "حجز فندق ناجح" while pending_payment.
 */
export async function notifyHotelBookingPlaced(bookingId: string): Promise<void> {
  const booking = await getHotelBookingRecord(bookingId);
  if (!booking) return;
  const gate = paymentEmailGate(booking);
  if (gate === "paid") {
    await notifyIyzicoPaymentSuccess(bookingId);
    return;
  }
  if (gate === "failed") {
    await notifyBookingPaymentFailed(bookingId);
    return;
  }
  await notifyBookingAwaitingPayment(bookingId);
}

/** E-ticket mail after supplier ticketing — flights only, never hotel wording. */
export async function notifyFlightBookingPlaced(
  booking: FlightBookingSession
): Promise<void> {
  const email = String(booking.contact.email || "").trim();
  if (!email) return;
  const hotelId = String(booking.hotelBookingId || "").trim();
  if (hotelId) {
    const row = await getHotelBookingRecord(hotelId);
    if (row && paymentEmailGate(row) !== "paid") return;
    if (row && (await alreadySent(row, "email_eticket_sent"))) return;
  }
  const template = await findTemplateByKinds(["flight_success", "booking_success"]);
  if (!template) return;
  const brand = await getEmailBrand();
  const locale = await resolveRecipientLocale({
    email,
    bookingLocale: booking.locale,
  });
  const copy = flightSessionDetail(booking, locale);
  const cta = hotelId
    ? `${brand.siteUrl}/hotels/book?booking=${encodeURIComponent(hotelId)}`
    : `${brand.siteUrl}/flights/booking?id=${encodeURIComponent(booking.id)}`;
  const rendered = await renderTemplateMessage(
    template,
    {
      name: booking.contact.name || email,
      email,
      booking_id: hotelId || booking.id,
      bookingId: hotelId || booking.id,
      service_name: copy.route,
      detail_ar: copy.detail,
      detail_en: copy.detail,
      amount: booking.price.client || booking.quotedClient,
      currency: booking.price.currency || "USD",
      cta_url: cta,
      route: copy.route,
      depart_date: copy.depart,
      return_date: copy.ret,
      passengers: copy.passengers,
      baggage: copy.baggage,
    },
    brand,
    locale
  );
  let attachments: MailAttachment[] = [];
  if (hotelId) {
    const row = await getHotelBookingRecord(hotelId);
    if (row && paymentEmailGate(row) === "paid") {
      attachments = await buildBookingMailPdfs(toHotelBookingConfirmView(row), locale);
    }
  }
  const sent = await sendMail({
    to: email,
    toName: booking.contact.name,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    attachments,
    listUnsubscribe: false,
    locale,
  });
  if (sent.ok && hotelId) await markBookingEmail(hotelId, "email_eticket_sent");
}

/** Payment-received mail — iyzico webhook / confirmed paid only. */
export async function notifyIyzicoPaymentSuccess(bookingId: string): Promise<void> {
  const booking = await getHotelBookingRecord(bookingId);
  if (!booking?.customer_email) return;
  if (paymentEmailGate(booking) !== "paid") return;
  if (await alreadySent(booking, "email_payment_sent")) return;

  const view = toHotelBookingConfirmView(booking);
  const brand = await getEmailBrand();
  const locale = await resolveRecipientLocale({
    email: view.customer_email,
    bookingLocale: snapshotOf(booking).locale,
  });
  const kinds: EmailTemplateKind[] = ["invoice", ...successTemplateKinds(view.service)];
  const template = await findTemplateByKinds(kinds);
  if (!template) return;

  const invoiceUrl =
    view.service === "flight"
      ? `${SITE_PUBLIC_URL}/api/account/bookings/${view.id}/ticket/pdf`
      : `${SITE_PUBLIC_URL}/api/hotel-bookings/${view.id}/pdf?confirm=${encodeURIComponent(view.confirm)}`;

  const attachments = await buildBookingMailPdfs(view, locale);
  await attachOfficialEArchive(view.id, attachments);

  const rendered = await renderTemplateMessage(
    template,
    {
      ...buildBookingEmailVars(view, locale, {
        invoice_url: invoiceUrl,
        payment_ref: String(booking.iyzico_payment_id || "iyzico"),
        cta_url: invoiceUrl,
      }),
    },
    brand,
    locale
  );

  const sent = await sendMail({
    to: view.customer_email,
    toName: view.customer_name,
    subject: rendered.subject,
    html: rendered.html,
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

  const service = detectInvoiceService({
    type: booking.type,
    provider: meta.provider,
    hotel_id: meta.hotel_id,
    offer_snapshot: meta,
  });
  const kinds = ENQUIRY_SUCCESS_KINDS[booking.type] || ENQUIRY_SUCCESS_KINDS[service] || ["booking_success"];
  const template = await findTemplateByKinds(kinds);
  if (!template) return;

  const brand = await getEmailBrand();
  const serviceName = String(booking.service_name || booking.destination || booking.type);
  const detailAr = [booking.destination, booking.message].filter(Boolean).join(" — ").slice(0, 400);
  const locale = await resolveRecipientLocale({
    email,
    bookingLocale: meta.locale,
  });
  const rendered = await renderTemplateMessage(
    template,
    {
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
    },
    brand,
    locale
  );
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
