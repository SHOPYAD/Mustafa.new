"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  PlugZap,
  Plus,
  Search,
  Trash2,
  Unplug,
} from "lucide-react";
import type { McpServerPublic, McpSource, McpToolInfo } from "@/lib/server/mcp/types";

type AuthField = {
  key: string;
  labelAr: string;
  secret?: boolean;
  placeholder?: string;
};

export type CatalogCard = {
  id: string;
  nameAr: string;
  purposeAr: string;
  source: McpSource;
  version?: string;
  categoryAr?: string;
  envKey?: string;
  envKeys?: string[];
  authFields?: AuthField[];
  authHintAr?: string;
  legalNoteAr?: string;
  needsKey?: boolean;
  tools: McpToolInfo[];
};

export const MCP_CARD_STATES = ["uninstalled", "needs_key", "connected", "verify_failed"] as const;
export type McpCardState = (typeof MCP_CARD_STATES)[number];

const inputClass =
  "w-full min-w-0 px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm";
const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  return (await res.json()) as T;
}

function cardState(card: CatalogCard, server: McpServerPublic | undefined, whatsappReady: boolean): McpCardState {
  if (server?.lastTestOk === true) return "connected";
  if (server && server.lastTestOk === false) return "verify_failed";
  const needs =
    Boolean(card.needsKey || card.envKey || card.authFields?.length) &&
    !(card.id === "liotrip-whatsapp" && whatsappReady);
  if (!server && needs) return "needs_key";
  return "uninstalled";
}

function stateLabel(state: McpCardState): string {
  switch (state) {
    case "connected":
      return "متصل";
    case "verify_failed":
      return "فشل التحقق";
    case "needs_key":
      return "يحتاج مفتاح";
    case "uninstalled":
      return "غير مثبت";
    default: {
      const _never: never = state;
      return String(_never);
    }
  }
}

function stateClass(state: McpCardState): string {
  switch (state) {
    case "connected":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "verify_failed":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";
    case "needs_key":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "uninstalled":
      return "border-border text-muted-foreground";
    default: {
      const _never: never = state;
      return String(_never);
    }
  }
}

export default function McpCatalogPanel({
  catalog,
  servers,
  mcpTools,
  whatsappReady = false,
  onReload,
}: {
  catalog: CatalogCard[];
  servers: McpServerPublic[];
  mcpTools: Array<McpToolInfo & { serverId: string; serverName: string }>;
  whatsappReady?: boolean;
  onReload: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState("");
  const [authById, setAuthById] = useState<Record<string, Record<string, string>>>({});
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | McpCardState | "category">("all");
  const [category, setCategory] = useState("");
  const [openSetup, setOpenSetup] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [mcpSource, setMcpSource] = useState<McpSource>("github");
  const [mcpValue, setMcpValue] = useState("");
  const [mcpName, setMcpName] = useState("");
  const [mcpAuth, setMcpAuth] = useState("");

  const connected = (catalogId: string) => servers.find((item) => item.catalogId === catalogId);
  const categories = useMemo(
    () => [...new Set(catalog.map((card) => card.categoryAr).filter((item): item is string => Boolean(item)))],
    [catalog]
  );

  const connectedCount = servers.filter((item) => item.lastTestOk === true && item.enabled).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((card) => {
      const server = connected(card.id);
      const state = cardState(card, server, whatsappReady);
      if (filter !== "all" && filter !== "category" && state !== filter) return false;
      if (filter === "category" && category && card.categoryAr !== category) return false;
      if (!q) return true;
      const hay = [card.nameAr, card.purposeAr, card.categoryAr, ...card.tools.map((tool) => tool.name)]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [catalog, category, filter, query, servers, whatsappReady]);

  const setField = (catalogId: string, key: string, value: string) => {
    setAuthById((prev) => ({
      ...prev,
      [catalogId]: { ...(prev[catalogId] || {}), [key]: value },
    }));
  };

  const connect = async (card: CatalogCard) => {
    setSaving(true);
    setError("");
    setTestingId(card.id);
    try {
      const fields = { ...(authById[card.id] || {}) };
      const body: Record<string, unknown> = { catalogId: card.id, fields };
      if (card.id === "mcp-github-import") {
        body.repoUrl = fields.repoUrl;
      }
      const firstSecret = card.authFields?.find((field) => field.secret)?.key;
      if (firstSecret && fields[firstSecret]) body.apiKey = fields[firstSecret];
      if (card.envKey && fields[card.envKey]) body.apiKey = fields[card.envKey];
      const data = await jsonFetch<{ ok?: boolean; error?: string }>("/api/admin/mcp/connect", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!data.ok && data.error) throw new Error(data.error);
      setOpenSetup((prev) => ({ ...prev, [card.id]: false }));
      await onReload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الربط");
    } finally {
      setSaving(false);
      setTestingId("");
    }
  };

  const test = async (id: string) => {
    setTestingId(id);
    try {
      await jsonFetch(`/api/admin/mcp/${encodeURIComponent(id)}/test`, { method: "POST" });
      await onReload();
    } finally {
      setTestingId("");
    }
  };

  const remove = async (serverId: string) => {
    setSaving(true);
    setError("");
    try {
      await jsonFetch(`/api/admin/mcp/${encodeURIComponent(serverId)}`, { method: "DELETE" });
      setConfirmDelete("");
      await onReload();
    } finally {
      setSaving(false);
    }
  };

  const addCustom = async () => {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = { source: mcpSource, name: mcpName || undefined };
      if (mcpAuth.trim()) body.apiKey = mcpAuth.trim();
      switch (mcpSource) {
        case "github":
          body.repoUrl = mcpValue;
          break;
        case "url":
          body.url = mcpValue;
          break;
        case "npm":
          body.packageName = mcpValue;
          break;
        case "other":
          body.command = mcpValue;
          break;
        case "builtin":
          throw new Error("استخدموا بطاقات الكتالوج للحزم المدمجة");
        default: {
          const _never: never = mcpSource;
          throw new Error(`مصدر غير مدعوم: ${String(_never)}`);
        }
      }
      const data = await jsonFetch<{ ok?: boolean; error?: string; server?: McpServerPublic }>("/api/admin/mcp", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!data.ok) throw new Error(data.error || "فشل الإضافة");
      if (data.server?.id) await test(data.server.id);
      setMcpValue("");
      setMcpName("");
      setMcpAuth("");
      await onReload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إضافة MCP");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-[11px] text-muted-foreground">عدد الخوادم في الكتالوج</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{catalog.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-[11px] text-muted-foreground">المتصلة</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{connectedCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-[11px] text-muted-foreground">أدوات مكشوفة للوكيل</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{mcpTools.length}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/80 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">اختروا من الكتالوج</p>
          خوادم جاهزة للسياحة والوكالة — مفتاح أو OAuth أو Cloud API.
        </div>
        <div className="rounded-xl border border-border/80 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">خادم MCP خاص بكم</p>
          أضيفوا عنوان HTTP/SSE أو حزمة npm رسمية.
        </div>
        <div className="rounded-xl border border-border/80 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">GitHub لاستيراد MCP فقط</p>
          نرفض استنساخ المشاريع الكاملة أو المستودعات الخاصة.
        </div>
        <div className="rounded-xl border border-border/80 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">بلا نشر بلا اعتماد</p>
          كانفا وهيجزفيلد يسلّمان الأصل لتيليجرام ثم publish المعتمد.
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative block min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={`${inputClass} ps-9`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث في الكتالوج (كانفا، واتساب، فيديو…)"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["all", "الكل"],
              ["connected", "متصل"],
              ["needs_key", "يحتاج مفتاح"],
              ["verify_failed", "فشل"],
              ["uninstalled", "غير مثبت"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                filter === id ? "bg-amber-500 text-slate-950" : "border border-border text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setFilter("category");
                setCategory(item);
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                filter === "category" && category === item
                  ? "bg-amber-500 text-slate-950"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {visible.map((card) => {
          const server = connected(card.id);
          const state = cardState(card, server, whatsappReady);
          const fields = card.authFields?.length
            ? card.authFields
            : card.envKey
              ? [{ key: card.envKey, labelAr: card.envKey, secret: true, placeholder: card.authHintAr }]
              : [];
          const setupOpen = Boolean(openSetup[card.id]) || state === "needs_key" || state === "verify_failed";
          const busy = testingId === card.id || testingId === server?.id;
          return (
            <div key={card.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{card.nameAr}</p>
                    {card.version ? (
                      <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        v{card.version}
                      </span>
                    ) : null}
                    {card.categoryAr ? (
                      <span className="text-[10px] text-muted-foreground">{card.categoryAr}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.purposeAr}</p>
                </div>
                <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-[11px] ${stateClass(state)}`}>
                  {stateLabel(state)}
                </span>
              </div>
              {card.tools.length ? (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {card.tools.map((tool) => tool.name).join(" · ")}
                </p>
              ) : null}
              {card.legalNoteAr ? (
                <p className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 text-[11px] leading-relaxed text-amber-100/90">
                  {card.legalNoteAr}
                </p>
              ) : null}
              {setupOpen && fields.length ? (
                <div className="mt-3 space-y-2">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className={labelClass}>{field.labelAr}</label>
                      <input
                        type={field.secret ? "password" : "text"}
                        className={inputClass}
                        value={authById[card.id]?.[field.key] || ""}
                        onChange={(e) => setField(card.id, field.key, e.target.value)}
                        placeholder={field.placeholder || "الصقوا القيمة"}
                        autoComplete="off"
                      />
                    </div>
                  ))}
                  {card.authHintAr ? (
                    <p className="text-[11px] text-muted-foreground">{card.authHintAr}</p>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {state === "uninstalled" || state === "needs_key" ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      if (fields.length && !openSetup[card.id] && state === "uninstalled") {
                        setOpenSetup((prev) => ({ ...prev, [card.id]: true }));
                        return;
                      }
                      void connect(card);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-40"
                  >
                    {busy ? <Loader2 className="size-3 animate-spin" /> : fields.length && !server ? <KeyRound className="size-3" /> : <PlugZap className="size-3" />}
                    {server || (fields.length && openSetup[card.id]) || state === "needs_key"
                      ? "ربط وتحقق"
                      : "تثبيت وتهيئة"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void connect(card)}
                    className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-40"
                  >
                    {busy ? <Loader2 className="size-3 animate-spin" /> : <PlugZap className="size-3" />}
                    ربط وتحقق
                  </button>
                )}
                {server ? (
                  confirmDelete === server.id ? (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void remove(server.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <Trash2 className="size-3" />
                        تأكيد الحذف
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border px-3 py-1.5 text-xs"
                        onClick={() => setConfirmDelete("")}
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 px-3 py-1.5 text-xs text-rose-400"
                      onClick={() => setConfirmDelete(server.id)}
                    >
                      <Unplug className="size-3" />
                      قطع الاتصال / حذف
                    </button>
                  )
                ) : null}
              </div>
              {server?.lastError ? <p className="mt-2 text-[11px] text-rose-400">{server.lastError}</p> : null}
            </div>
          );
        })}
      </div>

      {servers.filter((item) => !item.catalogId).length ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">خوادم مستوردة / مخصصة</p>
          {servers
            .filter((item) => !item.catalogId)
            .map((server) => (
              <div key={server.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
                <div>
                  <p className="text-sm font-medium">{server.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {server.lastTestOk ? (
                      <span className="text-emerald-500">
                        <CheckCircle2 className="inline size-3" /> {server.tools.length} أداة
                      </span>
                    ) : (
                      server.lastError || "لم يُختبر"
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button type="button" className="rounded-lg border px-2 py-1 text-[11px]" onClick={() => void test(server.id)}>
                    {testingId === server.id ? <Loader2 className="size-3 animate-spin" /> : "تحقق"}
                  </button>
                  {confirmDelete === server.id ? (
                    <button
                      type="button"
                      className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] text-white"
                      onClick={() => void remove(server.id)}
                    >
                      تأكيد الحذف
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] text-rose-400"
                      onClick={() => setConfirmDelete(server.id)}
                    >
                      <Trash2 className="size-3" />
                      قطع الاتصال / حذف
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : null}

      <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setShowCustom((v) => !v)}>
        {showCustom ? "إخفاء الإضافة المخصصة" : "إضافة مخصص (تلقائي / npm / GitHub)"}
      </button>
      {showCustom ? (
        <div className="rounded-2xl border border-dashed p-4">
          <p className="mb-3 text-[11px] text-muted-foreground">
            GitHub يقبل خادم MCP فقط (mcp.json أو @modelcontextprotocol). ليس لاستنساخ مشروع كامل.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {(["github", "url", "npm", "other"] as const).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setMcpSource(source)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                  mcpSource === source ? "bg-amber-500 text-slate-950" : "border border-border"
                }`}
              >
                {source === "github" ? "GitHub" : source === "url" ? "MCP URL" : source === "npm" ? "npm" : "أمر آخر"}
              </button>
            ))}
          </div>
          <label className={labelClass}>القيمة</label>
          <input className={inputClass} value={mcpValue} onChange={(e) => setMcpValue(e.target.value)} />
          <label className={`${labelClass} mt-3`}>اسم العرض</label>
          <input className={inputClass} value={mcpName} onChange={(e) => setMcpName(e.target.value)} />
          <label className={`${labelClass} mt-3`}>مفتاح (اختياري)</label>
          <input
            type="password"
            className={inputClass}
            value={mcpAuth}
            onChange={(e) => setMcpAuth(e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            disabled={saving || !mcpValue.trim()}
            onClick={() => void addCustom()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            إضافة واختبار
          </button>
        </div>
      ) : null}

      {mcpTools.length ? (
        <p className="text-[11px] text-muted-foreground">
          أدوات جاهزة للوكيل: {mcpTools.map((tool) => tool.name).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
