"use client";

import { useState } from "react";
import {
  Receipt,
  QrCode,
  Printer,
  FileCheck2,
  ShieldCheck,
  Building2,
  Plane,
  Car,
  Compass,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PreviewInvoiceTemplatesPage() {
  const { dir, locale } = useLocale();

  const [serviceType, setServiceType] = useState<"flight" | "hotel" | "package" | "transfer">("flight");
  const [showQr, setShowQr] = useState(true);
  const [showTaxes, setShowTaxes] = useState(true);
  const [showStamp, setShowStamp] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "SAR">("USD");
  const [isCopied, setIsCopied] = useState(false);

  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "ر.س";

  const handleCopyLink = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={dir}>
      {/* Top Template Engine Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">
            {locale === "ar" ? "سرعة توليد المستندات" : "PDF Render Speed"}
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            <span dir="ltr" className="inline-block font-mono">&lt; 180ms</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
            {locale === "ar" ? "توليد خادمي فوري للـ PDF" : "Zero-latency Server Generation"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">
            {locale === "ar" ? "رموز التحقق الرقمي" : "Security Verification"}
          </div>
          <div className="text-sm font-black text-teal-800 mt-2 flex items-center gap-1.5 font-mono">
            <QrCode className="h-4 w-4 text-teal-600" />
            <span>Dynamic QR + Hash</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {locale === "ar" ? "فحص فوري في المطار والفندق" : "Airport & Hotel Desk Scan"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">
            {locale === "ar" ? "محركات الخدمات المدعومة" : "Supported Engines"}
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">6 في 1</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {locale === "ar" ? "طيران، فنادق، باقات، نقل" : "Flights, Hotels, Packages, Cars"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">
            {locale === "ar" ? "الامتثال الضريبي والمالي" : "Tax & Invoicing"}
          </div>
          <div className="text-sm font-black text-emerald-700 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Tax Compliant</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {locale === "ar" ? "تفصيل الضرائب وهوامش الربح" : "VAT & Fuel Surcharges Matrix"}
          </div>
        </div>
      </div>

      {/* Main Studio Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Customization Controls (5 cols) */}
        <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-slate-200 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {locale === "ar" ? "تخصيص نوع المستند والقالب" : "Template & Engine Configuration"}
              </span>
              <p className="text-xs text-slate-600 mt-1">
                {locale === "ar"
                  ? "قم بتحديد نوع الحجز وتفعيل عناصر الأمان للتحقق من كيفية إصدار الفواتير والقسائم تلقائياً لعملائك:"
                  : "Select booking engine and security parameters to preview dynamic invoice and voucher issuance:"}
              </p>
            </div>

            {/* Service Type Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                {locale === "ar" ? "نوع الخدمة السياحية:" : "Booking Service Type:"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setServiceType("flight")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    serviceType === "flight"
                      ? "bg-teal-50 border-teal-500 text-teal-900 shadow-2xs"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Plane className="h-4 w-4 text-teal-600" />
                  <span>{locale === "ar" ? "تذكرة طيران E-Ticket" : "Flight Ticket"}</span>
                </button>

                <button
                  onClick={() => setServiceType("hotel")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    serviceType === "hotel"
                      ? "bg-teal-50 border-teal-500 text-teal-900 shadow-2xs"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="h-4 w-4 text-teal-600" />
                  <span>{locale === "ar" ? "قسيمة فندق Hotel Voucher" : "Hotel Voucher"}</span>
                </button>

                <button
                  onClick={() => setServiceType("package")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    serviceType === "package"
                      ? "bg-teal-50 border-teal-500 text-teal-900 shadow-2xs"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Compass className="h-4 w-4 text-teal-600" />
                  <span>{locale === "ar" ? "باقة سياحية VIP Package" : "Holiday Package"}</span>
                </button>

                <button
                  onClick={() => setServiceType("transfer")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    serviceType === "transfer"
                      ? "bg-teal-50 border-teal-500 text-teal-900 shadow-2xs"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Car className="h-4 w-4 text-teal-600" />
                  <span>{locale === "ar" ? "نقل سياحي VIP Transfer" : "Transfer Voucher"}</span>
                </button>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                {locale === "ar" ? "العملة الرسمية للفاتورة:" : "Invoice Currency:"}
              </label>
              <div className="flex items-center gap-2">
                {(["USD", "EUR", "SAR"] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      currency === curr
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Parameters */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700">
                {locale === "ar" ? "عناصر المستند التفاعلية:" : "Document Elements:"}
              </label>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                  <div className="flex items-center gap-2.5">
                    <QrCode className="h-4 w-4 text-teal-600" />
                    <div>
                      <span className="font-bold text-slate-800">
                        {locale === "ar" ? "رمز الاستجابة السريعة (QR Code)" : "Dynamic QR Verification"}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {locale === "ar" ? "رابط مشفر للتحقق من صحة الحجز دولياً" : "Digital token check for airport desks"}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showQr}
                    onChange={(e) => setShowQr(e.target.checked)}
                    className="size-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                  <div className="flex items-center gap-2.5">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800">
                        {locale === "ar" ? "تفصيل الضرائب ورسوم الوقود" : "Itemized Taxes & Surcharges"}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {locale === "ar" ? "مطابق للمتطلبات المحاسبية والقانونية" : "Compliant with international accounting"}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showTaxes}
                    onChange={(e) => setShowTaxes(e.target.checked)}
                    className="size-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-800">
                        {locale === "ar" ? "ختم الوكالة والتوقيع الرقمي" : "Agency Seal & Official Stamp"}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {locale === "ar" ? "إظهار ختم شركتك واعتمادها الرسمي" : "Displays your branded verified badge"}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showStamp}
                    onChange={(e) => setShowStamp(e.target.checked)}
                    className="size-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              <span>{isCopied ? (locale === "ar" ? "تم نسخ الرابط!" : "Copied!") : (locale === "ar" ? "نسخ رابط التحقق" : "Copy Verification")}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-white" />
              <span>{locale === "ar" ? "طباعة تجريبية" : "Simulate Print"}</span>
            </button>
          </div>
        </div>

        {/* Right: Real Document Live Render Preview (7 cols) */}
        <div className="lg:col-span-7 bg-slate-100/90 p-4 sm:p-8 flex flex-col justify-center items-center">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-300 shadow-2xl shadow-slate-900/10 p-6 sm:p-8 space-y-6 text-slate-900 relative">
            {/* Watermark / Digital Seal */}
            {showStamp && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-emerald-500/20 rounded-full size-44 flex flex-col items-center justify-center pointer-events-none rotate-[-15deg] select-none">
                <span className="text-xs font-black tracking-widest text-emerald-700/40 uppercase">CONFIRMED & ISSUED</span>
                <span className="text-[10px] font-bold text-emerald-600/30">LONALIZA ENTERPRISE</span>
                <span className="text-[9px] font-mono text-emerald-600/30">REF: LN-98421</span>
              </div>
            )}

            {/* Document Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    LN
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-900">
                      YOUR LUXURY TRAVEL AGENCY
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      LICENSED BY IATA & TOURISM AUTHORITY • VAT: TR89012488
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-end">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs font-black text-teal-800 uppercase tracking-wider">
                  {serviceType === "flight"
                    ? "E-TICKET RECEIPT"
                    : serviceType === "hotel"
                    ? "HOTEL CONFIRMATION VOUCHER"
                    : serviceType === "package"
                    ? "HOLIDAY PACKAGE ITINERARY"
                    : "TRANSFER SERVICE ORDER"}
                </span>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  NO: <strong className="text-slate-900">LN-2026-98421</strong>
                </div>
                <div className="text-[10px] text-slate-400">Date: 2026-09-05</div>
              </div>
            </div>

            {/* Passenger & Booking Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">{locale === "ar" ? "المسافر الرئيسي" : "Lead Guest"}</div>
                <div className="font-bold text-slate-800 mt-0.5">Mr. Tariq Mansour</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">{locale === "ar" ? "رقم المرجع / PNR" : "PNR Reference"}</div>
                <div className="font-mono font-bold text-teal-700 mt-0.5">TK89PL</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">{locale === "ar" ? "الحالة" : "Status"}</div>
                <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Confirmed</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">{locale === "ar" ? "بوابة الدفع" : "Payment"}</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">Stripe 3D-Sec</div>
              </div>
            </div>

            {/* Service Specific Itinerary Card */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              {serviceType === "flight" && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Plane className="h-4 w-4 text-teal-600" />
                      Turkish Airlines — Flight TK1984 (Boeing 787-9 Dreamliner)
                    </span>
                    <span className="text-teal-700 font-mono">Economy Flexible</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-3 items-center">
                    <div className="text-start">
                      <div className="text-lg font-black text-slate-900">IST 08:30</div>
                      <div className="text-xs text-slate-500">Istanbul Int'l (IST)</div>
                      <div className="text-[10px] text-slate-400 font-mono">Terminal 1 • Gate A4</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400">4h 10m • Direct</span>
                      <div className="w-full border-t border-dashed border-slate-300 relative my-1">
                        <Plane className="h-3.5 w-3.5 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-0.5" />
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold">Confirmed Seat 14A</span>
                    </div>
                    <div className="text-end">
                      <div className="text-lg font-black text-slate-900">LHR 10:40</div>
                      <div className="text-xs text-slate-500">London Heathrow (LHR)</div>
                      <div className="text-[10px] text-slate-400 font-mono">Terminal 2</div>
                    </div>
                  </div>
                </div>
              )}

              {serviceType === "hotel" && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-teal-600" />
                      The Ritz-Carlton Istanbul, Bosphorus View Suite
                    </span>
                    <span className="text-teal-700 font-mono">5 Stars Luxury</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-3 items-center">
                    <div className="text-start">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Check-In</div>
                      <div className="text-sm font-black text-slate-900">14 Sep 2026</div>
                      <div className="text-[10px] text-slate-500">From 14:00</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-teal-800">4 Nights</span>
                      <span className="text-[10px] text-slate-500">2 Adults • Breakfast Inc.</span>
                    </div>
                    <div className="text-end">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Check-Out</div>
                      <div className="text-sm font-black text-slate-900">18 Sep 2026</div>
                      <div className="text-[10px] text-slate-500">Until 12:00</div>
                    </div>
                  </div>
                </div>
              )}

              {serviceType === "package" && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Compass className="h-4 w-4 text-teal-600" />
                      7-Day Grand Turkey Discovery Package (Istanbul + Cappadocia)
                    </span>
                    <span className="text-teal-700 font-mono">VIP Escorted</span>
                  </div>
                  <div className="pt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>• Flights IST-ASR-IST Included</span>
                      <span className="text-emerald-700 font-bold">Checked In</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Cave Suite 4 Nights + Hot Air Balloon</span>
                      <span className="text-emerald-700 font-bold">Reserved</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Private Mercedes Maybach Chauffeur</span>
                      <span className="text-emerald-700 font-bold">Dispatched</span>
                    </div>
                  </div>
                </div>
              )}

              {serviceType === "transfer" && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-teal-600" />
                      Private Airport VIP Transfer (Mercedes-Benz V-Class Extra Long)
                    </span>
                    <span className="text-teal-700 font-mono">Meet & Greet</span>
                  </div>
                  <div className="pt-2 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Pickup: Istanbul Airport (IST) Gate 14</span>
                      <span className="font-bold text-slate-900">14 Sep 2026 — 09:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dropoff: The Ritz-Carlton Bosphorus Hotel</span>
                      <span className="font-bold text-teal-700">Driver: Mehmet Demir</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{locale === "ar" ? "الأجرة الأساسية للخدمة" : "Base Service Fare"}</span>
                <span className="font-mono">{currencySymbol} 840.00</span>
              </div>
              {showTaxes && (
                <>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>{locale === "ar" ? "رسوم المطار والوقود والموانئ" : "Airport & Fuel Surcharges"}</span>
                    <span className="font-mono">{currencySymbol} 92.50</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>{locale === "ar" ? "ضريبة القيمة المضافة (VAT 10%)" : "Value Added Tax (VAT 10%)"}</span>
                    <span className="font-mono">{currencySymbol} 84.00</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>{locale === "ar" ? "الإجمالي المدفوع بالكامل" : "Total Amount Paid"}</span>
                <span className="font-mono text-teal-800">
                  {currencySymbol} {showTaxes ? "1,016.50" : "840.00"}
                </span>
              </div>
            </div>

            {/* Bottom QR Verification & Legal Footer */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
              {showQr ? (
                <div className="flex items-center gap-3">
                  <div className="size-16 rounded-xl border border-slate-300 p-1 bg-white shadow-2xs flex items-center justify-center">
                    <QrCode className="size-14 text-slate-900" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>{locale === "ar" ? "التحقق الرقمي المباشر" : "Instant Verification"}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">Token: e79f-44a0-8812-bc78</div>
                    <div className="text-[9px] text-teal-700 font-semibold">https://your-agency.com/verify/LN-98421</div>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 italic">
                  QR code verification disabled in settings
                </div>
              )}

              <div className="text-end text-[10px] text-slate-400">
                <div>Powered by Lonaliza Enterprise Engine</div>
                <div className="font-mono">100% Agency Owned System</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
