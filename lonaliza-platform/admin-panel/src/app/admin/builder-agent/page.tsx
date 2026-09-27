"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Brain, FileCode, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  COPILOT_SCOPES,
  parseCopilotScope,
  type BuilderAgentMemoryNote,
  type BuilderAgentRule,
  type BuilderAgentSkill,
  type CopilotScope,
} from "@/lib/builder-agent/types";

type AgentPayload = {
  ok?: boolean;
  error?: string;
  skills?: BuilderAgentSkill[];
  rules?: BuilderAgentRule[];
  memory?: BuilderAgentMemoryNote[];
  hasGeminiKey?: boolean;
  scope?: CopilotScope;
};

async function postAction(body: Record<string, unknown>): Promise<AgentPayload> {
  const res = await fetch("/api/admin/builder-agent", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as AgentPayload;
}

function AdminBuilderAgentPageInner() {
  const { t } = useLocale();
  const copy = t.builderAgent;
  const searchParams = useSearchParams();
  const [scope, setScope] = useState<CopilotScope>(() =>
    parseCopilotScope(searchParams.get("scope"))
  );
  const [skills, setSkills] = useState<BuilderAgentSkill[]>([]);
  const [rules, setRules] = useState<BuilderAgentRule[]>([]);
  const [memory, setMemory] = useState<BuilderAgentMemoryNote[]>([]);
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [skillTitle, setSkillTitle] = useState("");
  const [skillMarkdown, setSkillMarkdown] = useState("");
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleMarkdown, setRuleMarkdown] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [note, setNote] = useState("");
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await run({
        action: "uploadSkill",
        filename: file.name,
        content: text,
      });
    } catch {
      setError("فشل قراءة ملف المهارة");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const apply = useCallback((data: AgentPayload) => {
    if (Array.isArray(data.skills)) setSkills(data.skills);
    if (Array.isArray(data.rules)) setRules(data.rules);
    if (Array.isArray(data.memory)) setMemory(data.memory);
    if (typeof data.hasGeminiKey === "boolean") setHasKey(data.hasGeminiKey);
  }, []);

  useEffect(() => {
    const next = parseCopilotScope(searchParams.get("scope"));
    setScope(next);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError("");
    setEditingSkill(null);
    setSkillTitle("");
    setSkillMarkdown("");
    void fetch(`/api/admin/builder-agent?scope=${encodeURIComponent(scope)}`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: AgentPayload) => apply(data))
      .catch((e) => setError(e instanceof Error ? e.message : copy.saveFailed))
      .finally(() => setLoading(false));
  }, [apply, copy.saveFailed, scope]);

  const run = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const data = await postAction({ ...body, scope });
      if (!data.ok) {
        setError(data.error || copy.saveFailed);
        return;
      }
      apply(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const scopeLabel = useMemo(() => copy.scopes[scope], [copy.scopes, scope]);

  const editorHref =
    scope === "editor"
      ? "/admin/homepage-editor"
      : scope === "articles"
        ? "/admin/blog"
        : scope === "invoices"
          ? "/admin/invoices"
          : scope === "email"
            ? "/admin/email-marketing"
            : scope === "pages"
              ? "/admin/pages"
              : "/admin";

  if (loading) {
    return (
      <div className='flex items-center gap-2 text-muted-foreground'>
        <Loader2 className="animate-spin" size={18} />
        {t.admin.loading}
      </div>
    );
  }

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Brain size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className='text-2xl font-bold text-foreground'>{copy.title}</h1>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  وكيل الذكاء الخبير
                </span>
              </div>
              <p className='mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground'>{copy.subtitle}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-medium ${
              hasKey ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${hasKey ? "bg-emerald-500" : "bg-amber-500"}`} />
              {hasKey ? t.editor.aiCopilotOnline : t.editor.aiKeyMissing}
            </span>
            <Link href={editorHref} className="text-emerald-600 dark:text-emerald-400 underline-offset-2 hover:underline font-medium">
              {scope === "editor" ? copy.openEditor : scopeLabel}
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/admin/ai-settings" className='text-muted-foreground underline-offset-2 hover:underline'>
              {t.admin.aiSettings}
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Bento Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">المهارات المكتسبة</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {scopeLabel}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{skills.length}</p>
          <p className="text-[11px] text-muted-foreground">مهارات تخصصية مسجلة للوكيل</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">القواعد والتعليمات</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">إلزامية</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{rules.length}</p>
          <p className="text-[11px] text-muted-foreground">معايير دقيقة تحكم توليد الأكواد والقرارات</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">سجلات الذاكرة</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">تراكمية</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{memory.length}</p>
          <p className="text-[11px] text-muted-foreground">ملاحظات وذاكرة سياقية للمشروع</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">محرك Gemini Copilot</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              hasKey ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}>
              {hasKey ? "متصل" : "بحاجة لمفتاح"}
            </span>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
            {hasKey ? "جاهز للتنفيذ" : "المفتاح غير متوفر"}
          </p>
          <p className="text-[11px] text-muted-foreground">استجابة ذكية فورية للأوامر</p>
        </div>
      </div>

      {/* Scope Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card/60 p-1.5 backdrop-blur-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {COPILOT_SCOPES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setScope(id);
              window.history.replaceState(null, "", `/admin/builder-agent?scope=${id}`);
            }}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              scope === id
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {copy.scopes[id]}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      ) : null}

      <section className='space-y-4 rounded-2xl border border-border bg-background/70 p-6'>
        <h2 className='text-lg font-bold text-foreground'>
          {copy.skills} · {scopeLabel}
        </h2>

        {/* Upload MD Skill File Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileCode size={20} />
            </div>
            <div>
              <p className='text-sm font-bold text-foreground'>رفع ملف مهارة احترافي جديد (.md)</p>
              <p className='text-xs text-muted-foreground'>
                اختر أي ملف مهارات Markdown (.md) من جهازك ليتم استخراجه وتفعيله فوراً لتعزيز ذكاء الوكيل كخبير بشري.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={handleMdUpload}
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => fileInputRef.current?.click()}
            className='inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-foreground shadow-md transition-all disabled:opacity-50'
          >
            <Upload size={15} />
            <span>{saving ? "جارٍ التحميل..." : "رفع ملف مهارة (.md)"}</span>
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder={copy.githubUrl}
            className='rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-foreground'
          />
          <button
            type="button"
            disabled={saving || !githubUrl.trim()}
            onClick={() => void run({ action: "importGithub", url: githubUrl.trim() })}
            className='rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-bold text-foreground shadow-sm disabled:opacity-40'
          >
            {saving ? copy.importing : copy.importAction}
          </button>
        </div>
        <p className='text-xs text-muted-foreground'>{copy.importGithubHint}</p>
        <div className="grid gap-3">
          <input
            value={skillTitle}
            onChange={(e) => setSkillTitle(e.target.value)}
            placeholder={copy.skillTitle}
            className='rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-foreground'
          />
          <textarea
            value={skillMarkdown}
            onChange={(e) => setSkillMarkdown(e.target.value)}
            placeholder={copy.skillMarkdown}
            rows={5}
            className='rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-foreground'
          />
          <button
            type="button"
            disabled={saving || !skillTitle.trim() || !skillMarkdown.trim()}
            onClick={async () => {
              await run({
                action: "upsertSkill",
                id: editingSkill || undefined,
                title: skillTitle.trim(),
                markdown: skillMarkdown,
              });
              setSkillTitle("");
              setSkillMarkdown("");
              setEditingSkill(null);
            }}
            className='inline-flex items-center gap-2 self-start rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-foreground shadow-sm transition-all'
          >
            <Plus size={16} />
            {editingSkill ? copy.save : copy.addSkill}
          </button>
        </div>
        <div className="space-y-2">
          {skills.map((skill) => (
            <div key={skill.id} className='rounded-xl border border-border bg-foreground/5 px-4 py-3'>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-start"
                  onClick={() => {
                    setEditingSkill(skill.id);
                    setSkillTitle(skill.title);
                    setSkillMarkdown(skill.markdown);
                  }}
                >
                  <p className='font-semibold text-foreground'>{skill.title}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {skill.source === "github" ? skill.filePath || skill.repoUrl : skill.markdown.slice(0, 80)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => void run({ action: "toggleSkill", id: skill.id, enabled: !skill.enabled })}
                  className="text-xs text-emerald-300"
                >
                  {skill.enabled ? copy.enabled : copy.disabled}
                </button>
                <button type="button" onClick={() => void run({ action: "deleteSkill", id: skill.id })}>
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
          {skills.length === 0 ? <p className='text-sm text-muted-foreground'>{copy.emptySkills}</p> : null}
        </div>
      </section>

      <section className='space-y-4 rounded-2xl border border-border bg-background/70 p-6'>
        <h2 className='text-lg font-bold text-foreground'>{copy.rules}</h2>
        <p className='text-xs text-muted-foreground'>{copy.defaultRulesHint}</p>
        <div className="grid gap-3">
          <input
            value={ruleTitle}
            onChange={(e) => setRuleTitle(e.target.value)}
            placeholder={copy.addRule}
            className='rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-foreground'
          />
          <textarea
            value={ruleMarkdown}
            onChange={(e) => setRuleMarkdown(e.target.value)}
            rows={3}
            className='rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-foreground'
          />
          <button
            type="button"
            disabled={saving || !ruleTitle.trim() || !ruleMarkdown.trim()}
            onClick={async () => {
              await run({ action: "upsertRule", title: ruleTitle.trim(), markdown: ruleMarkdown });
              setRuleTitle("");
              setRuleMarkdown("");
            }}
            className='inline-flex items-center gap-2 self-start rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-foreground shadow-sm transition-all'
          >
            <Plus size={16} />
            {copy.addRule}
          </button>
        </div>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className='rounded-xl border border-border bg-foreground/5 px-4 py-3'>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className='font-semibold text-foreground'>{rule.title}</p>
                  <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>{rule.markdown}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void run({ action: "toggleRule", id: rule.id, enabled: !rule.enabled })}
                  className="text-xs font-bold text-emerald-400"
                >
                  {rule.enabled ? copy.enabled : copy.disabled}
                </button>
                <button type="button" onClick={() => void run({ action: "deleteRule", id: rule.id })}>
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='space-y-4 rounded-2xl border border-border bg-background/70 p-6'>
        <h2 className='text-lg font-bold text-foreground'>{copy.memory}</h2>
        <div className="flex gap-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={copy.memoryNote}
            className='flex-1 rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-foreground'
          />
          <button
            type="button"
            disabled={saving || !note.trim()}
            onClick={async () => {
              await run({ action: "addMemory", note: note.trim() });
              setNote("");
            }}
            className='rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-bold text-foreground shadow-sm disabled:opacity-40'
          >
            {copy.addMemory}
          </button>
        </div>
        <div className="space-y-2">
          {memory.map((item) => (
            <div key={item.id} className='flex items-start gap-3 rounded-xl border border-border px-4 py-3'>
              <p className='flex-1 text-sm text-muted-foreground'>{item.note}</p>
              <button type="button" onClick={() => void run({ action: "deleteMemory", id: item.id })}>
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
          {memory.length === 0 ? <p className='text-sm text-muted-foreground'>{copy.emptyMemory}</p> : null}
        </div>
      </section>
    </div>
  );
}

export default function AdminBuilderAgentPage() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader2 className="animate-spin" size={18} />
        </div>
      }
    >
      <AdminBuilderAgentPageInner />
    </Suspense>
  );
}
