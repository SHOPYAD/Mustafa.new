// src/app/api/transfers/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const settings = transferStore.getSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = transferStore.updateSettings({
      onlineFullDiscountPercent: body.onlineFullDiscountPercent !== undefined ? Number(body.onlineFullDiscountPercent) : undefined,
      depositDiscountPercent: body.depositDiscountPercent !== undefined ? Number(body.depositDiscountPercent) : undefined,
      defaultCommissionPercent: body.defaultCommissionPercent !== undefined ? Number(body.defaultCommissionPercent) : undefined,
      autoApproveFleet: body.autoApproveFleet !== undefined ? Boolean(body.autoApproveFleet) : undefined,
      baseCurrency: body.baseCurrency || "USD",
      emergencyContactPhone: body.emergencyContactPhone,
      emergencyContactWhatsapp: body.emergencyContactWhatsapp,
    });

    return NextResponse.json({
      ok: true,
      message: "تم حفظ إعدادات النقل والخصومات بنجاح",
      settings: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
