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
        const { verifyCanva } = await import("./connectors/canva");
        const result = await verifyCanva(serverId);
        return { ok: result.ok, tools: toolsFor(id), error: result.error };
      }
      case "liotrip-higgsfield": {
        if (!serverId) return { ok: false, tools: toolsFor(id), error: "يلزم تثبيت البطاقة أولاً" };
        const { verifyHiggsfield } = await import("./connectors/higgsfield");
        const result = await verifyHiggsfield(serverId);
        return { ok: result.ok, tools: toolsFor(id), error: result.error };
      }
      case "liotrip-whatsapp": {
        const { verifyWhatsAppCloud } = await import("./connectors/whatsapp-cloud");
        const result = await verifyWhatsAppCloud();
        return { ok: result.ok, tools: toolsFor(id), error: result.error };
      }
      case "liotrip-weather":
      case "liotrip-web-search":
      case "liotrip-analytics":
      case "liotrip-puppeteer":
      case "liotrip-google-flow":
      case "liotrip-computer-use":
      case "liotrip-browser-use":
      case "lonaliza-platform-admin":
      case "mcp-fetch": {
        return { ok: true, tools: toolsFor(id) };
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
      if (tool === "ads.launch_targeted_campaign") {
        const { launchTargetedMetaAdCampaign } = await import("./servers/meta-ads-campaign-launcher");
        const result = await launchTargetedMetaAdCampaign({
          campaignName: String(args.campaignName || "حملة سياحة تركيا المستهدفة"),
          objective: (args.objective as "OUTCOME_LEADS") || "OUTCOME_LEADS",
          targetLocations: Array.isArray(args.targetLocations) ? (args.targetLocations as string[]) : ["TR", "SA", "AE", "KW", "QA"],
          targetInterests: Array.isArray(args.targetInterests) ? (args.targetInterests as string[]) : ["Tourism in Turkey", "Istanbul", "Cappadocia", "Trabzon"],
          dailyBudgetUSD: Number(args.dailyBudgetUSD || args.budget || 50) || 50,
          adCaption: String(args.adCaption || args.caption || "اكتشف أجمل عطلات تركيا مع لوناليزا للسياحة"),
          videoUrl: typeof args.videoUrl === "string" ? args.videoUrl : undefined,
          imageUrl: typeof args.imageUrl === "string" ? args.imageUrl : undefined,
          callToAction: (args.callToAction as "BOOK_TRAVEL") || "SEND_WHATSAPP_MESSAGE",
          approved,
        });
        return { ok: result.ok, content: result.summaryAr, error: result.ok ? undefined : result.error };
      }
      break;
    case "liotrip-canva": {
      if (!serverId) return { ok: false, content: "", error: "الخادم غير مثبت" };
      const { callCanvaTool } = await import("./connectors/canva");
      return callCanvaTool(serverId, tool, args);
    }
    case "liotrip-higgsfield": {
      if (!serverId) return { ok: false, content: "", error: "الخادم غير مثبت" };
      const { callHiggsfieldTool } = await import("./connectors/higgsfield");
      return callHiggsfieldTool(serverId, tool, args);
    }
    case "liotrip-whatsapp": {
      const { callWhatsAppCloudTool } = await import("./connectors/whatsapp-cloud");
      return callWhatsAppCloudTool(tool, args);
    }
    case "liotrip-weather": {
      const { getTourismWeather } = await import("./servers/weather");
      const res = await getTourismWeather(String(args.destination || args.city || "طرابزون"));
      return { ok: true, content: JSON.stringify(res, null, 2) };
    }
    case "liotrip-web-search": {
      const { searchLiveWeb } = await import("./servers/web-search");
      const res = await searchLiveWeb(String(args.query || "سياحة تركيا"), Number(args.maxResults || 5));
      return { ok: true, content: res.summaryAr };
    }
    case "liotrip-analytics": {
      const { getTourismDemandAnalytics } = await import("./servers/analytics");
      const res = await getTourismDemandAnalytics();
      return { ok: true, content: res.summaryAr };
    }
    case "liotrip-puppeteer": {
      const { scrapeWithStealth } = await import("./servers/puppeteer-runner");
      const res = await scrapeWithStealth(String(args.url || "https://lonaliza.com"), args.screenshot === true);
      return { ok: res.ok, content: res.ok ? `${res.title}\n\n${res.extractedText}` : (res.error || "فشل التصفح"), error: res.ok ? undefined : res.error };
    }
    case "liotrip-google-flow": {
      const { executeGoogleFlowPipeline, saveGoogleFlowSession } = await import("./servers/google-flow-connector");
      if (tool === "flow.save_session") {
        await saveGoogleFlowSession({
          bearerToken: typeof args.bearerToken === "string" ? args.bearerToken : undefined,
          cookies: typeof args.cookies === "string" ? args.cookies : undefined,
          accountEmail: typeof args.accountEmail === "string" ? args.accountEmail : undefined,
        });
        return { ok: true, content: "تم حفظ جلسة Google Flow Ultra بنجاح" };
      }
      const res = await executeGoogleFlowPipeline({
        prompt: String(args.prompt || ""),
        destination: typeof args.destination === "string" ? args.destination : undefined,
        durationSeconds: Number(args.durationSeconds || 15) || 15,
        aspectRatio: (args.aspectRatio as "9:16") || "9:16",
        approved,
      });
      return { ok: res.ok, content: `${res.telegramStatus}\nرابط المعاينة: ${res.videoUrl}\nالنص:\n${res.captionAr}`, error: res.ok ? undefined : res.error };
    }
    case "liotrip-computer-use": {
      const {
        executeCapCutVideoAutomation,
        captureComputerScreenshot,
        getComputerUseConfig,
        executeComputerMouseClick,
        executeComputerMouseDrag,
        executeComputerKeyboardType,
        executeComputerKeyboardHotkey,
        getComputerScreenResolution,
        executeCapCutSplitClip,
        executeCapCutAddTextTrack,
        executeCapCutAddAudio,
        executeCapCutApplyTransition,
        executeCapCutExportRender,
        executeComputerFocusWindow,
        executeComputerClipboardSync,
      } = await import("./servers/computer-use");

      if (tool === "computer.health") {
        const config = await getComputerUseConfig();
        return { ok: true, content: JSON.stringify(config, null, 2) };
      }
      if (tool === "computer.take_screenshot") {
        const shot = await captureComputerScreenshot();
        return { ok: true, content: JSON.stringify(shot, null, 2) };
      }
      if (tool === "computer.mouse_click") {
        const res = await executeComputerMouseClick({
          x: typeof args.x === "number" ? args.x : undefined,
          y: typeof args.y === "number" ? args.y : undefined,
          button: (args.button as "left" | "right" | "middle") || "left",
          clicks: typeof args.clicks === "number" ? args.clicks : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.mouse_drag") {
        const res = await executeComputerMouseDrag({
          startX: Number(args.startX || 0),
          startY: Number(args.startY || 0),
          endX: Number(args.endX || 0),
          endY: Number(args.endY || 0),
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.keyboard_type") {
        const res = await executeComputerKeyboardType({
          text: String(args.text || ""),
          delayMs: typeof args.delayMs === "number" ? args.delayMs : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.keyboard_hotkey") {
        const keys = Array.isArray(args.keys) ? args.keys.map(String) : ["ctrl", "b"];
        const res = await executeComputerKeyboardHotkey({ keys });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.get_screen_size") {
        const res = await getComputerScreenResolution();
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.capcut_split_clip") {
        const res = await executeCapCutSplitClip({
          timestampSeconds: typeof args.timestampSeconds === "number" ? args.timestampSeconds : undefined,
          trackId: typeof args.trackId === "number" ? args.trackId : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.capcut_add_text") {
        const res = await executeCapCutAddTextTrack({
          textAr: String(args.textAr || "أفخم العطلات السياحية"),
          fontFamily: typeof args.fontFamily === "string" ? args.fontFamily : undefined,
          fontSize: typeof args.fontSize === "number" ? args.fontSize : undefined,
          color: typeof args.color === "string" ? args.color : undefined,
          animation: typeof args.animation === "string" ? args.animation : undefined,
          startSec: typeof args.startSec === "number" ? args.startSec : undefined,
          durationSec: typeof args.durationSec === "number" ? args.durationSec : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.capcut_add_audio") {
        const res = await executeCapCutAddAudio({
          audioUrlOrPreset: String(args.audioUrlOrPreset || "Luxury Travel Cinematic Bed"),
          ducking: args.ducking !== false,
          volumeLevel: typeof args.volumeLevel === "number" ? args.volumeLevel : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.capcut_apply_transition") {
        const res = await executeCapCutApplyTransition({
          transitionType: (args.transitionType as any) || "cinematic_dissolve",
          durationSec: typeof args.durationSec === "number" ? args.durationSec : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.capcut_export") {
        const res = await executeCapCutExportRender({
          resolution: (args.resolution as any) || "1080p",
          aspectRatio: (args.aspectRatio as any) || "9:16",
          fps: (args.fps as any) || 60,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.focus_window") {
        const res = await executeComputerFocusWindow({
          appName: (args.appName as any) || "CapCut",
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "computer.clipboard_sync") {
        const res = await executeComputerClipboardSync({
          action: (args.action as "read" | "write") || "read",
          content: typeof args.content === "string" ? args.content : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }

      const res = await executeCapCutVideoAutomation({
        destination: typeof args.destination === "string" ? args.destination : undefined,
        titleAr: typeof args.titleAr === "string" ? args.titleAr : undefined,
        subtitleAr: typeof args.subtitleAr === "string" ? args.subtitleAr : undefined,
        musicStyle: typeof args.musicStyle === "string" ? args.musicStyle : undefined,
        durationSeconds: Number(args.durationSeconds || 15) || 15,
        aspectRatio: (args.aspectRatio as "9:16") || "9:16",
        approved,
      });
      return {
        ok: res.ok,
        content: `${res.telegramStatus}\nرابط المعاينة: ${res.videoUrl}\nملخص المونتاج:\n${JSON.stringify(res.editingSummary, null, 2)}\nالنص:\n${res.captionAr}`,
        error: res.ok ? undefined : res.error,
      };
    }
    case "liotrip-browser-use": {
      const {
        executeCapCutWebReel,
        executeCanvaWebDesign,
        getBrowserUseSession,
        executeBrowserNavigate,
        executeBrowserClickElement,
        executeBrowserFillInput,
        executeBrowserUploadFile,
        executeBrowserEvaluateScript,
        getBrowserActiveTabInfo,
        captureBrowserTabScreenshot,
        getBrowserEditorCookies,
        executeBrowserExtractRenderedVideo,
      } = await import("./servers/browser-use");

      if (tool === "browser.connect_user_session") {
        const session = await getBrowserUseSession();
        return { ok: true, content: JSON.stringify(session, null, 2) };
      }
      if (tool === "browser.canva_web_editor") {
        const canva = await executeCanvaWebDesign({
          destination: typeof args.destination === "string" ? args.destination : undefined,
          titleAr: typeof args.titleAr === "string" ? args.titleAr : undefined,
        });
        return { ok: canva.ok, content: JSON.stringify(canva, null, 2) };
      }
      if (tool === "browser.navigate") {
        const res = await executeBrowserNavigate({
          url: String(args.url || "https://www.capcut.com/editor"),
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "browser.click_element") {
        const res = await executeBrowserClickElement({
          selector: String(args.selector || "button"),
          timeoutMs: typeof args.timeoutMs === "number" ? args.timeoutMs : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "browser.fill_input") {
        const res = await executeBrowserFillInput({
          selector: String(args.selector || "input"),
          value: String(args.value || ""),
          clearFirst: args.clearFirst === true,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "browser.upload_file") {
        const files = Array.isArray(args.filePaths) ? args.filePaths.map(String) : [];
        const res = await executeBrowserUploadFile({
          selector: String(args.selector || "input[type=file]"),
          filePaths: files,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "browser.evaluate_script") {
        const res = await executeBrowserEvaluateScript({
          script: String(args.script || ""),
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "browser.get_active_tab") {
        const res = await getBrowserActiveTabInfo();
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "browser.capture_tab_screenshot") {
        const res = await captureBrowserTabScreenshot();
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "browser.get_cookies") {
        const res = await getBrowserEditorCookies({
          domain: typeof args.domain === "string" ? args.domain : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "browser.extract_rendered_video") {
        const res = await executeBrowserExtractRenderedVideo({
          projectTitle: typeof args.projectTitle === "string" ? args.projectTitle : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }

      const res = await executeCapCutWebReel({
        destination: typeof args.destination === "string" ? args.destination : undefined,
        prompt: typeof args.prompt === "string" ? args.prompt : undefined,
        templateStyle: (args.templateStyle as any) || "luxury_travel",
        durationSeconds: Number(args.durationSeconds || 15) || 15,
        aspectRatio: (args.aspectRatio as "9:16") || "9:16",
        approved,
      });
      return {
        ok: res.ok,
        content: `${res.telegramStatus}\nرابط المعاينة: ${res.reelUrl}\nالمؤثرات:\n${JSON.stringify(res.appliedEffects, null, 2)}\nالنص:\n${res.captionAr}`,
        error: res.ok ? undefined : res.error,
      };
    }
    case "mcp-fetch": {
      const { executeBuiltinFetch } = await import("./servers/fetch");
      const res = await executeBuiltinFetch({
        url: String(args.url || ""),
        headers: (args.headers as Record<string, string>) || undefined,
        raw: args.raw === true,
      });
      return { ok: res.ok, content: res.ok ? res.content : (res.error || "فشل الجلب"), error: res.ok ? undefined : res.error };
    }
    case "lonaliza-platform-admin": {
      const adminSrv = await import("./servers/platform-admin");
      if (tool === "admin.audit_platform") {
        const res = await adminSrv.auditPlatformReadiness();
        return { ok: true, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "admin.get_settings_overview") {
        const res = await adminSrv.auditPlatformReadiness();
        return { ok: true, content: JSON.stringify(res.modules, null, 2) };
      }
      if (tool === "admin.guide_api_key") {
        const res = adminSrv.getApiKeyGuidance(String(args.service || ""));
        return { ok: true, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "admin.save_and_verify_key") {
        const res = await adminSrv.saveAndVerifyApiKey(
          String(args.service || ""),
          String(args.apiKey || ""),
          typeof args.secretKey === "string" ? args.secretKey : undefined
        );
        return { ok: res.ok, content: res.messageAr };
      }
      if (tool === "admin.monitor_agents_activity" || tool === "admin.get_executive_metrics") {
        const res = await adminSrv.getExecutivePlatformMetrics();
        return { ok: true, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "admin.send_telegram_briefing") {
        const res = await adminSrv.sendExecutiveTelegramBriefing(typeof args.customNote === "string" ? args.customNote : undefined);
        return { ok: res.ok, content: res.message };
      }
      if (tool === "admin.configure_setting") {
        const res = await adminSrv.saveAndVerifyApiKey(String(args.key || ""), String(args.value || ""));
        return { ok: res.ok, content: res.messageAr };
      }
      if (tool === "admin.get_social_community_status") {
        const res = await adminSrv.getNostrSocialCommunityStatus();
        return { ok: true, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "admin.test_nostr_relays") {
        const res = await adminSrv.testNostrRelaysSpeedMcp();
        return { ok: true, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "admin.update_social_points") {
        const res = await adminSrv.updateNostrPointsConfigMcp(args as any);
        return { ok: res.ok, content: res.messageAr };
      }
      if (tool === "admin.manage_nostr_relays") {
        const action = (args.action as "add" | "toggle" | "remove" | "set_default") || "add";
        const relayUrl = String(args.relayUrl || args.url || "");
        const res = await adminSrv.manageNostrRelaysMcp(action, relayUrl, {
          name: typeof args.name === "string" ? args.name : undefined,
          canRead: typeof args.canRead === "boolean" ? args.canRead : undefined,
          canWrite: typeof args.canWrite === "boolean" ? args.canWrite : undefined,
        });
        return { ok: res.ok, content: res.messageAr };
      }
      if (tool === "admin.moderate_social_content") {
        const action = (args.action as "mute_pubkey" | "unmute_pubkey" | "hide_event" | "add_banned_keyword" | "remove_banned_keyword" | "toggle_strict_tourism") || "toggle_strict_tourism";
        const value = (args.value ?? args.pubkey ?? args.eventId ?? args.keyword ?? true) as string | boolean;
        const res = await adminSrv.manageNostrModerationMcp(action, value);
        return { ok: res.ok, content: res.messageAr };
      }
      if (tool === "admin.manage_social_categories") {
        const action = (args.action as "add" | "toggle") || "add";
        const res = await adminSrv.manageNostrCategoriesMcp(action, {
          slug: String(args.slug || ""),
          nameAr: String(args.nameAr || args.name || ""),
          nameEn: typeof args.nameEn === "string" ? args.nameEn : undefined,
          icon: typeof args.icon === "string" ? args.icon : undefined,
          color: typeof args.color === "string" ? args.color : undefined,
          tag: typeof args.tag === "string" ? args.tag : undefined,
        });
        return { ok: res.ok, content: res.messageAr };
      }
      if (tool === "admin.search_live_hotels") {
        const res = await adminSrv.searchLiveHotelsMcp({
          destination: String(args.destination || args.city || args.query || "Istanbul"),
          checkIn: typeof args.checkIn === "string" ? args.checkIn : undefined,
          checkOut: typeof args.checkOut === "string" ? args.checkOut : undefined,
          adults: typeof args.adults === "number" ? args.adults : undefined,
          rooms: typeof args.rooms === "number" ? args.rooms : undefined,
          currency: typeof args.currency === "string" ? args.currency : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "admin.search_live_transfers") {
        const res = await adminSrv.searchLiveTransfersMcp({
          from: String(args.from || args.pickup || "IST"),
          to: typeof args.to === "string" ? args.to : typeof args.dropoff === "string" ? args.dropoff : undefined,
          date: typeof args.date === "string" ? args.date : undefined,
          time: typeof args.time === "string" ? args.time : undefined,
          pax: typeof args.pax === "number" ? args.pax : undefined,
          mode: (args.mode as "transfer" | "hourly") || "transfer",
          hours: typeof args.hours === "number" ? args.hours : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "admin.search_live_flights") {
        const res = await adminSrv.searchLiveFlightsMcp({
          origin: String(args.origin || args.from || "IST"),
          destination: String(args.destination || args.to || "DXB"),
          date: typeof args.date === "string" ? args.date : undefined,
          adults: typeof args.adults === "number" ? args.adults : undefined,
          cabinClass: typeof args.cabinClass === "string" ? args.cabinClass : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      if (tool === "admin.smart_pricing_engine") {
        const res = await adminSrv.smartPricingEngineMcp({
          vertical: (args.vertical as "flights" | "hotels" | "transfers") || "hotels",
          routeOrDestination: String(args.routeOrDestination || args.route || args.destination || "General"),
          baseCost: Number(args.baseCost || args.cost || 100),
          competitorPrice: typeof args.competitorPrice === "number" ? args.competitorPrice : undefined,
          targetDiscountVsCompetitorPct: typeof args.targetDiscountVsCompetitorPct === "number" ? args.targetDiscountVsCompetitorPct : undefined,
          minProfitFloorPct: typeof args.minProfitFloorPct === "number" ? args.minProfitFloorPct : undefined,
        });
        return { ok: res.ok, content: JSON.stringify(res, null, 2) };
      }
      const res = await adminSrv.auditPlatformReadiness();
      return { ok: true, content: JSON.stringify(res, null, 2) };
    }
    default: {
      const _never: never = id;
      return { ok: false, content: "", error: `أداة غير معروفة: ${String(_never)}.${tool}` };
    }
  }
  return { ok: false, content: "", error: `أداة غير معروفة: ${catalogId}.${tool}` };
}
