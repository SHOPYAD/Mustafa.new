import { NextRequest, NextResponse } from "next/server";
import { resolveOfficialInvoice } from "@/lib/server/invoice-resolver";
import { authorizeBookingDocument } from "@/lib/server/booking-document-access";
import { findMockBookingDetail } from "@/lib/server/mock-account-bookings";
import { renderHtmlToPdf } from "@/lib/pdf/program-pdf";
import {
  buildFlightTicketModelFromInvoice,
  renderFlightTicketHtml,
} from "@/lib/pdf/flight-ticket-html";

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

    const lang = req.nextUrl.searchParams.get("lang") || "ar";
    const access = await authorizeBookingDocument(req, id);
    if (!access.ok) {
      return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
    }
    const invoice = await resolveOfficialInvoice(id);
    if (!invoice) {
      return NextResponse.json({ ok: false, error: "booking_not_found" }, { status: 404 });
    }

    const mockDetail = findMockBookingDetail(id);
    const ticketModel = buildFlightTicketModelFromInvoice(invoice, mockDetail);
    const html = renderFlightTicketHtml(ticketModel, lang);
    const pdfBuffer = await renderHtmlToPdf(html);

    const filename = `Lonaliza-Flight-Ticket-${ticketModel.pnr}.pdf`;

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
    console.error("[flight-ticket-pdf-error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "ticket_pdf_failed" },
      { status: 500 }
    );
  }
}
