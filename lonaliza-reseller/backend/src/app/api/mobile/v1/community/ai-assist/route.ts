import { POST as websitePost } from "@/app/api/community/ai-assist/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return withMobileCookie(req, (forwarded) => websitePost(forwarded), { optional: true });
}
