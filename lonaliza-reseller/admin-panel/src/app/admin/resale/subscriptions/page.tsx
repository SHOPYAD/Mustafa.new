"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Server,
  RefreshCw,
  Search,
  Trash2,
  Ban,
  Play,
  Globe,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Check,
} from "lucide-react";
import type { ResellerCompany } from "@/lib/server/resale-store";
import type { B2BWalletSummary } from "@/lib/server/reseller-whitelabel-store";
import { AdminPage } from "@/components/admin/layout";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";

type EnrichedCompany = ResellerCompany & {
  wallet?: B2BWalletSummary;
};

export default function ResaleSubscriptionsPage() {
  const [companies, setCompanies] = useState<EnrichedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Plan Modal State
  const [editPlanCompany, setEditPlanCompany] = useState<EnrichedCompany | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<"ownership" | "whitelabel_paid" | "whitelabel_free">("ownership");

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resale/subscriptions", { cache: "no-store" });
      const json = await res.json();
      if (json?.ok && json.companies) {
        setCompanies(json.companies);
      }
    } catch {
      setMessage({ type: "error", text: "فشل تحميل بيانات اشتراكات الشركاء" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubscriptions();
  }, []);

  const handleAction = async (
    companyId: string,
    action: "toggle_updates" | "suspend" | "resume" | "cancel" | "delete" | "change_plan",
    extra?: Record<string, unknown>
  ) => {
    if (action === "delete") {
      const ok = window.confirm("هل أنت متأكد من حذف هذا الشريك وبياناته نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.");
      if (!ok) return;
    }

    try {
      setActionLoading(`${action}-${companyId}`);
      setMessage(null);

      const res = await fetch("/api/admin/resale/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          companyId,
          ...extra,
        }),
      });

      const json = await res.json();
      if (json?.ok) {
        setMessage({ type: "success", text: json.message || "تم تنفيذ العملية بنجاح" });
        setTimeout(() => setMessage(null), 4000);
        await loadSubscriptions();
        if (action === "change_plan") setEditPlanCompany(null);
      } else {
        setMessage({ type: "error", text: json.error || "فشل تنفيذ العملية" });
      }
    } catch {
      setMessage({ type: "error", text: "حدث خطأ غير متوقع أثناء معالجة الطلب" });
    } finally {
      setActionLoading(null);
    }
  };

  const totalPartners = companies.length;
  const activeCount = companies.filter((c) => c.status === "active" || c.status === "approved").length;
  const ownershipCount = companies.filter((c) => !c.planType || c.planType === "ownership").length;
  const paidWlCount = companies.filter((c) => c.planType === "whitelabel_paid").length;
  const freeWlCount = companies.filter((c) => c.planType === "whitelabel_free").length;
  const updatesSubscribersCount = companies.filter((c) => c.updateSubscriptionActive).length;

  const filtered = companies.filter((c) => {
    const plan = c.planType || "ownership";
    const status = c.status || "active";
    if (planFilter !== "all" && plan !== planFilter) return false;
    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.companyName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.customDomain?.toLowerCase().includes(q) ||
        c.requestedDomain?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <AdminPage className="space-y-6 w-full min-w-0" dir="rtl">
      <EnterprisePageHeader
        icon={CreditCard}
        title="إدارة اشتراكات الشركاء والفوترة والتحديثات"
        description="متابعة باقات الشركاء (تملك دائم، علامة بيضاء احترافية ومجانية)، إدارة اشتراكات التحديثات ($50/شهر)، التوقيف، الإلغاء، والحذف."
        badge="Enterprise Billing"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/resale/whitelabel"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 transition-all shadow-sm"
            >
              إعدادات وهوامش الوايت ليبل
            </Link>
            <button
              type="button"
              onClick={() => void loadSubscriptions()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 transition-all shadow-sm"
            >
              <RefreshCw className="size-3.5" />
              <span>تحديث القائمة</span>
            </button>
          </div>
        }
      />

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 backdrop-blur-xl transition-all shadow-lg ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <EnterpriseKpiGrid columns={5}>
        <EnterpriseKpiCard
          label="إجمالي الشركاء"
          value={totalPartners}
          helperText={`${activeCount} شريك نشط`}
          icon={Building2}
          color="violet"
        />
        <EnterpriseKpiCard
          label="باقة التملك الدائم"
          value={ownershipCount}
          helperText="سيرفر VPS مستقل"
          icon={Server}
          color="amber"
        />
        <EnterpriseKpiCard
          label="وايت ليبل محترف"
          value={paidWlCount}
          helperText="$199 / شهرياً"
          icon={Sparkles}
          color="emerald"
        />
        <EnterpriseKpiCard
          label="وايت ليبل مجاني"
          value={freeWlCount}
          helperText="توزيع سحابي $0"
          icon={Globe}
          color="blue"
        />
        <EnterpriseKpiCard
          label="مشتركو التحديث والدعم"
          value={updatesSubscribersCount}
          helperText="$50 / شهرياً للسيرفر"
          icon={Zap}
          color="rose"
        />
      </EnterpriseKpiGrid>

      {/* Filter Bar */}
      <EnterpriseFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث باسم الشركة، البريد، أو الدومين..."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">الباقة:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border/60 text-xs font-semibold text-foreground bg-secondary/70 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="all">كافة الباقات</option>
              <option value="ownership">التملك الدائم</option>
              <option value="whitelabel_paid">العلامة البيضاء الاحترافية ($199)</option>
              <option value="whitelabel_free">العلامة البيضاء المجانية ($0)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border/60 text-xs font-semibold text-foreground bg-secondary/70 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="all">كافة الحالات</option>
              <option value="active">نشط (Active)</option>
              <option value="suspended">موقوف (Suspended)</option>
              <option value="cancelled">ملغى (Cancelled)</option>
            </select>
          </div>
        </div>
      </EnterpriseFilterBar>

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/20">
        {loading ? (
          <div className="p-16 text-center text-muted-foreground space-y-3">
            <Loader2 className="size-8 animate-spin mx-auto text-violet-500" />
            <p className="text-sm font-semibold">جاري تحميل سجلات الشركاء والفوترة...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground space-y-3">
            <Building2 className="size-10 mx-auto text-muted-foreground/40" />
            <p className="text-base font-bold text-foreground">لا يوجد شركاء مطابقين للبحث</p>
            <p className="text-xs">جرب تغيير شروط الفلترة أو مسح حقل البحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-bold">
                <tr>
                  <th className="py-3.5 px-4 text-start">الشركة والشريك</th>
                  <th className="py-3.5 px-4 text-start">نوع الباقة</th>
                  <th className="py-3.5 px-4 text-start">اشتراك التحديث والدعم ($50/شهر)</th>
                  <th className="py-3.5 px-4 text-start">المحفظة B2B</th>
                  <th className="py-3.5 px-4 text-start">حالة الحساب</th>
                  <th className="py-3.5 px-4 text-end">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((c) => {
                  const plan = c.planType || "ownership";
                  const isSuspended = c.status === "suspended" || c.subscriptionStatus === "suspended";
                  const updatesActive = c.updateSubscriptionActive;
                  const walletBalance = c.wallet?.availableBalance ?? (c.walletBalance || 0);
                  const isDepositGood = walletBalance >= 2000;

                  return (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      {/* Company Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{c.companyName}</span>
                            {c.customDomain && (
                              <a
                                href={`https://${c.customDomain}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-violet-400 hover:text-violet-300 hover:underline inline-flex items-center gap-1 font-mono"
                              >
                                <span>{c.customDomain}</span>
                                <ExternalLink className="size-2.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{c.email}</p>
                          {c.phone && <p className="text-[11px] text-muted-foreground/80">{c.phone}</p>}
                        </div>
                      </td>

                      {/* Plan Type */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {plan === "ownership" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                              <Server className="size-3 text-violet-400" />
                              <span>التملك الدائم الكامل</span>
                            </span>
                          )}
                          {plan === "whitelabel_paid" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              <Sparkles className="size-3 text-indigo-400" />
                              <span>وايت ليبل محترف ($199)</span>
                            </span>
                          )}
                          {plan === "whitelabel_free" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Globe className="size-3 text-amber-400" />
                              <span>وايت ليبل سحابي ($0)</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditPlanCompany(c);
                              setSelectedNewPlan(plan);
                            }}
                            className="text-[11px] text-muted-foreground hover:text-violet-400 hover:underline block cursor-pointer font-medium"
                          >
                            تعديل الباقة
                          </button>
                        </div>
                      </td>

                      {/* Updates Subscription Status */}
                      <td className="py-4 px-4">
                        {plan === "ownership" ? (
                          <div className="space-y-1.5">
                            {updatesActive ? (
                              <EnterpriseStatusBadge status="completed" label="مشترك ونشط ($50/شهر)" />
                            ) : (
                              <EnterpriseStatusBadge status="draft" label="غير مشترك" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleAction(c.id, "toggle_updates")}
                              disabled={actionLoading === `toggle_updates-${c.id}`}
                              className="text-[11px] text-violet-400 hover:text-violet-300 hover:underline block cursor-pointer font-medium"
                            >
                              {updatesActive ? "إيقاف اشتراك التحديث" : "تفعيل اشتراك التحديث"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            {plan === "whitelabel_paid" ? "مشمول في الاشتراك ($199)" : "سحابي مجاني"}
                          </span>
                        )}
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-sm text-foreground">
                            ${walletBalance.toLocaleString()}
                          </span>
                          <span
                            className={`block text-[10px] font-bold ${
                              isDepositGood ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            {isDepositGood ? "ديبوزيت كافٍ (نشط)" : "أقل من $2,000"}
                          </span>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4">
                        {isSuspended ? (
                          <EnterpriseStatusBadge status="cancelled" label="موقوف مؤقتاً" />
                        ) : (
                          <EnterpriseStatusBadge status="active" label="نشط" />
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleAction(c.id, "resume")}
                              disabled={actionLoading === `resume-${c.id}`}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                              title="إلغاء التوقيف وتفعيل الحساب"
                            >
                              <Play className="size-3 inline-block ms-1" />
                              <span>تفعيل</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAction(c.id, "suspend")}
                              disabled={actionLoading === `suspend-${c.id}`}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer"
                              title="إيقاف الحساب والعمليات مؤقتاً"
                            >
                              <Ban className="size-3 inline-block ms-1" />
                              <span>إيقاف</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAction(c.id, "delete")}
                            disabled={actionLoading === `delete-${c.id}`}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                            title="حذف الشريك نهائياً"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Plan Modal */}
      {editPlanCompany && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                تعديل باقة الشريك: {editPlanCompany.companyName}
              </h3>
              <p className="text-xs text-muted-foreground">
                اختر الباقة المناسبة للترقية أو التعديل الفوري.
              </p>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setSelectedNewPlan("ownership")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  selectedNewPlan === "ownership"
                    ? "bg-violet-500/15 border-violet-500 text-foreground font-bold shadow-md shadow-violet-500/10"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:border-border"
                }`}
              >
                <div>
                  <span className="text-xs font-bold block text-foreground">باقة التملك الدائم الكاملة ($1,990)</span>
                  <span className="text-[11px] text-muted-foreground">سيرفر VPS خاص، وصول Root، وجميع الموزعين</span>
                </div>
                <div className={`size-5 rounded-full border flex items-center justify-center ${selectedNewPlan === "ownership" ? "border-violet-500 bg-violet-600 text-white" : "border-border/60"}`}>
                  {selectedNewPlan === "ownership" && <Check className="size-3" />}
                </div>
              </label>

              <label
                onClick={() => setSelectedNewPlan("whitelabel_paid")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  selectedNewPlan === "whitelabel_paid"
                    ? "bg-violet-500/15 border-violet-500 text-foreground font-bold shadow-md shadow-violet-500/10"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:border-border"
                }`}
              >
                <div>
                  <span className="text-xs font-bold block text-foreground">العلامة البيضاء الاحترافية ($199/شهر)</span>
                  <span className="text-[11px] text-muted-foreground">جميع ميزات المنصة والبرامج الخاصة مفتوحة</span>
                </div>
                <div className={`size-5 rounded-full border flex items-center justify-center ${selectedNewPlan === "whitelabel_paid" ? "border-violet-500 bg-violet-600 text-white" : "border-border/60"}`}>
                  {selectedNewPlan === "whitelabel_paid" && <Check className="size-3" />}
                </div>
              </label>

              <label
                onClick={() => setSelectedNewPlan("whitelabel_free")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  selectedNewPlan === "whitelabel_free"
                    ? "bg-violet-500/15 border-violet-500 text-foreground font-bold shadow-md shadow-violet-500/10"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:border-border"
                }`}
              >
                <div>
                  <span className="text-xs font-bold block text-foreground">العلامة البيضاء المجانية ($0/شهر)</span>
                  <span className="text-[11px] text-muted-foreground">تغذية مركزية سحابية لطيران وفنادق لوناليزا</span>
                </div>
                <div className={`size-5 rounded-full border flex items-center justify-center ${selectedNewPlan === "whitelabel_free" ? "border-violet-500 bg-violet-600 text-white" : "border-border/60"}`}>
                  {selectedNewPlan === "whitelabel_free" && <Check className="size-3" />}
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setEditPlanCompany(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleAction(editPlanCompany.id, "change_plan", { newPlan: selectedNewPlan })}
                disabled={actionLoading !== null}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
              >
                حفظ التغيير
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
