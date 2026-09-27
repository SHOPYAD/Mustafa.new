import { POST as websitePost } from "@/app/api/account/password/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return withMobileCookie(req, (forwarded) => websitePost(forwarded));
}
