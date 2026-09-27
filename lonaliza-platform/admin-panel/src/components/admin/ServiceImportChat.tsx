"use client";

import { useState } from "react";
import {
  Bot,
  Link2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { ImportServiceType } from "@/lib/import-schemas";
import { AdminCopilotPanel } from "@/components/admin/copilot";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const LABELS: Record<
  ImportServiceType,
  { title: string; placeholder: string; tip: string }
> = {
  hotel: {
    title: "استيراد فندق بالذكاء الاصطناعي",
    placeholder:
      "الصق رابط الفندق واكتب: أضف هذا الفندق بكل غرفه وصوره وتفاصيله",
    tip: "مثال:\nأضف هذا الفندق بالكامل مع الغرف والصور والتقييمات\nhttps://www.booking.com/hotel/...",
  },
  transfer: {
    title: "استيراد ترانسفير / سيارة VIP",
    placeholder: "الصق رابط السيارة أو الترانسفير واطلب إضافته بالكامل",
    tip: "مثال: أضف هذه السيارة بكل التفاصيل والصور\nhttps://...",
  },
  flight: {
    title: "استيراد رحلة طيران",
    placeholder: "الصق رابط عرض الطيران أو صف الرحلة",
    tip: "مثال: أضف رحلة الإمارات DXB→LHR بهذا الرابط\nhttps://...",
  },
  package: {
    title: "استيراد باقة رحلات",
    placeholder: "الصق رابط الباقة واطلب إضافتها مع البرنامج",
    tip: "مثال: أضف هذه الباقة بالكامل\nhttps://...",
  },
  tour: {
    title: "استيراد جولة",
    placeholder: "الصق رابط الجولة واطلب إضافتها",
    tip: "مثال: أضف جولة دبي الصحراوية من هذا الرابط",
  },
  visa: {
    title: "استيراد تأشيرة / فيزا",
    placeholder: "الصق رابط صفحة الفيزا أو صف نوع التأشيرة",
    tip: "مثال: أضف فيزا الإمارات من هذا الرابط\nhttps://...",
  },
};

type Props = {
  serviceType: ImportServiceType;
  onApply: (item: Record<string, unknown>) => void | Promise<void>;
  className?: string;
};

export default function ServiceImportChat({
  serviceType,
  onApply,
  className = "",
}: Props) {
  const { t } = useLocale();
  const meta = LABELS[serviceType];
  const [open, setOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState("");

  const apply = async () => {
    if (!pendingItem) return;
    try {
      await onApply(pendingItem);
      setToast("تمت إضافة الخدمة إلى الكتالوج بنجاح");
      setPendingItem(null);
      setTimeout(() => setToast(""), 3000);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "فشل الحفظ");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-admin-accent to-fuchsia-600 text-foreground text-sm font-semibold shadow-lg shadow-[hsl(var(--primary))]/20 hover:opacity-95 transition ${className}`}
      >
        <Sparkles size={16} />شات استيراد بالـ AI
                      </button>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[hsl(var(--primary))]/30 bg-background/90 overflow-hidden ${className}`}
      dir="rtl"
    >
      <div className='flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-gradient-to-l from-[hsl(var(--primary))]/20 to-transparent'>
        <div className='flex items-center gap-2 text-foreground font-semibold'>
          <Bot className="text-primary" size={18} />
          {meta.title}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className='text-muted-foreground hover:text-foreground text-sm'
        >
          إغلاق
        </button>
      </div>

      {toast ? (
        <div className="mx-4 mt-3 flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      ) : null}

      {pendingItem ? (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-wrap items-center gap-3">
          <div className="flex-1 text-sm text-emerald-200">
            <p className="font-semibold flex items-center gap-2">
              <Link2 size={14} />
              جاهز للإضافة إلى الكتالوج
            </p>
            <p className="text-emerald-200/70 text-xs mt-1 line-clamp-2">
              {String(
                pendingItem.nameEn ||
                  pendingItem.nameAr ||
                  pendingItem.titleEn ||
                  pendingItem.titleAr ||
                  pendingItem.title ||
                  pendingItem.country ||
                  pendingItem.airline ||
                  "عنصر مستورد"
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void apply()}
            className='px-4 py-2 rounded-lg bg-emerald-500 text-foreground font-bold text-sm'
          >
            أضف الآن
          </button>
          <button
            type="button"
            onClick={() => setPendingItem(null)}
            className='p-2 text-muted-foreground hover:text-foreground'
            aria-label="تجاهل"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : null}

      <p className='px-4 pt-3 text-[11px] text-muted-foreground whitespace-pre-line'>{meta.tip}</p>
      <p className="px-4 pt-1 text-[10px] text-[var(--admin-btn-secondary-border)]/50 flex items-start gap-1">
        <AlertCircle size={12} className="mt-0.5 shrink-0" />
        {t.builderAgent.isolated}
      </p>

      <AdminCopilotPanel
        scope="services"
        title={meta.title}
        hint={t.builderAgent.isolated}
        placeholder={meta.placeholder}
        className="h-[320px]"
        host={{
          service: {
            serviceType,
            onPending: (item) => setPendingItem(item),
          },
        }}
        fallback={async (messages) => {
          const res = await fetch("/api/gemini/import-service", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceType, messages }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            error?: string;
            reply?: string;
            fetchNote?: string;
            item?: Record<string, unknown>;
          };
          if (data.item && typeof data.item === "object") {
            setPendingItem(data.item);
          }
          if (!data.ok) return data.error || "فشل الاستيراد";
          return `${data.reply || "تم التحليل."}${data.fetchNote ? `\n\n(${data.fetchNote})` : ""}`;
        }}
      />
    </div>
  );
}
