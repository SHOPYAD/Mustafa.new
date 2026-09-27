// src/app/api/transfers/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";
import type { TransferBooking, TransferPaymentMode } from "@/lib/transfers/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const serviceType = body.serviceType || (body.mode === "daily_tour" ? "daily_tour" : "transfer");
    const contact = body.contact || {
      name: body.guestName || "ضيف كريم",
      email: body.email || "",
      phone: body.phone || "",
      whatsapp: body.whatsapp || body.phone || "",
      preferredLanguage: body.language || "ar",
    };

    if (!contact.name || !contact.phone) {
      return NextResponse.json({ ok: false, error: "اسم المسافر ورقم الهاتف مطلوبان لإتمام الحجز" }, { status: 400 });
    }

    const vehicleClassId = body.vehicleClassId || "vc-vito-vip";
    const vehicleClass = transferStore.getVehicleClassById(vehicleClassId);

    const paymentMode = (body.paymentMode || "online_full") as TransferPaymentMode;
    const basePrice = Number(body.pricing?.basePrice || body.price || 65);
    const discountAmount = Number(body.pricing?.paymentDiscountAmount || 0);
    const finalTotal = Number(body.pricing?.finalTotal || Math.max(20, basePrice - discountAmount));
    const depositPaid = paymentMode === "online_full" ? finalTotal : paymentMode === "deposit_half" ? Math.round(finalTotal * 0.5) : 0;
    const remainingToCollect = finalTotal - depositPaid;

    // Build booking legs or tour details
    const legs = body.legs || (serviceType === "transfer" ? [
      {
        direction: "outbound",
        fromLabel: body.fromLabel || "مطار إسطنبول الدولي (IST)",
        toLabel: body.toLabel || "فندق في إسطنبول",
        address: body.address || body.toLabel || "",
        scheduledAt: body.scheduledAt || new Date().toISOString(),
        flight: body.flightNumber ? { number: body.flightNumber, airline: body.airline } : undefined,
        hotelName: body.hotelName,
      },
    ] : undefined);

    const tour = serviceType === "daily_tour" ? {
      tourId: body.tourId,
      titleSnapshot: body.tourTitle?.ar || body.tourTitle || "جولة سياحية خاصة VIP",
      startAt: body.scheduledAt || new Date().toISOString(),
      hours: Number(body.hours) || 8,
      pickupAddress: body.pickupAddress || body.hotelName || "بهو الفندق",
      hotelName: body.hotelName,
      itineraryPdfUrl: body.itineraryPdfUrl,
      itinerarySummary: body.itinerarySummary,
      customStops: body.customStops,
    } : undefined;

    // Match or auto-assign vehicle from supplier
    const approvedVehicles = transferStore.getSupplierVehicles(undefined, "approved");
    const matchedVehicle = approvedVehicles.find((v) => v.vehicleClassId === vehicleClassId) || approvedVehicles[0];

    const newBooking = transferStore.createBooking({
      serviceType,
      customerId: body.customerId,
      contact,
      vehicleClassId,
      vehicleClassName: vehicleClass?.name.ar || "مرسيدس فيتو VIP",
      passengers: {
        adults: Number(body.passengers?.adults || body.adults || 2),
        children: Number(body.passengers?.children || body.children || 0),
        infants: Number(body.passengers?.infants || body.infants || 0),
      },
      luggage: {
        large: Number(body.luggage?.large || body.luggageLarge || 2),
        small: Number(body.luggage?.small || body.luggageSmall || 2),
      },
      tripType: body.tripType || "oneway",
      legs,
      tour,
      pricing: {
        base: basePrice,
        discountAmount,
        discountReason: paymentMode === "online_full" ? "خصم الدفع الإلكتروني الكامل" : paymentMode === "deposit_half" ? "خصم دفع العربون" : undefined,
        total: finalTotal,
        depositPaid,
        remainingToCollect,
        currency: body.pricing?.currency || "USD",
        supplierNet: Math.round(finalTotal * 0.85),
        commissionAmount: Math.round(finalTotal * 0.15),
      },
      paymentMode,
      paymentStatus: paymentMode === "online_full" ? "paid" : paymentMode === "deposit_half" ? "partially_paid" : "unpaid",
      status: "pending_assignment",
      assignment: matchedVehicle ? {
        supplierId: matchedVehicle.supplierId,
        vehicleId: matchedVehicle.id,
        driverName: matchedVehicle.driver.name,
        driverPhone: matchedVehicle.driver.phone,
        plateNumber: matchedVehicle.plateNumber,
        assignedAt: new Date().toISOString(),
      } : undefined,
      passengerPassports: body.passengerPassports || (body.passportPhotoUrl ? [{ photoUrl: body.passportPhotoUrl }] : []),
      flightTicketUrl: body.flightTicketUrl,
      flightNumber: body.flightNumber,
      customerNotes: body.customerNotes,
    });

    return NextResponse.json({
      ok: true,
      message: "تم تسجيل الحجز وتأكيده بنجاح",
      booking: newBooking,
      trackingUrl: `/transfers/track/${newBooking.bookingNumber}`,
    });
  } catch (err: any) {
    console.error("[TransfersBookAPI Error]:", err);
    return NextResponse.json({ ok: false, error: err.message || "Failed to create booking" }, { status: 500 });
  }
}
