import { NextRequest, NextResponse } from "next/server";
import {
  getOpenRouterConfig,
  resolveOpenRouterApiKey,
  saveOpenRouterApiKey,
  saveOpenRouterConfig,
} from "@/lib/server/openrouter-config";
import {
  CURATED_OPENROUTER_MODELS,
  type ModelProvider,
  type ModelTier,
  type OpenRouterModelInfo,
} from "@/lib/openrouter-models";

export const runtime = "nodejs";

function inferProvider(id: string): ModelProvider {
  const lower = id.toLowerCase();
  if (lower.startsWith("anthropic/")) return "anthropic";
  if (lower.startsWith("openai/")) return "openai";
  if (lower.startsWith("deepseek/")) return "deepseek";
  if (lower.startsWith("google/")) return "google";
  if (lower.startsWith("nvidia/")) return "nvidia";
  if (lower.startsWith("meta-llama/") || lower.startsWith("meta/")) return "meta";
  if (lower.startsWith("qwen/")) return "qwen";
  if (lower.startsWith("mistralai/")) return "mistral";
  if (lower.startsWith("x-ai/")) return "x-ai";
  return "other";
}

function inferTier(promptPricePerM: number, isFree: boolean): ModelTier {
  if (isFree || promptPricePerM === 0) return "free";
  if (promptPricePerM < 2.0) return "balanced";
  return "flagship";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      apiKey?: string;
      saveKey?: boolean;
    };

    let { apiKey } = await resolveOpenRouterApiKey();
    if (body.apiKey?.trim()) {
      apiKey = body.apiKey.trim();
      if (body.saveKey !== false) {
        await saveOpenRouterApiKey(apiKey);
      }
    }

    // 1. Fetch live models from OpenRouter official endpoint
    const headers: Record<string, string> = {
      "User-Agent": "Lonaliza-Platform/1.0",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const modelsRes = await fetch("https://openrouter.ai/api/v1/models", {
      headers,
      signal: AbortSignal.timeout(15000),
    });

    if (!modelsRes.ok) {
      const errText = await modelsRes.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: `فشل الاتصال بـ OpenRouter (${modelsRes.status}): ${errText.slice(0, 120)}`,
        },
        { status: 502 }
      );
    }

    const modelsData = (await modelsRes.json()) as {
      data?: Array<{
        id: string;
        name: string;
        description?: string;
        context_length?: number;
        pricing?: {
          prompt?: string | number;
          completion?: string | number;
        };
      }>;
    };

    const rawList = modelsData.data || [];
    const dynamicModels: OpenRouterModelInfo[] = [];

    // Prioritize curated models first, enriching them with live pricing
    const curatedMap = new Map(CURATED_OPENROUTER_MODELS.map((m) => [m.id, m]));

    for (const raw of rawList) {
      const promptNum = Number(raw.pricing?.prompt) || 0;
      const completionNum = Number(raw.pricing?.completion) || 0;
      const promptPricePerM = Math.round(promptNum * 1000000 * 1000) / 1000;
      const completionPricePerM = Math.round(completionNum * 1000000 * 1000) / 1000;
      const isFree =
        raw.id.includes(":free") ||
        (promptPricePerM === 0 && completionPricePerM === 0);

      const curated = curatedMap.get(raw.id);
      const tier = curated ? curated.tier : inferTier(promptPricePerM, isFree);
      const provider = inferProvider(raw.id);

      dynamicModels.push({
        id: raw.id,
        name: raw.name || raw.id.split("/")[1] || raw.id,
        provider,
        tier,
        promptPricePerM,
        completionPricePerM,
        contextLength: raw.context_length || (curated ? curated.contextLength : 32000),
        descriptionAr: curated ? curated.descriptionAr : raw.description || "نموذج ذكاء اصطناعي من OpenRouter",
        recommendedFor: curated ? curated.recommendedFor : tier === "free" ? "الاستخدام المجاني الاقتصادي" : tier === "balanced" ? "المهام المتوازنة وخدمة العملاء" : "التحليل العميق والتخطيط الفاخر",
        isFree,
      });
    }

    // 2. Check Key authentication status & limits if key provided
    let keyInfo: Record<string, unknown> | null = null;
    if (apiKey) {
      const keyRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(8000),
      }).catch(() => null);

      if (keyRes && keyRes.ok) {
        keyInfo = (await keyRes.json().catch(() => null)) as Record<string, unknown>;
      }
    }

    // 3. Save dynamic cache
    saveOpenRouterConfig({
      cachedDynamicModels: dynamicModels,
      lastSyncedAt: new Date().toISOString(),
    });

    const freeCount = dynamicModels.filter((m) => m.isFree).length;
    const balancedCount = dynamicModels.filter((m) => m.tier === "balanced").length;
    const flagshipCount = dynamicModels.filter((m) => m.tier === "flagship").length;

    return NextResponse.json({
      ok: true,
      message: `تم تحديث ${dynamicModels.length} نموذجاً حياً بنجاح (${freeCount} مجاني، ${balancedCount} متوازن اقتصادي، ${flagshipCount} رائد).`,
      totalModels: dynamicModels.length,
      freeCount,
      balancedCount,
      flagshipCount,
      models: dynamicModels,
      keyInfo,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "فشلت المزامنة مع OpenRouter",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const config = getOpenRouterConfig();
  const models = config.cachedDynamicModels || CURATED_OPENROUTER_MODELS;
  return NextResponse.json({
    ok: true,
    config,
    models,
  });
}
