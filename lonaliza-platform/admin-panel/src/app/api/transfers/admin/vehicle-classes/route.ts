// src/app/api/transfers/admin/vehicle-classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const list = transferStore.getVehicleClasses(true);
    return NextResponse.json({ ok: true, list });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const doc = await req.json();
    if (!doc.code) {
      return NextResponse.json({ ok: false, error: "كود الفئة مطلوب" }, { status: 400 });
    }
    const item = transferStore.saveVehicleClass(doc);
    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "المعرف مطلوب" }, { status: 400 });
    const deleted = transferStore.deleteVehicleClass(id);
    return NextResponse.json({ ok: deleted });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
