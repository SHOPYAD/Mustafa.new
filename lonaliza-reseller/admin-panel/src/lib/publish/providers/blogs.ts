import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  createHttpHandler,
  extraString,
  fail,
  missingToken,
  okResult,
  providerJson,
  slugifyName,
  type ValidatingPublishHandler,
} from "./http-base";

const blogSettings = z
  .object({
    title: z.string().optional(),
    tags: z.string().optional(),
    canonical: z.string().optional(),
    publicationId: z.string().optional(),
    publication: z.string().optional(),
  })
  .passthrough();

type BlogSettings = z.infer<typeof blogSettings>;

function titleOf(ctx: PublishContext, settings: BlogSettings): string {
  return (ctx.title || settings.title || ctx.caption.split("\n")[0] || "منشور سياحي").trim();
}

export function mediumHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "medium",
    maxLength: 100_000,
    settingsSchema: blogSettings,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لميديوم. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: BlogSettings): Promise<PublishProviderResult> {
      const userId = extraString(ctx, "externalId") || "me";
      const { data } = await providerJson<{ data?: { id?: string; url?: string } }>(
        `https://api.medium.com/v1/users/${encodeURIComponent(userId)}/posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: titleOf(ctx, settings),
            contentFormat: "html",
            content: `<p>${ctx.caption.replace(/\n/g, "</p><p>")}</p>`,
            publishStatus: "public",
            canonicalUrl: settings.canonical,
          }),
        }
      );
      if (!data.data?.id) return fail("medium", "publish_failed", "ميديوم لم يُرجع معرّف المقال");
      return okResult("medium", data.data.id, data.data.url);
    },
  });
}

export function devtoHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "devto",
    maxLength: 100_000,
    settingsSchema: blogSettings,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد مفتاح API لديف.تو. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: BlogSettings): Promise<PublishProviderResult> {
      const { data } = await providerJson<{ id?: number; url?: string }>("https://dev.to/api/articles", {
        method: "POST",
        headers: {
          "api-key": ctx.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article: {
            title: titleOf(ctx, settings),
            body_markdown: ctx.caption,
            published: true,
            tags: settings.tags ? settings.tags.split(",").map((row) => row.trim()).filter(Boolean) : undefined,
          },
        }),
      });
      if (!data.id) return fail("devto", "publish_failed", "ديف.تو لم يُرجع معرّف المقال");
      return okResult("devto", String(data.id), data.url);
    },
  });
}

export function hashnodeHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "hashnode",
    maxLength: 100_000,
    settingsSchema: blogSettings,
    extraValidate: (ctx, settings) => {
      const publication = String(
        settings.publicationId || settings.publication || extraString(ctx, "publicationId", "publication")
      ).trim();
      if (!publication) {
        return [{ code: "invalid_input", field: "publication", message: "هاشنود يتطلب معرّف publication." }];
      }
      return [];
    },
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول لهاشنود. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: BlogSettings): Promise<PublishProviderResult> {
      const publicationId = String(
        settings.publicationId || settings.publication || extraString(ctx, "publicationId", "publication")
      ).trim();
      const { data } = await providerJson<{
        data?: { publishPost?: { post?: { id?: string; url?: string } } };
        errors?: Array<{ message?: string }>;
      }>("https://gql.hashnode.com/", {
        method: "POST",
        headers: {
          Authorization: ctx.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query:
            "mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { id url } } }",
          variables: {
            input: {
              publicationId,
              title: titleOf(ctx, settings),
              contentMarkdown: ctx.caption,
            },
          },
        }),
      });
      const post = data.data?.publishPost?.post;
      if (!post?.id) {
        return fail("hashnode", "publish_failed", data.errors?.[0]?.message || "فشل النشر على هاشنود");
      }
      return okResult("hashnode", post.id, post.url);
    },
  });
}

export function wordpressHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "wordpress",
    maxLength: 100_000,
    settingsSchema: blogSettings,
    credentials: async (ctx) => {
      const site = extraString(ctx, "domain", "instance", "externalId");
      const user = extraString(ctx, "username");
      const pass = extraString(ctx, "password") || (ctx.accessToken || "").trim();
      if (!site || !user || !pass) {
        return missingToken("لا يوجد موقع أو مستخدم لووردبريس. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: BlogSettings): Promise<PublishProviderResult> {
      const site = extraString(ctx, "domain", "instance", "externalId").replace(/\/$/, "");
      const user = extraString(ctx, "username");
      const pass = extraString(ctx, "password") || ctx.accessToken;
      const basic = Buffer.from(`${user}:${pass}`).toString("base64");
      const { data } = await providerJson<{ id?: number; link?: string }>(`${site}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: titleOf(ctx, settings),
          content: ctx.caption,
          status: "publish",
          slug: slugifyName(titleOf(ctx, settings)),
        }),
      });
      if (!data.id) return fail("wordpress", "publish_failed", "ووردبريس لم يُرجع معرّف المقال");
      return okResult("wordpress", String(data.id), data.link);
    },
  });
}

export function listmonkHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "listmonk",
    maxLength: 100_000,
    settingsSchema: blogSettings,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim() || !extraString(ctx, "instance", "externalId")) {
        return missingToken("لا يوجد خادم أو رمز لليستمونك. أعد ربط الحساب.");
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: BlogSettings): Promise<PublishProviderResult> {
      const base = extraString(ctx, "instance", "externalId").replace(/\/$/, "");
      const lists = extraString(ctx, "pageId")
        .split(",")
        .map((row) => Number(row.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);
      const { data } = await providerJson<{ data?: { id?: number } }>(`${base}/api/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${ctx.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: titleOf(ctx, settings),
          subject: titleOf(ctx, settings),
          lists: lists.length ? lists : [1],
          type: "regular",
          content_type: "html",
          body: `<p>${ctx.caption.replace(/\n/g, "<br/>")}</p>`,
        }),
      });
      const id = data.data?.id;
      if (!id) return fail("listmonk", "publish_failed", "ليستمونك لم يُرجع معرّف الحملة");
      return okResult("listmonk", String(id));
    },
  });
}
