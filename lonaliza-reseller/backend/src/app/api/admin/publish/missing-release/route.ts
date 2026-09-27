import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listMissingReleasePosts, patchReleaseId } from "@/lib/publish/missing-release";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const postId =
    url.searchParams.get("id") ||
    url.searchParams.get("postId") ||
    url.searchParams.get("post") ||
    undefined;
  const payload = await listMissingReleasePosts(postId || undefined);
  return NextResponse.json({ ok: true, ...payload });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const id = String(body.id || body.postId || "").trim();
    const releaseId = String(body.releaseId || body.release_id || "").trim();
    const releaseURL = String(body.releaseURL || body.releaseUrl || body.release_url || "").trim();
    const post = await patchReleaseId(id, releaseId, releaseURL || undefined);
    if (!post) {
      return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر ربط معرف النشر" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
}
