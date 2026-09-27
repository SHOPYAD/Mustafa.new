import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  createHttpHandler,
  downloadBuffer,
  envValue,
  fail,
  isVideoPath,
  missingToken,
  okResult,
  providerFetch,
  providerJson,
  sleep,
  type ValidatingPublishHandler,
} from "./http-base";

const pinterestSettingsSchema = z
  .object({
    board: z.string().optional(),
    title: z.string().max(100).optional(),
    link: z.string().optional(),
    dominant_color: z.string().optional(),
  })
  .passthrough();

type PinterestSettings = z.infer<typeof pinterestSettingsSchema>;

function extraValidate(ctx: PublishContext, settings: PinterestSettings) {
  if (!(settings.board || "").trim()) {
    return [
      {
        code: "invalid_input",
        field: "board",
        message: "بينترست يتطلب لوحة (board).",
      },
    ];
  }
  const media = ctx.mediaUrls;
  const videos = media.filter(isVideoPath);
  const images = media.filter((url) => !isVideoPath(url));
  if (media.length === 0) {
    return [
      {
        code: "invalid_input",
        field: "mediaUrls",
        message: "بينترست يتطلب وسائط واحدة على الأقل.",
      },
    ];
  }
  if (media.length > 5) {
    return [
      {
        code: "invalid_input",
        field: "mediaUrls",
        message: "بينترست يقبل حتى 5 ملفات فقط.",
      },
    ];
  }
  if (videos.length > 0) {
    if (videos.length > 1 || media.length > 2) {
      return [
        {
          code: "invalid_input",
          field: "mediaUrls",
          message: "فيديو بينترست يُنشر بملف واحد مع صورة غلاف فقط.",
        },
      ];
    }
    if (images.length === 0) {
      return [
        {
          code: "invalid_input",
          field: "mediaUrls",
          message: "فيديو بينترست يحتاج صورة غلاف.",
        },
      ];
    }
  }
  if (settings.link && !/^https?:\/\//i.test(settings.link)) {
    return [
      {
        code: "invalid_input",
        field: "link",
        message: "رابط بينترست غير صالح.",
      },
    ];
  }
  return [];
}

async function waitMedia(token: string, mediaId: string): Promise<void> {
  const tries = process.env.VITEST ? 8 : 24;
  for (let i = 0; i < tries; i++) {
    const { data } = await providerJson<{ status?: string }>(
      `https://api.pinterest.com/v5/media/${mediaId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (data.status === "failed") {
      throw new Error("ملف بينترست تالف ولا يمكن رفعه");
    }
    if (data.status === "succeeded") return;
    await sleep(process.env.VITEST ? 0 : 20_000);
  }
  throw new Error("استغرق بينترست وقتاً طويلاً لمعالجة الفيديو");
}

async function uploadVideo(token: string, videoUrl: string): Promise<string> {
  const { data } = await providerJson<{
    upload_url?: string;
    media_id?: string;
    upload_parameters?: Record<string, string>;
  }>("https://api.pinterest.com/v5/media", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ media_type: "video" }),
  });
  if (!data.upload_url || !data.media_id) {
    throw new Error("بينترست لم يُرجع بيانات رفع الفيديو");
  }
  const { buffer } = await downloadBuffer(videoUrl, { maxBytes: 200 * 1024 * 1024 });
  const form = new FormData();
  for (const [key, value] of Object.entries(data.upload_parameters || {})) {
    form.append(key, value);
  }
  form.append("file", new Blob([new Uint8Array(buffer)]), "video.mp4");
  const uploaded = await providerFetch(data.upload_url, { method: "POST", body: form });
  if (!uploaded.ok) {
    throw new Error(`فشل رفع فيديو بينترست (${uploaded.status})`);
  }
  await waitMedia(token, data.media_id);
  return data.media_id;
}

async function refreshPinterest(ctx: PublishContext) {
  const refresh = (ctx.refreshToken || "").trim();
  if (!refresh) return { refreshNeeded: true };
  const id = await envValue("PINTEREST_CLIENT_ID");
  const secret = await envValue("PINTEREST_CLIENT_SECRET");
  if (!id || !secret) return { refreshNeeded: true };
  const { data } = await providerJson<{ access_token?: string; expires_in?: number }>(
    "https://api.pinterest.com/v5/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh,
        scope: "boards:read,boards:write,pins:read,pins:write,user_accounts:read",
        redirect_uri: `${(await envValue("NEXT_PUBLIC_SITE_URL")) || "https://lonaliza.com"}/integrations/social/pinterest`,
      }).toString(),
    }
  );
  if (!data.access_token) return { refreshNeeded: true };
  return {
    accessToken: data.access_token,
    refreshToken: refresh,
    tokenExpiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined,
    refreshNeeded: false,
  };
}

export function pinterestHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "pinterest",
    maxLength: 500,
    settingsSchema: pinterestSettingsSchema,
    extraValidate,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لبينترست. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    refresh: refreshPinterest,
    async publishApproved(ctx: PublishContext, settings: PinterestSettings): Promise<PublishProviderResult> {
      const board = (settings.board || "").trim();
      if (!board) {
        return fail("pinterest", "invalid_input", "بينترست يتطلب لوحة (board).");
      }
      const video = ctx.mediaUrls.find(isVideoPath);
      const cover = ctx.mediaUrls.find((url) => !isVideoPath(url));
      let mediaId = "";
      if (video) {
        mediaId = await uploadVideo(ctx.accessToken, video);
      }
      const images = ctx.mediaUrls.filter((url) => !isVideoPath(url));
      const { data } = await providerJson<{ id?: string }>("https://api.pinterest.com/v5/pins", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(settings.link ? { link: settings.link } : {}),
          ...(settings.title ? { title: settings.title } : {}),
          description: ctx.caption,
          ...(settings.dominant_color ? { dominant_color: settings.dominant_color } : {}),
          board_id: board,
          media_source: mediaId
            ? {
                source_type: "video_id",
                media_id: mediaId,
                cover_image_url: cover,
              }
            : images.length === 1
              ? { source_type: "image_url", url: images[0] }
              : {
                  source_type: "multiple_image_urls",
                  items: images.map((url) => ({ url })),
                },
        }),
      });
      if (!data.id) throw new Error("بينترست لم يُرجع معرّف الدبوس");
      return okResult("pinterest", data.id, `https://www.pinterest.com/pin/${data.id}`);
    },
  });
}
