import {
  getCustomLanguage,
  getLanguageBatch,
  getLanguageProgress,
  saveTranslationValues,
} from "@/lib/server/translations-store";
import {
  requireGeminiForTranslations,
  translateUiBatch,
} from "@/lib/server/gemini-translate";

export async function resumeLanguageTranslation(code: string): Promise<{
  ok: boolean;
  filled: number;
  total: number;
  remaining: number;
  error?: string;
}> {
  const language = await getCustomLanguage(code);
  if (!language) {
    return { ok: false, filled: 0, total: 0, remaining: 0, error: "اللغة غير موجودة." };
  }
  const gemini = await requireGeminiForTranslations();
  if (!gemini.ok) {
    const progress = await getLanguageProgress(code);
    return { ...progress, ok: false, remaining: progress.missing, error: gemini.error };
  }

  for (;;) {
    const progress = await getLanguageProgress(code);
    if (progress.missing === 0) {
      return { ok: true, filled: progress.filled, total: progress.total, remaining: 0 };
    }
    const batch = await getLanguageBatch(
      code,
      language.sourceLocale,
      0,
      20,
      "all",
      true
    );
    if (!batch.entries.length) {
      return {
        ok: true,
        filled: progress.filled,
        total: progress.total,
        remaining: 0,
      };
    }
    const result = await translateUiBatch({
      apiKey: gemini.apiKey,
      model: gemini.model,
      sourceLocale: language.sourceLocale,
      targetCode: language.code,
      targetName: language.name,
      entries: batch.entries,
      retries: 3,
    });
    if (!result.ok) {
      const after = await getLanguageProgress(code);
      return {
        ok: false,
        filled: after.filled,
        total: after.total,
        remaining: after.missing,
        error: result.error,
      };
    }
    if (Object.keys(result.translations).length) {
      await saveTranslationValues(code, result.translations);
    }
  }
}
