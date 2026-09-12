import { GET as websiteGet, POST as websitePost } from "@/app/api/community/buddies/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function GET() {
  return websiteGet();
}

export async function POST(req: Request) {
  return withMobileCookie(req, (forwarded) => websitePost(forwarded));
}
