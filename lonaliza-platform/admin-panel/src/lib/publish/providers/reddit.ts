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

const redditSettingsSchema = z
  .object({
    subreddit: z.unknown().optional(),
    title: z.string().optional(),
    flair_id: z.string().optional(),
    nsfw: z.union([z.boolean(), z.string()]).optional(),
  })
  .passthrough();

type RedditSettings = z.infer<typeof redditSettingsSchema>;

function subredditEntry(settings: RedditSettings): { subreddit?: string; title?: string; type?: string } {
  const raw = settings.subreddit as unknown;
  if (typeof raw === "string") return { subreddit: raw };
  if (Array.isArray(raw)) {
    const first = raw[0] as { value?: { subreddit?: string; title?: string; type?: string } } | undefined;
    return first?.value || {};
  }
  if (raw && typeof raw === "object") return raw as { subreddit?: string; title?: string; type?: string };
  return {};
}

function subredditOf(ctx: PublishContext, settings: RedditSettings): string {
  const fromSettings = subredditEntry(settings).subreddit || "";
  return (fromSettings || extraString(ctx, "subreddit") || "").replace(/^r\//, "").trim();
}

export function redditHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "reddit",
    maxLength: 40_000,
    settingsSchema: redditSettingsSchema,
    extraValidate: (ctx, settings) => {
      if (!subredditOf(ctx, settings)) {
        return [{ code: "invalid_input", field: "subreddit", message: "ريديت يتطلب مجتمعاً (subreddit)." }];
      }
      const entry = subredditEntry(settings);
      if (entry.type === "media" && ctx.mediaUrls.length !== 1) {
        return [{ code: "invalid_input", field: "mediaUrls", message: "منشور ريديت من نوع وسائط يحتاج ملفاً واحداً." }];
      }
      if (!(ctx.title || settings.title || entry.title || ctx.caption).trim()) {
        return [{ code: "invalid_input", field: "title", message: "ريديت يتطلب عنواناً." }];
      }
      return [];
    },
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لريديت. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: RedditSettings): Promise<PublishProviderResult> {
      const sr = subredditOf(ctx, settings);
      const title = (ctx.title || settings.title || ctx.caption.split("\n")[0] || "").trim();
      const url = ctx.mediaUrls.find((item) => !isVideoPath(item));
      const kind = url ? "link" : "self";
      const fields: Record<string, string> = { api_type: "json", sr, kind, title };
      if (kind === "link" && url) fields.url = url;
      else fields.text = ctx.caption;
      if (settings.flair_id) fields.flair_id = settings.flair_id;
      const body = new URLSearchParams(fields);
      const { data } = await providerJson<{
        json?: { data?: { id?: string; url?: string; name?: string }; errors?: unknown[] };
      }>("https://oauth.reddit.com/api/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "lonaliza-publish/1.0",
        },
        body: body.toString(),
      });
      const id = data.json?.data?.id || data.json?.data?.name;
      if (!id) {
        return fail("reddit", "publish_failed", "ريديت لم يُرجع معرّف المنشور");
      }
      return okResult("reddit", id, data.json?.data?.url);
    },
  });
}
