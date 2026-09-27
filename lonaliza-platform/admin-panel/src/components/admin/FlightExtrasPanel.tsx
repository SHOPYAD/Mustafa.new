"use client";

import React from "react";
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
  type AgencyExtraPackage,
  type AgencyExtraPriceType,
  type AgencyExtraService,
} from "@/types/agency-extra";
import { useAdminFlightExtras } from "@/hooks/admin/useAdminFlightExtras";
import { AdminButton } from "@/components/admin/ui/AdminButton";

const inputClass = "admin-input-field";

function ExtraGlyph({ icon }: { icon: AgencyExtraIcon }) {
  const cls = "text-primary";
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

  const {
    extras,
    loading,
    saving,
    editingId,
    setEditingId,
    draft,
    setDraft,
    message,
    openNew,
    openEdit,
    toggleService,
    saveDraft,
    toggleActive,
    remove,
    reset,
  } = useAdminFlightExtras(copy.loadFailed);

  const priceLabel = (pkg: AgencyExtraPackage) =>
    pkg.priceType === "percent" ? `${pkg.priceValue}%` : `USD ${pkg.priceValue}`;

  return (
    <div className="mb-6 space-y-4 rounded-2xl admin-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className='text-lg font-bold text-foreground'>{copy.title}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={() => void reset()}
            icon={<RotateCcw size={14} />}
          >
            {copy.reset}
          </AdminButton>
          <AdminButton
            variant="primary"
            size="sm"
            onClick={openNew}
            icon={<Plus size={16} />}
          >
            {copy.add}
          </AdminButton>
        </div>
      </div>

      {message ? <p className='text-sm text-secondary font-semibold'>{message}</p> : null}

      {loading ? (
        <div className='flex items-center gap-2 py-8 text-muted-foreground'>
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-xs">{copy.title}...</span>
        </div>
      ) : extras.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{copy.empty}</p>
      ) : (
        <div className='divide-y divide-admin-border-subtle overflow-hidden rounded-2xl border border-border'>
          {extras.map((pkg) => (
            <div
              key={pkg.id}
              className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center hover:bg-admin-bg-subtle transition-colors ${
                pkg.isActive ? "" : "opacity-50"
              }`}
            >
              <div className="md:col-span-5 flex items-center gap-3">
                <span className='flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card-2 shrink-0'>
                  <ExtraGlyph icon={pkg.icon} />
                </span>
                <div className="min-w-0">
                  <p className='truncate text-sm font-semibold text-foreground'>{pkg.titleAr || pkg.titleEn}</p>
                  <p className='truncate text-xs text-muted-foreground'>{pkg.titleEn}</p>
                </div>
              </div>
              <div className="md:col-span-2 text-sm font-bold text-primary">{priceLabel(pkg)}</div>
              <div className="md:col-span-2 flex flex-wrap gap-1">
                {pkg.serviceTypes.map((service) => (
                  <span key={service} className='rounded-full bg-card-2 border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground'>
                    {extraServiceLabel(service, locale)}
                  </span>
                ))}
              </div>
              <div className="md:col-span-3 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void toggleActive(pkg)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    pkg.isActive ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {pkg.isActive ? copy.active : copy.inactive}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(pkg)}
                  className='rounded-lg bg-card-2 border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-admin-bg-subtle transition-colors'
                >
                  {copy.edit}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(pkg.id)}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 p-1.5 text-red-600 dark:text-red-400 transition-colors"
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
        <div className='space-y-4 rounded-2xl border border-primary bg-card-2 p-5'>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className='text-xs font-semibold text-muted-foreground'>
              {copy.titleAr}
              <input
                value={draft.titleAr || ""}
                onChange={(e) => setDraft({ ...draft, titleAr: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className='text-xs font-semibold text-muted-foreground'>
              {copy.titleEn}
              <input
                value={draft.titleEn || ""}
                onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className='text-xs font-semibold text-muted-foreground'>
              {copy.titleTr}
              <input
                value={draft.titleTr || ""}
                onChange={(e) => setDraft({ ...draft, titleTr: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className='text-xs font-semibold text-muted-foreground md:col-span-3'>
              {copy.descAr}
              <textarea
                value={draft.descAr || ""}
                onChange={(e) => setDraft({ ...draft, descAr: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className='text-xs font-semibold text-muted-foreground md:col-span-3'>
              {copy.descEn}
              <textarea
                value={draft.descEn || ""}
                onChange={(e) => setDraft({ ...draft, descEn: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className='text-xs font-semibold text-muted-foreground md:col-span-3'>
              {copy.descTr}
              <textarea
                value={draft.descTr || ""}
                onChange={(e) => setDraft({ ...draft, descTr: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className='text-xs font-semibold text-muted-foreground md:col-span-3'>
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
            <label className='text-xs font-semibold text-muted-foreground md:col-span-3'>
              {locale === "ar" ? "الشروط (عربي)" : locale === "tr" ? "Koşullar (AR)" : "Terms (AR)"}
              <textarea value={draft.termsAr || ""} onChange={(e) => setDraft({ ...draft, termsAr: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className='text-xs font-semibold text-muted-foreground md:col-span-3'>
              {locale === "ar" ? "الشروط (English)" : "Terms (EN)"}
              <textarea value={draft.termsEn || ""} onChange={(e) => setDraft({ ...draft, termsEn: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className='text-xs font-semibold text-muted-foreground md:col-span-3'>
              {locale === "ar" ? "الشروط (Türkçe)" : "Terms (TR)"}
              <textarea value={draft.termsTr || ""} onChange={(e) => setDraft({ ...draft, termsTr: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className='text-xs font-semibold text-muted-foreground'>
              {copy.priceType}
              <select
                value={draft.priceType}
                onChange={(e) => setDraft({ ...draft, priceType: e.target.value as AgencyExtraPriceType })}
                className={`${inputClass} mt-1`}
              >
                <option value="fixed">{copy.fixed}</option>
                <option value="percent">{copy.percent}</option>
              </select>
            </label>
            <label className='text-xs font-semibold text-muted-foreground'>
              {copy.price}
              <input
                type="number"
                min={0}
                step={draft.priceType === "percent" ? "0.5" : "1"}
                value={draft.priceValue}
                onChange={(e) => setDraft({ ...draft, priceValue: Number(e.target.value) || 0 })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className='text-xs font-semibold text-muted-foreground'>
              {copy.sort}
              <input
                type="number"
                value={draft.sort}
                onChange={(e) => setDraft({ ...draft, sort: Number(e.target.value) || 0 })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className='text-xs font-semibold text-muted-foreground'>
              {copy.icon}
              <select
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value as AgencyExtraIcon })}
                className={`${inputClass} mt-1`}
              >
                {AGENCY_EXTRA_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {extraIconLabel(ic, locale)}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="draft-active"
                checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.value !== "false" && e.target.checked })}
                className='rounded border-border text-primary focus:ring-admin-accent/30'
              />
              <label htmlFor="draft-active" className='text-xs font-semibold text-foreground'>
                {copy.active}
              </label>
            </div>
            <div className='text-xs font-semibold text-muted-foreground md:col-span-2'>
              {copy.services}
              <div className="mt-2 flex flex-wrap gap-2">
                {AGENCY_EXTRA_SERVICES.map((service) => {
                  const on = (draft.serviceTypes || []).includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                        on ? "bg-primary text-foreground" : "bg-card border border-border text-muted-foreground"
                      }`}
                    >
                      {extraServiceLabel(service, locale)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className='flex flex-wrap gap-2 pt-2 border-t border-border'>
            <AdminButton
              variant="secondary"
              size="md"
              isLoading={saving}
              onClick={() => void saveDraft(copy.saveFailed)}
            >
              {copy.save}
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="md"
              onClick={() => setEditingId(null)}
            >
              {copy.cancel}
            </AdminButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
