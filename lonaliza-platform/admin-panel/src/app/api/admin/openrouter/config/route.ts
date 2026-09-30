import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getOpenRouterConfig,
  saveOpenRouterApiKey,
  saveOpenRouterConfig,
  type OpenRouterConfigData,
} from "@/lib/server/openrouter-config";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const config = getOpenRouterConfig();
  return NextResponse.json({ ok: true, config });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<OpenRouterConfigData> & {
      openRouterApiKey?: string;
    };

    if (body.openRouterApiKey?.trim()) {
      await saveOpenRouterApiKey(body.openRouterApiKey.trim());
    }

    const saved = saveOpenRouterConfig({
      providerMode: body.providerMode,
      globalDefaultModel: body.globalDefaultModel,
      fallbackCascade: body.fallbackCascade,
      agentModels: body.agentModels,
    });

    return NextResponse.json({ ok: true, config: saved });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to save OpenRouter config" },
      { status: 500 }
    );
  }
}
