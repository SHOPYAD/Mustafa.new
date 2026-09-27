// src/components/admin/transfers/QuoteRequestsTab.tsx
"use client";

import React, { useState } from "react";
import {
  FileQuestion,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Users,
  Luggage,
  DollarSign,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  ExternalLink,
} from "lucide-react";

interface Props {
  quoteRequests: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onUpdateQuote: (data: {
    id: string;
    quotedAmount?: number;
    quotedCurrency?: string;
    status?: string;
    internalNote?: string;
  }) => Promise<void>;
}

export const QuoteRequestsTab: React.FC<Props> = ({
  quoteRequests,
  isLoading,
  onRefresh,
  onUpdateQuote,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingQuote, setEditingQuote] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [status, setStatus] = useState("quoted");
  const [internalNote, setInternalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = quoteRequests.filter((q) => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.contact?.name?.toLowerCase().includes(s) ||
      q.contact?.email?.toLowerCase().includes(s) ||
      q.contact?.phone?.includes(s) ||
      q.from?.label?.toLowerCase().includes(s) ||
      q.to?.label?.toLowerCase().includes(s)
    );
  });

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "new":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">جديد يحتاج تسعير</span>;
      case "in_progress":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-500 border border-sky-500/30">قيد المعالجة والتسعير</span>;
      case "quoted":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">تم تقديم العرض للعميل</span>;
      case "won":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">مؤكد ومقبول (تم الحجز)</span>;
      case "lost":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">ملغي أو مرفوض</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground">{st}</span>;
    }
  };

  const handleOpenEdit = (q: any) => {
    setEditingQuote(q);
    setAmount(q.quotedAmount ? String(q.quotedAmount) : "");
    setCurrency(q.quotedCurrency || "USD");
    setStatus(q.status || "quoted");
    setInternalNote(q.internalNote || "");
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;
    try {
      setIsSubmitting(true);
      await onUpdateQuote({
        id: editingQuote.id,
        quotedAmount: amount ? Number(amount) : undefined,
        quotedCurrency: currency,
        status,
        internalNote,
      });
      setEditingQuote(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "فشل تحديث طلب التسعير");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildWhatsAppQuoteLink = (q: any) => {
    const phone = (q.contact?.phone || "").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `مرحباً بك ${q.contact?.name || "عزيزنا العميل"} من شركة لوناليزا للسياحة والنقل الفاخر في تركيا 🌟\nبخصوص طلبكم الكريم للنقل:\nمن: ${q.from?.label}\nإلى: ${q.to?.label}\nالتاريخ: ${q.outboundAt}\nعدد الركاب: ${q.passengers?.adults || 1} ركاب\n\nيسرنا تقديم عرض سعر خاص لسيارة VIP مع سائق خاص يتحدث لغتكم:\nالسعر: ${q.quotedAmount ? `${q.quotedAmount} ${q.quotedCurrency || "USD"}` : "المحدد حسب الطلب"}\n\nيشمل السعر الاستقبال بالاسم والترحيب، تتبع رحلة الطيران، والوقود ورسوم الطرق.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-card border border-border/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
              طلبات التسعير المخصص (Custom Quotes)
            </span>
            <span className="text-xs text-muted-foreground font-mono">Bespoke VIP & Corporate Requests</span>
          </div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-amber-500" />
            طلبات عروض الأسعار والجولات الخاصة
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            إدارة طلبات كبار الشخصيات والرحلات بين المدن، تسعير الطلبات، والتواصل المباشر عبر واتساب.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/60 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: "all", label: "الكل" },
            { id: "new", label: "جديد (بانتظار التسعير)" },
            { id: "in_progress", label: "قيد الدراسة" },
            { id: "quoted", label: "تم تقديم العرض" },
            { id: "won", label: "مقبول وحُجز" },
            { id: "lost", label: "ملغي" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === item.id
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الهاتف أو المسار..."
            className="w-full pr-9 pl-3 py-1.5 rounded-xl text-xs bg-muted/50 border border-border/60 focus:outline-hidden focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Quotes List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border/60 shadow-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">لا توجد طلبات تسعير مطابقة</h3>
          <p className="text-xs text-muted-foreground">ستظهر هنا أي طلبات مخصصة يقدمها العملاء للنقل أو الجولات الخاصة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all space-y-4 shadow-xs"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{q.contact?.name || "عميل غير معروف"}</span>
                    {getStatusBadge(q.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-mono">{q.contact?.phone}</span>
                    </span>
                    {q.contact?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{q.contact.email}</span>
                      </span>
                    )}
                  </div>
                </div>

                {q.quotedAmount ? (
                  <div className="text-left font-mono">
                    <div className="text-xs text-muted-foreground font-sans">السعر المعروض</div>
                    <div className="text-lg font-black text-amber-500">
                      ${q.quotedAmount} <span className="text-xs">{q.quotedCurrency || "USD"}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-amber-500/90 bg-amber-500/10 px-2.5 py-1 rounded-xl">
                    بانتظار التسعير
                  </span>
                )}
              </div>

              {/* Route & Date */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">نقطة الانطلاق إلى الوجهة:</span>
                    <span className="font-bold text-foreground">{q.from?.label} ➔ {q.to?.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono text-foreground font-semibold">{q.outboundAt}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{q.passengers?.adults || 1} بالغين / {q.passengers?.children || 0} أطفال</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="w-3.5 h-3.5" />
                    <span>{q.luggage?.standard || 0} حقائب</span>
                  </span>
                </div>

                {q.notes && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground block mb-0.5">ملاحظات العميل:</span>
                    "{q.notes}"
                  </div>
                )}

                {q.internalNote && (
                  <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400">
                    <span className="font-bold block">ملاحظة داخلية للإدارة:</span>
                    {q.internalNote}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                <div className="text-[11px] text-muted-foreground font-mono">
                  {new Date(q.createdAt).toLocaleDateString("ar-EG")}
                </div>

                <div className="flex items-center gap-2">
                  {q.contact?.phone && (
                    <a
                      href={buildWhatsAppQuoteLink(q)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
                      title="مراسلة العميل بالعرض عبر واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تسعير وتعديل الحالة</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pricing / Edit Modal */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn" dir="rtl">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">
                  تسعير وتحديث حالة الطلب: {editingQuote.contact?.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingQuote(null)}
                className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-[11px] space-y-1">
                <div className="font-bold text-foreground">{editingQuote.from?.label} ➔ {editingQuote.to?.label}</div>
                <div className="text-muted-foreground">التاريخ: {editingQuote.outboundAt} | الركاب: {editingQuote.passengers?.adults || 1}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">السعر المعروض للعميل *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="مثال: 120"
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 font-mono text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">العملة</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="SAR">SAR (ر.س)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">حالة الطلب</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-hidden focus:border-amber-500"
                >
                  <option value="new">جديد (بانتظار التسعير)</option>
                  <option value="in_progress">قيد الدراسة والتواصل</option>
                  <option value="quoted">تم إرسال العرض للعميل</option>
                  <option value="won">مقبول ومؤكد (تم الحجز)</option>
                  <option value="lost">ملغي أو مرفوض</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">ملاحظة داخلية للإدارة</label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="نوع السيارة المتفق عليها، اسم السائق المقترح..."
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ التحديثات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
