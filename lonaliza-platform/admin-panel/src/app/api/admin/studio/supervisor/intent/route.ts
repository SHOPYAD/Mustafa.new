import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { resolveSupervisorIntent } from "@/lib/studio/supervisor-brain/supervisor-lexicon";
import { resolveOpenRouterApiKey } from "@/lib/server/openrouter-config";
import { resolveGeminiApiKey } from "@/lib/server/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const directive = String(body.directive || "").trim();
    const useExternalAi = Boolean(body.useExternalAi);
    const activeCardId = body.activeCardId ? String(body.activeCardId) : undefined;

    if (!directive) {
      return NextResponse.json({ ok: false, error: "missing_directive" }, { status: 400 });
    }

    // 1. If External AI is requested, attempt Gemini / OpenRouter resolution
    if (useExternalAi) {
      try {
        const { apiKey: openRouterKey } = await resolveOpenRouterApiKey();
        const { apiKey: geminiKey } = await resolveGeminiApiKey();

        const systemPrompt = `أنت الوكيل المشرف العام (Sovereign Supervisor Agent) لمنصة لوناليزا للسياحة والسفر.
مهمتك تحليل أمر المدير وتحديد الإجراء الدقيق في لوحة التحكم والاستوديو السيبراني:
الأقسام المتاحة:
- تأجير السيارات والأسطول (cars): screenId: "06", hubId: "mobility.cars", sectorId: "nexus-mobility-cars", href: "/admin/cars"
- المواصلات والترانسفير (transfers): screenId: "06", hubId: "mobility.transfers", sectorId: "nexus-mobility-transfers", href: "/admin/transfers"
- رحلات الطيران (flights): screenId: "04", hubId: "flights", sectorId: "nexus-flagship-flights", href: "/admin/flights"
- حجوزات الفنادق (hotels): screenId: "03", hubId: "hotels", sectorId: "nexus-flagship-hotels", href: "/admin/hotels"
- الجولات السياحية (tours): screenId: "06", hubId: "mobility.tours", sectorId: "nexus-mobility-tours", href: "/admin/tours"
- الباقات والبرامج السياحية (packages): screenId: "04", hubId: "tourism.packages", sectorId: "nexus-tourism-packages", href: "/admin/packages"
- الأسواق والتحليلات (markets): screenId: "19", hubId: "markets", sectorId: "nexus-flagship-markets"
- المشاريع والأتمتة واللوجات (projects): screenId: "01", hubId: "projects", sectorId: "nexus-flagship-projects", href: "/admin/automation"
- التواصل والمجتمع ونوستر وواتساب (social): screenId: "10", hubId: "social", sectorId: "nexus-flagship-social", href: "/admin/social"
- المالية والمحاسبة والفواتير (finance): screenId: "13", hubId: "finance.accounting", href: "/admin/accounting"
- الامتثال القانوني (legal): screenId: "15", hubId: "legal.compliance", href: "/admin/legal"
- الإعدادات والموردين (settings): screenId: "16", hubId: "settings.providers", href: "/admin/settings"
- العملاء والمستخدمين (crm): screenId: "08", hubId: "customers.directory", href: "/admin/users"
- خوادم وأدوات MCP الـ 21 (mcp): screenId: "18", hubId: "mcp.servers"
- مسرح سلايد البطاقات (nexus): screenId: "21"

أنواع الإجراءات:
- "OPEN_SECTOR" (فتح قسم محدد)
- "CLOSE_ACTIVE" (إغلاق القسم الحالي أو المودال)
- "CAROUSEL_NEXT" (البطاقة التالية)
- "CAROUSEL_PREV" (البطاقة السابقة)
- "TOGGLE_CAMERA" (تبديل الكاميرا)
- "TOGGLE_SWARM" (إظهار/إخفاء الوكلاء)
- "OPEN_MCP_DISPATCHER" (فتح موزع أدوات MCP)
- "GENERAL_REPLY" (إجابة استفسار)

أجب بدقة متناهية بصيغة JSON فقط داخل كائن يحتوي:
{
  "type": "OPEN_SECTOR" | "CLOSE_ACTIVE" | "CAROUSEL_NEXT" | "CAROUSEL_PREV" | "TOGGLE_CAMERA" | "TOGGLE_SWARM" | "OPEN_MCP_DISPATCHER" | "GENERAL_REPLY",
  "screenId": string,
  "hubId": string,
  "sectorId": string,
  "href": string,
  "speechReplyAr": "رد صوتي باللغة العربية الفصحى الوقورة",
  "confidence": number
}`;

        let aiResponseText: string | null = null;

        // Try OpenRouter first if available
        if (openRouterKey) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4500);
          try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openRouterKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: directive },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
              }),
              signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
              const data = await res.json();
              aiResponseText = data?.choices?.[0]?.message?.content || null;
            }
          } catch {}
        }

        // Try Gemini official if OpenRouter was not used or failed
        if (!aiResponseText && geminiKey) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4500);
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nالأمر: ${directive}` }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
              }),
              signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
              const data = await res.json();
              aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
            }
          } catch {}
        }

        if (aiResponseText) {
          const parsed = JSON.parse(aiResponseText);
          if (parsed && parsed.type && parsed.speechReplyAr) {
            return NextResponse.json({
              ok: true,
              source: "external_ai_engine",
              intent: parsed,
            });
          }
        }
      } catch (err) {
        console.warn("[Supervisor AI] External model fallback to lexicon:", err);
      }
    }

    // 2. Deterministic Internal Semantic Engine (Lexicon & Morphological Matcher)
    const localIntent = resolveSupervisorIntent(directive, activeCardId);
    return NextResponse.json({
      ok: true,
      source: "internal_sovereign_lexicon",
      intent: localIntent,
    });
  } catch (error) {
    console.error("[Supervisor Intent Route Error]:", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
