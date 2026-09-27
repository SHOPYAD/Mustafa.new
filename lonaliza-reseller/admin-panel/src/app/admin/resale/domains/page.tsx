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
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  type ColumnDef,
} from "@/components/admin/enterprise";

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setNotification({ type: "error", message: msg });
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setNotification({ type: "error", message: msg });
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

  const columns: ColumnDef<DomainRequest>[] = [
    {
      key: "domain",
      title: "النطاق المطلوب",
      render: (d) => (
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-primary shrink-0" />
          <a
            href={`https://${d.domain}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono font-bold text-amber-400 text-xs hover:underline flex items-center gap-1"
          >
            <span>{d.domain}</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </a>
        </div>
      ),
    },
    {
      key: "companyName",
      title: "شركة الشريك",
      render: (d) => (
        <span className="font-bold text-foreground text-xs">{d.companyName}</span>
      ),
    },
    {
      key: "subdomain",
      title: "الـ Subdomain الأصلي",
      render: (d) => (
        <span className="font-mono text-muted-foreground text-xs">
          {d.subdomain ? `${d.subdomain}.lonaliza.com` : "—"}
        </span>
      ),
    },
    {
      key: "resolvedIp",
      title: "حالة توجيه DNS",
      render: (d) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full ${
              d.resolvedIp === "5.189.147.52" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
            }`}
          />
          <span className="font-mono text-[11px] text-foreground">
            {d.resolvedIp || "بانتظار الـ DNS"}
          </span>
        </div>
      ),
    },
    {
      key: "sslStatus",
      title: "شهادة SSL",
      render: (d) => (
        <EnterpriseStatusBadge
          status={
            d.sslStatus === "issued"
              ? "active"
              : d.sslStatus === "pending"
              ? "pending"
              : "cancelled"
          }
          label={
            d.sslStatus === "issued"
              ? "مشفرة (SSL Valid)"
              : d.sslStatus === "pending"
              ? "قيد الإصدار"
              : "فشل التحقق"
          }
          size="sm"
        />
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (d) => (
        <EnterpriseStatusBadge
          status={
            d.status === "verified"
              ? "active"
              : d.status === "pending"
              ? "pending"
              : "cancelled"
          }
          label={
            d.status === "verified"
              ? "مفعل ومربوط"
              : d.status === "pending"
              ? "بانتظار المراجعة"
              : "مرفوض"
          }
        />
      ),
    },
    {
      key: "actions",
      title: "الإجراء",
      align: "left",
      render: (d) => (
        <div className="flex items-center gap-2">
          {d.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => handleVerifyDomain(d.id)}
                disabled={actionLoadingId === d.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
              >
                {actionLoadingId === d.id ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                <span>تفعيل</span>
              </button>
              <button
                type="button"
                onClick={() => handleRejectDomain(d.id)}
                disabled={actionLoadingId === d.id}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white font-bold text-xs transition-all disabled:opacity-50"
              >
                <X className="size-3.5" />
                <span>رفض</span>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <EnterprisePageHeader
        icon={Globe}
        title="طلبات النطاقات الخاصة للشركاء (Custom Domains)"
        description="مراجعة طلبات الدومين الخاص بشركاء الوايت ليبل، التحقق من توجيه DNS، وتفعيل الربط السحابي بضغطة واحدة."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الموزعين", href: "/admin/resale" },
          { label: "النطاقات الخاصة" },
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
              onClick={fetchDomains}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </div>
        }
      />

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2.5 backdrop-blur-xl animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Target Server IP Alert */}
      <div className="p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-card via-card/80 to-primary/10 text-foreground flex flex-col sm:flex-row items-center justify-between gap-3 text-xs backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-2.5">
          <Server className="size-4 text-primary shrink-0" />
          <span className="font-bold">عنوان IP السيرفر المركزي المستهدف للتوجيه (A-Record):</span>
          <code className="font-mono font-black text-amber-400 bg-primary/20 border border-primary/30 px-2.5 py-1 rounded-lg">
            5.189.147.52
          </code>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>يدعم شهادات Let&apos;s Encrypt التلقائية و Cloudflare Proxy</span>
        </div>
      </div>

      <EnterpriseKpiGrid cols={3}>
        <EnterpriseKpiCard
          label="الطلبات المعلقة للمراجعة"
          value={pendingCount}
          hint="بانتظار التحقق الإداري والربط"
          icon={Clock}
          tone="amber"
        />
        <EnterpriseKpiCard
          label="النطاقات المفعلة والنشطة"
          value={activeCount}
          hint="تعمل بشهادات SSL مشفرة"
          icon={ShieldCheck}
          tone="emerald"
        />
        <EnterpriseKpiCard
          label="إجمالي النطاقات المسجلة"
          value={domains.length}
          hint="شاملة النسخ المجانية والمدفوعة"
          icon={Globe}
          tone="royal"
        />
      </EnterpriseKpiGrid>

      <div className="space-y-4">
        <EnterpriseFilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="بحث بالنطاق، اسم الشركة، أو النطاق الفرعي..."
          totalResults={filteredDomains.length}
        />

        <EnterpriseDataTable
          data={filteredDomains}
          columns={columns}
          keyExtractor={(d) => d.id}
          loading={loading}
          emptyTitle="لا توجد طلبات نطاقات مطابقة"
          emptyDescription="لم يتم العثور على أي طلب نطاق مخصص يطابق معايير البحث الحالية."
        />
      </div>
    </div>
  );
}
