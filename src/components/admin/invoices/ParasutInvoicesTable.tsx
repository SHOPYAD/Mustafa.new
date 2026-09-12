"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { ParasutInvoiceRecord } from "@/lib/server/parasut/types";

export default function ParasutInvoicesTable({
  refreshKey,
}: {
  refreshKey?: number;
}) {
  const [invoices, setInvoices] = useState<ParasutInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedEttn, setCopiedEttn] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/parasut/invoices");
      const data = await res.json();
      if (data.ok && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [refreshKey]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEttn(id);
    setTimeout(() => setCopiedEttn(null), 2000);
  };

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv: any) => {
      const bId = (inv.bookingId || inv.booking_id || "").toLowerCase();
      const invNo = (inv.invoiceNo || inv.invoice_number || "").toLowerCase();
      const ettn = (inv.ettn || "").toLowerCase();
      const cName = (inv.customerName || inv.customer_name || "").toLowerCase();
      const cEmail = (inv.customerEmail || inv.customer_email || "").toLowerCase();
      return (
        bId.includes(q) ||
        invNo.includes(q) ||
        ettn.includes(q) ||
        cName.includes(q) ||
        cEmail.includes(q)
      );
    });
  }, [invoices, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Table Header & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
            <FileCheck2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              سجل الفواتير الحكومية الصادرة (GİB e-Arşiv Registry)
            </h3>
            <p className="text-xs text-white/40">
              إجمالي {invoices.length} فاتورة رسمية مسجلة وموقعة رقمياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الحجز، EAR، أو العميل..."
              className="w-64 ps-8 pe-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/40"
            />
          </div>

          <button
            type="button"
            onClick={fetchInvoices}
            disabled={loading}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-amber-400" : ""} />
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs text-white/80">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="py-3 px-4 text-start">رقم الحجز</th>
                <th className="py-3 px-4 text-start">العميل</th>
                <th className="py-3 px-4 text-start">رقم الفاتورة الرسمية (EAR)</th>
                <th className="py-3 px-4 text-start">معرف ETTN</th>
                <th className="py-3 px-4 text-start">المبلغ والعملة</th>
                <th className="py-3 px-4 text-start">الإعفاء والضريبة</th>
                <th className="py-3 px-4 text-start">تاريخ الإصدار</th>
                <th className="py-3 px-4 text-start">حالة التوقيع</th>
                <th className="py-3 px-4 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading && invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-400 mb-2" />
                    <span>جارٍ تحميل سجل الفواتير...</span>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    <FileText className="mx-auto h-8 w-8 text-white/20 mb-2" />
                    <span>لا توجد فواتير رسمية صادرة مطابقة للبحث حتى الآن</span>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv: any) => {
                  const bId = inv.bookingId || inv.booking_id;
                  const invNo = inv.invoiceNo || inv.invoice_number;
                  const cName = inv.customerName || inv.customer_name || "—";
                  const cEmail = inv.customerEmail || inv.customer_email || "—";
                  const amt = inv.amount ?? inv.net_total ?? 0;
                  const cur = inv.currency || "USD";
                  const taxCode = inv.vatExemptionReasonCode || inv.tax_exemption_code || "302";
                  const dateStr = inv.issuedAt || inv.issued_at;
                  return (
                    <tr
                      key={bId}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Booking ID */}
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {bId}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{cName}</div>
                        <div className="text-[10px] text-white/40 font-mono">{cEmail}</div>
                      </td>

                      {/* Official Invoice Number */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-0.5 font-mono font-bold text-red-300">
                          <span>{invNo || "—"}</span>
                        </div>
                      </td>

                      {/* ETTN UUID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-white/60 max-w-[120px] truncate" title={inv.ettn}>
                            {inv.ettn ? `${inv.ettn.slice(0, 8)}...` : "—"}
                          </span>
                          {inv.ettn && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(inv.ettn, bId)}
                              className="text-white/40 hover:text-white transition-colors cursor-pointer"
                              title="نسخ كود ETTN"
                            >
                              {copiedEttn === bId ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Amount & Currency */}
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {Number(amt).toFixed(2)} {cur}
                      </td>

                      {/* Tax & Exemption */}
                      <td className="py-3 px-4">
                        <span className="inline-block rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          {taxCode} (KDV %0)
                        </span>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3 px-4 text-[11px] text-white/50 font-mono">
                        {dateStr ? dateStr.slice(0, 16).replace("T", " ") : "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 size={11} />
                          <span>موقع وموثق (GİB)</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Download Official Government PDF */}
                          <a
                            href={`/api/account/invoices/${bId}/earchive`}
                            download={`e-Arsiv-${invNo || bId}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600/80 hover:bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white transition-all shadow-sm"
                            title="تحميل فاتورة الدولة e-Arşiv الرسمية"
                          >
                            <Download size={11} />
                            <span>PDF الدولة</span>
                          </a>

                          {/* View Platform Luxury PDF */}
                          <a
                            href={`/api/account/invoices/${bId}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] px-2 py-1 text-[11px] text-white/70 hover:text-white transition-all"
                            title="معاينة فاتورة المنصة"
                          >
                            <Eye size={11} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
