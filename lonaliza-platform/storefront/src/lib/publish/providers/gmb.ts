import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  createHttpHandler,
  envValue,
  fail,
  isVideoPath,
  missingToken,
  okResult,
  providerJson,
  type ValidatingPublishHandler,
} from "./http-base";

const gmbSettingsSchema = z
  .object({
    topicType: z.enum(["STANDARD", "EVENT", "OFFER"]).optional(),
    callToActionType: z
      .enum([
        "NONE",
        "BOOK",
        "ORDER",
        "SHOP",
        "LEARN_MORE",
        "SIGN_UP",
        "GET_OFFER",
        "CALL",
      ])
      .optional(),
    callToActionUrl: z.string().optional(),
    eventTitle: z.string().optional(),
    eventStartDate: z.string().optional(),
    eventEndDate: z.string().optional(),
    eventStartTime: z.string().optional(),
    eventEndTime: z.string().optional(),
    offerCouponCode: z.string().optional(),
    offerRedeemUrl: z.string().optional(),
    offerTerms: z.string().optional(),
  })
  .passthrough();

type GmbSettings = z.infer<typeof gmbSettingsSchema>;

function locationIdOf(ctx: PublishContext): string {
  return (ctx.channel.extra.externalId || ctx.channel.extra.pageId || "").trim();
}

function extraValidate(ctx: PublishContext, settings: GmbSettings) {
  if (ctx.mediaUrls.length > 1) {
    return [
      {
        code: "invalid_input",
        field: "mediaUrls",
        message: "منشور جوجل للأعمال يقبل صورة واحدة فقط.",
      },
    ];
  }
  if (ctx.mediaUrls.some(isVideoPath)) {
    return [
      {
        code: "invalid_input",
        field: "mediaUrls",
        message: "جوجل للأعمال لا يدعم الفيديو.",
      },
    ];
  }
  if (settings.topicType === "EVENT" && !(settings.eventTitle || "").trim()) {
    return [
      {
        code: "invalid_input",
        field: "eventTitle",
        message: "منشور الفعالية يحتاج عنواناً.",
      },
    ];
  }
  if (
    settings.callToActionType &&
    settings.callToActionType !== "NONE" &&
    settings.callToActionUrl &&
    !/^https?:\/\//i.test(settings.callToActionUrl)
  ) {
    return [
      {
        code: "invalid_input",
        field: "callToActionUrl",
        message: "رابط الدعوة إلى الإجراء غير صالح.",
      },
    ];
  }
  return [];
}

function formatDate(value?: string): { year: number; month: number; day: number } {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function formatTime(value?: string): { hours: number; minutes: number; seconds: number; nanos: number } | undefined {
  if (!value) return undefined;
  const [hours, minutes] = value.split(":").map(Number);
  return { hours: hours || 0, minutes: minutes || 0, seconds: 0, nanos: 0 };
}

async function googleClient(): Promise<{ id: string; secret: string }> {
  const gmbId = await envValue("GOOGLE_GMB_CLIENT_ID");
  const gmbSecret = await envValue("GOOGLE_GMB_CLIENT_SECRET");
  if (gmbId && gmbSecret) return { id: gmbId, secret: gmbSecret };
  return {
    id: await envValue("GOOGLE_YOUTUBE_CLIENT_ID", "POCKETBASE_GOOGLE_CLIENT_ID"),
    secret: await envValue("GOOGLE_YOUTUBE_CLIENT_SECRET", "POCKETBASE_GOOGLE_CLIENT_SECRET"),
  };
}

async function refreshGmb(ctx: PublishContext) {
  const refresh = (ctx.refreshToken || "").trim();
  if (!refresh) return { refreshNeeded: true };
  const client = await googleClient();
  if (!client.id || !client.secret) return { refreshNeeded: true };
  const { data } = await providerJson<{
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  }>("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: client.id,
      client_secret: client.secret,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }).toString(),
  });
  if (!data.access_token) return { refreshNeeded: true };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refresh,
    tokenExpiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined,
    refreshNeeded: false,
  };
}

export function gmbHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "gmb",
    maxLength: 1500,
    settingsSchema: gmbSettingsSchema,
    extraValidate,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لجوجل للأعمال. أعد ربط الحساب.");
      }
      if (!locationIdOf(ctx)) {
        return missingToken("لا يوجد معرّف موقع جوجل للأعمال. أعد ربط الموقع.");
      }
      return { ok: true };
    },
    refresh: refreshGmb,
    async publishApproved(ctx: PublishContext, settings: GmbSettings): Promise<PublishProviderResult> {
      const location = locationIdOf(ctx);
      if (!location) {
        return fail("gmb", "missing_credentials", "لا يوجد معرّف موقع جوجل للأعمال.");
      }
      const body: Record<string, unknown> = {
        languageCode: "ar",
        summary: ctx.caption,
        topicType: settings.topicType || "STANDARD",
      };
      if (
        settings.callToActionType &&
        settings.callToActionType !== "NONE" &&
        settings.callToActionUrl
      ) {
        body.callToAction = {
          actionType: settings.callToActionType,
          url: settings.callToActionUrl,
        };
      }
      if (ctx.mediaUrls[0]) {
        body.media = [
          {
            mediaFormat: "PHOTO",
            sourceUrl: ctx.mediaUrls[0],
          },
        ];
      }
      if (settings.topicType === "EVENT" && settings.eventTitle) {
        body.event = {
          title: settings.eventTitle,
          schedule: {
            startDate: formatDate(settings.eventStartDate),
            endDate: formatDate(settings.eventEndDate),
            ...(settings.eventStartTime ? { startTime: formatTime(settings.eventStartTime) } : {}),
            ...(settings.eventEndTime ? { endTime: formatTime(settings.eventEndTime) } : {}),
          },
        };
      }
      if (settings.topicType === "OFFER") {
        body.offer = {
          couponCode: settings.offerCouponCode || undefined,
          redeemOnlineUrl: settings.offerRedeemUrl || undefined,
          termsConditions: settings.offerTerms || undefined,
        };
      }
      const { data } = await providerJson<{ name?: string; state?: string }>(
        `https://mybusiness.googleapis.com/v4/${location}/localPosts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (data.state === "REJECTED") {
        throw new Error("رفض جوجل المنشور بسبب سياسة المحتوى.");
      }
      if (!data.name) {
        throw new Error("جوجل لم يؤكد إنشاء المنشور.");
      }
      const locationKey = location.split("/").pop() || location;
      return okResult(
        "gmb",
        data.name,
        `https://business.google.com/locations/${locationKey}`
      );
    },
  });
}
