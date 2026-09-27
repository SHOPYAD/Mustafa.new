import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { callMcpTool } from "@/lib/server/mcp/client";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const serverId = String(body.serverId || "").trim();
    const toolName = String(body.tool || body.toolName || "").trim();
    if (!serverId || !toolName) {
      return NextResponse.json({ ok: false, error: "serverId و tool مطلوبان" }, { status: 400 });
    }
    const args =
      body.arguments && typeof body.arguments === "object" && !Array.isArray(body.arguments)
        ? (body.arguments as Record<string, unknown>)
        : {};
    const result = await callMcpTool(serverId, toolName, args);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر استدعاء الأداة" },
      { status: 400 }
    );
  }
}
