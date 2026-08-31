import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { addCustomLanguage } from "@/lib/server/translations-store";
import {
  GEMINI_MISSING_AR,
  requireGeminiForTranslations,
} from "@/lib/server/gemini-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const gemini = await requireGeminiForTranslations();
    const body = (await req.json()) as {
      code?: string;
      name?: string;
      nativeName?: string;
      dir?: "rtl" | "ltr";
      sourceLocale?: "ar" | "en";
      skipGeminiCheck?: boolean;
    };

    if (!gemini.ok && !body.skipGeminiCheck) {
      return NextResponse.json(
        { ok: false, error: gemini.error || GEMINI_MISSING_AR, hasGeminiKey: false },
        { status: 400 }
      );
    }

    const result = await addCustomLanguage({
      code: String(body.code || ""),
      name: String(body.name || ""),
      nativeName: String(body.nativeName || body.name || ""),
      dir: body.dir,
      sourceLocale: body.sourceLocale,
    });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, hasGeminiKey: gemini.ok },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      language: result.language,
      keyCount: result.keyCount,
      hasGeminiKey: gemini.ok,
      model: gemini.ok ? gemini.model : null,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "فشل إضافة اللغة",
      },
      { status: 500 }
    );
  }
}
