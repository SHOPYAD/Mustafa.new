"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  Key,
  Loader2,
  Play,
  RefreshCw,
  Save,
  ShieldCheck,
  Zap,
} from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";

const inputClass =
  "w-full px-3 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 text-sm";
const labelClass = "block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider";
const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4";

type ConfigState = {
  enabled: boolean;
  environment: "sandbox" | "production";
  company_id: string;
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  auto_issue_on_payment: boolean;
  vat_exemption_code: string;
  vat_rate: number;
};

type TestResult = {
  ok: boolean;
  message?: string;
  latencyMs?: number;
  companyName?: string;
  environment?: string;
  error?: string;
};

export default function ParasutConfigPanel({
  onInvoiceIssued,
}: {
  onInvoiceIssued?: () => void;
}) {
  const [config, setConfig] = useState<ConfigState>({
    enabled: true,
    environment: "sandbox",
    company_id: "",
    client_id: "",
    client_secret: "",
    username: "",
    password: "",
    auto_issue_on_payment: true,
    vat_exemption_code: "302",
    vat_rate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Manual trigger state
  const [manualBookingId, setManualBookingId] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [issueResult, setIssueResult] = useState<{
    ok: boolean;
    invoiceNumber?: string;
    ettn?: string;
    pdfReady?: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/parasut/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.config) {
          setConfig({
            enabled: data.config.enabled ?? true,
            environment: data.config.environment ?? "sandbox",
            company_id: data.config.company_id ?? "",
            client_id: data.config.client_id ?? "",
            client_secret: data.config.client_secret ?? "",
            username: data.config.username ?? "",
            password: data.config.password ?? "",
            auto_issue_on_payment: data.config.auto_issue_on_payment ?? true,
            vat_exemption_code: data.config.vat_exemption_code ?? "302",
            vat_rate: data.config.vat_rate ?? 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/parasut/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/parasut/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        ok: false,
        error: err?.message || "فشل الاتصال بخادم Paraşüt",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleManualIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBookingId.trim()) return;
    setIssuing(true);
    setIssueResult(null);
    try {
      const res = await fetch("/api/admin/parasut/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: manualBookingId.trim() }),
      });
      const data = await res.json();
      setIssueResult(data);
      if (data.ok && onInvoiceIssued) {
        onInvoiceIssued();
      }
    } catch (err: any) {
      setIssueResult({
        ok: false,
        error: err?.message || "تعذر إصدار الفاتورة",
      });
    } finally {
      setIssuing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-purple-950/30 to-slate-900/50 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-lg shadow-lg">
              GİB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  منظومة الفوترة الإلكترونية والمحاسبة التركية (Paraşüt API v4)
                </h2>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  GİB e-Arşiv Fatura
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                إصدار تلقائي وتوقيع رسمي للفواتير عبر بوابة مصلحة الضرائب التركية فور إتمام الدفع مع دعم الإعفاء الضريبي للمقيمين بالخارج (KDVK 11/1-a).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
              <span>فحص الاتصال المباشر</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={14} /> : <Save size={14} />}
              <span>{saveSuccess ? "تم الحفظ بنجاح" : "حفظ الإعدادات"}</span>
            </button>
          </div>
        </div>

        {/* Live Test Result Banner */}
        {testResult && (
          <div
            className={`mt-4 rounded-2xl border p-4 text-xs font-bold transition-all ${
              testResult.ok
                ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-200"
                : "border-red-500/40 bg-red-950/50 text-red-200"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {testResult.ok ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                )}
                <div>
                  <p className="font-black text-sm">
                    {testResult.ok
                      ? `تم الاتصال بنجاح بـ Paraşüt API (${testResult.companyName || "شركة لوناليزا"})`
                      : "فشل التحقق من الاتصال والمصادقة"}
                  </p>
                  <p className="text-[11px] font-mono opacity-80 mt-0.5">
                    {testResult.ok
                      ? `بيئة العمل: ${testResult.environment?.toUpperCase()} · زمن الاستجابة: ${testResult.latencyMs}ms · توكن OAuth2 نشط وموثق.`
                      : `السبب: ${testResult.error || "يرجى التحقق من بيانات الاعتماد وبيئة العمل"}`}
                  </p>
                </div>
              </div>

              {testResult.ok && (
                <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[10px] text-emerald-300 font-mono">
                  HTTP 200 OK · AUTHENTICATED
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Settings Form & Manual Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* General & Environment */}
          <div className={cardClass}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-400" />
                <span>حالة المنظومة والبيئة التشغيلية</span>
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <AdminSwitch
                label="تفعيل بوابة Paraşüt API v4"
                description="تمكين الاتصال المباشر لإصدار الفواتير الرسمية e-Arşiv"
                checked={config.enabled}
                onChange={(checked) => setConfig((prev) => ({ ...prev, enabled: checked }))}
              />

              <AdminSwitch
                label="الإصدار التلقائي بعد الدفع"
                description="إطلاق التوقيع الرسمي آلياً فور تأكيد الدفع عبر إيزيكو"
                checked={config.auto_issue_on_payment}
                onChange={(checked) => setConfig((prev) => ({ ...prev, auto_issue_on_payment: checked }))}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className={labelClass}>بيئة العمل (Environment)</label>
                <select
                  value={config.environment}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      environment: e.target.value as "sandbox" | "production",
                    }))
                  }
                  className={inputClass}
                >
                  <option value="sandbox">Sandbox / تجريبية (api.mikropara.com)</option>
                  <option value="production">Production / حية رسمية (api.parasut.com)</option>
                </select>
                <p className="text-[10px] text-white/30 mt-1 font-mono">
                  {config.environment === "production"
                    ? "https://api.parasut.com/v4"
                    : "https://api.mikropara.com/v4"}
                </p>
              </div>

              <div>
                <label className={labelClass}>معرف الشركة في باراشوت (Company ID)</label>
                <input
                  type="text"
                  value={config.company_id}
                  onChange={(e) => setConfig((prev) => ({ ...prev, company_id: e.target.value }))}
                  placeholder="مثال: 412850"
                  className={inputClass}
                />
                <p className="text-[10px] text-white/30 mt-1">
                  الرقم الظاهر في شريط العنوان بحسابكم في Paraşüt
                </p>
              </div>
            </div>
          </div>

          {/* OAuth2 Credentials */}
          <div className={cardClass}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key size={16} className="text-amber-400" />
                <span>مفاتيح الاعتماد الرسمية (OAuth2 Credentials)</span>
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className={labelClass}>معرف التطبيق (Client ID)</label>
                <input
                  type="text"
                  value={config.client_id}
                  onChange={(e) => setConfig((prev) => ({ ...prev, client_id: e.target.value }))}
                  placeholder="Application ID من صفحة التطبيقات"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>المفتاح السري (Client Secret)</label>
                <input
                  type="password"
                  value={config.client_secret}
                  onChange={(e) => setConfig((prev) => ({ ...prev, client_secret: e.target.value }))}
                  placeholder="••••••••••••••••"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>البريد الإلكتروني للحساب (Username)</label>
                <input
                  type="email"
                  value={config.username}
                  onChange={(e) => setConfig((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="finance@lonaliza.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>كلمة مرور الحساب (Password)</label>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••••••••••"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Tax & Exemption Defaults */}
          <div className={cardClass}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 size={16} className="text-amber-400" />
                <span>إعدادات الإعفاء الضريبي (T.C. KDV Muafiyeti)</span>
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className={labelClass}>رمز الإعفاء الضريبي (Exemption Code)</label>
                <input
                  type="text"
                  value={config.vat_exemption_code}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, vat_exemption_code: e.target.value }))
                  }
                  placeholder="302"
                  className={inputClass}
                />
                <p className="text-[10px] text-white/30 mt-1">
                  رمز 302: تصدير خدمات سياحية للمقيمين بالخارج (3065 SK KDVK 11/1-a)
                </p>
              </div>

              <div>
                <label className={labelClass}>نسبة ضريبة القيمة المضافة الافتراضية (%)</label>
                <input
                  type="number"
                  value={config.vat_rate}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, vat_rate: Number(e.target.value) || 0 }))
                  }
                  placeholder="0"
                  className={inputClass}
                />
                <p className="text-[10px] text-white/30 mt-1">
                  0% للسياح والأجانب، أو 20% للخدمات الخاضعة للضريبة المحلية
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Manual Issue Trigger & Info */}
        <div className="space-y-6">
          {/* Manual Trigger Form */}
          <div className={cardClass}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                <span>إصدار وتوقيع يدوي فوري</span>
              </h3>
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              يمكنك إصدار فاتورة e-Arşiv رسمية لأي حجز مسدد في النظام لم تصدر له فاتورة تلقائية بعد.
            </p>

            <form onSubmit={handleManualIssue} className="space-y-3">
              <div>
                <label className={labelClass}>رقم الحجز (Booking ID أو PNR)</label>
                <input
                  type="text"
                  value={manualBookingId}
                  onChange={(e) => setManualBookingId(e.target.value)}
                  placeholder="مثال: bk_abc123 أو IYZ-..."
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={issuing || !manualBookingId.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 px-4 py-2.5 text-xs font-black text-white hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {issuing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>جارٍ الاتصال والتوقيع بـ Paraşüt...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>بدء إصدار وتوقيع e-Arşiv</span>
                  </>
                )}
              </button>
            </form>

            {/* Issue Result Message */}
            {issueResult && (
              <div
                className={`rounded-xl border p-3 text-xs ${
                  issueResult.ok
                    ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-200"
                    : "border-red-500/40 bg-red-950/60 text-red-200"
                }`}
              >
                {issueResult.ok ? (
                  <div className="space-y-1">
                    <p className="font-black flex items-center gap-1.5 text-emerald-400">
                      <FileCheck size={14} />
                      <span>تم توقيع وإصدار الفاتورة بنجاح!</span>
                    </p>
                    <p className="font-mono text-[11px]">
                      رقم الفاتورة: <strong>{issueResult.invoiceNumber}</strong>
                    </p>
                    <p className="font-mono text-[9px] break-all opacity-70">
                      ETTN: {issueResult.ettn}
                    </p>
                    {issueResult.pdfReady && (
                      <p className="text-[10px] text-emerald-300 font-bold mt-1">
                        ✓ تم سحب وأرشفة ملف الـ PDF الحكومي بنجاح.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-black flex items-center gap-1.5 text-red-400">
                      <AlertCircle size={14} />
                      <span>فشل إصدار الفاتورة</span>
                    </p>
                    <p className="text-[11px] opacity-80">{issueResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Guidance Box */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-2 text-xs text-white/60">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Building2 size={13} className="text-amber-400" />
              <span>معايير مصلحة الضرائب التركية (GİB)</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-white/50 leading-relaxed">
              <li>يتم إنشاء سجل العميل الأجنبي تلقائياً برقم هوية افتراضي 11111111111 ومكتب Yurtdisi.</li>
              <li>فواتير التصدير السياحي تدرج تحت كود الإعفاء 302 بنسبة ضريبة 0%.</li>
              <li>يتم توقيع الفاتورة رسمياً ويتم منحها رقم EAR متسلسل وكود ETTN مشفر.</li>
              <li>يتم تنزيل وتخزين ملف PDF الحكومي محلياً لتوفيره دائماً للعميل دون انتهاء صلاحية رابط S3.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
