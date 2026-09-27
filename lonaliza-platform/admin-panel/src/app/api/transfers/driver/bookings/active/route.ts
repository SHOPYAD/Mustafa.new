// src/app/api/transfers/driver/bookings/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId") || req.headers.get("x-supplier-id") || undefined;
    const driverPhone = searchParams.get("driverPhone") || undefined;

    // Get non-completed, non-cancelled bookings
    const activeStatuses = ["pending_assignment", "offered", "accepted", "assigned", "on_the_way", "arrived", "in_progress"];
    let bookings = transferStore.getBookings({ status: activeStatuses, supplierId });

    if (driverPhone) {
      bookings = bookings.filter((b) => b.assignment?.driverPhone === driverPhone);
    }

    return NextResponse.json({
      ok: true,
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        serviceType: b.serviceType,
        status: b.status,
        contact: b.contact,
        passengers: b.passengers,
        luggage: b.luggage,
        scheduledAt: b.legs?.[0]?.scheduledAt || b.tour?.startAt,
        routeSummary: b.serviceType === "daily_tour"
          ? `${b.tour?.titleSnapshot} (${b.tour?.hours} ساعات)`
          : `${b.legs?.[0]?.fromLabel} → ${b.legs?.[0]?.toLabel}`,
        pickupAddress: b.legs?.[0]?.address || b.tour?.pickupAddress || b.legs?.[0]?.fromLabel,
        destinationAddress: b.legs?.[0]?.toLabel,
        hotelName: b.legs?.[0]?.hotelName || b.tour?.hotelName,
        flightNumber: b.flightNumber || b.legs?.[0]?.flight?.number,
        flightTicketUrl: b.flightTicketUrl,
        passportCount: b.passengerPassports?.length || 0,
        passengerPassports: b.passengerPassports,
        itineraryPdfUrl: b.tour?.itineraryPdfUrl,
        pricing: {
          total: b.pricing.total,
          currency: b.pricing.currency,
          paymentMode: b.paymentMode,
          paymentStatus: b.paymentStatus,
          collectFromGuest: b.pricing.remainingToCollect || 0,
        },
        assignment: b.assignment,
        customerNotes: b.customerNotes,
        createdAt: b.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
