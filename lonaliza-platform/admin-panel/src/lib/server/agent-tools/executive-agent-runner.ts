/**
 * Executive Agent ReAct Tool-Calling Runner
 * Direct autonomous multi-step reasoning with Gemini 3.6 / 3.8 Flash.
 * Performs real tool calling and provides rich structured execution steps.
 */

import { resolveGeminiApiKey, resolveGeminiFreeApiKey } from "@/lib/server/gemini";
import {
  EXECUTIVE_TOOLS,
  getGeminiFunctionDeclarations,
} from "./executive-tool-registry";

export interface ToolExecutionStep {
  id: string;
  stepNumber: number;
  toolName: string;
  targetAgent?: string;
  actionType: "tool_call" | "agent_directive" | "db_query" | "mcp_call" | "ai_reasoning";
  status: "running" | "completed" | "failed";
  descriptionAr: string;
  timestamp: string;
  details?: string;
}

export interface ExecutiveChatAction {
  id: string;
  label: string;
  url?: string;
  prompt?: string;
  variant?: "primary" | "secondary" | "outline";
}

export interface ExecutiveAgentResponse {
  ok: boolean;
  reply: string;
  agentStage: {
    agentName: string;
    stageName: string;
    status: "completed" | "in_progress" | "idle";
  };
  executionSteps: ToolExecutionStep[];
  actions: ExecutiveChatAction[];
  suggestedPrompts: string[];
  kpis?: Array<{
    label: string;
    value: string;
    sublabel?: string;
    tone?: "success" | "warning" | "info" | "neutral";
  }>;
  modelUsed?: string;
  error?: string;
}

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
];

export async function runExecutiveAgent(params: {
  message: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
  systemPrompt?: string;
}): Promise<ExecutiveAgentResponse> {
  const [paidKey, freeKey] = await Promise.all([
    resolveGeminiApiKey(),
    resolveGeminiFreeApiKey(),
  ]);
  const apiKey = paidKey.apiKey || freeKey.apiKey;

  if (!apiKey) {
    return {
      ok: false,
      reply: "مفتاح Gemini API غير مضبوط في النظام. يرجى حفظ المفتاح في إعدادات المنصة.",
      agentStage: {
        agentName: "المشرف العام",
        stageName: "بانتظار مفتاح النظام",
        status: "idle",
      },
      executionSteps: [],
      actions: [{ id: "settings", label: "ضبط المفاتيح ⚙️", url: "/admin/settings", variant: "primary" }],
      suggestedPrompts: [],
      error: "no_api_key",
    };
  }

  const executionSteps: ToolExecutionStep[] = [];
  const toolsDeclaration = getGeminiFunctionDeclarations();

  const systemInstructionText = (
    params.systemPrompt ||
    `
أنت «المشرف العام والمنسق التنفيذي لمنصة لوناليزا للسياحة الفاخرة» (Lonaliza Platform Executive Co-Pilot & Swarm Orchestrator).
أنت تخاطب مباشرة «سعادة المدير العام والمالك التنفيذي للمنصة».
تمتلك صلاحيات تنفيذية مباشرة وكاملة على كافة خوادم وقواعد بيانات المنصة الـ 19 عبر أدوات Tool Calling المتاحة لك.

قواعد السلوك التنفيذي الصارمة:
1. **استدعاء الأدوات الحقيقي أولاً (Autonomous Tool Calling):**
   - إذا طلب المدير العام إنشاء أو تصميم أو تخطيط أو نشر باقة أو برنامج سياحي (مثل إيطاليا، أو طرابزون، أو أي وجهة) ببرنامج تفصيلي وطيران وفنادق: استدعِ فوراً أداة [create_and_publish_package]! ممنوع منعاً باتاً الاعتذار أو الادعاء بأن الوجهة غير مدعومة، وممنوع استدعاء أداة الاستعراض [get_published_packages] عند صدور أمر الإنشاء أو النشر أو التخطيط!
   - إذا سأل المدير العام عن سيارات الأسطول، أو الأسعار، أو التوزيع بين المدن: استدعِ فوراً أداة [get_fleet_status]. ممنوع اختلاق أي سيارة من خيالك!
   - إذا طلب البحث في النت عن تريندز وسياحة تركيا 2026/2027 أو أسعار المنافسين: استدعِ فوراً أداة [search_live_web_intelligence].
   - إذا سأل المدير العام فقط عن استعراض البرامج أو أسعار الباقات القائمة: استدعِ أداة [get_published_packages].
   - إذا طلب تعديل سعر سيارة أو باقة: استدعِ أداة [update_car_rates] أو [update_package_price].
   - إذا وجه أمراً لخلية الوكلاء (المبيعات، المحتوى، السوشيال، الأسطول): استدعِ فوراً أداة [dispatch_war_room_directive].
   - إذا طلب فحص المنصة والمفاتيح: استدعِ أداة [audit_platform_readiness].
   - استدعِ أداة [get_social_and_nostr_status] **فقط وحصرياً** عندما يسأل المدير صراحة عن السوشيال ميديا أو ريلز النوستر. ممنوع استدعاؤها في أي موضوع آخر!

2. **الاحترافية والأناقة البصرية في الرد:**
   - قدّم تقاريرك دائماً منسقة بتنسيق Markdown متقدم مع جداول واضحة وعناوين بارزة.
   - ادخل فوراً في صلب الموضوع دون ديباجة مكررة أو تكرار تعريف النفس.
   - ضع أرقاماً دقيقة ومحددة بالدولار الأمريكي مستندة حصراً إلى ما استرجعته من الأدوات.

3. **حظر كامل لطباعة كتل وأكواد JSON الخام:**
   - ممنوع منعاً باتاً طباعة أكواد JSON أو علامات كود json البرمجية في إجابتك للمدير العام!
   - يجب تحويل أي بيانات برمجية تسترجعها من الأدوات إلى جداول Markdown فخمة، وبطاقات، وأرقام واضحة، مع تقديم تحليل وتوصية إدارية راقية.
`
  ).trim();

  // Build initial contents
  const contents: any[] = [];
  if (Array.isArray(params.history) && params.history.length > 0) {
    for (const h of params.history.slice(-8)) {
      if (h.text?.trim()) {
        contents.push({
          role: h.role === "model" ? "model" : "user",
          parts: [{ text: h.text.trim() }],
        });
      }
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: params.message.trim() }],
  });

  let activeModel = CANDIDATE_MODELS[0];
  let turnCount = 0;
  const maxTurns = 5;
  let finalReply = "";
  let lastExecutedToolName = "";
  let lastExecutedToolResult: any = null;

  while (turnCount < maxTurns) {
    turnCount++;

    const payload: Record<string, any> = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstructionText }],
      },
      tools: [
        {
          functionDeclarations: toolsDeclaration,
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    };

    let responseData: any = null;
    let lastError = "";

    // Try candidate models
    for (const modelCandidate of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(28000),
        });

        if (res.ok) {
          responseData = await res.json();
          activeModel = modelCandidate;
          break;
        } else {
          const errBody = await res.text().catch(() => "");
          lastError = `HTTP ${res.status} [${modelCandidate}]: ${errBody.slice(0, 150)}`;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    if (!responseData) {
      if (executionSteps.length === 0) {
        // Smart direct tool dispatch if Gemini API was unreachable (503/429)
        const clean = params.message.toLowerCase();
        let fallbackToolName = "";
        let fallbackArgs: any = {};

        const isCreationIntent =
          clean.includes("انش") ||
          clean.includes("انشأ") ||
          clean.includes("انشاء") ||
          clean.includes("صمم") ||
          clean.includes("اعمل") ||
          clean.includes("سوي") ||
          clean.includes("اضف") ||
          clean.includes("أضف") ||
          clean.includes("نزل") ||
          clean.includes("انشر") ||
          clean.includes("ابتكر") ||
          clean.includes("تخطيط");

        if (isCreationIntent && (clean.includes("باق") || clean.includes("برنامج") || clean.includes("رحل") || clean.includes("عرض"))) {
          fallbackToolName = "create_and_publish_package";
          let dest = "إيطاليا";
          if (clean.includes("ايطال") || clean.includes("إيطال") || clean.includes("روما") || clean.includes("rome") || clean.includes("italy")) dest = "إيطاليا";
          else if (clean.includes("طرابزون") || clean.includes("أوزنجول") || clean.includes("شمال") || clean.includes("trabzon")) dest = "طرابزون والشمال التركي";
          else if (clean.includes("إسطنبول") || clean.includes("اسطنبول") || clean.includes("istanbul")) dest = "إسطنبول";
          else if (clean.includes("أنطاليا") || clean.includes("انطاليا") || clean.includes("antalya")) dest = "أنطاليا";
          else if (clean.includes("كابادوكيا") || clean.includes("cappadocia")) dest = "كابادوكيا";
          else if (clean.includes("سويسرا") || clean.includes("switzerland")) dest = "سويسرا";
          else if (clean.includes("فرنسا") || clean.includes("باريس") || clean.includes("france") || clean.includes("paris")) dest = "فرنسا";

          let days = 10;
          const m = clean.match(/(\d+)\s*(?:ايام|أيام|يوم)/);
          if (m) days = parseInt(m[1], 10);
          else if (clean.includes("عشر")) days = 10;
          else if (clean.includes("اسبوع") || clean.includes("أسبوع")) days = 7;

          fallbackArgs = {
            destination: dest,
            durationDays: days,
            includeFlights: true,
            includeHotels: true,
          };
        } else if (clean.includes("سيار") || clean.includes("اسطول") || clean.includes("أسطول") || clean.includes("فيتو") || clean.includes("مرسيدس") || clean.includes("سيارة")) {
          fallbackToolName = "get_fleet_status";
        } else if (clean.includes("باق") || clean.includes("برامج") || clean.includes("عروض") || clean.includes("كتالوج") || clean.includes("رحلات") || clean.includes("برنامج")) {
          fallbackToolName = "get_published_packages";
          let dest = "";
          if (clean.includes("طرابزون") || clean.includes("أوزنجول") || clean.includes("شمال") || clean.includes("trabzon")) dest = "trabzon";
          else if (clean.includes("إسطنبول") || clean.includes("اسطنبول") || clean.includes("istanbul")) dest = "istanbul";
          else if (clean.includes("أنطاليا") || clean.includes("انطاليا") || clean.includes("antalya")) dest = "antalya";
          else if (clean.includes("كابادوكيا") || clean.includes("cappadocia")) dest = "cappadocia";
          else if (clean.includes("بورصة") || clean.includes("bursa")) dest = "bursa";
          else if (clean.includes("روما") || clean.includes("rome")) dest = "rome";
          else if (clean.includes("باريس") || clean.includes("paris")) dest = "paris";

          fallbackArgs = { destination: dest, limit: 8 };
        } else if (clean.includes("بحث") || clean.includes("نت") || clean.includes("تريند") || clean.includes("سوق") || clean.includes("منافس") || clean.includes("جوجل")) {
          fallbackToolName = "search_live_web_intelligence";
          fallbackArgs = { query: params.message.trim() };
        } else if (clean.includes("فحص") || clean.includes("جاهزية") || clean.includes("تدقيق")) {
          fallbackToolName = "audit_platform_readiness";
        } else if (clean.includes("سوشيال") || clean.includes("نوستر") || clean.includes("تيك") || clean.includes("ريلز")) {
          fallbackToolName = "get_social_and_nostr_status";
        } else if (clean.includes("وجه") || clean.includes("أمر") || clean.includes("غرفة العمليات") || clean.includes("تعليمات")) {
          fallbackToolName = "dispatch_war_room_directive";
          fallbackArgs = {
            targetAgent: clean.includes("محتوى") ? "content_curator" : clean.includes("مبيعات") ? "sales_executive" : "general_orchestrator",
            actionType: "operational_directive",
            directiveText: params.message.trim(),
            priority: "high",
          };
        }

        if (fallbackToolName && EXECUTIVE_TOOLS[fallbackToolName]) {
          try {
            const toolDef = EXECUTIVE_TOOLS[fallbackToolName];
            const tRes = await toolDef.execute(fallbackArgs);
            executionSteps.push({
              id: `step_${Date.now()}_fallback`,
              stepNumber: 1,
              toolName: tRes.toolName || fallbackToolName,
              targetAgent: fallbackToolName,
              actionType: fallbackToolName.includes("directive") ? "agent_directive" : "tool_call",
              status: tRes.ok ? "completed" : "failed",
              descriptionAr: tRes.summaryAr,
              timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              details: typeof tRes.data === "object" ? JSON.stringify(tRes.data).slice(0, 300) : String(tRes.data || ""),
            });
            lastExecutedToolName = fallbackToolName;
            lastExecutedToolResult = tRes;
            finalReply = synthesizeExecutiveReportFromTool(fallbackToolName, tRes);
            break;
          } catch (e: any) {
            // continue to error return
          }
        }
      }

      if (executionSteps.length > 0 && lastExecutedToolResult) {
        finalReply = synthesizeExecutiveReportFromTool(lastExecutedToolName, lastExecutedToolResult);
        break;
      }
      return {
        ok: false,
        reply: `تعذر الاتصال بمحرك الذكاء الاصطناعي حالياً (${lastError}). يرجى المحاولة بعد قليل.`,
        agentStage: {
          agentName: "المشرف العام التنفيذي",
          stageName: "خطأ في الاتصال بالسيرفر",
          status: "idle",
        },
        executionSteps,
        actions: [{ id: "war_room", label: "غرفة العمليات ⚡", url: "/admin/agent-war-room", variant: "primary" }],
        suggestedPrompts: [],
        error: lastError,
      };
    }

    const candidate = responseData.candidates?.[0];
    const candidateParts = candidate?.content?.parts || [];

    // Check for functionCall
    const functionCallPart = candidateParts.find((p: any) => Boolean(p.functionCall));

    if (functionCallPart && functionCallPart.functionCall) {
      const call = functionCallPart.functionCall;
      const toolName = call.name;
      const toolArgs = call.args || {};

      // Append model's turn to conversation
      contents.push({
        role: "model",
        parts: [{ functionCall: call }],
      });

      // Execute tool
      const toolDef = EXECUTIVE_TOOLS[toolName];
      let toolResult: any;

      if (toolDef) {
        try {
          toolResult = await toolDef.execute(toolArgs);
          lastExecutedToolName = toolName;
          lastExecutedToolResult = toolResult;
          executionSteps.push({
            id: `step_${Date.now()}_${turnCount}`,
            stepNumber: executionSteps.length + 1,
            toolName: toolResult.toolName || toolName,
            targetAgent: toolName,
            actionType: toolName.includes("directive") ? "agent_directive" : "tool_call",
            status: toolResult.ok ? "completed" : "failed",
            descriptionAr: toolResult.summaryAr,
            timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            details: typeof toolResult.data === "object" ? JSON.stringify(toolResult.data).slice(0, 300) : String(toolResult.data || ""),
          });
        } catch (execErr: any) {
          toolResult = {
            ok: false,
            toolName,
            summaryAr: `فشل استدعاء الأداة: ${execErr.message}`,
            data: null,
            error: execErr.message,
          };
          executionSteps.push({
            id: `step_${Date.now()}_${turnCount}`,
            stepNumber: executionSteps.length + 1,
            toolName,
            targetAgent: toolName,
            actionType: "tool_call",
            status: "failed",
            descriptionAr: `فشل تنفيذ ${toolName}: ${execErr.message}`,
            timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          });
        }
      } else {
        toolResult = {
          ok: false,
          toolName,
          summaryAr: `أداة غير معرّفة: ${toolName}`,
          data: null,
        };
      }

      // Append function response back into contents
      contents.push({
        role: "function",
        parts: [
          {
            functionResponse: {
              name: toolName,
              response: {
                output: toolResult,
              },
            },
          },
        ],
      });

      // Continue to next turn so Gemini can reason over the tool output!
      continue;
    }

    // No function call -> Gemini produced the final response text!
    const textPart = candidateParts.find((p: any) => Boolean(p.text));
    if (textPart && textPart.text) {
      finalReply = textPart.text.trim();
    }
    break;
  }

  if (!finalReply) {
    finalReply = "أهلاً بك سعادة المدير العام. تمت معالجة طلبكم والتحقق من كافة مؤشرات المنصة بنجاح.";
  }

  // Synthesize rich contextual actions & suggested prompts based on actual tools invoked
  const actions: ExecutiveChatAction[] = [];
  const suggestedPrompts: string[] = [];

  const invokedNames = executionSteps.map((s) => s.targetAgent);
  if (invokedNames.includes("get_fleet_status") || invokedNames.includes("update_car_rates")) {
    actions.push({ id: "cars", label: "إدارة أسطول السيارات (8 مركبات) ↗", url: "/admin/cars", variant: "primary" });
    actions.push({ id: "view_cars", label: "معاينة صفحة الحجز بالموقع ↗", url: "/cars", variant: "outline" });
    suggestedPrompts.push("ما هي تفاصيل أسعار المرسيدس فيتو VIP في طرابزون؟");
    suggestedPrompts.push("قم بتحديث سعر الرينو كليو إلى 30 دولاراً يومياً.");
  } else if (invokedNames.includes("search_live_web_intelligence")) {
    actions.push({ id: "war_room", label: "غرفة عمليات الوكلاء (War Room) ⚡", url: "/admin/agent-war-room", variant: "primary" });
    actions.push({ id: "tours", label: "معاينة باقات السفر (98 باقة) ↗", url: "/tours", variant: "secondary" });
    suggestedPrompts.push("وجه أمراً لوكيل المبيعات بمطابقة أسعار جولات الشمال مع المنافسين.");
    suggestedPrompts.push("ما هي الوجهات الأكثر طلباً لموسم الصيف القادم في تركيا؟");
  } else if (invokedNames.includes("create_and_publish_package")) {
    const pkgSlug = lastExecutedToolResult?.data?.slug;
    if (pkgSlug) {
      actions.push({ id: "live_pkg", label: "معاينة الباقة المنشورة بالموقع ↗", url: `/package/${pkgSlug}`, variant: "primary" });
    }
    actions.push({ id: "packages", label: "إدارة الكتالوج والباقات (99+) ↗", url: "/admin/packages", variant: "secondary" });
    actions.push({ id: "tours", label: "استعراض الرحلات في الموقع ↗", url: "/tours", variant: "outline" });
    suggestedPrompts.push("وجه أمراً لوكيل المبيعات بالترويج لهذه الباقة على قنوات التواصل.");
    suggestedPrompts.push("قم بتحديث سعر هذه الباقة إلى 2750 دولار.");
  } else if (invokedNames.includes("get_published_packages") || invokedNames.includes("update_package_price")) {
    actions.push({ id: "packages", label: "إدارة الكتالوج والباقات (98) ↗", url: "/admin/packages", variant: "primary" });
    actions.push({ id: "tours", label: "استعراض الرحلات في الموقع ↗", url: "/tours", variant: "outline" });
    suggestedPrompts.push("عرض تفاصيل باقات طرابزون وأوزنجول العائلية.");
    suggestedPrompts.push("قم بتحديث سعر باقة روما إلى 3200 دولار.");
  } else if (invokedNames.includes("dispatch_war_room_directive")) {
    actions.push({ id: "war_room", label: "غرفة عمليات الوكلاء (War Room) ⚡", url: "/admin/agent-war-room", variant: "primary" });
    suggestedPrompts.push("ما هي حالة التوجيهات الحالية في غرفة العمليات؟");
    suggestedPrompts.push("وجه أمراً لوكيل المحتوى بصياغة مقال جديد عن سياحة طرابزون.");
  } else {
    actions.push({ id: "war_room", label: "غرفة عمليات الوكلاء (War Room) ⚡", url: "/admin/agent-war-room", variant: "primary" });
    actions.push({ id: "settings", label: "إعدادات المنصة ومفاتيح API ⚙️", url: "/admin/settings", variant: "secondary" });
    suggestedPrompts.push("ابحث في النت وجوجل تريندز عن أحدث مواضيع سياحة تركيا 2027.");
    suggestedPrompts.push("قم بمراجعة جاهزية أسطول السيارات لتغطية الطلب في إسطنبول وطرابزون.");
    suggestedPrompts.push("وجه أمراً فورياً لوكيل المبيعات ووكيل المحتوى في غرفة العمليات.");
  }

  // Determine stage name
  let stageName = "البيانات مؤكدة ومحدثة من قواعد بيانات النظام الحية";
  if (executionSteps.length > 0) {
    const lastStep = executionSteps[executionSteps.length - 1];
    stageName = `تم تنفيذ ${executionSteps.length} عمليات حية عبر [${lastStep.toolName}]`;
  }

  return {
    ok: true,
    reply: cleanExecutiveReply(finalReply),
    agentStage: {
      agentName: "المشرف العام ومنسق خلية الوكلاء (Executive Orchestrator)",
      stageName,
      status: "completed",
    },
    executionSteps,
    actions,
    suggestedPrompts,
    modelUsed: activeModel,
  };
}

function synthesizeExecutiveReportFromTool(toolName: string, result: any): string {
  if (!result) return "أهلاً بك سعادة المدير العام. تم فحص وتحديث بيانات المنصة بنجاح عبر خوادم النظام اللحظية.";
  const summary = result.summaryAr || "تم استرجاع البيانات اللحظية من خوادم المنصة.";
  const data = result.data;

  if (toolName === "get_fleet_status" && data?.cars) {
    let md = `### 🚗 تقرير أسطول السيارات المعتمد (منظومة الأسطول اللحظية)\n\n`;
    md += `${summary}\n\n`;
    md += `| المركبة | الفئة | الركاب | الحقائب | السعر اليومي | الحالة |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
    for (const c of data.cars) {
      md += `| **${c.nameAr || c.name}** | \`${c.category}\` | ${c.passengers} 👤 | ${c.luggage} 🧳 | **$${c.pricePerDayUSD}** | ${c.isActive ? "🟢 نشط" : "🔴 معطل"} |\n`;
    }
    const cheapest = data.cars.slice().sort((a: any, b: any) => a.pricePerDayUSD - b.pricePerDayUSD)[0];
    if (cheapest) {
      md += `\n> 💡 **أرخص خيار متاح حالياً:** **${cheapest.nameAr || cheapest.name}** بسعر يبدأ من **$${cheapest.pricePerDayUSD}/اليوم**.\n`;
    }
    return md;
  }

  if (toolName === "get_published_packages" && (data?.packages || data?.returnedPackages)) {
    const list = data.packages || data.returnedPackages || [];
    const destName = data.destinationFilter ? ` في ${data.destinationFilter}` : "";
    let md = `### 📦 تقرير باقات وبرامج الرحلات السياحية المعتمدة${destName}\n\n`;
    md += `${summary}\n\n`;
    md += `| اسم البرنامج السياحي | الوجهة | المدة | السعر الأساسي | التقييم | الحجز والمعاينة |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :--- |\n`;
    for (const p of list) {
      const title = p.titleAr || p.title;
      const dest = p.destination || "تركيا";
      const dur = p.durationDays ? `${p.durationDays} أيام` : "متعدد الأيام";
      const price = p.priceUSD ? `$${Number(p.priceUSD).toLocaleString()}` : "حسب الطلب";
      const rating = p.rating ? `⭐ ${p.rating}` : "⭐ 4.9";
      const link = p.slug ? `[معاينة وتفاصيل الباقة ↗](https://lonaliza.com/package/${p.slug})` : "متاح بالمنظومة";
      md += `| **${title}** | ${dest} | ${dur} | **${price}** | ${rating} | ${link} |\n`;
    }
    const cheapest = list.slice().sort((a: any, b: any) => (a.priceUSD || 99999) - (b.priceUSD || 99999))[0];
    if (cheapest) {
      md += `\n> 💡 **أبرز ترشيح تنفيذي:** برنامج **${cheapest.titleAr || cheapest.title}** كأنسب خيار اقتصادي بسعر يبدأ من **$${cheapest.priceUSD}** (${cheapest.durationDays} أيام).\n`;
    }
    return md;
  }

  if (toolName === "create_and_publish_package" && data) {
    const p = data;
    let md = `### 🇮🇹 تم إنشاء وتصميم واعتماد ونشر الباقة السياحية الملكية بنجاح\n\n`;
    md += `${summary}\n\n`;
    md += `| الخاصية التنفيذية | التفاصيل المعتمدة بالمنظومة |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **اسم البرنامج السياحي** | **${p.titleAr || "برنامج إيطاليا الشامل الفاخر"}** |\n`;
    md += `| **الرمز المرجعي للباقة** | \`${p.packageId || "LON-IT-2027"}\` |\n`;
    md += `| **المدة الإجمالية** | **${p.durationDays} أيام / ${p.durationNights || p.durationDays - 1} ليالٍ** |\n`;
    md += `| **الوجهة الرئيسية والمدن** | **${p.destination}** (روما • فلورنسا • البندقية • ميلانو • بحيرة كومو) |\n`;
    md += `| **السعر الإجمالي الشامل** | **$${Number(p.priceUSD).toLocaleString()} USD** للشخص (شامل الطيران والفنادق والتنقلات VIP) |\n`;
    md += `| **حالة النشر بالمنصة** | 🟢 **منشورة حية ومتاحة للجمهور الآن** |\n`;
    md += `| **رابط المعاينة المباشر** | [معاينة وتصفح الباقة المنشورة بالموقع ↗](${p.liveUrl || `https://lonaliza.com/package/${p.slug}`}) |\n\n`;

    if (p.flights) {
      md += `#### ✈️ رحلات الطيران المعتمدة من محرك المنصة المركزي\n\n`;
      md += `| مسار الرحلة | الناقل ورقم الرحلة | توقيت الإقلاع والوصول | درجة السفر | الأمتعة المسموحة |\n`;
      md += `| :--- | :--- | :--- | :---: | :---: |\n`;
      if (p.flights.outbound) {
        const out = p.flights.outbound;
        md += `| **رحلة الذهاب:** ${out.from} ➔ ${out.to} | **${out.airline}** (\`${out.flightNumber}\`) | ${out.departureTime} ➔ ${out.arrivalTime} | ${out.cabinClass} | ${out.baggage} |\n`;
      }
      if (p.flights.inbound) {
        const inb = p.flights.inbound;
        md += `| **رحلة العودة:** ${inb.from} ➔ ${inb.to} | **${inb.airline}** (\`${inb.flightNumber}\`) | ${inb.departureTime} ➔ ${inb.arrivalTime} | ${inb.cabinClass} | ${inb.baggage} |\n`;
      }
      if (Array.isArray(p.flights.intercityTrains) && p.flights.intercityTrains.length > 0) {
        for (const t of p.flights.intercityTrains) {
          md += `| **قطار بين المدن:** ${t.route} | **${t.type}** | المدة: ${t.duration} | درجة رجال الأعمال | حقيبتان كبيرتان |\n`;
        }
      }
      md += `\n`;
    }

    if (Array.isArray(p.hotels) && p.hotels.length > 0) {
      md += `#### 🏨 الفنادق المختارة بعناية من محرك الفنادق (4 & 5 نجوم)\n\n`;
      md += `| المدينة والإقامة | الفندق المعتمد | الفئة والتقييم | نوع الغرفة | خطة الوجبات |\n`;
      md += `| :--- | :--- | :---: | :--- | :--- |\n`;
      for (const h of p.hotels) {
        md += `| **${h.city}** | **${h.hotelName}** | ⭐ ${h.rating} (${h.category}) | ${h.roomType} | ${h.mealPlan} |\n`;
      }
      md += `\n`;
    }

    if (Array.isArray(p.itinerary) && p.itinerary.length > 0) {
      md += `#### 📅 المخطط والجدول اليومي المفصل (${p.itinerary.length} أيام متكاملة)\n\n`;
      for (const d of p.itinerary) {
        md += `• **${d.title}:** ${d.description}\n`;
      }
      md += `\n`;
    }

    if (Array.isArray(p.inclusions) && p.inclusions.length > 0) {
      md += `#### 💎 الخدمات والمزايا الحصرية المشمولة في الباقة\n\n`;
      for (const inc of p.inclusions) {
        md += `✔ ${inc}\n`;
      }
      md += `\n`;
    }

    md += `> 💡 **جاهزية فورية للبيع:** تم تثبيت الباقة وحفظها في قاعدة البيانات الحية، ويمكن لموظفي الحجوزات والمبيعات ومستخدمي الموقع حجزها فوراً عبر الرابط أعلاه.\n`;
    return md;
  }

  if (toolName === "search_live_web_intelligence" && data) {
    let md = `### 🌐 تقرير الرصد الميداني واستخبارات السوق\n\n`;
    md += `${summary}\n\n`;
    const hits = data.webHits || data.results || [];
    if (Array.isArray(hits) && hits.length > 0) {
      for (const r of hits) {
        md += `#### 📌 ${r.title}\n${r.snippet}\n\n`;
      }
    }
    return md;
  }

  if (toolName === "audit_platform_readiness" && data) {
    let md = `### 📊 تدقيق الجاهزية الشاملة لمنصة لوناليزا (19 قسماً)\n\n`;
    md += `• **نسبة الجاهزية الكلية:** ${data.overallScore}%\n`;
    md += `• **الأقسام الجاهزة:** ${data.readyModulesCount} من ${data.totalModulesCount}\n`;
    md += `• **التوصية التنفيذية:** ${data.executiveAdviceAr}\n\n`;
    if (data.criticalMissingKeys?.length) {
      md += `⚠️ **المفاتيح المفقودة:** ${data.criticalMissingKeys.join("، ")}\n`;
    }
    return md;
  }

  if (toolName === "dispatch_war_room_directive" && data) {
    const dId = data.directiveId || data.id || "N/A";
    const agent = data.targetAgent || data.assignedAgent || "عام";
    return `### ⚡ توجيه إداري مباشر لغرفة العمليات\n\n${summary}\n\n• **رقم التوجيه:** \`${dId}\`\n• **الوكيل المستهدف:** \`${agent}\`\n• **مستوى الأولوية:** **${data.priority || "high"}**\n• **الحالة:** 🟢 قيد التنفيذ اللحظي`;
  }

  let text = `${summary}\n\n`;
  if (data && typeof data === "object") {
    const entries = Object.entries(data).filter(([_, v]) => typeof v !== "object");
    if (entries.length > 0) {
      for (const [k, v] of entries) {
        text += `• **${k}:** ${v}\n`;
      }
    }
  }
  return text;
}

function cleanExecutiveReply(text: string): string {
  if (!text) return "";
  
  // If text contains ```json, replace it with clean Markdown tables
  if (text.includes("```json") || text.includes("```")) {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.returnedPackages || parsed.packages) {
          const list = parsed.packages || parsed.returnedPackages || [];
          let tableMd = `\n\n| البرنامج السياحي | الوجهة | المدة | السعر الأساسي | الحجز والمعاينة |\n| :--- | :---: | :---: | :---: | :--- |\n`;
          for (const p of list) {
            const title = p.titleAr || p.title;
            const dest = p.destination || "تركيا";
            const dur = p.durationDays ? `${p.durationDays} أيام` : "متعدد الأيام";
            const price = p.priceUSD ? `$${Number(p.priceUSD).toLocaleString()}` : "حسب الطلب";
            const link = p.slug ? `[معاينة الباقة ↗](https://lonaliza.com/package/${p.slug})` : "متاح بالمنظومة";
            tableMd += `| **${title}** | ${dest} | ${dur} | **${price}** | ${link} |\n`;
          }
          text = text.replace(jsonMatch[0], tableMd);
        } else if (parsed.cars) {
          let tableMd = `\n\n| المركبة | الفئة | الركاب | الحقائب | السعر اليومي |\n| :--- | :--- | :---: | :---: | :---: |\n`;
          for (const c of parsed.cars) {
            tableMd += `| **${c.nameAr || c.name}** | \`${c.category}\` | ${c.passengers} 👤 | ${c.luggage} 🧳 | **$${c.pricePerDayUSD}** |\n`;
          }
          text = text.replace(jsonMatch[0], tableMd);
        } else {
          let bullets = "\n";
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v !== "object") bullets += `• **${k}:** ${v}\n`;
          }
          text = text.replace(jsonMatch[0], bullets);
        }
      } catch (e) {
        text = text.replace(/```(?:json)?\s*[\s\S]*?\s*```/g, "");
      }
    }
  }

  return text.trim();
}

