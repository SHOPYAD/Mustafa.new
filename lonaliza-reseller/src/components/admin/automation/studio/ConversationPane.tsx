"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import type { StudioChatMessage } from "@/lib/automation/studio-chat";

export function ConversationPane({
  messages,
  input,
  setInput,
  busy,
  onSend,
}: {
  messages: StudioChatMessage[];
  input: string;
  setInput: (value: string) => void;
  busy: boolean;
  onSend: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">محادثة الأتمتة</p>
          <p className="text-xs text-muted-foreground">صف الوظيفة بالعربية — المسودة تُبنى كاملة قبل أي أثر جانبي.</p>
        </div>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm leading-relaxed text-muted-foreground">
            مثال: «ثلاثة مقالات يومياً الساعة 9 بتوقيت إسطنبول عن تركيا، تجريبي، بدون نشر تلقائي».
            <br />
            أو: «حملة بريد أسبوعية لعملاء CRM الموافقين فقط».
          </div>
        ) : null}
        {messages.map((row, i) => (
          <div
            key={`${row.role}-${i}`}
            dir="auto"
            className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              row.role === "user"
                ? "ms-8 bg-amber-500/10 text-foreground"
                : "me-8 bg-secondary/70 text-foreground"
            }`}
          >
            {row.content}
          </div>
        ))}
        {busy ? (
          <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-amber-500" />
            يبني المسودة من الكتالوج…
          </div>
        ) : null}
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={areaRef}
            value={input}
            rows={3}
            dir="auto"
            disabled={busy}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="صف الوظيفة بالعربية…"
            className="min-h-[3.25rem] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
          <button
            type="button"
            disabled={busy || !input.trim()}
            onClick={onSend}
            className="flex size-11 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors shadow-sm"
            aria-label="إرسال"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
