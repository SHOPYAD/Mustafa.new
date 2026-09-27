import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { listStoredCommunityPosts } from "@/lib/server/community-feed-store";
import { creatorStats } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const posts = await listStoredCommunityPosts();
  const mine = posts.filter((p) => p.authorUserId === user.id);
  const stats = await creatorStats(user.id, mine);
  return NextResponse.json({ ok: true, stats, posts: mine });
}
