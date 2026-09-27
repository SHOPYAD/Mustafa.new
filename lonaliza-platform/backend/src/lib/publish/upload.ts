import { promises as fs } from "fs";
import path from "path";
import {
  parseStudioRelativePath,
  publicStudioUrl,
  sanitizeStudioFileName,
  STUDIO_UPLOAD_ROOT,
  studioMimeForExt,
  writeStudioBuffer,
} from "@/lib/studio/creative/store";
import { isHttpUrl } from "@/lib/social/media";

const MAX_BYTES = 25 * 1024 * 1024;

export type UploadFromUrlResult = {
  ok: boolean;
  stub: boolean;
  url?: string;
  relativePath?: string;
  bytes?: number;
  contentType?: string;
  error?: string;
};

function extFrom(url: string, contentType: string): string {
  const fromType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };
  if (fromType[contentType]) return fromType[contentType];
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm"].includes(ext)) {
      return ext === ".jpeg" ? ".jpg" : ext;
    }
  } catch {
    /* ignore */
  }
  return contentType.startsWith("video/") ? ".mp4" : ".jpg";
}

/**
 * Download a remote asset into `.data/uploads/studio`.
 * On failure returns a stub so the admin UI can keep the original URL.
 */
export async function uploadFromUrl(rawUrl: string): Promise<UploadFromUrlResult> {
  const url = String(rawUrl || "").trim();
  if (!isHttpUrl(url)) {
    return { ok: false, stub: true, error: "الرابط يجب أن يبدأ بـ http أو https" };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timer);
    if (!res.ok) {
      return {
        ok: false,
        stub: true,
        url,
        error: `تعذّر تنزيل الملف (${res.status}) — سيُستخدم الرابط الأصلي`,
      };
    }
    const contentType = (res.headers.get("content-type") || "application/octet-stream")
      .split(";")[0]
      .trim();
    const length = Number(res.headers.get("content-length") || 0);
    if (length > MAX_BYTES) {
      return { ok: false, stub: true, url, error: "الملف أكبر من 25MB" };
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) {
      return { ok: false, stub: true, url, error: "الملف أكبر من 25MB" };
    }
    const isVideo = contentType.startsWith("video/");
    const ext = extFrom(url, contentType);
    const fileName = sanitizeStudioFileName("publish", ext);
    const folder = isVideo ? "video" : "images";
    const saved = await writeStudioBuffer({ folder, fileName, buffer });
    const publicUrl = publicStudioUrl(isVideo ? "video" : "creative", saved.relativePath);
    return {
      ok: true,
      stub: false,
      url: publicUrl,
      relativePath: saved.relativePath,
      bytes: saved.bytes,
      contentType,
    };
  } catch (err) {
    return {
      ok: false,
      stub: true,
      url,
      error:
        err instanceof Error
          ? `تعذّر التنزيل: ${err.message} — سيُستخدم الرابط الأصلي`
          : "تعذّر التنزيل — سيُستخدم الرابط الأصلي",
    };
  }
}

export type StudioPublishMediaItem = {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  type?: string;
  mime?: string;
  size?: number;
  createdAt?: string;
};

/** Files written by uploadFromUrl (`*-publish.*` in studio images/video). */
export async function listStudioPublishUploads(): Promise<StudioPublishMediaItem[]> {
  const folders: Array<{ folder: "images" | "video"; kind: "creative" | "video" }> = [
    { folder: "images", kind: "creative" },
    { folder: "video", kind: "video" },
  ];
  const items: StudioPublishMediaItem[] = [];
  for (const { folder, kind } of folders) {
    const dir = path.join(STUDIO_UPLOAD_ROOT, folder);
    let names: string[] = [];
    try {
      names = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const file of names) {
      if (!file.includes("-publish")) continue;
      const relativePath = `${folder}/${file}`;
      if (!parseStudioRelativePath(relativePath)) continue;
      let size: number | undefined;
      let createdAt: string | undefined;
      try {
        const st = await fs.stat(path.join(dir, file));
        size = st.size;
        createdAt = st.mtime.toISOString();
      } catch {
        continue;
      }
      const url = publicStudioUrl(kind, relativePath);
      items.push({
        id: relativePath,
        name: file,
        url,
        thumbnail: kind === "creative" ? url : undefined,
        type: kind === "video" ? "video" : "image",
        mime: studioMimeForExt(file),
        size,
        createdAt,
      });
    }
  }
  return items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
