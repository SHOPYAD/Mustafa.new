/**
 * AUTO-CONTENT handlers. AUTO-CORE should import from this barrel.
 *
 *   import {
 *     runArticlesResearchAndPublish,
 *     runTripsResearchAndDraft,
 *     runProgramsResearchAndDraft,
 *     runActivitiesResearchAndDraft,
 *   } from "@/lib/automation/handlers";
 *
 * Job settings (job.settings or job.config):
 *   sources, locales, autoPublish, imageProvider, minWords, count, publishAt, dryRun, draft
 *
 * Articles publish into the existing blog store (`.data/blog-posts.json`) → `/blog`.
 * Trips draft into packages-store. Programs draft into ai-programs-store (hidden unless autoPublish).
 * Activities draft into tours-store (isActive only if autoPublish).
 */

export { runArticlesResearchAndPublish } from "@/lib/automation/handlers/articles";
export { runTripsResearchAndDraft } from "@/lib/automation/handlers/trips";
export { runProgramsResearchAndDraft } from "@/lib/automation/handlers/programs";
export { runActivitiesResearchAndDraft } from "@/lib/automation/handlers/activities";
export { readContentSettings, DEFAULT_CONTENT_SETTINGS } from "@/lib/automation/content/settings";
export type {
  AutomationJob,
  AutomationJobContext,
  ContentJobResult,
  ContentJobSettings,
} from "@/lib/automation/types";
