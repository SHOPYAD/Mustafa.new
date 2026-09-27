/**
 * Wrappers around existing `src/lib/social/platforms/*`.
 * Does not change those modules' exports. Uses a short-lived shadow
 * token-store row (`pubch_*`) so refresh/publish can persist tokens,
 * then copies secrets back into the publish channel and removes the shadow.
 */

import { publishFacebook, publishInstagram, refreshMetaAccount } from "@/lib/social/platforms/meta";
import { publishTikTok, refreshTikTokAccount } from "@/lib/social/platforms/tiktok";
import { publishX, refreshXAccount } from "@/lib/social/platforms/x";
import { publishYoutube, refreshYoutubeAccount } from "@/lib/social/platforms/youtube";
import {
  getStoredAccount,
  removeStoredAccount,
  upsertStoredAccount,
} from "@/lib/social/token-store";
import { SOCIAL_PLATFORMS, type SocialPlatform, type StoredSocialAccount } from "@/lib/social/types";
import { persistDecryptedSecrets } from "../channels";
import { IMPLEMENTED_PROVIDERS, PROVIDER_LABEL_AR, PROVIDER_LABEL_EN, SHADOW_ACCOUNT_PREFIX } from "../constants";
import type { PublishContext, PublishProviderHandler, PublishProviderResult } from "../types";

function isSocialPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(value);
}

function shadowId(channelId: string): string {
  return `${SHADOW_ACCOUNT_PREFIX}${channelId}`;
}

function toStoredAccount(ctx: PublishContext): StoredSocialAccount | null {
  if (!isSocialPlatform(ctx.channel.provider)) return null;
  const extra = ctx.channel.extra || {};
  return {
    id: shadowId(ctx.channel.id),
    platform: ctx.channel.provider,
    displayName: ctx.channel.name,
    username: extra.username,
    externalId: extra.externalId || extra.pageId || ctx.channel.id,
    status: ctx.channel.refreshNeeded ? "needs_reauth" : "connected",
    scopes: extra.scopes || [],
    accessToken: ctx.accessToken,
    refreshToken: ctx.refreshToken,
    tokenExpiresAt: ctx.channel.tokenExpiresAt,
    pageAccessToken: ctx.pageAccessToken,
    pageId: extra.pageId,
    instagramUserId: extra.instagramUserId,
    connectedAt: new Date().toISOString(),
  };
}

async function syncShadowBack(channelId: string): Promise<void> {
  const shadow = await getStoredAccount(shadowId(channelId));
  if (!shadow) return;
  await persistDecryptedSecrets(channelId, {
    accessToken: shadow.accessToken,
    refreshToken: shadow.refreshToken,
    pageAccessToken: shadow.pageAccessToken,
    tokenExpiresAt: shadow.tokenExpiresAt,
    extra: {
      externalId: shadow.externalId,
      username: shadow.username,
      pageId: shadow.pageId,
      instagramUserId: shadow.instagramUserId,
      scopes: shadow.scopes,
    },
    refreshNeeded: shadow.status === "needs_reauth",
  });
}

async function withShadow<T>(
  ctx: PublishContext,
  fn: (account: StoredSocialAccount) => Promise<T>
): Promise<T> {
  const account = toStoredAccount(ctx);
  if (!account) {
    throw new Error(`منصة غير مدعومة في المحوّل: ${ctx.channel.provider}`);
  }
  await upsertStoredAccount(account);
  try {
    return await fn(account);
  } finally {
    try {
      await syncShadowBack(ctx.channel.id);
    } catch {
      /* keep going */
    }
    try {
      await removeStoredAccount(account.id);
    } catch {
      /* shadow cleanup is best-effort */
    }
  }
}

function mapPlatformResult(
  provider: string,
  result: { ok: boolean; postId?: string; permalink?: string; error?: { code: string; message: string; retryable?: boolean } }
): PublishProviderResult {
  if (result.ok) {
    return {
      ok: true,
      provider,
      releaseId: result.postId,
      releaseURL: result.permalink,
    };
  }
  return {
    ok: false,
    provider,
    error: result.error || {
      code: "publish_failed",
      message: `فشل النشر على ${provider}`,
    },
  };
}

async function publishAdapted(
  ctx: PublishContext,
  fn: (
    account: StoredSocialAccount,
    input: {
      approved: true;
      platforms: SocialPlatform[];
      mediaUrls: string[];
      caption: string;
      title?: string;
    }
  ) => Promise<{
    ok: boolean;
    platform: SocialPlatform;
    postId?: string;
    permalink?: string;
    error?: { code: string; message: string; retryable?: boolean };
  }>
): Promise<PublishProviderResult> {
  if (!isSocialPlatform(ctx.channel.provider)) {
    return {
      ok: false,
      provider: ctx.channel.provider,
      error: { code: "invalid_input", message: "منصة غير معروفة" },
    };
  }
  const provider = ctx.channel.provider;
  try {
    const result = await withShadow(ctx, (account) =>
      fn(account, {
        approved: true,
        platforms: [provider],
        mediaUrls: ctx.mediaUrls,
        caption: ctx.caption,
        title: ctx.title,
      })
    );
    return mapPlatformResult(provider, result);
  } catch (err) {
    return {
      ok: false,
      provider,
      error: {
        code: "publish_failed",
        message: err instanceof Error ? err.message : `فشل النشر على ${provider}`,
        retryable: true,
      },
    };
  }
}

async function refreshAdapted(
  ctx: PublishContext,
  fn: (account: StoredSocialAccount) => Promise<StoredSocialAccount>
): Promise<{
  accessToken?: string;
  refreshToken?: string;
  pageAccessToken?: string;
  tokenExpiresAt?: string;
  refreshNeeded?: boolean;
}> {
  const fresh = await withShadow(ctx, fn);
  return {
    accessToken: fresh.accessToken,
    refreshToken: fresh.refreshToken,
    pageAccessToken: fresh.pageAccessToken,
    tokenExpiresAt: fresh.tokenExpiresAt,
    refreshNeeded: fresh.status === "needs_reauth",
  };
}

function socialHandler(
  id: (typeof IMPLEMENTED_PROVIDERS)[number],
  publish: PublishProviderHandler["publish"],
  refresh: NonNullable<PublishProviderHandler["refresh"]>
): PublishProviderHandler {
  return {
    id,
    label: PROVIDER_LABEL_EN[id] || id,
    labelAr: PROVIDER_LABEL_AR[id] || id,
    implemented: true,
    publish,
    refresh,
  };
}

export function socialAdapterHandlers(): PublishProviderHandler[] {
  return [
    socialHandler(
      "facebook",
      (ctx) => publishAdapted(ctx, publishFacebook),
      (ctx) => refreshAdapted(ctx, refreshMetaAccount)
    ),
    socialHandler(
      "instagram",
      (ctx) => publishAdapted(ctx, publishInstagram),
      (ctx) => refreshAdapted(ctx, refreshMetaAccount)
    ),
    socialHandler(
      "youtube",
      (ctx) => publishAdapted(ctx, publishYoutube),
      (ctx) => refreshAdapted(ctx, refreshYoutubeAccount)
    ),
    socialHandler(
      "tiktok",
      (ctx) => publishAdapted(ctx, publishTikTok),
      (ctx) => refreshAdapted(ctx, refreshTikTokAccount)
    ),
    socialHandler(
      "x",
      (ctx) => publishAdapted(ctx, publishX),
      (ctx) => refreshAdapted(ctx, refreshXAccount)
    ),
  ];
}
