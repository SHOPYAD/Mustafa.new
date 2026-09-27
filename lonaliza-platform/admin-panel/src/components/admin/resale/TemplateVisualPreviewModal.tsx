"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Eye,
  Smartphone,
  Monitor,
  Mail,
  MessageSquare,
  Sparkles,
  Send,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import type { B2BMarketingTemplate } from "@/lib/server/gmaps-scraper/types";

interface TemplateVisualPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: B2BMarketingTemplate | null;
  sampleCompany?: string;
  sampleCity?: string;
  onUseInCampaign?: (template: B2BMarketingTemplate) => void;
}

export default function TemplateVisualPreviewModal({
  isOpen,
  onClose,
  template,
  sampleCompany = "شركة المسافر الذهبي للسياحة والسفر",
  sampleCity = "إسطنبول",
  onUseInCampaign,
}: TemplateVisualPreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  // Compile subject and body with sample variables
  const compiledSubject = useMemo(() => {
    if (!template?.subject) return "عرض شراكة B2B استراتيجي مع منصة لوناليزا العالمية";
    return template.subject
      .replaceAll("{company_name}", sampleCompany)
      .replaceAll("{city}", sampleCity)
      .replaceAll("{demo_url}", "https://lonaliza.com/demo");
  }, [template, sampleCompany, sampleCity]);

  const compiledBody = useMemo(() => {
    if (!template?.body) return "";
    return template.body
      .replaceAll("{company_name}", sampleCompany)
      .replaceAll("{city}", sampleCity)
      .replaceAll("{category}", "الخدمات السياحية المتقدمة")
      .replaceAll("{demo_url}", "https://lonaliza.com/demo");
  }, [template, sampleCompany, sampleCity]);

  // Generate full Luxury HTML Email for email channel templates
  const fullHtmlContent = useMemo(() => {
    if (!template || template.channel !== "email") return "";

    const paragraphs = compiledBody
      .split("\n\n")
      .map(
        (p) =>
          `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.85; color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${p.replace(
            /\n/g,
            "<br/>"
          )}</p>`
      )
      .join("");

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${compiledSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: right;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Branded Luxury Burgundy Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c1a22 0%, #4a0d13 100%); padding: 36px 32px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: rgba(255,255,255,0.12); padding: 8px 18px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); margin-bottom: 14px;">
                      <span style="color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 0.5px;">LONALIZA GLOBAL B2B PLATFORM</span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 8px; line-height: 1.3;">منصة لوناليزا لتمكين شركات السياحة والسفر</h1>
                    <p style="color: #fecdd3; font-size: 13px; margin: 0; font-weight: 500;">بوابتكم لامتلاك أقوى نظام حجز فنادق وطيران وتقنيات سفر بهويتكم الخاصة</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Body Content -->
          <tr>
            <td style="padding: 36px 32px 24px;">
              <div style="border-right: 4px solid #7c1a22; padding-right: 14px; margin-bottom: 24px;">
                <span style="font-size: 12px; font-weight: 800; color: #7c1a22; text-transform: uppercase;">عرض شراكة حصري لـ ${sampleCity}</span>
                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0 0;">${compiledSubject}</h2>
              </div>

              <!-- Interp Body Paragraphs -->
              <div style="font-size: 15px; color: #334155; line-height: 1.85;">
                ${paragraphs}
              </div>

              <!-- 4 Feature Highlights Grid -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0; background-color: #fdf2f2; border: 1px solid #fecdd3; border-radius: 18px; padding: 18px 20px;">
                <tr>
                  <td width="50%" style="padding: 8px; vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">🏨 +500,000 فندق عالمي</div>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.5;">ربط مباشر وبأسعار الجملة التنافسية مع تأكيد فوري</div>
                  </td>
                  <td width="50%" style="padding: 8px; vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">✈️ محرك طيران GDS عالمي</div>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.5;">إصدار التذاكر المباشر على كافة الخطوط الجوية</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 8px; vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">💳 بوابات دفع إلكترونية</div>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.5;">دعم فيزا، ماستركارد، مدى، وباي بال مع فوترة فورية</div>
                  </td>
                  <td width="50%" style="padding: 8px; vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">🤖 وكيل مبيعات ذكاء اصطناعي</div>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.5;">إغلاق الحجوزات 24/7 عبر واتساب وتيليجرام آلياً</div>
                  </td>
                </tr>
              </table>

              <!-- Main Call To Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px;">
                <tr>
                  <td align="center">
                    <a href="https://lonaliza.com/demo" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7c1a22 0%, #4a0d13 100%); color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 16px 36px; border-radius: 14px; box-shadow: 0 8px 20px rgba(124, 26, 34, 0.35); text-align: center;">
                      ⚡ استعراض النسخة التجريبية الحية (Live Demo)
                    </a>
                    <div style="margin-top: 10px;">
                      <a href="https://lonaliza.com/demo" target="_blank" style="font-size: 11px; color: #94a3b8; text-decoration: underline;">https://lonaliza.com/demo</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; font-weight: 700;">منصة لوناليزا لخدمات السفر والسياحة B2B</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                تم إرسال هذا العرض حصرياً لشركائنا في قطاع السياحة والسفر. للاستفسار المباشر عبر واتساب: +90 501 570 92 01<br/>
                جميع الحقوق محفوظة © ${new Date().getFullYear()} Lonaliza.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }, [template, compiledSubject, compiledBody, sampleCity]);

  if (!isOpen || !template) return null;

  const isEmail = template.channel === "email";

  const handleCopy = () => {
    navigator.clipboard.writeText(isEmail ? fullHtmlContent : compiledBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isEmail ? "bg-primary/10 text-primary border border-primary/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              }`}
            >
              {isEmail ? <Mail className="size-5" /> : <MessageSquare className="size-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-foreground">{template.title}</h3>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isEmail ? "bg-primary/15 text-primary" : "bg-emerald-500/15 text-emerald-600"
                  }`}
                >
                  {isEmail ? "قالب HTML فاخر" : "رسالة واتساب"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{template.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  deviceMode === "desktop" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="معاينة شاشة كاملة (كمبيوتر)"
              >
                <Monitor className="size-3.5" />
                <span className="hidden sm:inline">كمبيوتر</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  deviceMode === "mobile" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="معاينة شاشة هاتف محمول"
              >
                <Smartphone className="size-3.5" />
                <span className="hidden sm:inline">جوال</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="نسخ كود القالب"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Live Preview Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 flex items-center justify-center min-h-[420px]">
          {isEmail ? (
            /* HTML Email Preview Frame */
            <div
              className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-white ${
                deviceMode === "mobile" ? "w-[380px] h-[580px]" : "w-full max-w-[660px] h-[580px]"
              }`}
            >
              <iframe
                srcDoc={fullHtmlContent}
                title="HTML Email Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-popups allow-scripts"
              />
            </div>
          ) : (
            /* WhatsApp Live Mobile Chat Bubble Preview */
            <div className="w-[360px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-[#0b141a] text-slate-100 flex flex-col h-[540px]">
              {/* WhatsApp App Bar */}
              <div className="bg-[#202c33] p-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-black text-xs text-white">
                    LZ
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-100">Lonaliza B2B Hub</span>
                      <CheckCircle2 className="size-3 text-emerald-400 fill-emerald-400/20" />
                    </div>
                    <span className="text-[10px] text-emerald-400">متصل الآن</span>
                  </div>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95">
                <div className="text-center">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#182229] text-slate-400 border border-slate-800">
                    اليوم
                  </span>
                </div>

                {/* Sent Message Bubble */}
                <div className="flex flex-col items-start max-w-[88%] mr-auto">
                  <div className="bg-[#005c4b] text-slate-100 p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed space-y-2 shadow-sm border border-emerald-800/40">
                    <p className="whitespace-pre-line">{compiledBody}</p>
                    <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-emerald-300/80">
                      <span>12:00 م</span>
                      <span>✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Input Simulation */}
              <div className="p-2.5 bg-[#202c33] flex items-center gap-2 border-t border-slate-800">
                <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-1.5 text-xs text-slate-400">
                  رسالة نصية...
                </div>
                <div className="size-8 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                  <Send className="size-3.5 rotate-180" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-card">
          <div className="text-xs text-muted-foreground">
            {isEmail ? (
              <span>رابط التجربة الرسمي داخل القالب: <strong className="text-foreground">https://lonaliza.com/demo</strong></span>
            ) : (
              <span>يمكن تخصيص وتعديل المتغيرات تلقائياً لكل شركة</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              إغلاق
            </button>
            {onUseInCampaign && (
              <button
                type="button"
                onClick={() => {
                  onUseInCampaign(template);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl text-xs font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="size-3.5" />
                <span>استخدام هذا القالب في حملة تسويقية</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
