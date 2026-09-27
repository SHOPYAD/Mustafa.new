// src/app/api/transfers/driver/fleet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId") || req.headers.get("x-supplier-id") || "sup-lonaliza-official";

    const vehicles = transferStore.getSupplierVehicles(supplierId, undefined, true);
    return NextResponse.json({
      ok: true,
      vehicles,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplierId = body.supplierId || req.headers.get("x-supplier-id") || "sup-lonaliza-official";

    if (!body.vehicleClassId || !body.plateNumber) {
      return NextResponse.json({ ok: false, error: "فئة السيارة ورقم اللوحة مطلوبان" }, { status: 400 });
    }

    const vehicle = transferStore.saveSupplierVehicle({
      supplierId,
      vehicleClassId: body.vehicleClassId,
      plateNumber: body.plateNumber,
      make: body.make || "Mercedes-Benz",
      model: body.model || "VIP Tourer",
      year: Number(body.year) || 2024,
      color: body.color || "Black",
      cleanlinessRating: Number(body.cleanlinessRating) || 98,
      ownImages: body.images?.map((url: string) => ({ url })) || [],
      driver: {
        name: body.driverName || "سائق معتمد",
        phone: body.driverPhone || "",
        licenseNumber: body.licenseNumber,
        photoUrl: body.driverPhotoUrl,
        languages: body.driverLanguages || ["ar", "tr"],
      },
      customPricing: body.customPricing,
      isActive: true,
    });

    return NextResponse.json({
      ok: true,
      message: vehicle.moderationStatus === "approved"
        ? "تمت إضافة السيارة واعتمادها بنجاح وهي الآن متاحة للعملاء"
        : "تمت إضافة السيارة بنجاح وهي قيد مراجعة وتدقيق الإدارة",
      vehicle,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
