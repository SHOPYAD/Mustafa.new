"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  PlugZap,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Unplug,
  X,
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
  "w-full min-w-0 px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-admin-accent transition-colors";
const labelClass = "block text-xs font-semibold text-foreground/80 mb-1.5";

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
      return "border-border dark:border-admin-btn-primary-hover bg-admin-bg-subtle dark:bg-primary/50 text-admin-btn-primary-bg dark:text-primary font-bold";
    case "verify_failed":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 font-bold";
    case "needs_key":
      return "border-admin-btn-secondary-border/30 bg-secondary/10 text-admin-btn-secondary-hover dark:text-secondary font-bold";
    case "uninstalled":
      return "border-border text-muted-foreground font-medium";
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

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Aggressive browser email autofill protection: strip any email address prefilled by password managers
  useEffect(() => {
    const clearAutofill = () => {
      setQuery((current) => {
        const trimmed = (current || "").trim();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "";
        return current;
      });
    };
    clearAutofill();
    const t1 = window.setTimeout(clearAutofill, 50);
    const t2 = window.setTimeout(clearAutofill, 200);
    const t3 = window.setTimeout(clearAutofill, 600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setSaving(false);
    }
  };

  const addCustom = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await jsonFetch<{ ok?: boolean; error?: string }>("/api/admin/mcp/custom", {
        method: "POST",
        body: JSON.stringify({
          source: mcpSource,
          value: mcpValue.trim(),
          name: mcpName.trim() || undefined,
          auth: mcpAuth.trim() || undefined,
        }),
      });
      if (!data.ok && data.error) throw new Error(data.error);
      setShowCustom(false);
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

  const handleResetSearch = () => {
    setQuery("");
    setFilter("all");
    setCategory("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden dummy inputs to trick browser password managers */}
      <div style={{ display: "none" }} aria-hidden="true">
        <input type="text" name="fake_username_remember" tabIndex={-1} autoComplete="username" />
        <input type="password" name="fake_password_remember" tabIndex={-1} autoComplete="current-password" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground">عدد الخوادم في الكتالوج</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{catalog.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground">المتصلة والجاهزة</p>
          <p className="mt-1 text-2xl font-bold text-admin-btn-primary-bg dark:text-primary tabular-nums">{connectedCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground">أدوات مكشوفة لوكيل الذكاء الاصطناعي</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{mcpTools.length}</p>
        </div>
      </div>

      {/* Dedicated Full-Width Search Bar */}
      <div className="relative w-full">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchInputRef}
          type="text"
          name="mcp_catalog_filter_search_field"
          id="mcp_catalog_filter_search_field"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore="true"
          data-lpignore="true"
          data-form-type="other"
          className={`${inputClass} ps-10 pe-10 h-11 text-sm rounded-xl shadow-xs`}
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            // Guard against email autofill
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
              setQuery("");
            } else {
              setQuery(val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              handleResetSearch();
            }
          }}
          placeholder="بحث في الكتالوج (كانفا، واتساب، فيديو، خرائط، كاب كت، متصفح…)"
        />
        {query ? (
          <button
            type="button"
            aria-label="مسح البحث"
            onClick={handleResetSearch}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Independent Horizontal Sliding Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none no-scrollbar -mx-1 px-1">
        <div className="flex items-center gap-1.5 shrink-0">
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
              className={`shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                filter === id
                  ? "bg-gradient-to-r from-admin-btn-primary-bg via-[#3b0764] to-admin-btn-primary-hover text-secondary shadow-sm ring-1 ring-admin-accent/40"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border shrink-0 my-auto" />

        <div className="flex items-center gap-1.5 shrink-0">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setFilter("category");
                setCategory(item);
              }}
              className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                filter === "category" && category === item
                  ? "bg-gradient-to-r from-admin-btn-primary-bg via-[#3b0764] to-admin-btn-primary-hover text-secondary shadow-sm ring-1 ring-admin-accent/40"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {(query || filter !== "all") && (
          <button
            type="button"
            onClick={handleResetSearch}
            className="shrink-0 inline-flex items-center gap-1 whitespace-nowrap rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <RotateCcw className="size-3.5" />
            إعادة ضبط
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-muted-foreground">لا بطاقات مطابقة للبحث أو التصفية.</p>
          <button
            type="button"
            className='mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-admin-btn-primary-bg to-admin-btn-primary-hover px-4 py-2 text-xs font-extrabold text-secondary hover:text-muted-foreground transition-colors shadow-sm'
            onClick={handleResetSearch}
          >
            <RotateCcw className="size-3.5" />
            إظهار كل الكتالوج ({catalog.length})
          </button>
        </div>
      ) : null}

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
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
            <div key={card.id} className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:border-border/80">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-foreground">{card.nameAr}</p>
                      {card.version ? (
                        <span className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                          v{card.version}
                        </span>
                      ) : null}
                      {card.categoryAr ? (
                        <span className='rounded-full bg-admin-bg-subtle dark:bg-primary/40 px-2 py-0.5 text-[10px] font-semibold text-admin-btn-primary-bg dark:text-primary border border-border/80 dark:border-admin-btn-primary-hover'>
                          {card.categoryAr}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.purposeAr}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] ${stateClass(state)}`}>
                    {stateLabel(state)}
                  </span>
                </div>

                {card.tools.length ? (
                  <p className="mt-2.5 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground/70">الأدوات:</span> {card.tools.map((tool) => tool.name).join(" · ")}
                  </p>
                ) : null}

                {card.legalNoteAr ? (
                  <p className='mt-2.5 rounded-xl border border-border/20 bg-secondary/5 p-2.5 text-[11px] leading-relaxed text-admin-btn-secondary-hover dark:text-muted-foreground'>
                    {card.legalNoteAr}
                  </p>
                ) : null}

                {setupOpen && fields.length ? (
                  <div className="mt-3.5 space-y-2 rounded-2xl border border-border/70 bg-muted/30 p-3.5">
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
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3.5">
                <div className="flex flex-wrap gap-2">
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
                      className='inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-admin-btn-primary-bg via-[#3b0764] to-admin-btn-primary-hover px-3.5 py-2 text-xs font-bold text-secondary hover:text-muted-foreground disabled:opacity-40 transition-colors shadow-sm'
                    >
                      {busy ? <Loader2 className='size-3.5 animate-spin text-secondary' /> : fields.length && !server ? <KeyRound className='size-3.5 text-secondary' /> : <PlugZap className='size-3.5 text-secondary' />}
                      {server || (fields.length && openSetup[card.id]) || state === "needs_key"
                        ? "ربط وتحقق"
                        : "تثبيت وتهيئة"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void connect(card)}
                      className='inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-admin-btn-primary-bg via-[#3b0764] to-admin-btn-primary-hover px-3.5 py-2 text-xs font-bold text-secondary hover:text-muted-foreground disabled:opacity-40 transition-colors shadow-sm'
                    >
                      {busy ? <Loader2 className='size-3.5 animate-spin text-secondary' /> : <PlugZap className='size-3.5 text-secondary' />}
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
                          className='inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-foreground hover:bg-rose-500'
                        >
                          <Trash2 className="size-3.5" />
                          تأكيد الحذف
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                          onClick={() => setConfirmDelete("")}
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 transition-colors"
                        onClick={() => setConfirmDelete(server.id)}
                      >
                        <Unplug className="size-3.5" />
                        قطع الاتصال
                      </button>
                    )
                  ) : null}
                </div>
              </div>
              {server?.lastError ? <p className="mt-2 text-[11px] font-semibold text-rose-500">{server.lastError}</p> : null}
            </div>
          );
        })}
      </div>

      {servers.filter((item) => !item.catalogId).length ? (
        <div className="space-y-3 pt-4">
          <p className="text-xs font-bold text-foreground">خوادم مخصصة ومستوردة</p>
          {servers
            .filter((item) => !item.catalogId)
            .map((server) => (
              <div key={server.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-foreground">{server.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {server.lastTestOk ? (
                      <span className="text-admin-btn-primary-bg dark:text-primary font-bold">
                        <CheckCircle2 className='inline size-3.5 me-1 text-primary dark:text-secondary' /> {server.tools.length} أداة نشطة
                      </span>
                    ) : (
                      server.lastError || "لم يُختبر"
                    )}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted" onClick={() => void test(server.id)}>
                    {testingId === server.id ? <Loader2 className="size-3.5 animate-spin" /> : "تحقق"}
                  </button>
                  {confirmDelete === server.id ? (
                    <button
                      type="button"
                      className='rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-rose-500'
                      onClick={() => void remove(server.id)}
                    >
                      تأكيد الحذف
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20"
                      onClick={() => setConfirmDelete(server.id)}
                    >
                      <Trash2 className="size-3.5" />
                      قطع الاتصال
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="button"
          className='text-xs font-bold text-primary hover:text-admin-btn-primary-bg dark:text-primary underline'
          onClick={() => setShowCustom((v) => !v)}
        >
          {showCustom ? "إخفاء إضافة خادم مخصص" : "إضافة خادم MCP مخصص (HTTP / SSE / npm / GitHub)"}
        </button>
      </div>

      {showCustom ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-5 shadow-sm">
          <p className="mb-3 text-xs text-muted-foreground">
            إضافة خادم MCP خارجي عبر GitHub (ملف mcp.json) أو رابط HTTP/SSE أو حزمة npm رسمية.
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["github", "url", "npm", "other"] as const).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setMcpSource(source)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  mcpSource === source
                    ? "bg-gradient-to-r from-admin-btn-primary-bg via-[#3b0764] to-admin-btn-primary-hover text-secondary shadow-sm ring-1 ring-admin-accent/40"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {source === "github" ? "GitHub" : source === "url" ? "MCP URL" : source === "npm" ? "npm" : "أمر مخصص"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>عنوان أو مسار الخادم</label>
              <input className={inputClass} value={mcpValue} onChange={(e) => setMcpValue(e.target.value)} placeholder="مثال: https://mcp.example.com/sse" />
            </div>
            <div>
              <label className={labelClass}>اسم العرض</label>
              <input className={inputClass} value={mcpName} onChange={(e) => setMcpName(e.target.value)} placeholder="مثال: My Custom Tool" />
            </div>
            <div>
              <label className={labelClass}>مفتاح الترخيص أو التوثيق (اختياري)</label>
              <input
                type="password"
                className={inputClass}
                value={mcpAuth}
                onChange={(e) => setMcpAuth(e.target.value)}
                autoComplete="off"
                placeholder="Bearer token أو API key"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={saving || !mcpValue.trim()}
            onClick={() => void addCustom()}
            className='mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-admin-btn-primary-bg via-[#3b0764] to-admin-btn-primary-hover px-4 py-2.5 text-xs font-bold text-secondary hover:text-muted-foreground disabled:opacity-40 transition-colors shadow-sm'
          >
            {saving ? <Loader2 size={14} className='animate-spin text-secondary' /> : <Plus size={14} className='text-secondary' />}
            إضافة واختبار الاتصال
          </button>
        </div>
      ) : null}
    </div>
  );
}
