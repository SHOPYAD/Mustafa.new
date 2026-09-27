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
    <div className="p-6 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border'>
        <div>
          <div className='flex items-center gap-2 text-xs font-bold text-primary bg-admin-bg-subtle px-3 py-1 rounded-full w-fit mb-2'>
            <Globe className="size-3.5" />
            <span>إدارة النطاقات المخصصة وشهادات الأمان SSL</span>
          </div>
          <h1 className='text-2xl sm:text-3xl font-black text-foreground'>
            طلبات النطاقات الخاصة للشركاء (Custom Domains Hub)
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
            مراجعة طلبات الدومين الخاص بشركاء الوايت ليبل، التحقق من توجيه DNS، وتفعيل الربط السحابي بضغطة واحدة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/resale"
            className='inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-card-2 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all'
          >
            <ArrowRight className="size-4" />
            <span>منصة التوزيع</span>
          </Link>
          <button
            onClick={fetchDomains}
            disabled={loading}
            className='inline-flex items-center gap-2 text-xs font-bold text-primary bg-admin-bg-subtle hover:bg-admin-bg-subtle px-4 py-2.5 rounded-xl transition-all'
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

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
          <button onClick={() => setNotification(null)} className='text-muted-foreground hover:text-muted-foreground'>
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Target Server IP Alert */}
      <div className='p-4 rounded-2xl bg-background text-foreground flex flex-col sm:flex-row items-center justify-between gap-3 text-xs'>
        <div className="flex items-center gap-2">
          <Server className="size-4 text-primary shrink-0" />
          <span>عنوان IP السيرفر المركزي المستهدف للتوجيه (A-Record):</span>
          <code className='font-mono font-black text-secondary bg-primary px-2 py-0.5 rounded-md'>
            5.189.147.52
          </code>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>يدعم شهادات Let&apos;s Encrypt التلقائية و Cloudflare Proxy</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className='p-6 rounded-3xl bg-card border border-border shadow-sm space-y-1'>
          <span className='text-xs font-bold text-muted-foreground'>الطلبات المعلقة للمراجعة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-admin-btn-secondary-hover font-mono">{pendingCount}</span>
            <span className="text-xs text-muted-foreground">طلب</span>
          </div>
          <p className="text-[11px] text-admin-btn-secondary-hover font-bold">بانتظار التحقق الإداري والربط</p>
        </div>

        <div className='p-6 rounded-3xl bg-card border border-border shadow-sm space-y-1'>
          <span className='text-xs font-bold text-muted-foreground'>النطاقات المفعلة والنشطة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">{activeCount}</span>
            <span className="text-xs text-muted-foreground">نطاق</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold">تعمل بشهادات SSL مشفرة</p>
        </div>

        <div className='p-6 rounded-3xl bg-card border border-border shadow-sm space-y-1'>
          <span className='text-xs font-bold text-muted-foreground'>إجمالي النطاقات المسجلة</span>
          <div className="flex items-baseline gap-2">
            <span className='text-3xl font-black text-primary font-mono'>{domains.length}</span>
            <span className="text-xs text-muted-foreground">دومين</span>
          </div>
          <p className='text-[11px] text-primary font-bold'>شاملة النسخ المجانية والمدفوعة</p>
        </div>
      </div>

      {/* Domains Table */}
      <div className='rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6'>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className='text-lg font-black text-foreground'>سجل طلبات الدومين الخاص</h2>
            <p className='text-xs text-muted-foreground'>
              استعراض النطاقات المخصصة واعتماد توجيهها للوايت ليبل.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="size-4 text-muted-foreground absolute right-3 top-3" />
            <input
              type="text"
              placeholder="بحث بالنطاق أو الشركة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pr-9 pl-4 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-primary'
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className='text-muted-foreground border-b border-border uppercase'>
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
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات نطاقات مخصصة حالياً
                  </td>
                </tr>
              ) : (
                filteredDomains.map((d) => (
                  <tr key={d.id} className='hover:bg-card-2 transition-colors'>
                    <td className="py-4 pr-2">
                      <div className="flex items-center gap-2">
                        <Globe className="size-4 text-primary shrink-0" />
                        <a
                          href={`https://${d.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-admin-btn-primary-bg hover:underline flex items-center gap-1"
                        >
                          <span>{d.domain}</span>
                          <ExternalLink className="size-3 text-muted-foreground" />
                        </a>
                      </div>
                    </td>
                    <td className='py-4 font-bold text-foreground'>{d.companyName}</td>
                    <td className='py-4 font-mono text-muted-foreground'>{d.subdomain || "—"}</td>
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
                        <span className="text-muted-foreground text-[11px]">غير موجه بعد</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.sslStatus === "issued"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-muted text-muted-foreground"
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
                            : "bg-amber-50 text-admin-btn-secondary-hover border border-border"
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
                            className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-hover hover:hover:bg-primary/90 text-foreground font-bold text-xs transition-all cursor-pointer'
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
    </div>
  );
}
