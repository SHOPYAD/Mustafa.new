"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Palette, RotateCcw } from "lucide-react";
import { MediaPicker } from "@/components/editor/MediaPicker";
import { BRANDING_UPDATED_EVENT, DEFAULT_BRANDING } from "@/data/branding";
import { getSiteContact, saveSiteContact } from "@/data/site-contact";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  ARABIC_FONT_CATALOG,
  DEFAULT_ARABIC_FONT_ID,
} from "@/lib/fonts/arabic-catalog";
import {
  DEFAULT_LATIN_FONT_ID,
  LATIN_FONT_CATALOG,
} from "@/lib/fonts/latin-catalog";
import { loadFont, loadLatinFont } from "@/lib/fonts/load-font";
import { THEME_PRESETS } from "@/lib/theme/presets";
import {
  applyBrandTheme,
  FACTORY_PRESET_ID,
  notifyBrandTheme,
  type BrandTheme,
} from "@/lib/theme/tokens";
import type { BrandingContent } from "@/types/branding";
import { normalizeWhatsAppNumber } from "@/lib/utils";

const inputClass =
  "w-full px-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm";

const labelClass =
  "block text-[11px] font-semibold text-white/35 mb-1.5 uppercase tracking-wider";

const COLOR_FIELDS: { key: keyof BrandingContent["colors"]; ar: string; en: string }[] =
  [
    { key: "primary", ar: "أساسي", en: "Primary" },
    { key: "secondary", ar: "ثانوي", en: "Secondary" },
    { key: "accent", ar: "تمييز", en: "Accent" },
    { key: "header", ar: "الهيدر", en: "Header" },
    { key: "footer", ar: "الفوتر", en: "Footer" },
    { key: "button", ar: "الأزرار", en: "Buttons" },
    { key: "whatsapp", ar: "واتساب (اختياري)", en: "WhatsApp (optional)" },
  ];

function cloneBranding(value: BrandingContent): BrandingContent {
  return structuredClone(value);
}

function emitBranding(detail: BrandingContent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BRANDING_UPDATED_EVENT, { detail }));
}

function emitTheme(detail: BrandTheme) {
  notifyBrandTheme(detail);
}

export function EditorBrandingPanel({
  compact = true,
}: {
  compact?: boolean;
}) {
  const { t, locale } = useLocale();
  const [form, setForm] = useState<BrandingContent>(() =>
    cloneBranding(DEFAULT_BRANDING)
  );
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [theme, setTheme] = useState<BrandTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isAr = locale === "ar";

  const load = useCallback(async () => {
    try {
      const [brandingRes, themeRes] = await Promise.all([
        fetch("/api/admin/branding", { cache: "no-store" }),
        fetch("/api/admin/theme", { cache: "no-store" }),
      ]);
      const brandingData = await brandingRes.json();
      const themeData = await themeRes.json();
      if (brandingData?.ok && brandingData.branding) {
        const next = cloneBranding(brandingData.branding as BrandingContent);
        setForm(next);
        setSupportEmail(next.supportEmail || "");
        setSupportPhone(next.supportPhone || "");
        setSupportWhatsapp(next.supportWhatsapp || "");
      } else {
        const contact = getSiteContact();
        setSupportEmail(contact.email);
        setSupportPhone(contact.customerServicePhones[0] || contact.callbackPhone);
        setSupportWhatsapp(contact.whatsappNumber);
      }
      if (themeData?.ok && themeData.theme) {
        setTheme(themeData.theme as BrandTheme);
      }
    } catch {
      setMessage(t.admin.brandingLoadFailed);
    } finally {
      setLoading(false);
    }
  }, [t.admin.brandingLoadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchForm = (updater: (prev: BrandingContent) => BrandingContent) => {
    setForm((prev) => updater(prev));
  };

  const applyArabicFont = async (arabicFontId: string) => {
    if (!theme) return;
    setSaving(true);
    setMessage(null);
    try {
      loadFont(arabicFontId);
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...theme, arabicFontId, syncBrandingColors: false }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || t.admin.brandingSaveFailed);
        return;
      }
      const nextTheme = data.theme as BrandTheme;
      setTheme(nextTheme);
      applyBrandTheme(nextTheme);
      emitTheme(nextTheme);
      setMessage(isAr ? "تم تطبيق خط عربي على الموقع" : "Arabic font applied site-wide");
    } catch {
      setMessage(t.admin.brandingSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const applyLatinFont = async (latinFontId: string) => {
    if (!theme) return;
    setSaving(true);
    setMessage(null);
    try {
      loadLatinFont(latinFontId);
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...theme, latinFontId, syncBrandingColors: false }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || t.admin.brandingSaveFailed);
        return;
      }
      const nextTheme = data.theme as BrandTheme;
      setTheme(nextTheme);
      applyBrandTheme(nextTheme);
      emitTheme(nextTheme);
      setMessage(
        isAr
          ? "تم تطبيق خط لاتيني واحد على كل اللغات غير العربية"
          : "Latin font applied to all non-Arabic locales",
      );
    } catch {
      setMessage(t.admin.brandingSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = async (presetId: string) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyPresetId: presetId, syncBrandingColors: true }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || t.admin.brandingSaveFailed);
        return;
      }
      const nextTheme = data.theme as BrandTheme;
      setTheme(nextTheme);
      loadFont(nextTheme.arabicFontId);
      loadLatinFont(nextTheme.latinFontId);
      applyBrandTheme(nextTheme);
      emitTheme(nextTheme);
      setForm((prev) => {
        const next = { ...prev, colors: { ...prev.colors, ...nextTheme.colors } };
        emitBranding(next);
        return next;
      });
      setMessage(isAr ? "تم تطبيق القالب على الموقع بالكامل" : "Theme applied site-wide");
    } catch {
      setMessage(t.admin.brandingSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const resetTheme = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true, syncBrandingColors: true }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || t.admin.brandingSaveFailed);
        return;
      }
      const nextTheme = data.theme as BrandTheme;
      setTheme(nextTheme);
      loadFont(nextTheme.arabicFontId);
      loadLatinFont(nextTheme.latinFontId);
      applyBrandTheme(nextTheme);
      emitTheme(nextTheme);
      setForm((prev) => {
        const next = { ...prev, colors: { ...prev.colors, ...nextTheme.colors } };
        emitBranding(next);
        return next;
      });
      setMessage(t.admin.brandingResetDone);
    } catch {
      setMessage(t.admin.brandingSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: BrandingContent = {
        ...form,
        supportEmail,
        supportPhone,
        supportWhatsapp,
      };
      const res = await fetch("/api/admin/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || t.admin.brandingSaveFailed);
        return;
      }
      const saved = cloneBranding(data.branding as BrandingContent);
      setForm(saved);
      emitBranding(saved);

      if (theme) {
        const themeRes = await fetch("/api/admin/theme", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...theme,
            colors: saved.colors,
            presetId: theme.presetId,
            syncBrandingColors: false,
          }),
        });
        const themeData = await themeRes.json();
        if (themeData?.ok && themeData.theme) {
          const nextTheme = themeData.theme as BrandTheme;
          setTheme(nextTheme);
          applyBrandTheme(nextTheme);
          emitTheme(nextTheme);
        }
      }

      const current = getSiteContact();
      saveSiteContact({
        ...current,
        email: supportEmail.trim() || current.email,
        customerServicePhones: supportPhone.trim()
          ? [supportPhone.trim(), ...current.customerServicePhones.slice(1)]
          : current.customerServicePhones,
        callbackPhone: supportPhone.trim() || current.callbackPhone,
        whatsappNumber:
          normalizeWhatsAppNumber(supportWhatsapp) || current.whatsappNumber,
      });

      setMessage(t.admin.brandingSaved);
    } catch {
      setMessage(t.admin.brandingSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const presetName = (preset: (typeof THEME_PRESETS)[number]) => {
    if (locale === "en") return preset.nameEn;
    if (locale === "tr") return preset.nameTr;
    return preset.nameAr;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm px-1 py-4">
        <Loader2 className="animate-spin" size={16} />
        {t.admin.loading}
      </div>
    );
  }

  return (
    <div className={`space-y-5 ${compact ? "" : "max-w-3xl"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white text-sm font-bold flex items-center gap-2">
            <Palette size={16} className="text-amber-400" />
            {t.admin.brandingIdentity}
          </h2>
          <p className="text-white/40 text-[11px] mt-1">
            {isAr
              ? "الاسم، الشعار، الألوان، وقوالب المظهر للموقع بالكامل."
              : "Name, logo, colors, and site-wide theme templates."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-purple-700 to-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:brightness-110 shadow-sm disabled:opacity-60 transition-all"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
          {t.admin.brandingSave}
        </button>
      </div>

      {message ? <p className="text-xs text-amber-300/90 font-medium">{message}</p> : null}

      <section className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={labelClass}>الاسم (AR)</label>
            <input
              className={inputClass}
              value={form.brandNameAr}
              onChange={(e) =>
                patchForm((prev) => ({ ...prev, brandNameAr: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Name (EN)</label>
            <input
              className={inputClass}
              value={form.brandNameEn}
              onChange={(e) =>
                patchForm((prev) => ({ ...prev, brandNameEn: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Ad (TR)</label>
            <input
              className={inputClass}
              value={form.brandNameTr}
              onChange={(e) =>
                patchForm((prev) => ({ ...prev, brandNameTr: e.target.value }))
              }
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            {isAr ? "الشعار" : "Logo"}
          </label>
          <MediaPicker
            value={form.logoUrl}
            onChange={(logoUrl) => patchForm((prev) => ({ ...prev, logoUrl }))}
            compact
          />
        </div>
        <div>
          <label className={labelClass}>Favicon</label>
          <MediaPicker
            value={form.faviconUrl}
            onChange={(faviconUrl) =>
              patchForm((prev) => ({ ...prev, faviconUrl }))
            }
            compact
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.showWordmark}
            onChange={(e) =>
              patchForm((prev) => ({ ...prev, showWordmark: e.target.checked }))
            }
            className="h-4 w-4 rounded border-white/20 bg-slate-950"
          />
          {t.admin.brandingShowWordmark}
        </label>

        <div>
          <label className={labelClass}>
            {isAr ? "الخط العربي للموقع" : "Site Arabic font"}
          </label>
          <select
            className={inputClass}
            dir="rtl"
            disabled={saving || !theme}
            value={theme?.arabicFontId || DEFAULT_ARABIC_FONT_ID}
            onChange={(e) => void applyArabicFont(e.target.value)}
          >
            {ARABIC_FONT_CATALOG.map((font) => (
              <option key={font.id} value={font.id}>
                {font.nameAr} — {font.nameEn}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            {isAr
              ? "يُحمَّل الخط العربي المختار فقط. لا تُحقن المكتبة كاملة في الصفحات العامة."
              : "Public pages load only the chosen Arabic face, never the full library."}
          </p>
        </div>

        <div>
          <label className={labelClass}>
            {isAr ? "الخط اللاتيني (EN / TR / FR وغيرها)" : "Site Latin font (EN / TR / FR + others)"}
          </label>
          <select
            className={inputClass}
            dir="ltr"
            disabled={saving || !theme}
            value={theme?.latinFontId || DEFAULT_LATIN_FONT_ID}
            onChange={(e) => void applyLatinFont(e.target.value)}
          >
            {LATIN_FONT_CATALOG.map((font) => (
              <option key={font.id} value={font.id}>
                {font.nameEn} — {font.nameAr}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            {isAr
              ? "وجه واحد لكل اللغات غير العربية، مع Latin Extended (تركية وفرنسية). يُحمَّل المختار فقط."
              : "One face for every non-Arabic locale, with latin-ext (Turkish + French). Only the active family loads."}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-white text-sm font-bold">{t.admin.brandingSupport}</h3>
        <div>
          <label className={labelClass}>{isAr ? "البريد" : "Email"}</label>
          <input
            className={inputClass}
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>{isAr ? "الهاتف" : "Phone"}</label>
          <input
            className={inputClass}
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input
            className={inputClass}
            value={supportWhatsapp}
            onChange={(e) => setSupportWhatsapp(e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-white text-sm font-bold">{t.admin.brandingColors}</h3>
        <div className="grid grid-cols-1 gap-3">
          {COLOR_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={labelClass}>{isAr ? field.ar : field.en}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-10 rounded-lg border border-white/10 bg-transparent"
                  value={form.colors[field.key] || "#22c55e"}
                  onChange={(e) =>
                    patchForm((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, [field.key]: e.target.value },
                    }))
                  }
                />
                <input
                  className={inputClass}
                  value={form.colors[field.key]}
                  onChange={(e) =>
                    patchForm((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, [field.key]: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-white text-sm font-bold">{t.admin.brandingThemes}</h3>
        <p className="text-[11px] text-white/40 leading-relaxed">
          {t.admin.brandingResetHint}
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={() => void resetTheme()}
          className={`w-full text-start rounded-xl border px-3 py-2.5 transition inline-flex items-center gap-2 ${
            theme?.presetId === FACTORY_PRESET_ID
              ? "border-amber-400/60 bg-purple-900/30 ring-1 ring-amber-400/40"
              : "border-white/15 bg-white/5 hover:bg-white/10"
          }`}
        >
          <RotateCcw size={14} className="text-amber-300 shrink-0" />
          <span>
            <span className="block text-white text-sm font-semibold">
              {t.admin.brandingReset}
            </span>
            <span className="block text-[11px] text-white/45 mt-0.5">
              {isAr
                ? "بنفسج ملكي داكن وذهب لامع — هوية لوناليزا الرسمية فورًا."
                : "Royal purple & lustrous gold — factory Lonaliza brand tokens."}
            </span>
          </span>
        </button>
        <div className="grid grid-cols-1 gap-2">
          {THEME_PRESETS.map((preset) => {
            const active = theme?.presetId === preset.id;
            const chrome = preset.theme.chrome;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={saving}
                onClick={() => void applyPreset(preset.id)}
                className={`text-start rounded-xl border px-3 py-2.5 transition ${
                  active
                    ? "border-amber-400/60 bg-purple-900/30 ring-1 ring-amber-400/40"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white text-sm font-semibold">
                    {presetName(preset)}
                  </span>
                  <span className="flex gap-1">
                    {[chrome.headerBg, chrome.primary, chrome.pageBg, chrome.buttonBg].map(
                      (color) => (
                        <span
                          key={color}
                          className="h-3.5 w-3.5 rounded-full border border-white/20"
                          style={{ background: color }}
                        />
                      )
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-white/45 mt-1">
                  {isAr ? preset.descriptionAr : preset.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default EditorBrandingPanel;
