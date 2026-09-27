import { spawn } from "child_process";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { resolveFfmpeg } from "@/lib/studio/video/ffmpeg";
import {
  isImageContentType,
  parseSafeReelMediaUrl,
  posterCacheKey,
  siblingStillCandidates,
} from "@/lib/community/reel-poster-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_DIR = path.join(process.cwd(), ".data", "reel-posters");
const FETCH_MS = 8_000;
const FFMPEG_MS = 22_000;
const MIN_BYTES = 600;

function localUploadPath(pathname: string): string | null {
  if (!pathname.startsWith("/uploads/")) return null;
  const rel = pathname.replace(/^\/+/, "");
  const abs = path.resolve(process.cwd(), "public", rel);
  const root = path.resolve(process.cwd(), "public", "uploads");
  if (!abs.startsWith(root + path.sep) && abs !== root) return null;
  return abs;
}

async function readIfFile(filePath: string | null): Promise<Buffer | null> {
  if (!filePath) return null;
  try {
    const buf = await fs.readFile(filePath);
    return buf.length >= MIN_BYTES ? buf : null;
  } catch {
    return null;
  }
}

async function fetchBytes(url: string, timeoutMs: number): Promise<{ buf: Buffer; type: string } | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { Accept: "image/jpeg,image/webp,image/png,image/*;q=0.8,*/*;q=0.1" },
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!isImageContentType(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < MIN_BYTES || buf.length > 2_500_000) return null;
    if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return null;
    return { buf, type };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function extractFrameWithFfmpeg(input: string, outFile: string): Promise<boolean> {
  const runtime = await resolveFfmpeg();
  if (!runtime.ffmpeg) return false;
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-probesize",
    "2M",
    "-analyzeduration",
    "2M",
    "-ss",
    "0.4",
    "-i",
    input,
    "-frames:v",
    "1",
    "-an",
    "-vf",
    "scale=540:-2",
    "-q:v",
    "4",
    "-y",
    outFile,
  ];
  return await new Promise<boolean>((resolve) => {
    const child = spawn(runtime.ffmpeg as string, args, { stdio: ["ignore", "ignore", "pipe"] });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve(false);
    }, FFMPEG_MS);
    child.on("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve(code === 0);
    });
  });
}

function imageResponse(body: Buffer, extraCache = "public, max-age=86400, stale-while-revalidate=604800") {
  const type = body[0] === 0x89 ? "image/png" : body[0] === 0x52 ? "image/webp" : "image/jpeg";
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(body.length),
      "Cache-Control": extraCache,
    },
  });
}

export async function GET(req: Request) {
  const src = new URL(req.url).searchParams.get("src");
  const parsed = parseSafeReelMediaUrl(src);
  if (!parsed || !src) {
    return NextResponse.json({ ok: false, error: "bad_src" }, { status: 400 });
  }

  const key = posterCacheKey(src);
  const cacheFile = path.join(CACHE_DIR, `${key}.jpg`);
  const cached = await readIfFile(cacheFile);
  if (cached) return imageResponse(cached);

  const localVideo = localUploadPath(parsed.pathname);

  for (const still of siblingStillCandidates(src.startsWith("/") ? src : parsed.href)) {
    if (still.startsWith("/")) {
      const disk = await readIfFile(localUploadPath(still));
      if (disk) {
        await fs.mkdir(CACHE_DIR, { recursive: true }).catch(() => {});
        await fs.writeFile(cacheFile, disk).catch(() => {});
        return imageResponse(disk);
      }
      continue;
    }
    const hit = await fetchBytes(still, FETCH_MS);
    if (hit && isImageContentType(hit.type)) {
      await fs.mkdir(CACHE_DIR, { recursive: true }).catch(() => {});
      await fs.writeFile(cacheFile, hit.buf).catch(() => {});
      return imageResponse(hit.buf);
    }
  }

  const ffmpegInput = localVideo || parsed.href;
  const tmpOut = path.join(CACHE_DIR, `${key}.${createHash("md5").update(src).digest("hex").slice(0, 8)}.tmp.jpg`);
  const extracted = await extractFrameWithFfmpeg(ffmpegInput, tmpOut);
  if (extracted) {
    const frame = await readIfFile(tmpOut);
    await fs.unlink(tmpOut).catch(() => {});
    if (frame) {
      await fs.mkdir(CACHE_DIR, { recursive: true }).catch(() => {});
      await fs.writeFile(cacheFile, frame).catch(() => {});
      return imageResponse(frame);
    }
  }
  await fs.unlink(tmpOut).catch(() => {});

  return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
}
