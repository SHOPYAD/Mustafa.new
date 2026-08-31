import { NextRequest, NextResponse } from "next/server";
import { renderHtmlToPdf } from "@/lib/pdf/program-pdf";
import { loadInvoiceBrandExtras, renderInvoiceHtmlForService } from "@/lib/pdf/invoice-assets";
import { enrichFlightInvoiceModel, flightSessionToInvoiceModel } from "@/lib/pdf/flight-invoice-model";
import { getInvoiceTemplate } from "@/lib/server/invoice-templates-store";
import { getFlightBooking, persistFlightSessionRefs } from "@/lib/server/flights-bookings";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const booking = await getFlightBooking(id);
  if (!booking) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const stored = await persistFlightSessionRefs(booking);
  const template = await getInvoiceTemplate("flight");
  const extras = await loadInvoiceBrandExtras(template);
  const model = await enrichFlightInvoiceModel(
    flightSessionToInvoiceModel(stored, extras),
    template.language
  );

  const buffer = await renderHtmlToPdf(await renderInvoiceHtmlForService(model, template));
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="alrayyan-flight-${booking.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
