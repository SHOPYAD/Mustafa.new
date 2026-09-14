"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Key,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Bot,
  ExternalLink,
  Layers,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import type { ModuleAuditItem, PlatformAuditResult } from "@/lib/server/mcp/servers/platform-admin";

export default function PlatformReadinessHeaderBanner() {
  const [audit, setAudit] = useState<PlatformAuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/platform-readiness", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && data.audit) {
        setAudit(data.audit);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudit();

    const handleUpdate = () => fetchAudit();
    window.addEventListener("lonaliza:settings-updated", handleUpdate);
    return () => window.removeEventListener("lonaliza:settings-updated", handleUpdate);
  }, [fetchAudit]);

  const handoverToAgent = (moduleName: string, promptText?: string) => {
    setDetailsOpen(false);
    const message = promptText || `قم بإعداد وضبط قسم «${moduleName}» بالكامل في المنصة والتحقق من متطلباته ونواقصه الآن.`;
    window.dispatchEvent(
      new CustomEvent("lonaliza:admin-agent-chat", {
        detail: { prompt: message },
      })
    );
  };

  const batchSetupAll = () => {
    setDetailsOpen(false);
    const message =
      "⚡ أيها الوكيل المشرف العام، قم الآن بعمل مراجعة وإعداد شامل لكافة أقسام المنصة الـ 18 بالترتيب، واطلب مني أي مفاتيح مطلوبة خطوة بخطوة وجهز المنصة للإطلاق الكامل.";
    window.dispatchEvent(
      new CustomEvent("lonaliza:admin-agent-chat", {
        detail: { prompt: message },
      })
    );
  };

  if (loading || !audit) return null;

  const score = audit.overallScore;
  const isExcellent = score >= 90;
  const isGood = score >= 75 && score < 90;

  const progressBarColor = isExcellent
    ? "from-[#3b0764] via-[#6b21a8] to-[#d97706]"
    : isGood
    ? "from-[#3b0764] to-[#b18a52]"
    : "from-amber-600 to-orange-500";

  const badgeBgColor = isExcellent
    ? "bg-purple-500/20 border-purple-400/40 text-purple-200"
    : isGood
    ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
    : "bg-orange-500/20 border-orange-400/40 text-orange-300";

  // Minimized pill state
  if (minimized) {
    return (
      <div className="w-full px-4 pt-2">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-white/90">جاهزية المنصة للإطلاق:</span>
            <span className={`rounded-lg border px-2 py-0.5 text-xs font-black ${badgeBgColor}`}>
              {score}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4"
            >
              تفاصيل الأقسام (18)
            </button>
            <button
              type="button"
              onClick={() => setMinimized(false)}
              className="text-white/50 hover:text-white p-1"
              title="توسيع البانر"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <aside
        aria-label="جاهزية المنصة"
        className="admin-dark-banner admin-isolated-dark platform-readiness-banner w-full border-b border-purple-800/40 bg-gradient-to-r from-[#170e28] via-[#24143d] to-[#170e28] px-4 py-2.5 sm:px-6 shadow-md transition-all text-white"
        data-dark-banner="true"
        data-admin-isolated-dark="true"
        data-readiness-banner="true"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Right Section: Icon & Title & Score */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#3b0764] via-[#581c87] to-[#d97706] text-white shadow-sm border border-amber-400/30">
              <Rocket size={17} className="stroke-[2.2] text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-white">
                  جاهزية منصة لوناليزا للإطلاق الإنتاجي
                </span>
                <span className={`rounded-md border px-2 py-0.5 text-xs font-black ${badgeBgColor}`}>
                  {score}% مكتمل
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-purple-200">
                {audit.readyModulesCount} من أصل {audit.totalModulesCount} قسماً مكتمل وجاهز للعمليات الميدانية
              </p>
            </div>
          </div>

          {/* Middle Section: Progress Bar */}
          <div className="hidden md:flex flex-1 max-w-xs items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 border border-white/5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${progressBarColor} transition-all duration-700`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Left Section: Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              <Layers size={13} className="text-amber-300" />
              <span className="text-white font-bold">تفاصيل الإعدادات ({audit.totalModulesCount || 18})</span>
            </button>

            <button
              type="button"
              onClick={batchSetupAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] px-3.5 py-1.5 text-xs font-black text-white shadow-sm border border-amber-400/40 transition-all"
            >
              <Bot size={13} className="text-amber-300" />
              <span>إعداد شامل بالوكيل</span>
            </button>

            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
              title="تصغير البانر"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* DETAILED MODAL: 18 MODULES BREAKDOWN */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl text-right"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-amber-300">
                  <Rocket size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    كشف تدقيق جاهزية المنصة الشامل (18 قسماً دون استثناء)
                  </h3>
                  <p className="text-xs text-white/50">
                    معدل الجاهزية العام: {score}% — يمكنك تحويل إعداد أي قسم فوراً للوكيل المشرف
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchAudit}
                  className="rounded-xl border border-white/10 p-2 text-white/60 hover:text-white hover:bg-white/5"
                  title="تحديث الفحص"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="rounded-xl border border-white/10 p-2 text-white/60 hover:text-white hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Batch setup banner inside modal */}
            <div className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-500/40 bg-purple-950/40 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-100">
                <Sparkles size={16} className="text-amber-300" />
                <span>هل تريد إسناد إعداد كافة النواقص بالترتيب للمشرف الذكي للمنصة؟</span>
              </div>
              <button
                type="button"
                onClick={batchSetupAll}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] border border-amber-400/50 px-4 py-2 text-xs font-black text-white shadow-md transition-all"
              >
                <Bot size={15} className="text-amber-300" />
                <span>إطلاق الإعداد الشامل التلقائي الآن</span>
              </button>
            </div>

            {/* 18 Modules Grid */}
            <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
              {audit.modules.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {m.readinessPercent >= 90 ? (
                        <CheckCircle2 size={18} className="text-amber-400" />
                      ) : m.requiresApiKey ? (
                        <Key size={18} className="text-amber-400" />
                      ) : (
                        <AlertTriangle size={18} className="text-orange-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{m.nameAr}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                            m.readinessPercent >= 90
                              ? "bg-purple-500/30 text-amber-200 border border-purple-400/40"
                              : m.requiresApiKey
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-orange-500/20 text-orange-300"
                          }`}
                        >
                          {m.readinessPercent}%
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-white/50">{m.summaryAr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={m.configUrl}
                      onClick={() => setDetailsOpen(false)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <span>صفحة الإعداد</span>
                      <ExternalLink size={11} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handoverToAgent(m.nameAr)}
                      className="inline-flex items-center gap-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 transition-colors"
                      title="إرسال أمر إعداد هذا القسم للشات مع الوكيل"
                    >
                      <ArrowRightLeft size={12} />
                      <span>تحويل للوكيل للإعداد</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>يتم تحديث المؤشرات حياً عند إدخال أي مفتاح أو إكمال إعداد.</span>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white"
              >
                إغلاق الكشف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
