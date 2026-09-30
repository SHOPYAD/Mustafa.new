"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw, Search, Trash2, Save } from "lucide-react";
import { MONO, UI } from "@/lib/studio/tokens";
import { openStudioWindow } from "@/lib/studio/windows/window-store";
import { CyberButton, Pill } from "../WindowChrome";
import { usePreviewLauncher } from "./AgentWindows";

export interface FieldMeta {
  name: string;
  type: string;
  required: boolean;
  values: string[] | null;
}

type Row = Record<string, unknown>;

const PREFERRED = ["name", "title", "customer_name", "guest_name", "full_name", "email", "phone", "hotel_name", "type", "status", "cancel_status", "change_status", "payment_status", "total_amount", "amount", "refund_amount", "currency", "check_in", "rating", "slug"];

export function onStudioRefresh(handler: (collection: string) => void) {
  const fn = (e: Event) => handler(String((e as CustomEvent).detail?.collection || ""));
  window.addEventListener("studio:refresh", fn);
  return () => window.removeEventListener("studio:refresh", fn);
}

export function emitStudioRefresh(collection: string) {
  window.dispatchEvent(new CustomEvent("studio:refresh", { detail: { collection } }));
}

export function formatCell(v: unknown, type?: string): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "نعم" : "لا";
  if (type === "date" || type === "autodate" || (typeof v === "string" && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(v))) {
    const d = new Date(String(v).replace(" ", "T"));
    if (!Number.isNaN(d.getTime())) return d.toLocaleString("ar", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }
  if (typeof v === "object") {
    const s = JSON.stringify(v);
    return s.length > 60 ? `${s.slice(0, 57)}…` : s;
  }
  const s = String(v);
  return s.length > 64 ? `${s.slice(0, 61)}…` : s;
}

const STATUS_TONE: Record<string, string> = {
  paid: UI.ok, resolved: UI.ok, approved: UI.ok, done: UI.ok, confirmed: UI.ok,
  pending_payment: UI.warn, pending: UI.warn, pending_admin: UI.warn, new: UI.accent, "in-progress": UI.warn,
  cancelled: UI.danger, rejected: UI.danger, refund_failed: UI.danger, hidden: UI.textFaint,
};

export function StatusPill({ value }: { value: unknown }) {
  const s = String(value ?? "");
  if (!s) return <span style={{ color: UI.textFaint }}>—</span>;
  return <Pill tone={STATUS_TONE[s] ?? UI.textDim}>{s}</Pill>;
}

export function useSchema(collection: string) {
  const [fields, setFields] = useState<FieldMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/studio/schema?collection=${encodeURIComponent(collection)}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.ok) setFields(j.fields);
        else setError(j.error || "schema_failed");
      })
      .catch(() => alive && setError("network"));
    return () => {
      alive = false;
    };
  }, [collection]);
  return { fields, error };
}

export function TableWindow({ collection, status: initialStatus, title, initialQuery }: { collection: string; status?: string; title?: string; initialQuery?: string }) {
  const { fields, error: schemaError } = useSchema(collection);
  const [q, setQ] = useState(initialQuery ?? "");
  const [debounced, setDebounced] = useState(initialQuery ?? "");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-updated");
  const [status, setStatus] = useState(initialStatus ?? "");
  const [data, setData] = useState<{ items: Row[]; totalItems: number; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => setPage(1), [debounced, status]);
  useEffect(() => onStudioRefresh((c) => (c === collection || !c) && setTick((x) => x + 1)), [collection]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const sp = new URLSearchParams({ collection, page: String(page), perPage: "14", sort });
    if (debounced) sp.set("q", debounced);
    if (status) sp.set("status", status);
    fetch(`/api/admin/studio/records?${sp}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.ok) {
          setData(j);
          setError(null);
        } else if (j.error === "invalid_sort") setSort("-created");
        else setError(j.error || "records_failed");
      })
      .catch(() => alive && setError("network"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [collection, page, sort, debounced, status, tick]);

  const columns = useMemo(() => {
    if (!fields) return [] as FieldMeta[];
    const usable = fields.filter((f) => !["json", "file", "editor", "password"].includes(f.type));
    const picked = PREFERRED.map((n) => usable.find((f) => f.name === n)).filter((f): f is FieldMeta => !!f);
    for (const f of usable) if (picked.length < 6 && !picked.includes(f)) picked.push(f);
    return picked.slice(0, 6);
  }, [fields]);
  const statusField = fields?.find((f) => f.name === "status" && f.values);

  const err = schemaError || error;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, border: `1px solid ${UI.borderSoft}`, background: "rgba(2,10,18,0.7)" }}>
          <Search size={15} color={UI.textDim} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`بحث في ${title ?? collection}...`} style={{ flex: 1, background: "transparent", border: 0, outline: "none", color: UI.text, fontSize: 14 }} />
        </label>
        {statusField ? (
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle} aria-label="تصفية الحالة">
            <option value="">كل الحالات</option>
            {statusField.values!.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        ) : null}
        <CyberButton onClick={() => setTick((x) => x + 1)} title="تحديث"><RefreshCw size={14} /></CyberButton>
        <Pill tone={UI.textDim}><span style={{ fontFamily: MONO }}>{collection}</span></Pill>
      </div>
      {err ? <div style={{ color: UI.danger, fontSize: 14 }}>تعذر التحميل: {err}</div> : null}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", border: `1px solid ${UI.borderSoft}`, borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort.replace("-", "") === c.name;
                return (
                  <th key={c.name} onClick={() => setSort(active && !sort.startsWith("-") ? `-${c.name}` : c.name)} style={{ position: "sticky", top: 0, background: UI.panelSolid, color: active ? UI.accent : UI.textDim, fontWeight: 600, textAlign: "right", padding: "8px 10px", borderBottom: `1px solid ${UI.borderSoft}`, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {c.name}{active ? (sort.startsWith("-") ? " ↓" : " ↑") : ""}
                  </th>
                );
              })}
              <th style={{ position: "sticky", top: 0, background: UI.panelSolid, color: UI.textDim, textAlign: "right", padding: "8px 10px", borderBottom: `1px solid ${UI.borderSoft}`, whiteSpace: "nowrap" }}>آخر تحديث</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((row) => (
              <tr
                key={String(row.id)}
                tabIndex={0}
                onClick={() => openStudioWindow("record", `record:${collection}:${row.id}`, `${title ?? collection} · ${row.id}`, { collection, id: row.id }, { w: 620, h: 560 })}
                onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLElement).click()}
                style={{ cursor: "pointer", borderBottom: `1px solid rgba(64,214,245,0.08)` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(64,214,245,0.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {columns.map((c) => (
                  <td key={c.name} style={{ padding: "7px 10px", whiteSpace: "nowrap", color: UI.text }}>
                    {/status$/.test(c.name) ? <StatusPill value={row[c.name]} /> : formatCell(row[c.name], c.type)}
                  </td>
                ))}
                <td style={{ padding: "7px 10px", whiteSpace: "nowrap", color: UI.textDim }}>{formatCell(row.updated ?? row.created, "date")}</td>
              </tr>
            ))}
            {data && data.items.length === 0 ? (
              <tr><td colSpan={columns.length + 1} style={{ padding: 18, textAlign: "center", color: UI.textDim }}>لا توجد سجلات مطابقة</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5, color: UI.textDim }}>
        <span>{loading ? "جارٍ التحميل…" : data ? `${data.totalItems} سجل · صفحة ${page} من ${Math.max(1, data.totalPages)}` : "—"}</span>
        <span style={{ display: "flex", gap: 6 }}>
          <CyberButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronRight size={14} /> السابق</CyberButton>
          <CyberButton disabled={!data || page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>التالي <ChevronLeft size={14} /></CyberButton>
        </span>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = { padding: "6px 8px", borderRadius: 8, border: `1px solid ${UI.borderSoft}`, background: "rgba(2,10,18,0.9)", color: UI.text, fontSize: 13.5 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "6px 9px", borderRadius: 8, border: `1px solid ${UI.borderSoft}`, background: "rgba(2,10,18,0.8)", color: UI.text, fontSize: 14, outline: "none" };

/** مخطط zod مولد من حقول PocketBase مع رسائل عربية. */
export function zodForFields(fields: FieldMeta[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let s: z.ZodTypeAny;
    switch (f.type) {
      case "number":
        s = z.coerce.number({ invalid_type_error: "رقم غير صالح" });
        break;
      case "bool":
        s = z.boolean();
        break;
      case "email":
        s = z.string().email("بريد غير صالح").or(z.literal(""));
        break;
      case "url":
        s = z.string().url("رابط غير صالح").or(z.literal(""));
        break;
      case "select":
        s = f.values?.length ? z.enum(f.values as [string, ...string[]], { errorMap: () => ({ message: "قيمة غير مسموحة" }) }).or(z.literal("")) : z.string();
        break;
      case "json":
        s = z.unknown();
        break;
      default:
        s = z.string();
    }
    if (f.required && f.type !== "bool") s = s.refine((v) => v !== "" && v !== null && v !== undefined, "حقل مطلوب");
    shape[f.name] = s;
  }
  return z.object(shape).partial();
}

const READONLY_TYPES = new Set(["relation", "file", "autodate"]);

export function RecordWindow({ collection, id }: { collection: string; id: string }) {
  const { fields } = useSchema(collection);
  const [record, setRecord] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const launch = usePreviewLauncher();

  const load = useCallback(() => {
    fetch(`/api/admin/studio/records?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setRecord(j.item);
          setDraft({});
        } else setLoadError(j.error || "load_failed");
      })
      .catch(() => setLoadError("network"));
  }, [collection, id]);
  useEffect(load, [load]);
  useEffect(() => onStudioRefresh((c) => c === collection && load()), [collection, load]);

  const editable = (fields ?? []).filter((f) => !READONLY_TYPES.has(f.type) && f.name !== "id");
  const readonly = (fields ?? []).filter((f) => READONLY_TYPES.has(f.type));
  const changed = Object.keys(draft).filter((k) => JSON.stringify(draft[k]) !== JSON.stringify(record?.[k]));

  const submit = () => {
    if (!fields || !record) return;
    const patch = Object.fromEntries(changed.map((k) => [k, draft[k]]));
    const res = zodForFields(fields).safeParse(patch);
    if (!res.success) {
      setErrors(Object.fromEntries(res.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    launch("records.update", { collection, id, patch: res.data, expectedUpdated: String(record.updated ?? "") }, `record:${collection}:${id}`);
  };

  if (loadError) return <div style={{ color: UI.danger }}>تعذر تحميل السجل: {loadError}</div>;
  if (!record || !fields) return <div style={{ color: UI.textDim }}>جارٍ التحميل…</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Pill tone={UI.textDim}><span style={{ fontFamily: MONO }}>{collection}/{String(record.id)}</span></Pill>
        <Pill tone={UI.textDim}>آخر تحديث {formatCell(record.updated, "date")}</Pill>
        <span style={{ flex: 1 }} />
        <DomainActions collection={collection} record={record} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 34%) 1fr", gap: "8px 12px", alignItems: "center" }}>
        {editable.map((f) => {
          const value = f.name in draft ? draft[f.name] : record[f.name];
          const set = (v: unknown) => setDraft((d) => ({ ...d, [f.name]: v }));
          return (
            <React.Fragment key={f.name}>
              <label style={{ color: changed.includes(f.name) ? UI.warn : UI.textDim, fontSize: 13.5 }}>{f.name}{f.required ? " *" : ""}</label>
              <div>
                {f.type === "bool" ? (
                  <input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} />
                ) : f.type === "select" && f.values ? (
                  <select value={String(value ?? "")} onChange={(e) => set(e.target.value)} style={{ ...selectStyle, width: "100%" }}>
                    <option value="">—</option>
                    {f.values.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : f.type === "json" ? (
                  <textarea
                    defaultValue={value == null ? "" : JSON.stringify(value, null, 1)}
                    onBlur={(e) => {
                      try {
                        set(e.target.value ? JSON.parse(e.target.value) : null);
                        setErrors((x) => ({ ...x, [f.name]: "" }));
                      } catch {
                        setErrors((x) => ({ ...x, [f.name]: "JSON غير صالح" }));
                      }
                    }}
                    rows={3}
                    style={{ ...inputStyle, fontFamily: MONO, fontSize: 12.5 }}
                  />
                ) : f.type === "editor" ? (
                  <textarea value={String(value ?? "")} onChange={(e) => set(e.target.value)} rows={4} style={inputStyle} />
                ) : (
                  <input
                    type={f.type === "number" ? "number" : f.type === "date" ? "text" : "text"}
                    value={String(value ?? "")}
                    onChange={(e) => set(f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
                    style={inputStyle}
                  />
                )}
                {errors[f.name] ? <div style={{ color: UI.danger, fontSize: 12.5, marginTop: 2 }}>{errors[f.name]}</div> : null}
              </div>
            </React.Fragment>
          );
        })}
        {readonly.map((f) => (
          <React.Fragment key={f.name}>
            <label style={{ color: UI.textFaint, fontSize: 13.5 }}>{f.name}</label>
            <div style={{ color: UI.textDim, fontSize: 13.5 }}>{formatCell(record[f.name], f.type)}</div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-start", position: "sticky", bottom: -12, background: UI.panelSolid, padding: "10px 0" }}>
        <CyberButton disabled={!changed.length} onClick={submit}><Save size={14} /> معاينة الحفظ ({changed.length})</CyberButton>
        <CyberButton tone={UI.danger} onClick={() => launch("records.delete", { collection, id, expectedUpdated: String(record.updated ?? "") }, `record:${collection}:${id}`)}><Trash2 size={14} /> حذف</CyberButton>
      </div>
    </div>
  );
}

/** إجراءات القسم الحقيقية على السجل (تمر عبر القدرات). */
function DomainActions({ collection, record }: { collection: string; record: Row }) {
  const launch = usePreviewLauncher();
  const key = `record:${collection}:${record.id}`;
  if (collection === "hotel_bookings") {
    const cs = String(record.cancel_status ?? "");
    const pending = cs === "pending_admin" || cs === "refund_failed";
    const change = String(record.change_status ?? "") === "pending_admin";
    return (
      <span style={{ display: "flex", gap: 6 }}>
        {pending ? <CyberButton tone={UI.warn} onClick={() => launch("bookings.cancellation.approve", { bookingId: record.id, feeAmount: Number(record.cancel_fee_amount || 0), note: "" }, key)}>اعتماد الإلغاء</CyberButton> : null}
        {pending ? <CyberButton tone={UI.danger} onClick={() => launch("bookings.cancellation.reject", { bookingId: record.id, note: "مرفوض بعد المراجعة" }, key)}>رفض الإلغاء</CyberButton> : null}
        {change ? <CyberButton onClick={() => launch("bookings.change.resolve", { bookingId: record.id, action: "done", note: "" }, key)}>إتمام التعديل</CyberButton> : null}
        {change ? <CyberButton tone={UI.danger} onClick={() => launch("bookings.change.resolve", { bookingId: record.id, action: "reject", note: "" }, key)}>رفض التعديل</CyberButton> : null}
      </span>
    );
  }
  if (collection === "enquiry_bookings") {
    return (
      <span style={{ display: "flex", gap: 6 }}>
        {(["new", "in-progress", "resolved"] as const).filter((s) => s !== record.status).map((s) => (
          <CyberButton key={s} onClick={() => launch("bookings.enquiry.set_status", { id: record.id, status: s, expectedUpdated: String(record.updated ?? "") }, key)}>← {s}</CyberButton>
        ))}
      </span>
    );
  }
  if (collection === "customer_reviews") {
    return (
      <span style={{ display: "flex", gap: 6 }}>
        {record.status !== "approved" ? <CyberButton tone={UI.ok} onClick={() => launch("reviews.moderate", { reviewId: record.id, action: "approve" }, key)}>نشر</CyberButton> : null}
        {record.status !== "hidden" ? <CyberButton tone={UI.warn} onClick={() => launch("reviews.moderate", { reviewId: record.id, action: "hide" }, key)}>إخفاء</CyberButton> : null}
      </span>
    );
  }
  return null;
}

/** صفوف هذه المسارات سجلات حقيقية في مجموعة؛ النقر يفتح السجل وإجراءاته. */
const ROUTE_ROW_COLLECTION: Record<string, string> = { "/api/admin/cancellations": "hotel_bookings" };

export function RouteWindow({ route }: { route: string }) {
  const launch = usePreviewLauncher();
  const [data, setData] = useState<unknown>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [params, setParams] = useState("");
  const [mode, setMode] = useState<"read" | "action">("read");
  const [method, setMethod] = useState<"POST" | "PUT" | "PATCH" | "DELETE">("POST");
  const [body, setBody] = useState("{\n}");
  const [bodyError, setBodyError] = useState<string | null>(null);
  const url = params.trim() ? `${route}?${params.trim().replace(/^\?/, "")}` : route;
  useEffect(() => onStudioRefresh(() => setTick((x) => x + 1)), []);
  useEffect(() => {
    if (mode !== "read") return;
    let alive = true;
    setError(null);
    fetch(url)
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!alive) return;
        setStatus(r.status);
        if (r.status === 405) {
          setMode("action");
          return;
        }
        if (!r.ok) setError((j as { error?: string })?.error ?? `http_${r.status}`);
        else setData(j);
      })
      .catch(() => alive && setError("network"));
    return () => {
      alive = false;
    };
  }, [url, tick, mode]);

  const submit = () => {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = body.trim() ? JSON.parse(body) : {};
      setBodyError(null);
    } catch {
      setBodyError("JSON غير صالح");
      return;
    }
    launch("admin.route.call", { route: url, method, body: parsed }, `route:${route}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Pill tone={UI.textDim}><span style={{ fontFamily: MONO }}>{route}</span></Pill>
        <span style={{ display: "inline-flex", border: `1px solid ${UI.borderSoft}`, borderRadius: 8, overflow: "hidden" }}>
          {(["read", "action"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} style={{ padding: "4px 12px", border: 0, background: mode === m ? "rgba(64,214,245,0.18)" : "transparent", color: mode === m ? UI.accent : UI.textDim, cursor: "pointer", fontSize: 13 }}>
              {m === "read" ? "قراءة" : "إجراء"}
            </button>
          ))}
        </span>
        {mode === "read" ? <CyberButton onClick={() => setTick((x) => x + 1)}><RefreshCw size={14} /></CyberButton> : null}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: UI.textDim, whiteSpace: "nowrap" }}>معاملات</span>
        <input value={params} onChange={(e) => setParams(e.target.value)} placeholder="مثال: query=istanbul&page=1" dir="ltr" style={{ ...inputStyle, fontFamily: MONO, fontSize: 13 }} />
      </label>
      {mode === "read" ? (
        error ? (
          <div style={{ color: status === 400 ? UI.warn : UI.danger, fontSize: 14 }}>
            {status === 400 ? `المسار يحتاج معاملات: ${error}` : `تعذر القراءة (${status ?? "—"}): ${error}`}
          </div>
        ) : data === null ? (
          <div style={{ color: UI.textDim }}>جارٍ القراءة…</div>
        ) : (
          <JsonView value={data} depth={0} rowCollection={ROUTE_ROW_COLLECTION[route]} />
        )
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {status === 405 ? <div style={{ color: UI.textDim, fontSize: 13 }}>هذا المسار إجراء في لوحة الإدارة. يُنفذ بعد المعاينة والاعتماد وبنفس منطق اللوحة العادية.</div> : null}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} style={selectStyle} aria-label="الطريقة">
              {(["POST", "PUT", "PATCH", "DELETE"] as const).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <span style={{ fontSize: 13, color: UI.textDim }}>جسم الطلب (JSON)</span>
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} dir="ltr" style={{ ...inputStyle, fontFamily: MONO, fontSize: 12.5 }} />
          {bodyError ? <div style={{ color: UI.danger, fontSize: 12.5 }}>{bodyError}</div> : null}
          <div><CyberButton tone={method === "DELETE" ? UI.danger : UI.accent} onClick={submit}>معاينة التنفيذ</CyberButton></div>
        </div>
      )}
    </div>
  );
}

function JsonView({ value, depth, rowCollection }: { value: unknown; depth: number; rowCollection?: string }) {
  if (Array.isArray(value)) {
    const objs = value.filter((v) => v && typeof v === "object" && !Array.isArray(v)) as Row[];
    if (objs.length === value.length && objs.length > 0) {
      const flat = Object.keys(objs[0]).filter((k) => typeof objs[0][k] !== "object" && !/pass|token|secret|key/i.test(k));
      const cols = [...PREFERRED.filter((k) => flat.includes(k)), ...flat.filter((k) => !PREFERRED.includes(k))].slice(0, 6);
      return (
        <div style={{ overflow: "auto", border: `1px solid ${UI.borderSoft}`, borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>{cols.map((c) => <th key={c} style={{ textAlign: "right", padding: "6px 8px", color: UI.textDim, borderBottom: `1px solid ${UI.borderSoft}` }}>{c}</th>)}</tr></thead>
            <tbody>
              {objs.slice(0, 50).map((o, i) => (
                <tr
                  key={i}
                  onClick={rowCollection && o.id ? () => openStudioWindow("record", `record:${rowCollection}:${o.id}`, `${rowCollection} · ${o.id}`, { collection: rowCollection, id: o.id }, { w: 620, h: 560 }) : undefined}
                  style={{ cursor: rowCollection ? "pointer" : "default" }}
                >
                  {cols.map((c) => <td key={c} style={{ padding: "5px 8px", whiteSpace: "nowrap" }}>{/status/.test(c) ? <StatusPill value={o[c]} /> : formatCell(o[c])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <span style={{ color: UI.textDim }}>[{value.length}] {formatCell(value)}</span>;
  }
  if (value && typeof value === "object") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", fontSize: 13.5, paddingInlineStart: depth ? 10 : 0 }}>
        {Object.entries(value as Row).filter(([k]) => !/pass|token|secret|key/i.test(k)).map(([k, v]) => (
          <React.Fragment key={k}>
            <span style={{ color: UI.textDim }}>{k}</span>
            {v && typeof v === "object" && depth < 2 ? <JsonView value={v} depth={depth + 1} rowCollection={rowCollection} /> : <span>{formatCell(v)}</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }
  return <span>{formatCell(value)}</span>;
}

export function PageWindow({ href }: { href: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Pill tone={UI.textDim}><span style={{ fontFamily: MONO }}>{href}</span></Pill>
        <a href={`${href}${href.includes("?") ? "&" : "?"}studio=1`} target="_blank" rel="noreferrer" style={{ color: UI.accent, fontSize: 13, display: "inline-flex", gap: 4, alignItems: "center" }}><ExternalLink size={13} /> فتح منفصل</a>
      </div>
      <iframe title={href} src={`${href}${href.includes("?") ? "&" : "?"}studio=1`} style={{ flex: 1, width: "100%", border: `1px solid ${UI.borderSoft}`, borderRadius: 8, background: "#01050b" }} />
    </div>
  );
}
