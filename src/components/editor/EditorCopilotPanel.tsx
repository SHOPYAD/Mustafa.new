"use client";

import { useCopilotChatInternal } from "@copilotkit/react-core";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  CheckCircle2,
  EyeOff,
  Loader2,
  Palette,
  Plus,
  Send,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickCopy, sectionLabel } from "@/lib/visual-editor/schema";
import { useBuilderStore } from "@/lib/builder/editor-store";
import { cn } from "@/lib/builder/cn";
import { customPageIdFromSlug, type EditorPagesData } from "@/lib/builder-pages";
import { useAdminCopilot } from "@/components/admin/copilot/AdminCopilotContext";
import { CopilotModeToggle } from "@/components/admin/copilot/CopilotModeToggle";
import { useEditorCopilotEnabled } from "./EditorCopilotContext";
import { useEditorCopilotActions, useEditorCopilotContext } from "./copilot-bridge";
import { flattenChatRows, hasCopilotActivity, newUserMessage } from "@/lib/copilot/agui-chat";
import { useCopilotWatchdog } from "@/components/admin/copilot/use-copilot-watchdog";
import {
  builderToolDoneLabel,
  builderToolLabel,
  isBuilderCopilotTool,
  summariseBuilderTool,
  type BuilderCopilotToolName,
} from "./copilot-tools";

const QUICK_PROMPTS = [
  { textAr: "أعد تصميم القسم الموسوم من الصفر — اقرأ ملف القالب وعدّل الهيكل والـ CSS.", textEn: "Redesign the tagged section from scratch — read the template file and change structure + CSS.", icon: Wand2 },
  { textAr: "اجعل لون الهوية الأساسي زمردياً أعمق.", textEn: "Change the primary color to deep teal.", icon: Palette },
  { textAr: "أخفِ قسم آراء العملاء.", textEn: "Hide the testimonials section.", icon: EyeOff },
  { textAr: "أنشئ قسماً جديداً من الصفر بعد القسم الموسوم.", textEn: "Create a new section from scratch after the tagged one.", icon: Plus },
  { textAr: "اجعل عنوان الهيرو أكبر وأوضح.", textEn: "Make the hero headline bigger and clearer.", icon: Type },
];

function ToolCallCard({ name, args, done }: { name: string; args: unknown; done: boolean }) {
  const toolName: BuilderCopilotToolName | null = isBuilderCopilotTool(name) ? name : null;
  const label = toolName ? (done ? builderToolDoneLabel(toolName) : builderToolLabel(toolName)) : name;
  const rawArgs = args && typeof args === "object" ? (args as Record<string, unknown>) : null;
  const summary = toolName ? summariseBuilderTool(toolName, rawArgs) : null;
  const isFileTool =
    name === "applyProjectPatch" ||
    name === "readProjectFile" ||
    name === "createHomepageSection" ||
    name === "listProjectFiles";
  return (
    <div className={cn("builder-tool me-6", done ? "is-done" : "is-running")}>
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md",
          done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
        )}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold">{label}</span>
        {summary ? (
          <span className={cn("block text-[10px] opacity-70", isFileTool ? "whitespace-pre-wrap break-all" : "truncate")}>
            {summary}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function EditorCopilotChat() {
  const { t } = useLocale();
  const { mode, setMode } = useAdminCopilot();
  const selected = useBuilderStore((s) => s.selectedElement);
  const locale = useBuilderStore((s) => s.locale);
  const setAgentBusy = useBuilderStore((s) => s.setAgentBusy);
  const automation = mode === "automation";

  useEditorCopilotContext();
  useEditorCopilotActions();

  const chat = useCopilotChatInternal();
  const rawMessages = (chat.messages || []) as unknown[];
  const rows = useMemo(() => flattenChatRows(rawMessages), [rawMessages]);
  const [input, setInput] = useState("");
  const [threadError, setThreadError] = useState("");
  const [pendingUserText, setPendingUserText] = useState("");
  const [filesChanged, setFilesChanged] = useState<Array<{ path: string; action: string }>>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isLoading = Boolean(chat.isLoading);
  const agentReady = Boolean(chat.agent);

  useCopilotWatchdog({
    isAvailable: agentReady,
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
    const onFiles = (event: Event) => {
      const detail = (event as CustomEvent<{ changed?: Array<{ path: string; action: string }> }>).detail;
      if (detail?.changed?.length) {
        setFilesChanged((prev) => {
          const next = [...prev];
          for (const item of detail.changed || []) {
            if (!next.some((row) => row.path === item.path && row.action === item.action)) next.push(item);
          }
          return next;
        });
      }
    };
    window.addEventListener("alrayyan:copilot-files", onFiles);
    return () => {
      window.removeEventListener("alrayyan:copilot-error", onErr);
      window.removeEventListener("alrayyan:copilot-files", onFiles);
    };
  }, []);

  useEffect(() => {
    setAgentBusy(isLoading);
    return () => setAgentBusy(false);
  }, [isLoading, setAgentBusy]);

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
        const latest = flattenChatRows((chat.messages || []) as unknown[]);
        const replied = latest.some(
          (row) => row.kind === "tool" || (row.kind === "text" && row.role === "assistant")
        );
        if (!replied) {
          setThreadError(
            locale === "ar"
              ? "فشل Gemini — لم يصل رد. راجع المفتاح والنموذج في إعدادات الذكاء الاصطناعي."
              : "Gemini failed with no reply. Check the API key and model in AI Settings."
          );
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
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-3 py-2.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl builder-gradient-brand shadow-md">
          <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
          <span className={cn("builder-status-dot absolute -bottom-0.5 -right-0.5 ring-2 ring-white", isLoading && "is-thinking")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold tracking-tight">{t.editor.agentName}</span>
            <span className="builder-chip">
              <Sparkles className="h-2.5 w-2.5" />
              CopilotKit • Gemini
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isLoading
              ? t.editor.aiThinking
              : agentReady
                ? t.editor.aiCopilotOnline
                : "Connecting · CopilotKit"}
          </p>
        </div>
        <CopilotModeToggle mode={mode} onChange={setMode} variant="light" />
        <Link href={automation ? "/admin/automation" : "/admin/builder-agent"} className="text-[11px] text-violet-600">
          {automation ? t.admin.automation : t.editor.agentSettings}
        </Link>
      </div>
      {selected?.sectionType ? (
        <div className="border-b border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-800">
          {t.editor.tagged}: {pickCopy(sectionLabel(selected.sectionType), locale)}
          {selected.field ? ` · ${selected.field}` : ""}
          {selected.sectionInstanceId ? ` · ${selected.sectionInstanceId}` : ""}
        </div>
      ) : (
        <div className="border-b border-slate-100 px-3 py-2 text-[11px] text-slate-500">
          {automation ? t.editor.automationHint : t.editor.aiHint}
        </div>
      )}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {rows.length === 0 ? (
          <div className="space-y-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.textEn}
                type="button"
                onClick={() => send(locale === "en" ? prompt.textEn : prompt.textAr)}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-start text-xs text-slate-700 hover:border-violet-300 hover:bg-violet-50"
              >
                <prompt.icon size={14} className="text-violet-600" />
                {locale === "en" ? prompt.textEn : prompt.textAr}
              </button>
            ))}
          </div>
        ) : null}
        {rows.map((row) => {
          if (row.kind === "tool") {
            return (
              <ToolCallCard
                key={row.id}
                name={row.name}
                args={row.args}
                done={row.done}
              />
            );
          }
          return (
            <div
              key={row.id}
              className={row.role === "user" ? "builder-msg-user ms-8" : "builder-msg-assistant me-6"}
            >
              {row.content}
            </div>
          );
        })}
        {threadError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {threadError}
          </div>
        ) : null}
        {isLoading ? (
          <div className="builder-typing px-2">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {filesChanged.length ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
            <div className="mb-1 font-semibold">
              {locale === "ar" ? "ملفات تغيّرت" : "Files changed"}
            </div>
            {filesChanged.map((file) => (
              <div key={`${file.action}-${file.path}`} className="truncate">
                {file.action} · {file.path}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={automation ? t.editor.automationPlaceholder : t.editor.aiPlaceholder}
            className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg builder-gradient-brand text-white disabled:opacity-40"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        {rows.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setFilesChanged([]);
              chat.reset();
            }}
            className="mt-2 text-[11px] text-slate-400 hover:text-slate-600"
          >
            {t.editor.clearHistory}
          </button>
        ) : null}
      </div>
    </div>
  );
}

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  applied?: boolean;
  filesChanged?: Array<{ path: string; action: string }>;
};

type BuilderResult = {
  ok?: boolean;
  error?: string;
  reply?: string;
  templatePatch?: Record<string, unknown>;
  pageThemePatch?: unknown;
  customPage?: { slug?: string };
  created?: boolean;
  filesChanged?: Array<{ path: string; action: string }>;
  copilotSection?: {
    slug: string;
    html: string;
    css: string;
    titleAr: string;
    titleEn: string;
    titleTr: string;
  } | null;
};

async function streamGeminiBuilder(
  body: Record<string, unknown>,
  onDelta: (chunk: string) => void
): Promise<BuilderResult> {
  const res = await fetch("/api/gemini/builder", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ ...body, stream: true }),
  });
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/event-stream") || !res.body) {
    return (await res.json()) as BuilderResult;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: BuilderResult = { ok: false, error: "Empty Gemini stream" };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    let event = "message";
    for (const part of parts) {
      const lines = part.split("\n");
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        const parsed = JSON.parse(data) as BuilderResult & { text?: string };
        if (event === "delta" && parsed.text) onDelta(parsed.text);
        else if (event === "result") result = parsed;
        else if (event === "error") result = { ok: false, error: parsed.error || "Gemini stream error" };
      } catch {
        /* ignore */
      }
    }
  }
  return result;
}

function GeminiBuilderFallback({
  seedMessage,
  seedReason,
}: {
  seedMessage?: string;
  seedReason?: string;
}) {
  const { t } = useLocale();
  const theme = useBuilderStore((s) => s.theme);
  const selected = useBuilderStore((s) => s.selectedElement);
  const locale = useBuilderStore((s) => s.locale);
  const activePage = useBuilderStore((s) => s.activePage);
  const applyPatch = useBuilderStore((s) => s.applyPatch);
  const applyEditorPagesData = useBuilderStore((s) => s.applyEditorPagesData);
  const setActivePage = useBuilderStore((s) => s.setActivePage);
  const setAgentBusy = useBuilderStore((s) => s.setAgentBusy);
  const { hasGeminiKey } = useEditorCopilotEnabled();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setAgentBusy(loading);
    return () => setAgentBusy(false);
  }, [loading, setAgentBusy]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: trimmed }, { role: "assistant", content: "" }];
    setMessages(next);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);
    try {
      const data = await streamGeminiBuilder(
        {
          messages: next
            .filter((m) => m.role === "user" || Boolean(m.content))
            .map((m) => ({ role: m.role, content: m.content })),
          pageId: activePage,
          homepageContext: theme,
          templateDraft: theme,
          pageSnapshot: theme,
          canvasLocale: locale,
          selectedSection: selected,
        },
        (chunk) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: `${last.content}${chunk}` };
            }
            return copy;
          });
        }
      );
      if (!data.ok) {
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: data.error || t.editor.aiError };
          } else {
            copy.push({ role: "assistant", content: data.error || t.editor.aiError });
          }
          return copy;
        });
      } else {
        const applied = Boolean(data.templatePatch && typeof data.templatePatch === "object");
        if (applied && data.templatePatch) {
          try {
            applyPatch(data.templatePatch);
            const made = data.copilotSection;
            if (made) {
              const store = useBuilderStore.getState();
              const created = [...store.theme.layout].reverse().find((item) => item.type === "copilot");
              if (created) {
                store.updateSectionSettings(created.instanceId, {
                  copilotSlug: made.slug,
                  html: made.html,
                  css: made.css,
                });
                store.applyPatch({
                  updateSectionTexts: {
                    instanceId: created.instanceId,
                    texts: {
                      title: { ar: made.titleAr, en: made.titleEn, tr: made.titleTr },
                    },
                  },
                });
              }
            }
          } catch (err) {
            throw new Error(err instanceof Error ? err.message : "Cannot convert undefined or null to object.");
          }
        }
        if (data.pageThemePatch || data.customPage) {
          window.dispatchEvent(new CustomEvent("alrayyan:builder-refresh"));
        }
        if (data.customPage?.slug) {
          const pagesRes = await fetch("/api/admin/builder-pages", {
            credentials: "same-origin",
            cache: "no-store",
          });
          const pagesData = await pagesRes.json();
          if (pagesData?.ok && Array.isArray(pagesData.pages)) {
            applyEditorPagesData(pagesData as EditorPagesData);
            if (data.created) setActivePage(customPageIdFromSlug(data.customPage.slug));
          }
        }
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          const content = (last?.role === "assistant" && last.content) || data.reply || t.editor.aiDone;
          const row: ChatMsg = {
            role: "assistant",
            content,
            applied: applied || Boolean(data.pageThemePatch) || Boolean(data.customPage) || Boolean(data.filesChanged?.length),
            filesChanged: data.filesChanged,
          };
          if (last?.role === "assistant") copy[copy.length - 1] = row;
          else copy.push(row);
          return copy;
        });
      }
    } catch (err) {
      setMessages((m) => [
        ...m.filter((row) => row.role !== "assistant" || row.content),
        { role: "assistant", content: err instanceof Error ? err.message : t.editor.aiError },
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
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-3 py-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl builder-gradient-brand">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{t.editor.agentName}</div>
          <p className="text-[11px] text-slate-500">
            {hasGeminiKey === false
              ? t.editor.aiKeyMissing
              : seedReason || t.editor.aiFallbackHint}
          </p>
        </div>
        <Link href="/admin/ai-settings" className="text-[11px] text-violet-600">
          Gemini
        </Link>
      </div>
      {selected?.sectionType ? (
        <div className="border-b border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-800">
          {t.editor.tagged}: {pickCopy(sectionLabel(selected.sectionType), locale)}
        </div>
      ) : null}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="text-xs leading-relaxed text-slate-500">{t.editor.aiHint}</p>
        ) : null}
        {messages.map((m, i) => (
          <div key={i} className="space-y-1.5">
            <div className={m.role === "user" ? "builder-msg-user ms-8" : "builder-msg-assistant me-6"}>
              {m.content.replace(/```json[\s\S]*?```/g, `\n[${t.editor.patchApplied}]\n`)}
            </div>
            {m.applied ? (
              <div className="builder-tool is-done me-6">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-semibold">{t.editor.patchApplied}</span>
              </div>
            ) : null}
            {m.filesChanged?.length ? (
              <div className="me-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
                {m.filesChanged.map((file) => (
                  <div key={`${file.action}-${file.path}`} className="truncate">
                    {file.action} · {file.path}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {loading ? (
          <div className="builder-typing px-2">
            <span />
            <span />
            <span />
          </div>
        ) : null}
      </div>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder={t.editor.aiPlaceholder}
            className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void send(input)}
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg builder-gradient-brand text-white disabled:opacity-40"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditorCopilotPanel() {
  const { enabled, hasGeminiKey } = useEditorCopilotEnabled();

  if (hasGeminiKey === null) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-slate-400">
        <Loader2 className="animate-spin" size={18} />
      </div>
    );
  }
  if (!enabled) {
    return <GeminiBuilderFallback />;
  }
  return <EditorCopilotChat />;
}
