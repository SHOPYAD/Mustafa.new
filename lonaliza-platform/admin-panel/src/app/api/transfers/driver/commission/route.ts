// src/app/api/transfers/driver/commission/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const settings = transferStore.getSettings();
    const comm = settings.defaultCommissionPercent ?? 15;
    return NextResponse.json({
      ok: true,
      platformCommissionPct: comm,
      commissionPercent: comm,
      defaultVehicleClassId: "vc-vito-vip",
      autoApproveFleet: settings.autoApproveFleet ?? false,
      settlementCycle: "weekly",
      currency: "USD",
      termsI18n: {
        ar: "الشروط والأحكام: تلتزم الشركة أو السائق بتقديم خدمة راقية تليق بمعايير لوناليزا VIP، والالتزام بالمواعيد المحددة ونظافة المركبة، وتحويل عمولة المنصة وفق النظام المالي.",
        en: "Terms & Conditions: Partners commit to maintaining high VIP service standards, punctuality, pristine vehicle cleanliness, and honoring agreed platform commissions.",
        tr: "Şartlar ve Koşullar: İş ortakları yüksek VIP hizmet standartlarını, dakikliği ve temiz araçları korumayı taahhüt eder.",
      },
      features: {
        instantPayout: true,
        aiFleetCopilot: true,
        liveDispatch: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
