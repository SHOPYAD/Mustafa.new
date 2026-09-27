import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getCustomLanguage,
  getLanguageBatch,
  getLanguageProgress,
  saveTranslationValues,
} from "@/lib/server/translations-store";
import {
  classifyTranslateError,
  GEMINI_MISSING_AR,
  requireGeminiForTranslations,
  translateUiBatch,
} from "@/lib/server/gemini-translate";
import type { TranslationScope } from "@/lib/i18n/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const gemini = await requireGeminiForTranslations();
  if (!gemini.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: gemini.error || GEMINI_MISSING_AR,
        code: "auth",
        hasGeminiKey: false,
      },
      { status: 400 }
    );
  }

  try {
    const body = (await req.json()) as {
      code?: string;
      sourceLocale?: "ar" | "en";
      offset?: number;
      limit?: number;
      scope?: TranslationScope | "all";
      missingOnly?: boolean;
    };
    const code = String(body.code || "").trim().toLowerCase();
    const language = await getCustomLanguage(code);
    if (!language) {
      return NextResponse.json(
        { ok: false, error: "اللغة غير موجودة. أضفها أولاً.", code: "unknown" },
        { status: 400 }
      );
    }

    const sourceLocale =
      body.sourceLocale === "ar" || body.sourceLocale === "en"
        ? body.sourceLocale
        : language.sourceLocale;
    const offset = Number(body.offset) || 0;
    const limit = Math.min(40, Math.max(8, Number(body.limit) || 20));
    const scope =
      body.scope === "site" || body.scope === "admin" ? body.scope : "all";
    const missingOnly = body.missingOnly !== false;

    const batch = await getLanguageBatch(
      code,
      sourceLocale,
      offset,
      limit,
      scope,
      missingOnly
    );

    if (!batch.entries.length) {
      const progress = await getLanguageProgress(code);
      return NextResponse.json({
        ok: true,
        hasGeminiKey: true,
        translated: 0,
        filled: progress.filled,
        remaining: 0,
        total: progress.total,
        offset: 0,
        nextOffset: 0,
        limit: batch.limit,
        done: true,
        progress: 100,
      });
    }

    const translatableEntries = batch.entries.filter((e) => e.text.trim());
    if (!translatableEntries.length) {
      const progress = await getLanguageProgress(code);
      return NextResponse.json({
        ok: true,
        hasGeminiKey: true,
        translated: 0,
        filled: progress.filled,
        remaining: 0,
        total: progress.total,
        offset: 0,
        nextOffset: 0,
        limit: batch.limit,
        done: true,
        progress: 100,
      });
    }

    const result = await translateUiBatch({
      apiKey: gemini.apiKey,
      model: gemini.model,
      sourceLocale,
      targetCode: language.code,
      targetName: language.name,
      entries: translatableEntries,
      retries: 2,
    });

    if (result.ok && Object.keys(result.translations).length) {
      await saveTranslationValues(code, result.translations);
    }

    const progress = await getLanguageProgress(code);

    if (!result.ok) {
      const leftover = progress.missing <= 2;
      return NextResponse.json(
        {
          ok: leftover,
          error: leftover ? undefined : result.error,
          code: leftover ? undefined : result.code,
          hasGeminiKey: true,
          filled: progress.filled,
          remaining: leftover ? 0 : progress.missing,
          total: progress.total,
          offset: batch.offset,
          nextOffset: leftover ? 0 : batch.offset,
          limit: batch.limit,
          done: leftover,
          progress: leftover
            ? 100
            : progress.total
              ? Math.round((progress.filled / progress.total) * 100)
              : 0,
        },
        leftover ? { status: 200 } : { status: 400 }
      );
    }

    const done = progress.missing === 0;
    return NextResponse.json({
      ok: true,
      hasGeminiKey: true,
      translated: Object.keys(result.translations).length,
      filled: progress.filled,
      remaining: progress.missing,
      offset: batch.offset,
      nextOffset: 0,
      limit: batch.limit,
      total: progress.total,
      done,
      progress: progress.total
        ? Math.min(100, Math.round((progress.filled / progress.total) * 100))
        : 100,
    });
  } catch (e) {
    const classified = classifyTranslateError(
      500,
      e instanceof Error ? e.message : ""
    );
    return NextResponse.json(
      {
        ok: false,
        code: classified.code,
        error: classified.messageAr,
      },
      { status: 500 }
    );
  }
}
