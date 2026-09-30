import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import {
  getMarketingEmailSettings,
  saveMarketingEmailSettings,
  getEmailLogs,
} from "@/lib/server/email/marketing-smtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const settings = getMarketingEmailSettings();
    const logs = getEmailLogs();
    return NextResponse.json({
      ok: true,
      settings: {
        ...settings,
        password: settings.password ? "••••••••" : "",
      },
      logs,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading settings";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const saved = saveMarketingEmailSettings(body);
    return NextResponse.json({
      ok: true,
      message: "تم حفظ إعدادات خادم البريد SMTP بنجاح",
      settings: {
        ...saved,
        password: saved.password ? "••••••••" : "",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error saving settings";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
