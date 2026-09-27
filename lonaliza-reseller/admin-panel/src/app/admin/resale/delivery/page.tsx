"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ResellerCompany, ResellerCompanyProgress, ResellerStageTemplate } from "@/lib/server/resale-store";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";

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
  const inDeliveryCount = companies.filter((c) => c.status === "provisioning" || c.status === "paid").length;
  const completedCount = companies.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-8" dir={dir}>
      <EnterprisePageHeader
        icon={Truck}
        title={t.admin?.resaleDelivery || "خط التسليم الآلي للمنصات (Deployment Pipeline)"}
        description="متابعة وإنجاز مراحل تسليم المواقع والسيرفرات المستقلة للشركات السياحية (12–24 ساعة)."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الموزعين", href: "/admin/resale" },
          { label: "خط التسليم" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/resale"
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-xs font-bold text-foreground backdrop-blur-md transition-all hover:bg-card hover:border-primary/40 active:scale-95"
            >
              <ArrowRight className="size-4" />
              منصة التوزيع
            </Link>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </div>
        }
      />

      <EnterpriseKpiGrid cols={3}>
        <EnterpriseKpiCard
          label="إجمالي الشركات في خط التسليم"
          value={companies.length}
          hint="الشركات المؤكدة والمدفوعة"
          icon={Truck}
          tone="royal"
        />
        <EnterpriseKpiCard
          label="قيد التجهيز والنشر حالياً"
          value={inDeliveryCount}
          hint="سيرفرات قيد الإعداد والربط"
          icon={Clock}
          tone="amber"
        />
        <EnterpriseKpiCard
          label="منصات تم تسليمها بنجاح"
          value={completedCount}
          hint="مفعلة وتعمل مباشرة على نطاقاتها"
          icon={ShieldCheck}
          tone="emerald"
        />
      </EnterpriseKpiGrid>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-3xl border border-border/50 bg-card/60 p-16 text-center text-muted-foreground space-y-3 backdrop-blur-xl">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="font-bold text-foreground text-base">لا توجد طلبات تسليم قيد المعالجة حالياً</p>
          <p className="text-xs max-w-sm mx-auto">عند قيام شركة بشراء الباقة، ستظهر في خط التسليم تلقائياً لمتابعة مراحل تجهيزها.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Selector Sidebar */}
          <div className="rounded-3xl border border-border/50 bg-card/60 p-5 space-y-3 backdrop-blur-xl shadow-lg">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-2 pb-2 border-b border-border/40">
              الشركات في خط التسليم ({companies.length})
            </h2>
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {companies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`w-full text-right p-3.5 rounded-2xl transition-all cursor-pointer border ${
                    selectedCompanyId === c.id
                      ? "bg-primary/20 border-primary/40 text-foreground shadow-md shadow-primary/10 scale-[1.02]"
                      : "bg-background/40 border-border/40 text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <p className="font-bold text-sm text-foreground">{c.companyName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.email}</p>
                  {c.requestedDomain && (
                    <p className="text-[11px] font-mono text-amber-400 mt-1 flex items-center gap-1.5 truncate">
                      <Globe className="h-3 w-3" />
                      {c.requestedDomain}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Timeline & Checklist */}
          <div className="lg:col-span-2 rounded-3xl border border-border/50 bg-card/60 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-lg">
            {selectedCompany && (
              <div className="flex items-center justify-between border-b border-border/40 pb-5">
                <div>
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    {selectedCompany.companyName}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    البريد: {selectedCompany.email} • النطاق: {selectedCompany.requestedDomain || "لم يُحدد بعد"}
                  </p>
                </div>
                <EnterpriseStatusBadge
                  status={selectedCompany.status === "active" ? "active" : "pending"}
                  label={selectedCompany.status === "active" ? "مفعل حي" : "قيد التجهيز"}
                />
              </div>
            )}

            {loadingProgress ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-medium">
                  اضغط على أي مرحلة لتحديدها كمكتملة أو قيد التنفيذ. يرى العميل هذا التحديث لحظياً في لوحة التحكم الخاصة به.
                </p>

                <div className="divide-y divide-border/40 border border-border/50 rounded-2xl bg-background/50 overflow-hidden">
                  {progress.map((p, idx) => {
                    const isDone = p.status === "done";
                    const isUpdating = updatingStage === p.stage;
                    return (
                      <div
                        key={p.id}
                        onClick={() => void toggleStageStatus(p.stage, p.status)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                          isDone
                            ? "bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]"
                            : "hover:bg-card/70"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black transition-all ${
                              isDone
                                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                                : "bg-card border border-border/70 text-muted-foreground"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isDone ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                isDone ? "text-emerald-400" : "text-foreground"
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
                          <EnterpriseStatusBadge
                            status={isDone ? "active" : "draft"}
                            label={isDone ? "مكتمل" : "معلق"}
                            size="sm"
                          />
                          {p.completedAt && (
                            <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
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
