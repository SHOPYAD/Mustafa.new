"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  RefreshCw,
  Cpu,
  Zap,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  Gift,
  Crown,
  Brain,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { AiAnalyticsSummary, AiConsumptionLog } from "@/lib/server/ai-consumption-tracker";
import { AdminSettingsPanel } from "@/components/admin/layout";

export default function AiConsumptionAnalyticsPanel() {
  const [summary, setSummary] = useState<AiAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"dual" | "gemini" | "openrouter">("dual");
  const [showLogs, setShowLogs] = useState(true);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/ai/analytics?limit=50");
      const data = await res.json();
      if (data.ok && data.summary) {
        setSummary(data.summary);
      }
    } catch {
      /* ignore fetch error */
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics();
    const interval = setInterval(() => {
      void fetchAnalytics();
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const formatTokens = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return "$0.00";
    if (amount < 0.01) return `$${amount.toFixed(4)}`;
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      });
    } catch {
      return isoString.slice(11, 19);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("ar-SA", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString.slice(0, 10);
    }
  };

  return (
    <AdminSettingsPanel
      span={12}
      title="لوحة تحليلات استهلاك الذكاء الاصطناعي والمصروفات المزدوجة (AI Telemetry & Token Ledger)"
      description="رصد فوري متزامن لتوكنز الإدخال والإخراج والاستدلال التفكيري، وتتبع دقيق للمصروفات بالدولار الأمريكي والحصة المجانية."
    >
      <div className="space-y-5">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">عرض التحليلات:</span>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("dual")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === "dual" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                المنظومة المزدوجة الشاملة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("gemini")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "gemini" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Cpu size={13} />
                وضع Gemini فقط
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("openrouter")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "openrouter" ? "bg-violet-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap size={13} />
                وضع OpenRouter فقط
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border">
              <span>إجمالي الإنفاق اليوم:</span>
              <strong className="text-foreground font-black text-sm">
                {formatCurrency(summary?.combinedTotalCostUsd || 0)}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition flex items-center justify-center shadow-xs"
              title="تحديث البيانات اللحظية"
              aria-label="تحديث البيانات"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-primary" : ""} />
            </button>
          </div>
        </div>

        {/* Dual Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Section 1: Google Gemini Telemetry */}
          {(activeTab === "dual" || activeTab === "gemini") && (
            <div className="p-4 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.04] to-background space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">إحصائيات واستهلاك وضع Google Gemini</h4>
                    <span className="text-[11px] text-muted-foreground">Google AI Studio 2026 Engine</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  حصة مجانية + وضع مدفوع
                </span>
              </div>

              {/* Free Quota Bar Card */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Gift size={13} className="text-emerald-600" />
                    الحصة المجانية اليوم (Free Quota)
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {summary?.gemini.freeRequestsToday || 0} / 1,500 طلب ({summary?.gemini.freeRequestsPct || 0}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (summary?.gemini.freeRequestsPct || 0) > 85
                        ? "bg-rose-500"
                        : (summary?.gemini.freeRequestsPct || 0) > 60
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, summary?.gemini.freeRequestsPct || 0))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>التكلفة: $0.00 USD (مجاني 100%)</span>
                  <span>الحد الأقصى: 15 طلب/دقيقة</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">المنفق المدفوع</span>
                  <strong className="text-xs font-black text-foreground">
                    {formatCurrency(summary?.gemini.paidCostTodayUsd || 0)}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">توكنز الإدخال</span>
                  <strong className="text-xs font-black text-foreground">
                    {formatTokens(summary?.gemini.promptTokensToday || 0)}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">توكنز الإخراج</span>
                  <strong className="text-xs font-black text-foreground">
                    {formatTokens(summary?.gemini.completionTokensToday || 0)}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
                  <span className="text-[10px] text-purple-700 font-bold block mb-0.5 flex items-center gap-1">
                    <Brain size={10} />
                    توكنز التفكير
                  </span>
                  <strong className="text-xs font-black text-purple-900">
                    {formatTokens(summary?.gemini.thinkingTokensToday || 0)}
                  </strong>
                </div>
              </div>

              {/* Gemini Models Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-foreground block">
                  الاستهلاك حسب النموذج (اليوم):
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pe-1">
                  {summary && Object.keys(summary.gemini.byModel).length > 0 ? (
                    (Object.entries(summary.gemini.byModel) as [string, { requests: number; tokens: number; costUsd: number }][]).map(([mId, data]) => (
                      <div
                        key={mId}
                        className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs"
                      >
                        <span className="font-mono text-[11px] text-foreground truncate max-w-[180px]">
                          {mId}
                        </span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-muted-foreground">{data.requests} طلب</span>
                          <span className="text-muted-foreground">{formatTokens(data.tokens)} توكن</span>
                          <span className="font-bold text-foreground">{formatCurrency(data.costUsd)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 text-[11px] text-muted-foreground bg-muted/20 rounded-lg">
                      لم تسجل طلبات لـ Gemini بعد هذا اليوم.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: OpenRouter Engine Telemetry */}
          {(activeTab === "dual" || activeTab === "openrouter") && (
            <div className="p-4 rounded-2xl border border-violet-200/80 bg-gradient-to-b from-violet-50/40 to-background space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">إحصائيات واستهلاك وضع OpenRouter Engine</h4>
                    <span className="text-[11px] text-muted-foreground">Multi-Provider Router</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                  شامل النماذج العالمية
                </span>
              </div>

              {/* Financial Spend Card */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <DollarSign size={13} className="text-violet-600" />
                    إجمالي المنفق على OpenRouter اليوم
                  </span>
                  <span className="font-mono font-bold text-violet-700 text-sm">
                    {formatCurrency(summary?.openrouter.costTodayUsd || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                  <span>إجمالي الطلبات المنفذة: {summary?.openrouter.requestsToday || 0} طلب</span>
                  <span>التحويل التلقائي للطوارئ: مفعّل</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">عدد الطلبات</span>
                  <strong className="text-xs font-black text-foreground">
                    {summary?.openrouter.requestsToday || 0}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">توكنز الإدخال</span>
                  <strong className="text-xs font-black text-foreground">
                    {formatTokens(summary?.openrouter.promptTokensToday || 0)}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">توكنز الإخراج</span>
                  <strong className="text-xs font-black text-foreground">
                    {formatTokens(summary?.openrouter.completionTokensToday || 0)}
                  </strong>
                </div>
              </div>

              {/* OpenRouter Models Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-foreground block">
                  الاستهلاك حسب النموذج (اليوم):
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pe-1">
                  {summary && Object.keys(summary.openrouter.byModel).length > 0 ? (
                    (Object.entries(summary.openrouter.byModel) as [string, { requests: number; tokens: number; costUsd: number }][]).map(([mId, data]) => (
                      <div
                        key={mId}
                        className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs"
                      >
                        <span className="font-mono text-[11px] text-foreground truncate max-w-[180px]">
                          {mId}
                        </span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-muted-foreground">{data.requests} طلب</span>
                          <span className="text-muted-foreground">{formatTokens(data.tokens)} توكن</span>
                          <span className="font-bold text-foreground">{formatCurrency(data.costUsd)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 text-[11px] text-muted-foreground bg-muted/20 rounded-lg">
                      لم تسجل طلبات لـ OpenRouter بعد هذا اليوم.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Granular Time-Series Audit Table */}
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <h4 className="text-xs font-bold text-foreground">
                سجل الاستهلاك الزمني الحي (Time-Series Audit Ledger)
              </h4>
              <span className="text-[10px] text-muted-foreground">
                ({summary?.recentLogs.length || 0} عملية مسجلة)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
            >
              {showLogs ? "إخفاء السجل" : "إظهار السجل"}
              {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showLogs && (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[11px] font-semibold text-start">
                    <th className="py-2 px-2.5 text-start">الوقت والتاريخ</th>
                    <th className="py-2 px-2.5 text-start">المزود والمسار</th>
                    <th className="py-2 px-2.5 text-start">الوكيل المعني</th>
                    <th className="py-2 px-2.5 text-start">النموذج</th>
                    <th className="py-2 px-2.5 text-start">أنماط التفكير</th>
                    <th className="py-2 px-2.5 text-start">التوكنز (In/Out/Think)</th>
                    <th className="py-2 px-2.5 text-start">التكلفة ($)</th>
                    <th className="py-2 px-2.5 text-start">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {summary && summary.recentLogs.length > 0 ? (
                    summary.recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                        {/* Time & Date */}
                        <td className="py-2 px-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatTime(log.timestamp)}
                          <span className="text-[10px] block opacity-75">{formatDate(log.timestamp)}</span>
                        </td>

                        {/* Provider & Lane */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.provider === "gemini"
                                ? log.lane === "free"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                                : "bg-violet-100 text-violet-800"
                            }`}
                          >
                            {log.provider === "gemini"
                              ? log.lane === "free"
                                ? "Gemini مجاني"
                                : "Gemini مدفوع"
                              : "OpenRouter"}
                          </span>
                        </td>

                        {/* Agent Role */}
                        <td className="py-2 px-2.5 font-semibold text-foreground whitespace-nowrap">
                          {log.agentRole === "supervisor"
                            ? "المشرف العام"
                            : log.agentRole === "sales"
                            ? "المبيعات"
                            : log.agentRole === "planner_concierge"
                            ? "التخطيط السياحي"
                            : log.agentRole === "social"
                            ? "الناشر"
                            : log.agentRole === "app_concierge"
                            ? "مساعد التطبيق"
                            : log.agentRole === "b2b_landing"
                            ? "نمو الشركات"
                            : log.agentRole}
                        </td>

                        {/* Model */}
                        <td className="py-2 px-2.5 font-mono text-[11px] text-foreground truncate max-w-[160px]">
                          {log.modelId}
                        </td>

                        {/* Reasoning Mode */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {log.reasoningMode && log.reasoningMode !== "off" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                              <Brain size={10} />
                              {log.reasoningMode === "high"
                                ? "عالي"
                                : log.reasoningMode === "medium"
                                ? "متوسط"
                                : "منخفض"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Tokens */}
                        <td className="py-2 px-2.5 font-mono text-[11px] whitespace-nowrap">
                          <span>{formatTokens(log.promptTokens)}</span>
                          <span className="text-muted-foreground mx-1">/</span>
                          <span>{formatTokens(log.completionTokens)}</span>
                          {log.thinkingTokens > 0 && (
                            <span className="text-purple-600 font-bold ms-1" title="توكنز تفكير">
                              (+{formatTokens(log.thinkingTokens)})
                            </span>
                          )}
                        </td>

                        {/* Cost */}
                        <td className="py-2 px-2.5 font-mono font-bold text-foreground whitespace-nowrap">
                          {formatCurrency(log.costUsd)}
                        </td>

                        {/* Status */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {log.status === "success" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 size={12} />
                              ناجح
                            </span>
                          ) : log.status === "quota_exhausted" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                              <AlertCircle size={12} />
                              تجاوز حصة
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                              <XCircle size={12} />
                              فشل
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-xs text-muted-foreground">
                        {loading
                          ? "جارٍ تحميل سجل العمليات..."
                          : "لم تُسجل أي عمليات استهلاك بعد. ستظهر هنا فور إطلاق أول طلب ذكاء اصطناعي."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminSettingsPanel>
  );
}
