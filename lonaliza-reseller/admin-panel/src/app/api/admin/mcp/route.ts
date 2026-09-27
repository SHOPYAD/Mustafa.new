import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import { MCP_CATALOG } from "@/lib/server/mcp/catalog";
import { addMcpServer, listEnabledMcpTools, listMcpServers } from "@/lib/server/mcp/store";
import { resolveMcpFromGithub, resolveMcpFromNpm, resolveMcpFromUrl, resolveMcpOther } from "@/lib/server/mcp/resolve";
import { isMcpSource, isMcpTransport, type McpAddInput } from "@/lib/server/mcp/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [servers, tools, comms] = await Promise.all([
    listMcpServers(),
    listEnabledMcpTools(),
    getCommsSettings(),
  ]);
  return NextResponse.json({
    ok: true,
    servers,
    tools,
    catalog: MCP_CATALOG,
    hints: {
      whatsappReady: Boolean(comms.whatsappPhoneNumberId && comms.whatsappAccessToken),
    },
  });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const source = isMcpSource(body.source) ? body.source : null;
    if (!source) {
      return NextResponse.json({ ok: false, error: "source = github | url | npm | other" }, { status: 400 });
    }

    let draft: McpAddInput;
    switch (source) {
      case "github":
        if (typeof body.repoUrl !== "string") {
          return NextResponse.json({ ok: false, error: "repoUrl مطلوب" }, { status: 400 });
        }
        draft = await resolveMcpFromGithub(body.repoUrl);
        break;
      case "npm":
        if (typeof body.packageName !== "string") {
          return NextResponse.json({ ok: false, error: "packageName مطلوب" }, { status: 400 });
        }
        draft = resolveMcpFromNpm(body.packageName);
        break;
      case "url":
        if (typeof body.url !== "string") {
          return NextResponse.json({ ok: false, error: "url مطلوب" }, { status: 400 });
        }
        draft = resolveMcpFromUrl(body.url, isMcpTransport(body.transport) ? body.transport : undefined);
        break;
      case "other":
        if (typeof body.command !== "string") {
          return NextResponse.json({ ok: false, error: "command مطلوب" }, { status: 400 });
        }
        draft = resolveMcpOther(
          body.command,
          Array.isArray(body.args) ? body.args.map(String) : []
        );
        break;
      case "builtin":
        draft = {
          name: typeof body.name === "string" ? body.name : "LIOTRIP",
          source: "builtin",
          catalogId: typeof body.catalogId === "string" ? body.catalogId : undefined,
          command: "builtin",
          args: [],
        };
        break;
      default: {
        const _never: never = source;
        return NextResponse.json({ ok: false, error: `مصدر غير مدعوم: ${String(_never)}` }, { status: 400 });
      }
    }

    if (typeof body.name === "string" && body.name.trim()) draft.name = body.name.trim();
    if (typeof body.apiKey === "string") draft.apiKey = body.apiKey;
    if (typeof body.oauthToken === "string") draft.oauthToken = body.oauthToken;
    if (body.headers && typeof body.headers === "object" && !Array.isArray(body.headers)) {
      draft.headers = body.headers as Record<string, string>;
    }
    if (body.env && typeof body.env === "object" && !Array.isArray(body.env)) {
      draft.env = body.env as Record<string, string>;
    }

    const server = await addMcpServer(draft);
    return NextResponse.json({ ok: true, server });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر إضافة الخادم" },
      { status: 400 }
    );
  }
}
