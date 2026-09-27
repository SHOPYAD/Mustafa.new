import { buildInvoiceModelFromConfirmView } from "@/lib/pdf/flight-invoice-model";
import { loadInvoiceBrandExtras, renderInvoiceHtmlForService } from "@/lib/pdf/invoice-assets";
import { renderHtmlToPdf } from "@/lib/pdf/program-pdf";
import { getInvoiceTemplate } from "@/lib/server/invoice-templates-store";
import type { HotelBookingConfirmView } from "@/lib/server/hotel-booking-confirm";

export async function buildBookingPdfBuffer(booking: HotelBookingConfirmView): Promise<Buffer> {
  const template = await getInvoiceTemplate(booking.service);
  const extras = await loadInvoiceBrandExtras(template);
  const model = await buildInvoiceModelFromConfirmView(booking, extras, template.language);
  const html = await renderInvoiceHtmlForService(model, template);
  return renderHtmlToPdf(html);
}
