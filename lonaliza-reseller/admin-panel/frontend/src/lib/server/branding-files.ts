/**
 * Runtime image uploads for branding, email templates, and provider logos.
 * Next.js production does not serve files added to `public/` after `next build`,
 * and `.data/` is blocked from direct HTTP — so files are stored on disk and
 * served through `/api/branding/file` (also via `/uploads/:path*` rewrite).
 */

import { promises as fs } from "fs";
import path from "path";

export const UPLOAD_FOLDERS = ["email", "branding", "pwa", "media", "providers"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const UPLOAD_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
};

const EXT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const MAX_BYTES = 5 * 1024 * 1024;
const FILE_RE = /^[a-z0-9][a-z0-9._-]*$/i;

export function isUploadFolder(value: string): value is UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

function dataDir(folder: UploadFolder): string {
  return path.join(process.cwd(), ".data", "uploads", folder);
}

function publicDir(folder: UploadFolder): string {
  return path.join(process.cwd(), "public", "uploads", folder);
}

export function parseUploadName(
  raw: string
): { folder: UploadFolder; file: string } | null {
  let decoded = String(raw || "").trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep raw */
  }
  const cleaned = decoded
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^uploads\//i, "")
    .replace(/^api\/branding\/file\/?/i, "")
    .replace(/^name=/i, "")
    .split("?")[0]
    .split("#")[0];
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length !== 2) return null;
  const [folder, file] = parts;
  if (!isUploadFolder(folder)) return null;
  if (file.includes("..") || !FILE_RE.test(file)) return null;
  const ext = path.extname(file).toLowerCase();
  if (!EXT_TYPES[ext]) return null;
  return { folder, file };
}

export function publicUploadUrls(folder: UploadFolder, file: string): {
  path: string;
  url: string;
} {
  return {
    path: `/uploads/${folder}/${file}`,
    url: `/api/branding/file?name=${folder}/${file}`,
  };
}

function safeBasename(original: string): string {
  const extFromName = path.extname(original);
  return (
    original
      .replace(extFromName, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image"
  );
}

export async function saveUploadedImage(input: {
  file: File;
  folder: UploadFolder;
}): Promise<{ filename: string; path: string; url: string }> {
  const { file, folder } = input;
  const extFromType = UPLOAD_TYPES[file.type];
  const original = file.name || "upload";
  const extFromName = path.extname(original).toLowerCase();
  const ext =
    extFromType ||
    (extFromName && Object.values(UPLOAD_TYPES).includes(extFromName)
      ? extFromName
      : "");
  if (!ext) {
    throw new Error("نوع الملف غير مدعوم");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("الملف أكبر من 5MB");
  }

  const filename = `${Date.now().toString(36)}-${safeBasename(original)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const destinations = [dataDir(folder), publicDir(folder)];
  for (const dir of destinations) {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buffer);
  }
  return { filename, ...publicUploadUrls(folder, filename) };
}

export async function saveUploadedBuffer(input: {
  buffer: Buffer;
  folder: UploadFolder;
  filenameHint: string;
  contentType: string;
}): Promise<{ filename: string; path: string; url: string }> {
  const extFromType = UPLOAD_TYPES[input.contentType];
  const hintExt = path.extname(input.filenameHint).toLowerCase();
  const ext =
    extFromType ||
    (hintExt && Object.values(UPLOAD_TYPES).includes(hintExt) ? hintExt : "");
  if (!ext) {
    throw new Error("نوع الملف غير مدعوم");
  }
  if (input.buffer.length > MAX_BYTES) {
    throw new Error("الملف أكبر من 5MB");
  }
  const filename = `${Date.now().toString(36)}-${safeBasename(input.filenameHint)}${ext}`;
  const destinations = [dataDir(input.folder), publicDir(input.folder)];
  for (const dir of destinations) {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), input.buffer);
  }
  return { filename, ...publicUploadUrls(input.folder, filename) };
}

export async function serveUploadedImage(rawName: string): Promise<Response> {
  const file = await readUploadedImage(rawName);
  if (!file) {
    return Response.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return new Response(new Uint8Array(file.buffer), {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.buffer.length),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Disposition": `inline; filename="${file.filename}"`,
    },
  });
}

export async function readUploadedImage(rawName: string): Promise<{
  buffer: Buffer;
  contentType: string;
  filename: string;
} | null> {
  const parsed = parseUploadName(rawName);
  if (!parsed) return null;
  const candidates = [
    path.join(dataDir(parsed.folder), parsed.file),
    path.join(publicDir(parsed.folder), parsed.file),
  ];
  // Legacy provider logos written to public/providers/custom before runtime API serving
  if (parsed.folder === "providers") {
    candidates.push(
      path.join(process.cwd(), "public", "providers", "custom", parsed.file)
    );
  }
  for (const filePath of candidates) {
    try {
      const buffer = await fs.readFile(filePath);
      if (!buffer.length) continue;
      return {
        buffer,
        contentType:
          EXT_TYPES[path.extname(parsed.file).toLowerCase()] ||
          "application/octet-stream",
        filename: parsed.file,
      };
    } catch {
      /* try next location */
    }
  }
  return null;
}

/**
 * Fixed-name upload (provider logos). Overwrites prior extension variants.
 * Served via `/uploads/providers/...` rewrite → `/api/branding/file`.
 */
export async function saveFixedUpload(input: {
  folder: UploadFolder;
  filename: string;
  buffer: Buffer;
}): Promise<{ path: string; url: string; mtimeMs: number }> {
  const { folder, filename, buffer } = input;
  if (!FILE_RE.test(filename)) {
    throw new Error("اسم الملف غير صالح");
  }
  const ext = path.extname(filename).toLowerCase();
  if (!EXT_TYPES[ext]) {
    throw new Error("نوع الملف غير مدعوم");
  }
  if (buffer.length <= 0 || buffer.length > MAX_BYTES) {
    throw new Error("حجم الملف غير صالح");
  }

  const base = filename.slice(0, -ext.length);
  const destinations = [dataDir(folder), publicDir(folder)];
  for (const dir of destinations) {
    await fs.mkdir(dir, { recursive: true });
    try {
      const existing = await fs.readdir(dir);
      await Promise.all(
        existing
          .filter((name) => name === filename || name.startsWith(`${base}.`))
          .map((name) => fs.unlink(path.join(dir, name)).catch(() => undefined))
      );
    } catch {
      /* empty ok */
    }
    await fs.writeFile(path.join(dir, filename), buffer, { mode: 0o644 });
  }

  const mtimeMs = Date.now();
  const urls = publicUploadUrls(folder, filename);
  return {
    path: `${urls.path}?v=${mtimeMs}`,
    url: `${urls.url}&v=${mtimeMs}`,
    mtimeMs,
  };
}
