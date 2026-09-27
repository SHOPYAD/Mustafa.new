"use client";

import { Printer, Download, Share2, MessageCircle } from "lucide-react";

export default function PrintInvoiceButton() {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: "فاتورة حجز رسمية - لوناليزا للسياحة والسفر",
          url,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
        alert("تم نسخ رابط الفاتورة الموثقة للحافظة بنجاح!");
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 rounded-2xl bg-[#d97706] hover:bg-[#b45309] text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer"
      >
        <Download size={14} />
        <span>تحميل الفاتورة (PDF)</span>
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer"
        title="مشاركة الرابط"
      >
        <Share2 size={14} />
        <span>مشاركة</span>
      </button>
    </div>
  );
}
