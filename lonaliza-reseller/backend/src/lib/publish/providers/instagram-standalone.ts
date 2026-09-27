import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  asBoolean,
  createHttpHandler,
  extraString,
  firstCommentOf,
  isVideoPath,
  missingToken,
  okResult,
  pollDelayMs,
  providerJson,
  sleep,
  type ValidatingPublishHandler,
} from "./http-base";

const GRAPH = "https://graph.instagram.com/v25.0";

const settingsSchema = z
  .object({
    post_type: z.string().optional(),
    is_trial_reel: z.union([z.boolean(), z.string()]).optional(),
    graduation_strategy: z.string().optional(),
    collaborators: z.array(z.object({ label: z.string() }).passthrough()).optional(),
    firstComment: z.string().optional(),
  })
  .passthrough();

type IgSettings = z.infer<typeof settingsSchema>;

function userIdOf(ctx: PublishContext): string {
  return extraString(ctx, "externalId", "instagramUserId") || "me";
}

function extraValidate(ctx: PublishContext, settings: IgSettings) {
  if (ctx.mediaUrls.length === 0) {
    return [{ code: "invalid_input", field: "mediaUrls", message: "إنستغرام المستقل يتطلب وسائط واحدة على الأقل." }];
  }
  if (asBoolean(settings.is_trial_reel)) {
    if (ctx.mediaUrls.length > 1) {
      return [{ code: "invalid_input", field: "mediaUrls", message: "ريلز تجريبية تقبل فيديو واحداً فقط." }];
    }
    if (!isVideoPath(ctx.mediaUrls[0] || "")) {
      return [{ code: "invalid_input", field: "mediaUrls", message: "ريلز تجريبية يجب أن تكون فيديو." }];
    }
  }
  if ((settings.post_type || "") === "story" && ctx.mediaUrls.length > 1 && ctx.mediaUrls.every((url) => !isVideoPath(url))) {
    return [{ code: "invalid_input", field: "mediaUrls", message: "ستوري إنستغرام تقبل صورة واحدة فقط." }];
  }
  return [];
}

async function containerStatus(id: string, token: string): Promise<string> {
  const { data } = await providerJson<{ status_code?: string; status?: string; error?: { message?: string } }>(
    `${GRAPH}/${id}?fields=status_code,status&access_token=${encodeURIComponent(token)}`
  );
  const status = (data.status_code || data.status || "").toUpperCase();
  if (status === "ERROR" || status === "EXPIRED") {
    throw new Error(data.error?.message || "تعذر تجهيز وسائط إنستغرام");
  }
  return status || "IN_PROGRESS";
}

async function waitContainer(id: string, token: string): Promise<void> {
  const tries = process.env.VITEST ? 8 : 150;
  for (let i = 0; i < tries; i++) {
    const status = await containerStatus(id, token);
    if (status === "FINISHED" || status === "PUBLISHED") return;
    await sleep(pollDelayMs());
  }
  throw new Error("استغرق إنستغرام وقتاً طويلاً لمعالجة الوسائط");
}

async function createContainer(
  userId: string,
  token: string,
  mediaUrl: string,
  options: {
    caption?: string;
    isStory: boolean;
    isCarouselItem: boolean;
    isTrial: boolean;
    graduation?: string;
    collaborators?: string[];
  }
): Promise<string> {
  const params = new URLSearchParams({ access_token: token });
  const video = isVideoPath(mediaUrl);
  if (video) params.set("video_url", mediaUrl);
  else params.set("image_url", mediaUrl);
  if (options.isStory) params.set("media_type", "STORIES");
  else if (video && !options.isCarouselItem) params.set("media_type", "REELS");
  else if (video) params.set("media_type", "VIDEO");
  if (options.isCarouselItem) params.set("is_carousel_item", "true");
  if (options.caption && !options.isCarouselItem) params.set("caption", options.caption);
  if (options.collaborators?.length && !options.isStory) {
    params.set("collaborators", JSON.stringify(options.collaborators));
  }
  if (options.isTrial) {
    params.set(
      "trial_params",
      JSON.stringify({ graduation_strategy: options.graduation || "MANUAL" })
    );
  }
  const { data } = await providerJson<{ id?: string }>(`${GRAPH}/${userId}/media?${params.toString()}`, {
    method: "POST",
  });
  if (!data.id) throw new Error("إنستغرام لم يُرجع معرّف الحاوية");
  return data.id;
}

async function publishContainer(userId: string, token: string, creationId: string): Promise<string> {
  await waitContainer(creationId, token);
  const { data } = await providerJson<{ id?: string }>(
    `${GRAPH}/${userId}/media_publish?creation_id=${encodeURIComponent(creationId)}&access_token=${encodeURIComponent(token)}`,
    { method: "POST" }
  );
  if (!data.id) throw new Error("فشل نشر إنستغرام المستقل");
  return data.id;
}

async function permalinkOf(id: string, token: string, username?: string): Promise<string> {
  try {
    const { data } = await providerJson<{ permalink?: string }>(
      `${GRAPH}/${id}?fields=permalink&access_token=${encodeURIComponent(token)}`
    );
    if (data.permalink) return data.permalink;
  } catch {
    /* cosmetic */
  }
  return username ? `https://www.instagram.com/${username}` : `https://www.instagram.com/p/${id}`;
}

async function refreshStandalone(ctx: PublishContext) {
  const token = (ctx.refreshToken || ctx.accessToken || "").trim();
  if (!token) return { refreshNeeded: true };
  const { data } = await providerJson<{ access_token?: string }>(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`
  );
  if (!data.access_token) return { refreshNeeded: true };
  return {
    accessToken: data.access_token,
    refreshToken: data.access_token,
    tokenExpiresAt: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000).toISOString(),
    refreshNeeded: false,
  };
}

export function instagramStandaloneHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "instagram-standalone",
    maxLength: 2200,
    settingsSchema,
    extraValidate,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لإنستغرام المستقل. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    refresh: refreshStandalone,
    async publishApproved(ctx: PublishContext, settings: IgSettings): Promise<PublishProviderResult> {
      const userId = userIdOf(ctx);
      const token = ctx.accessToken;
      const isStory = (settings.post_type || "") === "story";
      const isTrial = asBoolean(settings.is_trial_reel);
      const collaborators = (settings.collaborators || []).map((row) => row.label).filter(Boolean);
      const username = extraString(ctx, "username");

      let mediaId = "";
      if (isStory && ctx.mediaUrls.length > 1) {
        for (const url of ctx.mediaUrls) {
          const container = await createContainer(userId, token, url, {
            isStory: true,
            isCarouselItem: false,
            isTrial,
            graduation: settings.graduation_strategy,
          });
          mediaId = await publishContainer(userId, token, container);
        }
      } else if (ctx.mediaUrls.length === 1) {
        const container = await createContainer(userId, token, ctx.mediaUrls[0], {
          caption: ctx.caption,
          isStory,
          isCarouselItem: false,
          isTrial,
          graduation: settings.graduation_strategy,
          collaborators,
        });
        mediaId = await publishContainer(userId, token, container);
      } else {
        const children: string[] = [];
        for (const url of ctx.mediaUrls) {
          const child = await createContainer(userId, token, url, {
            isStory: false,
            isCarouselItem: true,
            isTrial: false,
          });
          await waitContainer(child, token);
          children.push(child);
        }
        const params = new URLSearchParams({
          caption: ctx.caption,
          media_type: "CAROUSEL",
          children: children.join(","),
          access_token: token,
        });
        if (collaborators.length) params.set("collaborators", JSON.stringify(collaborators));
        const { data } = await providerJson<{ id?: string }>(`${GRAPH}/${userId}/media?${params.toString()}`, {
          method: "POST",
        });
        if (!data.id) throw new Error("إنستغرام لم يُرجع معرّف الكاروسيل");
        mediaId = await publishContainer(userId, token, data.id);
      }

      const comment = firstCommentOf(settings);
      if (comment && mediaId) {
        await providerJson(`${GRAPH}/${mediaId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: comment, access_token: token }),
        });
      }

      return okResult("instagram-standalone", mediaId, await permalinkOf(mediaId, token, username));
    },
  });
}
