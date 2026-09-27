import { DELETE as websiteDelete, GET as websiteGet } from "@/app/api/account/cards/route";
import { withMobileCookie } from "@/lib/server/mobile/with-mobile-cookie";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return withMobileCookie(req, (forwarded) => websiteGet(forwarded));
}

export async function DELETE(req: Request) {
  return withMobileCookie(req, (forwarded) => websiteDelete(forwarded));
}
