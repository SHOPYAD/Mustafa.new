import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  createHttpHandler,
  firstCommentOf,
  isVideoPath,
  missingToken,
  okResult,
  pollDelayMs,
  providerJson,
  sleep,
  type ValidatingPublishHandler,
} from "./http-base";

const threadsSettingsSchema = z
  .object({
    firstComment: z.string().optional(),
  })
  .passthrough();

type ThreadsSettings = z.infer<typeof threadsSettingsSchema>;

const GRAPH = "https://graph.threads.net/v1.0";

function userIdOf(ctx: PublishContext): string {
  return (ctx.channel.extra.externalId || ctx.channel.extra.instagramUserId || "me").trim() || "me";
}

async function checkContainer(id: string, token: string): Promise<"FINISHED" | "IN_PROGRESS" | "PUBLISHED"> {
  const { data } = await providerJson<{ status?: string; error_message?: string }>(
    `${GRAPH}/${id}?fields=status,error_message&access_token=${encodeURIComponent(token)}`
  );
  if (data.status === "ERROR" || data.status === "EXPIRED") {
    throw new Error(data.error_message || "تعذر تجهيز وسائط ثريدز");
  }
  if (data.status === "FINISHED" || data.status === "PUBLISHED") {
    return data.status;
  }
  return "IN_PROGRESS";
}

async function waitContainer(id: string, token: string): Promise<void> {
  const tries = process.env.VITEST ? 8 : 150;
  for (let i = 0; i < tries; i++) {
    const status = await checkContainer(id, token);
    if (status === "FINISHED" || status === "PUBLISHED") {
      await sleep(process.env.VITEST ? 0 : 2_000);
      return;
    }
    await sleep(pollDelayMs());
  }
  throw new Error("استغرق ثريدز وقتاً طويلاً لمعالجة الوسائط");
}

async function createText(userId: string, token: string, text: string, replyTo?: string): Promise<string> {
  const form = new FormData();
  form.append("media_type", "TEXT");
  form.append("text", text);
  form.append("access_token", token);
  if (replyTo) form.append("reply_to_id", replyTo);
  const { data } = await providerJson<{ id?: string }>(`${GRAPH}/${userId}/threads`, {
    method: "POST",
    body: form,
  });
  if (!data.id) throw new Error("ثريدز لم يُرجع معرّف الحاوية");
  return data.id;
}

async function createSingleMedia(
  userId: string,
  token: string,
  mediaUrl: string,
  text: string,
  isCarouselItem: boolean,
  replyTo?: string
): Promise<string> {
  const video = isVideoPath(mediaUrl);
  const params = new URLSearchParams({
    ...(video ? { video_url: mediaUrl } : { image_url: mediaUrl }),
    ...(isCarouselItem ? { is_carousel_item: "true" } : {}),
    ...(replyTo ? { reply_to_id: replyTo } : {}),
    media_type: video ? "VIDEO" : "IMAGE",
    text,
    access_token: token,
  });
  const { data } = await providerJson<{ id?: string }>(`${GRAPH}/${userId}/threads?${params.toString()}`, {
    method: "POST",
  });
  if (!data.id) throw new Error("ثريدز لم يُرجع معرّف الوسائط");
  return data.id;
}

async function createCarousel(
  userId: string,
  token: string,
  media: string[],
  text: string,
  replyTo?: string
): Promise<string> {
  const childIds: string[] = [];
  for (const url of media) {
    childIds.push(await createSingleMedia(userId, token, url, text, true));
  }
  await Promise.all(childIds.map((id) => waitContainer(id, token)));
  const params = new URLSearchParams({
    text,
    media_type: "CAROUSEL",
    children: childIds.join(","),
    ...(replyTo ? { reply_to_id: replyTo } : {}),
    access_token: token,
  });
  const { data } = await providerJson<{ id?: string }>(`${GRAPH}/${userId}/threads?${params.toString()}`, {
    method: "POST",
  });
  if (!data.id) throw new Error("ثريدز لم يُرجع معرّف الكاروسيل");
  return data.id;
}

async function createContent(
  userId: string,
  token: string,
  text: string,
  media: string[],
  replyTo?: string
): Promise<string> {
  if (media.length === 0) return createText(userId, token, text, replyTo);
  if (media.length === 1) return createSingleMedia(userId, token, media[0], text, false, replyTo);
  return createCarousel(userId, token, media, text, replyTo);
}

async function publishThread(
  userId: string,
  token: string,
  creationId: string,
  username?: string
): Promise<{ threadId: string; permalink: string }> {
  await waitContainer(creationId, token);
  const { data } = await providerJson<{ id?: string }>(
    `${GRAPH}/${userId}/threads_publish?creation_id=${encodeURIComponent(creationId)}&access_token=${encodeURIComponent(token)}`,
    { method: "POST" }
  );
  if (!data.id) throw new Error("فشل نشر ثريدز");
  let permalink = username ? `https://www.threads.net/@${username}` : "";
  try {
    const meta = await providerJson<{ permalink?: string }>(
      `${GRAPH}/${data.id}?fields=id,permalink&access_token=${encodeURIComponent(token)}`
    );
    permalink = meta.data.permalink || permalink;
  } catch {
    /* permalink is cosmetic */
  }
  return { threadId: data.id, permalink };
}

async function refreshThreads(ctx: PublishContext) {
  const token = (ctx.refreshToken || ctx.accessToken || "").trim();
  if (!token) return { refreshNeeded: true };
  const { data } = await providerJson<{ access_token?: string }>(
    `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(token)}`
  );
  if (!data.access_token) return { refreshNeeded: true };
  return {
    accessToken: data.access_token,
    refreshToken: data.access_token,
    tokenExpiresAt: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000).toISOString(),
    refreshNeeded: false,
  };
}

export function threadsHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "threads",
    maxLength: 500,
    settingsSchema: threadsSettingsSchema,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لثريدز. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    refresh: refreshThreads,
    async publishApproved(ctx: PublishContext, settings: ThreadsSettings): Promise<PublishProviderResult> {
      const userId = userIdOf(ctx);
      const token = ctx.accessToken;
      const creationId = await createContent(userId, token, ctx.caption, ctx.mediaUrls);
      const published = await publishThread(
        userId,
        token,
        creationId,
        ctx.channel.extra.username
      );
      const comment = firstCommentOf(settings);
      if (comment) {
        const replyId = await createContent(userId, token, comment, [], published.threadId);
        await publishThread(userId, token, replyId, ctx.channel.extra.username);
      }
      return okResult("threads", published.threadId, published.permalink);
    },
  });
}
