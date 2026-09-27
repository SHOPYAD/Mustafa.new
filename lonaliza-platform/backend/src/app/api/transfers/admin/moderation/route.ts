// src/app/api/transfers/admin/moderation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const vehicles = transferStore.getSupplierVehicles(undefined, status, true);
    const suppliers = transferStore.getSuppliers();
    const classes = transferStore.getVehicleClasses();
    const settings = transferStore.getSettings();

    const enriched = vehicles.map((v) => {
      const sup = suppliers.find((s) => s.id === v.supplierId);
      const vc = classes.find((c) => c.id === v.vehicleClassId);
      return {
        ...v,
        supplierName: sup?.tradeName || v.supplierId,
        vehicleClassName: vc?.name.ar || v.vehicleClassId,
      };
    });

    return NextResponse.json({
      ok: true,
      autoApproveFleet: settings.autoApproveFleet,
      vehicles: enriched,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "toggle_auto_approve") {
      const settings = transferStore.updateSettings({
        autoApproveFleet: Boolean(body.autoApproveFleet),
      });
      return NextResponse.json({
        ok: true,
        message: `تم تحديث نظام الاعتماد التلقائي إلى: ${settings.autoApproveFleet ? "مفعل (تلقائي)" : "معطل (يتطلب تدقيق يدوي)"}`,
        autoApproveFleet: settings.autoApproveFleet,
      });
    }

    const { vehicleId, status, note } = body;
    if (!vehicleId || !status) {
      return NextResponse.json({ ok: false, error: "معرف السيارة والحالة مطلوبان" }, { status: 400 });
    }

    const moderated = transferStore.moderateVehicle(vehicleId, status, note);
    if (!moderated) {
      return NextResponse.json({ ok: false, error: "السيارة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: status === "approved" ? "تم اعتماد السيارة بنجاح ونشرها للعملاء" : "تم رفض السيارة وتدوين الملاحظة للمورد",
      vehicle: moderated,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
