"use client";

import { useState } from "react";
import {
  Smartphone,
  Download,
  Bell,
  Wifi,
  WifiOff,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Plane,
  Hotel,
  Share2,
  RefreshCw,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PwaAppPreviewPage() {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";

  const [isOffline, setIsOffline] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [installPromptDismissed, setInstallPromptDismissed] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  const triggerPushNotification = (text: string) => {
    setActiveNotification(text);
    setNotificationSent(true);
    setTimeout(() => {
      setActiveNotification(null);
    }, 6000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-bold">
              <Smartphone className="size-3.5" />
              <span>{isAr ? "تطبيق الويب التقدمي (PWA) فائق السرعة" : "Ultra-Fast Progressive Web App (PWA)"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAr ? "محاكاة تجربة تطبيق PWA على الهواتف والأجهزة اللوحية" : "Interactive PWA Experience & Mobile Simulation"}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              {isAr
                ? "يعمل موقعك كتطبيق هاتف ذكي أصيل دون الحاجة للتحميل من المتاجر. يدعم التثبيت المباشر على الشاشة الرئيسية، التصفح أوفلاين دون إنترنت، والإشعارات اللحظية للتخفيضات وتأكيد الحجوزات."
                : "Your platform acts as an authentic mobile app without app store gatekeepers. Supports 1-click home screen install, offline browsing, and push notifications."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-center">
              <div className="text-xl font-black text-teal-600">0.8s</div>
              <div className="text-xs text-slate-500 font-medium">{isAr ? "زمن التحميل بالكاش" : "Cached Load Time"}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-center">
              <div className="text-xl font-black text-emerald-600">100%</div>
              <div className="text-xs text-slate-500 font-medium">{isAr ? "PWA Lighthouse Score" : "Lighthouse Score"}</div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <CheckCircle2 className="size-4 text-teal-600 shrink-0" />
            <span>{isAr ? "تثبيت بنقرة واحدة (Add to Home Screen)" : "1-Click Add to Home Screen"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <CheckCircle2 className="size-4 text-teal-600 shrink-0" />
            <span>{isAr ? "تخزين محلي مؤقت Service Worker" : "Full Offline Service Worker"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <CheckCircle2 className="size-4 text-teal-600 shrink-0" />
            <span>{isAr ? "إشعارات دفع Web Push Notifications" : "Live Push Notifications"}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Demo Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Mobile Device Shell Simulation */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 relative overflow-hidden">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2 z-30">
              <div className="size-2 rounded-full bg-slate-800" />
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Simulated Phone Screen */}
            <div className="bg-slate-50 rounded-[34px] overflow-hidden min-h-[620px] flex flex-col relative text-slate-900 font-sans border border-slate-200">
              {/* Status Bar */}
              <div className="h-10 bg-white/90 backdrop-blur-sm px-6 pt-3 flex items-center justify-between text-[11px] font-bold text-slate-600 z-20">
                <span>09:41</span>
                <div className="flex items-center gap-2">
                  {isOffline ? (
                    <span className="flex items-center gap-1 text-amber-600">
                      <WifiOff className="size-3" />
                      <span className="text-[10px]">{isAr ? "أوفلاين" : "Offline"}</span>
                    </span>
                  ) : (
                    <Wifi className="size-3 text-emerald-600" />
                  )}
                  <div className="w-4 h-2 rounded-xs border border-slate-500 relative">
                    <div className="h-full bg-slate-700 w-3" />
                  </div>
                </div>
              </div>

              {/* Toast Notification Simulation */}
              {activeNotification && (
                <div className="absolute top-12 inset-x-3 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-teal-200/80 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-2.5">
                    <div className="size-8 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bell className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{isAr ? "تنبيه رحلات لونا ليزا" : "Lonaliza Travel Alert"}</span>
                        <span className="text-[10px] text-slate-400">الآن</span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-medium mt-0.5 leading-snug">
                        {activeNotification}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Install Prompt Banner Simulation */}
              {!installPromptDismissed && !installedSuccessfully && (
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2.5 flex items-center justify-between gap-2 shadow-sm z-10 text-xs">
                  <div className="flex items-center gap-2">
                    <Download className="size-4 shrink-0" />
                    <span className="font-semibold text-[11px]">
                      {isAr ? "أضف المنصة لشاشتك الرئيسية لتصفح أسرع" : "Add to home screen for faster booking"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setInstalledSuccessfully(true)}
                      className="px-2.5 py-1 bg-white text-teal-900 rounded-lg font-bold text-[10px] hover:bg-teal-50"
                    >
                      {isAr ? "تثبيت" : "Install"}
                    </button>
                    <button
                      onClick={() => setInstallPromptDismissed(true)}
                      className="p-1 text-white/80 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Installed Success Banner */}
              {installedSuccessfully && (
                <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2 flex items-center gap-2 text-[11px] font-bold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>{isAr ? "تم تثبيت التطبيق بنجاح كأيقونة مستقلة!" : "Installed successfully to home screen!"}</span>
                </div>
              )}

              {/* Phone App Content */}
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Hero Search Card inside Phone */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      {isAr ? "ابحث عن رحلتك القادمة" : "Find Your Next Trip"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold">
                      {isOffline ? (isAr ? "وضع الكاش" : "Cached Mode") : (isAr ? "مباشر" : "Live")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 block">{isAr ? "من" : "From"}</span>
                      <span className="font-bold text-slate-800">الرياض (RUH)</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 block">{isAr ? "إلى" : "To"}</span>
                      <span className="font-bold text-slate-800">إسطنبول (IST)</span>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs">
                    {isAr ? "بحث فوري عن الأسعار" : "Search Instant Rates"}
                  </button>
                </div>

                {/* Cached Offline Hotel Item */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                    <span>{isAr ? "عروض الفنادق المحفوظة أوفلاين" : "Cached Offline Hotels"}</span>
                    <span className="text-[10px] text-teal-600 font-semibold">{isAr ? "متوفر بدون شبكة" : "Offline Ready"}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="size-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <Hotel className="size-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {isAr ? "فندق تشيراغان بالاس كمبنسكي" : "Ciragan Palace Kempinski"}
                      </div>
                      <div className="text-[10px] text-slate-500">إسطنبول، البوسفور</div>
                      <div className="text-xs font-extrabold text-teal-600 mt-1">$450 / ليلة</div>
                    </div>
                  </div>
                </div>

                {/* Offline Flight Item */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="size-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <Plane className="size-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {isAr ? "الخطوط السعودية - رحلة مباشرة" : "Saudia Airlines - Non-stop"}
                    </div>
                    <div className="text-[10px] text-slate-500">RUH ➔ IST · 3h 40m</div>
                    <div className="text-xs font-extrabold text-emerald-600 mt-1">$310 ذهاب وعودة</div>
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Navigation */}
              <div className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-slate-400 text-xs">
                <div className="flex flex-col items-center gap-0.5 text-teal-600 font-bold">
                  <Plane className="size-4" />
                  <span className="text-[9px]">{isAr ? "الرئيسية" : "Home"}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 hover:text-slate-700">
                  <Hotel className="size-4" />
                  <span className="text-[9px]">{isAr ? "الفنادق" : "Hotels"}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 hover:text-slate-700">
                  <Share2 className="size-4" />
                  <span className="text-[9px]">{isAr ? "المجتمع" : "Social"}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 hover:text-slate-700">
                  <Download className="size-4" />
                  <span className="text-[9px]">{isAr ? "حجوزاتي" : "Bookings"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Controls & Configuration */}
        <div className="lg:col-span-6 space-y-6">
          {/* Offline Mode Switcher Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-2xl flex items-center justify-center ${isOffline ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                  {isOffline ? <WifiOff className="size-5" /> : <Wifi className="size-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isAr ? "اختبار التصفح أوفلاين (Offline Mode)" : "Simulate Offline Browsing"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr ? "جرب قطع الاتصال وشاهد كيف يستمر التطبيق بالعمل فوراً" : "Toggle internet connection to verify ServiceWorker cache"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOffline(!isOffline)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  isOffline
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {isOffline ? (isAr ? "إعادة الاتصال بالإنترنت" : "Go Online") : (isAr ? "قطع الاتصال بالإنترنت" : "Go Offline")}
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 leading-relaxed">
              {isOffline ? (
                <span className="text-amber-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-amber-600 shrink-0" />
                  {isAr
                    ? "الشبكة مقطوعة حالياً: محرك ServiceWorker يخدم الصفحات والنتائج من ذاكرة Cache Storage بدون أي انقطاع للمستخدم."
                    : "Network disconnected: ServiceWorker serves cached pages seamlessly without failing."}
                </span>
              ) : (
                <span className="text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-teal-600 shrink-0" />
                  {isAr
                    ? "الشبكة متصلة: يتم تحديث الكاش في الخلفية بمجرد توفر أسعار جديدة (Stale-While-Revalidate)."
                    : "Connected: Stale-While-Revalidate caching strategy updates data in background."}
                </span>
              )}
            </div>
          </div>

          {/* Web Push Notification Simulator Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Bell className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isAr ? "محاكي إشعارات الدفع (Web Push Notifications)" : "Web Push Notification Tester"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? "أرسل تنبيهاً فورياً لهاتف العميل لتجربة ظهور الإشعار" : "Send live mock notifications directly to the phone simulator"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() =>
                  triggerPushNotification(
                    isAr
                      ? "انخفاض سعر رحلتك إلى إسطنبول بنسبة 25%! المقاعد محدودة، احجز الآن."
                      : "Flight price drop to Istanbul by 25%! Book now."
                  )
                }
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Send className="size-3.5 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                  <span>{isAr ? "إشعار: انخفاض سعر رحلة جوية (Price Drop)" : "Trigger: Price Drop Alert"}</span>
                </div>
                <span className="text-[10px] text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full">
                  {isAr ? "تجربة الإرسال" : "Simulate"}
                </span>
              </button>

              <button
                onClick={() =>
                  triggerPushNotification(
                    isAr
                      ? "تم تأكيد حجزك في فندق كمبنسكي! تم إصدار قسيمة الفندق وتذاكرك."
                      : "Hotel booking confirmed! Voucher & e-ticket issued."
                  )
                }
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  <span>{isAr ? "إشعار: تأكيد الحجز الفوري وإصدار الفاتورة" : "Trigger: Booking Confirmed Alert"}</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  {isAr ? "تجربة الإرسال" : "Simulate"}
                </span>
              </button>
            </div>
          </div>

          {/* Technical Specs Accordion Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="size-4 text-teal-600" />
              <span>{isAr ? "المواصفات التقنية لمنظومة الـ PWA" : "PWA Architecture Specifications"}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block">Manifest File</span>
                <span className="font-bold text-slate-800">manifest.json (Standalone)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block">Service Worker</span>
                <span className="font-bold text-slate-800">Workbox / Next-PWA</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block">App Icon Maskable</span>
                <span className="font-bold text-slate-800">512x512 PNG HD</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block">Platform Independence</span>
                <span className="font-bold text-slate-800">iOS Safari & Android Chrome</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
