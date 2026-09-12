"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Loader2,
  Luggage,
  MessageSquare,
  Plus,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import {
  extraIconLabel,
  extraServiceLabel,
  flightExtrasAdminCopy,
} from "@/components/admin/flight-extras-copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  AGENCY_EXTRA_KINDS,
  type AgencyExtraKind,
  AGENCY_EXTRA_ICONS,
  AGENCY_EXTRA_SERVICES,
  type AgencyExtraIcon,
  type AgencyExtraInput,
  type AgencyExtraPackage,
  type AgencyExtraPriceType,
  type AgencyExtraService,
} from "@/types/agency-extra";

const inputClass =
  "w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm";

function ExtraGlyph({ icon }: { icon: AgencyExtraIcon }) {
  const cls = "text-amber-400";
  switch (icon) {
    case "refund":
      return <BadgeCheck size={16} className={cls} />;
    case "bag":
      return <Luggage size={16} className={cls} />;
    case "insurance":
      return <Shield size={16} className={cls} />;
    case "priority":
      return <Sparkles size={16} className={cls} />;
    case "sms":
      return <MessageSquare size={16} className={cls} />;
    case "calendar":
      return <CalendarDays size={16} className={cls} />;
    case "shield":
      return <Shield size={16} className={cls} />;
    case "star":
      return <Star size={16} className={cls} />;
    default: {
      const _exhaustive: never = icon;
      return _exhaustive;
    }
  }
}

function emptyDraft(): AgencyExtraInput {
  return {
    titleAr: "",
    titleEn: "",
    titleTr: "",
    descAr: "",
    descEn: "",
    descTr: "",
    priceType: "fixed",
    priceValue: 0,
    serviceTypes: ["flights"],
    isActive: true,
    sort: 100,
    icon: "star",
    kind: "other",
    termsAr: "",
    termsEn: "",
    termsTr: "",
  };
}

const KIND_LABELS: Record<string, { ar: string; en: string; tr: string }> = {
  refund_guarantee: { ar: "ضمان استرداد (إلغاء عبر لوناليزا)", en: "Refund guarantee (cancel via Lonaliza)", tr: "İade garantisi" },
  flex_change: { ar: "تاريخ مرن (تغيير ينفّذه فريق لوناليزا)", en: "Flexible date (change executed by Lonaliza)", tr: "Esnek tarih" },
  insurance: { ar: "تأمين سفر", en: "Travel insurance", tr: "Seyahat sigortası" },
  extra_bag: { ar: "حقيبة إضافية (تنفيذ يدوي لدى الناقل)", en: "Extra bag (manual at carrier)", tr: "Ek bagaj" },
  priority: { ar: "أولوية صعود (تنفيذ يدوي)", en: "Priority boarding (manual)", tr: "Öncelikli biniş" },
  sms: { ar: "تذكرة عبر الرسائل", en: "SMS e-ticket", tr: "SMS e-bilet" },
  other: { ar: "أخرى", en: "Other", tr: "Diğer" },
};

export default function FlightExtrasPanel() {
  const { locale } = useLocale();
  const copy = flightExtrasAdminCopy(locale);
  const [extras, setExtras] = useState<AgencyExtraPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<AgencyExtraInput>(emptyDraft);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/flight-extras", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; extras?: AgencyExtraPackage[] };
      if (data.ok && Array.isArray(data.extras)) setExtras(data.extras);
      else setMessage(copy.loadFailed);
    } catch {
      setMessage(copy.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [copy.loadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setDraft(emptyDraft());
    setEditingId("new");
    setMessage("");
  };

  const openEdit = (pkg: AgencyExtraPackage) => {
    setDraft({ ...pkg });
    setEditingId(pkg.id);
    setMessage("");
  };

  const toggleService = (service: AgencyExtraService) => {
    const current = draft.serviceTypes || ["flights"];
    const next = current.includes(service)
      ? current.filter((item) => item !== service)
      : [...current, service];
    setDraft({ ...draft, serviceTypes: next.length ? next : ["flights"] });
  };

  const saveDraft = async () => {
    setSaving(true);
    setMessage("");
    try {
      const isNew = editingId === "new";
      const res = await fetch("/api/admin/flight-extras", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? draft : { ...draft, id: editingId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setMessage(data.error || copy.saveFailed);
        return;
      }
      setEditingId(null);
      await load();
    } catch {
      setMessage(copy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pkg: AgencyExtraPackage) => {
    await fetch("/api/admin/flight-extras", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pkg, isActive: !pkg.isActive }),
    });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/flight-extras?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  };

  const reset = async () => {
    if (!window.confirm(copy.resetConfirm)) return;
    await fetch("/api/admin/flight-extras", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    setEditingId(null);
    await load();
  };

  const priceLabel = (pkg: AgencyExtraPackage) =>
    pkg.priceType === "percent" ? `${pkg.priceValue}%` : `USD ${pkg.priceValue}`;

  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-slate-900/80 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{copy.title}</h2>
          <p className="mt-1 text-sm text-white/45">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <RotateCcw size={14} />
            {copy.reset}
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-white"
          >
            <Plus size={16} />
            {copy.add}
          </button>
        </div>
      </div>

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-white/50">
          <Loader2 size={16} className="animate-spin" />
        </div>
      ) : extras.length === 0 ? (
        <p className="py-8 text-center text-white/35">{copy.empty}</p>
      ) : (
        <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5">
          {extras.map((pkg) => (
            <div
              key={pkg.id}
              className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center ${
                pkg.isActive ? "" : "opacity-50"
              }`}
            >
              <div className="md:col-span-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <ExtraGlyph icon={pkg.icon} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{pkg.titleAr || pkg.titleEn}</p>
                  <p className="truncate text-xs text-white/40">{pkg.titleEn}</p>
                </div>
              </div>
              <div className="md:col-span-2 text-sm font-semibold text-amber-300">{priceLabel(pkg)}</div>
              <div className="md:col-span-2 flex flex-wrap gap-1">
                {pkg.serviceTypes.map((service) => (
                  <span key={service} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/50">
                    {extraServiceLabel(service, locale)}
                  </span>
                ))}
              </div>
              <div className="md:col-span-3 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void toggleActive(pkg)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    pkg.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/40"
                  }`}
                >
                  {pkg.isActive ? copy.active : copy.inactive}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(pkg)}
                  className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/70"
                >
                  {copy.edit}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(pkg.id)}
                  className="rounded-lg bg-red-500/10 p-1.5 text-red-300"
                  aria-label={copy.delete}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId ? (
        <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-slate-950/60 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-xs text-white/50">
              {copy.titleAr}
              <input
                value={draft.titleAr || ""}
                onChange={(e) => setDraft({ ...draft, titleAr: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-white/50">
              {copy.titleEn}
              <input
                value={draft.titleEn || ""}
                onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-white/50">
              {copy.titleTr}
              <input
                value={draft.titleTr || ""}
                onChange={(e) => setDraft({ ...draft, titleTr: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-white/50 md:col-span-3">
              {copy.descAr}
              <textarea
                value={draft.descAr || ""}
                onChange={(e) => setDraft({ ...draft, descAr: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-white/50 md:col-span-3">
              {copy.descEn}
              <textarea
                value={draft.descEn || ""}
                onChange={(e) => setDraft({ ...draft, descEn: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-white/50 md:col-span-3">
              {copy.descTr}
              <textarea
                value={draft.descTr || ""}
                onChange={(e) => setDraft({ ...draft, descTr: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-white/50 md:col-span-3">
              {locale === "ar" ? "نوع التنفيذ (خدمة لوناليزا — لا تُرسل للمورد)" : locale === "tr" ? "Yerine getirme türü (Lonaliza hizmeti)" : "Fulfilment kind (Lonaliza service — never sent to supplier)"}
              <select
                value={draft.kind || "other"}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value as AgencyExtraKind })}
                className={`${inputClass} mt-1`}
              >
                {AGENCY_EXTRA_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {KIND_LABELS[kind]?.[locale === "en" ? "en" : locale === "tr" ? "tr" : "ar"] || kind}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-white/50 md:col-span-3">
              {locale === "ar" ? "الشروط (عربي)" : locale === "tr" ? "Koşullar (AR)" : "Terms (AR)"}
              <textarea value={draft.termsAr || ""} onChange={(e) => setDraft({ ...draft, termsAr: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-white/50 md:col-span-3">
              {locale === "ar" ? "الشروط (English)" : "Terms (EN)"}
              <textarea value={draft.termsEn || ""} onChange={(e) => setDraft({ ...draft, termsEn: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-white/50 md:col-span-3">
              {locale === "ar" ? "الشروط (Türkçe)" : "Terms (TR)"}
              <textarea value={draft.termsTr || ""} onChange={(e) => setDraft({ ...draft, termsTr: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-white/50">
              {copy.priceType}
              <select
                value={draft.priceType || "fixed"}
                onChange={(e) =>
                  setDraft({ ...draft, priceType: e.target.value as AgencyExtraPriceType })
                }
                className={`${inputClass} mt-1`}
              >
                <option value="fixed">{copy.fixed}</option>
                <option value="percent">{copy.percent}</option>
              </select>
            </label>
            <label className="text-xs text-white/50">
              {copy.price}
              <input
                type="number"
                min={0}
                step={draft.priceType === "percent" ? 0.5 : 1}
                value={draft.priceValue ?? 0}
                onChange={(e) => setDraft({ ...draft, priceValue: Number(e.target.value) })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-white/50">
              {copy.sort}
              <input
                type="number"
                min={0}
                value={draft.sort ?? 0}
                onChange={(e) => setDraft({ ...draft, sort: Number(e.target.value) })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-white/50">
              {copy.icon}
              <select
                value={draft.icon || "star"}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value as AgencyExtraIcon })}
                className={`${inputClass} mt-1`}
              >
                {AGENCY_EXTRA_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {extraIconLabel(icon, locale)}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-xs text-white/50 md:col-span-2">
              {copy.services}
              <div className="mt-2 flex flex-wrap gap-2">
                {AGENCY_EXTRA_SERVICES.map((service) => {
                  const on = (draft.serviceTypes || []).includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        on ? "bg-amber-500/20 text-amber-200" : "bg-white/5 text-white/40"
                      }`}
                    >
                      {extraServiceLabel(service, locale)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveDraft()}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : copy.save}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/70"
            >
              {copy.cancel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
