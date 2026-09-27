"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Loader2,
  Globe,
  Building2,
  Eye,
  Edit3,
  ExternalLink,
  Laptop,
  Check,
} from "lucide-react";
import type { ScrapedBusinessLead, B2BMarketingTemplate } from "@/lib/server/gmaps-scraper/types";

interface EmailDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: ScrapedBusinessLead | null;
  templates: B2BMarketingTemplate[];
  onSentSuccess: (leadId: string) => void;
}

export default function EmailDirectModal({
  isOpen,
  onClose,
  lead,
  templates,
  onSentSuccess,
}: EmailDirectModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [subjectText, setSubjectText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("preview");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter email templates
  const emailTemplates = templates.filter((t) => t.channel === "email" || !t.channel);

  useEffect(() => {
    if (!lead) return;

    setEmailTo(lead.email || "");

    if (selectedTemplateId) {
      const t = emailTemplates.find((item) => item.id === selectedTemplateId);
      if (t) {
        let subj = t.title || "فرصة شراكة سياحية B2B مع منصة لوناليزا";
        subj = subj.replaceAll("{company_name}", lead.title || "شريكنا العزيز");
        subj = subj.replaceAll("{city}", lead.city || "إسطنبول");
        setSubjectText(subj);

        let body = t.body;
        body = body.replaceAll("{company_name}", lead.title || "شريكنا العزيز");
        body = body.replaceAll("{city}", lead.city || "إسطنبول");
        body = body.replaceAll("{category}", lead.category || "الخدمات السياحية");
        body = body.replaceAll("{demo_url}", "https://lonaliza.com/demo");
        setBodyText(body);
        return;
      }
    }

    // Default high-converting B2B email
    if (!subjectText) {
      setSubjectText(`فرصة شراكة وتوريد سياحي مباشر مع ${lead.title} في ${lead.city}`);
    }
    if (!bodyText) {
      setBodyText(
        `السادة الأفاضل في إدارة شركة ${lead.title} الموقرين،\n\n` +
        `تحية طيبة وبعد،\n\n` +
        `يسعدنا في منصة لوناليزا (Lonaliza B2B Platform) تقديم عرض شراكة استراتيجي لتمكين وكالتكم السياحية المتميزة في ${lead.city} من امتلاك أحدث التقنيات السياحية المتطورة.\n\n` +
        `نوفر لكم نظاماً متكاملاً (White-Label) يتيح لشركتكم إطلاق منصتكم وتطبيقكم الخاص بهويتكم وعلامتكم التجارية:\n` +
        `• ربط فوري بأكثر من 500,000 فندق حول العالم بأسعار الجملة التفضيلية.\n` +
        `• محرك إصدار تذاكر الطيران على كافة الخطوط الدولية والمحلية.\n` +
        `• بوابات دفع إلكترونية متعددة تدعم البطاقات البنكية ومدى والتحويلات المباشرة.\n` +
        `• موظف مبيعات ذكاء اصطناعي (AI Agent) يعمل على مدار الساعة لخدمة عملائكم عبر واتساب.\n\n` +
        `يسعدنا اطلاعكم على النسخة الحية للمنصة ومناقشة تفاصيل التعاون.\n\n` +
        `وتفضلوا بقبول فائق الاحترام والتقدير،\n` +
        `فريق تطوير الأعمال B2B | منصة لوناليزا العالمية`
      );
    }
  }, [lead, selectedTemplateId]);

  // Generate full branded HTML email
  const fullHtmlContent = useMemo(() => {
    if (!lead) return "";
    const cleanParagraphs = bodyText
      .split("\n\n")
      .map((p) => `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.8; color: #334155;">${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectText}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: right;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Luxury Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #312e81 100%); padding: 36px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 10px 20px; margin-bottom: 14px;">
                      <span style="color: #ffffff; font-size: 18px; font-weight: 900; letter-spacing: 1px;">LONALIZA B2B</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; line-height: 1.4;">
                      شراكة الحلول السياحية الرقمية المتكاملة
                    </h1>
                    <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 13px;">
                      عرض استراتيجي مخصص لإدارة ${lead.title} • ${lead.city}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Body -->
          <tr>
            <td style="padding: 32px 32px 20px;">
              ${cleanParagraphs}

              <!-- 4 Feature Value Props Cards -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 20px;">
                <tr>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 6px;">🏨</div>
                    <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">500,000+ فندق</div>
                    <div style="font-size: 12px; color: #64748b; line-height: 1.5;">تأكيد فوري وأسعار جملة منافسة بدون وسيط.</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 6px;">✈️</div>
                    <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">طيران عالمي GDS</div>
                    <div style="font-size: 12px; color: #64748b; line-height: 1.5;">إصدار مباشر لكافة شركات الطيران العالمية.</div>
                  </td>
                </tr>
                <tr><td colspan="3" height="12"></td></tr>
                <tr>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 6px;">💳</div>
                    <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">بوابات دفع جاهزة</div>
                    <div style="font-size: 12px; color: #64748b; line-height: 1.5;">فيزا، ماستركارد، مدى، مع تسويات مالية سريعة.</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 6px;">🤖</div>
                    <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">وكيل واتساب ذكي</div>
                    <div style="font-size: 12px; color: #64748b; line-height: 1.5;">خدمة عملاء 24/7 بلهجات متعددة واقفال الحجوزات.</div>
                  </td>
                </tr>
              </table>

              <!-- Big Visual CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0 24px;">
                <tr>
                  <td align="center">
                    <a href="https://lonaliza.com/demo" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);">
                      استكشف النسخة التجريبية الحية (Live Demo) ↗
                    </a>
                    <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
                      تصفح المنصة مباشرة عبر الرابط الرسمي: https://lonaliza.com/demo
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: bold; color: #475569;">
                منصة لوناليزا للسياحة والتقنية الفندقية (Lonaliza Travel Platform)
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                تم إرسال هذا العرض الرسمي لشركة ${lead.title} المعتمدة في ${lead.city}، ${lead.country}.
              </p>
              <p style="margin: 6px 0 0; font-size: 11px; color: #94a3b8;">
                جميع الحقوق محفوظة © 2026 Lonaliza.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }, [lead, subjectText, bodyText]);

  if (!isOpen || !lead) return null;

  const handleSendEmail = async () => {
    if (!emailTo || !emailTo.includes("@")) {
      setFeedback({ type: "error", text: "يرجى إدخال عنوان بريد إلكتروني صالح للمستلم" });
      return;
    }
    if (!subjectText.trim()) {
      setFeedback({ type: "error", text: "يرجى كتابة عنوان للرسالة" });
      return;
    }
    if (!bodyText.trim()) {
      setFeedback({ type: "error", text: "محتوى البريد الإلكتروني لا يمكن أن يكون فارغاً" });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/resale/marketing/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim(),
          toName: lead.title,
          subject: subjectText.trim(),
          html: fullHtmlContent,
          text: bodyText,
          companyId: lead.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setFeedback({ type: "success", text: "تم إرسال البريد الإلكتروني الفاخر بنجاح عبر خادم SMTP!" });
        onSentSuccess(lead.id);
        setTimeout(() => onClose(), 1500);
      } else {
        setFeedback({ type: "error", text: data.error || "فشل إرسال البريد" });
      }
    } catch {
      setFeedback({ type: "error", text: "خطأ في الاتصال بخادم البريد الإلكتروني" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" dir="rtl">
      <div className="relative w-full max-w-3xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-border bg-card-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20">
              <Mail className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-foreground">مراسلة بريد إلكتروني رسمي (B2B Email Hub)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20">
                  قالب بصري تفاعلي
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                إرسال بريد تسويقي فاخر بهوية لوناليزا لشركة {lead.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-muted/60 p-1 border border-border text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="size-3.5" />
                <span>المعاينة البصرية</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "edit"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="size-3.5" />
                <span>تحرير النص</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Email / Subject Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground block">البريد الإلكتروني للمستلم:</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="example@agency.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-mono focus:outline-none focus:border-primary text-xs"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-foreground block">اختيار قالب جاهز:</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary font-bold cursor-pointer text-xs"
              >
                <option value="">— قالب الشراكة السياحية الافتراضي —</option>
                {emailTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground block">عنوان الرسالة (Subject):</label>
            <input
              type="text"
              value={subjectText}
              onChange={(e) => setSubjectText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary font-bold text-xs"
            />
          </div>

          {/* Conditional View: Live Visual Preview vs Editor */}
          {activeTab === "preview" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-bold">المعاينة الحقيقية للبريد كما سيظهر في صندوق المستلم:</span>
                <span className="font-mono text-[10px]">https://lonaliza.com/demo</span>
              </div>
              <div className="w-full h-80 rounded-2xl border border-border bg-slate-100 overflow-hidden shadow-inner">
                <iframe
                  title="Email Live Preview"
                  srcDoc={fullHtmlContent}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-foreground">نص الرسالة الأساسي:</label>
                <span className="text-[10px] text-muted-foreground">
                  المتغيرات المدعومة: {'{company_name}'}, {'{city}'}, {'{demo_url}'}
                </span>
              </div>
              <textarea
                rows={11}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary leading-relaxed font-sans text-xs"
                placeholder="اكتب محتوى البريد الإلكتروني..."
              />
            </div>
          )}

          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold ${
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
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Globe className="size-3.5 text-primary" />
            <span>يتم الإرسال عبر خادم البريد المعتمد للمنصة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground font-bold text-xs transition-colors border border-border cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={sending}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-2"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              <span>إرسال البريد الإلكتروني الفاخر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
