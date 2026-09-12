import { GET as websiteGet, PATCH as websitePatch } from "@/app/api/account/profile/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return withMobileCookie(req, (forwarded) => websiteGet(forwarded));
}

export async function PATCH(req: Request) {
  return withMobileCookie(req, (forwarded) => websitePatch(forwarded));
}
