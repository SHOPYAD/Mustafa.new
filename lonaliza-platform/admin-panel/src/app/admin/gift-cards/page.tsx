"use client";

import { useEffect, useState } from "react";
import {
  Gift,
  Plus,
  Copy,
  Check,
  Ban,
  Loader2,
  DollarSign,
  CreditCard,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

type Card = {
  id: string;
  code: string;
  amount: number;
  status: "active" | "redeemed" | "voided";
  purchaserId?: string;
  createdAt?: string;
};

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/gift-cards", { credentials: "same-origin" });
      const data = await res.json();
      if (data.ok) setCards(data.cards || []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleIssue = async () => {
    if (amount <= 0) return;
    setIssuing(true);
    try {
      await fetch("/api/admin/gift-cards", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      await load();
    } finally {
      setIssuing(false);
    }
  };

  const handleVoid = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في إبطال بطاقة الهدية هذه؟")) return;
    await fetch("/api/admin/gift-cards", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "void", id }),
    });
    await load();
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeCards = cards.filter((c) => c.status === "active");
  const redeemedCards = cards.filter((c) => c.status === "redeemed");
  const voidedCards = cards.filter((c) => c.status === "voided");
  const totalActiveValue = activeCards.reduce((acc, c) => acc + (c.amount || 0), 0);

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Gift size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">بطاقات الهدايا الرقمية</h1>
            <p className="text-sm text-muted-foreground">إصدار وإدارة رصيد بطاقات الهدايا والقسائم المسبقة الدفع للعملاء والشركات</p>
          </div>
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">إجمالي البطاقات</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">المجموع</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{cards.length}</p>
          <p className="text-[11px] text-muted-foreground">بطاقة تم إنشاؤها في النظام</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">البطاقات النشطة</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">قابلة للاستخدام</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{activeCards.length}</p>
          <p className="text-[11px] text-muted-foreground">جاهزة للخصم الفوري عند الحجز</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">القيمة النشطة</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">USD</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">${totalActiveValue.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">رصيد هدايا متاح للإنفاق</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">تم استردادها</span>
            <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">مستخدمة</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{redeemedCards.length}</p>
          <p className="text-[11px] text-muted-foreground">تم تطبيقها بالكامل على الحجوزات</p>
        </div>
      </div>

      {/* Manual Issue Box */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-foreground mb-3">إصدار بطاقة هدية جديدة</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">المبلغ بالدولار:</span>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
              <input
                type="number"
                min="10"
                step="10"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-32 ps-7 pe-3 py-2 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={issuing}
            onClick={handleIssue}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 shadow-md shadow-primary/20 disabled:opacity-60 transition-all cursor-pointer"
          >
            {issuing ? <Loader2 size={15} className="animate-spin text-white" /> : <Plus size={15} className="text-white stroke-white" />}
            <span className="text-white">إصدار بطاقة الآن</span>
          </button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">سجل بطاقات الهدايا</h2>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-muted-foreground">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : cards.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            <Gift className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
            لا توجد بطاقات هدايا مُصدرة حتى الآن. استخدم النموذج أعلاه لإنشاء أول بطاقة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4 text-start">رمز البطاقة (Code)</th>
                  <th className="py-3 px-4 text-start">القيمة</th>
                  <th className="py-3 px-4 text-start">الحالة</th>
                  <th className="py-3 px-4 text-start">المشتري / المعرف</th>
                  <th className="py-3 px-4 text-end">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cards.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground text-sm tracking-wider" dir="ltr">{c.code}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(c.code)}
                          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="نسخ الكود"
                        >
                          {copiedCode === c.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground text-sm">
                      ${c.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        c.status === "active"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          : c.status === "redeemed"
                          ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                      }`}>
                        {c.status === "active" ? "نشطة" : c.status === "redeemed" ? "مستخدمة" : "ملغاة"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {c.purchaserId || "إصدار يدوي (لوحة التحكم)"}
                    </td>
                    <td className="py-3 px-4 text-end">
                      {c.status === "active" && (
                        <button
                          type="button"
                          onClick={() => handleVoid(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Ban size={12} />
                          <span>إبطال</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
