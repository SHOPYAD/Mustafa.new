import { launchAds } from "@/lib/ads/launch";
import { siteOrigin } from "@/lib/automation/site-url";
import { readStudioLastOutput } from "@/lib/studio/last-output";
import { publishToConnectedAccounts } from "@/lib/social/publish";
import { recordPublishedPosts } from "@/lib/social/published";
import {
  SOCIAL_PLATFORMS,
  type PublishToConnectedAccountsResult,
  type SocialPlatform,
} from "@/lib/social/types";

function isPlatform(value: unknown): value is SocialPlatform {
  return typeof value === "string" && (SOCIAL_PLATFORMS as readonly string[]).includes(value);
}

function toAbsolute(url: string, origin: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function publishApprovedStudio(input: {
  caption?: string;
  approved: boolean;
  platforms?: string[];
  budget?: number;
  boost?: boolean;
}): Promise<PublishToConnectedAccountsResult & { boost?: unknown }> {
  if (input.approved !== true) {
    return publishToConnectedAccounts({
      approved: false,
      platforms: ["facebook"],
      mediaUrls: [],
      caption: input.caption || "",
    });
  }
  const last = await readStudioLastOutput();
  const origin = siteOrigin();
  const mediaUrls = [...(last?.imageUrls || []), ...(last?.videoUrls || [])]
    .map((url) => toAbsolute(url, origin))
    .filter(Boolean);
  const platforms = (input.platforms?.length ? input.platforms : last?.platforms || []).filter(isPlatform);
  const resolved = platforms.length ? platforms : (["facebook", "instagram"] as SocialPlatform[]);
  const result = await publishToConnectedAccounts({
    approved: true,
    platforms: resolved,
    mediaUrls,
    caption: input.caption || last?.caption || "الريان للسياحة",
    title: input.caption || last?.caption,
  });
  await recordPublishedPosts(result);

  let boost: unknown;
  if (input.boost && input.budget && input.budget > 0) {
    const facebook = result.results.find((row) => row.platform === "facebook" && row.ok);
    boost = await launchAds({
      approved: true,
      dryRun: false,
      platforms: ["meta"],
      name: input.caption || "تعزيز منشور الريان",
      landingUrl: `${origin}/`,
      dailyBudget: input.budget,
      metaCreative: "boost",
      postId: facebook && facebook.ok ? facebook.postId : undefined,
      permalink: facebook && facebook.ok ? facebook.permalink : undefined,
    });
  }
  return { ...result, boost };
}
