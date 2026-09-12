import { GET as websiteGet, POST as websitePost } from "@/app/api/gemini/sales-chat/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return withMobileCookie(req, () => websiteGet(), { optional: true });
}

export async function POST(req: Request) {
  return withMobileCookie(req, (forwarded) => websitePost(forwarded as never), { optional: true });
}
