"use client";

import { useCopilotChatInternal } from "@copilotkit/react-core";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { CheckCircle2, Loader2, Send, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { labelForScope } from "@/lib/builder-agent/defaults";
import type { CopilotScope } from "@/lib/builder-agent/types";
import { flattenChatRows, hasCopilotActivity, newUserMessage } from "@/lib/copilot/agui-chat";
import { useAdminCopilot } from "./AdminCopilotContext";
import { CopilotModeToggle } from "./CopilotModeToggle";
import { useCopilotWatchdog } from "./use-copilot-watchdog";

export type FallbackChatFn = (
  messages: Array<{ role: "user" | "assistant"; content: string }>
) => Promise<string>;

type Props = {
  title: string;
  hint?: string;
  placeholder?: string;
  fallback?: FallbackChatFn;
  className?: string;
};

function ToolCallCard({ name, done }: { name: string; done: boolean }) {
  return (
    <div
      className={`me-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] ${
        done
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
          : "border-border bg-card/[0.04] text-muted-foreground"
      }`}
    >
      {done ? <CheckCircle2 size={13} /> : <Loader2 size={13} className="animate-spin" />}
      <span className="truncate font-semibold">{name}</span>
    </div>
  );
}

function CopilotMessages({
  title,
  hint,
  placeholder,
  scope,
}: {
  title: string;
  hint?: string;
  placeholder?: string;
  scope: CopilotScope;
}) {
  const { t } = useLocale();
  const { mode } = useAdminCopilot();
  const chat = useCopilotChatInternal();
  const rows = useMemo(() => flattenChatRows((chat.messages || []) as unknown[]), [chat.messages]);
  const [input, setInput] = useState("");
  const [threadError, setThreadError] = useState("");
  const [pendingUserText, setPendingUserText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isLoading = Boolean(chat.isLoading);
  const rawMessages = (chat.messages || []) as unknown[];

  useCopilotWatchdog({
    isAvailable: Boolean(chat.agent),
    isLoading,
    hasAssistantReply: hasCopilotActivity(rawMessages),
    pendingUserText,
    onSilentFail: (_text, reason) => {
      setThreadError(reason);
    },
  });

  useEffect(() => {
    const onErr = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (detail?.message) setThreadError(detail.message);
    };
    window.addEventListener("alrayyan:copilot-error", onErr);
    return () => window.removeEventListener("alrayyan:copilot-error", onErr);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [rows.length, isLoading, threadError]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    if (!chat.agent) {
      setThreadError("CopilotKit is still connecting to the runtime…");
      return;
    }
    setThreadError("");
    setPendingUserText(trimmed);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    void chat
      .sendMessage(newUserMessage(trimmed))
      .then(() => {
        if (!hasCopilotActivity((chat.messages || []) as unknown[])) {
          setThreadError(t.editor.aiError);
        }
      })
      .catch((err: unknown) => {
        setThreadError(err instanceof Error ? err.message : t.editor.aiError);
      })
      .finally(() => {
        setPendingUserText("");
      });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Header title={title} hint={hint} scope={scope} thinking={isLoading} />
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {rows.length === 0 ? (
          <p className='px-1 py-6 text-center text-sm leading-relaxed text-muted-foreground' dir="auto">
            {hint || t.builderAgent.isolated}
          </p>
        ) : null}
        {rows.map((row) => {
          if (row.kind === "tool") {
            return <ToolCallCard key={row.id} name={row.name} done={row.done} />;
          }
          return (
            <div
              key={row.id}
              dir="auto"
              className={`whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm ${
                row.role === "user" ? "ms-6 bg-secondary/10 text-muted-foreground" : "me-4 bg-card/[0.04] text-muted-foreground"
              }`}
            >
              {row.content}
            </div>
          );
        })}
        {threadError ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {threadError}
          </div>
        ) : null}
        {isLoading ? (
          <div className='flex items-center gap-2 px-2 text-xs text-muted-foreground'>
            <Loader2 size={14} className='animate-spin text-secondary' />
            {t.editor.aiThinking}
          </div>
        ) : null}
      </div>
      <Composer
        input={input}
        setInput={setInput}
        inputRef={inputRef}
        placeholder={placeholder || (mode === "automation" ? t.editor.automationPlaceholder : t.editor.aiPlaceholder)}
        disabled={isLoading}
        onSend={() => send(input)}
        onClear={rows.length ? () => chat.reset() : undefined}
      />
    </div>
  );
}

function FallbackChat({
  title,
  hint,
  placeholder,
  scope,
  fallback,
  seedMessage,
  seedReason,
}: {
  title: string;
  hint?: string;
  placeholder?: string;
  scope: CopilotScope;
  fallback: FallbackChatFn;
  seedMessage?: string;
  seedReason?: string;
}) {
  const { t } = useLocale();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  const send = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await fallback(next);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e instanceof Error ? e.message : t.editor.aiError },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !seedMessage?.trim()) return;
    seededRef.current = true;
    void send(seedMessage);
  }, [seedMessage]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Header
        title={title}
        hint={seedReason || hint}
        scope={scope}
        thinking={loading}
        fallback
      />
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <p className='px-1 py-6 text-center text-sm leading-relaxed text-muted-foreground' dir="auto">
            {t.editor.aiFallbackHint}
          </p>
        ) : null}
        {messages.map((row, i) => (
          <div
            key={`${row.role}-${i}`}
            dir="auto"
            className={`whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm ${
              row.role === "user" ? "ms-6 bg-secondary/10 text-muted-foreground" : "me-4 bg-card/[0.04] text-muted-foreground"
            }`}
          >
            {row.content}
          </div>
        ))}
        {loading ? (
          <div className='flex items-center gap-2 px-2 text-xs text-muted-foreground'>
            <Loader2 size={14} className='animate-spin text-secondary' />
            {t.editor.aiThinking}
          </div>
        ) : null}
      </div>
      <Composer
        input={input}
        setInput={setInput}
        inputRef={inputRef}
        placeholder={placeholder}
        disabled={loading}
        onSend={() => void send()}
      />
    </div>
  );
}

function Header({
  title,
  hint,
  scope,
  thinking,
  fallback,
}: {
  title: string;
  hint?: string;
  scope: CopilotScope;
  thinking: boolean;
  fallback?: boolean;
}) {
  const { t, locale } = useLocale();
  const { mode, setMode } = useAdminCopilot();
  const loc = locale === "ar" || locale === "tr" ? locale : "en";
  const automation = mode === "automation";
  return (
    <div className='flex-shrink-0 border-b border-border px-3 py-2.5'>
      <div className="flex items-center gap-2">
        <span className='flex size-8 items-center justify-center rounded-xl bg-secondary/15 text-secondary'>
          <Sparkles size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className='truncate text-sm font-semibold text-foreground'>{title}</p>
            <span className='rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground'>
              {labelForScope(scope, loc)}
            </span>
          </div>
          <p className='truncate text-[11px] text-muted-foreground'>
            {thinking
              ? t.editor.aiThinking
              : fallback
                ? t.editor.aiFallbackHint
                : automation
                  ? t.editor.automationHint
                  : "CopilotKit • Gemini"}
          </p>
        </div>
        <CopilotModeToggle mode={mode} onChange={setMode} variant="dark" />
        <Link
          href={automation ? "/admin/automation-studio" : `/admin/builder-agent?scope=${encodeURIComponent(scope)}`}
          className='text-[11px] text-secondary/80 hover:text-muted-foreground'
        >
          {automation ? t.admin.automation : t.builderAgent.openAdmin}
        </Link>
      </div>
      {hint ? <p className='mt-1.5 text-[11px] leading-relaxed text-muted-foreground'>{hint}</p> : null}
    </div>
  );
}

function Composer({
  input,
  setInput,
  inputRef,
  placeholder,
  disabled,
  onSend,
  onClear,
}: {
  input: string;
  setInput: (value: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
  disabled: boolean;
  onSend: () => void;
  onClear?: () => void;
}) {
  const { t } = useLocale();
  return (
    <div className='flex-shrink-0 border-t border-border p-3'>
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          rows={2}
          dir="auto"
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
          }}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder || t.editor.aiPlaceholder}
          className='flex-1 resize-none rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-border/40'
        />
        <button
          type="button"
          disabled={disabled || !input.trim()}
          onClick={onSend}
          className='flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground disabled:opacity-40'
        >
          {disabled ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
      {onClear ? (
        <button type="button" onClick={onClear} className='mt-2 text-[11px] text-muted-foreground hover:text-muted-foreground'>
          {t.editor.clearHistory}
        </button>
      ) : null}
    </div>
  );
}

export function AdminCopilotChat({ title, hint, placeholder, fallback, className }: Props) {
  const { t } = useLocale();
  const { scope, enabled, hasGeminiKey } = useAdminCopilot();

  if (hasGeminiKey === null) {
    return (
      <div className={`flex items-center justify-center gap-2 text-sm text-muted-foreground ${className || ""}`}>
        <Loader2 size={16} className="animate-spin" />
        {t.admin.loading}
      </div>
    );
  }

  if (!enabled) {
    if (fallback) {
      return (
        <div className={className}>
          <FallbackChat
            title={title}
            hint={hint}
            placeholder={placeholder}
            scope={scope}
            fallback={fallback}
          />
        </div>
      );
    }
    return (
      <div className={`space-y-2 p-4 text-sm text-[var(--admin-btn-secondary-border)]/80 ${className || ""}`}>
        <p>{t.editor.aiKeyMissing}</p>
        <Link href="/admin/ai-settings" className='text-secondary underline'>
          {t.admin.aiSettings}
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <CopilotMessages title={title} hint={hint} placeholder={placeholder} scope={scope} />
    </div>
  );
}
