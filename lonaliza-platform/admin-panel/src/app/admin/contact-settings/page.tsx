"use client";

import { useEffect, useState } from "react";
import {
  Phone,
  Share2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getSiteContact,
  saveSiteContact,
  resetSiteContact,
  SOCIAL_NETWORK_IDS,
} from "@/data/site-contact";
import type { SiteContact, SocialNetworkId } from "@/types/site-contact";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import {
  AdminPage,
  AdminPageHeader,
  AdminSettingsGrid,
  AdminFieldGrid,
  AdminStickySave,
  AdminSettingsPanel,
} from "@/components/admin/layout";

const inputClass =
  "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm";

const labelClass =
  "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

function networkLabel(
  id: SocialNetworkId,
  labels: Record<string, string>
): string {
  return labels[id] || id;
}

export default function AdminContactSettingsPage() {
  const { t } = useLocale();
  const cs = t.contactSettings;
  const [form, setForm] = useState<SiteContact | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");

  useEffect(() => {
    const local = getSiteContact();
    setForm(local);
    fetch("/api/admin/site-contact")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && data.contact) {
          const fetched: SiteContact = data.contact;
          const map = new Map((fetched.social || []).map((s) => [s.id, s]));
          const mergedSocial = SOCIAL_NETWORK_IDS.map((id) => {
            return map.get(id) || { id, enabled: false, url: "", handle: "" };
          });
          setForm({
            ...fetched,
            social: mergedSocial,
          });
        }
      })
      .catch(() => {});
  }, []);

  const socialLabels: Record<string, string> = {
    whatsapp: cs.whatsapp,
    instagram: cs.instagram,
    facebook: cs.facebook,
    youtube: cs.youtube,
    tiktok: cs.tiktok,
    twitter: cs.twitter,
    linkedin: cs.linkedin,
    snapchat: cs.snapchat,
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const next = saveSiteContact({
      ...form,
      whatsappNumber: normalizeWhatsAppNumber(form.whatsappNumber),
      customerServicePhones: form.customerServicePhones
        .map((p) => p.trim())
        .filter(Boolean),
    });
    setForm(next);

    try {
      await fetch("/api/admin/site-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch {}

    setSaving(false);
    setSavedMsg(cs.saved);
    setTimeout(() => setSavedMsg(""), 2800);
  };

  const handleReset = async () => {
    if (!confirm(cs.resetConfirm)) return;
    const next = resetSiteContact();
    setForm(next);
    try {
      await fetch("/api/admin/site-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch {}
    setSavedMsg(cs.resetDone);
    setTimeout(() => setSavedMsg(""), 2800);
  };

  const updateSocial = (
    id: SocialNetworkId,
    patch: Partial<SiteContact["social"][number]>,
    persistNow = false
  ) => {
    if (!form) return;
    const exists = form.social.some((s) => s.id === id);
    const updatedSocial = exists
      ? form.social.map((s) => (s.id === id ? { ...s, ...patch } : s))
      : [...form.social, { id, enabled: false, url: "", handle: "", ...patch }];
    const nextForm: SiteContact = {
      ...form,
      social: updatedSocial,
    };
    setForm(nextForm);
    // Live-push enable/disable so public sidebar/footer update immediately
    if (persistNow) {
      saveSiteContact({
        ...nextForm,
        whatsappNumber: normalizeWhatsAppNumber(nextForm.whatsappNumber),
        customerServicePhones: nextForm.customerServicePhones
          .map((p) => p.trim())
          .filter(Boolean),
      });
    }
  };

  const addPhone = () => {
    if (!form || !phoneDraft.trim()) return;
    setForm({
      ...form,
      customerServicePhones: [
        ...form.customerServicePhones,
        phoneDraft.trim(),
      ],
    });
    setPhoneDraft("");
  };

  const removePhone = (index: number) => {
    if (!form) return;
    setForm({
      ...form,
      customerServicePhones: form.customerServicePhones.filter(
        (_, i) => i !== index
      ),
    });
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className='animate-spin text-secondary' size={28} />
      </div>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        icon={<Share2 size={20} />}
        title={cs.title}
        description={
          <>
            <p>{cs.subtitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{cs.saveHint}</p>
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <RotateCcw size={14} />
              {cs.resetDefaults}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className='flex items-center gap-2 rounded-xl bg-primary hover:brightness-110 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all disabled:opacity-60 cursor-pointer'
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {t.common.save}
            </button>
          </>
        }
      />

      {/* Real KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>رقم واتساب المعتمد</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-lg font-black text-foreground font-mono truncate" dir="ltr">
            {form.whatsappNumber || "+90 552 170 22 22"}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            زر المحادثة المباشرة بالموقع
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>منصات التواصل النشطة</span>
            <Share2 className="size-3.5 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {form.social.filter((s) => s.enabled).length} منصات
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            معروضة في الفوتر وشريط التواصل
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>خطوط خدمة العملاء</span>
            <Phone className="size-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {form.customerServicePhones.length || 1} أرقام
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            هواتف الاتصال والدعم الفوري
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>البريد الرسمي للمنصة</span>
            <CheckCircle2 className="size-3.5 text-secondary" />
          </div>
          <div className="text-sm font-black text-foreground font-mono truncate" dir="ltr">
            {form.email || "info@lonaliza.com"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            استقبال استفسارات العملاء
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className='mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-bold'>
          <CheckCircle2 size={16} />
          {savedMsg}
        </div>
      )}

      <AdminSettingsGrid>
        <AdminSettingsPanel
          span={6}
          title={
            <span className="flex items-center gap-2">
              <Phone size={16} className='text-secondary' />
              {cs.phonesSection}
            </span>
          }
        >
          <div className="space-y-5">
            <AdminFieldGrid>
              <div>
                <label className={labelClass}>{cs.whatsappNumber}</label>
                <input
                  type="text"
                  value={form.whatsappNumber}
                  onChange={(e) =>
                    setForm({ ...form, whatsappNumber: e.target.value })
                  }
                  placeholder="905321796763"
                  className={inputClass}
                  dir="ltr"
                />
                <p className='mt-1.5 text-xs text-muted-foreground'>{cs.whatsappHint}</p>
              </div>
              <div>
                <label className={labelClass}>{cs.whatsappEnabled}</label>
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, whatsappEnabled: !form.whatsappEnabled })
                  }
                  className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border transition-all ${
                    form.whatsappEnabled !== false
                      ? "border-primary/40 text-primary bg-primary/15"
                      : "border-border text-muted-foreground bg-card hover:bg-muted"
                  }`}
                >
                  {form.whatsappEnabled !== false ? (
                    <>
                      <Eye size={14} />
                      {t.common.enabled}
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} />
                      {t.common.disabled}
                    </>
                  )}
                </button>
              </div>
            </AdminFieldGrid>

            <AdminFieldGrid>
              <div>
                <label className={labelClass}>{cs.whatsappMessageEn}</label>
                <textarea
                  value={form.whatsappMessageEn || ""}
                  onChange={(e) =>
                    setForm({ ...form, whatsappMessageEn: e.target.value })
                  }
                  rows={2}
                  className={`${inputClass} resize-y`}
                  dir="ltr"
                />
              </div>
              <div>
                <label className={labelClass}>{cs.whatsappMessageAr}</label>
                <textarea
                  value={form.whatsappMessageAr || ""}
                  onChange={(e) =>
                    setForm({ ...form, whatsappMessageAr: e.target.value })
                  }
                  rows={2}
                  className={`${inputClass} resize-y`}
                  dir="rtl"
                />
              </div>
            </AdminFieldGrid>

            <div>
              <label className={labelClass}>{cs.customerPhones}</label>
              <ul className="mb-3 space-y-2">
                {form.customerServicePhones.map((phone, i) => (
                  <li key={`${phone}-${i}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        const next = [...form.customerServicePhones];
                        next[i] = e.target.value;
                        setForm({ ...form, customerServicePhones: next });
                      }}
                      className={inputClass}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => removePhone(i)}
                      className='shrink-0 rounded-xl border border-border bg-card p-3 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 cursor-pointer'
                      aria-label={t.common.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex min-w-0 gap-2">
                <input
                  type="text"
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPhone();
                    }
                  }}
                  placeholder="+90 531 359 13 94"
                  className={inputClass}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={addPhone}
                  className='flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors'
                >
                  <Plus size={16} />
                  {cs.addPhone}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>{cs.callbackPhone}</label>
              <input
                type="text"
                value={form.callbackPhone}
                onChange={(e) =>
                  setForm({ ...form, callbackPhone: e.target.value })
                }
                placeholder="+90 531 359 13 94"
                className={inputClass}
                dir="ltr"
              />
              <p className='mt-1.5 text-xs text-muted-foreground'>{cs.callbackPhoneHint}</p>
            </div>
          </div>
        </AdminSettingsPanel>

        <AdminSettingsPanel span={6} title={cs.contactSection}>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>{cs.email}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@lonaliza.com"
                className={inputClass}
                dir="ltr"
              />
            </div>
            <div>
              <label className={labelClass}>{cs.address}</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </div>
            <div>
              <label className={labelClass}>{cs.supportHours}</label>
              <textarea
                value={form.supportHours}
                onChange={(e) =>
                  setForm({ ...form, supportHours: e.target.value })
                }
                rows={2}
                className={`${inputClass} resize-y`}
                placeholder={cs.supportHoursPlaceholder}
              />
            </div>
          </div>
        </AdminSettingsPanel>

        <AdminSettingsPanel
          span={12}
          title={
            <span className="flex items-center gap-2">
              <Share2 size={16} className='text-secondary' />
              {cs.socialSection}
            </span>
          }
          description={cs.socialHint}
        >
          <div className="grid grid-cols-1 gap-3 min-w-0 md:grid-cols-2">
            {SOCIAL_NETWORK_IDS.map((id) => {
              const link = form.social.find((s) => s.id === id) || {
                id,
                enabled: false,
                url: "",
                handle: "",
              };
              const isWa = id === "whatsapp";
              return (
                <div
                  key={id}
                  className={`rounded-xl border p-4 transition-all ${
                    link.enabled
                      ? "border-primary/30 bg-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className='text-sm font-medium text-foreground'>
                      {networkLabel(id, socialLabels)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSocial(id, { enabled: !link.enabled }, true)
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all cursor-pointer ${
                        link.enabled
                          ? "border-primary/40 bg-primary/15 text-primary font-medium"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {link.enabled ? (
                        <>
                          <Eye size={12} />
                          {t.common.enabled}
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          {t.common.disabled}
                        </>
                      )}
                    </button>
                  </div>
                  {!isWa && (
                    <div className="grid grid-cols-1 gap-3 min-w-0 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>{cs.url}</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) =>
                            updateSocial(id, { url: e.target.value })
                          }
                          placeholder="https://"
                          className={inputClass}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{cs.handle}</label>
                        <input
                          type="text"
                          value={link.handle}
                          onChange={(e) =>
                            updateSocial(id, { handle: e.target.value })
                          }
                          placeholder="@lonaliza"
                          className={inputClass}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}
                  {isWa && (
                    <p className='text-xs text-muted-foreground'>{cs.whatsappSocialNote}</p>
                  )}
                </div>
              );
            })}
          </div>
        </AdminSettingsPanel>

        {/* Floating Action Widgets Control Panel */}
        <AdminSettingsPanel
          span={12}
          title={
            <span className="flex items-center gap-2">
              <Phone size={16} className='text-secondary' />
              <span>التحكم في الأزرار العائمة وأزرار الاتصال (Floating Widgets)</span>
            </span>
          }
          description="التحكم في ظهور أو إخفاء أزرار الاتصال العائمة بالأسفل ومواضعها بدقة (يمين، يسار، وسط، والارتفاع بالبيكسل). ملاحظة: كافة هذه الأزرار يتم إخفاؤها تلقائياً في صفحات السوشيال والمجتمع لضمان راحة الزائر."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Widget 1: Floating Action Hub (WhatsApp) */}
            <div className='rounded-2xl border border-border bg-background/60 p-4 space-y-4'>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className='size-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xs'>
                    WA
                  </div>
                  <div>
                    <h4 className='text-sm font-bold text-foreground'>زر المساعد والواتساب</h4>
                    <p className='text-[11px] text-muted-foreground'>الزر الأخضر الدائري العائم</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      floatingHubEnabled: form.floatingHubEnabled === false ? true : false,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    form.floatingHubEnabled !== false
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {form.floatingHubEnabled !== false ? "مُفعّل" : "مُعطّل"}
                </button>
              </div>

              <div>
                <label className={labelClass}>موضع الزر في الشاشة</label>
                <select
                  value={form.floatingHubPosition || "right"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      floatingHubPosition: e.target.value as "right" | "left" | "center",
                    })
                  }
                  className={inputClass}
                >
                  <option value="right">يمين (Right)</option>
                  <option value="left">يسار (Left)</option>
                  <option value="center">وسط (Center)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>الارتفاع من الأسفل (بالبيكسل px)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={form.floatingHubBottomPx ?? 24}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      floatingHubBottomPx: Number(e.target.value) || 24,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Widget 2: Callback Banner */}
            <div className='rounded-2xl border border-border bg-card shadow-xs p-4 space-y-4'>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                    📞
                  </div>
                  <div>
                    <h4 className='text-sm font-bold text-foreground'>زر "نتصل بك"</h4>
                    <p className='text-[11px] text-muted-foreground'>طلب اتصال سريع من الإدارة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      callbackBannerEnabled: form.callbackBannerEnabled === false ? true : false,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    form.callbackBannerEnabled !== false
                      ? "border-orange-500/40 bg-orange-500/15 text-orange-700 dark:text-orange-300 font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {form.callbackBannerEnabled !== false ? "مُفعّل" : "مُعطّل"}
                </button>
              </div>

              <div>
                <label className={labelClass}>موضع الزر في الشاشة</label>
                <select
                  value={form.callbackBannerPosition || "right"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      callbackBannerPosition: e.target.value as "right" | "left" | "center",
                    })
                  }
                  className={inputClass}
                >
                  <option value="right">يمين (Right)</option>
                  <option value="left">يسار (Left)</option>
                  <option value="center">وسط (Center)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>الارتفاع من الأسفل (بالبيكسل px)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={form.callbackBannerBottomPx ?? 24}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      callbackBannerBottomPx: Number(e.target.value) || 24,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Widget 3: B2B Advisor Widget */}
            <div className='rounded-2xl border border-border bg-card shadow-xs p-4 space-y-4'>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    B2B
                  </div>
                  <div>
                    <h4 className='text-sm font-bold text-foreground'>مستشار B2B</h4>
                    <p className='text-[11px] text-muted-foreground'>زر المساعد الذكي لصفحة الهبوط</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      b2bAdvisorEnabled: form.b2bAdvisorEnabled === false ? true : false,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    form.b2bAdvisorEnabled !== false
                      ? "border-teal-500/40 bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {form.b2bAdvisorEnabled !== false ? "مُفعّل" : "مُعطّل"}
                </button>
              </div>

              <div>
                <label className={labelClass}>موضع الزر في الشاشة</label>
                <select
                  value={form.b2bAdvisorPosition || "right"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      b2bAdvisorPosition: e.target.value as "right" | "left" | "center",
                    })
                  }
                  className={inputClass}
                >
                  <option value="right">يمين (Right)</option>
                  <option value="left">يسار (Left)</option>
                  <option value="center">وسط (Center)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>الارتفاع من الأسفل (بالبيكسل px)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={form.b2bAdvisorBottomPx ?? 24}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      b2bAdvisorBottomPx: Number(e.target.value) || 24,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </AdminSettingsPanel>
      </AdminSettingsGrid>

      <AdminStickySave>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 px-6 py-3 font-bold text-white shadow-lg shadow-purple-950/20 transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer'
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {t.common.save}
        </button>
      </AdminStickySave>
    </AdminPage>
  );
}
