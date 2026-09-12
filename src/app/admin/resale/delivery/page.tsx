"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
  Server,
  Truck,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ResellerCompany, ResellerCompanyProgress, ResellerStageTemplate } from "@/lib/server/resale-store";

export default function ResaleDeliveryPage() {
  const { t, dir } = useLocale();
  const [companies, setCompanies] = useState<ResellerCompany[]>([]);
  const [stages, setStages] = useState<ResellerStageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ResellerCompanyProgress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resale/companies", { cache: "no-store" });
      const json = (await res.json()) as { ok?: boolean; companies?: ResellerCompany[] };
      if (json?.ok && json.companies) {
        setCompanies(json.companies.filter((c) => c.status !== "registered"));
        if (json.companies.length > 0 && !selectedCompanyId) {
          const first = json.companies.find((c) => c.status !== "registered") || json.companies[0];
          setSelectedCompanyId(first.id);
        }
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) return;
    void (async () => {
      try {
        setLoadingProgress(true);
        const res = await fetch(`/api/admin/resale/companies?id=${selectedCompanyId}`, { cache: "no-store" });
        const json = (await res.json()) as { ok?: boolean; progress?: ResellerCompanyProgress[] };
        if (json?.ok && json.progress) {
          setProgress(json.progress);
        }
      } catch {
        /* non-blocking */
      } finally {
        setLoadingProgress(false);
      }
    })();
  }, [selectedCompanyId]);

  const toggleStageStatus = async (stageId: string, currentStatus: string) => {
    if (!selectedCompanyId) return;
    const nextStatus = currentStatus === "done" ? "pending" : "done";
    try {
      setUpdatingStage(stageId);
      const res = await fetch("/api/admin/resale/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_progress",
          companyId: selectedCompanyId,
          stageId,
          stageStatus: nextStatus,
        }),
      });
      const json = (await res.json()) as { ok?: boolean };
      if (json?.ok) {
        setProgress(
          progress.map((p) =>
            p.stage === stageId
              ? {
                  ...p,
                  status: nextStatus as ResellerCompanyProgress["status"],
                  completedAt: nextStatus === "done" ? new Date().toISOString() : undefined,
                }
              : p
          )
        );
      }
    } catch {
      /* error */
    } finally {
      setUpdatingStage(null);
    }
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Truck className="h-6 w-6 text-amber-500" />
            {t.admin.resaleDelivery}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            متابعة وإنجاز مراحل تسليم المواقع والسيرفرات للشركات السياحية (12–24 ساعة)
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>تحديث</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/60 p-12 text-center text-muted-foreground space-y-2">
          <Truck className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="font-semibold text-foreground">لا توجد طلبات تسليم قيد المعالجة</p>
          <p className="text-xs">عند قيام شركة بشراء الباقة، ستظهر في خط التسليم تلقائياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Selector Sidebar */}
          <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 pb-2 border-b border-border">
              الشركات في خط التسليم
            </h2>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
              {companies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`w-full text-right p-3 rounded-xl transition-all ${
                    selectedCompanyId === c.id
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-500"
                      : "hover:bg-secondary/60 text-foreground"
                  }`}
                >
                  <p className="font-semibold text-sm">{c.companyName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
                  {c.requestedDomain && (
                    <p className="text-[11px] font-mono text-muted-foreground mt-1 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {c.requestedDomain}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Timeline & Checklist */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6 space-y-6">
            {selectedCompany && (
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-500" />
                    {selectedCompany.companyName}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    البريد: {selectedCompany.email} • الدومين: {selectedCompany.requestedDomain || "لم يُحدد"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedCompany.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {selectedCompany.status === "active" ? "مفعل حي" : "قيد التجهيز"}
                </span>
              </div>
            )}

            {loadingProgress ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  اضغط على أي مرحلة لتحديدها كمكتملة / قيد التنفيذ. يرى العميل هذا التقدم فورياً في لوحته.
                </p>

                <div className="divide-y divide-border border border-border rounded-xl bg-background/50 overflow-hidden">
                  {progress.map((p, idx) => {
                    const isDone = p.status === "done";
                    const isUpdating = updatingStage === p.stage;
                    return (
                      <div
                        key={p.id}
                        onClick={() => void toggleStageStatus(p.stage, p.status)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                          isDone ? "bg-emerald-500/[0.03] hover:bg-emerald-500/[0.07]" : "hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                              isDone
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isDone ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isDone ? "text-emerald-500 line-through/0" : "text-foreground"
                              }`}
                            >
                              {p.stageInfo?.titleAr || `المرحلة ${idx + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {p.stageInfo?.titleEn}
                            </p>
                          </div>
                        </div>

                        <div className="text-left">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isDone
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {isDone ? "مكتمل" : "معلق"}
                          </span>
                          {p.completedAt && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(p.completedAt).toLocaleTimeString("ar-EG", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
