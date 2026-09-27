import { proxyIntuiRequest } from "@/lib/intui-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ path?: string[] }> };

function findPath(segments: string[] | undefined): string {
  const rest = (segments || []).join("/");
  return rest ? `/${rest}` : "/";
}

export async function GET(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxyIntuiRequest(request, "find", findPath(path));
}

export async function POST(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxyIntuiRequest(request, "find", findPath(path));
}

export async function OPTIONS(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxyIntuiRequest(request, "find", findPath(path));
}
