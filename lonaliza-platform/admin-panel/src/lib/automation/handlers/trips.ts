import { writeJobTopics } from "@/lib/automation/content/artifacts";
import { packFor } from "@/lib/automation/content/catalog";
import { discoverRankedTopics } from "@/lib/automation/content/discover";
import { resolveArticlePhotos } from "@/lib/automation/content/images";
import {
  readContentSettings,
  shouldPublishNow,
} from "@/lib/automation/content/settings";
import { upsertPublishedPackage } from "@/lib/server/packages-store";
import type {
  AutomationJob,
  AutomationJobContext,
  ContentJobResult,
} from "@/lib/automation/types";

function jobIdOf(job: Partial<AutomationJob>): string {
  return String(job.id || `trips-${Date.now().toString(36)}`);
}

export async function runTripsResearchAndDraft(
  job: Partial<AutomationJob>,
  ctx: AutomationJobContext = {}
): Promise<ContentJobResult> {
  const settings = readContentSettings(job, ctx);
  const now = ctx.now || new Date();
  const logs: string[] = [];
  const limitations: string[] = [];
  const jobId = jobIdOf(job);

  const discovered = await discoverRankedTopics({
    sources: settings.sources,
    now,
    log: (m) => {
      logs.push(m);
      ctx.log?.(m);
    },
  });
  limitations.push(...discovered.meta.limitations);
  const topics = discovered.topics.filter((t) =>
    ["istanbul", "antalya", "trabzon", "cappadocia", "bursa", "sapanca", "bodrum", "izmir"].includes(
      t.destination
    )
  );
  const topicsPath = await writeJobTopics({ jobId, topics });
  const selected = (topics.length ? topics : discovered.topics).slice(0, settings.count);
  const produced: ContentJobResult["produced"] = [];
  const publish = shouldPublishNow({
    autoPublish: settings.autoPublish,
    draft: settings.draft,
    publishAt: settings.publishAt,
    now,
  });

  for (const topic of selected) {
    const pack = packFor(topic.destination);
    const photos = await resolveArticlePhotos({
      topic,
      provider: settings.imageProvider,
      dryRun: settings.dryRun,
    });
    limitations.push(...photos.limitations);
    const image = photos.photos[0];
    const titleAr = `رحلة ${pack?.nameAr || "تركيا"} — ${topic.angle}`;
    const titleEn = `${pack?.nameEn || "Turkey"} trip — ${topic.angle}`;
    const slug = `auto-trip-${topic.destination}-${Date.now().toString(36)}`;

    if (settings.dryRun) {
      produced.push({
        kind: "trip",
        slug,
        title: titleAr,
        status: "dry-run",
        path: topicsPath,
      });
      continue;
    }

    const pkg = await upsertPublishedPackage({
      slug,
      title: titleEn,
      titleAr,
      titleEn,
      destination: pack?.nameEn || "Turkey",
      destinationAr: pack?.nameAr || "تركيا",
      destinationEn: pack?.nameEn || "Turkey",
      country: "Turkey",
      countryAr: "تركيا",
      durationDays: topic.destination === "istanbul" ? 5 : 4,
      price: 0,
      currency: "USD",
      images: [
        {
          url: image?.localUrl || image?.url || pack?.catalogPhoto || "",
          alt: titleAr,
          width: 1600,
          height: 900,
        },
      ],
      amenities: ["استقبال المطار", "إفطار", "سيارة خاصة"],
      amenitiesAr: ["استقبال المطار", "إفطار", "سيارة خاصة"],
      isFeatured: false,
      isPublished: publish,
      descriptionAr: `مسودة تلقائية من أتمتة المحتوى بناءً على اهتمام بحثي: ${topic.titleAr}. راجع التفاصيل والأسعار قبل النشر.`,
      descriptionEn: `Auto draft from content research: ${topic.titleEn}. Review before publishing.`,
    });
    produced.push({
      kind: "trip",
      id: pkg.id,
      slug: pkg.slug,
      title: titleAr,
      status: pkg.isPublished === false ? "draft" : publish ? "published" : "draft",
      path: `/package/${pkg.slug}`,
    });
    logs.push(`مسودة رحلة ${pkg.slug} نشر=${Boolean(pkg.isPublished)}`);
  }

  const result: ContentJobResult = {
    ok: true,
    handler: "runTripsResearchAndDraft",
    dryRun: settings.dryRun,
    topics: discovered.topics,
    produced,
    artifacts: { topicsPath },
    logs,
    limitations,
    sourcesUsed: discovered.meta.sourcesUsed,
  };
  await ctx.storeResult?.(result);
  return result;
}
