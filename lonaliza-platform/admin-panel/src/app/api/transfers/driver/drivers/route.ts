// src/app/api/transfers/driver/drivers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId") || req.headers.get("x-supplier-id") || "sup-lonaliza-official";

    const drivers = transferStore.getDrivers(supplierId);

    return NextResponse.json({
      ok: true,
      drivers,
      list: drivers,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplierId = body.supplierId || req.headers.get("x-supplier-id") || "sup-lonaliza-official";

    if (!body.name) {
      return NextResponse.json({ ok: false, error: "اسم السائق مطلوب" }, { status: 400 });
    }

    const driver = transferStore.saveDriver({
      supplierId,
      name: body.name,
      phone: body.phone || "",
      licenseNumber: body.licenseNumber || "",
      status: "active",
    });

    return NextResponse.json({
      ok: true,
      message: "تمت إضافة السائق الفرعي بنجاح",
      driver,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
