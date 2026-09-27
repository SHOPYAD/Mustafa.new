import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { triggerParasutEArchiveIssue } from "@/lib/server/parasut/parasut-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const bookingId = String(body.bookingId || "").trim();

    if (!bookingId) {
      return NextResponse.json({ ok: false, error: "bookingId is required" }, { status: 400 });
    }

    const result = await triggerParasutEArchiveIssue(bookingId);
    if (!result) {
      return NextResponse.json({ ok: false, error: "فشل إصدار الفاتورة أو الخدمة غير مفعلة" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, invoice: result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
