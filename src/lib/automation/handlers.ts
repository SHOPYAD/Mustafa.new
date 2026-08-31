import type { AutomationJobContext, AutomationJobResult } from "./types";
import {
  discoverAndDraftActivities,
  discoverAndDraftPrograms,
  discoverAndDraftTrips,
  researchAndPublishArticles,
  scoreLeads,
  translateArticle,
  watchPrices,
} from "./interfaces/content";
import { runCtwaLookalike } from "./handlers/ads-audience";
import { runWeeklyAdminDigest } from "./handlers/digest";
import { runPlacesReviews } from "./handlers/places";
import {
  runStudioGenerateImage,
  runStudioGenerateVideo,
  runStudioSchedulePublish,
  runWeeklyStudioPlan,
} from "./handlers/studio";
import {
  sendAbandonedBookingReminder,
  sendBirthdayOffer,
  sendLeadEmailCampaign,
  sendLeadTelegramCampaign,
  sendLeadWhatsAppCampaign,
  sendOtp,
  sendPostTripReviewRequest,
  sendSeasonalCampaign,
  sendVisaAlert,
} from "./interfaces/comms";

export async function dispatchAutomationJob(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const type = ctx.job?.type;
  if (!type) {
    return { ok: false, processed: 0, message: "Missing job type", dryRun: Boolean(ctx.dryRun) };
  }
  switch (type) {
    case "articles.research_and_publish":
      return researchAndPublishArticles(ctx);
    case "trips.discover_and_draft":
      return discoverAndDraftTrips(ctx);
    case "programs.discover_and_draft":
      return discoverAndDraftPrograms(ctx);
    case "activities.discover_and_draft":
      return discoverAndDraftActivities(ctx);
    case "leads.email_campaign":
      return sendLeadEmailCampaign(ctx);
    case "leads.whatsapp_campaign":
      return sendLeadWhatsAppCampaign(ctx);
    case "leads.telegram_campaign":
      return sendLeadTelegramCampaign(ctx);
    case "otp.send":
      return sendOtp(ctx);
    case "booking.abandoned_reminder":
      return sendAbandonedBookingReminder(ctx);
    case "booking.post_trip_review":
      return sendPostTripReviewRequest(ctx);
    case "visa.alert":
      return sendVisaAlert(ctx);
    case "marketing.seasonal_campaign":
      return sendSeasonalCampaign(ctx);
    case "pricing.watch":
      return watchPrices(ctx);
    case "articles.translate":
      return translateArticle(ctx);
    case "marketing.birthday_offer":
      return sendBirthdayOffer(ctx);
    case "leads.score":
      return scoreLeads(ctx);
    case "studio.weekly_plan":
      return runWeeklyStudioPlan(ctx);
    case "studio.generate_image":
      return runStudioGenerateImage(ctx);
    case "studio.generate_video":
      return runStudioGenerateVideo(ctx);
    case "studio.schedule_publish":
      return runStudioSchedulePublish(ctx);
    case "admin.weekly_digest":
      return runWeeklyAdminDigest(ctx);
    case "places.reviews":
      return runPlacesReviews(ctx);
    case "ads.ctwa_lookalike":
      return runCtwaLookalike(ctx);
    default: {
      const _never: never = type;
      return {
        ok: false,
        processed: 0,
        message: `Unknown job type: ${String(_never)}`,
        dryRun: Boolean(ctx.dryRun),
      };
    }
  }
}
