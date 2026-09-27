"use client";

import { useState } from "react";
import {
  Building2,
  Plane,
  Car,
  Sparkles,
  Link2,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Zap,
  Globe2,
  Database,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Layers,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PreviewSuppliersCrawlerPage() {
  const { dir, locale } = useLocale();

  const [activeModel, setActiveModel] = useState<"rapid_api" | "gds_direct" | "affiliate">("rapid_api");
  const [hotelUrl, setHotelUrl] = useState("https://www.booking.com/hotel/tr/four-seasons-bosphorus.html");
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawledHotel, setCrawledHotel] = useState<{
    name: string;
    location: string;
    stars: number;
    roomsCount: number;
    priceSample: string;
    extractedAt: string;
  } | null>({
    name: "Four Seasons Hotel Istanbul at the Bosphorus",
    location: "Çırağan Cd. No:28, Beşiktaş, Istanbul",
    stars: 5,
    roomsCount: 8,
    priceSample: "$620 / ليلة",
    extractedAt: "منذ دقيقتين بواسطة وكيل الـ AI",
  });
  const [syncDaemonActive, setSyncDaemonActive] = useState(true);

  const handleSimulateImport = () => {
    setIsCrawling(true);
    setTimeout(() => {
      setIsCrawling(false);
      setCrawledHotel({
        name: "The Peninsula Istanbul — Bosphorus Waterfront Suite",
        location: "Karaköy, Kemankeş Karamustafapaşa, Istanbul",
        stars: 5,
        roomsCount: 12,
        priceSample: "$780 / ليلة",
        extractedAt: "تم الاستيراد بنجاح عبر زاحف الذكاء الاصطناعي الآن",
      });
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={dir}>
      {/* Top Supplier Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">
            {locale === "ar" ? "الفنادق المدعومة عالمياً" : "Hotels Inventory"}
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">+3,000,000</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
            {locale === "ar" ? "تغطية عالمية فورية" : "Worldwide Bed Banks"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">
            {locale === "ar" ? "شركات الطيران GDS" : "GDS Airlines"}
          </div>
          <div className="text-2xl font-black text-teal-700 font-mono mt-1">+500</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {locale === "ar" ? "Amadeus, Sabre, Travelport" : "Direct & Aggregated"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">
            {locale === "ar" ? "محرك Rapid API (بدون ديبوزيت)" : "Zero-Deposit Rapid API"}
          </div>
          <div className="text-sm font-black text-emerald-700 mt-2 flex items-center gap-1 font-mono">
            <span dir="ltr" className="inline-block font-mono">$10/mo</span>
            <span className="text-slate-500 font-normal text-xs">{locale === "ar" ? "فقط" : "Only"}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {locale === "ar" ? "دون تجميد أموال مع الموردين" : "No Cash Locked in Deposit"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">
            {locale === "ar" ? "مزامنة الأسعار الآلية" : "AI Sync Daemon"}
          </div>
          <div className="text-sm font-black text-slate-900 mt-2 flex items-center gap-1.5 font-mono">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{locale === "ar" ? "كل 10-15 دقيقة" : "Every 10-15 mins"}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {locale === "ar" ? "زحف آلي وتحديث هوامش الربح" : "Auto Price & Availability Sync"}
          </div>
        </div>
      </div>

      {/* Main Section: Sourcing Models Architecture */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 p-6 sm:p-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {locale === "ar" ? "مرونة التوريد الكاملة" : "Flexible 3-Way Sourcing Engine"}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            {locale === "ar"
              ? "3 نماذج تشغيلية لتوريد الطيران والفنادق حسب ميزانية وكالتك"
              : "3 Operational Supply Models Tailored to Your Agency Capital"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {locale === "ar"
              ? "لا تلزمك منصة لوناليزا بنموذج واحد؛ يمكنك العمل بالـ GDS المباشر، أو بمحرك الـ Rapid API فائق السرعة بدون أي ديبوزيت، أو بنظام ترافلبايوتس بالعمولة:"
              : "Operate with traditional GDS deposits, zero-deposit live API scraping, or pure risk-free affiliate commission:"}
          </p>
        </div>

        {/* 3 Model Switchers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveModel("rapid_api")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeModel === "rapid_api"
                ? "bg-teal-50/70 border-teal-600 ring-2 ring-teal-500/20 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {locale === "ar" ? "الأكثر توفيراً (بدون ديبوزيت)" : "Zero Deposit Required"}
              </span>
              <Zap className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="font-black text-slate-900 text-sm mt-3">
              {locale === "ar" ? "محرك Rapid API & Live Scraper" : "Rapid API & Live Scraper"}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {locale === "ar"
                ? "ابدأ فوراً دون تجميد آلاف الدولارات كتأمين مع الموردين. تكلفة رمزية (حوالي $10 شهرياً) لطلبات ضخمة، واستعلم عن الأسعار حياً وبع لعميلك بهامش ربحك ثم احجز من أرخص مورد."
                : "Search live flights and hotels with zero deposit. Cost is ~$10/mo for high-volume requests. Collect payment from customer, then issue ticket via the cheapest net provider."}
            </p>
          </div>

          <div
            onClick={() => setActiveModel("gds_direct")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeModel === "gds_direct"
                ? "bg-teal-50/70 border-teal-600 ring-2 ring-teal-500/20 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                {locale === "ar" ? "للوكالات الكبرى ذات التأمين" : "Enterprise Deposit"}
              </span>
              <Database className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-black text-slate-900 text-sm mt-3">
              {locale === "ar" ? "الربط المباشر مع GDS وموزعي الفنادق" : "Direct GDS & Bed Banks API"}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {locale === "ar"
                ? "تكامل مباشر مع Amadeus وSabre وTravelport وبنوك الفنادق (Hotelbeds, WebBeds, RateHawk, Expedia) باستخدام حساباتك واتفاقياتك الخاصة لإصدار التذاكر الفوري عبر محفظتك."
                : "Connect your existing Amadeus, Sabre, Hotelbeds, WebBeds, or Expedia Partner credentials with instant wallet ticketing."}
            </p>
          </div>

          <div
            onClick={() => setActiveModel("affiliate")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeModel === "affiliate"
                ? "bg-teal-50/70 border-teal-600 ring-2 ring-teal-500/20 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800">
                {locale === "ar" ? "أرباح بالعمولة (مخاطرة صفر)" : "100% Risk-Free"}
              </span>
              <Percent className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="font-black text-slate-900 text-sm mt-3">
              {locale === "ar" ? "نظام Travelpayouts بالعمولة التلقائية" : "Travelpayouts Commission Suite"}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {locale === "ar"
                ? "إذا أردت العمل بدون أي التزامات مالية، يمكنك تفعيل بوابة ترافلبايوتس لجني عمولات تلقائية على حجوزات الطيران، والفنادق، وسيارات التأجير، وترانسفير المطار."
                : "Earn passive affiliate commissions on flights, rental cars, and transfers via integrated Travelpayouts white-label links."}
            </p>
          </div>
        </div>

        {/* Feature Showcase 2: AI Hotel URL Importer & Autonomous Sync Daemon */}
        <div className="border-t border-slate-200 pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-black text-slate-900">
                  {locale === "ar"
                    ? "استيراد الفنادق بالذكاء الاصطناعي برابط فوري + زاحف المزامنة المؤتمت"
                    : "Instant AI Hotel URL Importer & 15-Min Live Rate Sync Daemon"}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {locale === "ar"
                  ? "أضف أي فندق تعاقدت معه بمجرد لصق رابطه؛ يقوم الذكاء الاصطناعي بجلب كافة البيانات والصور فوراً، مع تشغيل زاحف آلي كل 10-15 دقيقة لتحديث الأسعار والغرف المتاحة."
                  : "Onboard direct contracted hotels by simply pasting their link. AI crawls photos and room types, while a 15-minute daemon keeps rates and inventory accurate."}
              </p>
            </div>

            {/* Daemon Toggle Status */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shrink-0">
              <div className="text-end">
                <div className="text-xs font-bold text-slate-900">
                  {locale === "ar" ? "زاحف التحديث التلقائي" : "Auto-Sync Daemon"}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">
                  {syncDaemonActive
                    ? (locale === "ar" ? "نشط كل 10-15 دقيقة" : "Running every 10-15m")
                    : (locale === "ar" ? "متوقف مؤقتاً" : "Paused")}
                </div>
              </div>
              <button
                onClick={() => setSyncDaemonActive(!syncDaemonActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  syncDaemonActive ? "bg-teal-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                    syncDaemonActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Interactive URL Input Simulation */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Link2 className="h-4 w-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hotelUrl}
                  onChange={(e) => setHotelUrl(e.target.value)}
                  placeholder="https://www.booking.com/hotel/..."
                  className="w-full bg-white border border-slate-300 rounded-xl ps-10 pe-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
              <button
                onClick={handleSimulateImport}
                disabled={isCrawling}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
              >
                {isCrawling ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{locale === "ar" ? "الذكاء الاصطناعي يسحب البيانات..." : "AI Crawling Hotel..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{locale === "ar" ? "استيراد الفندق بالـ AI فورياً" : "Import Hotel with AI"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Extracted Hotel Result Card */}
            {crawledHotel && (
              <div className="rounded-xl border border-emerald-200 bg-white p-4 space-y-3 shadow-xs animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{crawledHotel.name}</span>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                        {crawledHotel.stars} نجوم فاخر
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{crawledHotel.location}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-xs font-black text-teal-700 font-mono">{crawledHotel.priceSample}</div>
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{crawledHotel.extractedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">فئات الغرف المستخرجة:</span>
                    <strong className="text-slate-800">{crawledHotel.roomsCount} أنواع غرف</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">معرض الصور HD:</span>
                    <strong className="text-slate-800">42 صورة عالية الدقة</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">المرافق والسياسات:</span>
                    <strong className="text-emerald-700">مسبح، سبا، إفطار، إلغاء مرن</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">حالة العرض في الموقع:</span>
                    <strong className="text-teal-700">منشور وجاهز للحجز الفوري</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
