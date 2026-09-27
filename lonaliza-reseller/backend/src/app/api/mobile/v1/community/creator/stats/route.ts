import { GET as websiteGet } from "@/app/api/community/creator/stats/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return withMobileCookie(req, (forwarded) => websiteGet(forwarded));
}
