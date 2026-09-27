"use client";

import { useState, Suspense } from "react";
import AccountShell, { type AccountTab } from "@/components/account/AccountShell";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  Plane,
  Hotel,
  Download,
  Wallet,
  Award,
  TrendingUp,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Calendar,
  Clock,
  ArrowUpRight,
  Share2,
  Loader2,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

function CustomerPortalContent() {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<AccountTab>("bookings");
  const [copied, setCopied] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: "مرحباً بك أستاذ محمد الحربي في منصة لوناليزا للسياحة الفاخرة! حجزك رقم LNZ-78219 على رحلة الخطوط السعودية (SV 101) إلى إسطنبول وفندق قصر كمبينسكي مؤكد بنجاح. كيف يمكنني خدمتك اليوم في خطة رحلتك؟",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;
    setChatMessages((prev) => [...prev, { sender: "user", text }]);
    setInputMsg("");

    setTimeout(() => {
      let reply = "يسعدني خدمتك دائماً أستاذ محمد! تم تسجيل طلبك لدى فريق خدمة كبار العملاء لتأكيد كافة الترتيبات الفاخرة لرحلتك.";
      if (text.includes("كمبينسكي") || text.includes("تسجيل الدخول")) {
        reply = "تسجيل الدخول في فندق قصر كمبينسكي إسطنبول يبدأ من الساعة 14:00، وتسجيل المغادرة حتى 12:00 ظهراً. لقد قمنا بتفعيل ميزة تسجيل الوصول المبكر (VIP Early Check-in) تلقائياً لحسابك البلاتيني فور وصولك من مطار إسطنبول.";
      } else if (text.includes("سيارة") || text.includes("مطار") || text.includes("VIP")) {
        reply = "تم تجهيز سيارة مرسيدس فيتو VIP خاصة مع سائق يتحدث العربية لاستقبالك عند بوابة الخروج رقم 13 بمطار إسطنبول الدولي (IST)، مع خدمة نقل الحقائب مباشرة إلى جناحك في فندق كمبينسكي.";
      } else if (text.includes("نقاط") || text.includes("محفظ") || text.includes("ولاء")) {
        reply = "رصيدك الحالي 2,850 نقطة ولاء يعادل قسيمة خصم نقدية بقيمة $28.50 يمكن تفعيلها وخصمها بنقرة واحدة عند إتمام حجز أي جولة سياحية أو ترقية فندقية قادمة.";
      }
      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 600);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="-mx-4 -my-4 sm:-mx-6 sm:-my-6 relative">
      <AccountShell
        tab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        userName="محمد الحربي"
        userEmail="mohammed.alharbi@example.com"
        onChatClick={() => setIsAssistantOpen(true)}
      >
        {/* TAB 1: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isAr ? "سجل الحجوزات والتذاكر المؤكدة" : "My Bookings & Confirmed Tickets"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "تأكيد فوري مرتبط مع أنظمة الطيران العالمية والفنادق مع إمكانية إدارة الحجز والطباعة"
                    : "Instant GDS confirmation with one-click e-ticket & voucher downloads"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isAr ? "حجزان نشطان" : "2 Active Bookings"}
                </span>
              </div>
            </div>

            {/* Flight Booking Card */}
            <Card className="overflow-hidden border border-slate-200/80 bg-white py-0 shadow-xs rounded-3xl hover:border-slate-300 transition-all">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="size-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 p-2 shadow-xs">
                      <AirlineLogo code="SV" name="الخطوط السعودية" size="md" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
                        {isAr ? "حجز طيران مؤكد · تذكرة إلكترونية" : "FLIGHT BOOKING · CONFIRMED"}
                      </p>
                      <h3 className="flex flex-wrap items-center gap-2 text-base sm:text-lg font-black text-slate-900">
                        <span>الرياض (RUH)</span>
                        <Plane size={16} className="text-teal-600 rtl:-scale-x-100 shrink-0" />
                        <span>إسطنبول (IST)</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        الخطوط السعودية (Saudia) · الضيافة المرنة (Economy Flex)
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          20 أيلول 2026 ➔ 27 أيلول 2026
                        </span>
                        <span>·</span>
                        <span className="font-mono font-bold text-slate-700">
                          {isAr ? "مرجع الحجز (PNR): " : "PNR: "}
                          <span className="text-teal-700 font-black">SV-89240</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end items-start gap-2.5">
                    <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold px-3 py-1">
                      {isAr ? "مؤكد ومُصدر" : "CONFIRMED"}
                    </Badge>
                    <p className="text-xl font-black text-slate-900">$320.00</p>
                    <button className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all">
                      <Download size={13} />
                      <span>{isAr ? "تحميل التذكرة PDF" : "e-Ticket PDF"}</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Booking Card */}
            <Card className="overflow-hidden border border-slate-200/80 bg-white py-0 shadow-xs rounded-3xl hover:border-slate-300 transition-all">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="size-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-xs">
                      <Hotel size={22} />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
                        {isAr ? "حجز فندقي فاخر · قسيمة إقامة" : "LUXURY HOTEL · HOTEL VOUCHER"}
                      </p>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        فندق وسبا تشيراغان بالاس كمبنسكي (Çırağan Palace Kempinski)
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        غرفة غراند ديلوكس مطلة على البوسفور · إفطار بوفيه فاخر مجاني لشخصين
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          20 أيلول 2026 ➔ 25 أيلول 2026 (5 ليالٍ)
                        </span>
                        <span>·</span>
                        <span className="font-mono font-bold text-slate-700">
                          {isAr ? "رقم القسيمة: " : "Voucher: "}
                          <span className="text-teal-700 font-black">HTL-KEMP-9182</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end items-start gap-2.5">
                    <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold px-3 py-1">
                      {isAr ? "مؤكد بالكامل" : "CONFIRMED"}
                    </Badge>
                    <p className="text-xl font-black text-slate-900">$2,350.00</p>
                    <button className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all">
                      <Download size={13} />
                      <span>{isAr ? "تحميل القسيمة Voucher" : "Hotel Voucher"}</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: WALLET & LOYALTY */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Wallet size={16} className="text-teal-600" />
                    {isAr ? "رصيد المحفظة النقدية المتاح" : "Available Cash Balance"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">
                    جاهز للاستخدام
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900">$185.00</div>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "يمكن خصم الرصيد تلقائياً عند دفع أي حجز طيران أو فندق دون حد أدنى."
                    : "Instantly applicable on flight or hotel checkouts."}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Award size={16} className="text-amber-500" />
                    {isAr ? "رصيد نقاط الولاء التراكمي" : "Loyalty Reward Points"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                    فئة البلاتينيوم
                  </span>
                </div>
                <div className="text-3xl font-black text-amber-600">
                  3,450 <span className="text-base font-bold text-slate-600">{isAr ? "نقطة" : "pts"}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "تساوي قسيمة خصم بقيمة $69 تُطبّق بضغطة زر عند إتمام الدفع."
                    : "Equivalent to a $69 voucher off your next booking."}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "سجل العمليات والمكافآت الأخيرة" : "Recent Transactions"}
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">مكافأة حجز فندق تشيراغان بالاس</p>
                    <p className="text-[11px] text-slate-400">1 أيلول 2026 · حجز مؤكد</p>
                  </div>
                  <span className="font-bold text-emerald-600 font-mono">+1,200 نقطة</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">عمولة إحالة صديق (سفر عائلي)</p>
                    <p className="text-[11px] text-slate-400">28 آب 2026 · إحالة ناجحة</p>
                  </div>
                  <span className="font-bold text-teal-600 font-mono">+$40.00 رصيد</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AFFILIATE PROGRAM */}
        {activeTab === "affiliate" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-teal-600" />
                  <span>{isAr ? "برنامج التسويق بالعمولة للمسافرين (Travel Affiliate)" : "Affiliate & Referral"}</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isAr
                    ? "شارك رابطك الخاص مع أصدقائك ومتابعيك. يحصل صديقك على خصم 15$ على أول حجز، وتحصل أنت على 20$ كاش في محفظتك فور تأكيد الرحلة!"
                    : "Share your referral link. Your friend gets $15 discount, and you earn $20 cash balance upon ticket issuance."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-xs font-bold text-slate-700 px-3 truncate max-w-full">
                  https://lonaliza.com/ref/MOHAMMED-ALHARBI
                </span>
                <button
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0"
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  <span>{copied ? (isAr ? "تم النسخ بنجاح!" : "Copied!") : (isAr ? "نسخ الرابط" : "Copy Link")}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-2xl font-black text-slate-900">18</div>
                  <div className="text-[11px] text-slate-500 font-bold mt-1">
                    {isAr ? "إجمالي النقرات" : "Link Clicks"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-2xl font-black text-emerald-600">5</div>
                  <div className="text-[11px] text-slate-500 font-bold mt-1">
                    {isAr ? "حجوزات مكتملة" : "Bookings Completed"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-2xl font-black text-teal-600">$100.00</div>
                  <div className="text-[11px] text-slate-500 font-bold mt-1">
                    {isAr ? "أرباح محولة للمحفظة" : "Total Paid Out"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isAr ? "البيانات الشخصية ووثائق السفر" : "Traveler Profile"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? "تُحفظ البيانات مشفرة لتعبئة الحجوزات القادمة بلمسة واحدة دون تكرار الإدخال"
                  : "Saved encrypted to auto-fill future bookings in 1-click"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم الكامل (كما في الجواز)</label>
                <input
                  type="text"
                  disabled
                  defaultValue="MOHAMMED SALEH AL-HARBI"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني المعتمد</label>
                <input
                  type="email"
                  disabled
                  defaultValue="mohammed.alharbi@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم الواتساب لاستلام التذاكر</label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold font-mono">
                  <Smartphone size={14} className="text-emerald-600" />
                  <span>+966 50 123 4567</span>
                  <span className="ms-auto text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    مفعّل وموثق OTP
                  </span>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم جواز السفر</label>
                <input
                  type="text"
                  disabled
                  defaultValue="K1829472 (السعودية)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </AccountShell>

      {/* Sandbox Isolated Customer AI Assistant Modal */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0a1628] to-[#064e3b] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    مساعد لوناليزا الذكي
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-normal">
                      المسافر البلاتيني
                    </span>
                  </h3>
                  <p className="text-xs text-white/60">مساعدك الشخصي لرحلاتك وحجوزاتك المؤكدة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssistantOpen(false)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Context Banner */}
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-medium">
              <span>الحجز النشط: SV 101 (الرياض ➔ إسطنبول) + كمبينسكي</span>
              <span className="text-emerald-600 font-bold">مؤكد ومضمون</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[220px]">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-2xs"
                        : "bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-2xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSend("أوقات تسجيل الدخول في فندق كمبينسكي؟")}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors"
              >
                تسجيل الدخول في فندق كمبينسكي
              </button>
              <button
                type="button"
                onClick={() => handleSend("إضافة سيارة خاصة VIP من المطار إلى الفندق")}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors"
              >
                سيارة VIP من المطار
              </button>
              <button
                type="button"
                onClick={() => handleSend("كيف أستبدل نقاط الولاء في محفظتي؟")}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors"
              >
                استبدال نقاط الولاء (2,850 نقطة)
              </button>
            </div>

            {/* Message Input */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="اكتب استفسارك لمساعد السفر الشخصي..."
                className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shrink-0"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerPortalPreview() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <CustomerPortalContent />
    </Suspense>
  );
}
