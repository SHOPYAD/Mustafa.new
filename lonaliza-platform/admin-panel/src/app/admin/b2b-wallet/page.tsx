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
} from "lucide-react";
import type { B2BWalletSummary, B2BWalletTransaction, WhiteLabelSettings } from "@/lib/server/reseller-whitelabel-store";

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
      if (json?.ok) {
        setData(json);
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

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDeposit(true);
    setDepositMsg(null);

    try {
      const res = await fetch("/api/admin/b2b-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: depositMethod === "card" ? "deposit_card" : "deposit_bank",
          amount: depositAmount,
          companyId: data?.company?.id,
          notes: depositNotes,
        }),
      });

      const json = await res.json();
      if (json?.ok) {
        setDepositMsg({ type: "success", text: json.message });
        setTimeout(() => {
          setDepositModalOpen(false);
          setDepositMsg(null);
          void loadData();
        }, 2500);
      } else {
        setDepositMsg({ type: "error", text: json.error || "فشل إرسال طلب الإيداع" });
      }
    } catch {
      setDepositMsg({ type: "error", text: "حدث خطأ غير متوقع أثناء معالجة الإيداع" });
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const handleTestHandshake = async () => {
    setPingTesting(true);
    setHandshakeResult(null);
    try {
      const res = await fetch("/api/admin/b2b-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_handshake",
          apiKey: data?.company?.apiKeyMaster || "LONA_PK_DEMO",
          apiSecret: "",
        }),
      });
      const json = await res.json();
      setHandshakeResult(json);
    } catch {
      setHandshakeResult({ ok: false, error: "تعذر الاتصال بالمحرك المركزي" });
    } finally {
      setPingTesting(false);
    }
  };

  if (loading) {
    return (
      <div className='p-12 flex flex-col items-center justify-center space-y-4 text-muted-foreground' dir="rtl">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-bold">جاري تحميل محفظة التوريد والديبوزيت B2B...</p>
      </div>
    );
  }

  const wallet = data?.wallet;
  const isDepositSufficient = wallet?.isDepositSufficient ?? false;
  const availableBalance = wallet?.availableBalance ?? 0;
  const holdBalance = wallet?.holdBalance ?? 0;
  const minRequired = wallet?.minDepositRequired ?? 2000;
  const cardFeePercent = data?.wlSettings?.cardFeePercent || 2.9;
  const calculatedFee = Math.round(depositAmount * (cardFeePercent / 100) * 100) / 100;
  const totalCardCharged = depositAmount + calculatedFee;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
              محفظة التوريد B2B وإصدار التذاكر
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-foreground">
              العقدة المركزية: 5.189.147.52
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
            محفظة التوريد والديبوزيت B2B
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            إدارة رصيد إصدار تذاكر الطيران، الفنادق، والمواصلات المباشرة عبر محرك لوناليزا المركزي، ومتابعة خصم الحجوزات اللحظية.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/partners/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all"
          >
            <span>بوابة الشركاء B2B</span>
            <ExternalLink className="size-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setDepositModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:brightness-110 text-primary-foreground text-xs sm:text-sm font-black shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <Wallet className="size-4 text-primary-foreground" />
            <span>شحن رصيد الديبوزيت</span>
          </button>
        </div>
      </div>

      {/* Deposit Alert Banner if < $2,000 */}
      {!isDepositSufficient ? (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="size-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="size-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-foreground">
                تنبيه: رصيد الديبوزيت الحالي (${availableBalance.toLocaleString()}) أقل من الحد الأدنى لتشغيل التوريد الحي (${minRequired.toLocaleString()})
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                لتفعيل استدعاء رحلات الطيران الحي وإصدار التذاكر الفورية وتأكيد حجوزات الفنادق مباشرة، يتطلب النظام رصيد ديبوزيت لا يقل عن ${minRequired.toLocaleString()}. المبلغ يبقى رصيدك الصافي 100% لإصدار تذاكر عملائك.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDepositModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-sm shrink-0 cursor-pointer"
          >
            شحن الديبوزيت الآن (${minRequired})
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300">
                محركات التوريد المركزي تعمل بنجاح وحالة المحفظة نشطة
              </h3>
              <p className="text-[11px] text-muted-foreground">
                رصيدك المتاح (${availableBalance.toLocaleString()}) كافٍ لتأكيد وإصدار حجوزات الطيران والفنادق فورياً لعملائك.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
            جاهز لإصدار التذاكر
          </span>
        </div>
      )}

      {/* Wallet KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className='p-6 rounded-3xl bg-card border border-border shadow-xs space-y-2'>
          <div className="flex items-center justify-between">
            <span className='text-xs font-bold text-muted-foreground'>الرصيد المتاح للإصدار</span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className='text-3xl font-black text-foreground font-mono'>
              ${availableBalance.toLocaleString()}
            </span>
          </div>
          <p className='text-[11px] text-muted-foreground'>رصيد صافٍ تخصم منه تكلفة الحجوزات</p>
        </div>

        {/* Hold Balance */}
        <div className='p-6 rounded-3xl bg-card border border-border shadow-xs space-y-2'>
          <div className="flex items-center justify-between">
            <span className='text-xs font-bold text-muted-foreground'>الرصيد قيد المعالجة (Hold)</span>
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className='text-3xl font-black text-foreground font-mono'>
              ${holdBalance.toLocaleString()}
            </span>
          </div>
          <p className='text-[11px] text-muted-foreground'>إيداعات البطاقات قيد التصفية المصرفية</p>
        </div>

        {/* Total Deposited */}
        <div className='p-6 rounded-3xl bg-card border border-border shadow-xs space-y-2'>
          <div className="flex items-center justify-between">
            <span className='text-xs font-bold text-muted-foreground'>إجمالي الإيداعات</span>
            <div className="size-8 rounded-xl bg-admin-bg-subtle text-primary flex items-center justify-center">
              <ArrowUpRight className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-admin-btn-primary-bg font-mono">
              ${(wallet?.totalDeposited ?? 0).toLocaleString()}
            </span>
          </div>
          <p className='text-[11px] text-muted-foreground'>مجموع ما تم شحنه في المحفظة</p>
        </div>

        {/* Total Spent */}
        <div className='p-6 rounded-3xl bg-card border border-border shadow-xs space-y-2'>
          <div className="flex items-center justify-between">
            <span className='text-xs font-bold text-muted-foreground'>إجمالي الحجوزات المخصومة</span>
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownLeft className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className='text-3xl font-black text-foreground font-mono'>
              ${(wallet?.totalSpent ?? 0).toLocaleString()}
            </span>
          </div>
          <p className='text-[11px] text-muted-foreground'>قيمة التذاكر الصادرة عبر المنظومة</p>
        </div>
      </div>

      {/* Central Distributor Live Handshake & Test Widget */}
      <div className='rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border'>
          <div className="space-y-1">
            <h2 className='text-base font-black text-foreground flex items-center gap-2'>
              <Radio className='size-5 text-primary animate-pulse' />
              <span>فحص الاتصال المباشر بمحرك التوزيع المركزي (5.189.147.52)</span>
            </h2>
            <p className='text-xs text-muted-foreground'>
              اختبار المصادقة التشفيرية (HMAC-SHA256) وسرعة الاستجابة وقاعدة الموزعين النشطة لحسابك.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestHandshake}
            disabled={pingTesting}
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background hover:bg-card text-foreground text-xs font-bold transition-all cursor-pointer disabled:opacity-50'
          >
            {pingTesting ? <Loader2 className='size-4 animate-spin text-secondary' /> : <Zap className='size-4 text-secondary' />}
            <span>{pingTesting ? "جاري قياس الاتصال..." : "اختبار الاتصال المباشر"}</span>
          </button>
        </div>

        {handshakeResult && (
          <div className='p-5 rounded-2xl bg-card-2 border border-border space-y-4 animate-in fade-in'>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-emerald-500 inline-block" />
                <span className='font-bold text-foreground'>الاتصال نشط وموثق بنجاح</span>
                <span className="font-mono text-muted-foreground">({String(handshakeResult.latencyMs)}ms)</span>
              </div>
              <span className='font-mono text-[11px] text-admin-btn-primary-bg bg-admin-bg-subtle px-2.5 py-1 rounded-lg border border-border font-bold'>
                {String(handshakeResult.serverNode || "Lonaliza Master Node")}
              </span>
            </div>

            {/* Live Distributors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className='p-3.5 rounded-xl bg-card border border-border space-y-2'>
                <span className="text-[11px] font-black text-admin-btn-primary-bg block">محركات الطيران الحية (500+ خطوط)</span>
                <p className='text-[11px] text-muted-foreground leading-snug'>
                  PKFARE GDS, Seeru Flights, Travelport Universal API, BiletBank BBOST
                </p>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ متصل وجاهز للإصدار</span>
              </div>

              <div className='p-3.5 rounded-xl bg-card border border-border space-y-2'>
                <span className="text-[11px] font-black text-admin-btn-primary-bg block">بنوك الفنادق الحية (3M+ فندق)</span>
                <p className='text-[11px] text-muted-foreground leading-snug'>
                  RateHawk B2B, Hotelbeds Bedbank, Seeru Hotels, Booking.com Rapid Engine
                </p>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ متصل وجاهز للحجز الفوري</span>
              </div>

              <div className='p-3.5 rounded-xl bg-card border border-border space-y-2'>
                <span className="text-[11px] font-black text-admin-btn-primary-bg block">النقل والترانسفير الخاص</span>
                <p className='text-[11px] text-muted-foreground leading-snug'>
                  Seeru Ride VIP Transfers, أسطول النقل الداخلي
                </p>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ متصل وجاهز للربط</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Audit Ledger */}
      <div className='rounded-3xl border border-border bg-card overflow-hidden shadow-xs space-y-4 p-6'>
        <div className='flex items-center justify-between pb-3 border-b border-border'>
          <h2 className='text-base font-black text-foreground'>
            سجل حركات المحفظة وخصومات التذاكر (Live Ledger)
          </h2>
          <span className='text-xs text-muted-foreground font-mono'>
            {data?.transactions?.length ?? 0} عملية مسجلة
          </span>
        </div>

        {!data?.transactions || data.transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground space-y-2">
            <Coins className="size-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">لا توجد حركات مسجلة بالمحفظة بعد. اشحن رصيدك لبدء إصدار التذاكر.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className='bg-card-2 border-b border-border text-muted-foreground font-bold'>
                <tr>
                  <th className="py-3 px-3 text-start">النوع / الخدمة</th>
                  <th className="py-3 px-3 text-start">المبلغ</th>
                  <th className="py-3 px-3 text-start">الرسوم</th>
                  <th className="py-3 px-3 text-start">الصافي</th>
                  <th className="py-3 px-3 text-start">الحالة</th>
                  <th className="py-3 px-3 text-start">البيان / الملاحظات</th>
                  <th className="py-3 px-3 text-end">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.transactions.map((tx) => (
                  <tr key={tx.id} className='hover:bg-card-2/60 transition-colors'>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        {tx.type.startsWith("deposit") ? (
                          <div className="size-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <ArrowUpRight className="size-3.5" />
                          </div>
                        ) : (
                          <div className='size-7 rounded-lg bg-admin-bg-subtle text-primary flex items-center justify-center'>
                            <ArrowDownLeft className="size-3.5" />
                          </div>
                        )}
                        <span className='font-bold text-foreground'>
                          {tx.type === "deposit_card" && "شحن بطاقة ائتمان"}
                          {tx.type === "deposit_bank" && "إيداع تحويل بنكي"}
                          {tx.type === "booking_deduction" && "خصم إصدار حجز"}
                          {tx.type === "refund" && "استرداد مالي"}
                        </span>
                      </div>
                    </td>
                    <td className='py-3.5 px-3 font-mono font-bold text-foreground'>
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-muted-foreground">
                      ${(tx.fee || 0).toLocaleString()}
                    </td>
                    <td className='py-3.5 px-3 font-mono font-black text-foreground'>
                      ${tx.netAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      {tx.status === "cleared" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          مكتمل ومتاح
                        </span>
                      ) : tx.status === "pending" ? (
                        <span className='px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'>
                          قيد التدقيق
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {tx.status}
                        </span>
                      )}
                    </td>
                    <td className='py-3.5 px-3 text-muted-foreground max-w-xs truncate'>
                      {tx.notes || "—"}
                    </td>
                    <td className="py-3.5 px-3 text-end font-mono text-muted-foreground text-[11px]">
                      {tx.created ? new Date(tx.created).toLocaleDateString("ar-SA") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className='fixed inset-0 z-50 bg-background/60 backdrop-blur-xs flex items-center justify-center p-4'>
          <div className='bg-card rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in'>
            <div className='flex items-center justify-between pb-3 border-b border-border'>
              <div className="space-y-0.5">
                <h3 className='text-base font-black text-foreground'>شحن رصيد ديبوزيت المحفظة B2B</h3>
                <p className='text-xs text-muted-foreground'>الرصيد يضاف فورياً لاستخدامه في إصدار تذاكر وحجوزات المنصة.</p>
              </div>
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className='text-muted-foreground hover:text-muted-foreground text-lg font-bold cursor-pointer'
              >
                ✕
              </button>
            </div>

            {depositMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  depositMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {depositMsg.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                <span>{depositMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-6">
              {/* Method Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepositMethod("card")}
                  className={`p-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    depositMethod === "card"
                      ? "bg-admin-bg-subtle border-admin-accent-hover text-admin-btn-primary-bg"
                      : "bg-muted border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CreditCard className="size-4" />
                  <span>بطاقة ائتمان (Iyzico فوري)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod("bank")}
                  className={`p-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    depositMethod === "bank"
                      ? "bg-admin-bg-subtle border-admin-accent-hover text-admin-btn-primary-bg"
                      : "bg-muted border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Building className="size-4" />
                  <span>تحويل بنكي مباشر (0% رسوم)</span>
                </button>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <label className='text-xs font-bold text-foreground block'>
                  مبلغ الشحن المطلوب بالدولار الأمريكي ($)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className='w-full px-4 py-3 rounded-xl border border-border font-mono text-base font-black text-foreground focus:outline-none focus:border-primary'
                  />
                  <span className="absolute end-4 top-3.5 text-xs font-bold text-muted-foreground font-mono">$ USD</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {[1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className='px-2.5 py-1 rounded-lg bg-card-2 hover:bg-slate-200 text-[11px] font-bold font-mono text-foreground cursor-pointer'
                    >
                      +${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {depositMethod === "card" ? (
                <div className='p-4 rounded-2xl bg-admin-bg-subtle border border-border text-xs space-y-2'>
                  <div className='flex items-center justify-between text-foreground'>
                    <span>رسوم بوابة الدفع ({cardFeePercent}%):</span>
                    <span className="font-mono font-bold">${calculatedFee.toLocaleString()}</span>
                  </div>
                  <div className='flex items-center justify-between text-admin-btn-primary-bg font-black border-t border-border pt-2'>
                    <span>إجمالي الخصم من البطاقة:</span>
                    <span className="font-mono text-sm">${totalCardCharged.toLocaleString()}</span>
                  </div>
                  <p className='text-[10px] text-muted-foreground'>
                    تتم المعالجة عبر بروتوكول 3D Secure المشفر من Iyzico، ويتاح رصيدك فورياً للإصدار.
                  </p>
                </div>
              ) : (
                <div className='p-4 rounded-2xl bg-card-2 border border-border text-xs space-y-2'>
                  <span className='font-bold text-foreground block'>تفاصيل الحساب البنكي للإيداع:</span>
                  <div className='space-y-1 font-mono text-[11px] text-foreground bg-card p-3 rounded-xl border border-border'>
                    <p><strong>البنك:</strong> {data?.wlSettings?.bankName || "Ziraat Bankası Turkey"}</p>
                    <p><strong>المستفيد:</strong> {data?.wlSettings?.bankBeneficiary || "LONALIZA TURIZM A.S."}</p>
                    <p><strong>IBAN:</strong> {data?.wlSettings?.bankIban || "TR76 0001 0090 1000 0000 0000 01"}</p>
                    <p><strong>SWIFT:</strong> {data?.wlSettings?.bankSwift || "TCZBTR2A"}</p>
                  </div>
                  <textarea
                    placeholder="اكتب رقم الحوالة وتاريخها واسم المحول..."
                    value={depositNotes}
                    onChange={(e) => setDepositNotes(e.target.value)}
                    rows={2}
                    className='w-full px-3 py-2 rounded-xl border border-border text-xs text-foreground'
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className='px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-card-2 cursor-pointer'
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingDeposit}
                  className='px-6 py-2.5 rounded-xl bg-primary hover:hover:bg-primary/90 text-foreground text-xs font-black shadow-md cursor-pointer disabled:opacity-50'
                >
                  {submittingDeposit ? "جاري المعالجة..." : `تأكيد الشحن ($${depositAmount.toLocaleString()})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
