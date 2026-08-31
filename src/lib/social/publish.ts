import { assertPublishRateLimit, SocialHttpError } from "./http";
import { sanitizeMediaUrls } from "./media";
import { findConnectedAccount } from "./token-store";
import { mapUnknownError, notApprovedError, publishError } from "./errors";
import { publishFacebook, publishInstagram } from "./platforms/meta";
import { publishYoutube } from "./platforms/youtube";
import { publishTikTok, TIKTOK_APP_REQUIRED, tiktokConfigured } from "./platforms/tiktok";
import { publishX } from "./platforms/x";
import { recordPublishedPosts } from "./published";
import {
  SOCIAL_PLATFORMS,
  type PublishPlatformResult,
  type PublishToConnectedAccountsInput,
  type PublishToConnectedAccountsResult,
  type SocialPlatform,
  type StoredSocialAccount,
} from "./types";

function isPlatform(value: unknown): value is SocialPlatform {
  return (
    typeof value === "string" &&
    (SOCIAL_PLATFORMS as readonly string[]).includes(value)
  );
}

function uniquePlatforms(values: unknown): SocialPlatform[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<SocialPlatform>();
  for (const value of values) {
    if (isPlatform(value) && !seen.has(value)) seen.add(value);
  }
  return [...seen];
}

function failAll(
  platforms: SocialPlatform[],
  error: ReturnType<typeof publishError>
): PublishToConnectedAccountsResult {
  return {
    ok: false,
    results: platforms.map((platform) => ({ ok: false, platform, error })),
  };
}

async function publishOne(
  platform: SocialPlatform,
  account: StoredSocialAccount,
  input: PublishToConnectedAccountsInput
): Promise<PublishPlatformResult> {
  switch (platform) {
    case "facebook":
      return publishFacebook(account, input);
    case "instagram":
      return publishInstagram(account, input);
    case "youtube":
      return publishYoutube(account, input);
    case "tiktok":
      return publishTikTok(account, input);
    case "x":
      return publishX(account, input);
    default: {
      const _never: never = platform;
      return {
        ok: false,
        platform: _never,
        error: publishError("invalid_input", "منصة غير معروفة"),
      };
    }
  }
}

/**
 * Organic publish after STUDIO/CREATIVE/ADS approval.
 * Does nothing unless `approved === true`. Never creates ad campaigns.
 */
export async function publishToConnectedAccounts(
  input: PublishToConnectedAccountsInput
): Promise<PublishToConnectedAccountsResult> {
  const platforms = uniquePlatforms(input?.platforms);
  if (platforms.length === 0) {
    return {
      ok: false,
      results: [
        {
          ok: false,
          platform: "facebook",
          error: publishError(
            "invalid_input",
            "platforms يجب أن تحتوي facebook و/أو instagram و/أو youtube و/أو tiktok و/أو x"
          ),
        },
      ],
    };
  }

  if (input?.approved !== true) {
    return failAll(platforms, notApprovedError());
  }

  const caption = String(input.caption ?? "").trim();
  const mediaUrls = sanitizeMediaUrls(input.mediaUrls || []);
  if (!caption && mediaUrls.length === 0) {
    return failAll(
      platforms,
      publishError("invalid_input", "caption أو mediaUrls مطلوبة")
    );
  }

  const normalized: PublishToConnectedAccountsInput = {
    approved: true,
    platforms,
    mediaUrls,
    caption,
    title: input.title?.trim() || undefined,
  };

  const results: PublishPlatformResult[] = [];
  for (const platform of platforms) {
    if (platform === "tiktok" && !(await tiktokConfigured())) {
      results.push({ ok: false, platform, error: TIKTOK_APP_REQUIRED });
      continue;
    }

    const account = await findConnectedAccount(platform);
    if (!account) {
      results.push({
        ok: false,
        platform,
        error: publishError(
          "not_connected",
          `لا يوجد حساب ${platform} متصل. اربطه من /admin/social-accounts`
        ),
      });
      continue;
    }
    if (account.status === "needs_reauth") {
      results.push({
        ok: false,
        platform,
        error: publishError(
          "needs_reauth",
          account.lastError || "الحساب يحتاج إعادة تحقق"
        ),
      });
      continue;
    }

    try {
      assertPublishRateLimit(platform);
      results.push(await publishOne(platform, account, normalized));
    } catch (err) {
      const mapped = mapUnknownError(platform, err);
      if (err instanceof SocialHttpError && err.status === 429) {
        results.push({
          ok: false,
          platform,
          error: { ...mapped, code: "rate_limited" },
        });
        continue;
      }
      results.push({ ok: false, platform, error: mapped });
    }
  }

  const summary = {
    ok: results.every((row) => row.ok),
    results,
  };
  await recordPublishedPosts(summary);
  return summary;
}
