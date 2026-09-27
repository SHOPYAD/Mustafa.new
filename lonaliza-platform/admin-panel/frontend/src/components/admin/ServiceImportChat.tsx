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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className={`self-start w-fit ${className}`}>
        <Sparkles size={16} />
        شات استيراد بالـ AI
      </Button>
    );
  }

  return (
    <Card className={`overflow-hidden py-0 ${className}`} dir="rtl">
      <CardHeader className="flex-row items-center justify-between gap-3 border-b py-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot size={18} />
          {meta.title}
        </CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          إغلاق
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 px-0 pb-0">

      {toast ? (
        <div className="mx-4 mt-3 flex items-center gap-2 text-sm rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] px-3 py-2">
          <CheckCircle2 size={16} className="text-[color:var(--admin-gold)]" />
          {toast}
        </div>
      ) : null}

      {pendingItem ? (
        <div className="mx-4 mt-3 p-3 rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] flex flex-wrap items-center gap-3">
          <div className="flex-1 text-sm">
            <p className="font-semibold flex items-center gap-2">
              <Link2 size={14} />
              جاهز للإضافة إلى الكتالوج
            </p>
            <p className="text-[color:var(--admin-text-muted)] text-xs mt-1 line-clamp-2">
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
          <Button type="button" onClick={() => void apply()}>
            أضف الآن
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPendingItem(null)}
            aria-label="تجاهل"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ) : null}

      <p className="px-4 pt-3 text-[11px] text-[color:var(--admin-text-muted)] whitespace-pre-line">{meta.tip}</p>
      <p className="px-4 pt-1 text-[10px] text-[color:var(--admin-text-muted)] flex items-start gap-1">
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
      </CardContent>
    </Card>
  );
}
