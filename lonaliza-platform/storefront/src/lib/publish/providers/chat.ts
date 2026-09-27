import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  createHttpHandler,
  envValue,
  extraString,
  fail,
  missingToken,
  okResult,
  providerJson,
  providerSettings,
  type ValidatingPublishHandler,
} from "./http-base";

const chatSettings = z.object({ firstComment: z.string().optional(), channel: z.string().optional() }).passthrough();

function bearer(ctx: PublishContext): string {
  return (ctx.accessToken || ctx.pageAccessToken || "").trim();
}

function settingChannel(ctx: PublishContext): string {
  const settings = providerSettings(ctx);
  return String(settings.channel || extraString(ctx, "externalId", "pageId") || "").trim();
}

export function discordHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "discord",
    maxLength: 2000,
    settingsSchema: chatSettings,
    credentials: async (ctx) => {
      const token = (await envValue("DISCORD_BOT_TOKEN")) || bearer(ctx);
      if (!token) {
        return missingToken("لا يوجد رمز بوت ديسكورد. أضف DISCORD_BOT_TOKEN أو أعد ربط الحساب.");
      }
      if (!settingChannel(ctx)) {
        return missingToken("لا توجد قناة ديسكورد. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const channelId = settingChannel(ctx);
      const token = (await envValue("DISCORD_BOT_TOKEN")) || bearer(ctx);
      const embeds = ctx.mediaUrls.slice(0, 10).map((url) => ({ url }));
      const { data } = await providerJson<{ id?: string }>(
        `https://discord.com/api/channels/${encodeURIComponent(channelId)}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: ctx.caption || undefined,
            embeds: embeds.length ? embeds : undefined,
          }),
        }
      );
      if (!data.id) return fail("discord", "publish_failed", "ديسكورد لم يُرجع معرّف الرسالة");
      return okResult("discord", data.id);
    },
  });
}

export function slackHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "slack",
    maxLength: 40_000,
    settingsSchema: chatSettings,
    credentials: async (ctx) => {
      if (!bearer(ctx)) {
        return missingToken("لا يوجد رمز وصول لسلاك. أعد ربط الحساب.");
      }
      if (!settingChannel(ctx)) {
        return missingToken("لا توجد قناة سلاك. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const channel = settingChannel(ctx);
      await providerJson("https://slack.com/api/conversations.join", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearer(ctx)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel }),
      });
      const { data } = await providerJson<{ ok?: boolean; ts?: string; error?: string; channel?: string }>(
        "https://slack.com/api/chat.postMessage",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearer(ctx)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel,
            text: ctx.caption,
            attachments: ctx.mediaUrls.map((url) => ({ image_url: url })),
          }),
        }
      );
      if (!data.ok || !data.ts) {
        return fail("slack", "publish_failed", data.error || "فشل النشر على سلاك");
      }
      let permalink = `https://slack.com/archives/${data.channel || channel}/p${data.ts.replace(".", "")}`;
      try {
        const link = await providerJson<{ ok?: boolean; permalink?: string }>(
          "https://slack.com/api/chat.getPermalink",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${bearer(ctx)}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ channel: data.channel || channel, message_ts: data.ts }),
          }
        );
        if (link.data.permalink) permalink = link.data.permalink;
      } catch {
        /* cosmetic */
      }
      return okResult("slack", data.ts, permalink);
    },
  });
}

export function kickHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "kick",
    maxLength: 500,
    settingsSchema: chatSettings,
    credentials: async (ctx) => {
      if (!bearer(ctx) || !extraString(ctx, "externalId", "username")) {
        return missingToken("لا يوجد رمز أو قناة كيك. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const chatId = extraString(ctx, "externalId", "pageId", "username");
      const { data } = await providerJson<{ data?: { id?: string | number }; id?: string }>(
        `https://kick.com/api/v2/channels/${encodeURIComponent(chatId)}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearer(ctx)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: ctx.caption, type: "message" }),
        }
      );
      const id = String(data.data?.id || data.id || "");
      if (!id) return fail("kick", "publish_failed", "كيك لم يُرجع معرّف الرسالة");
      return okResult("kick", id);
    },
  });
}

export function twitchHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "twitch",
    maxLength: 500,
    settingsSchema: chatSettings,
    credentials: async (ctx) => {
      if (!bearer(ctx)) {
        return missingToken("لا يوجد رمز وصول لتويتش. أعد ربط الحساب.");
      }
      const clientId = extraString(ctx, "clientId") || (await envValue("TWITCH_CLIENT_ID"));
      if (!clientId) {
        return missingToken("لا يوجد TWITCH_CLIENT_ID. أضف المفتاح أو أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const broadcaster = extraString(ctx, "externalId", "pageId");
      const clientId = extraString(ctx, "clientId") || process.env.TWITCH_CLIENT_ID || "";
      const { data } = await providerJson<{ data?: Array<{ message_id?: string }> }>(
        "https://api.twitch.tv/helix/chat/announcements",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearer(ctx)}`,
            "Client-Id": clientId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            broadcaster_id: broadcaster,
            moderator_id: extraString(ctx, "username") || broadcaster,
            message: ctx.caption.slice(0, 500),
          }),
        }
      );
      const id = data.data?.[0]?.message_id || `twitch-${Date.now()}`;
      return okResult("twitch", id);
    },
  });
}
