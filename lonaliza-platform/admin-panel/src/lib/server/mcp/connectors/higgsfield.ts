import { getMcpSecret } from "@/lib/server/mcp/store";
import {
  downloadToBuffer,
  notifyStudioReadyForApproval,
  queueStudioPublishApproval,
  saveGeneratedStudioAsset,
} from "./studio-handoff";

const HF_API = "https://api.higgsfield.ai";

export const HF_IMAGE_ENDPOINT = "/higgsfield-ai/soul/standard";
export const HF_VIDEO_TEXT_ENDPOINT = "/bytedance/seedance/v1/lite/text-to-video";
export const HF_VIDEO_IMAGE_ENDPOINT = "/higgsfield-ai/dop/lite";

const ALLOWED_ENDPOINTS = new Set([
  HF_IMAGE_ENDPOINT,
  HF_VIDEO_TEXT_ENDPOINT,
  HF_VIDEO_IMAGE_ENDPOINT,
  "/higgsfield-ai/dop/standard",
  "/higgsfield-ai/soul/v2/standard",
  "/kling-video/v2.5-turbo/pro/text-to-video",
]);

export type HiggsfieldCallResult = { ok: boolean; content: string; error?: string };

type HfStatus = {
  status?: string;
  request_id?: string;
  status_url?: string;
  error?: string;
  detail?: string;
  images?: Array<{ url?: string }>;
  video?: { url?: string };
};

function redact(message: string): string {
  return message.replace(/(Key|Bearer|token|secret|HF_)\s*[:=]\s*\S+/gi, "$1=[redacted]");
}

async function higgsfieldAuth(serverId: string): Promise<{ keyId: string; secret: string }> {
  const stored = await getMcpSecret(serverId);
  const keyId = (stored.env?.HF_API_KEY_ID || stored.env?.HF_KEY_ID || "").trim();
  const secret = (stored.env?.HF_API_SECRET || stored.env?.HF_KEY_SECRET || stored.apiKey || "").trim();
  const combined = (stored.env?.HF_CREDENTIALS || "").trim();
  if (combined.includes(":")) {
    const [id, sec] = combined.split(":");
    if (id && sec) return { keyId: id, secret: sec };
  }
  if (!keyId || !secret) {
    throw new Error("الصقوا HF_API_KEY_ID و HF_API_SECRET من cloud.higgsfield.ai");
  }
  return { keyId, secret };
}

function authHeader(keyId: string, secret: string): string {
  return `Key ${keyId}:${secret}`;
}

async function hfFetch(serverId: string, path: string, init?: RequestInit): Promise<{
  ok: boolean;
  status: number;
  data: HfStatus;
}> {
  const creds = await higgsfieldAuth(serverId);
  const res = await fetch(`${HF_API}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(creds.keyId, creds.secret),
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as HfStatus;
  return { ok: res.ok, status: res.status, data };
}

export async function verifyHiggsfield(serverId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await higgsfieldAuth(serverId);
    const probe = await hfFetch(serverId, "/requests/00000000-0000-4000-8000-000000000000/status");
    if (probe.status === 401 || probe.status === 403) {
      return { ok: false, error: "مفاتيح Higgsfield مرفوضة — راجعوا Key ID و Secret" };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: redact(error instanceof Error ? error.message : "فشل Higgsfield") };
  }
}

async function pollRequest(serverId: string, requestId: string, timeoutMs: number): Promise<HfStatus> {
  const deadline = Date.now() + timeoutMs;
  let delay = 2500;
  while (Date.now() < deadline) {
    const result = await hfFetch(serverId, `/requests/${encodeURIComponent(requestId)}/status`);
    const status = result.data.status;
    if (status === "completed") return result.data;
    if (status === "failed" || status === "nsfw" || status === "canceled") {
      throw new Error(result.data.error || result.data.detail || `Higgsfield ${status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay + 1000, 8000);
  }
  throw new Error("انتهت مهلة توليد Higgsfield");
}

function safeEndpoint(raw: unknown, fallback: string): string {
  const value = String(raw || "").trim();
  if (!value) return fallback;
  const path = value.startsWith("/") ? value : `/${value}`;
  if (!ALLOWED_ENDPOINTS.has(path)) {
    throw new Error("مسار Higgsfield غير مسموح");
  }
  return path;
}

export async function callHiggsfieldTool(
  serverId: string,
  tool: string,
  args: Record<string, unknown>
): Promise<HiggsfieldCallResult> {
  try {
    switch (tool) {
      case "higgsfield.health": {
        const health = await verifyHiggsfield(serverId);
        return {
          ok: health.ok,
          content: health.ok ? "Higgsfield جاهز" : "",
          error: health.error,
        };
      }
      case "higgsfield.generate_image": {
        const prompt = String(args.prompt || args.caption || "منظر سياحي لتركيا — لوناليزا").slice(0, 2000);
        const endpoint = safeEndpoint(args.endpoint, HF_IMAGE_ENDPOINT);
        const submitted = await hfFetch(serverId, endpoint, {
          method: "POST",
          body: JSON.stringify({ prompt, num_images: 1, aspect_ratio: "4:5" }),
        });
        const requestId = submitted.data.request_id;
        if (!submitted.ok || !requestId) {
          return {
            ok: false,
            content: "",
            error: redact(submitted.data.detail || submitted.data.error || `Higgsfield ${submitted.status}`),
          };
        }
        const done = await pollRequest(serverId, requestId, 120_000);
        const url = done.images?.[0]?.url;
        if (!url) return { ok: false, content: "", error: "لا صورة من Higgsfield" };
        const asset = await saveGeneratedStudioAsset({
          kind: "image",
          buffer: await downloadToBuffer(url),
          ext: ".png",
          fileHint: prompt,
          caption: prompt,
        });
        await notifyStudioReadyForApproval({ caption: prompt, asset });
        return { ok: true, content: JSON.stringify({ ...asset, requestId, source: "higgsfield" }) };
      }
      case "higgsfield.generate_video": {
        const prompt = String(args.prompt || args.caption || "ريل سياحي قصير عن تركيا — لوناليزا").slice(0, 2000);
        const imageUrl = String(args.imageUrl || args.image_url || "").trim();
        const endpoint = safeEndpoint(
          args.endpoint,
          imageUrl ? HF_VIDEO_IMAGE_ENDPOINT : HF_VIDEO_TEXT_ENDPOINT
        );
        const body = imageUrl
          ? { prompt, image_url: imageUrl, enhance_prompt: true }
          : { prompt, duration: 5, resolution: "720", aspect_ratio: "9:16" };
        const submitted = await hfFetch(serverId, endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
        const requestId = submitted.data.request_id;
        if (!submitted.ok || !requestId) {
          return {
            ok: false,
            content: "",
            error: redact(submitted.data.detail || submitted.data.error || `Higgsfield ${submitted.status}`),
          };
        }
        const done = await pollRequest(serverId, requestId, 180_000);
        const url = done.video?.url;
        if (!url) return { ok: false, content: "", error: "لا فيديو من Higgsfield" };
        const asset = await saveGeneratedStudioAsset({
          kind: "video",
          buffer: await downloadToBuffer(url),
          ext: ".mp4",
          fileHint: prompt,
          caption: prompt,
        });
        await notifyStudioReadyForApproval({ caption: prompt, asset });
        return { ok: true, content: JSON.stringify({ ...asset, requestId, source: "higgsfield" }) };
      }
      case "higgsfield.submit_publish": {
        if (args.approved === true) {
          return { ok: false, content: "", error: "النشر يتم فقط بعد موافقة تيليجرام — لا approved من الوكيل" };
        }
        const queued = await queueStudioPublishApproval(String(args.caption || "فيديو Higgsfield"));
        return { ok: queued.ok, content: queued.content };
      }
      default:
        return { ok: false, content: "", error: `أداة Higgsfield غير معروفة: ${tool}` };
    }
  } catch (error) {
    return { ok: false, content: "", error: redact(error instanceof Error ? error.message : "فشل Higgsfield") };
  }
}
