import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostById,
  importBlogPosts,
  listBlogPosts,
  updateBlogPost,
  upsertBlogPost,
} from "@/lib/server/blog-store";
import type { BlogPost } from "@/types/blog";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get("id") || "";
  if (id) {
    const post = await getBlogPostById(id);
    if (!post) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, post });
  }
  const posts = await listBlogPosts();
  return NextResponse.json(
    { ok: true, posts },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Partial<BlogPost> & Record<string, unknown>;
    const post = await createBlogPost(body);
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Partial<BlogPost> & Record<string, unknown>;
    const post = await upsertBlogPost(body);
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Partial<BlogPost> &
      Record<string, unknown> & {
        action?: string;
        posts?: Array<Partial<BlogPost> & Record<string, unknown>>;
      };
    if (body.action === "import") {
      const incoming = Array.isArray(body.posts) ? body.posts : [];
      const result = await importBlogPosts(incoming);
      return NextResponse.json({
        ok: true,
        imported: result.imported,
        posts: result.posts,
      });
    }
    const id = String(body.id || req.nextUrl.searchParams.get("id") || "");
    if (!id) {
      return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }
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

export async function DELETE(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    let id = req.nextUrl.searchParams.get("id") || "";
    if (!id) {
      const body = (await req.json().catch(() => ({}))) as { id?: string };
      id = body.id || "";
    }
    if (!id) {
      return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }
    const ok = await deleteBlogPost(id);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
