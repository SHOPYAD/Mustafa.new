import { promises as fs } from "fs";
import path from "path";

export const STUDIO_UPLOAD_ROOT = path.join(
  process.cwd(),
  ".data",
  "uploads",
  "studio"
);

const FILE_RE = /^[a-z0-9][a-z0-9._-]*$/i;
const ALLOWED_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".txt": "text/plain",
};

const ALLOWED_DIRS = new Set([
  "plans",
  "images",
  "slides",
  "frames",
  "video",
]);

export function studioMimeForExt(fileName: string): string {
  return ALLOWED_EXT[path.extname(fileName).toLowerCase()] || "application/octet-stream";
}

export function publicStudioUrl(kind: "creative" | "video", relativePath: string): string {
  const route =
    kind === "video" ? "/api/studio/video/files" : "/api/studio/creative/files";
  return `${route}?name=${encodeURIComponent(relativePath)}`;
}

export function sanitizeStudioFileName(hint: string, ext: string): string {
  const base =
    hint
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "")
      .normalize("NFKD")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "studio";
  return `${Date.now().toString(36)}-${base}${ext}`;
}

export function parseStudioRelativePath(
  raw: string
): { folder: string; file: string } | null {
  let decoded = String(raw || "").trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep raw */
  }
  const cleaned = decoded.replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length !== 2) return null;
  const [folder, file] = parts;
  if (!ALLOWED_DIRS.has(folder)) return null;
  if (file.includes("..") || !FILE_RE.test(file)) return null;
  if (!ALLOWED_EXT[path.extname(file).toLowerCase()]) return null;
  return { folder, file };
}

export async function writeStudioBuffer(input: {
  folder: "plans" | "images" | "slides" | "frames" | "video";
  fileName: string;
  buffer: Buffer;
}): Promise<{
  fileName: string;
  relativePath: string;
  absolutePath: string;
  bytes: number;
}> {
  const dir = path.join(STUDIO_UPLOAD_ROOT, input.folder);
  await fs.mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, input.fileName);
  await fs.writeFile(absolutePath, input.buffer);
  return {
    fileName: input.fileName,
    relativePath: `${input.folder}/${input.fileName}`,
    absolutePath,
    bytes: input.buffer.length,
  };
}

export async function readStudioFile(rawName: string): Promise<{
  buffer: Buffer;
  contentType: string;
  filename: string;
} | null> {
  const parsed = parseStudioRelativePath(rawName);
  if (!parsed) return null;
  const absolutePath = path.join(STUDIO_UPLOAD_ROOT, parsed.folder, parsed.file);
  try {
    const buffer = await fs.readFile(absolutePath);
    if (!buffer.length) return null;
    return {
      buffer,
      contentType: studioMimeForExt(parsed.file),
      filename: parsed.file,
    };
  } catch {
    return null;
  }
}

export async function serveStudioFile(rawName: string): Promise<Response> {
  const file = await readStudioFile(rawName);
  if (!file) {
    return Response.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return new Response(new Uint8Array(file.buffer), {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.buffer.length),
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `inline; filename="${file.filename}"`,
    },
  });
}
