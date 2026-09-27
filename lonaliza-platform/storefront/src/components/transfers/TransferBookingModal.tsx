// src/components/transfers/TransferBookingModal.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  Car,
  Plane,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Banknote,
  Percent,
  CheckCircle2,
  FileText,
  UploadCloud,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Download,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { buildWhatsAppLink } from "@/lib/utils";

interface SelectedOffer {
  offer_id: string;
  vehicleClassId?: string;
  car_class: {
    title: string;
    capacity: number;
    luggage: number;
    image?: string;
  };
  price: number;
  basePrice?: number;
  currency: string;
  supplier?: string;
  cleanlinessRating?: number;
  fromLabel?: string;
  toLabel?: string;
  date?: string;
  time?: string;
  mode?: "transfer" | "hourly";
  hours?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  offer: SelectedOffer | null;
  onSuccess?: (booking: any) => void;
}

export const TransferBookingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  offer,
  onSuccess,
}) => {
  const { locale } = useLocale();
  const { formatPrice } = useCurrency();
  const isAr = locale === "ar";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields - Step 1: Passenger
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paxCount, setPaxCount] = useState(2);
  const [luggageCount, setLuggageCount] = useState(2);

  // Form Fields - Step 2: Flight & Passport
  const [flightNumber, setFlightNumber] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [passportUrls, setPassportUrls] = useState<string[]>([]);
  const [passportUploadInput, setPassportUploadInput] = useState("");

  // Form Fields - Step 3: Payment Choice
  // "online_full" = 10% discount, "deposit_half" = 5% discount, "cash_arrival" = 0% discount
  const [paymentMode, setPaymentMode] = useState<"online_full" | "deposit_half" | "cash_arrival">("online_full");

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !offer) return null;

  const basePrice = offer.price || 70;
  const currency = offer.currency || "USD";

  // Dynamic Discount Calculation
  let discountPct = 0;
  let discountNote = "";
  if (paymentMode === "online_full") {
    discountPct = 10;
    discountNote = isAr ? "خصم الدفع الإلكتروني المسبق 10%" : "10% Online Full Payment Discount";
  } else if (paymentMode === "deposit_half") {
    discountPct = 5;
    discountNote = isAr ? "خصم تأكيد الحجز المبكر 5%" : "5% Early Deposit Discount";
  }

  const discountAmount = Math.round((basePrice * discountPct) / 100);
  const finalTotal = Math.max(10, basePrice - discountAmount);
  const depositToPayNow =
    paymentMode === "online_full"
      ? finalTotal
      : paymentMode === "deposit_half"
      ? Math.round(finalTotal * 0.5)
      : 0;
  const cashToPayDriver = finalTotal - depositToPayNow;

  const handleAddPassportUrl = () => {
    if (!passportUploadInput.trim()) return;
    setPassportUrls((prev) => [...prev, passportUploadInput.trim()]);
    setPassportUploadInput("");
  };

  const handleRemovePassport = (index: number) => {
    setPassportUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmBooking = async () => {
    if (!fullName || !phone) {
      setError(isAr ? "يرجى كتابة الاسم ورقم الهاتف للمتابعة" : "Please provide your full name and phone number");
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        serviceType: offer.mode === "hourly" ? "daily_tour" : "transfer",
        mode: offer.mode,
        hours: offer.hours,
        guestName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: phone.trim(),
        fromLabel: offer.fromLabel || "مطار إسطنبول (IST)",
        toLabel: offer.toLabel || hotelAddress || "الفندق / الوجهة",
        address: hotelAddress || offer.toLabel,
        scheduledAt: `${offer.date || new Date().toISOString().slice(0, 10)}T${offer.time || "12:00"}:00`,
        flightNumber: flightNumber.trim() || undefined,
        hotelName: hotelAddress.trim() || undefined,
        vehicleClassId: offer.vehicleClassId || "vc-vito-vip",
        passengers: {
          adults: paxCount,
          children: 0,
          infants: 0,
        },
        luggage: {
          standard: luggageCount,
          large: 0,
        },
        paymentMode,
        pricing: {
          basePrice,
          paymentDiscountAmount: discountAmount,
          finalTotal,
        },
        passengerPassports: passportUrls.map((url, i) => ({
          passengerName: `${fullName} (جواز ${i + 1})`,
          photoUrl: url,
        })),
        customerNotes: specialNotes.trim() || undefined,
      };

      const res = await fetch("/api/transfers/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "فشل تأكيد الحجز، يرجى المحاولة لاحقاً");
      }

      setBookingResult(data.booking);
      setStep(4);
      if (onSuccess) onSuccess(data.booking);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء الحجز");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppConciergeLink = () => {
    if (!bookingResult) return "#";
    const msg = encodeURIComponent(
      `مرحباً لوناليزا، أود المتابعة بخصوص حجزي رقم: ${bookingResult.bookingNumber}\nالاسم: ${fullName}\nالمسار: ${offer.fromLabel} ➔ ${offer.toLabel}\nالتاريخ: ${offer.date} ${offer.time}\nخيار الدفع: ${paymentMode}`
    );
    return `https://wa.me/905342311234?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-radial from-amber-500/15 via-slate-50 dark:via-slate-900 to-white dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 rtl:left-auto rtl:right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black">
              Lonaliza VIP Chauffeur
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {offer.car_class.title}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {step === 4
              ? (isAr ? "تم تأكيد حجزك بنجاح! 🌟" : "Booking Confirmed Successfully! 🌟")
              : (isAr ? "حجز خدمة التوصيل والنقل الفاخر" : "Book VIP Transfer Service")}
          </h2>

          {/* Progress Steps (1 to 3) */}
          {step < 4 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { id: 1, label: isAr ? "بيانات المسافر" : "Passenger" },
                { id: 2, label: isAr ? "الرحلة والجواز" : "Flight & Passport" },
                { id: 3, label: isAr ? "خيارات الدفع" : "Payment" },
              ].map((s) => (
                <div
                  key={s.id}
                  className={`flex-1 text-center py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    step === s.id
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : step > s.id
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800/60 text-slate-400"
                  }`}
                >
                  <span className="font-mono">{s.id}. </span>
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          {/* STEP 1: PASSENGER DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{offer.car_class.title}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    {offer.fromLabel} ➔ {offer.toLabel || "الوجهة المختارة"}
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <div className="text-base font-black text-amber-500 font-mono">
                    {formatPrice(basePrice, currency)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {offer.date} | {offer.time}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {isAr ? "الاسم الكامل للمسافر الرئيسي *" : "Lead Passenger Full Name *"}
                </label>
                <div className="relative">
                  <User className="absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? "مثال: عبد الله أحمد" : "e.g. John Smith"}
                    className="w-full pr-9 rtl:pr-9 ltr:pl-9 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {isAr ? "رقم الهاتف / واتساب للتواصل *" : "WhatsApp / Phone Number *"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 50 123 4567"
                      className="w-full pr-9 rtl:pr-9 ltr:pl-9 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {isAr ? "البريد الإلكتروني (اختياري للإيصال)" : "Email (Optional for receipt)"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full pr-9 rtl:pr-9 ltr:pl-9 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {isAr ? "عدد الركاب" : "Passengers"}
                  </label>
                  <select
                    value={paxCount}
                    onChange={(e) => setPaxCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14].map((n) => (
                      <option key={n} value={n}>
                        {n} {isAr ? "أشخاص" : "pax"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {isAr ? "عدد الحقائب" : "Luggage"}
                  </label>
                  <select
                    value={luggageCount}
                    onChange={(e) => setLuggageCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-amber-500"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {isAr ? "حقائب" : "bags"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FLIGHT & PASSPORTS */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-sky-500" />
                  <span>{isAr ? "رقم رحلة الطيران (لتتبع موعد الوصول بالدقيقة)" : "Flight Number (For live tracking)"}</span>
                </label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder={isAr ? "مثال: TK 1821 أو SV 260" : "e.g. TK 1821"}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase focus:outline-hidden focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {isAr
                    ? "يقوم فريق العمليات بتتبع رحلتك عبر الرادار، وسينتظرك السائق مجاناً حتى في حال تأخر الطائرة."
                    : "Operations team tracks your flight in real-time. Chauffeur waits for free even if flight is delayed."}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {isAr ? "اسم الفندق أو العنوان الدقيق للتوصيل" : "Hotel Name or Drop-off Address"}
                </label>
                <input
                  type="text"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  placeholder={isAr ? "مثال: فندق سيراجان بالاس كمبينسكي، بشكطاش" : "e.g. Ciragan Palace Kempinski"}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Optional Passports */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? "إرفاق صورة الجواز (تسهيل إجراءات النقل السياحي TURSAB)" : "Passport Copy (Optional for TURSAB)"}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold">{isAr ? "اختياري" : "Optional"}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr
                    ? "تطلب اللوائح التركية بيانات الجواز لتسجيل وثيقة الطريق السياحي الرسمية. يمكنك إرفاق رابط الصورة هنا."
                    : "Turkish regulations allow registration of tourist transport road manifests."}
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={passportUploadInput}
                    onChange={(e) => setPassportUploadInput(e.target.value)}
                    placeholder="https://... رابط صورة الجواز"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddPassportUrl}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-colors"
                  >
                    {isAr ? "إضافة" : "Add"}
                  </button>
                </div>

                {passportUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {passportUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-mono">{isAr ? `جواز ${idx + 1}` : `Passport ${idx + 1}`}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePassport(idx)}
                          className="text-rose-500 hover:text-rose-600 font-bold ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {isAr ? "ملاحظات وطلبات خاصة للسائق" : "Special Requests for Chauffeur"}
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder={isAr ? "مقعد طفل، سائق يتحدث العربية، استقبال بلافتة خاصة..." : "Baby seat, Arabic speaking driver, name placard..."}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: 3-TIER PAYMENT OPTIONS */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div className="text-slate-600 dark:text-slate-300 font-medium">
                {isAr ? "اختر طريقة الدفع المناسبة لك من بين الخيارات الثلاثة التالية:" : "Select your preferred payment method:"}
              </div>

              <div className="space-y-3">
                {/* OPTION 1: 100% ONLINE (10% DISCOUNT) */}
                <div
                  onClick={() => setPaymentMode("online_full")}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-2 ${
                    paymentMode === "online_full"
                      ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-md"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMode === "online_full" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-400"
                      }`}>
                        {paymentMode === "online_full" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <CreditCard className="w-5 h-5 text-emerald-500" />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{isAr ? "دفع إلكتروني كامل 100% أونلاين" : "100% Full Online Payment"}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs">
                            خصم فوري 10%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isAr ? "تأكيد فوري وآمن ببطاقات الائتمان أو Apple Pay مع أفضل سعر مضمون." : "Instant confirmation with Visa/Mastercard/Apple Pay."}
                        </div>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left font-mono">
                      <div className="text-xs line-through text-slate-400">${basePrice}</div>
                      <div className="text-lg font-black text-emerald-500">
                        ${Math.max(10, basePrice - Math.round(basePrice * 0.1))} {currency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OPTION 2: 50% DEPOSIT (5% DISCOUNT) */}
                <div
                  onClick={() => setPaymentMode("deposit_half")}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-2 ${
                    paymentMode === "deposit_half"
                      ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-md"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMode === "deposit_half" ? "border-amber-500 bg-amber-500 text-white" : "border-slate-400"
                      }`}>
                        {paymentMode === "deposit_half" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <Percent className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{isAr ? "دفعة أولى 50% تأكيد حجز" : "50% Deposit Down-Payment"}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs">
                            خصم 5%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isAr ? "ادفع النصف الآن لتأكيد الحجز، وسدد النصف الآخر نقداً للسائق عند الوصول." : "Pay 50% now, balance in cash to driver."}
                        </div>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left font-mono">
                      <div className="text-xs line-through text-slate-400">${basePrice}</div>
                      <div className="text-base font-black text-amber-500">
                        ${Math.round((basePrice * 0.95) * 0.5)} {currency} <span className="text-[10px] font-sans text-slate-400">{isAr ? "الآن" : "now"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OPTION 3: 100% CASH ON ARRIVAL */}
                <div
                  onClick={() => setPaymentMode("cash_arrival")}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-2 ${
                    paymentMode === "cash_arrival"
                      ? "border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 shadow-md"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMode === "cash_arrival" ? "border-sky-500 bg-sky-500 text-white" : "border-slate-400"
                      }`}>
                        {paymentMode === "cash_arrival" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <Banknote className="w-5 h-5 text-sky-500" />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {isAr ? "دفع نقدي 100% عند الوصول للسائق" : "100% Cash on Arrival to Driver"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isAr ? "ادفع كامل المبلغ كاش ($ / € / ₺) للسائق مباشرة بعد انتهاء المشوار." : "Pay full amount in cash to chauffeur at arrival."}
                        </div>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left font-mono">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        ${basePrice} {currency}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">{isAr ? "بدون دفعة مسبقة" : "0 upfront"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-sans">{isAr ? "السعر الأساسي للرحلة:" : "Base Fare:"}</span>
                  <span>${basePrice} {currency}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="font-sans">{discountNote}:</span>
                    <span>-${discountAmount} {currency}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-sans">{isAr ? "المبلغ الإجمالي النهائي:" : "Final Total Fare:"}</span>
                  <span className="text-base text-amber-500">${finalTotal} {currency}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="font-sans">{isAr ? "المستحق دفعه الآن:" : "Due Now:"}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${depositToPayNow} {currency}</span>
                </div>
                {cashToPayDriver > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-sans">{isAr ? "المتبقي للدفع نقداً للسائق:" : "Remaining Cash to Driver:"}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">${cashToPayDriver} {currency}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && bookingResult && (
            <div className="space-y-5 animate-fadeIn text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  {isAr ? "رقم مرجع الحجز الرسمي" : "Official Booking Reference"}
                </span>
                <div className="text-2xl font-black text-amber-500 font-mono tracking-wider">
                  {bookingResult.bookingNumber}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-right rtl:text-right ltr:text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isAr ? "المسافر:" : "Passenger:"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isAr ? "السيارة:" : "Vehicle:"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{offer.car_class.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isAr ? "المسار:" : "Route:"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{offer.fromLabel} ➔ {offer.toLabel || "الوجهة"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isAr ? "الموعد:" : "Schedule:"}</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{offer.date} | {offer.time}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-mono">
                  <span className="font-sans text-slate-500">{isAr ? "الإجمالي:" : "Total Fare:"}</span>
                  <span className="font-black text-amber-500">${bookingResult.pricing?.total} {currency}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppConciergeLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <MessageCircle size={16} />
                  <span>{isAr ? "متابعة الحجز مع الكونسيرج عبر واتساب" : "Contact Concierge on WhatsApp"}</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-all"
                >
                  <Download size={16} />
                  <span>{isAr ? "طباعة / حفظ إشعار الحجز" : "Print Voucher"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1) as any)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                <span>{isAr ? "السابق" : "Back"}</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!fullName || !phone)) {
                    setError(isAr ? "يرجى كتابة الاسم ورقم الهاتف للمتابعة" : "Name and phone are required");
                    return;
                  }
                  setError(null);
                  setStep((prev) => Math.min(3, prev + 1) as any);
                }}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                <span>{isAr ? "التالي" : "Next"}</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/30 transition-all disabled:opacity-50"
              >
                <Sparkles size={16} />
                <span>
                  {isSubmitting
                    ? (isAr ? "جاري تأكيد الحجز..." : "Confirming...")
                    : (isAr ? `تأكيد الحجز النهائي ($${finalTotal})` : `Confirm VIP Booking ($${finalTotal})`)}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
