import { NextRequest } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { serveStudioFile } from "@/lib/studio/creative/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const name = req.nextUrl.searchParams.get("name") || "";
  return serveStudioFile(name);
}
