"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Brain, Loader2, Plus, Trash2 } from "lucide-react";
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
      <div className="flex items-center gap-2 text-white/60">
        <Loader2 className="animate-spin" size={18} />
        {t.admin.loading}
      </div>
    );
  }

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <Brain className="text-emerald-400" size={28} />
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">{copy.subtitle}</p>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/40">{copy.scopeHint}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className={hasKey ? "text-emerald-300" : "text-amber-300"}>
            {hasKey ? t.editor.aiCopilotOnline : t.editor.aiKeyMissing}
          </span>
          <Link href={editorHref} className="text-emerald-300 underline-offset-2 hover:underline">
            {scope === "editor" ? copy.openEditor : scopeLabel}
          </Link>
          <Link href="/admin/ai-settings" className="text-white/50 underline-offset-2 hover:underline">
            {t.admin.aiSettings}
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {COPILOT_SCOPES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setScope(id);
              window.history.replaceState(null, "", `/admin/builder-agent?scope=${id}`);
            }}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              scope === id
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
            }`}
          >
            {copy.scopes[id]}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-lg font-bold text-white">
          {copy.skills} · {scopeLabel}
        </h2>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder={copy.githubUrl}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white"
          />
          <button
            type="button"
            disabled={saving || !githubUrl.trim()}
            onClick={() => void run({ action: "importGithub", url: githubUrl.trim() })}
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-[#051741] disabled:opacity-40"
          >
            {saving ? copy.importing : copy.importAction}
          </button>
        </div>
        <p className="text-xs text-white/35">{copy.importGithubHint}</p>
        <div className="grid gap-3">
          <input
            value={skillTitle}
            onChange={(e) => setSkillTitle(e.target.value)}
            placeholder={copy.skillTitle}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white"
          />
          <textarea
            value={skillMarkdown}
            onChange={(e) => setSkillMarkdown(e.target.value)}
            placeholder={copy.skillMarkdown}
            rows={5}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white"
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
            className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={14} />
            {editingSkill ? copy.save : copy.addSkill}
          </button>
        </div>
        <div className="space-y-2">
          {skills.map((skill) => (
            <div key={skill.id} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
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
                  <p className="font-semibold text-white">{skill.title}</p>
                  <p className="truncate text-xs text-white/40">
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
          {skills.length === 0 ? <p className="text-sm text-white/35">{copy.emptySkills}</p> : null}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-lg font-bold text-white">{copy.rules}</h2>
        <p className="text-xs text-white/40">{copy.defaultRulesHint}</p>
        <div className="grid gap-3">
          <input
            value={ruleTitle}
            onChange={(e) => setRuleTitle(e.target.value)}
            placeholder={copy.addRule}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white"
          />
          <textarea
            value={ruleMarkdown}
            onChange={(e) => setRuleMarkdown(e.target.value)}
            rows={3}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white"
          />
          <button
            type="button"
            disabled={saving || !ruleTitle.trim() || !ruleMarkdown.trim()}
            onClick={async () => {
              await run({ action: "upsertRule", title: ruleTitle.trim(), markdown: ruleMarkdown });
              setRuleTitle("");
              setRuleMarkdown("");
            }}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={14} />
            {copy.addRule}
          </button>
        </div>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{rule.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{rule.markdown}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void run({ action: "toggleRule", id: rule.id, enabled: !rule.enabled })}
                  className="text-xs text-emerald-300"
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

      <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-lg font-bold text-white">{copy.memory}</h2>
        <div className="flex gap-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={copy.memoryNote}
            className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white"
          />
          <button
            type="button"
            disabled={saving || !note.trim()}
            onClick={async () => {
              await run({ action: "addMemory", note: note.trim() });
              setNote("");
            }}
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-[#051741] disabled:opacity-40"
          >
            {copy.addMemory}
          </button>
        </div>
        <div className="space-y-2">
          {memory.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/10 px-4 py-3">
              <p className="flex-1 text-sm text-white/80">{item.note}</p>
              <button type="button" onClick={() => void run({ action: "deleteMemory", id: item.id })}>
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
          {memory.length === 0 ? <p className="text-sm text-white/35">{copy.emptyMemory}</p> : null}
        </div>
      </section>
    </div>
  );
}

export default function AdminBuilderAgentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="animate-spin" size={18} />
        </div>
      }
    >
      <AdminBuilderAgentPageInner />
    </Suspense>
  );
}
