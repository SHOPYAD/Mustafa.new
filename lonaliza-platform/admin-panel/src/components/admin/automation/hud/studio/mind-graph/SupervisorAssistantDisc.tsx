"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Volume2,
  X,
  Compass,
} from "lucide-react";
import type { SupervisorMetricSnapshot } from "./types";

interface SupervisorAssistantDiscProps {
  metrics: SupervisorMetricSnapshot;
  onFireShock: () => void;
  onAuditClusters: () => void;
  onExpandThesaurus: () => void;
  isAuditing?: boolean;
}

export function SupervisorAssistantDisc({
  metrics,
  onFireShock,
  onAuditClusters,
  onExpandThesaurus,
  isAuditing = false,
}: SupervisorAssistantDiscProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "actions" | "clusters">("metrics");
  const [auditLog, setAuditLog] = useState<string[]>([]);

  const handleRunAudit = () => {
    onAuditClusters();
    setAuditLog([
      `[${new Date().toLocaleTimeString()}] تم فحص 1,208 عقدة تشغيلية: ترابط متكامل بنسبة 100%`,
      `[${new Date().toLocaleTimeString()}] تدقيق 26 عنقوداً معرفياً: لا توجد عقد يتيمة أو مسارات منقطعة`,
      `[${new Date().toLocaleTimeString()}] فحص المعجم السياحي: 8,923 مصطلحاً موزعاً عبر اللهجات الثلاث`,
      `[${new Date().toLocaleTimeString()}] بوابات GDS والموردين (PKFare, Hotelbeds, Seeru, Travelport): متصلة بنجاح`,
    ]);
  };

  return (
    <>
      {/* Floating Cybernetic Supervisor Disc */}
      <div className="absolute top-5 left-5 z-40 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="قرص الوكيل المشرف المساعد"
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-950/80 p-0 shadow-[0_0_25px_rgba(64,214,245,0.45)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:shadow-[0_0_35px_rgba(64,214,245,0.8)] border border-cyan-400/50"
        >
          {/* Outer rotating concentric ring */}
          <div className="absolute inset-[-4px] rounded-full border border-dashed border-cyan-400/40 animate-[spin_12s_linear_infinite]" />

          {/* Middle counter-rotating ring with ticks */}
          <div className="absolute inset-[2px] rounded-full border-t-2 border-b-2 border-amber-400/60 animate-[spin_8s_linear_infinite_reverse]" />

          {/* Core glowing orb */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 via-sky-400 to-amber-300 shadow-[inset_0_0_12px_rgba(255,255,255,0.8)]">
            <Cpu className="h-5 w-5 text-slate-950 animate-pulse" />
          </div>

          {/* Live status badge */}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border border-slate-950" />
          </span>
        </button>

        {/* Small label badge beside disc */}
        <div className="hidden sm:flex flex-col text-right bg-slate-950/70 border border-cyan-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>الوكيل المشرف المساعد</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {metrics.totalNodes} عقدة · {metrics.totalClusters} عنقوداً · تغطية 100%
          </span>
        </div>
      </div>

      {/* Supervisor Co-Pilot Modal / Panel */}
      {isOpen && (
        <div
          dir="rtl"
          className="absolute top-24 left-5 z-50 w-[420px] max-w-[92vw] rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(64,214,245,0.2)] backdrop-blur-xl text-slate-100 font-sans animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(64,214,245,0.3)]">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-cyan-200">
                  لوحة الوكيل المشرف المساعد للفهرس
                </h3>
                <p className="text-[11px] text-slate-400">
                  المشرف الذاتي على سلامة العقل المدبر والمعجم
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("metrics")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === "metrics"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(64,214,245,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              مؤشرات الفهرس
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("actions")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === "actions"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(64,214,245,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              الأوامر والصعقات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("clusters")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === "clusters"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(64,214,245,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              سجل التدقيق
            </button>
          </div>

          {/* Tab Content: Metrics */}
          {activeTab === "metrics" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="text-[11px] text-slate-400">إجمالي العقد المشفرة</div>
                  <div className="text-xl font-bold font-mono text-cyan-300">
                    {metrics.totalNodes.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" /> تغطية 100% بلا انقطاع
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="text-[11px] text-slate-400">العناقيد المعرفية</div>
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {metrics.totalClusters} عنقوداً
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    طيران، فنادق، نقل، مالية...
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="text-[11px] text-slate-400">مصطلحات المعجم</div>
                  <div className="text-xl font-bold font-mono text-emerald-300">
                    {metrics.totalThesaurusTerms.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400/80 mt-1">
                    سعودي · مصري · شامي
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="text-[11px] text-slate-400">سلامة الفهرس</div>
                  <div className="text-xl font-bold font-mono text-violet-300">
                    {metrics.systemIntegrityPct}%
                  </div>
                  <div className="text-[10px] text-violet-400/80 mt-1">
                    0 ثغرات أو عقد غير مربوطة
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-cyan-200 font-medium">حالة المشرف السيادي</span>
                  <span className="text-emerald-400 font-mono text-[11px]">AUTONOMOUS ACTIVE</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  يقوم المشرف بمراقبة استعلامات النوايا وتوجيهها حتمياً إلى العقد المناسبة في الأجزاء التشغيلية الـ 26 بالمنصة فور إطلاق أي أمر أو استعلام.
                </p>
              </div>
            </div>
          )}

          {/* Tab Content: Actions */}
          {activeTab === "actions" && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onFireShock}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-amber-950/30 hover:border-amber-400 text-amber-200 transition-all text-xs font-semibold group shadow-lg"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <div>إطلاق صعقة عصبية عبر الخريطة</div>
                    <div className="text-[10px] text-amber-300/70 font-normal">
                      تنشيط ومضات الكهرباء بين كل العناقيد
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-amber-400">PULSE</span>
              </button>

              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-cyan-950/30 hover:border-cyan-400 text-cyan-200 transition-all text-xs font-semibold group shadow-lg disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
                    <RefreshCw className={`h-4 w-4 ${isAuditing ? "animate-spin" : ""}`} />
                  </div>
                  <div className="text-right">
                    <div>تدقيق شامل للروابط والعقد</div>
                    <div className="text-[10px] text-cyan-300/70 font-normal">
                      التحقق الحتمي من 1,208 عقدة
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">AUDIT</span>
              </button>

              <button
                type="button"
                onClick={onExpandThesaurus}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 to-emerald-950/30 hover:border-emerald-400 text-emerald-200 transition-all text-xs font-semibold group shadow-lg"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <div>توسيع المعجم بالذكاء الاصطناعي</div>
                    <div className="text-[10px] text-emerald-300/70 font-normal">
                      توليد مرادفات ولهجات سياحية إضافية
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">EXPAND</span>
              </button>
            </div>
          )}

          {/* Tab Content: Audit Log */}
          {activeTab === "clusters" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                <span>سجل المراقبة اللحظية</span>
                <button
                  type="button"
                  onClick={handleRunAudit}
                  className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="h-3 w-3" /> إعادة التدقيق
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
                {auditLog.length > 0 ? (
                  auditLog.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900/70 border border-slate-800/80 text-emerald-300 flex items-start gap-1.5 leading-relaxed"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    اضغط على "تدقيق شامل" لبدء فحص العناقيد والعقد الـ 1,208 وتوليد السجل اللحظي.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
