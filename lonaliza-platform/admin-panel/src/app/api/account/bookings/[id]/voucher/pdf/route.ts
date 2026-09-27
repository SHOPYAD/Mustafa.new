import { NextRequest, NextResponse } from "next/server";
import { resolveOfficialInvoice } from "@/lib/server/invoice-resolver";
import { authorizeBookingDocument } from "@/lib/server/booking-document-access";
import { findMockBookingDetail } from "@/lib/server/mock-account-bookings";
import { renderHtmlToPdf } from "@/lib/pdf/program-pdf";
import {
  buildHotelVoucherModelFromInvoice,
  renderHotelVoucherHtml,
} from "@/lib/pdf/hotel-voucher-html";
import {
  buildServiceVoucherModelFromInvoice,
  renderServiceVoucherHtml,
} from "@/lib/pdf/service-voucher-html";

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
    let html = "";
    let filename = "";

    if (invoice.serviceType === "hotel") {
      const hotelModel = buildHotelVoucherModelFromInvoice(invoice, mockDetail);
      html = renderHotelVoucherHtml(hotelModel, lang);
      filename = `Lonaliza-Hotel-Voucher-${hotelModel.voucherNumber}.pdf`;
    } else {
      const serviceModel = buildServiceVoucherModelFromInvoice(invoice, mockDetail);
      html = renderServiceVoucherHtml(serviceModel, lang);
      filename = `Lonaliza-Voucher-${serviceModel.voucherNumber}.pdf`;
    }

    const pdfBuffer = await renderHtmlToPdf(html);

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
    console.error("[voucher-pdf-error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "voucher_pdf_failed" },
      { status: 500 }
    );
  }
}
