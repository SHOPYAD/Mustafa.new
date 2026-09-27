import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
} from "@/lib/server/blog-store";
import type { BlogPost } from "@/types/blog";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const post = await getBlogPostById(id);
  if (!post) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, post });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as Partial<BlogPost> & Record<string, unknown>;
    const post = await updateBlogPost(id, body);
    if (!post) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const ok = await deleteBlogPost(id);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
