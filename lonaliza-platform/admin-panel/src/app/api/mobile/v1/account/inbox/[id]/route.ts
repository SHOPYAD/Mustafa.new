import { GET as websiteGet, POST as websitePost } from "@/app/api/account/inbox/[id]/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withMobileCookie(req, (forwarded) => websiteGet(forwarded, ctx));
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withMobileCookie(req, (forwarded) => websitePost(forwarded, ctx));
}
