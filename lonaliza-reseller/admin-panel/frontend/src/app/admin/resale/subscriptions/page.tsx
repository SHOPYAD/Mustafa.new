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
  Sliders,
  MoreHorizontal,
  Trash2,
  Ban,
  Play,
  Layers,
  Award,
  Globe,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Check,
} from "lucide-react";
import type { ResellerCompany } from "@/lib/server/resale-store";
import type { B2BWalletSummary } from "@/lib/server/reseller-whitelabel-store";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";

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
      setMessage({ type: "error", text: "حدث خطأ غير متوقع أثناء المعالجة" });
    } finally {
      setActionLoading(null);
    }
  };

  // Metrics
  const totalPartners = companies.length;
  const ownershipCount = companies.filter((c) => (c.planType || "ownership") === "ownership").length;
  const paidWlCount = companies.filter((c) => c.planType === "whitelabel_paid").length;
  const freeWlCount = companies.filter((c) => c.planType === "whitelabel_free").length;
  const updatesSubscribersCount = companies.filter((c) => c.updateSubscriptionActive).length;
  const activeCount = companies.filter((c) => (c.subscriptionStatus || "active") === "active" && c.status !== "suspended").length;

  const filtered = companies.filter((c) => {
    const plan = c.planType || "ownership";
    const status = c.subscriptionStatus || "active";
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
    <AdminPage className="space-y-8" dir="rtl">
      <AdminPageHeader
        icon={<CreditCard className="size-5" />}
        title="إدارة اشتراكات الشركاء والفوترة والتحديثات"
        description="متابعة باقات الشركاء (تملك دائم، علامة بيضاء احترافية ومجانية)، إدارة اشتراكات التحديثات ($50/شهر)، التوقيف، الإلغاء، والحذف."
        actions={
          <>
            <Link href="/admin/resale/whitelabel" className="admin-btn-secondary">
              إعدادات وهوامش الوايت ليبل
            </Link>
            <button type="button" onClick={() => void loadSubscriptions()} className="admin-btn-secondary">
              <RefreshCw className="size-3.5" />
              تحديث القائمة
            </button>
          </>
        }
      />

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">إجمالي الشركاء</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalPartners}</span>
          <span className="text-[10px] text-emerald-600 font-bold block">{activeCount} شريك نشط</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">باقة التملك الدائم</span>
          <span className="text-2xl font-black text-purple-900 font-mono">{ownershipCount}</span>
          <span className="text-[10px] text-purple-700 font-bold block">سيرفر VPS مستقل</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">وايت ليبل محترف ($199)</span>
          <span className="text-2xl font-black text-purple-900 font-mono">{paidWlCount}</span>
          <span className="text-[10px] text-purple-600 font-bold block">اشتراك شهري مرن</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">وايت ليبل مجاني ($0)</span>
          <span className="text-2xl font-black text-amber-700 font-mono">{freeWlCount}</span>
          <span className="text-[10px] text-amber-600 font-bold block">توزيع سحابي</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-purple-200 block">مشتركو التحديث والدعم</span>
          <span className="text-2xl font-black text-amber-300 font-mono">{updatesSubscribersCount}</span>
          <span className="text-[10px] text-purple-200 block">$50 / شهرياً للسيرفر</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="size-4 text-slate-400 absolute start-3 top-3" />
          <input
            type="text"
            placeholder="بحث باسم الشركة، البريد، أو الدومين..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">الباقة:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
            >
              <option value="all">كافة الباقات</option>
              <option value="ownership">التملك الدائم</option>
              <option value="whitelabel_paid">العلامة البيضاء الاحترافية ($199)</option>
              <option value="whitelabel_free">العلامة البيضاء المجانية ($0)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
            >
              <option value="all">كافة الحالات</option>
              <option value="active">نشط (Active)</option>
              <option value="suspended">موقوف (Suspended)</option>
              <option value="cancelled">ملغى (Cancelled)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="size-6 animate-spin mx-auto text-purple-600" />
            <p className="text-xs font-bold">جاري تحميل سجلات الشركاء...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Building2 className="size-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold">لا يوجد شركاء مطابقين للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                <tr>
                  <th className="py-3.5 px-4 text-start">الشركة والشريك</th>
                  <th className="py-3.5 px-4 text-start">نوع الباقة</th>
                  <th className="py-3.5 px-4 text-start">اشتراك التحديث والدعم ($50/شهر)</th>
                  <th className="py-3.5 px-4 text-start">المحفظة B2B</th>
                  <th className="py-3.5 px-4 text-start">حالة الحساب</th>
                  <th className="py-3.5 px-4 text-end">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const plan = c.planType || "ownership";
                  const isSuspended = c.status === "suspended" || c.subscriptionStatus === "suspended";
                  const updatesActive = c.updateSubscriptionActive;
                  const walletBalance = c.wallet?.availableBalance ?? (c.walletBalance || 0);
                  const isDepositGood = walletBalance >= 2000;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Company Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{c.companyName}</span>
                            {c.customDomain && (
                              <a
                                href={`https://${c.customDomain}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-purple-700 hover:underline inline-flex items-center gap-0.5 font-mono"
                              >
                                <span>{c.customDomain}</span>
                                <ExternalLink className="size-2.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">{c.email}</p>
                          {c.phone && <p className="text-[10px] text-slate-500">{c.phone}</p>}
                        </div>
                      </td>

                      {/* Plan Type */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {plan === "ownership" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-900 border border-purple-200">
                              <Server className="size-3 text-purple-700" />
                              <span>التملك الدائم الكامل</span>
                            </span>
                          )}
                          {plan === "whitelabel_paid" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-900 border border-indigo-200">
                              <Sparkles className="size-3 text-indigo-700" />
                              <span>وايت ليبل محترف ($199)</span>
                            </span>
                          )}
                          {plan === "whitelabel_free" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-50 text-amber-900 border border-amber-200">
                              <Globe className="size-3 text-amber-700" />
                              <span>وايت ليبل سحابي ($0)</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditPlanCompany(c);
                              setSelectedNewPlan(plan);
                            }}
                            className="text-[10px] text-slate-500 hover:text-purple-900 hover:underline block cursor-pointer font-bold"
                          >
                            تعديل الباقة
                          </button>
                        </div>
                      </td>

                      {/* Updates Subscription Status */}
                      <td className="py-4 px-4">
                        {plan === "ownership" ? (
                          <div className="space-y-1">
                            {updatesActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="size-3 text-emerald-600" />
                                <span>مشترك ونشط ($50/شهر)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                <span>غير مشترك</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAction(c.id, "toggle_updates")}
                              disabled={actionLoading === `toggle_updates-${c.id}`}
                              className="text-[10px] text-purple-700 hover:underline block cursor-pointer font-bold"
                            >
                              {updatesActive ? "إيقاف اشتراك التحديث" : "تفعيل اشتراك التحديث"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {plan === "whitelabel_paid" ? "مشمول في الاشتراك ($199)" : "سحابي مجاني"}
                          </span>
                        )}
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-black text-sm text-slate-900">
                            ${walletBalance.toLocaleString()}
                          </span>
                          <span
                            className={`block text-[10px] font-bold ${
                              isDepositGood ? "text-emerald-600" : "text-amber-600"
                            }`}
                          >
                            {isDepositGood ? "ديبوزيت كافٍ (نشط)" : "أقل من $2,000"}
                          </span>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <Ban className="size-3 text-rose-600" />
                            <span>موقوف مؤقتاً</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            <span>نشط</span>
                          </span>
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
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-all cursor-pointer"
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
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-all cursor-pointer"
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
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                تعديل باقة الشريك: {editPlanCompany.companyName}
              </h3>
              <p className="text-xs text-slate-500">
                اختر الباقة المناسبة للترقية أو التعديل الفوري.
              </p>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setSelectedNewPlan("ownership")}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  selectedNewPlan === "ownership"
                    ? "bg-purple-50 border-purple-700 text-purple-950 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div>
                  <span className="text-xs font-black block">باقة التملك الدائم الكاملة ($1,990)</span>
                  <span className="text-[10px] text-slate-500">سيرفر VPS خاص، وصول Root، وجميع الموزعين</span>
                </div>
                <div className={`size-5 rounded-full border flex items-center justify-center ${selectedNewPlan === "ownership" ? "border-purple-700 bg-purple-700 text-foreground" : "border-slate-300"}`}>
                  {selectedNewPlan === "ownership" && <Check className="size-3" />}
                </div>
              </label>

              <label
                onClick={() => setSelectedNewPlan("whitelabel_paid")}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  selectedNewPlan === "whitelabel_paid"
                    ? "bg-purple-50 border-purple-700 text-purple-950 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div>
                  <span className="text-xs font-black block">العلامة البيضاء الاحترافية ($199/شهر)</span>
                  <span className="text-[10px] text-slate-500">جميع ميزات المنصة والبرامج الخاصة مفتوحة</span>
                </div>
                <div className={`size-5 rounded-full border flex items-center justify-center ${selectedNewPlan === "whitelabel_paid" ? "border-purple-700 bg-purple-700 text-foreground" : "border-slate-300"}`}>
                  {selectedNewPlan === "whitelabel_paid" && <Check className="size-3" />}
                </div>
              </label>

              <label
                onClick={() => setSelectedNewPlan("whitelabel_free")}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  selectedNewPlan === "whitelabel_free"
                    ? "bg-purple-50 border-purple-700 text-purple-950 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div>
                  <span className="text-xs font-black block">العلامة البيضاء المجانية ($0/شهر)</span>
                  <span className="text-[10px] text-slate-500">تغذية مركزية سحابية لطيران وفنادق لوناليزا</span>
                </div>
                <div className={`size-5 rounded-full border flex items-center justify-center ${selectedNewPlan === "whitelabel_free" ? "border-purple-700 bg-purple-700 text-foreground" : "border-slate-300"}`}>
                  {selectedNewPlan === "whitelabel_free" && <Check className="size-3" />}
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditPlanCompany(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleAction(editPlanCompany.id, "change_plan", { newPlan: selectedNewPlan })}
                disabled={actionLoading !== null}
                className="px-5 py-2 rounded-xl bg-purple-900 text-foreground text-xs font-black hover:bg-purple-800 transition-all cursor-pointer"
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
