import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  asBoolean,
  createHttpHandler,
  envValue,
  extraString,
  fail,
  isVideoPath,
  missingToken,
  okResult,
  pollDelayMs,
  providerJson,
  ProviderHttpError,
  sleep,
  type ValidatingPublishHandler,
} from "./http-base";

const BASE = "https://business-api.tiktok.com/open_api/v1.3";

const settingsSchema = z
  .object({
    content_posting_method: z.string().optional(),
    title: z.string().optional(),
    privacy_level: z.string().optional(),
    comment: z.union([z.boolean(), z.string()]).optional(),
    duet: z.union([z.boolean(), z.string()]).optional(),
    stitch: z.union([z.boolean(), z.string()]).optional(),
    brand_organic_toggle: z.union([z.boolean(), z.string()]).optional(),
    brand_content_toggle: z.union([z.boolean(), z.string()]).optional(),
    video_made_with_ai: z.union([z.boolean(), z.string()]).optional(),
    autoAddMusic: z.string().optional(),
    location: z.object({ id: z.string().optional(), name: z.string().optional() }).passthrough().optional(),
    music: z
      .object({
        id: z.string().optional(),
        audio_volume: z.union([z.number(), z.string()]).optional(),
        video_volume: z.union([z.number(), z.string()]).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

type TikTokBizSettings = z.infer<typeof settingsSchema>;

type BizEnvelope<T> = { code?: number; message?: string; data?: T };

function extraValidate(ctx: PublishContext) {
  if (ctx.mediaUrls.length === 0) {
    return [{ code: "invalid_input", field: "mediaUrls", message: "تيك توك بزنس يتطلب فيديو أو صورة واحدة على الأقل." }];
  }
  const videos = ctx.mediaUrls.filter(isVideoPath);
  if (ctx.mediaUrls.length > 1 && videos.length > 0) {
    return [{ code: "invalid_input", field: "mediaUrls", message: "عند اختيار أكثر من ملف يُسمح بالصور فقط." }];
  }
  if (videos.length > 1) {
    return [{ code: "invalid_input", field: "mediaUrls", message: "تيك توك بزنس يقبل فيديو واحداً فقط." }];
  }
  if (ctx.mediaUrls.length > 35) {
    return [{ code: "invalid_input", field: "mediaUrls", message: "تيك توك بزنس يقبل حتى 35 صورة." }];
  }
  return [];
}

function classifyBizError(body: unknown): { code: "needs_reauth" | "publish_failed"; message: string } {
  const text = typeof body === "string" ? body : JSON.stringify(body || {});
  if (
    text.includes("access_token_invalid") ||
    text.includes("Access token is incorrect") ||
    text.includes("Access token has expired") ||
    text.includes("auth_removed")
  ) {
    return { code: "needs_reauth", message: "رمز تيك توك بزنس غير صالح. أعد ربط الحساب." };
  }
  const row = body && typeof body === "object" ? (body as { message?: string }) : {};
  return { code: "publish_failed", message: row.message || "تيك توك بزنس رفض المنشور." };
}

async function bizJson<T>(
  url: string,
  init: RequestInit
): Promise<T> {
  const { data } = await providerJson<BizEnvelope<T>>(url, init);
  if ((data?.code ?? 0) !== 0) {
    const classified = classifyBizError(data);
    throw new ProviderHttpError(
      classified.message,
      classified.code === "needs_reauth" ? 401 : 400,
      false,
      data,
      classified.code
    );
  }
  return (data.data || {}) as T;
}

function businessIdOf(ctx: PublishContext): string {
  return extraString(ctx, "externalId", "businessId", "openId");
}

function isDraft(settings: TikTokBizSettings): boolean {
  return settings.content_posting_method === "UPLOAD";
}

function videoBody(ctx: PublishContext, settings: TikTokBizSettings): Record<string, unknown> {
  const draft = isDraft(settings);
  return {
    business_id: businessIdOf(ctx),
    video_url: ctx.mediaUrls[0],
    post_info: {
      ...(ctx.caption ? { caption: ctx.caption } : {}),
      is_brand_organic: asBoolean(settings.brand_organic_toggle),
      is_branded_content: asBoolean(settings.brand_content_toggle),
      ...(draft
        ? { upload_to_draft: true }
        : {
            disable_comment: !asBoolean(settings.comment ?? true),
            disable_duet: !asBoolean(settings.duet ?? true),
            disable_stitch: !asBoolean(settings.stitch ?? true),
            is_ai_generated: asBoolean(settings.video_made_with_ai),
            ...(settings.location?.id
              ? { location_id: settings.location.id, location_name: settings.location.name }
              : {}),
            ...(settings.music?.id
              ? {
                  music_sound_info: {
                    music_sound_id: settings.music.id,
                    music_sound_volume: Number(settings.music.audio_volume ?? 50),
                    video_original_sound_volume: Number(settings.music.video_volume ?? 50),
                  },
                }
              : {}),
          }),
    },
  };
}

function photoBody(ctx: PublishContext, settings: TikTokBizSettings): Record<string, unknown> {
  const draft = isDraft(settings);
  const musicId = settings.autoAddMusic === "yes" ? undefined : settings.music?.id;
  return {
    business_id: businessIdOf(ctx),
    photo_images: ctx.mediaUrls,
    photo_cover_index: 0,
    post_info: {
      ...(settings.title ? { title: settings.title.slice(0, 90) } : {}),
      ...(ctx.caption ? { caption: ctx.caption } : {}),
      is_brand_organic: asBoolean(settings.brand_organic_toggle),
      is_branded_content: asBoolean(settings.brand_content_toggle),
      ...(draft
        ? { is_draft: true }
        : {
            privacy_level: settings.privacy_level || "PUBLIC_TO_EVERYONE",
            disable_comment: !asBoolean(settings.comment ?? true),
            auto_add_music: !musicId && settings.autoAddMusic === "yes",
            ...(settings.location?.id
              ? { location_id: settings.location.id, location_name: settings.location.name }
              : {}),
            ...(musicId ? { music_sound_info: { music_sound_id: musicId } } : {}),
          }),
    },
  };
}

async function waitPublish(ctx: PublishContext, publishId: string): Promise<{ postId: string; url: string }> {
  const tries = process.env.VITEST ? 6 : 27;
  const username = extraString(ctx, "username") || ctx.channel.name;
  for (let i = 0; i < tries; i++) {
    const data = await bizJson<{ status?: string; post_ids?: string[]; reason?: string }>(
      `${BASE}/business/publish/status/?business_id=${encodeURIComponent(businessIdOf(ctx))}&publish_id=${encodeURIComponent(publishId)}`,
      { method: "GET", headers: { "Access-Token": ctx.accessToken } }
    );
    if (data.status === "SEND_TO_USER_INBOX") {
      return { postId: "missing", url: "https://www.tiktok.com/messages?lang=en" };
    }
    if (data.status === "PUBLISH_COMPLETE") {
      const publicId = data.post_ids?.[0];
      return {
        postId: publicId ? String(publicId) : publishId,
        url: publicId
          ? `https://www.tiktok.com/@${username}/video/${publicId}`
          : `https://www.tiktok.com/@${username}`,
      };
    }
    if (data.status === "FAILED") {
      throw new Error(data.reason || "تيك توك بزنس رفض رفع المنشور");
    }
    await sleep(process.env.VITEST ? 0 : 20_000);
  }
  throw new Error("تيك توك بزنس لم يُكمل النشر في الوقت المحدد");
}

async function refreshTikTokBusiness(ctx: PublishContext) {
  const refresh = (ctx.refreshToken || "").trim();
  if (!refresh) return { refreshNeeded: true };
  const clientId = await envValue("TIKTOK_BUSINESS_CLIENT_ID");
  const clientSecret = await envValue("TIKTOK_BUSINESS_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return { refreshNeeded: true };
  }
  const { data } = await providerJson<BizEnvelope<{ access_token?: string; refresh_token?: string }>>(
    `${BASE}/tt_user/oauth2/refresh_token/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refresh,
      }),
    }
  );
  if (data?.code !== 0 || !data.data?.access_token) {
    return { refreshNeeded: true };
  }
  return {
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token || refresh,
    tokenExpiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    refreshNeeded: false,
  };
}

export function tiktokBusinessHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "tiktok-business",
    maxLength: 2200,
    settingsSchema,
    extraValidate,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لتيك توك بزنس. أعد ربط الحساب.");
      }
      if (!businessIdOf(ctx)) {
        return missingToken("لا يوجد معرّف حساب تيك توك بزنس. أعد ربط القناة.");
      }
      return { ok: true };
    },
    refresh: refreshTikTokBusiness,
    async publishApproved(ctx: PublishContext, settings: TikTokBizSettings): Promise<PublishProviderResult> {
      if (ctx.channel.refreshNeeded) return fail("tiktok-business", "needs_reauth", "الحساب يحتاج إعادة تحقق.");
      const photo = !isVideoPath(ctx.mediaUrls[0] || "");
      const published = await bizJson<{ share_id?: string }>(
        `${BASE}${photo ? "/business/photo/publish/" : "/business/video/publish/"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Access-Token": ctx.accessToken },
          body: JSON.stringify(photo ? photoBody(ctx, settings) : videoBody(ctx, settings)),
        }
      );
      if (!published.share_id) {
        return fail("tiktok-business", "publish_failed", "تيك توك بزنس لم يُرجع معرّف النشر.");
      }
      const done = await waitPublish(ctx, published.share_id);
      return okResult("tiktok-business", done.postId, done.url);
    },
  });
}

