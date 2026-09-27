import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deleteMcpServer, getMcpServer, listMcpServers, patchMcpServer } from "@/lib/server/mcp/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const server = await getMcpServer(id);
  if (!server) return NextResponse.json({ ok: false, error: "غير موجود" }, { status: 404 });
  const publicServer = (await listMcpServers()).find((item) => item.id === id);
  return NextResponse.json({ ok: true, server: publicServer });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const server = await patchMcpServer(id, {
      name: typeof body.name === "string" ? body.name : undefined,
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      apiKey: typeof body.apiKey === "string" ? body.apiKey : undefined,
      oauthToken: typeof body.oauthToken === "string" ? body.oauthToken : undefined,
    });
    return NextResponse.json({ ok: true, server });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر التحديث" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  await deleteMcpServer(id);
  return NextResponse.json({ ok: true });
}
