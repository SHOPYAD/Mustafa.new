import { NextRequest, NextResponse } from "next/server";
import { resolveOfficialInvoice } from "@/lib/server/invoice-resolver";
import { authorizeBookingDocument } from "@/lib/server/booking-document-access";
import { generateOfficialInvoicePdfBuffer } from "@/lib/server/invoice-pdf-service";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
    }

    const type = req.nextUrl.searchParams.get("type") || req.nextUrl.searchParams.get("source");
    if (type === "earchive" || type === "parasut") {
      const { getParasutInvoicePdfBuffer } = await import("@/lib/server/parasut/parasut-invoices-store");
      const eFile = await getParasutInvoicePdfBuffer(id);
      if (eFile && eFile.buffer) {
        return new NextResponse(new Uint8Array(eFile.buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${eFile.filename}"`,
            "Content-Length": String(eFile.buffer.length),
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      }
    }

    const lang = req.nextUrl.searchParams.get("lang") || "ar";

    const access = await authorizeBookingDocument(req, id);
    if (!access.ok) {
      return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
    }
    const invoice = await resolveOfficialInvoice(id);
    if (!invoice) {
      return NextResponse.json({ ok: false, error: "invoice_not_found" }, { status: 404 });
    }

    const pdfBuffer = await generateOfficialInvoicePdfBuffer(invoice, lang);
    const filename = `Lonaliza-Invoice-${invoice.invoiceNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[invoice-pdf-download-error]", error);
    return NextResponse.json({ ok: false, error: error?.message || "pdf_generation_failed" }, { status: 500 });
  }
}
