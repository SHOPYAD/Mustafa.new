import { NextResponse } from "next/server";
import { verifyLicense } from "@/lib/license/client";
import { isOrigin } from "@/lib/server/deployment-role";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (isOrigin()) {
      return NextResponse.json({
        ok: true,
        currentVersion: "v2.1.0 (Origin Master)",
        hasActiveUpdates: true,
        updateAvailable: false,
      });
    }

    const licenseState = await verifyLicense();
    const currentVersion: string = "v2.0.0";
    const latestVersion: string = "v2.1.0";

    const changelog = [
      "ترقية محرك البحث عن الفنادق لزيادة سرعة جلب الأسعار والعملات بنسبة 40%",
      "تحسين قوالب فواتير وإيصالات الـ PDF وتنسيق خطوط الطباعة العربية",
      "إضافة محولات ذكاء اصطناعي جديدة وتحديث موديل Gemini Pro",
      "ترقيات أمنية وإصلاحات للتوافق مع أحدث إصدارات متصفحات الهواتف",
    ];

    return NextResponse.json({
      ok: true,
      currentVersion,
      latestVersion,
      updateAvailable: currentVersion !== latestVersion,
      hasActiveUpdates: Boolean(licenseState.hasActiveUpdates),
      changelog,
      scheduledNightTime: "03:30 ص",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to check updates";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
