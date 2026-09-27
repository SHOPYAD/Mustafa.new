"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Receipt, RotateCcw, Save, Upload } from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { AdminCopilotPanel } from "@/components/admin/copilot";
import { INVOICE_SERVICES, type InvoiceService } from "@/lib/booking-service";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { defaultInvoiceTemplate } from "@/lib/invoice-template-model";
import {
  INVOICE_FIELD_KEYS,
  type InvoiceFieldKey,
  type InvoiceTemplate,
} from "@/types/invoice-template";

const inputClass =
  "w-full px-3 py-2.5 bg-admin-bg-surface border border-admin-border-subtle rounded-xl text-admin-text-primary placeholder:text-admin-text-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 text-sm";
const labelClass = "block text-[11px] font-semibold text-admin-text-muted mb-1.5 uppercase tracking-wider";
const cardClass = "rounded-2xl border border-admin-border-subtle bg-admin-bg-surface p-5";

function fieldCopy(locale: string): Record<InvoiceFieldKey, string> {
  if (locale === "ar") {
    return {
      customer: "العميل",
      passenger: "المسافر / الضيف",
      route: "المسار",
      taxes: "الضرائب",
      baseFare: "الأجرة الأساسية",
      baggage: "الأمتعة",
      fareClass: "درجة السعر",
      legs: "قطاعات الرحلة",
      hotel: "الفندق",
      room: "الغرفة",
      nights: "الليالي",
      dates: "التواريخ",
      payment: "طريقة الدفع",
      details: "تفاصيل إضافية",
    };
  }
  if (locale === "tr") {
    return {
      customer: "Müşteri",
      passenger: "Yolcu / misafir",
      route: "Güzergah",
      taxes: "Vergiler",
      baseFare: "Baz ücret",
      baggage: "Bagaj",
      fareClass: "Sınıf",
      legs: "Uçuş bacakları",
      hotel: "Otel",
      room: "Oda",
      nights: "Gece",
      dates: "Tarihler",
      payment: "Ödeme yöntemi",
      details: "Ek detaylar",
    };
  }
  return {
    customer: "Customer",
    passenger: "Passenger / guest",
    route: "Route",
    taxes: "Taxes",
    baseFare: "Base fare",
    baggage: "Baggage",
    fareClass: "Fare class",
    legs: "Flight legs",
    hotel: "Hotel",
    room: "Room",
    nights: "Nights",
    dates: "Dates",
    payment: "Payment method",
    details: "Extra details",
  };
}

function serviceCopy(locale: string): Record<InvoiceService, string> {
  if (locale === "ar") {
    return {
      flight: "طيران",
      hotel: "فنادق",
      transfer: "ترانسفير",
      car: "سيارات",
      package: "باقات",
      tour: "جولات",
      visa: "تأشيرات",
    };
  }
  if (locale === "tr") {
    return {
      flight: "Uçuş",
      hotel: "Otel",
      transfer: "Transfer",
      car: "Araç",
      package: "Paket",
      tour: "Tur",
      visa: "Vize",
    };
  }
  return {
    flight: "Flights",
    hotel: "Hotels",
    transfer: "Transfers",
    car: "Cars",
    package: "Packages",
    tour: "Tours",
    visa: "Visa",
  };
}

function cloneTemplate(value: InvoiceTemplate): InvoiceTemplate {
  return structuredClone(value);
}

export default function InvoiceTemplatesPanel() {
  const { t, locale } = useLocale();
  const fields = useMemo(() => fieldCopy(locale), [locale]);
  const services = useMemo(() => serviceCopy(locale), [locale]);
  const [service, setService] = useState<InvoiceService>("flight");
  const [templates, setTemplates] = useState<Record<InvoiceService, InvoiceTemplate> | null>(null);
  const [viewType, setViewType] = useState<"invoice" | "ticket">("invoice");
  const [draft, setDraft] = useState<InvoiceTemplate>(() => defaultInvoiceTemplate("flight"));
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const applyService = useCallback(
    (next: InvoiceService, store?: Record<InvoiceService, InvoiceTemplate> | null) => {
      const source = store || templates;
      setService(next);
      setDraft(cloneTemplate(source?.[next] || defaultInvoiceTemplate(next)));
    },
    [templates]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/invoice-templates");
        const data = await res.json();
        if (!data?.ok || !data.templates) {
          if (!cancelled) setError(t.admin.invoiceTemplatesSubtitle);
          return;
        }
        if (cancelled) return;
        setTemplates(data.templates);
        setDraft(cloneTemplate(data.templates.flight || defaultInvoiceTemplate("flight")));
      } catch {
        if (!cancelled) setError(t.admin.saveFailed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t.admin.invoiceTemplatesSubtitle, t.admin.saveFailed]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setPreviewing(true);
      try {
        const res = await fetch("/api/admin/invoice-templates/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ service, template: draft, viewType }),
        });
        const data = await res.json();
        if (data?.ok && typeof data.html === "string") setPreviewHtml(data.html);
      } catch {
        /* keep last preview */
      } finally {
        setPreviewing(false);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, service, viewType]);

  const patchDraft = (partial: Partial<InvoiceTemplate>) => {
    setDraft((prev) => ({ ...prev, ...partial, service }));
    setMessage("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/invoice-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, template: draft }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setError(data?.error || t.admin.saveFailed);
        return;
      }
      setTemplates(data.templates);
      setDraft(cloneTemplate(data.template || draft));
      setMessage(t.admin.saved);
    } catch {
      setError(t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/invoice-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, reset: true }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setError(data?.error || t.admin.saveFailed);
        return;
      }
      setTemplates(data.templates);
      setDraft(cloneTemplate(data.template || defaultInvoiceTemplate(service)));
      setMessage(t.admin.saved);
    } catch {
      setError(t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", "branding");
      const res = await fetch("/api/admin/branding/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!data?.ok || !data.url) {
        setError(data?.error || t.admin.saveFailed);
        return;
      }
      patchDraft({ logoUrl: String(data.url) });
    } catch {
      setError(t.admin.saveFailed);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 size={16} className="animate-spin" />
        {t.admin.loading}
      </div>
    );
  }

  return (
    <div className="admin-page flex w-full max-w-none min-w-0 flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <span className="size-11 rounded-2xl border border-admin-border-subtle bg-[color:var(--admin-bg-subtle)] flex items-center justify-center text-amber-400 flex-shrink-0">
            <Receipt size={20} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t.admin.invoiceTemplates}</h1>
            <p className="text-sm text-admin-text-muted leading-relaxed">{t.admin.invoiceTemplatesSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-admin-border-subtle text-muted-foreground text-sm hover:bg-[color:var(--admin-bg-subtle)]"
          >
            <RotateCcw size={14} />
            {t.admin.invoiceReset}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-foreground text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {t.admin.saved === message ? t.admin.saved : t.admin.saveSettings}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {INVOICE_SERVICES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => applyService(id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              service === id
                ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent"
                : "bg-[color:var(--admin-bg-subtle)] text-muted-foreground border-admin-border-subtle hover:bg-[color:var(--admin-bg-subtle)]"
            }`}
          >
            {services[id]}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <div className="grid xl:grid-cols-[minmax(0,1fr)_420px] gap-5 items-start">
        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{t.admin.invoicePreview}</h2>
              {previewing ? <Loader2 size={14} className="animate-spin text-admin-text-muted" /> : null}
            </div>

            <div className="flex items-center gap-1 bg-[color:var(--admin-bg-subtle)] p-1 rounded-xl border border-admin-border-subtle">
              <button
                type="button"
                onClick={() => setViewType("invoice")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewType === "invoice"
                    ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] font-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {locale === "ar" ? "الفاتورة الضريبية" : "Tax Invoice"}
              </button>
              <button
                type="button"
                onClick={() => setViewType("ticket")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewType === "ticket"
                    ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] font-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {service === "flight"
                  ? locale === "ar" ? "تذكرة الطيران الإلكترونية (E-Ticket)" : "Flight E-Ticket"
                  : service === "hotel"
                  ? locale === "ar" ? "فوشر حجز الفندق (Hotel Voucher)" : "Hotel Voucher"
                  : locale === "ar" ? "قسيمة الخدمة (Voucher)" : "Service Voucher"}
              </button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden bg-[#f8fafc] min-h-[720px] border border-admin-border-subtle">
            {previewHtml ? (
              <iframe
                title={t.admin.invoicePreview}
                srcDoc={previewHtml}
                className="w-full min-h-[720px] bg-[#f8fafc]"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="min-h-[720px] flex items-center justify-center text-[color:var(--admin-text-muted)] text-sm">
                {t.admin.loading}
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-foreground mb-4">{t.admin.invoiceManual}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>{locale === "ar" ? "اسم الشركة عربي" : "Company name (AR)"}</label>
                <input
                  className={inputClass}
                  value={draft.companyNameAr}
                  onChange={(e) => patchDraft({ companyNameAr: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>{locale === "ar" ? "اسم الشركة إنجليزي" : "Company name (EN)"}</label>
                <input
                  className={inputClass}
                  value={draft.companyNameEn}
                  onChange={(e) => patchDraft({ companyNameEn: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{locale === "ar" ? "الأساسي" : "Primary"}</label>
                  <input
                    type="color"
                    className="h-10 w-full rounded-xl border border-admin-border-subtle bg-transparent"
                    value={draft.primaryColor}
                    onChange={(e) => patchDraft({ primaryColor: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>{locale === "ar" ? "التمييز" : "Accent"}</label>
                  <input
                    type="color"
                    className="h-10 w-full rounded-xl border border-admin-border-subtle bg-transparent"
                    value={draft.accentColor}
                    onChange={(e) => patchDraft({ accentColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{locale === "ar" ? "الشعار" : "Logo"}</label>
                <div className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    value={draft.logoUrl}
                    onChange={(e) => patchDraft({ logoUrl: e.target.value })}
                    placeholder={locale === "ar" ? "فارغ = شعار الموقع" : "Empty = site logo"}
                  />
                  <label className="inline-flex items-center justify-center size-10 rounded-xl border border-admin-border-subtle text-muted-foreground hover:bg-[color:var(--admin-bg-subtle)] cursor-pointer">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadLogo(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  {locale === "ar" ? "ارتفاع الشعار" : "Logo height"} · {draft.logoHeight}px
                </label>
                <input
                  type="range"
                  min={24}
                  max={120}
                  value={draft.logoHeight}
                  onChange={(e) => patchDraft({ logoHeight: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{locale === "ar" ? "اللغة" : "Language"}</label>
                  <select
                    className={inputClass}
                    value={draft.language}
                    onChange={(e) =>
                      patchDraft({ language: e.target.value as InvoiceTemplate["language"] })
                    }
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{locale === "ar" ? "الأرقام" : "Numerals"}</label>
                  <select
                    className={inputClass}
                    value={draft.currencyFormat}
                    onChange={(e) =>
                      patchDraft({
                        currencyFormat: e.target.value as InvoiceTemplate["currencyFormat"],
                      })
                    }
                  >
                    <option value="western">{locale === "ar" ? "غربية 1 2 3" : "Western 1 2 3"}</option>
                    <option value="localized">{locale === "ar" ? "محلية" : "Localized"}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{locale === "ar" ? "نص الترويسة" : "Header text"}</label>
                <input
                  className={inputClass}
                  value={draft.headerText}
                  onChange={(e) => patchDraft({ headerText: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>{locale === "ar" ? "نص التذييل" : "Footer text"}</label>
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  value={draft.footerText}
                  onChange={(e) => patchDraft({ footerText: e.target.value })}
                />
              </div>
              <div>
                <p className={`${labelClass} mb-2`}>{locale === "ar" ? "الحقول الظاهرة" : "Visible fields"}</p>
                <div className="flex flex-col">
                  {INVOICE_FIELD_KEYS.map((key) => (
                    <AdminSwitch
                      key={key}
                      checked={draft.fields[key]}
                      onChange={(next) =>
                        setDraft((prev) => ({
                          ...prev,
                          fields: { ...prev.fields, [key]: next },
                        }))
                      }
                      label={fields[key]}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>CSS</label>
                <textarea
                  className={`${inputClass} min-h-[88px] font-mono text-xs`}
                  value={draft.customCss}
                  onChange={(e) => patchDraft({ customCss: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>HTML</label>
                <textarea
                  className={`${inputClass} min-h-[88px] font-mono text-xs`}
                  value={draft.extraHtml}
                  onChange={(e) => patchDraft({ extraHtml: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className={`${cardClass} p-0 overflow-hidden min-h-[420px]`}>
            <AdminCopilotPanel
              scope="invoices"
              title={t.admin.invoiceGeminiTitle}
              hint={`${t.admin.invoiceGeminiHint} ${t.builderAgent.isolated}`}
              placeholder={t.admin.invoiceGeminiPlaceholder}
              className="h-[420px]"
              host={{
                invoice: {
                  service,
                  draft,
                  onApply: (template) => setDraft(cloneTemplate({ ...template, service })),
                },
              }}
              fallback={async (messages) => {
                const res = await fetch("/api/gemini/invoices", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ service, template: draft, messages }),
                });
                const data = (await res.json()) as {
                  ok?: boolean;
                  error?: string;
                  reply?: string;
                  template?: InvoiceTemplate;
                };
                if (data.template) {
                  setDraft(cloneTemplate({ ...data.template, service }));
                }
                if (!data.ok) return data.error || t.admin.invoiceGeminiFailed;
                return data.reply || t.admin.invoiceGeminiHint;
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
