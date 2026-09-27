"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Shield,
  Wrench,
  Brain,
  ScrollText,
  Save,
} from "lucide-react";
import type { RegisteredSwarmAgent } from "@/lib/swarm/types";
import type { SwarmToolCatalogEntry } from "@/lib/swarm/tool-catalog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type Tab = "general" | "prompt" | "skills" | "rules" | "tools" | "memory";

async function postAction(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/automation/agent-war-room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as { ok?: boolean; agent?: RegisteredSwarmAgent; error?: string };
}

export default function AgentSettingsModal({
  agentId,
  isCreate,
  toolCatalog,
  initialAgent,
  onClose,
  onSaved,
}: {
  agentId?: string;
  isCreate?: boolean;
  toolCatalog: SwarmToolCatalogEntry[];
  initialAgent?: RegisteredSwarmAgent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(!isCreate && !initialAgent);
  const [saving, setSaving] = useState(false);
  const [agent, setAgent] = useState<RegisteredSwarmAgent | null>(null);
  const [nameAr, setNameAr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [missionAr, setMissionAr] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [color, setColor] = useState("slate");
  const [allowedTools, setAllowedTools] = useState<string[]>([]);
  const [skillTitle, setSkillTitle] = useState("");
  const [skillBody, setSkillBody] = useState("");
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleBody, setRuleBody] = useState("");
  const [memoryNote, setMemoryNote] = useState("");

  useEffect(() => {
    const apply = (found: RegisteredSwarmAgent) => {
      setAgent(found);
      setNameAr(found.nameAr);
      setTitleAr(found.titleAr);
      setMissionAr(found.missionAr);
      setSystemPrompt(found.systemPrompt);
      setColor(found.color);
      setAllowedTools(found.allowedTools);
      setLoading(false);
    };
    if (initialAgent) {
      apply(initialAgent);
      return;
    }
    if (!agentId || isCreate) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetch("/api/admin/automation/agent-war-room", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { registry?: RegisteredSwarmAgent[] }) => {
        if (cancelled) return;
        const found = (data.registry || []).find((a) => a.id === agentId);
        if (found) apply(found);
        else setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agentId, isCreate, initialAgent]);

  const persistCore = async () => {
    setSaving(true);
    try {
      const data = await postAction({
        action: "upsert_agent",
        agent: {
          id: agent?.id || agentId,
          nameAr,
          titleAr,
          missionAr,
          systemPrompt,
          color,
          allowedTools,
        },
      });
      if (data.agent) {
        setAgent(data.agent);
        onSaved();
      }
      return data.agent || null;
    } finally {
      setSaving(false);
    }
  };

  const tabs: Array<{ id: Tab; label: string; icon: ReactNode }> = [
    { id: "general", label: "عام", icon: <Sparkles size={14} /> },
    { id: "prompt", label: "البرومبت", icon: <ScrollText size={14} /> },
    { id: "skills", label: "المهارات", icon: <Brain size={14} /> },
    { id: "rules", label: "القواعد", icon: <Shield size={14} /> },
    { id: "tools", label: "الأدوات", icon: <Wrench size={14} /> },
    { id: "memory", label: "الذاكرة", icon: <Save size={14} /> },
  ];

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent dir="rtl" className="sm:max-w-[1180px] max-h-[92vh] overflow-hidden p-0 flex flex-col gap-0" showCloseButton={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--admin-border-subtle)]">
          <div>
            <h2 className="text-base font-black text-[color:var(--admin-text-primary)]">
              {isCreate ? "إضافة وكيل جديد إلى الخلية" : `إعدادات ${agent?.nameAr || "الوكيل"}`}
            </h2>
            <p className="text-[11px] text-[color:var(--admin-text-muted)] mt-0.5">تحكم كامل بالمهمة والبرومبت والمهارات والقواعد والأدوات</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-[color:var(--admin-bg-subtle)]">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-[color:var(--admin-border-subtle)]">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                tab === t.id
                  ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent"
                  : "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-muted)] dark:text-[color:var(--admin-text-muted)] border-[color:var(--admin-border-subtle)]"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[color:var(--admin-text-muted)] gap-2">
              <Loader2 className="animate-spin" size={20} />
              جاري التحميل…
            </div>
          ) : (
            <>
              {tab === "general" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="space-y-1 text-xs font-bold text-[color:var(--admin-text-muted)]">
                    اسم الوكيل
                    <input className="w-full mt-1 rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] px-3 py-2 text-sm text-[color:var(--admin-text-primary)]" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
                  </label>
                  <label className="space-y-1 text-xs font-bold text-[color:var(--admin-text-muted)]">
                    المسمى / المهمة المختصرة
                    <input className="w-full mt-1 rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] px-3 py-2 text-sm text-[color:var(--admin-text-primary)]" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
                  </label>
                  <label className="sm:col-span-2 space-y-1 text-xs font-bold text-[color:var(--admin-text-muted)]">
                    المهمة التفصيلية
                    <textarea rows={3} className="w-full mt-1 rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] px-3 py-2 text-sm text-[color:var(--admin-text-primary)]" value={missionAr} onChange={(e) => setMissionAr(e.target.value)} />
                  </label>
                  <label className="space-y-1 text-xs font-bold text-[color:var(--admin-text-muted)]">
                    اللون
                    <select className="w-full mt-1 rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] px-3 py-2 text-sm" value={color} onChange={(e) => setColor(e.target.value)}>
                      {["emerald", "teal", "sky", "amber", "purple", "blue", "rose", "slate"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {tab === "prompt" && (
                <textarea
                  rows={14}
                  className="w-full rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] px-4 py-3 text-sm leading-relaxed text-[color:var(--admin-text-primary)]"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="البرومبت الرئيسي للوكيل…"
                />
              )}

              {tab === "skills" && (
                <div className="space-y-3">
                  {(agent?.skills || []).map((s) => (
                    <div key={s.id} className="p-3 rounded-2xl border border-[color:var(--admin-border-subtle)] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs">{s.title}</strong>
                        <div className="flex gap-1">
                          <button type="button" className="text-[10px] px-2 py-1 rounded-lg border" onClick={() => void postAction({ action: "toggle_skill", agentId: agent?.id, skillId: s.id }).then((d) => d.agent && setAgent(d.agent))}>
                            {s.enabled ? "مفعّلة" : "متوقفة"}
                          </button>
                          <button type="button" onClick={() => void postAction({ action: "delete_skill", agentId: agent?.id, skillId: s.id }).then((d) => d.agent && setAgent(d.agent))}>
                            <Trash2 size={14} className="text-rose-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[color:var(--admin-text-muted)] whitespace-pre-wrap">{s.markdown}</p>
                    </div>
                  ))}
                  <div className="grid gap-2">
                    <input className="rounded-xl border px-3 py-2 text-sm" placeholder="عنوان المهارة" value={skillTitle} onChange={(e) => setSkillTitle(e.target.value)} />
                    <textarea className="rounded-xl border px-3 py-2 text-sm" rows={3} placeholder="نص المهارة (يُحقن في البرومبت)" value={skillBody} onChange={(e) => setSkillBody(e.target.value)} />
                    <button
                      type="button"
                      disabled={!skillTitle || !skillBody}
                      className="inline-flex items-center gap-1.5 self-start px-3 py-2 rounded-xl bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] text-xs font-bold"
                      onClick={async () => {
                        let id = agent?.id;
                        if (!id) {
                          const created = await persistCore();
                          id = created?.id;
                        }
                        if (!id) return;
                        const data = await postAction({ action: "add_skill", agentId: id, title: skillTitle, markdown: skillBody });
                        if (data.agent) {
                          setAgent(data.agent);
                          setSkillTitle("");
                          setSkillBody("");
                          onSaved();
                        }
                      }}
                    >
                      <Plus size={14} /> إضافة المهارة إلى الوكيل
                    </button>
                  </div>
                </div>
              )}

              {tab === "rules" && (
                <div className="space-y-3">
                  {(agent?.rules || []).map((s) => (
                    <div key={s.id} className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs">{s.title}</strong>
                        <div className="flex gap-1">
                          <button type="button" className="text-[10px] px-2 py-1 rounded-lg border" onClick={() => void postAction({ action: "toggle_rule", agentId: agent?.id, ruleId: s.id }).then((d) => d.agent && setAgent(d.agent))}>
                            {s.enabled ? "ملزمة" : "متوقفة"}
                          </button>
                          <button type="button" onClick={() => void postAction({ action: "delete_rule", agentId: agent?.id, ruleId: s.id }).then((d) => d.agent && setAgent(d.agent))}>
                            <Trash2 size={14} className="text-rose-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[color:var(--admin-text-muted)] whitespace-pre-wrap">{s.markdown}</p>
                    </div>
                  ))}
                  <input className="rounded-xl border px-3 py-2 text-sm w-full" placeholder="عنوان القاعدة" value={ruleTitle} onChange={(e) => setRuleTitle(e.target.value)} />
                  <textarea className="rounded-xl border px-3 py-2 text-sm w-full" rows={3} placeholder="القاعدة تُحقن دائماً في البرومبت" value={ruleBody} onChange={(e) => setRuleBody(e.target.value)} />
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 text-foreground text-xs font-bold"
                    onClick={async () => {
                      let id = agent?.id;
                      if (!id) {
                        const created = await persistCore();
                        id = created?.id;
                      }
                      if (!id || !ruleTitle || !ruleBody) return;
                      const data = await postAction({ action: "add_rule", agentId: id, title: ruleTitle, markdown: ruleBody });
                      if (data.agent) {
                        setAgent(data.agent);
                        setRuleTitle("");
                        setRuleBody("");
                        onSaved();
                      }
                    }}
                  >
                    <Plus size={14} /> إضافة قاعدة
                  </button>
                </div>
              )}

              {tab === "tools" && (
                <div className="grid sm:grid-cols-2 gap-2">
                  {toolCatalog.map((tool) => {
                    const checked = allowedTools.includes(tool.key);
                    return (
                      <label key={tool.key} className={`p-3 rounded-2xl border text-xs cursor-pointer ${checked ? "border-[color:var(--admin-gold)] bg-[color:var(--admin-gold-soft)]" : "border-[color:var(--admin-border-subtle)]"}`}>
                        <input
                          type="checkbox"
                          className="me-2"
                          checked={checked}
                          onChange={() =>
                            setAllowedTools((prev) =>
                              prev.includes(tool.key) ? prev.filter((k) => k !== tool.key) : [...prev, tool.key]
                            )
                          }
                        />
                        <strong>{tool.nameAr}</strong>
                        <span className="block text-[11px] text-[color:var(--admin-text-muted)] mt-1">{tool.descriptionAr} · {tool.kind === "write" ? "كتابة" : "قراءة"}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {tab === "memory" && (
                <div className="space-y-3">
                  {(agent?.memory || []).map((m) => (
                    <div key={m.id} className="p-3 rounded-2xl border flex items-start justify-between gap-2">
                      <p className="text-xs">{m.note}</p>
                      <button type="button" onClick={() => void postAction({ action: "delete_memory", agentId: agent?.id, noteId: m.id }).then((d) => d.agent && setAgent(d.agent))}>
                        <Trash2 size={14} className="text-rose-500" />
                      </button>
                    </div>
                  ))}
                  <textarea className="w-full rounded-xl border px-3 py-2 text-sm" rows={3} value={memoryNote} onChange={(e) => setMemoryNote(e.target.value)} placeholder="ملاحظة ذاكرة دائمة للوكيل" />
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[color:var(--admin-bg-surface)] text-foreground text-xs font-bold"
                    onClick={async () => {
                      let id = agent?.id;
                      if (!id) {
                        const created = await persistCore();
                        id = created?.id;
                      }
                      if (!id || !memoryNote.trim()) return;
                      const data = await postAction({ action: "add_memory", agentId: id, note: memoryNote });
                      if (data.agent) {
                        setAgent(data.agent);
                        setMemoryNote("");
                        onSaved();
                      }
                    }}
                  >
                    <Plus size={14} /> حفظ في الذاكرة
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[color:var(--admin-border-subtle)] flex items-center justify-between gap-3">
          {agent?.isCustom ? (
            <button
              type="button"
              className="text-xs font-bold text-rose-600"
              onClick={async () => {
                await postAction({ action: "delete_agent", agentId: agent.id });
                onSaved();
                onClose();
              }}
            >
              حذف الوكيل المخصص
            </button>
          ) : (
            <span className="text-[11px] text-[color:var(--admin-text-muted)]">الوكلاء الأساسيون لا يُحذفون — يمكن تعطيل أدواتهم وتعديل برومبتهم.</span>
          )}
          <button
            type="button"
            disabled={!nameAr.trim() || saving}
            onClick={async () => {
              const saved = await persistCore();
              if (saved && tab !== "general") {
                await postAction({ action: "update_prompt", agentId: saved.id, systemPrompt });
                await postAction({ action: "update_tools", agentId: saved.id, allowedTools });
              }
              onSaved();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] text-xs font-bold disabled:opacity-40"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            حفظ الإعدادات
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
