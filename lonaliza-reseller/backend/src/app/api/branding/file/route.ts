import { NextRequest } from "next/server";
import { serveUploadedImage } from "@/lib/server/branding-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const name =
    req.nextUrl.searchParams.get("name") ||
    req.nextUrl.searchParams.get("path") ||
    "";
  return serveUploadedImage(name);
}
