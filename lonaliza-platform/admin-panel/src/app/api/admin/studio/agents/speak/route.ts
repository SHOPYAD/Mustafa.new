import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { generateUnifiedAiContent } from "@/lib/server/unified-ai-client";
import { boardAgents } from "@/lib/studio/agents/task-board.server";
import { voiceForAgent } from "@/lib/studio/agents/voices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function voiceFor(agentId: string) {
  const index = boardAgents().findIndex((agent) => agent.id === agentId);
  return voiceForAgent(agentId, index);
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { agentId?: string; text?: string; mode?: string } | null;
  const text = String(body?.text || "").trim().slice(0, 800);
  if (!text) return NextResponse.json({ ok: false, error: "text_required" }, { status: 400 });
  const agents = boardAgents();
  const names = agents.map((agent) => `${agent.id}: ${agent.nameAr} — ${agent.titleAr}`).join("\n");

  if (body?.mode === "coordinate") {
    const res = await generateUnifiedAiContent<{ lines?: { agentId?: string; text?: string }[] }>({
      systemInstruction:
        "أنت الوكيل المشرف العام في لوناليزا. المتحدث هو المدير العام. أعد JSON فقط: {\"lines\":[{\"agentId\":\"supervisor|معرف وكيل\",\"text\":\"...\"}]}. الترتيب إلزامي: سطر المشرف ثم سطر الوكيل الذي سمّاه ثم المشرف إن لزم. لا يتكلم وكيل لم يُسمَّ في السطر السابق مباشرة. لا تتكلم وكيلان متتاليان. لا مبادرة. ممنوع اختراع نسب أو ادعاء أن تقريراً عُرض. من سطرين إلى ستة.",
      prompt: `الوكلاء:\n${names}\n\nطلب المدير العام: ${text}`,
      responseMimeType: "application/json",
      temperature: 0.4,
      maxTokens: 700,
      timeoutMs: 20000,
      agentRole: "supervisor_voice",
    }).catch(() => null);
    const allowed = new Set(["supervisor", ...agents.map((agent) => agent.id)]);
    const lines = (res?.ok ? res.data?.lines : [])
      ?.filter((line) => line && allowed.has(String(line.agentId)) && String(line.text || "").trim())
      .slice(0, 8)
      .map((line) => ({ agentId: String(line.agentId), nameAr: line.agentId === "supervisor" ? "الوكيل المشرف" : agents.find((agent) => agent.id === line.agentId)?.nameAr || String(line.agentId), voice: voiceFor(String(line.agentId)), text: String(line.text).trim() }));
    if (!lines?.length) {
      return NextResponse.json({
        ok: true,
        lines: [{ agentId: "supervisor", nameAr: "الوكيل المشرف", voice: voiceFor("supervisor"), text: "فهمت الطلب. أجلب النتيجة من السجلات الآن دون اختراع." }],
      });
    }
    return NextResponse.json({ ok: true, lines });
  }

  const agent = agents.find((item) => item.id === body?.agentId) || agents[0];
  const reply = await generateUnifiedAiContent({
    systemInstruction: `أنت ${agent.nameAr}. ${agent.titleAr}. يخاطبك المدير العام لشركة لوناليزا للسياحة. ارد بالعربية في جملتين أو ثلاث مناسبتين للنطق. نادِه بـ«مديرنا». لا تخترع أرقاماً ولا تدّعِ أنك نفذت كتابة في الأنظمة؛ التنفيذ الكتابي يمر عبر المشرف والاعتماد.`,
    prompt: text,
    temperature: 0.4,
    maxTokens: 220,
    timeoutMs: 15000,
    agentRole: agent.id,
  }).catch(() => null);
  if (!reply?.ok || !reply.text) return NextResponse.json({ ok: false, error: reply?.error || "reply_failed" }, { status: 502 });
  return NextResponse.json({ ok: true, lines: [{ agentId: agent.id, nameAr: agent.nameAr, voice: voiceFor(agent.id), text: reply.text.trim() }] });
}
