import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  createHttpHandler,
  extraString,
  fail,
  isVideoPath,
  missingToken,
  okResult,
  providerJson,
  type ValidatingPublishHandler,
} from "./http-base";

const fediverseSettings = z
  .object({
    firstComment: z.string().optional(),
    instance: z.string().optional(),
    community: z.string().optional(),
    title: z.string().optional(),
  })
  .passthrough();

function instanceOf(ctx: PublishContext, fallback: string): string {
  const raw = extraString(ctx, "instance", "customInstance") || fallback;
  const host = raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return host ? `https://${host}` : fallback;
}

export function mastodonHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "mastodon",
    maxLength: 500,
    settingsSchema: fediverseSettings,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لماستودون. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const base = instanceOf(ctx, "https://mastodon.social");
      const mediaIds: string[] = [];
      for (const url of ctx.mediaUrls.slice(0, 4)) {
        const uploaded = await providerJson<{ id?: string }>(`${base}/api/v2/media`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });
        if (uploaded.data.id) mediaIds.push(uploaded.data.id);
      }
      const { data } = await providerJson<{ id?: string; url?: string }>(`${base}/api/v1/statuses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: ctx.caption,
          media_ids: mediaIds.length ? mediaIds : undefined,
        }),
      });
      if (!data.id) return fail("mastodon", "publish_failed", "ماستودون لم يُرجع معرّف الحالة");
      return okResult("mastodon", data.id, data.url);
    },
  });
}

export function blueskyHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "bluesky",
    maxLength: 300,
    settingsSchema: fediverseSettings,
    extraValidate: (ctx) => {
      const videos = ctx.mediaUrls.filter(isVideoPath);
      if (videos.length && ctx.mediaUrls.length > 1) {
        return [{ code: "invalid_input", field: "mediaUrls", message: "بلوسكاي يقبل فيديو واحد دون صور إضافية." }];
      }
      return [];
    },
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لبلوسكاي. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const did = extraString(ctx, "externalId", "username") || "did:plc:unknown";
      const { data } = await providerJson<{ uri?: string; cid?: string }>(
        "https://bsky.social/xrpc/com.atproto.repo.createRecord",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repo: did,
            collection: "app.bsky.feed.post",
            record: {
              $type: "app.bsky.feed.post",
              text: ctx.caption.slice(0, 300),
              createdAt: new Date().toISOString(),
            },
          }),
        }
      );
      if (!data.uri) return fail("bluesky", "publish_failed", "بلوسكاي لم يُرجع URI");
      return okResult("bluesky", data.uri, `https://bsky.app/profile/${encodeURIComponent(did)}/post/${data.uri.split("/").pop()}`);
    },
  });
}

export function lemmyHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "lemmy",
    maxLength: 40_000,
    settingsSchema: fediverseSettings,
    extraValidate: (ctx, settings) => {
      const fromArray = Array.isArray(settings.subreddit)
        ? String((settings.subreddit as Array<{ value?: { id?: string } }>)[0]?.value?.id || "")
        : "";
      if (!(settings.community || fromArray || extraString(ctx, "community", "pageId")).trim()) {
        return [{ code: "invalid_input", field: "community", message: "ليمي يتطلب مجتمعاً." }];
      }
      return [];
    },
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لليمي. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: z.infer<typeof fediverseSettings>): Promise<PublishProviderResult> {
      const base = instanceOf(ctx, "https://lemmy.world");
      const fromArray = Array.isArray(settings.subreddit)
        ? String((settings.subreddit as Array<{ value?: { id?: string } }>)[0]?.value?.id || "")
        : "";
      const community = Number(settings.community || fromArray || extraString(ctx, "community", "pageId"));
      const { data } = await providerJson<{ post_view?: { post?: { id?: number; ap_id?: string } } }>(
        `${base}/api/v3/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: (ctx.title || settings.title || ctx.caption.split("\n")[0] || "منشور").slice(0, 200),
            body: ctx.caption,
            community_id: community,
            url: ctx.mediaUrls[0],
            auth: ctx.accessToken,
          }),
        }
      );
      const id = data.post_view?.post?.id;
      if (!id) return fail("lemmy", "publish_failed", "ليمي لم يُرجع معرّف المنشور");
      return okResult("lemmy", String(id), data.post_view?.post?.ap_id);
    },
  });
}
