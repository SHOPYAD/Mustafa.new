import { writeJobTopics } from "@/lib/automation/content/artifacts";
import { packFor } from "@/lib/automation/content/catalog";
import { discoverRankedTopics } from "@/lib/automation/content/discover";
import { resolveArticlePhotos } from "@/lib/automation/content/images";
import {
  readContentSettings,
  shouldPublishNow,
} from "@/lib/automation/content/settings";
import { saveAiProgram, setAiProgramHidden } from "@/lib/server/ai-programs-store";
import { publishAiProgramToCatalog } from "@/lib/server/packages-store";
import type {
  AutomationJob,
  AutomationJobContext,
  ContentJobResult,
} from "@/lib/automation/types";

function jobIdOf(job: Partial<AutomationJob>): string {
  return String(job.id || `programs-${Date.now().toString(36)}`);
}

export async function runProgramsResearchAndDraft(
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
    const dest = pack?.nameEn || "Turkey";
    const photos = await resolveArticlePhotos({
      topic,
      provider: settings.imageProvider,
      dryRun: settings.dryRun,
    });
    limitations.push(...photos.limitations);
    const thumb = photos.photos[0]?.localUrl || photos.photos[0]?.url || pack?.catalogPhoto;

    if (settings.dryRun) {
      produced.push({
        kind: "program",
        title: topic.titleAr,
        status: "dry-run",
        path: topicsPath,
      });
      continue;
    }

    const { program } = await saveAiProgram({
      titleAr: `برنامج ${pack?.nameAr || "تركيا"} — مسودة أتمتة`,
      titleEn: `${dest} program — automation draft`,
      destination: dest,
      nights: 4,
      people: 2,
      priceFromUsd: 0,
      thumbnail: thumb,
      includesAr: ["إقامة فندقية", "إفطار", "استقبال المطار", "تنقلات البرنامج"],
      includesEn: ["Hotel stay", "Breakfast", "Airport pickup", "Program transfers"],
      itinerary: {
        titleAr: topic.titleAr,
        titleEn: topic.titleEn,
        days: [
          {
            day: 1,
            titleAr: `وصول ${pack?.nameAr || "تركيا"}`,
            titleEn: `Arrival in ${dest}`,
            detailAr: "استقبال وانتقال للفندق وراحة.",
            detailEn: "Meet and transfer to the hotel, then rest.",
          },
          {
            day: 2,
            titleAr: "جولة رئيسية",
            titleEn: "Main touring day",
            detailAr: `يوم مشاهد في ${pack?.nameAr || "الوجهة"} بإيقاع هادئ.`,
            detailEn: `A paced sightseeing day in ${dest}.`,
          },
          {
            day: 3,
            titleAr: "يوم حر أو طبيعة",
            titleEn: "Free or nature day",
            detailAr: "يوم مرن حسب الطقس ورغبة العائلة.",
            detailEn: "Flexible day by weather and family pace.",
          },
          {
            day: 4,
            titleAr: "مغادرة",
            titleEn: "Departure",
            detailAr: "توديع المطار حسب توقيت الرحلة.",
            detailEn: "Airport drop-off by flight time.",
          },
        ],
        totalBasePrice: 0,
        totalClientPrice: 0,
        currency: "USD",
      },
    });

    if (!live) {
      await setAiProgramHidden(program.id, true);
    } else {
      await publishAiProgramToCatalog(program);
    }

    produced.push({
      kind: "program",
      id: program.id,
      title: program.titleAr,
      status: live ? "published" : "draft",
      path: `/admin/ai-programs`,
    });
    logs.push(`برنامج ${program.id} hidden=${!live}`);
  }

  const result: ContentJobResult = {
    ok: true,
    handler: "runProgramsResearchAndDraft",
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
