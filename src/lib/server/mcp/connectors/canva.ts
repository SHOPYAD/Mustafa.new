import { getMcpSecret } from "@/lib/server/mcp/store";
import {
  downloadToBuffer,
  notifyStudioReadyForApproval,
  queueStudioPublishApproval,
  saveGeneratedStudioAsset,
} from "./studio-handoff";

const CANVA_API = "https://api.canva.com/rest/v1";

export type CanvaCallResult = { ok: boolean; content: string; error?: string };

function redact(message: string): string {
  return message.replace(/(Bearer|token|key|secret)\s*[:=]\s*\S+/gi, "$1=[redacted]");
}

async function canvaToken(serverId: string): Promise<string> {
  const secret = await getMcpSecret(serverId);
  const token = (secret.env?.CANVA_ACCESS_TOKEN || secret.oauthToken || secret.apiKey || "").trim();
  if (!token) throw new Error("الصقوا CANVA_ACCESS_TOKEN من Canva Connect (developers.canva.com)");
  return token;
}

async function canvaFetch<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${CANVA_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export async function verifyCanva(serverId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = await canvaToken(serverId);
    const result = await canvaFetch<{ display_name?: string; message?: string }>(token, "/users/me");
    if (!result.ok) {
      return { ok: false, error: redact(result.data.message || `Canva ${result.status}`) };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: redact(error instanceof Error ? error.message : "فشل Canva") };
  }
}

const PRESET_TYPES = ["doc", "email", "presentation", "whiteboard"] as const;
type CanvaPreset = (typeof PRESET_TYPES)[number];

function isPreset(value: string): value is CanvaPreset {
  return (PRESET_TYPES as readonly string[]).includes(value);
}

async function pollExport(token: string, exportId: string): Promise<string[]> {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const result = await canvaFetch<{
      job?: { status?: string; urls?: string[]; error?: { message?: string } };
    }>(token, `/exports/${encodeURIComponent(exportId)}`);
    const status = result.data.job?.status;
    if (status === "success") {
      return result.data.job?.urls || [];
    }
    if (status === "failed") {
      throw new Error(result.data.job?.error?.message || "فشل تصدير كانفا");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("انتهت مهلة تصدير كانفا");
}

export async function callCanvaTool(
  serverId: string,
  tool: string,
  args: Record<string, unknown>
): Promise<CanvaCallResult> {
  try {
    const token = await canvaToken(serverId);
    switch (tool) {
      case "canva.health": {
        const health = await verifyCanva(serverId);
        return { ok: health.ok, content: health.ok ? "Canva Connect جاهز" : "", error: health.error };
      }
      case "canva.create_design": {
        const title = String(args.title || args.caption || "تصميم الريان").slice(0, 255);
        const preset = String(args.preset || "");
        const width = Number(args.width || 1080);
        const height = Number(args.height || 1080);
        const body = isPreset(preset)
          ? { design_type: { type: "preset", name: preset }, title }
          : { design_type: { type: "custom", width, height }, title };
        const result = await canvaFetch<{
          design?: { id?: string; urls?: { edit_url?: string; view_url?: string } };
          message?: string;
        }>(token, "/designs", { method: "POST", body: JSON.stringify(body) });
        if (!result.ok || !result.data.design?.id) {
          return { ok: false, content: "", error: redact(result.data.message || `Canva ${result.status}`) };
        }
        return {
          ok: true,
          content: JSON.stringify({
            designId: result.data.design.id,
            editUrl: result.data.design.urls?.edit_url,
            viewUrl: result.data.design.urls?.view_url,
          }),
        };
      }
      case "canva.export": {
        const designId = String(args.designId || args.design_id || "").trim();
        if (!designId) return { ok: false, content: "", error: "designId مطلوب" };
        const format = String(args.format || "png").toLowerCase() === "mp4" ? "mp4" : "png";
        const exportBody =
          format === "mp4"
            ? { design_id: designId, format: { type: "mp4", quality: "horizontal_1080p" } }
            : { design_id: designId, format: { type: "png" } };
        const created = await canvaFetch<{
          job?: { id?: string };
          message?: string;
        }>(token, "/exports", { method: "POST", body: JSON.stringify(exportBody) });
        const exportId = created.data.job?.id;
        if (!created.ok || !exportId) {
          return { ok: false, content: "", error: redact(created.data.message || "تعذّر بدء التصدير") };
        }
        const urls = await pollExport(token, exportId);
        const first = urls[0];
        if (!first) return { ok: false, content: "", error: "لا رابط تنزيل من كانفا" };
        const buffer = await downloadToBuffer(first);
        const caption = String(args.caption || args.title || "تصميم كانفا — الريان");
        const asset = await saveGeneratedStudioAsset({
          kind: format === "mp4" ? "video" : "image",
          buffer,
          ext: format === "mp4" ? ".mp4" : ".png",
          fileHint: caption,
          caption,
        });
        await notifyStudioReadyForApproval({ caption, asset });
        return { ok: true, content: JSON.stringify({ ...asset, exportId, source: "canva" }) };
      }
      case "canva.submit_publish": {
        if (args.approved === true) {
          return { ok: false, content: "", error: "النشر يتم فقط بعد موافقة تيليجرام — لا approved من الوكيل" };
        }
        const queued = await queueStudioPublishApproval(String(args.caption || "تصميم كانفا"));
        return { ok: queued.ok, content: queued.content };
      }
      default:
        return { ok: false, content: "", error: `أداة كانفا غير معروفة: ${tool}` };
    }
  } catch (error) {
    return { ok: false, content: "", error: redact(error instanceof Error ? error.message : "فشل Canva") };
  }
}
