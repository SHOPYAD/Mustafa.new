import { NextResponse } from "next/server";
import { listPublishedBlogPosts } from "@/lib/server/blog-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await listPublishedBlogPosts();
  return NextResponse.json(
    { ok: true, posts },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
