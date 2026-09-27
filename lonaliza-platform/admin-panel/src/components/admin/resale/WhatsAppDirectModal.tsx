"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Loader2,
  Phone,
  MessageCircle,
  ExternalLink,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import type { ScrapedBusinessLead, B2BMarketingTemplate } from "@/lib/server/gmaps-scraper/types";

interface WhatsAppDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: ScrapedBusinessLead | null;
  templates: B2BMarketingTemplate[];
  onSentSuccess: (leadId: string) => void;
}

export default function WhatsAppDirectModal({
  isOpen,
  onClose,
  lead,
  templates,
  onSentSuccess,
}: WhatsAppDirectModalProps) {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("1");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Filter whatsapp templates
  const waTemplates = templates.filter((t) => t.channel === "whatsapp" || !t.channel);

  // When lead or template changes, interpolate message
  useEffect(() => {
    if (!lead) return;

    if (selectedTemplateId) {
      const t = waTemplates.find((item) => item.id === selectedTemplateId);
      if (t) {
        let body = t.body;
        body = body.replaceAll("{company_name}", lead.title || "شريكنا العزيز");
        body = body.replaceAll("{city}", lead.city || "إسطنبول");
        body = body.replaceAll("{category}", lead.category || "الخدمات السياحية");
        body = body.replaceAll("{demo_url}", "https://lonaliza.com/demo");
        setMessageText(body);
        return;
      }
    }

    // Default professional B2B WhatsApp copy
    if (!messageText) {
      setMessageText(
        `السلام عليكم ورحمة الله، تحية طيبة لإدارة ${lead.title} في ${lead.city} 🌸\n\n` +
        `معكم فريق شراكات الأعمال السياحية لمنصة لوناليزا (Lonaliza B2B Hub).\n\n` +
        `يسعدنا تقديم شراكة استراتيجية لتزويد مكتبكم بحلول الحجز السياحي المباشر (White-Label):\n` +
        `✈️ محرك حجز طيران وفنادق عالمي يضم 500,000+ فندق بأقل عمولة وبأسعار الجملة.\n` +
        `💳 بوابات دفع إلكترونية معتمدة وإصدار تذاكر لحظي.\n` +
        `🤖 موظف مبيعات واتساب ذكي يخدم عملاءكم ويقفل الحجوزات 24/7.\n\n` +
        `يمكنكم تجربة النسخة الحية للمنصة عبر الرابط التالي:\n` +
        `https://lonaliza.com/demo\n\n` +
        `هل يناسبكم التحدث عبر مكالمة سريعة لمدة 5 دقائق لمناقشة تفعيل المنصة لشركتكم؟`
      );
    }
  }, [lead, selectedTemplateId]);

  if (!isOpen || !lead) return null;

  const cleanPhone = (lead.whatsappPhone || lead.phone || "").replace(/\D/g, "");

  // Internal WhatsApp Send through Platform Gateway
  const handleSendViaInternalGateway = async () => {
    if (!cleanPhone) {
      setFeedback({ type: "error", text: "لا يوجد رقم هاتف صالح لهذه الشركة" });
      return;
    }
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/resale/marketing/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: lead.id,
          phone: cleanPhone,
          message: messageText,
          slotId: selectedSlot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setFeedback({
          type: "success",
          text: data.sentViaGateway
            ? "تم إرسال الرسالة بنجاح عبر بوابة واتساب الداخلية المربوطة!"
            : "تم تسجيل وتجهيز الرسالة في صندوق المحادثات الداخلية للوحة التحكم.",
        });
        onSentSuccess(lead.id);
        setTimeout(() => onClose(), 1500);
      } else {
        setFeedback({ type: "error", text: data.error || "تعذر إرسال الرسالة عبر البوابة" });
      }
    } catch {
      setFeedback({ type: "error", text: "خطأ في الاتصال بخادم الأتمتة الداخلي" });
    } finally {
      setSending(false);
    }
  };

  // Deep-link to internal Chat Inbox in Admin Automation
  const handleOpenInternalChat = () => {
    if (!cleanPhone) {
      setFeedback({ type: "error", text: "لا يوجد رقم هاتف صالح للانتقال إليه" });
      return;
    }
    router.push(`/admin/automation?tab=inbox&contact=${cleanPhone}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" dir="rtl">
      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border bg-card-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
              <MessageSquare className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-foreground">مراسلة واتساب عبر البوابة الداخلية</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                  لوحة التحكم المركزية
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                إرسال مباشر عبر أرقام واتساب المربوطة دون مغادرة النظام
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Company Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-card-2 border border-border flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-black text-foreground text-xs">{lead.title}</div>
              <div className="text-[11px] text-muted-foreground">{lead.city} • {lead.category}</div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 font-mono font-bold text-xs dir-ltr">
              <Phone className="size-3.5" />
              <span>{lead.phone || "بدون رقم"}</span>
            </div>
          </div>

          {/* Internal Sender Number Selector (Slots 1 to 5) */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5 text-xs">
              <Smartphone className="size-3.5 text-primary" />
              <span>رقم الإرسال المعتمد (من بوابات واتساب الـ 5 بالمنصة):</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {["1", "2", "3", "4", "5"].map((num) => {
                const isSelected = selectedSlot === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedSlot(num)}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-xs border transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    رقم {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Selector */}
          <div className="space-y-1">
            <label className="font-bold text-foreground block">اختيار قالب تسويقي جاهز:</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary font-bold cursor-pointer"
            >
              <option value="">— رسالة ترحيبية وشراكة سياحية B2B —</option>
              {waTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground">نص الرسالة:</label>
              <span className="text-[10px] text-muted-foreground font-mono">
                رابط الديمو: https://lonaliza.com/demo
              </span>
            </div>
            <textarea
              rows={9}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary leading-relaxed font-sans text-xs"
              placeholder="اكتب رسالتك التسويقية هنا..."
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card-2 flex flex-wrap items-center justify-between gap-2">
          {/* Quick Deep link to Chat Box */}
          <button
            type="button"
            onClick={handleOpenInternalChat}
            className="px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground font-bold text-xs transition-colors border border-border cursor-pointer flex items-center gap-1.5"
            title="الانتقال إلى صندوق المحادثات الحية في لوحة التحكم لمتابعة هذا العميل"
          >
            <MessageCircle className="size-3.5 text-primary" />
            <span>صندوق المحادثات الداخلي</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground font-bold text-xs transition-colors border border-border cursor-pointer"
            >
              إلغاء
            </button>

            {/* Direct Send via Internal Gateway */}
            <button
              type="button"
              onClick={handleSendViaInternalGateway}
              disabled={sending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              <span>إرسال فوري عبر بوابة واتساب الداخلية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
