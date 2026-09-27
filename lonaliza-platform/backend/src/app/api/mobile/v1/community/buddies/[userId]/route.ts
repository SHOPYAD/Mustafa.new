import { GET as websiteGet } from "@/app/api/community/buddies/[userId]/route";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ userId: string }> }) {
  return websiteGet(req, ctx);
}
