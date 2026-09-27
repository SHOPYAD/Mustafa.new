import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { parseSafeReelMediaUrl } from "@/lib/community/reel-poster-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function localUploadPath(pathname: string): string | null {
  if (!pathname.startsWith("/uploads/")) return null;
  const rel = pathname.replace(/^\/+/, "");
  const abs = path.resolve(process.cwd(), "public", rel);
  const root = path.resolve(process.cwd(), "public", "uploads");
  if (!abs.startsWith(root + path.sep) && abs !== root) return null;
  return abs;
}

function guessVideoType(filePath: string): string {
  if (/\.webm$/i.test(filePath)) return "video/webm";
  if (/\.mov$/i.test(filePath)) return "video/quicktime";
  return "video/mp4";
}

export async function GET(req: Request) {
  const src = new URL(req.url).searchParams.get("src");
  const parsed = parseSafeReelMediaUrl(src);
  if (!parsed || !src) {
    return NextResponse.json({ ok: false, error: "bad_src" }, { status: 400 });
  }

  const range = req.headers.get("range") || req.headers.get("Range") || "";
  const local = localUploadPath(parsed.pathname);
  if (local) {
    try {
      const stat = await fs.stat(local);
      const type = guessVideoType(local);
      if (range) {
        const m = /bytes=(\d*)-(\d*)/.exec(range);
        const start = m?.[1] ? Number(m[1]) : 0;
        const end = m?.[2] ? Number(m[2]) : stat.size - 1;
        const chunk = await fs.readFile(local);
        const slice = chunk.subarray(start, end + 1);
        return new NextResponse(slice, {
          status: 206,
          headers: {
            "Content-Type": type,
            "Content-Length": String(slice.length),
            "Content-Range": `bytes ${start}-${end}/${stat.size}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
      const body = await fs.readFile(local);
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": type,
          "Content-Length": String(body.length),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      return NextResponse.json({ ok: false, error: "missing_local" }, { status: 404 });
    }
  }

  const headers = new Headers();
  headers.set("Accept", "video/mp4,video/*;q=0.9,*/*;q=0.1");
  if (range) headers.set("Range", range);

  let upstream: Response;
  try {
    upstream = await fetch(parsed.href, { headers, redirect: "follow" });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_failed" }, { status: 502 });
  }
  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(null, { status: upstream.status === 404 ? 404 : 502 });
  }

  const out = new Headers();
  out.set("Content-Type", upstream.headers.get("content-type") || "video/mp4");
  out.set("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes");
  out.set("Cache-Control", "public, max-age=86400");
  const length = upstream.headers.get("content-length");
  if (length) out.set("Content-Length", length);
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) out.set("Content-Range", contentRange);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
