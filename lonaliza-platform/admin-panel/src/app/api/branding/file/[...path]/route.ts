import { serveUploadedImage } from "@/lib/server/branding-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return serveUploadedImage((path || []).join("/"));
}
