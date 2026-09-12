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
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ResellerLicense } from "@/lib/server/resale-store";

export default function ResaleUpdatesPage() {
  const { t, dir } = useLocale();
  const [licenses, setLicenses] = useState<ResellerLicense[]>([]);
  const [loading, setLoading] = useState(true);

  // New version release state
  const [version, setVersion] = useState("v2.1.0");
  const [changelog, setChangelog] = useState(
    "1. تحسينات أداء وسرعة البحث في الفنادق والطيران\n2. تحديث قوالب الإيميل ماركتنج\n3. ترقية محرك الذكاء الاصطناعي\n4. إصلاحات أمنية دورية"
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
      // Simulate/trigger publish endpoint
      await new Promise((r) => setTimeout(r, 1200));
      setPublishedSuccess(true);
      setTimeout(() => setPublishedSuccess(false), 4000);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <RefreshCw className="h-6 w-6 text-amber-500" />
            {t.admin.resaleUpdates}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة ونشر التحديثات البرمجية الدورية للنسخ المرخصة المشتركة في باقة التحديثات ($50/شهر)
          </p>
        </div>
      </div>

      {/* Nightly Update Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
        <Moon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-foreground">آلية النشر الليلي الآمن:</p>
          <p className="text-muted-foreground leading-relaxed">
            يتم نشر التحديثات تلقائياً في أوقات متأخرة من الليل (03:00 - 05:00 ص) لضمان عدم انقطاع خدمة الحجوزات لدى العملاء. تسحب سيرفرات العملاء المشتركين الحزمة المشفرة وتقوم بإعادة البناء وإعادة التشغيل بسلاسة.
          </p>
        </div>
      </div>

      {/* Publish Form */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Rocket className="h-4 w-4 text-amber-500" />
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
              className="w-full px-3.5 py-2.5 bg-secondary/60 border border-border rounded-xl text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
              className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-muted-foreground text-sm font-medium"
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
            className="w-full px-3.5 py-2.5 bg-secondary/60 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            سيتم إرسال هذا التحديث إلى <span className="font-bold text-amber-500">{licenses.length}</span> موقع مرخص
          </p>
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-all shadow-sm"
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
      <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          المواقع المستهدفة بالتحديث
        </h2>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : licenses.length === 0 ? (
          <p className="text-center py-6 text-xs text-muted-foreground">
            لا توجد مواقع مفعلة بانتظار التحديثات حالياً.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {licenses.map((l) => (
              <div key={l.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">{l.companyName || l.boundDomain || "موقع مرخص"}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">{l.licenseKey}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">
                    الإصدار الحالي: {l.currentVersion || "v2.0.0"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      l.online ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Radio className={`h-2.5 w-2.5 ${l.online ? "animate-pulse" : ""}`} />
                    {l.online ? "جاهز للسحب" : "غير متصل"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
