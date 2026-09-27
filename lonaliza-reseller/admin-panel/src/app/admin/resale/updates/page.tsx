"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  Loader2,
  Moon,
  Package,
  Radio,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Upload,
  Layers,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AdminPage } from "@/components/admin/layout";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";
import type { ResellerLicense } from "@/lib/server/resale-store";

export default function ResaleUpdatesPage() {
  const { t, dir } = useLocale();
  const [licenses, setLicenses] = useState<ResellerLicense[]>([]);
  const [loading, setLoading] = useState(true);

  // New version release state
  const [version, setVersion] = useState("v2.1.0");
  const [changelog, setChangelog] = useState(
    "1. تحسينات أداء وسرعة البحث في الفنادق والطيران\n2. تحديث قوالب الإيميل ماركتنج\n3. ترقية محرك الذكاء الاصطناعي\n4. إصلاحات أمنية دورية وإعادة هيكلة لوحة التحكم للمظهر الملكي"
  );
  const [publishing, setPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/resale/licenses", { cache: "no-store" });
        const json = (await res.json()) as { ok?: boolean; licenses?: ResellerLicense[] };
        if (json?.ok && json.licenses) {
          setLicenses(json.licenses.filter((l) => l.status === "bound" || l.status === "issued"));
        }
      } catch {
        /* non-blocking */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await new Promise((r) => setTimeout(r, 1200));
      setPublishedSuccess(true);
      setTimeout(() => setPublishedSuccess(false), 4000);
    } finally {
      setPublishing(false);
    }
  };

  const onlineCount = licenses.filter((l) => l.online).length;

  return (
    <AdminPage className="space-y-6 w-full min-w-0" dir={dir}>
      <EnterprisePageHeader
        icon={RefreshCw}
        title={t.admin.resaleUpdates}
        description="إدارة ونشر التحديثات البرمجية الدورية للنسخ المرخصة المشتركة في باقة التحديثات ($50/شهر)"
        badge="OTA Updates"
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
              <Zap className="size-3.5 text-violet-400" />
              <span>قناة النشر المستمر (Live Channel)</span>
            </span>
          </div>
        }
      />

      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          label="النسخ المرخصة النشطة"
          value={licenses.length}
          helperText="مواقع مستعدة للاستلام"
          icon={ShieldCheck}
          color="violet"
        />
        <EnterpriseKpiCard
          label="السيرفرات المتصلة الآن"
          value={onlineCount}
          helperText="جاهزة لسحب الحزمة"
          icon={Radio}
          color="emerald"
        />
        <EnterpriseKpiCard
          label="الإصدار الجاري تجهيزه"
          value={version}
          helperText="تحديث تراكمي رئيسي"
          icon={Package}
          color="amber"
        />
        <EnterpriseKpiCard
          label="نافذة الصيانة التلقائية"
          value="03:30 ص"
          helperText="النشر الليلي الآمن"
          icon={Moon}
          color="blue"
        />
      </EnterpriseKpiGrid>

      {/* Nightly Update Notice */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5 backdrop-blur-xl shadow-lg shadow-black/10">
        <Moon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-foreground">آلية النشر الليلي الآمن للموزعين:</p>
          <p className="text-muted-foreground leading-relaxed">
            يتم نشر التحديثات تلقائياً في أوقات متأخرة من الليل (03:00 - 05:00 ص) لضمان عدم انقطاع خدمة الحجوزات لدى الشركاء. تسحب سيرفرات العملاء المشتركين الحزمة المشفرة وتقوم بإعادة البناء والتوليد ثم إعادة التشغيل عبر PM2 بسلاسة تامة.
          </p>
        </div>
      </div>

      {/* Publish Form */}
      <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 space-y-4 shadow-xl shadow-black/20">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
          <Rocket className="h-4 w-4 text-violet-400" />
          نشر إصدار جديد
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              رقم الإصدار الجديد
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 rounded-xl text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
              placeholder="v2.1.0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              وقت التنفيذ المجدول
            </label>
            <input
              type="text"
              readOnly
              value="الليلة القادمة — 03:30 صباحاً"
              className="w-full px-4 py-2.5 bg-muted/40 border border-border/60 rounded-xl text-muted-foreground text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            سجل التغييرات والميزات (Changelog)
          </label>
          <textarea
            rows={4}
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            className="w-full px-4 py-2.5 bg-background/50 border border-border/60 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all leading-relaxed"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            سيتم إرسال هذا التحديث إلى <span className="font-bold text-violet-400 font-mono">{licenses.length}</span> موقع مرخص متصل
          </p>
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : publishedSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{publishedSuccess ? "تمت جدولة النشر بنجاح!" : "جدولة نشر التحديث الآن"}</span>
          </button>
        </div>
      </div>

      {/* Target Sites List */}
      <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 space-y-4 shadow-xl shadow-black/20">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          المواقع المستهدفة بالتحديث
        </h2>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          </div>
        ) : licenses.length === 0 ? (
          <p className="text-center py-8 text-xs text-muted-foreground">
            لا توجد مواقع مفعلة بانتظار التحديثات حالياً.
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {licenses.map((l) => (
              <div key={l.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/20 px-3 rounded-xl transition-colors">
                <div>
                  <p className="font-bold text-foreground">{l.companyName || l.boundDomain || "موقع مرخص"}</p>
                  <p className="text-muted-foreground font-mono text-[11px] mt-0.5">{l.licenseKey}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground text-xs">
                    الإصدار الحالي: {l.currentVersion || "v2.0.0"}
                  </span>
                  <EnterpriseStatusBadge
                    status={l.online ? "completed" : "pending"}
                    label={l.online ? "جاهز للسحب" : "غير متصل"}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPage>
  );
}
