"use client";

import { useEffect, useState } from "react";
import {
  Check,
  DollarSign,
  Loader2,
  MessageCircle,
  Plus,
  Save,
  Server,
  Settings,
  Trash2,
} from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ResellerSettings } from "@/lib/server/resale-store";

const inputClass =
  "w-full px-3.5 py-2.5 bg-secondary/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 text-sm";
const labelClass = "block text-xs font-semibold text-foreground mb-1.5";
const cardClass = "rounded-2xl border border-border bg-card/60 p-5 sm:p-6 space-y-4";

export default function ResaleSettingsPage() {
  const { t, dir } = useLocale();
  const [settings, setSettings] = useState<ResellerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/resale/settings", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; settings?: ResellerSettings };
        if (data?.ok && data.settings) {
          setSettings(data.settings);
        }
      } catch {
        /* fallback */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/resale/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as { ok?: boolean; settings?: ResellerSettings };
      if (data?.ok && data.settings) {
        setSettings(data.settings);
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch {
      /* error handling */
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim() || !settings) return;
    setSettings({
      ...settings,
      features: [...settings.features, newFeature.trim()],
    });
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      features: settings.features.filter((_, i) => i !== index),
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <AdminPage className="space-y-6" dir={dir}>
      <AdminPageHeader
        icon={<Settings className="size-5" />}
        title={t.admin.resaleSettings}
        description={t.admin.resaleSettingsDesc}
        actions={
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="admin-btn-primary disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : savedMsg ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{savedMsg ? "تم الحفظ بنجاح" : "حفظ الإعدادات"}</span>
        </button>
        }
      />

      {/* Pricing & Activation */}
      <div className={cardClass}>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <DollarSign className="h-4 w-4 text-amber-500" />
          التسعير والدفع
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t.admin.resaleLifetimePrice} (USD)</label>
            <input
              type="number"
              value={settings.lifetimePrice}
              onChange={(e) => setSettings({ ...settings, lifetimePrice: Number(e.target.value) || 0 })}
              className={inputClass}
              placeholder="1990"
            />
            <p className="text-xs text-muted-foreground mt-1">سعر شراء الباقة مدى الحياة مع سيرفر سنة مجاناً</p>
          </div>

          <div>
            <label className={labelClass}>{t.admin.resaleUpdatePrice} (USD/شهر)</label>
            <input
              type="number"
              value={settings.updatePrice}
              onChange={(e) => setSettings({ ...settings, updatePrice: Number(e.target.value) || 0 })}
              className={inputClass}
              placeholder="50"
            />
            <p className="text-xs text-muted-foreground mt-1">اشتراك شهري اختياري للتحديثات المستمرة</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <AdminSwitch
            label={t.admin.resaleWhatsappBankEnabled}
            description="السماح للشركات بالطلب والتحويل البنكي عبر واتساب"
            checked={settings.whatsappBankEnabled}
            onChange={(checked) => setSettings({ ...settings, whatsappBankEnabled: checked })}
          />
        </div>
      </div>

      {/* Server & Delivery Specs */}
      <div className={cardClass}>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Server className="h-4 w-4 text-amber-500" />
          مواصفات السيرفر والتسليم
        </h2>

        <div>
          <label className={labelClass}>{t.admin.resaleContaboSpecs}</label>
          <textarea
            rows={3}
            value={settings.contaboSpecs}
            onChange={(e) => setSettings({ ...settings, contaboSpecs: e.target.value })}
            className={inputClass}
            placeholder="Cloud VPS 6 — 6 vCPU Cores, 12 GB RAM, 200 GB NVMe SSD..."
          />
          <p className="text-xs text-muted-foreground mt-1">يظهر هذا النص في صفحة الهبوط التسويقية ضمن مواصفات السيرفر الممنوح</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t.admin.resaleDeliveryHours}</label>
            <input
              type="text"
              value={settings.deliveryHours}
              onChange={(e) => setSettings({ ...settings, deliveryHours: e.target.value })}
              className={inputClass}
              placeholder="12–24"
            />
            <p className="text-xs text-muted-foreground mt-1">المدة المتوقعة لتجهيز السيرفر وتسليم الموقع</p>
          </div>

          <div>
            <label className={labelClass}>{t.admin.resaleSupportWhatsapp}</label>
            <div className="relative">
              <input
                type="text"
                value={settings.supportWhatsapp}
                onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                className={inputClass}
                placeholder="+905015709201"
              />
              <MessageCircle className="h-4 w-4 text-emerald-500 absolute left-3 top-3" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">رقم واتساب المباشر للدعم وربط الدومينات</p>
          </div>
        </div>
      </div>

      {/* Package Features */}
      <div className={cardClass}>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Settings className="h-4 w-4 text-amber-500" />
          {t.admin.resaleFeatures}
        </h2>

        <div className="space-y-2.5">
          {settings.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={feat}
                onChange={(e) => {
                  const updated = [...settings.features];
                  updated[idx] = e.target.value;
                  setSettings({ ...settings, features: updated });
                }}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
              className={inputClass}
              placeholder="إضافة ميزة جديدة للباقة..."
            />
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-foreground hover:bg-muted font-medium text-sm rounded-xl transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة</span>
            </button>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
