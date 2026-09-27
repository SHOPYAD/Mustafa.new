// src/app/api/transfers/admin/suppliers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const list = transferStore.getSuppliers(status, true);

    const enriched = list.map((sup) => {
      const vehicles = transferStore.getSupplierVehicles(sup.id, undefined, true);
      const bookings = transferStore.getBookings({ supplierId: sup.id });
      return {
        ...sup,
        vehicleCount: vehicles.length,
        driverCount: vehicles.length,
        tripsCount: bookings.length,
      };
    });

    return NextResponse.json({ ok: true, list: enriched });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "approve") {
      const { supplierId } = body;
      if (!supplierId) {
        return NextResponse.json({ ok: false, error: "معرف الشريك مطلوب" }, { status: 400 });
      }
      const updated = transferStore.approveSupplier(supplierId);
      if (!updated) {
        return NextResponse.json({ ok: false, error: "الشريك غير موجود" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, supplier: updated, message: "تم اعتماد وتفعيل الشريك بنجاح" });
    }

    if (body.action === "reject") {
      const { supplierId, reason } = body;
      if (!supplierId) {
        return NextResponse.json({ ok: false, error: "معرف الشريك مطلوب" }, { status: 400 });
      }
      const updated = transferStore.rejectSupplier(supplierId, reason);
      if (!updated) {
        return NextResponse.json({ ok: false, error: "الشريك غير موجود" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, supplier: updated, message: "تم رفض طلب الشريك" });
    }

    if (body.action === "update_status") {
      const { supplierId, status, reason } = body;
      if (!supplierId || !status) {
        return NextResponse.json({ ok: false, error: "بيانات الحالة غير مكتملة" }, { status: 400 });
      }
      const updated = transferStore.updateSupplierStatus(supplierId, status, reason);
      return NextResponse.json({ ok: true, supplier: updated });
    }

    if (body.action === "add_voucher") {
      const { supplierId, weekStart, weekEnd, amount, currency, voucherUrl, note } = body;
      if (!supplierId || !amount || !voucherUrl) {
        return NextResponse.json({ ok: false, error: "بيانات إيصال الدفع غير مكتملة" }, { status: 400 });
      }

      const voucher = transferStore.addPayoutVoucher(supplierId, {
        weekStart: weekStart || new Date().toISOString(),
        weekEnd: weekEnd || new Date().toISOString(),
        amount: Number(amount),
        currency: currency || "USD",
        voucherUrl,
        note,
      });

      return NextResponse.json({ ok: true, voucher });
    }

    if (!body.legalName || !body.tradeName || !body.contactEmail) {
      return NextResponse.json({ ok: false, error: "الاسم القانوني والاسم التجاري والبريد الإلكتروني مطلوبة" }, { status: 400 });
    }

    const supplier = transferStore.saveSupplier(body);
    return NextResponse.json({ ok: true, supplier });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
