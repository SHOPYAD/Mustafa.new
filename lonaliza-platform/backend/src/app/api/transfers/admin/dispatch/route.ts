// src/app/api/transfers/admin/dispatch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType") || undefined;
    const statusParam = searchParams.get("status");
    const search = searchParams.get("search") || undefined;

    let status: string | string[] | undefined = undefined;
    if (statusParam) {
      status = statusParam.includes(",") ? statusParam.split(",") : statusParam;
    }

    const bookings = transferStore.getBookings({
      serviceType,
      status,
      search,
    });

    const suppliers = transferStore.getSuppliers();
    const approvedVehicles = transferStore.getSupplierVehicles(undefined, "approved");

    return NextResponse.json({
      ok: true,
      totalCount: bookings.length,
      bookings,
      availableDrivers: approvedVehicles.map((v) => ({
        vehicleId: v.id,
        supplierId: v.supplierId,
        make: v.make,
        model: v.model,
        plateNumber: v.plateNumber,
        driverName: v.driver.name,
        driverPhone: v.driver.phone,
        vehicleClassId: v.vehicleClassId,
      })),
      suppliers: suppliers.map((s) => ({ id: s.id, tradeName: s.tradeName })),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ ok: false, error: "معرف الحجز مطلوب" }, { status: 400 });
    }

    if (action === "assign") {
      const { supplierId, vehicleId, driverName, driverPhone, plateNumber } = body;
      if (!driverName || !plateNumber) {
        return NextResponse.json({ ok: false, error: "اسم السائق ورقم اللوحة مطلوبان" }, { status: 400 });
      }

      const updated = transferStore.assignBooking(bookingId, {
        supplierId: supplierId || "sup-lonaliza-official",
        vehicleId,
        driverName,
        driverPhone: driverPhone || "",
        plateNumber,
      });

      return NextResponse.json({
        ok: true,
        message: "تم تعيين السائق للرحلة بنجاح وإرسال الإشعار لتطبيق السائق",
        booking: updated,
      });
    }

    if (action === "cancel") {
      const { reason } = body;
      const updated = transferStore.updateBookingStatus(bookingId, "cancelled", reason || "إلغاء من قبل الإدارة");
      return NextResponse.json({
        ok: true,
        message: "تم إلغاء الحجز بنجاح",
        booking: updated,
      });
    }

    if (action === "change_status") {
      const { status, reason } = body;
      const updated = transferStore.updateBookingStatus(bookingId, status, reason);
      return NextResponse.json({
        ok: true,
        message: `تم تحديث الحالة إلى ${status}`,
        booking: updated,
      });
    }

    return NextResponse.json({ ok: false, error: "إجراء غير معروف" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
