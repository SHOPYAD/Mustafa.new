"use client";

import { useState } from "react";
import {
  Bell,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Play,
  RotateCw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PreviewTelegramAutomationPage() {
  const { dir, locale } = useLocale();

  const [activeTab, setActiveTab] = useState<"card_approval" | "revenue_alert" | "booking_dispatch">("card_approval");
  const [approvedStatus, setApprovedStatus] = useState<string | null>(null);

  const handleSimulateAction = (action: string) => {
    setApprovedStatus(
      locale === "ar"
        ? `جاري تنفيذ الأمر «${action}» عبر خادم التيليجرام...`
        : `Executing «${action}» via Telegram daemon...`
    );
    setTimeout(() => {
      setApprovedStatus(
        locale === "ar"
          ? `تم تنفيذ القرار بنجاح واعتماد النشر وتحديث الأسعار عبر خادم الوكالة فورياً.`
          : `Decision executed successfully: rates updated and campaigns published across channels.`
      );
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={dir}>
      {/* Top Telegram Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">{locale === "ar" ? "بروتوكول الربط" : "Protocol"}</div>
          <div className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5 font-mono">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Telegram Webhook 2-Way</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5">{locale === "ar" ? "متصل بالخادم 24/7" : "Active 24/7"}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">{locale === "ar" ? "سرعة الاستجابة" : "Execution Speed"}</div>
          <div className="text-2xl font-black text-teal-700 font-mono mt-1">
            <span dir="ltr" className="inline-block font-mono">&lt; 350ms</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{locale === "ar" ? "تنفيذ فوري بنقرة واحدة" : "Instant Action Dispatch"}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">{locale === "ar" ? "بطاقات المراجعة اليومية" : "Daily Decision Cards"}</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">100%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{locale === "ar" ? "تحكم كامل من هاتفك" : "Mobile Command"}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">{locale === "ar" ? "أمان القناة الإدارية" : "Security Level"}</div>
          <div className="text-sm font-black text-emerald-700 mt-2 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Encrypted Chat ID</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{locale === "ar" ? "محصور بالمدير فقط" : "Admin Only"}</div>
        </div>
      </div>

      {/* Main Interactive Telegram Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Interactive Controls & Scenario Selector (5 cols) */}
        <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-slate-200 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {locale === "ar" ? "سيناريوهات البوت التفاعلي" : "Interactive Telegram Scenarios"}
              </span>
              <p className="text-xs text-slate-600 mt-1">
                {locale === "ar"
                  ? "اختر السيناريو لاختبار كيف يدير المدير التنفيذي شركته السياحية من تطبيق تيليجرام على هاتفه:"
                  : "Select scenario to test how the agency director operates the platform directly from mobile Telegram:"}
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setActiveTab("card_approval");
                  setApprovedStatus(null);
                }}
                className={`w-full text-start p-4 rounded-2xl border transition-all ${
                  activeTab === "card_approval"
                    ? "bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="font-black text-slate-950 text-xs sm:text-sm">
                  {locale === "ar" ? "بطاقة موافقة النشر والحملات (انشر بنقرة واحدة)" : "Campaign Approval Card (One-Click Publish)"}
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-1">
                  {locale === "ar" ? "يجهز السرب المنشورات ويرسلها لتعتمدها بكلمة «انشر»" : "AI prepares creative posts, you confirm with 1-click"}
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab("revenue_alert");
                  setApprovedStatus(null);
                }}
                className={`w-full text-start p-4 rounded-2xl border transition-all ${
                  activeTab === "revenue_alert"
                    ? "bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="font-black text-slate-950 text-xs sm:text-sm">
                  {locale === "ar" ? "إحاطة الإيرادات والأرباح اليومية (Daily Briefing)" : "Daily Cash & Revenue Briefing"}
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-1">
                  {locale === "ar" ? "تقرير مباشر عن الحجوزات والسيولة المحصلة في حسابك" : "Instant breakdown of bookings, collections, and net margin"}
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab("booking_dispatch");
                  setApprovedStatus(null);
                }}
                className={`w-full text-start p-4 rounded-2xl border transition-all ${
                  activeTab === "booking_dispatch"
                    ? "bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="font-black text-slate-950 text-xs sm:text-sm">
                  {locale === "ar" ? "تنبيهات الحجوزات VIP والترانسفير اللحظي" : "Instant VIP Booking Alert & Dispatch"}
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-1">
                  {locale === "ar" ? "إشعار فوري عند إتمام أي حجز طيران أو فندق VIP" : "Real-time ping on high-ticket flight or resort booking"}
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="text-xs text-slate-500">
              {locale === "ar"
                ? "يمكنك كتابة أي أمر للبوت من هاتفك مثل: «حدث أسعار الطيران»، «احسب أرباح اليوم»، «انشر»."
                : "Command your bot anytime from mobile: 'Update flight markups', 'Today revenue', 'Publish'."}
            </div>
            {approvedStatus && (
              <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl animate-fadeIn">
                {approvedStatus}
              </div>
            )}
          </div>
        </div>

        {/* Right: Realistic Telegram App Simulation (7 cols) */}
        <div className="lg:col-span-7 bg-[#0E1621] p-6 sm:p-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-[420px] rounded-[32px] border-[5px] border-slate-800 bg-[#17212B] text-white shadow-2xl overflow-hidden flex flex-col">
            {/* Telegram App Header */}
            <div className="bg-[#242F3D] p-3.5 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-bold text-sm text-white">
                  BOT
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>Lonaliza Executive Bot</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                  </div>
                  <div className="text-[10px] text-teal-300 font-mono">bot · connected</div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">24/7</span>
            </div>

            {/* Telegram Chat Area */}
            <div className="p-4 space-y-3 bg-[#0E1621] min-h-[380px] flex flex-col justify-end text-xs">
              {activeTab === "card_approval" ? (
                <div className="bg-[#182533] p-4 rounded-2xl rounded-tr-none space-y-3 border border-slate-700/60 max-w-[95%] self-end">
                  <div className="flex items-center justify-between text-[11px] text-teal-400 font-bold">
                    <span>بطاقة اعتماد حملة ترويجية جديدة</span>
                    <span className="text-slate-400 font-mono">10:42 AM</span>
                  </div>

                  <p className="text-slate-200 leading-relaxed">
                    تم رصد طلب متزايد على باقات بودروم وإسطنبول الصيفية. أعد وكيل المحتوى منشوراً دعائياً مخصصاً مع خصم 10% وبانر احترافي.
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#0E1621] border border-slate-800 space-y-1 font-mono text-[11px]">
                    <div className="text-slate-400">القنوات المستهدفة: Instagram, TikTok, Facebook</div>
                    <div className="text-emerald-400 font-bold">العائد المتوقع: +$6,400 في الحجوزات</div>
                  </div>

                  {/* Inline Telegram Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleSimulateAction("انشر واعتمد")}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors text-center"
                    >
                      انشر واعتمد
                    </button>
                    <button
                      onClick={() => handleSimulateAction("تعديل الصياغة")}
                      className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-colors text-center"
                    >
                      طلب تعديل
                    </button>
                  </div>
                </div>
              ) : activeTab === "revenue_alert" ? (
                <div className="bg-[#182533] p-4 rounded-2xl rounded-tr-none space-y-3 border border-slate-700/60 max-w-[95%] self-end">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                    <span>إحاطة الإيرادات اليومية التنفيذية</span>
                    <span className="text-slate-400 font-mono">12:00 PM</span>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                      <span>إجمالي حجوزات اليوم:</span>
                      <span className="font-mono font-bold text-white">28 حجزاً</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                      <span>المبيعات المحصلة كاش:</span>
                      <span className="font-mono font-bold text-emerald-400">$18,450.00</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                      <span>صافي ربح الوكالة:</span>
                      <span className="font-mono font-bold text-teal-300">$2,214.00</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-300">
                      <span>العمولات المستقطعة لوسطاء:</span>
                      <span className="font-mono font-bold text-emerald-400">$0.00 (0% عمولة)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulateAction("طلب كشف حساب PDF")}
                    className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
                  >
                    تصدير تقرير مالي مفصل PDF
                  </button>
                </div>
              ) : (
                <div className="bg-[#182533] p-4 rounded-2xl rounded-tr-none space-y-3 border border-slate-700/60 max-w-[95%] self-end">
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                    <span>حجز فندقي فاخر مؤكد (#LN-8921)</span>
                    <span className="text-slate-400 font-mono">02:15 PM</span>
                  </div>

                  <p className="text-slate-200 leading-relaxed">
                    تم سداد وتأكيد حجز جناح فاخر في فندق Four Seasons Bosphorus بقيمة $3,400 عبر بطاقة ائتمانية.
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#0E1621] border border-slate-800 text-[11px] space-y-1 font-mono">
                    <div className="text-slate-400">العميل: أحمد المنصوري (VIP)</div>
                    <div className="text-teal-400">إجراء آلي: تم إرسال قسيمة الفندق عبر الواتساب والإيميل فورياً</div>
                  </div>

                  <button
                    onClick={() => handleSimulateAction("إرسال رسالة شكر للعميل")}
                    className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors"
                  >
                    عرض تفاصيل الحجز
                  </button>
                </div>
              )}
            </div>

            {/* Simulated Input Field */}
            <div className="bg-[#17212B] p-3 border-t border-slate-800 flex items-center gap-2">
              <div className="flex-1 bg-[#242F3D] px-3 py-2 rounded-xl text-slate-400 text-xs font-sans">
                {locale === "ar" ? "اكتب أمراً للوكيل (مثال: انشر، احسب، حلل)..." : "Type a command for your agent..."}
              </div>
              <button
                onClick={() => handleSimulateAction("أمر مخصص")}
                className="p-2 bg-teal-500 rounded-xl text-white hover:bg-teal-400"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
