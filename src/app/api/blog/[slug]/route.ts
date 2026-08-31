import { NextResponse } from "next/server";
import { getBlogPostBySlug } from "@/lib/server/blog-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "published") {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json(
    { ok: true, post },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
