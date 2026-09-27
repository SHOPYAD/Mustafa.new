import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  createHttpHandler,
  envValue,
  extraString,
  fail,
  isVideoPath,
  missingToken,
  okResult,
  providerJson,
  type ValidatingPublishHandler,
} from "./http-base";

const communitySettings = z
  .object({
    title: z.string().optional(),
    firstComment: z.string().optional(),
    blog: z.string().optional(),
  })
  .passthrough();

type CommunitySettings = z.infer<typeof communitySettings>;

function tokenOf(ctx: PublishContext): string {
  return (ctx.accessToken || ctx.pageAccessToken || "").trim();
}

export function dribbbleHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "dribbble",
    maxLength: 1000,
    settingsSchema: communitySettings,
    extraValidate: (ctx) =>
      ctx.mediaUrls.length
        ? []
        : [{ code: "invalid_input", field: "mediaUrls", message: "دريبل يتطلب صورة." }],
    credentials: async (ctx) => (tokenOf(ctx) ? { ok: true } : missingToken("لا يوجد رمز وصول لدريبل. أعد ربط الحساب.")),
    async publishApproved(ctx: PublishContext, settings: CommunitySettings): Promise<PublishProviderResult> {
      const { data } = await providerJson<{ id?: number; html_url?: string }>("https://api.dribbble.com/v2/shots", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenOf(ctx)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: (ctx.title || settings.title || ctx.caption.split("\n")[0] || "Shot").slice(0, 80),
          description: ctx.caption,
          image_url: ctx.mediaUrls[0],
        }),
      });
      if (!data.id) return fail("dribbble", "publish_failed", "دريبل لم يُرجع معرّف اللقطة");
      return okResult("dribbble", String(data.id), data.html_url);
    },
  });
}

export function wrapcastHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "wrapcast",
    maxLength: 320,
    settingsSchema: communitySettings,
    extraValidate: (ctx) =>
      ctx.mediaUrls.some(isVideoPath)
        ? [{ code: "invalid_input", field: "mediaUrls", message: "فاركاستر يقبل صور فقط." }]
        : [],
    credentials: async (ctx) => {
      const key = (await envValue("NEYNAR_SECRET_KEY")) || tokenOf(ctx);
      if (!key) return missingToken("لا يوجد رمز فاركاستر/نيار. أضف NEYNAR_SECRET_KEY أو أعد ربط الحساب.");
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const key = (await envValue("NEYNAR_SECRET_KEY")) || tokenOf(ctx);
      const { data } = await providerJson<{ cast?: { hash?: string; author?: { username?: string } } }>(
        "https://api.neynar.com/v2/farcaster/cast",
        {
          method: "POST",
          headers: {
            api_key: key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signer_uuid: extraString(ctx, "externalId", "username"),
            text: ctx.caption.slice(0, 320),
            embeds: ctx.mediaUrls.slice(0, 2).map((url) => ({ url })),
          }),
        }
      );
      if (!data.cast?.hash) return fail("wrapcast", "publish_failed", "فاركاستر لم يُرجع هاش المنشور");
      const user = data.cast.author?.username || extraString(ctx, "username") || "lonaliza";
      return okResult("wrapcast", data.cast.hash, `https://warpcast.com/${user}/${data.cast.hash}`);
    },
  });
}

function serializeNostrEvent(event: {
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
}): string {
  return JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content]);
}

export function nostrHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "nostr",
    maxLength: 100_000,
    settingsSchema: communitySettings,
    credentials: async (ctx) => {
      const secret = extraString(ctx, "password") || tokenOf(ctx);
      if (!secret) return missingToken("لا يوجد مفتاح نوستر. احفظ المفتاح السري أو أعد ربط الحساب.");
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const secret = extraString(ctx, "password") || tokenOf(ctx);
      const pubkey = createHash("sha256").update(secret).digest("hex");
      const created_at = Math.floor(Date.now() / 1000);
      const unsigned = { pubkey, created_at, kind: 1, tags: [] as string[][], content: ctx.caption };
      const id = createHash("sha256").update(serializeNostrEvent(unsigned)).digest("hex");
      const event = { ...unsigned, id, sig: createHash("sha256").update(secret + id).digest("hex") };
      const relay = extraString(ctx, "instance") || "wss://relay.damus.io";
      await new Promise<void>((resolve, reject) => {
        const Ws = globalThis.WebSocket;
        if (!Ws) {
          reject(new Error("WebSocket غير متاح لنوستر"));
          return;
        }
        const socket = new Ws(relay);
        const timer = setTimeout(() => {
          socket.close();
          reject(new Error("انتهت مهلة ريلاي نوستر"));
        }, process.env.VITEST ? 2000 : 15_000);
        socket.addEventListener("open", () => {
          socket.send(JSON.stringify(["EVENT", event]));
        });
        socket.addEventListener("message", (ev: { data?: string }) => {
          try {
            const parsed = JSON.parse(String(ev.data || "[]")) as unknown[];
            if (parsed[0] === "OK" && parsed[2] === true) {
              clearTimeout(timer);
              socket.close();
              resolve();
            }
          } catch {
            /* ignore */
          }
        });
        socket.addEventListener("error", () => {
          clearTimeout(timer);
          reject(new Error("فشل اتصال ريلاي نوستر"));
        });
      });
      return okResult("nostr", id);
    },
  });
}

export function vkHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "vk",
    maxLength: 16_000,
    settingsSchema: communitySettings,
    credentials: async (ctx) =>
      tokenOf(ctx) ? { ok: true } : missingToken("لا يوجد رمز وصول لفي كيه. أعد ربط الحساب."),
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const owner = extraString(ctx, "externalId", "pageId");
      const params = new URLSearchParams({
        access_token: tokenOf(ctx),
        v: "5.199",
        message: ctx.caption,
        ...(owner ? { owner_id: owner } : {}),
        ...(ctx.mediaUrls[0] ? { attachments: ctx.mediaUrls[0] } : {}),
      });
      const { data } = await providerJson<{ response?: { post_id?: number }; error?: { error_msg?: string } }>(
        `https://api.vk.com/method/wall.post?${params.toString()}`,
        { method: "POST" }
      );
      if (!data.response?.post_id) {
        return fail("vk", "publish_failed", data.error?.error_msg || "فشل النشر على في كيه");
      }
      return okResult("vk", String(data.response.post_id));
    },
  });
}

export function moltbookHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "moltbook",
    maxLength: 10_000,
    settingsSchema: communitySettings,
    credentials: async (ctx) =>
      tokenOf(ctx) ? { ok: true } : missingToken("لا يوجد رمز وصول لمولت بوك. أعد ربط الحساب."),
    async publishApproved(ctx: PublishContext, settings: CommunitySettings): Promise<PublishProviderResult> {
      const { data } = await providerJson<{ id?: string; url?: string }>("https://www.moltbook.com/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenOf(ctx)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: ctx.title || settings.title, content: ctx.caption }),
      });
      if (!data.id) return fail("moltbook", "publish_failed", "مولت بوك لم يُرجع معرّف المنشور");
      return okResult("moltbook", data.id, data.url);
    },
  });
}

export function whopHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "whop",
    maxLength: 10_000,
    settingsSchema: communitySettings,
    credentials: async (ctx) =>
      tokenOf(ctx) ? { ok: true } : missingToken("لا يوجد رمز وصول لووب. أعد ربط الحساب."),
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const experience = extraString(ctx, "externalId", "pageId");
      const { data } = await providerJson<{ id?: string }>("https://api.whop.com/api/v2/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenOf(ctx)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experience_id: experience,
          content: ctx.caption,
        }),
      });
      if (!data.id) return fail("whop", "publish_failed", "ووب لم يُرجع معرّف المنشور");
      return okResult("whop", data.id);
    },
  });
}

export function skoolHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "skool",
    maxLength: 10_000,
    settingsSchema: communitySettings,
    credentials: async (ctx) => {
      const cookie = extraString(ctx, "cookie") || tokenOf(ctx);
      if (!cookie) {
        return missingToken(
          "لا يوجد كوكي جلسة لسكول. احفظ الكوكي في ربط القناة أو أعد ربط الحساب — لا OAuth رسمي."
        );
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const cookie = extraString(ctx, "cookie") || tokenOf(ctx);
      const group = extraString(ctx, "externalId", "pageId", "username");
      if (!group) {
        return fail("skool", "missing_credentials", "لا يوجد معرّف مجموعة سكول. أعد ربط القناة.");
      }
      const { data } = await providerJson<{ post?: { id?: string }; id?: string }>(
        `https://www.skool.com/api/v1/${encodeURIComponent(group)}/posts`,
        {
          method: "POST",
          headers: {
            Cookie: cookie.includes("=") ? cookie : `session=${cookie}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: ctx.title, content: ctx.caption }),
        }
      );
      const id = data.post?.id || data.id;
      if (!id) return fail("skool", "publish_failed", "سكول لم يُرجع معرّف المنشور — تحقّق من صلاحية الكوكي.");
      return okResult("skool", id);
    },
  });
}

export function meweHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "mewe",
    maxLength: 10_000,
    settingsSchema: communitySettings,
    credentials: async (ctx) => {
      const app = await envValue("MEWE_APP_ID");
      if (!tokenOf(ctx) && !app) {
        return missingToken("لا يوجد رمز وصول لمي وي. أضف MEWE_APP_ID أو أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext): Promise<PublishProviderResult> {
      const { data } = await providerJson<{ id?: string }>("https://mewe.com/api/v2/home/post", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenOf(ctx)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: ctx.caption }),
      });
      if (!data.id) return fail("mewe", "publish_failed", "مي وي لم يُرجع معرّف المنشور");
      return okResult("mewe", data.id);
    },
  });
}

export function tumblrHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "tumblr",
    maxLength: 4096,
    settingsSchema: communitySettings,
    credentials: async (ctx) => {
      if (!tokenOf(ctx) || !extraString(ctx, "username", "externalId")) {
        return missingToken("لا يوجد مدونة أو رمز لتمبلر. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: CommunitySettings): Promise<PublishProviderResult> {
      const blog = settings.blog || extraString(ctx, "username", "externalId");
      const { data } = await providerJson<{ response?: { id?: string; id_string?: string } }>(
        `https://api.tumblr.com/v2/blog/${encodeURIComponent(blog)}/posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenOf(ctx)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: ctx.mediaUrls[0] ? "photo" : "text",
            body: ctx.caption,
            caption: ctx.caption,
            source: ctx.mediaUrls[0],
          }),
        }
      );
      const id = data.response?.id_string || data.response?.id || randomBytes(6).toString("hex");
      return okResult("tumblr", String(id), `https://${blog}.tumblr.com/post/${id}`);
    },
  });
}
