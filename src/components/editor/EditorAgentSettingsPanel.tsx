"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type {
  BuilderAgentMemoryNote,
  BuilderAgentRule,
  BuilderAgentSkill,
} from "@/lib/builder-agent/types";

type AgentPayload = {
  ok?: boolean;
  error?: string;
  skills?: BuilderAgentSkill[];
  rules?: BuilderAgentRule[];
  memory?: BuilderAgentMemoryNote[];
  hasGeminiKey?: boolean;
};

async function postAction(body: Record<string, unknown>): Promise<AgentPayload> {
  const res = await fetch("/api/admin/builder-agent", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, scope: "editor" }),
  });
  return (await res.json()) as AgentPayload;
}

export function EditorAgentSettingsPanel() {
  const { t } = useLocale();
  const copy = t.builderAgent;
  const [skills, setSkills] = useState<BuilderAgentSkill[]>([]);
  const [rules, setRules] = useState<BuilderAgentRule[]>([]);
  const [memory, setMemory] = useState<BuilderAgentMemoryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [githubUrl, setGithubUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const apply = useCallback((data: AgentPayload) => {
    if (Array.isArray(data.skills)) setSkills(data.skills);
    if (Array.isArray(data.rules)) setRules(data.rules);
    if (Array.isArray(data.memory)) setMemory(data.memory);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/builder-agent?scope=editor", { credentials: "same-origin", cache: "no-store" })
      .then((res) => res.json())
      .then((data: AgentPayload) => {
        if (!cancelled) apply(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : copy.saveFailed);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apply, copy.saveFailed]);

  const run = async (body: Record<string, unknown>) => {
    setError("");
    const data = await postAction(body);
    if (!data.ok) {
      setError(data.error || copy.saveFailed);
      return;
    }
    apply(data);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-slate-400">
        <Loader2 className="animate-spin" size={18} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Sparkles size={16} className="text-emerald-600" />
          {copy.title}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{copy.subtitle}</p>
        <Link href="/admin/builder-agent" className="mt-2 inline-block text-[11px] text-emerald-700">
          {copy.openAdmin}
        </Link>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{copy.skills}</h3>
          <div className="mb-2 flex gap-2">
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder={copy.githubUrl}
              className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
            />
            <button
              type="button"
              disabled={importing || !githubUrl.trim()}
              onClick={async () => {
                setImporting(true);
                await run({ action: "importGithub", url: githubUrl.trim() });
                setImporting(false);
              }}
              className="rounded-lg bg-[#051741] px-2 py-1.5 text-[11px] font-semibold text-white disabled:opacity-40"
            >
              {importing ? copy.importing : copy.importAction}
            </button>
          </div>
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.id} className="rounded-xl border border-slate-200 px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{skill.title}</p>
                  <button
                    type="button"
                    onClick={() => void run({ action: "toggleSkill", id: skill.id, enabled: !skill.enabled })}
                    className="text-[10px] text-slate-500"
                  >
                    {skill.enabled ? copy.enabled : copy.disabled}
                  </button>
                  <button type="button" onClick={() => void run({ action: "deleteSkill", id: skill.id })}>
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
            {skills.length === 0 ? <p className="text-xs text-slate-400">{copy.emptySkills}</p> : null}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{copy.rules}</h3>
          <div className="space-y-2">
            {rules.map((rule) => (
              <button
                key={rule.id}
                type="button"
                onClick={() => void run({ action: "toggleRule", id: rule.id, enabled: !rule.enabled })}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-start"
              >
                <span className="text-sm">{rule.title}</span>
                <span className="text-[10px] text-slate-500">{rule.enabled ? copy.enabled : copy.disabled}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{copy.memory}</h3>
          <div className="mb-2 flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={copy.memoryNote}
              className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
            />
            <button
              type="button"
              disabled={!note.trim()}
              onClick={async () => {
                await run({ action: "addMemory", note: note.trim() });
                setNote("");
              }}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-600"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {memory.map((item) => (
              <div key={item.id} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <p className="flex-1 text-xs text-slate-700">{item.note}</p>
                <button type="button" onClick={() => void run({ action: "deleteMemory", id: item.id })}>
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            ))}
            {memory.length === 0 ? <p className="text-xs text-slate-400">{copy.emptyMemory}</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
