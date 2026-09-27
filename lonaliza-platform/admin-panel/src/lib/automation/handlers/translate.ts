import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiPublicConfig, resolveGeminiApiKey } from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import { getBlogPostById, listBlogPosts, updateBlogPost } from "@/lib/server/blog-store";
import type { AutomationJobContext, AutomationJobResult } from "@/lib/automation/types";
import type { BlogPost } from "@/types/blog";

function looksTranslated(text: string): boolean {
  return String(text || "").replace(/<[^>]+>/g, " ").trim().length >= 40;
}

function pickTargets(post: BlogPost): Array<"en" | "ar"> {
  const targets: Array<"en" | "ar"> = [];
  if (looksTranslated(post.contentAr) && !looksTranslated(post.contentEn)) targets.push("en");
  if (looksTranslated(post.contentEn) && !looksTranslated(post.contentAr)) targets.push("ar");
  return targets;
}

async function translateHtml(
  apiKey: string,
  model: string,
  html: string,
  title: string,
  target: "en" | "ar"
): Promise<{ title: string; excerpt: string; content: string } | null> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const generative = genAI.getGenerativeModel({
    model,
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
  });
  const lang = target === "en" ? "English" : "Arabic";
  const result = await generative.generateContent(
    `Translate this tourism article for Alrayyan / LIOTRIP. Keep HTML tags. Do not invent prices or personal contacts. Return JSON {title, excerpt, content}.
Target language: ${lang}
Title: ${title}
HTML:
${html.slice(0, 24000)}`
  );
  const text = result.response.text();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  const parsed = JSON.parse(text.slice(start, end + 1)) as {
    title?: string;
    excerpt?: string;
    content?: string;
  };
  if (!parsed.content) return null;
  return {
    title: String(parsed.title || title).trim(),
    excerpt: String(parsed.excerpt || "").trim().slice(0, 240),
    content: String(parsed.content),
  };
}

export async function runTranslateArticles(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const dryRun = Boolean(ctx.dryRun);
  const max = ctx.maxPerRun || 3;
  const settings = { ...(ctx.job?.settings || {}), ...(ctx.job?.payload || {}) };
  const explicitId = String(settings.articleId || settings.postId || "").trim();
  const posts = explicitId
    ? ([await getBlogPostById(explicitId)].filter(Boolean) as BlogPost[])
    : await listBlogPosts();
  const work = posts
    .map((post) => ({ post, targets: pickTargets(post) }))
    .filter((row) => row.targets.length)
    .slice(0, max);

  if (!work.length) {
    return {
      ok: true,
      processed: 0,
      skipped: posts.length,
      message: "لا مقالات ناقصة ترجمة بين العربية والإنجليزية.",
      dryRun,
    };
  }

  if (dryRun) {
    return {
      ok: true,
      processed: 0,
      skipped: work.length,
      message: `تجريبي: ${work.length} مقال سيُترجم ويبقى مسودة.`,
      dryRun: true,
      details: { slugs: work.map((row) => row.post.slug) },
    };
  }

  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      processed: 0,
      message: "مفتاح Gemini غير مُعدّ للترجمة.",
      dryRun,
    };
  }
  const config = await getGeminiPublicConfig();
  const model = normalizeGeminiModelId(config.model);
  let processed = 0;
  const produced: string[] = [];

  for (const row of work) {
    for (const target of row.targets) {
      const sourceHtml = target === "en" ? row.post.contentAr : row.post.contentEn;
      const sourceTitle = target === "en" ? row.post.titleAr : row.post.titleEn;
      try {
        const translated = await translateHtml(apiKey, model, sourceHtml, sourceTitle, target);
        if (!translated) continue;
        const patch =
          target === "en"
            ? {
                titleEn: translated.title,
                excerptEn: translated.excerpt || row.post.excerptEn,
                contentEn: translated.content,
                status: "draft" as const,
              }
            : {
                titleAr: translated.title,
                excerptAr: translated.excerpt || row.post.excerptAr,
                contentAr: translated.content,
                status: "draft" as const,
              };
        await updateBlogPost(row.post.id, patch);
        processed += 1;
        produced.push(`${row.post.slug}:${target}`);
        ctx.log?.("article.translated", { id: row.post.id, target });
      } catch (error) {
        ctx.log?.("article.translate_failed", {
          id: row.post.id,
          error: error instanceof Error ? error.message : "failed",
        });
      }
    }
  }

  return {
    ok: processed > 0,
    processed,
    message: processed
      ? `تُرجم ${processed} حقل وحُفظ كمسودة.`
      : "تعذّرت الترجمة.",
    dryRun,
    details: { produced },
  };
}
