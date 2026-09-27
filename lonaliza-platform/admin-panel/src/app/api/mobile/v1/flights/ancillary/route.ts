import { POST as websitePost } from "@/app/api/flights/ancillary/route";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return websitePost(req as never);
}
