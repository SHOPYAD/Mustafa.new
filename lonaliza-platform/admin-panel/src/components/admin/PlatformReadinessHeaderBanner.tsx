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
  const [minimized, setMinimized] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lonaliza_readiness_minimized") !== "false";
    }
    return true;
  });
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
    ? "from-[#3b0764] via-[#6b21a8] to-[var(--admin-btn-secondary-hover)]"
    : isGood
    ? "from-[#3b0764] to-[#b18a52]"
    : "from-admin-btn-secondary-bg to-orange-500";

  const badgeBgColor = isExcellent
    ? "bg-primary/20 border-primary/40 text-muted-foreground"
    : isGood
    ? "bg-secondary/20 border-admin-btn-secondary-border/40 text-secondary"
    : "bg-orange-500/20 border-orange-400/40 text-orange-300";

  // Minimized pill state
  if (minimized) {
    return (
      <div className="w-full px-4 pt-2">
        <div className='flex items-center justify-between rounded-xl border border-border bg-background/80 px-4 py-2 backdrop-blur-md shadow-sm'>
          <div className="flex items-center gap-3">
            <span className='flex h-2 w-2 rounded-full bg-secondary animate-pulse' />
            <span className='text-xs font-bold text-muted-foreground'>جاهزية المنصة للإطلاق:</span>
            <span className={`rounded-lg border px-2 py-0.5 text-xs font-black ${badgeBgColor}`}>
              {score}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className='text-xs font-bold text-secondary hover:text-muted-foreground underline underline-offset-4'
            >
              تفاصيل الأقسام (18)
            </button>
            <button
              type="button"
              onClick={() => setMinimized(false)}
              className='text-muted-foreground hover:text-foreground p-1'
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
        className='w-full border-b border-border bg-card/95 backdrop-blur-md px-4 py-2.5 sm:px-6 shadow-2xs transition-all text-foreground'
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Right Section: Icon & Title & Score */}
          <div className="flex items-center gap-3">
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20'>
              <Rocket size={16} className='text-primary stroke-current' />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className='text-xs font-bold tracking-tight text-foreground'>
                  جاهزية منصة لوناليزا للإطلاق الإنتاجي
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${badgeBgColor}`}>
                  {score}% مكتمل
                </span>
              </div>
              <p className='mt-0.5 text-[11px] text-muted-foreground'>
                {audit.readyModulesCount} من أصل {audit.totalModulesCount} قسماً مكتمل وجاهز للعمليات الميدانية
              </p>
            </div>
          </div>

          {/* Middle Section: Progress Bar */}
          <div className="hidden md:flex flex-1 max-w-xs items-center gap-2">
            <div className='h-2 w-full overflow-hidden rounded-full bg-muted border border-border/60'>
              <div
                className={`h-full rounded-full bg-primary transition-all duration-700`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Left Section: Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className='inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs'
            >
              <Layers size={13} className='text-primary' />
              <span>تفاصيل الإعدادات ({audit.totalModulesCount || 18})</span>
            </button>

            <button
              type="button"
              onClick={batchSetupAll}
              className='inline-flex items-center gap-1.5 rounded-xl bg-primary hover:brightness-110 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer'
            >
              <Bot size={13} className='text-white stroke-white' />
              <span className="text-white">إعداد شامل بالوكيل</span>
            </button>

            <button
              type="button"
              onClick={() => setMinimized(true)}
              className='rounded-lg p-1.5 text-muted-foreground hover:bg-card/5 hover:text-foreground transition-colors'
              title="تصغير البانر"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* DETAILED MODAL: 18 MODULES BREAKDOWN */}
      {detailsOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-foreground/5 dark:bg-foreground/5 backdrop-blur-sm p-4 overflow-y-auto'>
          <div
            className='relative w-full max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-2xl text-right text-foreground'
            dir="rtl"
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border pb-4'>
              <div className="flex items-center gap-3">
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <Rocket size={22} className="text-primary stroke-current" />
                </div>
                <div>
                  <h3 className='text-base font-bold text-foreground'>
                    كشف تدقيق جاهزية المنصة الشامل (18 قسماً دون استثناء)
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    معدل الجاهزية العام: {score}% — يمكنك تحويل إعداد أي قسم فوراً للوكيل المشرف
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchAudit}
                  className='rounded-xl border border-border p-2 text-foreground hover:bg-muted transition-colors shadow-xs cursor-pointer'
                  title="تحديث الفحص"
                >
                  <RefreshCw size={16} className="text-foreground stroke-current" />
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className='rounded-xl border border-border p-2 text-foreground hover:bg-muted transition-colors shadow-xs cursor-pointer'
                  title="إغلاق"
                >
                  <X size={18} className="text-foreground stroke-current" />
                </button>
              </div>
            </div>

            {/* Batch setup banner inside modal */}
            <div className='my-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4'>
              <div className='flex items-center gap-2 text-xs font-semibold text-foreground'>
                <Sparkles size={16} className='text-primary' />
                <span>هل تريد إسناد إعداد كافة النواقص بالترتيب للمشرف الذكي للمنصة؟</span>
              </div>
              <button
                type="button"
                onClick={batchSetupAll}
                className='inline-flex items-center gap-1.5 rounded-xl bg-primary hover:brightness-110 px-4 py-2 text-xs font-black text-white shadow-md transition-all cursor-pointer'
              >
                <Bot size={15} className='text-white' />
                <span>إطلاق الإعداد الشامل التلقائي الآن</span>
              </button>
            </div>

            {/* 18 Modules Grid */}
            <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
              {audit.modules.map((m) => (
                <div
                  key={m.id}
                  className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border dark:border-border bg-card-2 dark:bg-background/60 p-3 hover:border-border dark:hover:border-border transition-all'
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {m.readinessPercent >= 90 ? (
                        <CheckCircle2 size={18} className='text-emerald-600 dark:text-secondary' />
                      ) : m.requiresApiKey ? (
                        <Key size={18} className='text-admin-btn-secondary-hover dark:text-secondary' />
                      ) : (
                        <AlertTriangle size={18} className="text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className='text-xs font-bold text-foreground dark:text-foreground'>{m.nameAr}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                            m.readinessPercent >= 90
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-primary/30 dark:text-muted-foreground dark:border-primary/40"
                              : m.requiresApiKey
                              ? "bg-admin-bg-subtle text-admin-btn-secondary-hover border border-admin-btn-secondary-border dark:bg-secondary/20 dark:text-secondary"
                              : "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-500/20 dark:text-orange-300"
                          }`}
                        >
                          {m.readinessPercent}%
                        </span>
                      </div>
                      <p className='mt-0.5 truncate text-[11px] text-muted-foreground dark:text-slate-300 font-medium'>{m.summaryAr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={m.configUrl}
                      onClick={() => setDetailsOpen(false)}
                      className='inline-flex items-center gap-1 rounded-lg border border-border dark:border-border bg-card dark:bg-card/5 px-2.5 py-1.5 text-[11px] font-medium text-foreground dark:text-muted-foreground hover:bg-card-2 dark:hover:text-foreground dark:hover:bg-card/10 shadow-sm transition-colors'
                    >
                      <span>صفحة الإعداد</span>
                      <ExternalLink size={11} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handoverToAgent(m.nameAr)}
                      className='inline-flex items-center gap-1 rounded-lg bg-admin-bg-subtle hover:bg-admin-bg-subtle text-admin-btn-primary-hover border border-border dark:bg-primary/30 dark:hover:bg-primary/50 dark:border-primary/40 dark:text-secondary px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer'
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
            <div className='mt-4 pt-3 border-t border-border dark:border-border flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground'>
              <span>يتم تحديث المؤشرات حياً عند إدخال أي مفتاح أو إكمال إعداد.</span>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className='rounded-xl bg-slate-200 hover:bg-slate-300 text-foreground dark:bg-card dark:hover:bg-slate-700 dark:text-foreground px-4 py-2 text-xs font-bold transition-colors cursor-pointer'
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
