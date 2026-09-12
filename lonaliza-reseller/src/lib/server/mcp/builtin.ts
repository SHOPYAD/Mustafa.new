import { connectionStatus, resolveAdsCredentials } from "@/lib/ads/config";
import { lastAdsReport } from "@/lib/ads/reports-telegram";
import { runCtwaCampaign, runLookalikeAudience } from "@/lib/automation/handlers/ads-audience";
import { runArticlesResearchAndPublish } from "@/lib/automation/handlers/articles";
import {
  runStudioGenerateImage,
  runStudioGenerateVideo,
  runWeeklyStudioPlan,
} from "@/lib/automation/handlers/studio";
import { runTranslateArticles } from "@/lib/automation/handlers/translate";
import { publishApprovedStudio } from "@/lib/automation/publish-approved";
import type { AutomationJobContext } from "@/lib/automation/types";
import { listBlogPosts } from "@/lib/server/blog-store";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import { listPublicAccounts } from "@/lib/social/token-store";
import { resolveFfmpeg } from "@/lib/studio/video/ffmpeg";
import { getMcpCatalogEntry, isBuiltinMcpId, type BuiltinMcpId } from "./catalog";
import { callCanvaTool, verifyCanva } from "./connectors/canva";
import { callHiggsfieldTool, verifyHiggsfield } from "./connectors/higgsfield";
import { callWhatsAppCloudTool, verifyWhatsAppCloud } from "./connectors/whatsapp-cloud";
import type { McpToolInfo } from "./types";

export type BuiltinCallResult = {
  ok: boolean;
  content: string;
  error?: string;
};

function toolsFor(catalogId: string): McpToolInfo[] {
  return getMcpCatalogEntry(catalogId)?.tools || [];
}

function mcpJobCtx(args: Record<string, unknown>, dryRun: boolean): AutomationJobContext {
  return {
    dryRun,
    maxPerRun: Number(args.maxPerRun || 3) || 3,
    job: {
      id: "mcp-builtin",
      name: String(args.name || "mcp"),
      type: "articles.research_and_publish",
      enabled: false,
      cron: "0 9 * * *",
      timezone: "Europe/Istanbul",
      maxPerRun: 3,
      maxPerDay: 10,
      locales: ["ar"],
      dryRun,
      settings: args,
      lastRunAt: null,
      lastError: null,
      lastResult: null,
      runCountToday: 0,
      runCountDate: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function verifyBuiltinCatalog(
  catalogId: string,
  serverId?: string
): Promise<{
  ok: boolean;
  tools: McpToolInfo[];
  error?: string;
}> {
  const entry = getMcpCatalogEntry(catalogId);
  if (!entry || entry.source !== "builtin" || !isBuiltinMcpId(catalogId)) {
    return { ok: false, tools: [], error: "حزمة مدمجة غير معروفة" };
  }
  const id: BuiltinMcpId = catalogId;
  try {
    switch (id) {
      case "liotrip-blog": {
        const posts = await listBlogPosts();
        const { apiKey } = await resolveGeminiApiKey();
        return {
          ok: true,
          tools: toolsFor(id),
          error: apiKey ? undefined : "Gemini اختياري للترجمة — المخزن يعمل",
        };
        void posts;
      }
      case "liotrip-social": {
        const accounts = await listPublicAccounts();
        const connected = accounts.filter((row) => row.status === "connected" && row.hasAccessToken);
        return {
          ok: true,
          tools: toolsFor(id),
          error: connected.length ? undefined : "لا حساب متصل بعد — اربطوا من تبويب الحسابات",
        };
      }
      case "liotrip-studio": {
        const ffmpeg = await resolveFfmpeg();
        const { apiKey } = await resolveGeminiApiKey();
        return {
          ok: Boolean(apiKey || ffmpeg.available),
          tools: toolsFor(id),
          error: apiKey || ffmpeg.available ? undefined : "يلزم Gemini أو ffmpeg في .data/bin/ffmpeg",
        };
      }
      case "liotrip-ads": {
        const creds = await resolveAdsCredentials();
        const status = connectionStatus(creds);
        return {
          ok: true,
          tools: toolsFor(id),
          error: status.googleLive || status.metaLive ? undefined : "الإعلانات في وضع تجريبي حتى تُلصق المفاتيح",
        };
      }
      case "liotrip-canva": {
        if (!serverId) return { ok: false, tools: toolsFor(id), error: "يلزم تثبيت البطاقة أولاً" };
        const result = await verifyCanva(serverId);
        return { ok: result.ok, tools: toolsFor(id), error: result.error };
      }
      case "liotrip-higgsfield": {
        if (!serverId) return { ok: false, tools: toolsFor(id), error: "يلزم تثبيت البطاقة أولاً" };
        const result = await verifyHiggsfield(serverId);
        return { ok: result.ok, tools: toolsFor(id), error: result.error };
      }
      case "liotrip-whatsapp": {
        const result = await verifyWhatsAppCloud();
        return { ok: result.ok, tools: toolsFor(id), error: result.error };
      }
      default: {
        const _never: never = id;
        return { ok: false, tools: [], error: `حزمة غير مدعومة: ${String(_never)}` };
      }
    }
  } catch (error) {
    return {
      ok: false,
      tools: toolsFor(catalogId),
      error: error instanceof Error ? error.message : "فشل التحقق",
    };
  }
}

export async function callBuiltinTool(
  catalogId: string,
  tool: string,
  args: Record<string, unknown>,
  serverId?: string
): Promise<BuiltinCallResult> {
  const dryRun = args.dryRun !== false;
  const approved = args.approved === true;
  const ctx = mcpJobCtx(args, dryRun);

  if (!isBuiltinMcpId(catalogId)) {
    return { ok: false, content: "", error: `أداة غير معروفة: ${catalogId}.${tool}` };
  }
  const id: BuiltinMcpId = catalogId;

  switch (id) {
    case "liotrip-blog":
      if (tool === "blog.translate") {
        const result = await runTranslateArticles(ctx);
        return { ok: result.ok, content: result.message, error: result.ok ? undefined : result.message };
      }
      if (tool === "blog.research_draft") {
        const job = ctx.job!;
        const result = await runArticlesResearchAndPublish(job, ctx);
        const msg = result.logs.slice(-1)[0] || (result.ok ? "مسودة جاهزة" : "فشل البحث");
        return { ok: result.ok, content: msg, error: result.ok ? undefined : msg };
      }
      break;
    case "liotrip-social":
      if (tool === "social.publish") {
        if (!approved) {
          return {
            ok: false,
            content: "",
            error:
              "النشر مرفوض بدون approved=true — استخدموا موافقة تيليجرام «انشر» أو مرّروا approved بعد الاعتماد فقط.",
          };
        }
        const result = await publishApprovedStudio({
          approved: true,
          caption: String(args.caption || ""),
          boost: args.boost === true,
          budget: Number(args.budget || 0) || undefined,
        });
        return {
          ok: result.ok,
          content: JSON.stringify(result.results),
          error: result.ok ? undefined : "فشل النشر أو لا حسابات متصلة",
        };
      }
      break;
    case "liotrip-studio":
      if (tool === "studio.weekly_plan") {
        const result = await runWeeklyStudioPlan(ctx);
        return { ok: result.ok, content: result.message, error: result.ok ? undefined : result.message };
      }
      if (tool === "studio.generate_image") {
        const result = await runStudioGenerateImage(ctx);
        return { ok: result.ok, content: result.message, error: result.ok ? undefined : result.message };
      }
      if (tool === "studio.generate_video") {
        const result = await runStudioGenerateVideo(ctx);
        return { ok: result.ok, content: result.message, error: result.ok ? undefined : result.message };
      }
      if (tool === "studio.ffmpeg_status") {
        const ffmpeg = await resolveFfmpeg();
        return {
          ok: ffmpeg.available,
          content: JSON.stringify(ffmpeg),
          error: ffmpeg.available ? undefined : "ffmpeg غير متاح في .data/bin/ffmpeg",
        };
      }
      break;
    case "liotrip-ads":
      if (tool === "ads.status") {
        const status = connectionStatus(await resolveAdsCredentials());
        return { ok: true, content: JSON.stringify(status) };
      }
      if (tool === "ads.reports") {
        const report = await lastAdsReport();
        return { ok: true, content: JSON.stringify(report || { empty: true }) };
      }
      if (tool === "ads.lookalike") {
        const result = await runLookalikeAudience(ctx);
        return { ok: result.ok, content: result.message, error: result.ok ? undefined : result.message };
      }
      if (tool === "ads.ctwa") {
        const result = await runCtwaCampaign(ctx);
        return { ok: result.ok, content: result.message, error: result.ok ? undefined : result.message };
      }
      break;
    case "liotrip-canva":
      if (!serverId) return { ok: false, content: "", error: "الخادم غير مثبت" };
      return callCanvaTool(serverId, tool, args);
    case "liotrip-higgsfield":
      if (!serverId) return { ok: false, content: "", error: "الخادم غير مثبت" };
      return callHiggsfieldTool(serverId, tool, args);
    case "liotrip-whatsapp":
      return callWhatsAppCloudTool(tool, args);
    default: {
      const _never: never = id;
      return { ok: false, content: "", error: `أداة غير معروفة: ${String(_never)}.${tool}` };
    }
  }
  return { ok: false, content: "", error: `أداة غير معروفة: ${catalogId}.${tool}` };
}
