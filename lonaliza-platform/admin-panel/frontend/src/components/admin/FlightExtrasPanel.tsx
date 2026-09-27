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
import { Card, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const inputClass = "admin-field";

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
    <Card className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="admin-section-title">{copy.title}</CardTitle>
          <p className="text-sm text-[color:var(--admin-text-muted)]">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void reset()} className="admin-btn-secondary">
            <RotateCcw size={14} />
            {copy.reset}
          </button>
          <button type="button" onClick={openNew} className="admin-btn-primary">
            <Plus size={16} />
            {copy.add}
          </button>
        </div>
      </div>

      {message ? <p className="text-sm text-[color:var(--admin-gold)]">{message}</p> : null}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-[color:var(--admin-text-muted)]">
          <Loader2 size={16} className="animate-spin" />
        </div>
      ) : extras.length === 0 ? (
        <p className="py-8 text-center text-[color:var(--admin-text-muted)]">{copy.empty}</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الإضافة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الخدمات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extras.map((pkg) => (
                  <TableRow key={pkg.id} className={pkg.isActive ? "" : "opacity-60"}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--admin-border-subtle)]">
                          <ExtraGlyph icon={pkg.icon} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{pkg.titleAr || pkg.titleEn}</p>
                          <p className="truncate text-xs text-[color:var(--admin-text-muted)]">{pkg.titleEn}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-[color:var(--admin-gold)]">{priceLabel(pkg)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pkg.serviceTypes.map((service) => (
                          <span key={service} className="admin-chip">
                            {extraServiceLabel(service, locale)}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button type="button" onClick={() => void toggleActive(pkg)} className="admin-btn-secondary text-xs">
                        {pkg.isActive ? copy.active : copy.inactive}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => openEdit(pkg)} className="admin-btn-secondary text-xs">
                          {copy.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(pkg.id)}
                          className="admin-btn-danger px-2 py-2"
                          aria-label={copy.delete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {extras.map((pkg) => (
              <article key={`m-${pkg.id}`} className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="font-semibold">{pkg.titleAr || pkg.titleEn}</p>
                <dl>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <dt>السعر</dt>
                    <dd>{priceLabel(pkg)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <dt>الحالة</dt>
                    <dd>{pkg.isActive ? copy.active : copy.inactive}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void toggleActive(pkg)} className="admin-btn-secondary text-xs">
                    {pkg.isActive ? copy.inactive : copy.active}
                  </button>
                  <button type="button" onClick={() => openEdit(pkg)} className="admin-btn-secondary text-xs">
                    {copy.edit}
                  </button>
                  <button type="button" onClick={() => void remove(pkg.id)} className="admin-btn-danger text-xs">
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <Dialog open={Boolean(editingId)} onOpenChange={(open) => { if (!open && !saving) setEditingId(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-xs text-muted-foreground">
              {copy.titleAr}
              <input
                value={draft.titleAr || ""}
                onChange={(e) => setDraft({ ...draft, titleAr: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-muted-foreground">
              {copy.titleEn}
              <input
                value={draft.titleEn || ""}
                onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-muted-foreground">
              {copy.titleTr}
              <input
                value={draft.titleTr || ""}
                onChange={(e) => setDraft({ ...draft, titleTr: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-muted-foreground md:col-span-3">
              {copy.descAr}
              <textarea
                value={draft.descAr || ""}
                onChange={(e) => setDraft({ ...draft, descAr: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-muted-foreground md:col-span-3">
              {copy.descEn}
              <textarea
                value={draft.descEn || ""}
                onChange={(e) => setDraft({ ...draft, descEn: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-muted-foreground md:col-span-3">
              {copy.descTr}
              <textarea
                value={draft.descTr || ""}
                onChange={(e) => setDraft({ ...draft, descTr: e.target.value })}
                rows={2}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-muted-foreground md:col-span-3">
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
            <label className="text-xs text-muted-foreground md:col-span-3">
              {locale === "ar" ? "الشروط (عربي)" : locale === "tr" ? "Koşullar (AR)" : "Terms (AR)"}
              <textarea value={draft.termsAr || ""} onChange={(e) => setDraft({ ...draft, termsAr: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-muted-foreground md:col-span-3">
              {locale === "ar" ? "الشروط (English)" : "Terms (EN)"}
              <textarea value={draft.termsEn || ""} onChange={(e) => setDraft({ ...draft, termsEn: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-muted-foreground md:col-span-3">
              {locale === "ar" ? "الشروط (Türkçe)" : "Terms (TR)"}
              <textarea value={draft.termsTr || ""} onChange={(e) => setDraft({ ...draft, termsTr: e.target.value })} rows={3} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-muted-foreground">
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
            <label className="text-xs text-muted-foreground">
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
            <label className="text-xs text-muted-foreground">
              {copy.sort}
              <input
                type="number"
                min={0}
                value={draft.sort ?? 0}
                onChange={(e) => setDraft({ ...draft, sort: Number(e.target.value) })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs text-muted-foreground">
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
            <div className="text-xs text-muted-foreground md:col-span-2">
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
                        on ? "bg-amber-500/20 text-amber-200" : "bg-admin-bg-subtle text-admin-text-muted"
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
              className="admin-btn-primary disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : copy.save}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="admin-btn-secondary"
            >
              {copy.cancel}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
