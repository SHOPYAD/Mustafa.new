import { POST as websitePost } from "@/app/api/community/reels/[id]/view/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withMobileCookie(req, (forwarded) => websitePost(forwarded, ctx));
}
