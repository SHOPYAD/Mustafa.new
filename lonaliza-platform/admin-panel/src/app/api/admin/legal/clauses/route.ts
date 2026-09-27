import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { addOrUpdateClause } from "@/lib/server/legal-store";
import type { LegalCustomClause } from "@/types/legal-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const clauseData = (await req.json()) as LegalCustomClause;
    if (!clauseData.titleAr && !clauseData.titleEn) {
      return NextResponse.json(
        { ok: false, error: "عنوان البند / القانون مطلوب على الأقل بإحدى اللغات" },
        { status: 400 }
      );
    }

    const saved = await addOrUpdateClause(clauseData);
    return NextResponse.json({ ok: true, clause: saved });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to save clause" },
      { status: 500 }
    );
  }
}
