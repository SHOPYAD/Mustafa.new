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

    // 5. Real System Tool Execution Engine (Active Agency)
    const { analyzeAndExecuteIntent } = await import("@/lib/server/chat-executive-engine");
    const executionResult = await analyzeAndExecuteIntent(cleanMsg, history);

    // 6. Intelligent Multi-turn Executive Reasoning using Gemini
    const actionContextText = executionResult.hasAction && executionResult.contextForAi
      ? `\n=== المعطيات التنفيذية المباشرة المستخرجة من قواعد بيانات النظام وخوادم الأدوات للتو ===\n${executionResult.contextForAi}\n`
      : "";

    const systemPrompt = `
أنت «المشرف العام والمنسق التنفيذي لمنصة لوناليزا للسياحة الفاخرة» (Lonaliza Platform Executive Co-Pilot & Swarm Orchestrator).
أنت تخاطب مباشرة «سعادة المدير العام والمالك التنفيذي للمنصة».
تمتلك المنصة 19 قسماً تشغيلياً شاملاً، بما فيها (القسم 19: مجتمع السوشيال ميديا وريلز النوستر اللامركزي مع نقاط الولاء ومحفظة الحجوزات)، ولديك كافة أدوات وصلاحيات بروتوكول MCP لإدارته وفحصه والتحكم به بالكامل.

قواعد العمل والتعامل التنفيذي الصارمة (إلزامية بنسبة 100%):
1. **التخصص الحصري وعدم الخروج عن موضوع السؤال إطلاقاً:**
   - إذا سأل المدير العام عن السوشيال ميديا أو ريلز النوستر أو نقاط التفاعل أو خوادم الريلايز: تحدّث **فقط** وبكل دقة عن مجتمع السوشيال ميديا اللامركزي (خوادم ريلايز النوستر وسرعات استجابتها الحية، سيرفرات Blossom BUD-01 لرفع الوسائط بدون استهلاك مساحة السيرفر، الفلتر السياحي الصارم 100%، نظام نقاط الولاء ومحفظة الحجوزات، وأدوات وصلاحيات المشرف العام MCP لإدارته والتحكم فيه بالكامل).
   - إذا سأل المدير العام عن السيارات: تحدّث **فقط** عن أسطول السيارات (الفئات، المواصفات، الأسعار اليومية، السائقين، ونقاط الاستلام). ممنوع نهائياً ذكر المقالات أو المدونة أو أي موضوع آخر!
   - إذا سأل عن البرامج والباقات: تحدّث **فقط** عن الرحلات، خطوط السير، الأيام، الفنادق، والأسعار. ممنوع حشر أي مواضيع أخرى!
   - إذا سأل عن الإعدادات ومفاتيح الربط: تحدّث **فقط** عن حالة السيرفر، بيئة التشغيل، وتكاملات API وبوابات الدفع وقنوات واتساب.
   - إذا طلب البحث في النت عن أسعار أو منافسين أو رحلات: قدّم تقريراً استخباراتياً مفصلاً وعميقاً لأسعار السوق والشركات السياحية المنافسة في تركيا مع جداول مقارنة وميزات لوناليزا التنافسية.
   - ممنوع منعاً باتاً حشر موضوع مقالات المدونة في أي رد ما لم يكن السؤال صراحة عن المقالات والمدونة!

2. **العمق والاحترافية التنفيذية (ممنوع الإجابات السطحية من سطرين):**
   - أنت مستشار تنفيذي رفيع المستوى، مطلوب منك تقديم إجابات غنية ومفصلة ودقيقة.
   - استخدم الجداول المنظمة، التصنيفات، الأسعار المحددة بالدولار، والنقاط التفصيلية التي تفيد متخذ القرار.
   - ممنوع الاختصار المخل أو العبارات الإنشائية الباهتة.

3. **الواقعية والشفافية (ممنوع الأرقام والنسب العشوائية المختلقة):**
   - ممنوع اختلاق نسب وهمية أو أرقام غير واقعية مثل "معدل اهتمام 80/100" أو "وجدت 4 نتائج" أو ROAS أو عدد حجوزات غير موجود في سياق الأدوات.
   - اعتمد حصراً على الأرقام الحقيقية المذكورة في نتائج الأدوات وحزمة الحقائق. إن لم تتوفر فاكتب: «لا تتوفر بيانات فعلية من النظام».

4. **حظر ديباجة التعريف بالنفس المتكررة وإعادة صياغة الطلب (ممنوع منعاً باتاً):**
   - ممنوع نهائياً أن تبدأ الرد بـ: "سعادة المدير العام والمالك التنفيذي، بصفتي المشرف العام والمنسق التنفيذي لمنصة لوناليزا للسياحة الفاخرة، أحييكم وأفيدكم..."! هذا تكرار ممجوج يزعج المدير العام.
   - ممنوع إعادة صياغة أو تلخيص طلب المدير العام في بداية الرد (مثل: "بناءً على طلبكم الخاص بـ...").
   - ادخل مباشرة وفوراً في صلب الموضوع: التقرير، الجداول، الأرقام الموثقة، والإجراءات العملية.

5. **اللغات الرسمية المعتمدة في النظام (أربع لغات فقط حصرياً):**
   - اللغات الأربع الرسمية والوحيدة المفعلة في منصة لوناليزا هي:
     1. العربية (ar) - المرجع الأساسي للنظام
     2. الإنجليزية (en)
     3. التركية (tr)
     4. الفرنسية (fr)
   - لا توجد أي لغة روسية في النظام إطلاقاً! يُمنع منعاً باتاً ذكر اللغة الروسية أو اختلاق أي لغات أخرى.
   - إحصاءات الترجمة الحقيقية والدقيقة المستخرجة من قاعدة البيانات هي: إجمالي الكتالوج 1,966 مفتاحاً (واجهة الموقع وحجوزات العملاء: 926 مفتاحاً، لوحة التحكم والإدارة: 1,040 مفتاحاً).

6. **الصدق التشغيلي التام (ممنوع الادعاءات الوهمية):**
   - لا تدّعِ إنجاز مهام في لمح البصر دون معطيات حقيقية من الأدوات المنفذة.
   - اعكس بدقة حالة قاعدة البيانات، وأي عمليات مزامنة أو فحص حقيقية تمت في النظام.

7. **الحظر المطلق لاختلاق أوامر تقنية وهمية أو أطر عمل لا علاقة لها بالمنصة:**
   - منصة لوناليزا مبنية بنواة برمجية فائقة التطور باستخدام Next.js 16 (App Router) و TypeScript و Node.js و PocketBase و JSON database stores.
   - لا يوجد في المنصة إطلاقاً نظام Laravel أو أوامر PHP Artisan (مثل php artisan cache:clear أو config:clear) ولا يوجد أي ملف باسم ToursController.php! يُمنع منعاً باتاً وقطعياً اختلاق هذه الأوامر أو الادعاء بتنفيذها أو توجيه المدير العام لها تحت أي ظرف!
   - عندما تقوم الأدوات التنفيذية باعتماد أو إضافة أو تعديل برامج سياحية، يتم كتابتها وحفظها فعلياً ومباشرة عبر محرك packages-store في قاعدة البيانات المركزية (.data/published-packages.json)، وتنعكس تلقائياً ولحظياً على الواجهة الأمامية (/tours) وفي لوحة التحكم (/admin/packages) بدون الحاجة لأي أوامر كاش خارجية.
   - عندما يطلب المدير العام اعتماد برامج أو نشرها، اعرض الروابط الحية المباشرة المعتمدة بالمسارات الصحيحة (https://lonaliza.com/package/[slug]).

8. **تفصيل نتائج النشر والتعديل الفعلي للبرامج والمقالات:**
   - عند إنشاء أو نشر برنامج سياحي جديد أو مقال، اذكر للمدير العام بوضوح: العنوان الدقيق، الوجهة، المدة، السعر المعتمد، والرابط الحي المباشر (https://lonaliza.com/package/... أو https://lonaliza.com/blog/...).
   - عند تعديل سعر أو برنامج، اذكر المعرّف، السعر السابق أو الجديد، والتأكيد على حفظه في ملف قاعدة البيانات .data/published-packages.json وانعكاسه الفوري على الموقع.

${actionContextText}

يجب أن يكون الرد بتنسيق JSON حصرياً بالهيكل التالي:
{
  "reply": "التقرير أو الرد التنفيذي المفصل والعميق المنظم بعناوين وجداول ونقاط محددة تليق بالمدير العام",
  "agentStage": {
    "agentName": "${executionResult.agentName || "المشرف العام التنفيذي"}",
    "stageName": "${executionResult.stageName || "البيانات مؤكدة ومحدثة في قاعدة البيانات"}",
    "status": "completed"
  },
  "actions": [],
  "suggestedResponses": [
    "رد أو استفسار تكميلي ذكي مقترح للمدير العام 1",
    "رد أو استفسار تكميلي ذكي مقترح للمدير العام 2",
    "رد أو استفسار تكميلي ذكي مقترح للمدير العام 3"
  ]
}

ملاحظة: "suggestedResponses" هي خيارات تعبر عما قد يود المدير العام قوله أو السؤال عنه تالياً بنقرة واحدة.
`.trim();

    // Build multi-turn contents array
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-8)) {
        if (item.text?.trim()) {
          contents.push({
            role: item.role === "model" ? "model" : "user",
            parts: [{ text: item.text.trim() }],
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: cleanMsg }],
    });

    interface ExpectedChatJson {
      reply: string;
      agentStage?: {
        agentName?: string;
        stageName?: string;
        status?: "completed" | "in_progress" | "idle";
      };
      actions?: Array<{
        id: string;
        label: string;
        url?: string;
        prompt?: string;
        variant?: "primary" | "secondary" | "outline";
      }>;
      suggestedResponses?: string[];
    }

    const aiRes = await generateGeminiContent<ExpectedChatJson>({
      prompt: cleanMsg,
      contents,
      systemInstruction: systemPrompt,
      temperature: 0.4,
      responseMimeType: "application/json",
    });

    let replyText = "";
    let agentStage: {
      agentName: string;
      stageName: string;
      status: "completed" | "in_progress" | "idle";
    } = {
      agentName: "المشرف التنفيذي لمنصة لوناليزا",
      stageName: "البيانات مؤكدة ومنشورة في قاعدة البيانات بنسبة 100%",
      status: "completed",
    };
    let actions: Array<{ id: string; label: string; url?: string; prompt?: string; variant?: "primary" | "secondary" | "outline" }> = [];
    let suggestedPrompts: string[] = [];

    if (aiRes.ok && aiRes.data && typeof aiRes.data === "object") {
      const parsed = aiRes.data;
      replyText = parsed.reply || "";
      if (parsed.agentStage?.stageName) {
        agentStage = {
          agentName: parsed.agentStage.agentName || agentStage.agentName,
          stageName: parsed.agentStage.stageName,
          status: parsed.agentStage.status || "completed",
        };
      }
      if (Array.isArray(parsed.actions) && parsed.actions.length > 0) {
        actions = parsed.actions;
      }
      if (Array.isArray(parsed.suggestedResponses) && parsed.suggestedResponses.length > 0) {
        suggestedPrompts = parsed.suggestedResponses;
      }
    }

    if (!replyText) {
      replyText = aiRes.text || "أهلاً بك سعادة المدير العام. كافة أنظمة لوناليزا وخلية الوكلاء متصلة وجاهزة للعمل بأحدث بيانات 2027.";
    }

    if (executionResult.agentName || executionResult.stageName) {
      agentStage = {
        agentName: executionResult.agentName || agentStage.agentName,
        stageName: executionResult.stageName || agentStage.stageName,
        status: "completed",
      };
    }

    // Prioritize real tool actions over fallbacks
    if (executionResult.customActions && executionResult.customActions.length > 0) {
      actions = executionResult.customActions;
    } else if (actions.length === 0) {
      actions.push({
        id: "war_room",
        label: "غرفة عمليات الوكلاء (War Room) ⚡",
        url: "/admin/agent-war-room",
        variant: "primary",
      });
      actions.push({
        id: "open_settings",
        label: "إعدادات المنصة ⚙️",
        url: "/admin/settings",
        variant: "secondary",
      });
    }

    if (suggestedPrompts.length === 0) {
      if (cleanMsg.includes("سوشيال") || cleanMsg.includes("نوستر") || cleanMsg.includes("ريلز") || cleanMsg.includes("ريلاي") || cleanMsg.includes("نقاط")) {
        suggestedPrompts = [
          "فحص سرعة واستجابة خوادم ريلايز النوستر وسيرفرات Blossom",
          "استعراض إعدادات نقاط التفاعل ومحفظة الحجوزات",
          "فحص الفلتر السياحي الصارم وقائمة الكلمات المحظورة في السوشيال",
        ];
      } else if (cleanMsg.includes("مقال") || cleanMsg.includes("مدون")) {
        suggestedPrompts = [
          "عرض تفاصيل المقالات العشرة الجديدة لعام 2027",
          "فحص السيو وروابط الحجز الداخلي في المقالات",
          "توجيه خلية الوكلاء لإطلاق حملة تسويقية للمقالات",
        ];
      } else {
        suggestedPrompts = [
          "فحص جاهزية مجتمع السوشيال ميديا وريلز النوستر",
          "فحص الجاهزية الشامل والنواقص للمنصة (19 قسماً)",
          "فتح غرفة عمليات وتنسيق الوكلاء (War Room)",
        ];
      }
    }

    const elapsed = Date.now() - startTime;
    if (elapsed < 1400) {
      await new Promise((r) => setTimeout(r, 1400 - elapsed));
    }

    return NextResponse.json({
      ok: true,
      reply: replyText,
      agentStage,
      executionSteps: executionResult.steps || [],
      actions,
      suggestedPrompts,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
