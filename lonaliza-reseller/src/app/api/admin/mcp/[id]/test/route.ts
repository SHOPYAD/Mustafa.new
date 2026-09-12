import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { testMcpConnection } from "@/lib/server/mcp/client";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const result = await testMcpConnection(id);
  return NextResponse.json({
    ok: result.ok,
    tools: result.tools,
    error: result.error,
  });
}
