import { NextRequest, NextResponse } from "next/server";
import {
  getOpenRouterConfig,
  saveOpenRouterApiKey,
  saveOpenRouterConfig,
  type OpenRouterConfigData,
} from "@/lib/server/openrouter-config";

export const runtime = "nodejs";

export async function GET() {
  const config = getOpenRouterConfig();
  return NextResponse.json({ ok: true, config });
}

export async function POST(req: NextRequest) {
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
