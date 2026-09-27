import { writeDryRunArtifacts, writeJobTopics } from "@/lib/automation/content/artifacts";
import { writeOriginalArticle } from "@/lib/automation/content/article-writer";
import { saveBrandedCover } from "@/lib/automation/content/cover";
import { discoverRankedTopics } from "@/lib/automation/content/discover";
import { resolveArticlePhotos } from "@/lib/automation/content/images";
import { packFor } from "@/lib/automation/content/catalog";
import {
  readContentSettings,
  shouldPublishNow,
} from "@/lib/automation/content/settings";
import { upsertBlogPost } from "@/lib/server/blog-store";
import type {
  AutomationJob,
  AutomationJobContext,
  ContentJobResult,
  GeneratedArticle,
} from "@/lib/automation/types";

function jobIdOf(job: Partial<AutomationJob>): string {
  return String(job.id || `articles-${Date.now().toString(36)}`);
}

function pushLog(
  logs: string[],
  ctx: AutomationJobContext | undefined,
  message: string,
  extra?: Record<string, unknown>
) {
  logs.push(message);
  ctx?.log?.(message, extra);
}

export async function runArticlesResearchAndPublish(
  job: Partial<AutomationJob>,
  ctx: AutomationJobContext = {}
): Promise<ContentJobResult> {
  const settings = readContentSettings(job, ctx);
  const now = ctx.now || new Date();
  const logs: string[] = [];
  const limitations: string[] = [];
  const jobId = jobIdOf(job);

  pushLog(logs, ctx, `بدء أبحاث المقالات dryRun=${settings.dryRun} count=${settings.count}`);

  const discovered = await discoverRankedTopics({
    sources: settings.sources,
    now,
    log: (m) => pushLog(logs, ctx, m),
  });
  limitations.push(...discovered.meta.limitations);
  const topics = discovered.topics;
  const topicsPath = await writeJobTopics({ jobId, topics });
  await ctx.storeResult?.({ topics, sourcesUsed: discovered.meta.sourcesUsed });

  const selected = topics.slice(0, settings.count);
  const produced: ContentJobResult["produced"] = [];
  let lastArticle: GeneratedArticle | null = null;
  let dryArtifacts: ContentJobResult["artifacts"] | undefined;

  for (const topic of selected) {
    const photosRes = await resolveArticlePhotos({
      topic,
      provider: settings.imageProvider,
      dryRun: settings.dryRun,
      log: (m) => pushLog(logs, ctx, m),
    });
    limitations.push(...photosRes.limitations);

    const dest = packFor(topic.destination);
    const cover = await saveBrandedCover({
      titleAr: topic.titleAr,
      titleEn: topic.titleEn,
      destinationEn: dest?.nameEn || topic.destination,
      dryRun: settings.dryRun,
    });

    const article = await writeOriginalArticle({
      topic,
      locales: settings.locales,
      minWords: settings.minWords,
      now,
      photos: photosRes.photos,
      ogImage: cover.url,
    });
    lastArticle = article;

    if (article.wordCountAr < settings.minWords) {
      limitations.push(
        `عدد الكلمات العربية ${article.wordCountAr} أقل من الحد ${settings.minWords} — راجع القالب`
      );
    }

    if (settings.dryRun) {
      const files = await writeDryRunArtifacts({
        jobId,
        topics,
        article,
      });
      dryArtifacts = {
        dir: files.dir,
        topicsPath: files.topicsPath,
        articlePath: files.articlePath,
      };
      produced.push({
        kind: "article",
        slug: article.slug,
        title: article.titleAr,
        status: "dry-run",
        path: files.articlePath,
      });
      pushLog(logs, ctx, `تجربة جافة: ${files.articlePath}`);
      continue;
    }

    const publish = shouldPublishNow({
      autoPublish: settings.autoPublish,
      draft: settings.draft,
      publishAt: settings.publishAt,
      now,
    });
    const coverUrl =
      article.cover.localUrl || article.cover.url || cover.url;
    const post = await upsertBlogPost({
      slug: article.slug,
      titleAr: article.titleAr,
      titleEn: article.titleEn,
      excerptAr: article.excerptAr,
      excerptEn: article.excerptEn,
      contentAr: article.contentAr,
      contentEn: article.contentEn,
      coverImage: coverUrl,
      coverAlt: article.cover.alt,
      category: article.category,
      tags: article.tags,
      author: "Alrayyan Tourism",
      status: publish ? "published" : "draft",
      publishedAt: publish ? now.toISOString() : settings.publishAt,
      seo: {
        metaTitleAr: article.titleAr.slice(0, 70),
        metaTitleEn: article.titleEn.slice(0, 70),
        metaDescriptionAr: article.excerptAr.slice(0, 160),
        metaDescriptionEn: article.excerptEn.slice(0, 160),
        focusKeyword: dest?.nameAr || "تركيا",
        ogImage: article.ogImage || coverUrl,
      },
    });
    produced.push({
      kind: "article",
      id: post.id,
      slug: post.slug,
      title: post.titleAr,
      status: post.status,
      path: `/blog/${post.slug}`,
    });
    pushLog(logs, ctx, `حُفظ المقال ${post.slug} كـ ${post.status}`);
  }

  if (settings.dryRun && lastArticle && !dryArtifacts) {
    dryArtifacts = {
      topicsPath,
    };
  }

  const result: ContentJobResult = {
    ok: true,
    handler: "runArticlesResearchAndPublish",
    dryRun: settings.dryRun,
    topics,
    produced,
    artifacts: dryArtifacts || { topicsPath },
    logs,
    limitations,
    sourcesUsed: discovered.meta.sourcesUsed,
  };
  await ctx.storeResult?.(result);
  return result;
}
