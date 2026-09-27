import { NextResponse } from "next/server";
import { listPostComments, addPostComment } from "@/lib/server/community-feed-store";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { creditCommunityPoints } from "@/lib/loyalty/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) {
      return NextResponse.json({ ok: false, error: "postId is required" }, { status: 400 });
    }

    const comments = await listPostComments(postId);
    return NextResponse.json({ ok: true, comments });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      postId,
      text,
      authorName,
      authorAvatar,
      authorTier,
      parentId,
      replyToName,
    } = body;

    if (!postId || !text?.trim()) {
      return NextResponse.json(
        { ok: false, error: "postId and comment text are required" },
        { status: 400 }
      );
    }

    // Identify user if logged in
    const user = await getRequestCustomer(req);
    const resolvedAuthorName =
      authorName || user?.name || user?.email?.split("@")[0] || "مسافر لوناليزا VIP";
    const resolvedAuthorAvatar =
      authorAvatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(resolvedAuthorName)}`;

    const res = await addPostComment(
      postId,
      text.trim(),
      resolvedAuthorName,
      resolvedAuthorAvatar,
      authorTier,
      parentId,
      replyToName
    );

    // Award loyalty points (+25 points)
    if (user?.id) {
      try {
        await creditCommunityPoints(
          user.id,
          25,
          "comment",
          `مكافأة تعليق في مجتمع السفر`,
          res.comment.id
        );
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      comment: res.comment,
      commentsCount: res.commentsCount,
      message: "تم إضافة تعليقك بنجاح!",
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
