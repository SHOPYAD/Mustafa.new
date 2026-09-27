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
  AdminSettingsGrid,
  AdminFieldGrid,
  AdminStickySave,
  AdminSettingsPanel,
} from "@/components/admin/layout";
import { EnterprisePageHeader } from "@/components/admin/enterprise";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full px-4 py-2.5 bg-background/50 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all text-sm";

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
        <Loader2 className="animate-spin text-amber-400" size={28} />
      </div>
    );
  }

  return (
    <AdminPage>
      <EnterprisePageHeader
        icon={Share2}
        title={cs.title}
        description={cs.subtitle}
        badge="Channels & Support"
        actions={
          <div className="flex items-center gap-2.5">
            <Button type="button" variant="outline" onClick={handleReset} className="rounded-xl border-border/60">
              <RotateCcw size={14} />
              {cs.resetDefaults}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-violet-500/25"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {t.common.save}
            </Button>
          </div>
        }
      />

      {savedMsg ? (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>{savedMsg}</AlertDescription>
        </Alert>
      ) : null}

      <AdminSettingsGrid>
        <AdminSettingsPanel
          span={6}
          title={
            <span className="flex items-center gap-2">
              <Phone size={16} className="text-amber-500" />
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
                <p className="mt-1.5 text-xs text-muted-foreground">{cs.whatsappHint}</p>
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
                      ? "border-primary/40 text-foreground bg-primary/10"
                      : "border-border text-muted-foreground bg-muted"
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
                      className="shrink-0 rounded-xl bg-admin-bg-subtle p-3 text-admin-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
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
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-admin-bg-subtle px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
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
              <p className="mt-1.5 text-xs text-muted-foreground">{cs.callbackPhoneHint}</p>
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
              <Share2 size={16} className="text-amber-500" />
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
                      ? "border-primary/30 bg-card"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {networkLabel(id, socialLabels)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSocial(id, { enabled: !link.enabled }, true)
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                        link.enabled
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-border bg-muted text-muted-foreground"
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
                    <p className="text-xs text-muted-foreground">{cs.whatsappSocialNote}</p>
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
              <Phone size={16} className="text-amber-500" />
              <span>التحكم في الأزرار العائمة وأزرار الاتصال (Floating Widgets)</span>
            </span>
          }
          description="التحكم في ظهور أو إخفاء أزرار الاتصال العائمة بالأسفل ومواضعها بدقة (يمين، يسار، وسط، والارتفاع بالبيكسل). ملاحظة: كافة هذه الأزرار يتم إخفاؤها تلقائياً في صفحات السوشيال والمجتمع لضمان راحة الزائر."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Widget 1: Floating Action Hub (WhatsApp) */}
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                    WA
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">زر المساعد والواتساب</h4>
                    <p className="text-[11px] text-muted-foreground">الزر الأخضر الدائري العائم</p>
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.floatingHubEnabled !== false
                      ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                      : "border-admin-border-subtle bg-admin-bg-subtle text-admin-text-muted"
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
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-xs font-bold text-primary">
                    📞
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">زر "نتصل بك"</h4>
                    <p className="text-[11px] text-muted-foreground">طلب اتصال سريع من الإدارة</p>
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.callbackBannerEnabled !== false
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-admin-border-subtle bg-admin-bg-subtle text-admin-text-muted"
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
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    B2B
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">مستشار B2B</h4>
                    <p className="text-[11px] text-muted-foreground">زر المساعد الذكي لصفحة الهبوط</p>
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.b2bAdvisorEnabled !== false
                      ? "border-teal-500/40 bg-teal-500/15 text-teal-300"
                      : "border-admin-border-subtle bg-admin-bg-subtle text-admin-text-muted"
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
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {t.common.save}
        </Button>
      </AdminStickySave>
    </AdminPage>
  );
}
