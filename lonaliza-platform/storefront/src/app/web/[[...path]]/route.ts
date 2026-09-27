import { intuiUpstreamPath, proxyIntuiRequest } from "@/lib/intui-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ path?: string[] }> };

export async function GET(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxyIntuiRequest(request, "page", intuiUpstreamPath(path, "/web"));
}

export async function POST(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxyIntuiRequest(request, "page", intuiUpstreamPath(path, "/web"));
}
