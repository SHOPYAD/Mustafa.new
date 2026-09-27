"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
  X,
  ExternalLink,
  Unlock,
  SlidersHorizontal,
} from "lucide-react";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  EnterpriseModal,
  type ColumnDef,
} from "@/components/admin/enterprise";

type CompanyWallet = {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  domain?: string;
  planType?: string;
  walletBalance: number;
  walletHoldBalance: number;
  minDepositMet: boolean;
};

type PendingDeposit = {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  paymentMethod: "bank_transfer" | "credit_card";
  status: "pending" | "approved" | "rejected" | "held";
  referenceNumber: string;
  bankReceiptUrl?: string;
  createdAt: string;
  holdUntil?: string;
};

export default function ResaleWalletsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyWallet[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Manual Adjustment Modal
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWallet | null>(null);
  const [adjType, setAdjType] = useState<"credit" | "debit">("credit");
  const [adjAmount, setAdjAmount] = useState<number>(100);
  const [adjReason, setAdjReason] = useState("");
  const [adjSubmitting, setAdjSubmitting] = useState(false);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchWalletsData();
  }, []);

  async function fetchWalletsData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resale/wallets");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
        setPendingDeposits(data.pendingDeposits || []);
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "فشل تحميل بيانات المحافظ" });
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveDeposit(txId: string) {
    setActionLoadingId(txId);
    try {
      const res = await fetch("/api/admin/resale/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_bank_deposit", transactionId: txId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل اعتماد الإيداع");
      setNotification({ type: "success", message: "تم اعتماد التحويل وشحن محفظة الشريك فورياً!" });
      fetchWalletsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الاعتماد";
      setNotification({ type: "error", message: msg });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRejectDeposit(txId: string) {
    const reason = prompt("يرجى إدخال سبب رفض الإيداع:");
    if (reason === null) return;

    setActionLoadingId(txId);
    try {
      const res = await fetch("/api/admin/resale/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_deposit", transactionId: txId, notes: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل رفض الإيداع");
      setNotification({ type: "success", message: "تم رفض عملية الإيداع وتحديث الحالة" });
      fetchWalletsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الرفض";
      setNotification({ type: "error", message: msg });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReleaseHold(txId: string) {
    setActionLoadingId(txId);
    try {
      const res = await fetch("/api/admin/resale/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release_card_hold", transactionId: txId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل فك تعليق الرصيد");
      setNotification({ type: "success", message: "تم فك تعليق الرصيد وإضافته للرصيد المتاح للشركاء!" });
      fetchWalletsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setNotification({ type: "error", message: msg });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleManualAdjustment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompany) return;
    setAdjSubmitting(true);
    try {
      const res = await fetch("/api/admin/resale/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_adjustment",
          companyId: selectedCompany.id,
          amount: adjType === "credit" ? Math.abs(adjAmount) : -Math.abs(adjAmount),
          notes: adjReason || "تسوية إدارية مباشرة",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تطبيق التسوية");
      setNotification({ type: "success", message: "تم تطبيق التسوية المالية بنجاح!" });
      setAdjModalOpen(false);
      fetchWalletsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت التسوية المالية";
      setNotification({ type: "error", message: msg });
    } finally {
      setAdjSubmitting(false);
    }
  }

  const filteredCompanies = companies.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.companyName?.toLowerCase().includes(q) ||
      c.contactEmail?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q)
    );
  });

  const totalAvailableAll = companies.reduce((acc, c) => acc + (c.walletBalance || 0), 0);
  const totalHeldAll = companies.reduce((acc, c) => acc + (c.walletHoldBalance || 0), 0);
  const activeCompaniesCount = companies.filter((c) => c.minDepositMet).length;

  const depositColumns: ColumnDef<PendingDeposit>[] = [
    {
      key: "companyName",
      title: "الشركة / الشريك",
      render: (dep) => (
        <div>
          <p className="font-bold text-foreground text-sm">{dep.companyName}</p>
          <span className="font-mono text-[11px] text-muted-foreground">{dep.referenceNumber}</span>
        </div>
      ),
    },
    {
      key: "amount",
      title: "المبلغ المودع",
      render: (dep) => (
        <span className="font-mono font-black text-amber-400 text-sm tabular-nums">
          ${dep.amount?.toLocaleString()} USD
        </span>
      ),
    },
    {
      key: "paymentMethod",
      title: "طريقة الدفع",
      render: (dep) => (
        <span className="text-xs font-semibold text-foreground">
          {dep.paymentMethod === "bank_transfer" ? "تحويل بنكي مباشر" : "بطاقة ائتمانية"}
        </span>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (dep) => (
        <EnterpriseStatusBadge
          status={
            dep.status === "approved"
              ? "active"
              : dep.status === "pending"
              ? "pending"
              : dep.status === "held"
              ? "pending"
              : "cancelled"
          }
          label={
            dep.status === "approved"
              ? "معتمد ومضاف"
              : dep.status === "pending"
              ? "بانتظار المراجعة"
              : dep.status === "held"
              ? "معلق حماية (Hold)"
              : "مرفوض"
          }
        />
      ),
    },
    {
      key: "createdAt",
      title: "تاريخ الطلب",
      render: (dep) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(dep.createdAt).toLocaleDateString("ar-EG")}
        </span>
      ),
    },
    {
      key: "actions",
      title: "الإجراءات",
      align: "left",
      render: (dep) => (
        <div className="flex items-center gap-2">
          {dep.bankReceiptUrl && (
            <a
              href={dep.bankReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              title="عرض إشعار التحويل"
            >
              <Eye className="size-4" />
            </a>
          )}
          {dep.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => handleApproveDeposit(dep.id)}
                disabled={actionLoadingId === dep.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
              >
                {actionLoadingId === dep.id ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                <span>اعتماد</span>
              </button>
              <button
                type="button"
                onClick={() => handleRejectDeposit(dep.id)}
                disabled={actionLoadingId === dep.id}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white font-bold text-xs transition-all disabled:opacity-50"
              >
                <X className="size-3.5" />
                <span>رفض</span>
              </button>
            </>
          )}
          {dep.status === "held" && (
            <button
              type="button"
              onClick={() => handleReleaseHold(dep.id)}
              disabled={actionLoadingId === dep.id}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
            >
              {actionLoadingId === dep.id ? <Loader2 className="size-3 animate-spin" /> : <Unlock className="size-3.5" />}
              <span>فك التعليق فوراً</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  const walletColumns: ColumnDef<CompanyWallet>[] = [
    {
      key: "companyName",
      title: "الشركة والنطاق",
      render: (c) => (
        <div>
          <p className="font-bold text-foreground text-sm">{c.companyName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{c.contactEmail}</span>
            {c.domain && (
              <span className="font-mono text-amber-400/90 text-[11px]">({c.domain})</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "walletBalance",
      title: "الرصيد المتاح (Available)",
      render: (c) => (
        <div>
          <span className="font-mono font-black text-emerald-400 text-sm tabular-nums">
            ${(c.walletBalance || 0).toLocaleString()} USD
          </span>
        </div>
      ),
    },
    {
      key: "walletHoldBalance",
      title: "الرصيد المعلق (Hold)",
      render: (c) => (
        <span className="font-mono font-bold text-amber-400/80 text-xs tabular-nums">
          ${(c.walletHoldBalance || 0).toLocaleString()} USD
        </span>
      ),
    },
    {
      key: "minDepositMet",
      title: "حالة إصدار الحجوزات",
      render: (c) => (
        <EnterpriseStatusBadge
          status={c.minDepositMet ? "active" : "inactive"}
          label={c.minDepositMet ? "نشط ومفعل" : "معلق (دون السقف)"}
        />
      ),
    },
    {
      key: "actions",
      title: "التسويات",
      align: "left",
      render: (c) => (
        <button
          type="button"
          onClick={() => {
            setSelectedCompany(c);
            setAdjAmount(100);
            setAdjReason("");
            setAdjModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-foreground hover:border-primary/40 hover:bg-card/90 font-bold text-xs transition-all shadow-xs active:scale-95"
        >
          <DollarSign className="size-3.5 text-primary" />
          <span>تسوية المحفظة</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <EnterprisePageHeader
        icon={Coins}
        title="محافظ الشركاء B2B والتحويلات البنكية"
        description="مراقبة أرصدة الشركاء، اعتماد التحويلات البنكية، فك تعليق بطاقات الائتمان، وإجراء التسويات المالية."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الموزعين", href: "/admin/resale" },
          { label: "محافظ B2B" },
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
              onClick={fetchWalletsData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </div>
        }
      />

      {/* Notifications */}
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

      {/* KPI Stats Cards */}
      <EnterpriseKpiGrid cols={3}>
        <EnterpriseKpiCard
          label="إجمالي الأرصدة المتاحة للشركاء"
          value={`$${totalAvailableAll.toLocaleString()} USD`}
          hint="جاهزة لإصدار الحجوزات والتذاكر فورياً"
          icon={Coins}
          tone="emerald"
        />
        <EnterpriseKpiCard
          label="الأرصدة المعلقة للبطاقات (Hold)"
          value={`$${totalHeldAll.toLocaleString()} USD`}
          hint="تحت فترة الحماية من النزاعات"
          icon={Clock}
          tone="amber"
        />
        <EnterpriseKpiCard
          label="شركاء مفعلون (محققو السقف الأدنى)"
          value={`${activeCompaniesCount} / ${companies.length}`}
          hint="محافظهم تغطي الحد الأدنى لإصدار التذاكر"
          icon={ShieldCheck}
          tone="royal"
        />
      </EnterpriseKpiGrid>

      {/* Section 1: Pending Deposits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                طلبات الإيداع والتحويلات البنكية المعلقة ({pendingDeposits.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                مراجعة إشعارات التحويل البنكي وفك تعليق البطاقات يدوياً.
              </p>
            </div>
          </div>
        </div>

        <EnterpriseDataTable
          data={pendingDeposits}
          columns={depositColumns}
          keyExtractor={(dep) => dep.id}
          loading={loading}
          emptyTitle="لا توجد طلبات إيداع معلقة حالياً"
          emptyDescription="جميع طلبات الإيداع والحوالات البنكية تم اعتمادها ومعالجتها بنجاح."
        />
      </div>

      {/* Section 2: All Company Wallets */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                سجل محافظ الشركاء B2B ({companies.length} شركة)
              </h2>
              <p className="text-xs text-muted-foreground">
                متابعة الأرصدة المتاحة والمعلقة لكل شركة مع إمكانية التسوية المالية المباشرة.
              </p>
            </div>
          </div>
        </div>

        <EnterpriseFilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="بحث باسم الشركة، البريد الإلكتروني، أو النطاق..."
          totalResults={filteredCompanies.length}
        />

        <EnterpriseDataTable
          data={filteredCompanies}
          columns={walletColumns}
          keyExtractor={(c) => c.id}
          loading={loading}
          emptyTitle="لا توجد شركات مطابقة"
          emptyDescription="لم يتم العثور على أي شريك يطابق معايير البحث الحالية."
        />
      </div>

      {/* Manual Adjustment Modal */}
      {adjModalOpen && selectedCompany && (
        <EnterpriseModal
          isOpen={adjModalOpen}
          onClose={() => setAdjModalOpen(false)}
          title={`تسوية مالية لمحفظة: ${selectedCompany.companyName}`}
          description={`الرصيد الحالي: $${(selectedCompany.walletBalance || 0).toLocaleString()} USD`}
          size="md"
        >
          <form onSubmit={handleManualAdjustment} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">نوع التسوية المالية:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjType("credit")}
                  className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    adjType === "credit"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/10"
                      : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PlusCircle className="size-4" />
                  <span>إيداع رصيد (Credit)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjType("debit")}
                  className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    adjType === "debit"
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-md shadow-rose-500/10"
                      : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MinusCircle className="size-4" />
                  <span>خصم رصيد (Debit)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">المبلغ المراد تسويته ($ USD):</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold font-mono text-foreground focus:outline-none focus:border-primary"
                />
                <span className="absolute end-4 top-3 text-xs font-bold text-muted-foreground">$</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">سبب أو بيان التسوية الإدارية:</label>
              <input
                type="text"
                placeholder="مثال: تسوية يدوية بناء على حوالة بنكية رقم 98213"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdjModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-border/70 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={adjSubmitting || !adjAmount}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {adjSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>تطبيق التسوية وتحديث الرصيد</span>
              </button>
            </div>
          </form>
        </EnterpriseModal>
      )}
    </div>
  );
}
