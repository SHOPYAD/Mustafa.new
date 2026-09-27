/**
 * AUTO-CONTENT contract — AUTO-CORE calls these names.
 * Implementations live in src/lib/automation/handlers/{articles,trips,programs,activities}.ts
 */

import { runActivitiesResearchAndDraft } from "@/lib/automation/handlers/activities";
import { runArticlesResearchAndPublish } from "@/lib/automation/handlers/articles";
import { runProgramsResearchAndDraft } from "@/lib/automation/handlers/programs";
import { runTranslateArticles } from "@/lib/automation/handlers/translate";
import { runTripsResearchAndDraft } from "@/lib/automation/handlers/trips";
import type { AutomationJobContext, AutomationJobResult, ContentJobResult } from "../types";

function fromContent(result: ContentJobResult, fallback: string): AutomationJobResult {
  return {
    ok: result.ok,
    processed: result.produced?.length || 0,
    message: result.logs?.slice(-1)[0] || fallback,
    dryRun: result.dryRun,
    details: {
      handler: result.handler,
      limitations: result.limitations,
      sourcesUsed: result.sourcesUsed,
    },
  };
}

function stub(name: string, ctx: AutomationJobContext, extra?: string): AutomationJobResult {
  return {
    ok: true,
    processed: 0,
    skipped: ctx.maxPerRun || 0,
    message: extra || `[AUTO-CONTENT stub] ${name} (job ${ctx.job?.id || "unknown"})`,
    dryRun: Boolean(ctx.dryRun),
    details: { stub: true, owner: "AUTO-CONTENT", handler: name },
  };
}

function requireJob(ctx: AutomationJobContext) {
  if (!ctx.job) throw new Error("Missing automation job on context");
  return ctx.job;
}

export async function researchAndPublishArticles(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromContent(await runArticlesResearchAndPublish(requireJob(ctx), ctx), "articles.research_and_publish");
}

export async function discoverAndDraftTrips(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromContent(await runTripsResearchAndDraft(requireJob(ctx), ctx), "trips.discover_and_draft");
}

export async function discoverAndDraftPrograms(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromContent(await runProgramsResearchAndDraft(requireJob(ctx), ctx), "programs.discover_and_draft");
}

export async function discoverAndDraftActivities(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromContent(await runActivitiesResearchAndDraft(requireJob(ctx), ctx), "activities.discover_and_draft");
}

export async function translateArticle(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return runTranslateArticles(ctx);
}

export async function watchPrices(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return stub("watchPrices", ctx, "no-op price watch until catalog feeds are wired.");
}

export async function scoreLeads(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return stub("scoreLeads", ctx, "no-op lead scoring until CRM fields are wired.");
}
