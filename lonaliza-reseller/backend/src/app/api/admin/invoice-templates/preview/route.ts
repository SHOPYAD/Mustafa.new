import { NextRequest, NextResponse } from "next/server";
import { isInvoiceService } from "@/lib/booking-service";
import { renderSampleInvoiceHtml, loadInvoiceBrandExtras } from "@/lib/pdf/invoice-assets";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { sanitizeInvoiceTemplate } from "@/lib/server/invoice-templates-store";
import { sampleInvoiceModel } from "@/lib/pdf/invoice-sample";
import { enrichFlightInvoiceModel } from "@/lib/pdf/flight-invoice-model";
import {
  buildFlightTicketModelFromInvoice,
  renderFlightTicketHtml,
} from "@/lib/pdf/flight-ticket-html";
import {
  buildHotelVoucherModelFromInvoice,
  renderHotelVoucherHtml,
} from "@/lib/pdf/hotel-voucher-html";
import {
  buildServiceVoucherModelFromInvoice,
  renderServiceVoucherHtml,
} from "@/lib/pdf/service-voucher-html";
import type { OfficialInvoiceData } from "@/lib/server/invoice-resolver";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      service?: string;
      template?: unknown;
      viewType?: "invoice" | "ticket";
    };
    if (!isInvoiceService(body.service)) {
      return NextResponse.json({ ok: false, error: "service required" }, { status: 400 });
    }
    const draft = body.template
      ? sanitizeInvoiceTemplate(body.service, body.template)
      : null;

    if (body.viewType === "ticket") {
      const extras = await loadInvoiceBrandExtras(draft);
      const sample = sampleInvoiceModel(body.service, extras);
      const ready =
        sample.service === "flight"
          ? await enrichFlightInvoiceModel(sample, draft?.language || "ar")
          : sample;

      // Wrap sample model as OfficialInvoiceData structure for ticket / voucher builder
      const mockInvoice: OfficialInvoiceData = {
        ok: true,
        invoiceNumber: `INV-${(ready.pnr || ready.id).slice(0, 8).toUpperCase()}`,
        bookingId: ready.id,
        signature: "sample-sig",
        verifyUrl: `https://${ready.siteUrl}/invoice/verify?id=${ready.id}`,
        qrCodeDataUrl: "",
        issuedAt: ready.issuedAt,
        serviceType: body.service,
        company: {
          nameAr: draft?.companyNameAr || ready.brandNameAr,
          nameEn: draft?.companyNameEn || ready.brandNameEn,
          logoUrl: draft?.logoUrl || "",
          licenseNo: "14892",
          taxNo: "6090871234",
          address: ready.address,
          phone: ready.phone,
          email: ready.email,
          siteUrl: ready.siteUrl,
        },
        customer: {
          name: ready.customerName,
          email: ready.customerEmail,
          phone: ready.customerPhone,
        },
        bookingDetails: {
          title: ready.serviceTitle || (body.service === "flight" ? "رحلة إسطنبول إلى لندن" : "حجز فندق فور سيزونز"),
          subtitle: ready.route || "",
          pnr: ready.pnr || "TK-849204",
          dateLine: ready.departDate || "",
          status: ready.status,
          paymentStatus: ready.paymentStatus,
          paymentMethod: ready.paymentMethod,
          passengersOrGuests: (ready.passengers || []).map((p) => ({
            name: p.name,
            role: "Passenger",
            ticketOrDoc: p.document || ready.ticketNumber || "235-8492019482",
            seatOrRoom: "14A",
          })),
          flightSummary: {
            airline: ready.legs?.[0]?.airline || "Turkish Airlines",
            airlineCode: "TK",
            flightNumber: ready.legs?.[0]?.flightNumber || "TK 1985",
            origin: ready.legs?.[0]?.origin || "Istanbul (IST)",
            destination: ready.legs?.[0]?.destination || "London (LHR)",
            departureTime: `${ready.departDate || "2026-09-28"}T08:30:00`,
            arrivalTime: `${ready.departDate || "2026-09-28"}T10:45:00`,
            duration: "4h 15m",
            cabinClass: ready.fareClass || "Economy (Y)",
          },
          hotelSummary: {
            hotelName: ready.hotelName || "Four Seasons Hotel Istanbul",
            stars: 5,
            address: "Ciragan Cad. No: 28, Besiktas, Istanbul",
            roomType: ready.roomName || "Deluxe Sea View Room",
            checkIn: ready.checkIn || "2026-09-20",
            checkOut: ready.checkOut || "2026-09-25",
            nights: ready.nights || 5,
            boardType: "Breakfast Included (إفطار مشمول)",
          },
        },
        pricing: {
          baseFare: ready.baseFare || ready.total * 0.85,
          taxesAndFees: ready.taxes || ready.total * 0.15,
          voucherDiscount: 0,
          netTotal: ready.total,
          currency: ready.currency,
        },
        templateSettings: {
          primaryColor: draft?.primaryColor || "#18082e",
          accentColor: draft?.accentColor || "#f59e0b",
          footerNote: draft?.footerText || "",
          terms: [],
        },
      };

      let ticketHtml = "";
      const lang = draft?.language || "ar";
      if (body.service === "flight") {
        const ticketModel = buildFlightTicketModelFromInvoice(mockInvoice);
        ticketHtml = renderFlightTicketHtml(ticketModel, lang);
      } else if (body.service === "hotel") {
        const voucherModel = buildHotelVoucherModelFromInvoice(mockInvoice);
        ticketHtml = renderHotelVoucherHtml(voucherModel, lang);
      } else {
        const serviceModel = buildServiceVoucherModelFromInvoice(mockInvoice);
        ticketHtml = renderServiceVoucherHtml(serviceModel, lang);
      }

      return NextResponse.json({ ok: true, html: ticketHtml, service: body.service, viewType: "ticket" });
    }

    const html = await renderSampleInvoiceHtml(body.service, draft);
    return NextResponse.json({ ok: true, html, service: body.service, viewType: "invoice" });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Preview failed" },
      { status: 500 }
    );
  }
}
