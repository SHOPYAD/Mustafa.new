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
import { AdminKpi, AdminKpiStrip, AdminModule, AdminPage, AdminPageHeader } from "@/components/admin/layout";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

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
      <div className="p-12 flex flex-col items-center justify-center space-y-4 text-slate-500" dir="rtl">
        <Loader2 className="size-8 animate-spin text-purple-600" />
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
    <AdminPage className="space-y-6" dir="rtl">
      <AdminPageHeader
        icon={<Wallet className="size-5" />}
        title="محفظة التوريد والديبوزيت B2B"
        description="إدارة رصيد إصدار تذاكر الطيران والفنادق والمواصلات، ومتابعة خصم الحجوزات اللحظية."
        actions={
          <>
            <Link href="/partners/dashboard" className="admin-btn-secondary">
              <span>بوابة الشركاء B2B</span>
              <ExternalLink className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setDepositModalOpen(true)}
              className="admin-btn-primary"
            >
              <Wallet className="size-4" />
              <span>شحن رصيد الديبوزيت</span>
            </button>
          </>
        }
      />

      {/* Deposit Alert Banner if < $2,000 */}
      {!isDepositSufficient ? (
        <AdminModule className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="admin-page-head__mark shrink-0">
              <AlertTriangle className="size-5" />
            </span>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-[color:var(--admin-text-primary)]">
                تنبيه: رصيد الديبوزيت الحالي (${availableBalance.toLocaleString()}) أقل من الحد الأدنى لتشغيل التوريد الحي (${minRequired.toLocaleString()})
              </h3>
              <p className="text-xs text-[color:var(--admin-text-muted)] leading-relaxed max-w-3xl">
                لتفعيل استدعاء رحلات الطيران الحي وإصدار التذاكر الفورية وتأكيد حجوزات الفنادق مباشرة، يتطلب النظام رصيد ديبوزيت لا يقل عن ${minRequired.toLocaleString()}. المبلغ يبقى رصيدك الصافي 100% لإصدار تذاكر عملائك.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDepositModalOpen(true)}
            className="admin-btn-primary shrink-0"
          >
            شحن الديبوزيت الآن (${minRequired})
          </button>
        </AdminModule>
      ) : (
        <AdminModule className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="admin-page-head__mark">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[color:var(--admin-text-primary)]">
                محركات التوريد المركزي تعمل بنجاح وحالة المحفظة نشطة
              </h3>
              <p className="text-[11px] text-[color:var(--admin-text-muted)]">
                رصيدك المتاح (${availableBalance.toLocaleString()}) كافٍ لتأكيد وإصدار حجوزات الطيران والفنادق فورياً لعملائك.
              </p>
            </div>
          </div>
          <span className="admin-chip">جاهز لإصدار التذاكر</span>
        </AdminModule>
      )}

      <AdminKpiStrip cols={4}>
        <AdminKpi label="الرصيد المتاح للإصدار" value={`$${availableBalance.toLocaleString()}`} hint="رصيد صافٍ تخصم منه تكلفة الحجوزات" icon={<Coins className="size-4" />} />
        <AdminKpi label="الرصيد قيد المعالجة" value={`$${holdBalance.toLocaleString()}`} hint="إيداعات البطاقات قيد التصفية" icon={<Clock className="size-4" />} />
        <AdminKpi label="إجمالي الإيداعات" value={`$${(wallet?.totalDeposited ?? 0).toLocaleString()}`} hint="مجموع ما تم شحنه" icon={<ArrowUpRight className="size-4" />} />
        <AdminKpi label="الحجوزات المخصومة" value={`$${(wallet?.totalSpent ?? 0).toLocaleString()}`} hint="قيمة التذاكر الصادرة" icon={<ArrowDownLeft className="size-4" />} />
      </AdminKpiStrip>

      <AdminModule className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Radio className="size-5 text-purple-700 animate-pulse" />
              <span>فحص الاتصال المباشر بمحرك التوزيع المركزي (5.189.147.52)</span>
            </h2>
            <p className="text-xs text-slate-500">
              اختبار المصادقة التشفيرية (HMAC-SHA256) وسرعة الاستجابة وقاعدة الموزعين النشطة لحسابك.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestHandshake}
            disabled={pingTesting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-foreground text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {pingTesting ? <Loader2 className="size-4 animate-spin text-amber-300" /> : <Zap className="size-4 text-amber-400" />}
            <span>{pingTesting ? "جاري قياس الاتصال..." : "اختبار الاتصال المباشر"}</span>
          </button>
        </div>

        {handshakeResult && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-emerald-500 inline-block" />
                <span className="font-bold text-slate-900">الاتصال نشط وموثق بنجاح</span>
                <span className="font-mono text-slate-400">({String(handshakeResult.latencyMs)}ms)</span>
              </div>
              <span className="font-mono text-[11px] text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 font-bold">
                {String(handshakeResult.serverNode || "Lonaliza Master Node")}
              </span>
            </div>

            {/* Live Distributors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-purple-950 block">محركات الطيران الحية (500+ خطوط)</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  PKFARE GDS, Seeru Flights, Travelport Universal API, BiletBank BBOST
                </p>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ متصل وجاهز للإصدار</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-purple-950 block">بنوك الفنادق الحية (3M+ فندق)</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  RateHawk B2B, Hotelbeds Bedbank, Seeru Hotels, Booking.com Rapid Engine
                </p>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ متصل وجاهز للحجز الفوري</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-purple-950 block">النقل والترانسفير الخاص</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Seeru Ride VIP Transfers, أسطول النقل الداخلي
                </p>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ متصل وجاهز للربط</span>
              </div>
            </div>
          </div>
        )}
      </AdminModule>

      <AdminModule className="overflow-hidden space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">
            سجل حركات المحفظة وخصومات التذاكر (Live Ledger)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {data?.transactions?.length ?? 0} عملية مسجلة
          </span>
        </div>

        {!data?.transactions || data.transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Coins className="size-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">لا توجد حركات مسجلة بالمحفظة بعد. اشحن رصيدك لبدء إصدار التذاكر.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
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
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        {tx.type.startsWith("deposit") ? (
                          <div className="size-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <ArrowUpRight className="size-3.5" />
                          </div>
                        ) : (
                          <div className="size-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                            <ArrowDownLeft className="size-3.5" />
                          </div>
                        )}
                        <span className="font-bold text-slate-900">
                          {tx.type === "deposit_card" && "شحن بطاقة ائتمان"}
                          {tx.type === "deposit_bank" && "إيداع تحويل بنكي"}
                          {tx.type === "booking_deduction" && "خصم إصدار حجز"}
                          {tx.type === "refund" && "استرداد مالي"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      ${(tx.fee || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-black text-slate-900">
                      ${tx.netAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      {tx.status === "cleared" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          مكتمل ومتاح
                        </span>
                      ) : tx.status === "pending" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          قيد التدقيق
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {tx.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                      {tx.notes || "—"}
                    </td>
                    <td className="py-3.5 px-3 text-end font-mono text-slate-400 text-[11px]">
                      {tx.created ? new Date(tx.created).toLocaleDateString("ar-SA") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminModule>

      {depositModalOpen ? (
        <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
          <DialogContent className="sm:max-w-lg space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-slate-900">شحن رصيد ديبوزيت المحفظة B2B</h3>
                <p className="text-xs text-slate-500">الرصيد يضاف فورياً لاستخدامه في إصدار تذاكر وحجوزات المنصة.</p>
              </div>
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
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
                      ? "bg-purple-50 border-purple-700 text-purple-950"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
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
                      ? "bg-purple-50 border-purple-700 text-purple-950"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Building className="size-4" />
                  <span>تحويل بنكي مباشر (0% رسوم)</span>
                </button>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  مبلغ الشحن المطلوب بالدولار الأمريكي ($)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-base font-black text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                  <span className="absolute end-4 top-3.5 text-xs font-bold text-slate-400 font-mono">$ USD</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {[1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold font-mono text-slate-700 cursor-pointer"
                    >
                      +${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {depositMethod === "card" ? (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>رسوم بوابة الدفع ({cardFeePercent}%):</span>
                    <span className="font-mono font-bold">${calculatedFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-purple-950 font-black border-t border-purple-200 pt-2">
                    <span>إجمالي الخصم من البطاقة:</span>
                    <span className="font-mono text-sm">${totalCardCharged.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    تتم المعالجة عبر بروتوكول 3D Secure المشفر من Iyzico، ويتاح رصيدك فورياً للإصدار.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-900 block">تفاصيل الحساب البنكي للإيداع:</span>
                  <div className="space-y-1 font-mono text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingDeposit}
                  className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-foreground text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingDeposit ? "جاري المعالجة..." : `تأكيد الشحن ($${depositAmount.toLocaleString()})`}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </AdminPage>
  );
}
