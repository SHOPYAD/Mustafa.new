"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { adminInputClass, adminPrimaryBtnClass } from "@/components/admin/ui/admin-ui-classes";
import { cn } from "@/lib/utils";
import { extractAgentReply, sendPublishAgentMessage } from "./api";
import { PublishShell } from "./PublishShell";

type ChatRow = {
  id: string;
  role: "user" | "agent";
  text: string;
};

const WELCOME: ChatRow = {
  id: "welcome",
  role: "agent",
  text: "مرحباً. أنا وكيل محرك النشر — مستقل عن غرفة عمليات الوكلاء وعن المشرف التنفيذي. اطلب جدولة منشور أو مسودة قنوات، وسأستدعي MCP عندما يُفعَّل المسار.",
};

export function PublishAgent() {
  const [messages, setMessages] = useState<ChatRow[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userRow: ChatRow = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userRow]);
    setLoading(true);
    try {
      const result = await sendPublishAgentMessage(text);
      let reply = extractAgentReply(result.data);
      if (result.missing) {
        reply =
          "مسار `/api/admin/publish/agent` غير مفعّل بعد. لوحة المحادثة جاهزة، ولن أستدعي غرفة العمليات حتى يُربط MCP الخاص بالنشر.";
      } else if (!result.ok) {
        reply = result.error || "تعذّر الرد من وكيل النشر.";
      } else if (!reply) {
        reply = "استلم المحرك الرسالة. لا يوجد نص رد بعد.";
      }
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "agent", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "agent",
          text: "تعذّر الاتصال بوكيل النشر. أعد المحاولة لاحقاً.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublishShell
      title="وكيل النشر"
      description="محادثة مخصّصة لجدولة المحتوى عبر محرك النشر. لا ترتبط بغرفة العمليات ولا بكوبيلوت لوحة المؤشرات."
    >
      <div className="overflow-hidden rounded-3xl border border-admin-border-subtle bg-admin-bg-surface">
        <div className="flex items-center gap-3 border-b border-admin-border-subtle bg-gradient-to-l from-[color:var(--admin-gold-soft)] to-transparent px-4 py-3 ">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-[color:var(--admin-border-subtle)] bg-white text-[color:var(--admin-gold)]   text-[color:var(--admin-gold)]">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="text-sm font-black text-admin-text-primary">وكيل جدولة محرك النشر</p>
            <p className="text-[11px] text-admin-text-muted">نطاق مغلق — MCP لاحقاً</p>
          </div>
        </div>

        <div ref={scrollerRef} className="max-h-[480px] min-h-[320px] space-y-3 overflow-y-auto bg-admin-bg-subtle/40 p-4">
          {messages.map((row) => (
            <div key={row.id} className={cn("flex gap-2", row.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-black",
                  row.role === "user"
                    ? "admin-chat-user"
                    : "border border-admin-border-subtle bg-admin-bg-surface text-[color:var(--admin-gold)]"
                )}
              >
                {row.role === "user" ? "أنت" : <Bot className="size-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  row.role === "user"
                    ? "admin-chat-user"
                    : "admin-chat-assistant"
                )}
              >
                {row.text}
              </div>
            </div>
          ))}
          {loading ? (
            <p className="flex items-center gap-2 text-xs text-admin-text-muted">
              <Loader2 className="size-3.5 animate-spin" />
              يفكر ضمن نطاق النشر…
            </p>
          ) : null}
        </div>

        <form
          className="flex gap-2 border-t border-admin-border-subtle p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <input
            className={adminInputClass}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: جدول ريل كابادوكيا غداً 10 ص على إنستغرام وتيك توك"
          />
          <button type="submit" className={adminPrimaryBtnClass} disabled={loading || !input.trim()}>
            <Send className="size-4" />
            إرسال
          </button>
        </form>
      </div>
    </PublishShell>
  );
}
