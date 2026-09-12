import { renderHtmlToPdf } from "@/lib/pdf/program-pdf";
import { renderOfficialInvoiceStandaloneHtml } from "@/lib/server/invoice-pdf-html";
import type { OfficialInvoiceData } from "@/lib/server/invoice-resolver";

export async function generateOfficialInvoicePdfBuffer(
  invoice: OfficialInvoiceData,
  lang: string = "ar"
): Promise<Buffer> {
  const html = renderOfficialInvoiceStandaloneHtml(invoice, lang);
  return renderHtmlToPdf(html);
}
