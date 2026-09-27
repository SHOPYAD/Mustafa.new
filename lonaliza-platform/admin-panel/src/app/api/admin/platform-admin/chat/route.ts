import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { generateGeminiContent } from "@/lib/server/gemini-swarm-client";
import {
  auditPlatformReadiness,
  getApiKeyGuidance,
  saveAndVerifyApiKey,
  getExecutivePlatformMetrics,
  sendExecutiveTelegramBriefing,
} from "@/lib/server/mcp/servers/platform-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const startTime = Date.now();
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history?: Array<{ role: "user" | "model"; text: string }>;
    };

    if (!message?.trim()) {
      return NextResponse.json({ ok: false, error: "الرسالة مطلوبة" }, { status: 400 });
    }

    const cleanMsg = message.trim();

    // 1. Direct command match: Save API Key pattern (e.g. AIzaSy..., or "احفظ مفتاح X: ...")
    const geminiKeyMatch = cleanMsg.match(/AIzaSy[A-Za-z0-9_-]{33}/);
    if (geminiKeyMatch) {
      const key = geminiKeyMatch[0];
      const res = await saveAndVerifyApiKey("gemini", key);
      return NextResponse.json({
        ok: true,
        reply: `${res.messageAr}\n\nتم تحديث مؤشر جاهزية محرك الذكاء الاصطناعي بنجاح إلى 100%. هل تريد مني فحص بقية الأقسام؟`,
        actionTaken: "save_key",
        service: "gemini",
      });
    }

    // 2. Direct command match: Explicit Full Platform Audit
    const isAuditExplicit =
      cleanMsg === "فحص" ||
      cleanMsg === "تدقيق" ||
      cleanMsg.includes("فحص شامل") ||
      cleanMsg.includes("فحص الجاهزية والنواقص") ||
      cleanMsg === "/audit" ||
      cleanMsg.includes("تقرير الجاهزية");

    if (isAuditExplicit) {
      const audit = await auditPlatformReadiness();
      const missing = audit.criticalMissingKeys.length
        ? `\n\n⚠️ *المفاتيح المطلوبة:* ${audit.criticalMissingKeys.join("، ")}`
        : "\n\n✨ لا توجد مفاتيح حرجة مفقودة!";

      return NextResponse.json({
        ok: true,
        reply: `📊 *تقرير جاهزية منصة لوناليزا الشامل (19 قسماً)*:\n\n• نسبة الجاهزية الكلية: ${audit.overallScore}%\n• الأقسام المكتملة: ${audit.readyModulesCount} من أصل ${audit.totalModulesCount}\n• التوصية الإدارية: ${audit.executiveAdviceAr}${missing}\n\nما هو القسم الذي تريد مني البدء في ضبطه الآن؟`,
        audit,
      });
    }

    // 3. Direct command match: Telegram briefing
    if (cleanMsg.includes("تيليجرام") || cleanMsg.includes("تلغرام") || cleanMsg.includes("بريفنج")) {
      const briefing = await sendExecutiveTelegramBriefing(cleanMsg);
      return NextResponse.json({
        ok: true,
        reply: briefing.ok
          ? `📱 ${briefing.message}\nتم إرسال بطاقة الإحاطة التنفيذية اللحظية إلى حسابك المسجل في تيليجرام بنجاح.`
          : `⚠️ ${briefing.message}. يرجى تزويدي برمز البوت Bot Token لحفظه.`,
      });
    }

    // 4. Direct command match: Guide on specific API key (only on direct inquiries)
    const isDirectKeyQuery =
      (cleanMsg.startsWith("مفتاح") || cleanMsg.includes("كيف أجلب") || cleanMsg.includes("أين أجد مفتاح")) &&
      (cleanMsg.includes("api") || cleanMsg.includes("مفتاح"));

    if (isDirectKeyQuery) {
      let targetService = "gemini";
      if (cleanMsg.includes("ميت") || cleanMsg.includes("فيسبوك") || cleanMsg.includes("انستغرام")) targetService = "meta";
      else if (cleanMsg.includes("تيل") || cleanMsg.includes("بوت")) targetService = "telegram";
      else if (cleanMsg.includes("دفع") || cleanMsg.includes("ايزيكو") || cleanMsg.includes("iyzico")) targetService = "iyzico";
      else if (cleanMsg.includes("فندق") || cleanMsg.includes("طيران") || cleanMsg.includes("rapid")) targetService = "rapidapi";

      const guide = getApiKeyGuidance(targetService);
      return NextResponse.json({
        ok: true,
        reply: `🔑 *دليل جلب مفتاح ${guide.serviceName}*:\n\n` +
          `• الرابط المباشر: ${guide.portalUrl}\n` +
          `• الخطوات:\n` + guide.stepsAr.map((s, i) => `${i + 1}. ${s}`).join("\n") +
          `\n\nبمجرد نسخه، الصقه هنا فقط وسأقوم بحفظه واختباره وتفعيله فوراً في النظام!`,
        guide,
      });
    }

    // 5. Autonomous Executive Agent (Real ReAct & Function Calling with Gemini 3.6/3.8 Flash)
    const { runExecutiveAgent } = await import("@/lib/server/agent-tools/executive-agent-runner");
    const agentRes = await runExecutiveAgent({
      message: cleanMsg,
      history,
    });

    return NextResponse.json({
      ok: agentRes.ok,
      reply: agentRes.reply,
      agentStage: agentRes.agentStage,
      executionSteps: agentRes.executionSteps || [],
      actions: agentRes.actions || [],
      suggestedPrompts: agentRes.suggestedPrompts || [],
      modelUsed: agentRes.modelUsed,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
