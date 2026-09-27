import { GET as websiteGet, POST as websitePost } from "@/app/api/account/nostr-pubkey/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return withMobileCookie(req, (forwarded) => websiteGet(forwarded));
}

export async function POST(req: Request) {
  return withMobileCookie(req, (forwarded) => websitePost(forwarded));
}
