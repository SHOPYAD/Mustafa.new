import { writeJobTopics } from "@/lib/automation/content/artifacts";
import { packFor } from "@/lib/automation/content/catalog";
import { discoverRankedTopics } from "@/lib/automation/content/discover";
import { resolveArticlePhotos } from "@/lib/automation/content/images";
import {
  readContentSettings,
  shouldPublishNow,
} from "@/lib/automation/content/settings";
import { upsertTour } from "@/lib/server/tours-store";
import type {
  AutomationJob,
  AutomationJobContext,
  ContentJobResult,
} from "@/lib/automation/types";

function jobIdOf(job: Partial<AutomationJob>): string {
  return String(job.id || `activities-${Date.now().toString(36)}`);
}

export async function runActivitiesResearchAndDraft(
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
  const topicsPath = await writeJobTopics({ jobId, topics: discovered.topics });
  const selected = discovered.topics.slice(0, settings.count);
  const produced: ContentJobResult["produced"] = [];
  const live = shouldPublishNow({
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
    const title = `نشاط ${pack?.nameAr || "تركيا"} — ${topic.angle}`;

    if (settings.dryRun) {
      produced.push({
        kind: "activity",
        title,
        status: "dry-run",
        path: topicsPath,
      });
      continue;
    }

    const tour = await upsertTour({
      title,
      image: photos.photos[0]?.localUrl || photos.photos[0]?.url || pack?.catalogPhoto || "",
      duration: "8 hours",
      timing: "morning",
      rating: 4.8,
      reviewCount: 0,
      price: 0,
      highlights: [
        pack?.nameAr || "تركيا",
        "مسودة أتمتة — راجع قبل التفعيل",
        topic.titleAr.slice(0, 80),
      ],
      category: pack?.nameEn || "Turkey",
      popular: false,
      isActive: live,
    });
    produced.push({
      kind: "activity",
      id: tour.id,
      title: tour.title,
      status: tour.isActive ? "published" : "draft",
      path: "/admin/tours",
    });
    logs.push(`نشاط ${tour.id} isActive=${Boolean(tour.isActive)}`);
  }

  const result: ContentJobResult = {
    ok: true,
    handler: "runActivitiesResearchAndDraft",
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
