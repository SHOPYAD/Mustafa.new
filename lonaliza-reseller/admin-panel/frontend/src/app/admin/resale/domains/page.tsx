"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Check,
  X,
  Search,
  Server,
  Lock,
} from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";

type DomainRequest = {
  id: string;
  companyId: string;
  companyName: string;
  subdomain?: string;
  domain: string;
  status: "pending" | "verified" | "rejected";
  sslStatus: "pending" | "issued" | "failed";
  resolvedIp?: string;
  createdAt: string;
  notes?: string;
};

export default function ResaleDomainsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<DomainRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  async function fetchDomains() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resale/domains");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains || []);
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "فشل تحميل طلبات النطاقات" });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyDomain(domainId: string) {
    setActionLoadingId(domainId);
    try {
      const res = await fetch("/api/admin/resale/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_domain", domainId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تفعيل النطاق");
      setNotification({ type: "success", message: "تم تفعيل النطاق وربطه وإصدار شهادة SSL بنجاح!" });
      fetchDomains();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "حدث خطأ" });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRejectDomain(domainId: string) {
    const reason = prompt("يرجى توضيح سبب رفض النطاق (مثال: سجلات الـ DNS غير صحيحة):");
    if (reason === null) return;

    setActionLoadingId(domainId);
    try {
      const res = await fetch("/api/admin/resale/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_domain", domainId, notes: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل رفض الطلب");
      setNotification({ type: "success", message: "تم رفض طلب النطاق وإشعار الشريك" });
      fetchDomains();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "حدث خطأ" });
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredDomains = domains.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.domain?.toLowerCase().includes(q) ||
      d.companyName?.toLowerCase().includes(q) ||
      d.subdomain?.toLowerCase().includes(q)
    );
  });

  const pendingCount = domains.filter((d) => d.status === "pending").length;
  const activeCount = domains.filter((d) => d.status === "verified").length;

  return (
    <AdminPage className="space-y-8" dir="rtl">
      <AdminPageHeader
        icon={<Globe className="size-5" />}
        title="طلبات النطاقات الخاصة للشركاء"
        description="مراجعة طلبات الدومين الخاص بشركاء الوايت ليبل، التحقق من توجيه DNS، وتفعيل الربط السحابي بضغطة واحدة."
        actions={
          <>
            <Link href="/admin/resale" className="admin-btn-secondary">
              <ArrowRight className="size-4" />
              منصة التوزيع
            </Link>
            <button type="button" onClick={fetchDomains} disabled={loading} className="admin-btn-secondary">
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </>
        }
      />

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Target Server IP Alert */}
      <div className="p-4 rounded-2xl bg-slate-900 text-foreground flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Server className="size-4 text-purple-400 shrink-0" />
          <span>عنوان IP السيرفر المركزي المستهدف للتوجيه (A-Record):</span>
          <code className="font-mono font-black text-amber-300 bg-purple-950 px-2 py-0.5 rounded-md">
            5.189.147.52
          </code>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>يدعم شهادات Let&apos;s Encrypt التلقائية و Cloudflare Proxy</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">الطلبات المعلقة للمراجعة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 font-mono">{pendingCount}</span>
            <span className="text-xs text-slate-400">طلب</span>
          </div>
          <p className="text-[11px] text-amber-700 font-bold">بانتظار التحقق الإداري والربط</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">النطاقات المفعلة والنشطة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">{activeCount}</span>
            <span className="text-xs text-slate-400">نطاق</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold">تعمل بشهادات SSL مشفرة</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">إجمالي النطاقات المسجلة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700 font-mono">{domains.length}</span>
            <span className="text-xs text-slate-400">دومين</span>
          </div>
          <p className="text-[11px] text-purple-700 font-bold">شاملة النسخ المجانية والمدفوعة</p>
        </div>
      </div>

      {/* Domains Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">سجل طلبات الدومين الخاص</h2>
            <p className="text-xs text-slate-500">
              استعراض النطاقات المخصصة واعتماد توجيهها للوايت ليبل.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="size-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="بحث بالنطاق أو الشركة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-slate-400 border-b border-slate-100 uppercase">
              <tr>
                <th className="pb-3 pr-2 font-bold">النطاق المطلوب</th>
                <th className="pb-3 font-bold">شركة الشريك</th>
                <th className="pb-3 font-bold">الـ Subdomain الأصلي</th>
                <th className="pb-3 font-bold">حالة الـ DNS</th>
                <th className="pb-3 font-bold">شهادة SSL</th>
                <th className="pb-3 font-bold">الحالة</th>
                <th className="pb-3 pl-2 text-left font-bold">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    لا توجد طلبات نطاقات مخصصة حالياً
                  </td>
                </tr>
              ) : (
                filteredDomains.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-2">
                      <div className="flex items-center gap-2">
                        <Globe className="size-4 text-purple-600 shrink-0" />
                        <a
                          href={`https://${d.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-purple-950 hover:underline flex items-center gap-1"
                        >
                          <span>{d.domain}</span>
                          <ExternalLink className="size-3 text-slate-400" />
                        </a>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-900">{d.companyName}</td>
                    <td className="py-4 font-mono text-slate-600">{d.subdomain || "—"}</td>
                    <td className="py-4 font-mono">
                      {d.resolvedIp ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            d.resolvedIp === "5.189.147.52"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          <span>{d.resolvedIp}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">غير موجه بعد</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.sslStatus === "issued"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Lock className="size-2.5" />
                        <span>{d.sslStatus === "issued" ? "SSL مشفر" : "قيد الإصدار"}</span>
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          d.status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : d.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {d.status === "verified" ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : d.status === "rejected" ? (
                          <AlertCircle className="size-3.5" />
                        ) : (
                          <Clock className="size-3.5" />
                        )}
                        <span>
                          {d.status === "verified" ? "مفعل ونشط" : d.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 pl-2 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {d.status !== "verified" && (
                          <button
                            onClick={() => handleVerifyDomain(d.id)}
                            disabled={actionLoadingId === d.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-foreground font-bold text-xs transition-all cursor-pointer"
                          >
                            <Check className="size-3.5" />
                            <span>اعتماد وتفعيل SSL</span>
                          </button>
                        )}
                        {d.status === "pending" && (
                          <button
                            onClick={() => handleRejectDomain(d.id)}
                            disabled={actionLoadingId === d.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all cursor-pointer"
                          >
                            <X className="size-3.5" />
                            <span>رفض</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
