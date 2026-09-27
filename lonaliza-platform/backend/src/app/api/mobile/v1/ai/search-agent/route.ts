import { POST as websitePost } from "@/app/api/gemini/search-agent/route";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return websitePost(req as never);
}
