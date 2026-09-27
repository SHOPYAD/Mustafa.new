import { detectInvoiceService, type InvoiceService } from "@/lib/booking-service";
import type { MailAttachment } from "@/lib/server/email/types";
import type { HotelBookingConfirmView } from "@/lib/server/hotel-booking-confirm";
import { resolveFlightBookingRefs } from "@/lib/pdf/flight-booking-refs";
import { buildFlightTicketModelFromInvoice, renderFlightTicketHtml } from "@/lib/pdf/flight-ticket-html";
import { buildHotelVoucherModelFromInvoice, renderHotelVoucherHtml } from "@/lib/pdf/hotel-voucher-html";
import { buildInvoiceModelFromConfirmView } from "@/lib/pdf/flight-invoice-model";
import { loadInvoiceBrandExtras, renderInvoiceHtmlForService } from "@/lib/pdf/invoice-assets";
import { renderHtmlToPdf } from "@/lib/pdf/program-pdf";
import { buildServiceVoucherModelFromInvoice, renderServiceVoucherHtml } from "@/lib/pdf/service-voucher-html";
import { getInvoiceTemplate } from "@/lib/server/invoice-templates-store";

export type BookingPdfKind = "eticket" | "voucher" | "tax_invoice";

export function pdfKindsForService(service: InvoiceService, paid: boolean): BookingPdfKind[] {
  if (!paid) return [];
  switch (service) {
    case "flight":
      return ["eticket", "tax_invoice"];
    case "hotel":
      return ["voucher", "tax_invoice"];
    default:
      return ["voucher", "tax_invoice"];
  }
}

function sanitizeInventedTicket(value: string, bookingId: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^235-\d{10}$/.test(raw)) return "";
  if (raw.toUpperCase() === bookingId.slice(0, 8).toUpperCase()) return "";
  if (raw.startsWith("TKT-") || raw === "PENDING") return "";
  return raw;
}

export async function buildBookingMailPdfs(
  view: HotelBookingConfirmView,
  locale = "ar"
): Promise<MailAttachment[]> {
  const paid =
    String(view.status || "").toLowerCase() === "paid" ||
    String(view.payment_status || "").toLowerCase() === "paid";
  const kinds = pdfKindsForService(view.service, paid);
  if (!kinds.length) return [];

  const attachments: MailAttachment[] = [];
  const extras = await loadInvoiceBrandExtras(await getInvoiceTemplate(view.service));

  if (kinds.includes("tax_invoice")) {
    try {
      const model = await buildInvoiceModelFromConfirmView(view, extras, locale === "en" ? "en" : locale === "tr" ? "tr" : "ar");
      const html = await renderInvoiceHtmlForService(model);
      const pdf = await renderHtmlToPdf(html);
      attachments.push({
        filename: `lonaliza-invoice-${view.id}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      });
    } catch {
      /* invoice PDF is best-effort */
    }
  }

  if (kinds.includes("eticket") || kinds.includes("voucher")) {
    try {
      const { resolveOfficialInvoice } = await import("@/lib/server/invoice-resolver");
      const invoice = await resolveOfficialInvoice(view.id);
      if (invoice) {
        if (view.service === "flight" && kinds.includes("eticket")) {
          const refs = resolveFlightBookingRefs(view.id, view.snapshot || {});
          const model = buildFlightTicketModelFromInvoice(invoice, null);
          const ticketNo = sanitizeInventedTicket(refs.ticketNumber, view.id) || sanitizeInventedTicket(model.ticketNumber, view.id);
          model.pnr = refs.pnr || model.pnr;
          model.ticketNumber = ticketNo || refs.ticketNumber || "PENDING";
          model.status = ticketNo ? "CONFIRMED / OK TO BOARD" : "PAYMENT RECEIVED — TICKET PENDING";
          model.passengers = (model.passengers || []).map((p, idx) => ({
            ...p,
            name: p.name,
            ticketNumber: ticketNo || p.ticketNumber || "PENDING",
            seat: p.seat && p.seat !== "14A" ? p.seat : view.guest_names[idx] ? "—" : "—",
            passportNumber: p.passportNumber === "U12345678" ? "" : p.passportNumber,
            meal: p.meal === "Standard Meal" ? "" : p.meal,
          }));
          const html = renderFlightTicketHtml(model, locale);
          const pdf = await renderHtmlToPdf(html);
          attachments.push({
            filename: `lonaliza-eticket-${refs.pnr || view.id}.pdf`,
            content: pdf,
            contentType: "application/pdf",
          });
        } else if (view.service === "hotel" && kinds.includes("voucher")) {
          const model = buildHotelVoucherModelFromInvoice(invoice, null);
          const html = renderHotelVoucherHtml(model, locale);
          const pdf = await renderHtmlToPdf(html);
          attachments.push({
            filename: `lonaliza-voucher-${view.id}.pdf`,
            content: pdf,
            contentType: "application/pdf",
          });
        } else if (kinds.includes("voucher")) {
          const model = buildServiceVoucherModelFromInvoice(invoice, null);
          const html = renderServiceVoucherHtml(model, locale);
          const pdf = await renderHtmlToPdf(html);
          attachments.push({
            filename: `lonaliza-voucher-${view.id}.pdf`,
            content: pdf,
            contentType: "application/pdf",
          });
        }
      }
    } catch {
      /* voucher / e-ticket is best-effort */
    }
  }

  return attachments;
}

export function detectPdfService(input: {
  provider?: unknown;
  hotel_id?: unknown;
  offer_snapshot?: unknown;
}): InvoiceService {
  return detectInvoiceService(input);
}
