import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { parseCsvAudienceFile } from "@/lib/email/parse-audience";
import { parseXlsxAudience } from "@/lib/server/email/parse-xlsx";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "ارفع ملفاً" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "الملف أكبر من 4MB" }, { status: 400 });
    }
    const name = file.name || "audience.csv";
    const lower = name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    if (lower.endsWith(".xls") && !lower.endsWith(".xlsx")) {
      return NextResponse.json(
        { ok: false, error: "صيغة ‎.xls القديمة غير مدعومة. احفظ الملف كـ CSV أو XLSX." },
        { status: 400 }
      );
    }
    const result = lower.endsWith(".xlsx")
      ? parseXlsxAudience(buffer, name)
      : parseCsvAudienceFile(buffer.toString("utf8"), name);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر قراءة الملف" },
      { status: 400 }
    );
  }
}
