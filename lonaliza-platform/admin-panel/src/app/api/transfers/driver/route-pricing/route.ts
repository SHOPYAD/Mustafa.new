// src/app/api/transfers/driver/route-pricing/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId") || req.headers.get("x-supplier-id") || "sup-lonaliza-official";
    const routeId = searchParams.get("routeId") || undefined;

    const pricing = transferStore.getSupplierRoutePricing(supplierId, routeId);

    return NextResponse.json({
      ok: true,
      pricing,
      list: pricing,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const supplierId = body.supplierId || req.headers.get("x-supplier-id") || "sup-lonaliza-official";

    if (!body.routeId) {
      return NextResponse.json({ ok: false, error: "معرف المسار مطلوب" }, { status: 400 });
    }

    const saved = transferStore.saveSupplierRoutePricing({
      supplierId,
      routeId: body.routeId,
      vehicleClassId: body.vehicleClassId,
      basePrice: Number(body.basePrice) || 0,
      currency: body.currency || "USD",
      isActive: body.isActive !== false,
    });

    return NextResponse.json({
      ok: true,
      message: "تم تحديث تسعير المسار بنجاح",
      pricing: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
