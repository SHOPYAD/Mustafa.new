"use client";

import React, { useState } from "react";
import {
  X,
  Zap,
  ShieldCheck,
  Cpu,
  Database,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Code2,
  Terminal,
} from "lucide-react";
import { useSecondBrainStore } from "../store/useSecondBrainStore";

export default function NodeInspectorDrawer() {
  const {
    inspectorOpen,
    closeInspector,
    getSelectedSubModule,
    getSelectedCluster,
    executionMode,
    setExecutionMode,
    executeDirective,
    isExecuting,
    lastExecutionResult,
  } = useSecondBrainStore();

  const sub = getSelectedSubModule();
  const cluster = getSelectedCluster();

  const [activeTab, setActiveTab] = useState<"actions" | "schema" | "dag">("actions");
  const [customPayloadJson, setCustomPayloadJson] = useState<string>("");

  const [payloadError, setPayloadError] = useState<string | null>(null);

  if (!inspectorOpen || !sub) return null;

  const agent = sub.assignedAgent;
  const lineage = sub.lineage;

  const handleRunDirective = async (directiveId: string) => {
    setPayloadError(null);
    let payload: Record<string, unknown> = {};
    if (customPayloadJson.trim()) {
      try {
        const parsed: unknown = JSON.parse(customPayloadJson);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid payload");
        payload = parsed as Record<string, unknown>;
      } catch {
        setPayloadError("صحح JSON أولاً؛ لم يتم إرسال الإجراء.");
        return;
      }
    }
    await executeDirective(directiveId, sub.id, payload);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[520px] bg-[#020b18]/98 border-r border-cyan-500/30 backdrop-blur-2xl z-50 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.8)] font-sans text-slate-100 select-none animate-in slide-in-from-right duration-300"
    >
      {payloadError && <p role="alert" className="p-3 text-destructive">{payloadError}</p>}
      {/* 1. Header Bar */}
      <div className="p-4 border-b border-cyan-500/20 bg-[#031124] flex items-center justify-between gap-3">
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span>لوحة الفحص والتكليف الإداري السيادي</span>
          </div>
          <h2 className="text-base font-black text-white mt-0.5 flex items-center gap-2">
            <span>{sub.nameAr}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {sub.slug}
            </span>
          </h2>
        </div>

        <button
          type="button"
          onClick={closeInspector}
          className="size-8 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Lineage Breadcrumbs (الجد -> الأب -> الابن -> الحفيد) */}
      <div className="px-4 py-2 bg-[#010813] border-b border-slate-800 text-[11px] font-mono flex items-center gap-1.5 overflow-x-auto text-slate-400">
        <span className="text-cyan-400 font-bold">السلالة:</span>
        <span className="text-slate-300">{lineage.grandparent}</span>
        <span className="text-slate-600">/</span>
        <span className="text-cyan-300 font-semibold">{lineage.parent}</span>
        <span className="text-slate-600">/</span>
        <span className="text-amber-300 font-black">{lineage.child}</span>
      </div>

      {/* 3. Assigned Swarm Agent Banner */}
      <div className="p-4 bg-gradient-to-r from-[#041a38] to-[#020b18] border-b border-cyan-500/20 flex items-start gap-3">
        <div className="size-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <Cpu size={22} className="text-cyan-300" />
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-white">{agent.nameAr}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              وكيل نشط وجاهز
            </span>
          </div>
          <p className="text-[10px] text-cyan-200/80 font-mono mt-0.5">
            {agent.roleAr} ({agent.id})
          </p>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-[#010712]/60 p-2 rounded-xl border border-slate-800/80">
            «{agent.primaryDirectiveAr}»
          </p>
        </div>
      </div>

      {/* 4. Live Telemetry Metric Strip */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-[#010712] border-b border-slate-800 text-center font-mono text-[10px]">
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block">معدل الطلبات</span>
          <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{sub.throughputRps} rps</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block">زمن الاستجابة</span>
          <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{sub.avgLatencyMs} ms</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block">نسبة الخطأ</span>
          <span className="text-sm font-bold text-amber-400 mt-0.5 block">{sub.errorRatePercent}%</span>
        </div>
      </div>

      {/* 5. Tab Navigation: Actions vs Schema vs DAG */}
      <div className="flex items-center gap-1 p-2 bg-[#020b18] border-b border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("actions")}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === "actions"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          المهام والتكليف الإداري
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("schema")}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === "schema"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          مخطط الـ JSON والـ API
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dag")}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            activeTab === "dag"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          مسار الكود DAG
        </button>
      </div>

      {/* 6. Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: EXECUTIVE ACTIONS & DIRECTIVES */}
        {activeTab === "actions" && (
          <div className="space-y-4">
            {/* Mode Selector */}
            <div className="p-3 rounded-2xl bg-[#031124] border border-cyan-500/20 flex items-center justify-between gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-white block">وضع التشغيل الإداري</span>
                <span className="text-[10px] text-slate-400">
                  {executionMode === "live"
                    ? "تنفيذ فوري ذو أثر جانبي في الباك إند وقواعد البيانات"
                    : "محاكاة وقائية واختبار قيود المدخلات دون تعديل فعلي"}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#010813] p-1 rounded-xl border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setExecutionMode("live")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    executionMode === "live"
                      ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap size={11} />
                  <span>حي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExecutionMode("dry_run")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    executionMode === "dry_run"
                      ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>محاكاة</span>
                </button>
              </div>
            </div>

            {/* List of Directives */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-cyan-300 block text-right">
                المهام الميدانية القابلة للإسناد والتنفيذ:
              </span>
              {sub.executableDirectives.map((dir) => (
                <div
                  key={dir.id}
                  className="p-3.5 rounded-2xl bg-[#020b18] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{dir.titleAr}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        dir.impactLevel === "critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : dir.impactLevel === "high"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      }`}
                    >
                      أثر {dir.impactLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                    <span>الأداة: {dir.toolKey}</span>
                    <button
                      type="button"
                      disabled={isExecuting}
                      onClick={() => handleRunDirective(dir.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-md ${
                        executionMode === "live"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-emerald-500/30"
                          : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-amber-500/30"
                      }`}
                    >
                      {isExecuting ? (
                        <span className="animate-spin size-3 border-2 border-black border-t-transparent rounded-full" />
                      ) : (
                        <Play size={11} className="fill-black" />
                      )}
                      <span>
                        {executionMode === "live" ? "إسناد وتنفيذ حي" : "محاكاة وقائية"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Execution Result Banner */}
            {lastExecutionResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed text-right animate-in fade-in duration-300 ${
                  lastExecutionResult.success
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                    : "bg-rose-950/40 border-rose-500/50 text-rose-200"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="font-bold">سجل نتيجة التكليف: {lastExecutionResult.titleAr}</span>
                  </div>
                  <span className="text-slate-400">{lastExecutionResult.timestamp}</span>
                </div>
                <p className="mt-1">{lastExecutionResult.summaryAr}</p>
                {lastExecutionResult.directUrl && (
                  <a
                    href={lastExecutionResult.directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-cyan-300 underline mt-2"
                  >
                    <span>فتح السجل أو الرابط المباشر</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE JSON SCHEMA & API ROUTE */}
        {activeTab === "schema" && (
          <div className="space-y-3 font-mono text-xs text-right">
            <div className="p-3 rounded-2xl bg-[#031124] border border-cyan-500/20">
              <span className="text-[10px] text-slate-400 block">نقطة النهاية للباك إند (Backend Route):</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                  {sub.httpMethod}
                </span>
                <span className="text-xs text-white font-mono select-all">{sub.apiEndpoint}</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                <span>جدول قاعدة البيانات: </span>
                <span className="text-amber-300 font-bold">{sub.databaseTable}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-300 block mb-1">
                حمولة البيانات الحية (Live Payload Schema):
              </span>
              <pre className="p-3 rounded-2xl bg-[#010712] border border-slate-800 text-[10px] text-cyan-300 overflow-x-auto text-left leading-relaxed">
                {JSON.stringify(sub.samplePayload, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: CODE FLOW DAG */}
        {activeTab === "dag" && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-cyan-300 block text-right">
              خط الإنتاج البرمجي وتدفق البيانات الفعلي:
            </span>
            <div className="space-y-2">
              {sub.dagFlow.map((node, index) => (
                <div
                  key={node.id}
                  className="p-3 rounded-2xl bg-[#031124] border border-slate-800 flex items-center justify-between gap-3 text-right"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">{node.labelAr}</span>
                      <span className="text-[10px] font-mono text-slate-400">{node.detail}</span>
                    </div>
                  </div>
                  <div className="text-left font-mono text-[10px]">
                    <span className="text-emerald-400 font-bold block">{node.latencyMs} ms</span>
                    <span className="text-slate-500 capitalize">{node.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
