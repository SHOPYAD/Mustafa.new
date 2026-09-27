import { z } from "zod";
import PDFDocument from "pdfkit";
import { Jimp } from "jimp";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  asBoolean,
  createHttpHandler,
  downloadBuffer,
  envValue,
  fail,
  firstCommentOf,
  isVideoPath,
  missingToken,
  okResult,
  pollDelayMs,
  providerFetch,
  providerJson,
  ProviderHttpError,
  sleep,
  type ValidatingPublishHandler,
} from "./http-base";

const LI_VERSION = "202601";
const LI_REST = "https://api.linkedin.com/rest";
const LI_V2 = "https://api.linkedin.com/v2";
const CHUNK = 2 * 1024 * 1024;

const linkedinSettingsSchema = z
  .object({
    post_as_images_carousel: z.boolean().optional(),
    carousel_name: z.string().optional(),
    firstComment: z.string().optional(),
  })
  .passthrough();

type LinkedinSettings = z.infer<typeof linkedinSettingsSchema>;
type AuthorKind = "personal" | "company";

function liHeaders(token: string, extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": LI_VERSION,
    ...extra,
  };
}

function fixText(text: string): string {
  const pattern = /@\[.+?]\(urn:li:organization.+?\)/g;
  const matches = text.match(pattern) || [];
  const parts = text.split(pattern);
  const reformatted = parts.map((p) =>
    p
      .replace(/\\/g, "\\\\")
      .replace(/</g, "\\<")
      .replace(/>/g, "\\>")
      .replace(/#/g, "\\#")
      .replace(/~/g, "\\~")
      .replace(/_/g, "\\_")
      .replace(/\|/g, "\\|")
      .replace(/\[/g, "\\[")
      .replace(/]/g, "\\]")
      .replace(/\*/g, "\\*")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\{/g, "\\{")
      .replace(/}/g, "\\}")
      .replace(/@/g, "\\@")
  );
  const out: string[] = [];
  for (const current of reformatted) {
    out.push(current);
    const match = matches.shift();
    if (match) out.push(match);
  }
  return out.join("");
}

function extraValidate(ctx: PublishContext, settings: LinkedinSettings) {
  const media = ctx.mediaUrls;
  const carousel = asBoolean(settings.post_as_images_carousel);
  const hasVideo = media.some(isVideoPath);
  if (carousel && (media.length < 2 || hasVideo)) {
    return [
      {
        code: "invalid_input",
        field: "mediaUrls",
        message: "الكاروسيل يحتاج صورتين على الأقل بدون فيديو.",
      },
    ];
  }
  if (hasVideo && media.length > 1) {
    return [
      {
        code: "invalid_input",
        field: "mediaUrls",
        message: "عند اختيار فيديو لا يمكن إرفاق أكثر من ملف واحد.",
      },
    ];
  }
  const comment = firstCommentOf(settings);
  const commentMedia = settings.commentMediaUrls;
  if (comment && Array.isArray(commentMedia) && commentMedia.length > 0) {
    return [
      {
        code: "invalid_input",
        field: "firstComment",
        message: "تعليقات لينكدإن نص فقط.",
      },
    ];
  }
  return [];
}

async function imagesToPdf(buffers: Buffer[]): Promise<Buffer> {
  const prepared: { buffer: Buffer; width: number; height: number }[] = [];
  for (const raw of buffers) {
    const image = await Jimp.read(raw);
    if (image.width > 6000 || image.height > 6000) {
      image.contain({ w: 6000, h: 6000 });
    }
    const jpeg = await image.getBuffer("image/jpeg");
    prepared.push({
      buffer: Buffer.from(jpeg),
      width: image.width || 1080,
      height: image.height || 1080,
    });
  }
  const largest = prepared.reduce((max, img) =>
    img.width * img.height > max.width * max.height ? img : max
  );
  const pageW = Math.min(Math.max(largest.width, 72), 14_400);
  const pageH = Math.min(Math.max(largest.height, 72), 14_400);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    for (const img of prepared) {
      doc.addPage({ size: [pageW, pageH] });
      doc.image(img.buffer, 0, 0, {
        fit: [pageW, pageH],
        align: "center",
        valign: "center",
      });
    }
    doc.end();
  });
}

async function prepareImageBuffer(url: string): Promise<Buffer> {
  const { buffer, contentType } = await downloadBuffer(url);
  if (contentType === "image/gif" || /\.gif(?:$|\?)/i.test(url)) return buffer;
  try {
    const image = await Jimp.read(buffer);
    if (image.width > 6000 || image.height > 6000) {
      image.contain({ w: 6000, h: 6000 });
    }
    if (contentType === "image/png" || contentType === "image/jpeg") {
      return Buffer.from(await image.getBuffer(contentType));
    }
    return Buffer.from(await image.getBuffer("image/jpeg"));
  } catch {
    return buffer;
  }
}

type UploadInit = {
  value?: {
    uploadUrl?: string;
    image?: string;
    video?: string;
    document?: string;
    uploadInstructions?: Array<{ uploadUrl?: string }>;
  };
};

async function uploadMedia(
  accessToken: string,
  ownerId: string,
  kind: AuthorKind,
  fileName: string,
  payload: Buffer,
  isVideo: boolean,
  isPdf: boolean
): Promise<{ id: string; poll?: { urn: string; endpoint: "videos" | "images" | "documents" }; grace?: boolean }> {
  const endpoint = isVideo ? "videos" : isPdf ? "documents" : "images";
  const init = await providerJson<UploadInit>(
    `${LI_REST}/${endpoint}?action=initializeUpload`,
    {
      method: "POST",
      headers: liHeaders(accessToken, { "Content-Type": "application/json" }),
      body: JSON.stringify({
        initializeUploadRequest: {
          owner:
            kind === "personal"
              ? `urn:li:person:${ownerId}`
              : `urn:li:organization:${ownerId}`,
          ...(isVideo
            ? { fileSizeBytes: payload.length, uploadCaptions: false, uploadThumbnail: false }
            : {}),
        },
      }),
    }
  );
  const value = init.data.value || {};
  const uploadUrl = value.uploadInstructions?.[0]?.uploadUrl || value.uploadUrl;
  const finalId = value.video || value.image || value.document;
  if (!uploadUrl || !finalId) {
    throw new Error("لينكدإن لم يُرجع رابط الرفع");
  }

  if (isVideo) {
    const etags: string[] = [];
    for (let i = 0; i < payload.length; i += CHUNK) {
      const part = payload.subarray(i, i + CHUNK);
      const uploaded = await providerFetch(uploadUrl, {
        method: "PUT",
        headers: liHeaders(accessToken, { "Content-Type": "application/octet-stream" }),
        body: new Uint8Array(part),
      });
      if (!uploaded.ok) {
        throw new ProviderHttpError("فشل رفع فيديو لينكدإن", uploaded.status, uploaded.status >= 500);
      }
      const etag = uploaded.headers.get("etag");
      if (etag) etags.push(etag);
    }
    await providerJson(`${LI_REST}/videos?action=finalizeUpload`, {
      method: "POST",
      headers: liHeaders(accessToken, { "Content-Type": "application/json" }),
      body: JSON.stringify({
        finalizeUploadRequest: {
          video: finalId,
          uploadToken: "",
          uploadedPartIds: etags,
        },
      }),
    });
    return { id: finalId, poll: { urn: finalId, endpoint: "videos" } };
  }

  const put = await providerFetch(uploadUrl, {
    method: "PUT",
    headers: liHeaders(accessToken, {
      ...(isPdf ? { "Content-Type": "application/pdf" } : {}),
    }),
    body: new Uint8Array(payload),
  });
  if (!put.ok) {
    throw new ProviderHttpError("فشل رفع وسائط لينكدإن", put.status, put.status >= 500);
  }
  if (kind === "company") {
    return {
      id: finalId,
      poll: { urn: finalId, endpoint: isPdf ? "documents" : "images" },
    };
  }
  return { id: finalId, grace: true };
}

async function waitMedia(
  accessToken: string,
  poll: { urn: string; endpoint: "videos" | "images" | "documents" }[],
  grace: boolean
): Promise<void> {
  const remaining = [...poll];
  let stalls = 0;
  const started = Date.now();
  const budget = process.env.VITEST ? 8_000 : 8 * 60_000;
  while (remaining.length || grace) {
    if (Date.now() - started > budget) {
      throw new Error("استغرق لينكدإن وقتاً طويلاً لمعالجة الوسائط");
    }
    for (let i = remaining.length - 1; i >= 0; i--) {
      const media = remaining[i];
      try {
        const { data } = await providerJson<{ status?: string; processingFailureReason?: string }>(
          `${LI_REST}/${media.endpoint}/${encodeURIComponent(media.urn)}`,
          { headers: liHeaders(accessToken, { "Content-Type": "application/json" }) }
        );
        if (!data.status) throw new Error("no-status");
        if (data.status === "PROCESSING_FAILED") {
          throw new Error(
            `فشلت معالجة وسائط لينكدإن${data.processingFailureReason ? `: ${data.processingFailureReason}` : ""}`
          );
        }
        if (data.status === "AVAILABLE") remaining.splice(i, 1);
        stalls = 0;
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("فشلت")) throw err;
        stalls += 1;
        if (stalls >= 10) {
          throw new Error("تعذر تأكيد جاهزية وسائط لينكدإن");
        }
      }
    }
    if (!remaining.length) {
      if (grace) {
        await sleep(pollDelayMs() || (process.env.VITEST ? 0 : 1_000));
        grace = false;
      }
      break;
    }
    await sleep(process.env.VITEST ? 0 : 20_000);
  }
}

function postContent(isPdf: boolean, mediaIds: string[], pdfTitle?: string): Record<string, unknown> {
  if (mediaIds.length === 0) return {};
  if (mediaIds.length === 1) {
    return {
      content: {
        media: {
          ...(isPdf ? { title: pdfTitle || "slides" } : {}),
          id: mediaIds[0],
        },
      },
    };
  }
  return {
    content: {
      multiImage: {
        images: mediaIds.map((id) => ({ id })),
      },
    },
  };
}

async function createLinkedInPost(
  accessToken: string,
  authorId: string,
  kind: AuthorKind,
  message: string,
  mediaIds: string[],
  isPdf: boolean,
  pdfTitle?: string
): Promise<string> {
  const author =
    kind === "personal" ? `urn:li:person:${authorId}` : `urn:li:organization:${authorId}`;
  const payload = {
    author,
    commentary: fixText(message),
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [] as string[],
      thirdPartyDistributionChannels: [] as string[],
    },
    ...postContent(isPdf, mediaIds, pdfTitle),
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
  const res = await providerFetch(`${LI_REST}/posts`, {
    method: "POST",
    headers: liHeaders(accessToken, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (res.status !== 201 && res.status !== 200) {
    const text = await res.text();
    throw new ProviderHttpError(
      "فشل النشر على لينكدإن",
      res.status,
      res.status >= 500,
      text
    );
  }
  const id = res.headers.get("x-restli-id") || "";
  if (!id) throw new Error("لينكدإن لم يُرجع معرّف المنشور");
  return id;
}

async function createLinkedInComment(
  accessToken: string,
  authorId: string,
  kind: AuthorKind,
  postId: string,
  text: string
): Promise<void> {
  const actor =
    kind === "personal" ? `urn:li:person:${authorId}` : `urn:li:organization:${authorId}`;
  await providerJson(
    `${LI_REST}/socialActions/${encodeURIComponent(postId)}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202306",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actor,
        object: postId,
        message: { text: fixText(text) },
      }),
    }
  );
}

async function resolvePersonId(ctx: PublishContext): Promise<string> {
  const existing = (ctx.channel.extra.externalId || "").trim();
  if (existing) return existing;
  const { data } = await providerJson<{ sub?: string }>(`${LI_V2}/userinfo`, {
    headers: { Authorization: `Bearer ${ctx.accessToken}` },
  });
  if (!data.sub) throw new Error("تعذر قراءة معرّف مستخدم لينكدإن");
  return data.sub;
}

async function linkedinClient(): Promise<{ id: string; secret: string }> {
  return {
    id: await envValue("LINKEDIN_CLIENT_ID"),
    secret: await envValue("LINKEDIN_CLIENT_SECRET"),
  };
}

async function refreshLinkedIn(ctx: PublishContext) {
  const refresh = (ctx.refreshToken || "").trim();
  if (!refresh) {
    return { refreshNeeded: true };
  }
  const client = await linkedinClient();
  if (!client.id || !client.secret) {
    return { refreshNeeded: true };
  }
  const { data } = await providerJson<{
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  }>("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
      client_id: client.id,
      client_secret: client.secret,
    }).toString(),
  });
  if (!data.access_token) {
    return { refreshNeeded: true };
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refresh,
    tokenExpiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined,
    refreshNeeded: false,
  };
}

function createLinkedInHandler(id: "linkedin" | "linkedin-page", kind: AuthorKind): ValidatingPublishHandler {
  return createHttpHandler({
    id,
    maxLength: 3000,
    settingsSchema: linkedinSettingsSchema,
    extraValidate,
    credentials: async (ctx) => {
      if (!(ctx.accessToken || "").trim()) {
        return missingToken("لا يوجد رمز وصول للينكدإن. أعد ربط الحساب.");
      }
      if (kind === "company") {
        const org = (ctx.channel.extra.pageId || ctx.channel.extra.externalId || "").trim();
        if (!org) {
          return missingToken("لا يوجد معرّف لصفحة لينكدإن. أعد ربط الصفحة.");
        }
      }
      return { ok: true };
    },
    refresh: refreshLinkedIn,
    async publishApproved(ctx: PublishContext, settings: LinkedinSettings) {
      const token = ctx.accessToken;
      const authorId =
        kind === "company"
          ? (ctx.channel.extra.pageId || ctx.channel.extra.externalId || "").trim()
          : await resolvePersonId(ctx);
      if (!authorId) {
        return fail(id, "missing_credentials", "لا يوجد معرّف ناشر لينكدإن. أعد ربط الحساب.");
      }
      const carousel = asBoolean(settings.post_as_images_carousel);
      let mediaIds: string[] = [];
      const poll: { urn: string; endpoint: "videos" | "images" | "documents" }[] = [];
      let grace = false;
      let isPdf = carousel;

      if (carousel && ctx.mediaUrls.length >= 2) {
        const buffers: Buffer[] = [];
        for (const url of ctx.mediaUrls) {
          const { buffer } = await downloadBuffer(url);
          buffers.push(buffer);
        }
        const pdf = await imagesToPdf(buffers);
        const uploaded = await uploadMedia(
          token,
          authorId,
          kind,
          "carousel.pdf",
          pdf,
          false,
          true
        );
        mediaIds = [uploaded.id];
        if (uploaded.poll) poll.push(uploaded.poll);
        if (uploaded.grace) grace = true;
      } else {
        for (const url of ctx.mediaUrls) {
          const video = isVideoPath(url);
          const payload = video
            ? (await downloadBuffer(url, { maxBytes: 200 * 1024 * 1024 })).buffer
            : await prepareImageBuffer(url);
          const uploaded = await uploadMedia(
            token,
            authorId,
            kind,
            url,
            payload,
            video,
            false
          );
          mediaIds.push(uploaded.id);
          if (uploaded.poll) poll.push(uploaded.poll);
          if (uploaded.grace) grace = true;
        }
      }

      await waitMedia(token, poll, grace);
      const postId = await createLinkedInPost(
        token,
        authorId,
        kind,
        ctx.caption,
        mediaIds,
        isPdf,
        settings.carousel_name
      );
      const comment = firstCommentOf(settings);
      if (comment) {
        await createLinkedInComment(token, authorId, kind, postId, comment);
      }
      return okResult(id, postId, `https://www.linkedin.com/feed/update/${postId}`);
    },
  });
}

export function linkedinHandler(): ValidatingPublishHandler {
  return createLinkedInHandler("linkedin", "personal");
}

export function linkedinPageHandler(): ValidatingPublishHandler {
  return createLinkedInHandler("linkedin-page", "company");
}
