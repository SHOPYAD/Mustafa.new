import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { verifyMarketingSmtp } from "@/lib/server/email/marketing-smtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const result = await verifyMarketingSmtp();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "خطأ أثناء فحص اتصال خادم البريد";
    return NextResponse.json({ ok: false, message: "فشل التحقق من اتصال SMTP", error: errorMsg }, { status: 500 });
  }
}
