"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  Layers,
  Smartphone,
  Monitor,
  Calendar,
  TrendingUp,
  Percent,
  Play,
  RotateCw,
  FileText,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PreviewEmailMarketingPage() {
  const { dir, locale } = useLocale();
  const [selectedTemplate, setSelectedTemplate] = useState<"recovery" | "voucher" | "vip_promo">("recovery");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [testEmailSent, setTestEmailSent] = useState(false);

  const handleSendTest = () => {
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 3000);
  };

  const templates = [
    {
      id: "recovery",
      title: locale === "ar" ? "استعادة حجز طيران غير مكتمل (Cart Recovery)" : "Abandoned Flight Booking Recovery",
      badge: locale === "ar" ? "أتمتة ذكية" : "Smart Drip",
      subject: locale === "ar" ? "تذكرتك إلى إسطنبول لا تزال محفوظة — خصم خاص بانتظارك" : "Your Istanbul Seat is Still Reserved — Exclusive Offer",
      openRate: "42.8%",
      recoveryRate: "34.5%",
    },
    {
      id: "voucher",
      title: locale === "ar" ? "قسيمة حجز فندقي فاخر (Booking Voucher PDF)" : "Luxury Hotel Confirmation Voucher",
      badge: locale === "ar" ? "تأكيد فوري" : "Instant Voucher",
      subject: locale === "ar" ? "تأكيد حجزك الرسمي في فندق ريتز كارلتون — قسيمة الحجز المرفقة" : "Official Booking Confirmation — The Ritz-Carlton Istanbul",
      openRate: "88.2%",
      recoveryRate: "100%",
    },
    {
      id: "vip_promo",
      title: locale === "ar" ? "عروض موسم الصيف الحصرية للعملاء VIP" : "VIP Summer Private Jet & Yacht Promo",
      badge: locale === "ar" ? "حملة موسمية" : "Seasonal Blast",
      subject: locale === "ar" ? "دعوة خاصة: تجارب اليخوت الخاصة وباقات البوسفور الحصرية" : "Exclusive Invitation: Private Bosphorus Yacht Charters",
      openRate: "36.4%",
      recoveryRate: "28.0%",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={dir}>
      {/* Top Marketing KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">{locale === "ar" ? "إجمالي الرسائل المرسلة" : "Total Emails Sent"}</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">128,450</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5">99.8% {locale === "ar" ? "نسبة وصول ناجحة" : "Delivery Rate"}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">{locale === "ar" ? "متوسط نسبة الفتح" : "Average Open Rate"}</div>
          <div className="text-2xl font-black text-teal-700 font-mono mt-1">41.2%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{locale === "ar" ? "ضعف متوسط السوق السياحي" : "2x Industry Average"}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">{locale === "ar" ? "مبيعات مستردة عبر الحملات" : "Recovered Revenue"}</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">$48,920</div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5">{locale === "ar" ? "أرباح إضافية صافية للوكالة" : "Direct Net Agency Profit"}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">{locale === "ar" ? "جاهزية بروتوكول SMTP & DKIM" : "DNS DKIM/SPF Status"}</div>
          <div className="text-sm font-black text-slate-900 mt-2 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{locale === "ar" ? "موثق ومفعل 100%" : "Verified 100%"}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{locale === "ar" ? "تفادي مجلد البريد المزعج (Spam)" : "Zero Spam Penalty"}</div>
        </div>
      </div>

      {/* Main Studio Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Template Selector & Drip Trigger Controls (5 cols) */}
        <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-slate-200 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {locale === "ar" ? "قوالب الرسائل السياحية المؤتمتة" : "Automated Email Templates"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                HTML + MJML
              </span>
            </div>

            <div className="space-y-2">
              {templates.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id as any)}
                    className={`w-full text-start p-4 rounded-2xl border transition-all space-y-2 ${
                      isSelected
                        ? "bg-teal-50/70 border-teal-500 shadow-xs ring-2 ring-teal-500/20"
                        : "bg-slate-50/60 border-slate-200 hover:bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{tpl.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-slate-200 text-slate-600">
                        {tpl.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {tpl.subject}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>{locale === "ar" ? "نسبة الفتح:" : "Open Rate:"} <strong className="text-teal-700 font-mono">{tpl.openRate}</strong></span>
                      <span>{locale === "ar" ? "الاسترداد:" : "Conversion:"} <strong className="text-emerald-700 font-mono">{tpl.recoveryRate}</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drip Automation Pipeline Info */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600" />
                <span>{locale === "ar" ? "سلسلة التتبع الآلي (Drip Sequence):" : "Automated Drip Sequence:"}</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>{locale === "ar" ? "اكتشاف ترك العميل لصفحة الدفع فوراً" : "Instant drop-off detection at checkout"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>{locale === "ar" ? "إرسال إيميل شخصي بهوية شركتك وكوبون خصم سري" : "Dispatch branded email + private discount coupon"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>{locale === "ar" ? "تتبع نقرة العميل وإتمام الدفع بنجاح" : "1-Click reservation recovery and confirmation"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleSendTest}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4 text-white" />
              <span>{locale === "ar" ? "إرسال رسالة تجريبية للاختبار" : "Send Test Live Email"}</span>
            </button>
            {testEmailSent && (
              <div className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 p-2.5 rounded-xl font-medium mt-2 text-center">
                {locale === "ar" ? "تم إرسال نموذج المعاينة إلى صندوق الوارد بنجاح" : "Sample preview email dispatched successfully"}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Rendered Email Preview (7 cols) */}
        <div className="lg:col-span-7 bg-slate-100/70 p-6 sm:p-8 flex flex-col items-center justify-center">
          {/* Device Controls */}
          <div className="flex items-center justify-between w-full max-w-[500px] mb-3">
            <span className="text-xs font-bold text-slate-500">{locale === "ar" ? "معاينة تصميم البريد الحي:" : "Live Email Preview:"}</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  deviceMode === "desktop" ? "bg-teal-50 text-teal-700" : "text-slate-500"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  deviceMode === "mobile" ? "bg-teal-50 text-teal-700" : "text-slate-500"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Email Frame */}
          <div
            className={`w-full bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden transition-all duration-300 ${
              deviceMode === "desktop" ? "max-w-[520px]" : "max-w-[340px]"
            }`}
          >
            {/* Mock Email Client Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-3.5 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">{locale === "ar" ? "من:" : "From:"}</span>
                <span className="font-bold text-slate-800">booking@your-agency.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{locale === "ar" ? "الموضوع:" : "Subject:"}</span>
                <span className="font-bold text-teal-700 truncate max-w-[280px]">
                  {templates.find((t) => t.id === selectedTemplate)?.subject}
                </span>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
              {/* Agency Brand Header */}
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="text-lg font-black tracking-wider text-slate-900">LONALIZA TRAVEL</div>
                <div className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Luxury Travel Agency</div>
              </div>

              {selectedTemplate === "recovery" ? (
                <div className="space-y-4">
                  <p className="font-bold text-slate-900 text-sm">
                    {locale === "ar" ? "مرحباً أستاذ أحمد،" : "Hello Mr. Ahmed,"}
                  </p>
                  <p>
                    {locale === "ar"
                      ? "لاحظنا أنك كنت تبحث عن رحلة إسطنبول - دبي على الخطوط التركية ولم تكمل الحجز. مقعدك لا يزال متاحاً بنفس السعر الخاص."
                      : "We noticed you explored the Istanbul - Dubai flight but haven't finished checkout yet. Your seat is still reserved at this special fare."}
                  </p>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                    <div className="flex justify-between font-bold text-slate-900 text-xs">
                      <span>IST → DXB</span>
                      <span className="text-teal-700">$380.00</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {locale === "ar" ? "الخطوط التركية · رحلة مباشرة · وزن 30 كجم" : "Turkish Airlines · Direct Flight · 30kg Baggage"}
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20">
                      {locale === "ar" ? "استكمال الحجز بخصم 10% فوراً" : "Complete Booking with 10% Discount"}
                    </button>
                  </div>
                </div>
              ) : selectedTemplate === "voucher" ? (
                <div className="space-y-4">
                  <p className="font-bold text-slate-900 text-sm">
                    {locale === "ar" ? "تهانينا، تم تأكيد حجزك رسمياً!" : "Congratulations, Booking Confirmed!"}
                  </p>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-emerald-900">
                      <span>The Ritz-Carlton Istanbul</span>
                      <span className="font-mono">#LN-99201</span>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      {locale === "ar" ? "5 ليالٍ · جناح مطل على البوسفور · إفطار مجاني" : "5 Nights · Bosphorus View Suite · Breakfast Included"}
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md">
                      {locale === "ar" ? "تحميل قسيمة الحجز الرسمية PDF" : "Download Official PDF Voucher"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-bold text-slate-900 text-sm">
                    {locale === "ar" ? "عروض حصرية لعملاء النخبة" : "Exclusive VIP Invitation"}
                  </p>
                  <p>
                    {locale === "ar"
                      ? "يسرنا دعوتكم للاستفادة من باقات الصيف الحصرية لرحلات اليخوت الخاصة في البوسفور وبودروم مع سيارة مرسيدس مايباخ بسائق خاص."
                      : "We invite you to explore our private luxury yacht packages in the Bosphorus & Bodrum with dedicated chauffeur."}
                  </p>
                  <div className="text-center pt-2">
                    <button className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md">
                      {locale === "ar" ? "استعراض باقات النخبة VIP" : "Explore VIP Experiences"}
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
                © 2026 Your Travel Agency LLC · All rights reserved
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
