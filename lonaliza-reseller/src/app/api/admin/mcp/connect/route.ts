import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getCommsSettings, looksMasked, saveCommsSettings } from "@/lib/automation/comms-settings";
import { testMcpConnection } from "@/lib/server/mcp/client";
import { catalogToAddInput, getMcpCatalogEntry } from "@/lib/server/mcp/catalog";
import { resolveMcpFromGithub } from "@/lib/server/mcp/resolve";
import { addMcpServer, findMcpByCatalogId, patchMcpServer } from "@/lib/server/mcp/store";

export const runtime = "nodejs";
export const maxDuration = 180;

function stringMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim() && !looksMasked(value)) {
      next[key] = value.trim();
    }
  }
  return next;
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const catalogId = String(body.catalogId || "").trim();
    const entry = getMcpCatalogEntry(catalogId);
    if (!entry) {
      return NextResponse.json({ ok: false, error: "بطاقة الكتالوج غير موجودة" }, { status: 400 });
    }

    if (entry.id === "mcp-github-import") {
      const fieldUrl =
        body.fields && typeof body.fields === "object" && !Array.isArray(body.fields)
          ? String((body.fields as Record<string, unknown>).repoUrl || "")
          : "";
      const repoUrl = String(body.repoUrl || fieldUrl || "").trim();
      if (!repoUrl) {
        return NextResponse.json({ ok: false, error: "رابط GitHub لخادم MCP مطلوب" }, { status: 400 });
      }
      const draft = await resolveMcpFromGithub(repoUrl);
      if (typeof body.name === "string" && body.name.trim()) draft.name = body.name.trim();
      const server = await addMcpServer(draft);
      const test = await testMcpConnection(server.id);
      return NextResponse.json({ ok: test.ok, server, test });
    }

    if (entry.id === "mcp-filesystem") {
      await fs.mkdir(path.join(process.cwd(), ".data", "mcp-sandbox"), { recursive: true, mode: 0o700 });
    }

    const fields = stringMap(body.fields);
    const envFromBody = stringMap(body.env);
    const apiKey = typeof body.apiKey === "string" && !looksMasked(body.apiKey) ? body.apiKey.trim() : "";
    const env: Record<string, string> = { ...envFromBody, ...fields };
    if (apiKey && entry.envKey) env[entry.envKey] = apiKey;
    if (apiKey && entry.envKeys?.[0] && !env[entry.envKeys[0]]) {
      env[entry.envKeys[0]] = apiKey;
    }

    if (entry.id === "liotrip-whatsapp") {
      const current = await getCommsSettings();
      await saveCommsSettings({
        whatsappPhoneNumberId:
          env.WHATSAPP_CLOUD_PHONE_NUMBER_ID || current.whatsappPhoneNumberId,
        whatsappAccessToken: env.WHATSAPP_CLOUD_ACCESS_TOKEN || current.whatsappAccessToken,
        whatsappVerifyToken: env.WHATSAPP_VERIFY_TOKEN || current.whatsappVerifyToken,
        whatsappWabaId: env.WHATSAPP_CLOUD_WABA_ID || current.whatsappWabaId,
      });
    }

    const existing = await findMcpByCatalogId(catalogId);
    const draft = catalogToAddInput(entry);
    if (apiKey) draft.apiKey = apiKey;
    if (Object.keys(env).length) draft.env = env;
    const oauthToken =
      typeof body.oauthToken === "string" && !looksMasked(body.oauthToken) ? body.oauthToken.trim() : "";
    if (oauthToken) draft.oauthToken = oauthToken;
    if (env.CANVA_ACCESS_TOKEN) draft.oauthToken = env.CANVA_ACCESS_TOKEN;

    const server = existing
      ? await patchMcpServer(existing.id, {
          enabled: true,
          apiKey: apiKey || undefined,
          oauthToken: oauthToken || env.CANVA_ACCESS_TOKEN || undefined,
          env: Object.keys(env).length ? env : undefined,
        })
      : await addMcpServer(draft);
    const test = await testMcpConnection(server.id);
    return NextResponse.json({ ok: test.ok, server, test });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر الربط" },
      { status: 400 }
    );
  }
}
