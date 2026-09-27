import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import {
  getTranslationCatalog,
  saveTranslationValues,
} from "@/lib/server/translations-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const [{ apiKey }, catalog] = await Promise.all([
      resolveGeminiApiKey(),
      getTranslationCatalog(),
    ]);
    return NextResponse.json(
      {
        ok: true,
        hasGeminiKey: Boolean(apiKey),
        ...catalog,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "تعذّر تحميل كتالوج الترجمات." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      locale?: string;
      key?: string;
      value?: string;
      updates?: Record<string, string>;
    };
    const locale = String(body.locale || "").trim();
    const updates: Record<string, string> = { ...(body.updates || {}) };
    if (body.key) updates[body.key] = String(body.value ?? "");
    const result = await saveTranslationValues(locale, updates);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "فشل حفظ الترجمة",
      },
      { status: 500 }
    );
  }
}
