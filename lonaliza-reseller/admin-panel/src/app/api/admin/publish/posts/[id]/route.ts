import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deletePost, getPost, updatePost } from "@/lib/publish/posts";
import { updatePostSchema } from "@/lib/publish/schemas";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const post = await getPost(id);
  if (!post) {
    return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, post });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const body = updatePostSchema.parse(await req.json());
    const post = await updatePost(id, body);
    if (!post) {
      return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر تحديث المنشور" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const ok = await deletePost(id);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
