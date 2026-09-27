import { NextResponse } from "next/server";
import { toggleCommentLike } from "@/lib/server/community-feed-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, commentId } = body;

    if (!postId || !commentId) {
      return NextResponse.json(
        { ok: false, error: "postId and commentId are required" },
        { status: 400 }
      );
    }

    const res = await toggleCommentLike(postId, commentId);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
