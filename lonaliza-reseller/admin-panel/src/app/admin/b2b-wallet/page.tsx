"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building,
  RefreshCw,
  Zap,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Loader2,
  Check,
  Copy,
  Clock,
  Radio,
  Plus,
} from "lucide-react";
import type { B2BWalletSummary, B2BWalletTransaction, WhiteLabelSettings } from "@/lib/server/reseller-whitelabel-store";
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
import { Button } from "@/components/ui/button";

type WalletData = {
  company: {
    id: string;
    name: string;
    planType: string;
    apiKeyMaster: string;
    apiSecret: string;
  } | null;
  wallet: B2BWalletSummary;
  transactions: B2BWalletTransaction[];
  wlSettings?: WhiteLabelSettings;
};

export default function TenantAdminB2BWalletPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositMethod, setDepositMethod] = useState<"card" | "bank">("card");
  const [depositAmount, setDepositAmount] = useState(2000);
  const [depositNotes, setDepositNotes] = useState("");
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [depositMsg, setDepositMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handshake state
  const [pingTesting, setPingTesting] = useState(false);
  const [handshakeResult, setHandshakeResult] = useState<Record<string, unknown> | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/b2b-wallet", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDeposit(true);
    setDepositMsg(null);

    try {
      const res = await fetch("/api/admin/b2b-wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(depositAmount),
          method: depositMethod,
          notes: depositNotes,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setDepositMsg({
          type: "success",
          text: json.message || "تم تسجيل طلب الشحن بنجاح وتحديث الرصيد.",
        });
        await loadData();
        setTimeout(() => {
          setDepositModalOpen(false);
          setDepositMsg(null);
        }, 1500);
      } else {
        setDepositMsg({
          type: "error",
          text: json.error || "تعذر معالجة الإيداع، يرجى المحاولة لاحقاً.",
        });
      }
    } catch {
      setDepositMsg({
        type: "error",
        text: "فشل الاتصال بخادم المعالجة المالية.",
      });
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const handleTestHandshake = async () => {
    setPingTesting(true);
    setHandshakeResult(null);
    try {
      const res = await fetch("/api/admin/b2b-wallet/handshake-test", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setHandshakeResult(json);
      } else {
        setHandshakeResult({ error: json.error || "فشل فحص الاتصال" });
      }
    } catch {
      setHandshakeResult({ error: "تعذر الوصول إلى خادم الربط المركزي" });
    } finally {
      setPingTesting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-muted-foreground gap-3">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-sm font-bold">جاري تحميل المحفظة المالية وسجل التذاكر...</p>
      </div>
    );
  }

  const wallet = data?.wallet;
  const availableBalance = wallet?.availableBalance ?? 0;
  const holdBalance = wallet?.holdBalance ?? 0;
  const isLowBalance = availableBalance < 500;

  const columns: ColumnDef<B2BWalletTransaction>[] = [
    {
      key: "type",
      header: "العملية والخدمة",
      render: (tx) => (
        <div className="flex items-center gap-2.5 py-1">
          {tx.type.startsWith("deposit") ? (
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <ArrowUpRight className="size-4" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <ArrowDownLeft className="size-4" />
            </div>
          )}
          <span className="font-bold text-foreground text-xs">
            {tx.type === "deposit_card" && "شحن بطاقة ائتمان"}
            {tx.type === "deposit_bank" && "إيداع تحويل بنكي"}
            {tx.type === "booking_deduction" && "خصم إصدار حجز"}
            {tx.type === "refund" && "استرداد مالي"}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "المبلغ الإجمالي",
      sortable: true,
      render: (tx) => (
        <span className="font-mono font-bold text-foreground text-xs tabular-nums">
          ${tx.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "fee",
      header: "الرسوم",
      render: (tx) => (
        <span className="font-mono text-muted-foreground text-xs tabular-nums">
          ${(tx.fee || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "netAmount",
      header: "الصافي",
      sortable: true,
      render: (tx) => (
        <span className="font-mono font-bold text-foreground text-xs tabular-nums">
          ${tx.netAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      align: "center",
      render: (tx) => (
        <EnterpriseStatusBadge
          variant={tx.status === "cleared" ? "success" : tx.status === "pending" ? "pending" : "failed"}
          label={tx.status === "cleared" ? "متاح ومكتمل" : tx.status === "pending" ? "قيد التصفية" : "ملغى"}
        />
      ),
    },
    {
      key: "notes",
      header: "البيان والملاحظات",
      render: (tx) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {tx.notes || tx.reference || "—"}
        </span>
      ),
    },
    {
      key: "date",
      header: "التاريخ",
      align: "end",
      render: (tx) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(tx.createdAt).toLocaleDateString("ar-SA", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المالية والخزينة", href: "/admin/b2b-wallet" },
          { label: "محفظة B2B وإصدار التذاكر" },
        ]}
        icon={<Wallet className="h-6 w-6 text-primary" />}
        title="محفظة B2B والرصيد التشغيلي للإصدار"
        subtitle="إدارة رصيد التذاكر اللحظي، شحن المحفظة، مراقبة الخصومات المباشرة لحجوزات الطيران والفنادق، وفحص الربط مع محرك التوزيع المركزي."
        actions={
          <Button
            type="button"
            className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-2 h-11 px-5"
            onClick={() => setDepositModalOpen(true)}
          >
            <Plus size={16} />
            <span>شحن رصيد المحفظة الآن</span>
          </Button>
        }
      />

      {/* Low balance alert or readiness notice */}
      {isLowBalance ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                تنبيه: الرصيد التشغيلي منخفض (${availableBalance.toLocaleString()})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                يرجى شحن المحفظة لضمان استمرار تأكيد وإصدار حجوزات الطيران والفنادق دون انقطاع.
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black text-xs shrink-0"
            onClick={() => setDepositModalOpen(true)}
          >
            شحن رصيد الآن
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                محركات التوريد المركزي تعمل بنجاح وحالة المحفظة ممتازة
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                رصيدك المتاح (${availableBalance.toLocaleString()}) كافٍ لتأكيد وإصدار تذاكر الطيران وغرف الفنادق فورياً لعملائك.
              </p>
            </div>
          </div>
          <EnterpriseStatusBadge variant="active" label="جاهز للإصدار الفوري" pulse />
        </div>
      )}

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          title="الرصيد المتاح للإصدار"
          value={`$${availableBalance.toLocaleString()}`}
          subValue="رصيد صافٍ تخصم منه تكلفة الحجوزات"
          icon={<Coins className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="الرصيد قيد المعالجة"
          value={`$${holdBalance.toLocaleString()}`}
          subValue="إيداعات البطاقات قيد التصفية"
          icon={<Clock className="size-5" />}
          color="amber"
        />
        <EnterpriseKpiCard
          title="إجمالي الإيداعات"
          value={`$${(wallet?.totalDeposited ?? 0).toLocaleString()}`}
          subValue="مجموع ما تم شحنه"
          icon={<ArrowUpRight className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="الحجوزات المخصومة"
          value={`$${(wallet?.totalSpent ?? 0).toLocaleString()}`}
          subValue="قيمة التذاكر الصادرة"
          icon={<ArrowDownLeft className="size-5" />}
          color="blue"
        />
      </EnterpriseKpiGrid>

      {/* Handshake Central Node Check Card */}
      <div className="rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Radio className="size-5 text-primary animate-pulse" />
              <span>فحص الاتصال المباشر بمحرك التوزيع المركزي (5.189.147.52)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              اختبار المصادقة التشفيرية (HMAC-SHA256) وسرعة الاستجابة وقاعدة الموزعين النشطة لحسابك.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleTestHandshake}
            disabled={pingTesting}
            className="rounded-xl font-bold bg-primary text-primary-foreground gap-2 shrink-0"
          >
            {pingTesting ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
            <span>{pingTesting ? "جاري قياس الاتصال..." : "اختبار الاتصال المباشر"}</span>
          </Button>
        </div>

        {handshakeResult && (
          <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="font-bold text-foreground">الاتصال نشط وموثق بنجاح</span>
                <span className="font-mono text-muted-foreground">({String(handshakeResult.latencyMs)}ms)</span>
              </div>
              <EnterpriseStatusBadge
                variant="royal"
                label={String(handshakeResult.serverNode || "Lonaliza Master Node")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-card border border-border/40 space-y-1.5">
                <span className="text-xs font-bold text-foreground block">محركات الطيران الحية (500+ خطوط)</span>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  PKFARE GDS, Seeru Flights, Travelport Universal API, BiletBank BBOST
                </p>
                <EnterpriseStatusBadge variant="success" size="sm" label="متصل وجاهز للإصدار" />
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/40 space-y-1.5">
                <span className="text-xs font-bold text-foreground block">بنوك الفنادق الحية (3M+ فندق)</span>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  RateHawk B2B, Hotelbeds Bedbank, Seeru Hotels, Booking.com Rapid Engine
                </p>
                <EnterpriseStatusBadge variant="success" size="sm" label="متصل وجاهز للحجز الفوري" />
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/40 space-y-1.5">
                <span className="text-xs font-bold text-foreground block">النقل والترانسفير الخاص</span>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Seeru Ride VIP Transfers, أسطول النقل الداخلي
                </p>
                <EnterpriseStatusBadge variant="success" size="sm" label="متصل وجاهز للربط" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <EnterpriseDataTable
        columns={columns}
        data={(data?.transactions || []) as unknown as Record<string, unknown>[]}
        keyField="id"
        pageSize={10}
        emptyTitle="لا توجد حركات مسجلة بالمحفظة"
        emptyDescription="اشحن رصيد المحفظة للبدء في إصدار التذاكر الفورية وتتبع الخصومات."
      />

      {/* Deposit Modal */}
      {depositModalOpen && (
        <EnterpriseModal
          open={depositModalOpen}
          onClose={() => setDepositModalOpen(false)}
          title="شحن رصيد محفظة B2B"
          subtitle="تغذية الرصيد التشغيلي لتأكيد وإصدار الحجوزات الفورية"
          maxWidth="md"
        >
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {depositMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  depositMsg.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {depositMsg.text}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">طريقة الشحن:</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDepositMethod("card")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    depositMethod === "card"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CreditCard size={15} />
                  <span>بطاقة ائتمان فوري</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMethod("bank")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    depositMethod === "bank"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Building size={15} />
                  <span>تحويل بنكي رسمي</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">المبلغ المراد شحنه ($ USD):</label>
              <input
                type="number"
                min={100}
                step={50}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">ملاحظات أو مرجع التحويل:</label>
              <input
                type="text"
                value={depositNotes}
                onChange={(e) => setDepositNotes(e.target.value)}
                placeholder="رقم الحوالة البنكية أو ملاحظات المحاسبة..."
                className="w-full rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-xs"
                onClick={() => setDepositModalOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submittingDeposit}
                className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black text-xs gap-1.5"
              >
                {submittingDeposit ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>تأكيد الإيداع والشحن</span>
              </Button>
            </div>
          </form>
        </EnterpriseModal>
      )}
    </div>
  );
}
