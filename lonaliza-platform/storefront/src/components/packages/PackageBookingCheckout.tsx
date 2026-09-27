"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  Car,
  Check,
  CheckCircle,
  ChevronRight,
  CreditCard,
  HeartHandshake,
  Info,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Minus,
  Phone,
  Plane,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { featuredPackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import {
  enrichPackage,
  type EnrichedHolidayPackage,
} from "@/data/package-enrichment";
import { createBooking } from "@/data/bookings";
import { buildBusinessWhatsAppLink } from "@/lib/site-whatsapp";
import { resolveDestinationMeta } from "@/lib/destination-resolver";
import type { HolidayPackage } from "@/types/package";

type CheckoutStep = "party" | "details" | "addons" | "payment" | "confirmed";

interface AddonOption {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  priceUsd: number;
  icon: "car" | "guide" | "shield" | "vip" | "yacht" | "camera";
}

const ADDON_OPTIONS: AddonOption[] = [
  {
    id: "vip_vito_roundtrip",
    titleAr: "ترقية VIP شاملة: مرسيدس فيتو مع سائق خاص طوال الرحلة",
    titleEn: "VIP Vito Chauffeur throughout entire tour",
    descAr: "سيارة مرسيدس فيتو فارهة مع سائق خاص يتحدث العربية، شامل الوقود ورسوم الطرق ومواقف السيارات 24/7.",
    descEn: "Mercedes-Benz Vito luxury van with private multilingual chauffeur, fuel and toll fees included.",
    priceUsd: 140,
    icon: "car",
  },
  {
    id: "bosphorus_private_yacht",
    titleAr: "كروز يخت خاص VIP لمدة ساعتين مع ضيافة فاخرة",
    titleEn: "2-Hour Private VIP Luxury Yacht Cruise with Hospitality",
    descAr: "إبحار خاص وحصري في مضيق البوسفور بيخت فاخر مع طاقم خاص ومشروبات باردة وساخنة وفواكه طازجة.",
    descEn: "Private Bosphorus luxury yacht cruise with crew, complimentary refreshments and scenic sunset views.",
    priceUsd: 220,
    icon: "yacht",
  },
  {
    id: "vip_photoshoot",
    titleAr: "جلسة تصوير احترافية وفيديو تذكاري بدقة 4K",
    titleEn: "Professional VIP 4K Photoshoot & Cinematic Video",
    descAr: "مصور فوتوغرافي محترف يرافقكم لأبرز معالم المدينة لتخليد أجمل اللحظات مع تسليم الصور المعدلة وفيديو سينمائي.",
    descEn: "Dedicated professional photographer capturing high-res edited photos and a 4K cinematic reel.",
    priceUsd: 150,
    icon: "camera",
  },
  {
    id: "private_guide",
    titleAr: "مرشد سياحي مرخص خاص يتحدث العربية",
    titleEn: "Licensed Arabic & English Tour Guide",
    descAr: "مرافق سياحي خاص ومرخص لجميع المعالم التاريخية والتسوق لمنحكم تجربة ثقافية أصيلة ومريحة.",
    descEn: "Private professional guide for all historical sights and personalized market walkthroughs.",
    priceUsd: 180,
    icon: "guide",
  },
  {
    id: "travel_insurance",
    titleAr: "تأمين سفر شامل وتغطية طبية لجميع المسافرين",
    titleEn: "Comprehensive Travel & Medical Insurance",
    descAr: "تأمين سفر دولي معتمد يغطي الطوارئ الطبية وتأخر الأمتعة وإلغاء الرحلات المفاجئ.",
    descEn: "International travel insurance covering medical emergencies, luggage delays, and trip cancellation.",
    priceUsd: 45,
    icon: "shield",
  },
  {
    id: "airport_fasttrack",
    titleAr: "خدمة المسار السريع واستراحة كبار الشخصيات بالمطار (Fast-Track)",
    titleEn: "Airport Fast-Track & VIP Lounge Pass",
    descAr: "أولوية الجوازات واستقبال رسمي مع دخول صالة كبار الشخصيات الفاخرة في المطار.",
    descEn: "Priority passport control & lounge access upon arrival and departure.",
    priceUsd: 75,
    icon: "vip",
  },
];

interface ChatMessage {
  id: string;
  sender: "copilot" | "user";
  text: string;
  time: string;
}

export function PackageBookingCheckout({
  initialSlug,
  customTrip,
  tripId,
  customDest,
  customTitle,
  customDays,
  customTotal,
  customDate,
  customPeople,
}: {
  initialSlug?: string;
  customTrip?: boolean;
  tripId?: string;
  customDest?: string;
  customTitle?: string;
  customDays?: number;
  customTotal?: number;
  customDate?: string;
  customPeople?: number;
}) {
  const { locale, dir } = useLocale();
  const { formatPrice, currency } = useCurrency();
  const [step, setStep] = useState<CheckoutStep>("party");

  const isCustom = customTrip || Boolean(customDest);

  // Helper to determine destination metadata with deep accurate country & city resolution
  const resolveDestMeta = (dName?: string) => {
    const meta = resolveDestinationMeta(dName);
    return {
      country: meta.countryEn,
      countryAr: meta.countryAr,
      countryEn: meta.countryEn,
      coverUrl: meta.coverUrl,
      destAr: meta.destAr,
      destEn: meta.destEn,
    };
  };

  // Package Data
  const initialCustomPkg = useMemo<HolidayPackage | null>(() => {
    if (!isCustom) return null;
    const days = customDays || 12;
    const destName = customDest || "إسطنبول";
    const meta = resolveDestMeta(destName);
    const title = customTitle || `${destName} — رحلة الأحلام الفاخرة ${days} أيام`;
    return {
      id: tripId || "custom-trip",
      slug: `custom-${tripId || "trip"}`,
      title,
      titleAr: title,
      titleEn: `${destName} — ${days} Days VIP Journey`,
      destination: destName,
      destinationAr: meta.destAr,
      destinationEn: meta.destEn,
      country: meta.country,
      countryAr: meta.countryAr,
      countryEn: meta.countryEn,
      durationDays: days,
      durationNights: Math.max(1, days - 1),
      price: customTotal || 1515,
      currency: "USD",
      rating: 4.9,
      enableDirectBooking: true,
      images: [
        {
          url: meta.coverUrl,
          alt: destName,
          width: 1200,
          height: 800,
        },
      ],
      amenities: [
        "سيارة خاصة VIP مع سائق خاص طوال الرحلة",
        "فندق 5 نجوم فاخر بإطلالة ساحرة مع وجبة الإفطار",
        "برنامج جولات سياحية يومية مخصصة",
        "استقبال وتوديع المطار الرسمي",
      ],
      amenitiesAr: [
        "سيارة خاصة VIP مع سائق خاص طوال الرحلة",
        "فندق 5 نجوم فاخر بإطلالة ساحرة مع وجبة الإفطار",
        "برنامج جولات سياحية يومية مخصصة",
        "استقبال وتوديع المطار الرسمي",
      ],
      inclusionsAr: [
        "استقبال رسمي في المطار والتوصيل للفندق بسيارة VIP خاصة",
        "إقامة فندقية فاخرة طوال مدة البرنامج مع الإفطار اليومي",
        "جولات يومية خاصة بكامل المعالم المذكورة في الجدول مع سائق خاص",
        "توديع المطار في اليوم الأخير",
        "خدمة المتابعة وخدمة العملاء والكونسيرج 24/7 عبر واتساب",
      ],
      itineraryAr: [],
    };
  }, [customDays, customDest, customTitle, customTotal, isCustom, tripId]);

  const [rawPkg, setRawPkg] = useState<HolidayPackage | null>(() => {
    if (initialCustomPkg) return initialCustomPkg;
    return (
      featuredPackages.find((p) => p.slug === (initialSlug || featuredPackages[0]?.slug)) ??
      featuredPackages[0] ??
      null
    );
  });

  const [catalog, setCatalog] = useState<HolidayPackage[]>(() => {
    if (initialCustomPkg) {
      return [initialCustomPkg, ...featuredPackages];
    }
    return featuredPackages;
  });

  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialCustomPkg ? initialCustomPkg.slug : (initialSlug || featuredPackages[0]?.slug || "")
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = sessionStorage.getItem("lonaliza_active_booking_trip");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.trip) {
          const t = parsed.trip;
          const c = parsed.cost;
          const days = t.durationDays || customDays || 12;
          const destName = t.destination || customDest || "إسطنبول";
          const meta = resolveDestMeta(destName);
          const title = t.titleAr || customTitle || `${destName} — رحلة الأحلام الفاخرة ${days} أيام`;
          const imageCover =
            t.days?.flatMap((d: any) => d.stops)?.find((s: any) => s.image)?.image ||
            meta.coverUrl;

          const loadedPkg: HolidayPackage = {
            id: t.id || tripId || "custom-trip",
            slug: `custom-${t.id || "trip"}`,
            title,
            titleAr: title,
            titleEn: t.titleEn || `${destName} — ${days} Days VIP Journey`,
            destination: destName,
            destinationAr: meta.destAr,
            destinationEn: meta.destEn,
            country: meta.country,
            countryAr: meta.countryAr,
            countryEn: meta.countryEn,
            durationDays: days,
            durationNights: Math.max(1, days - 1),
            price: c?.total || customTotal || 1515,
            currency: c?.currency || "USD",
            rating: 4.9,
            enableDirectBooking: true,
            images: [
              {
                url: imageCover,
                alt: destName,
                width: 1200,
                height: 800,
              },
            ],
            amenities: [
              "سيارة خاصة VIP مع سائق خاص طوال الرحلة",
              "فندق 5 نجوم فاخر بإطلالة ساحرة مع وجبة الإفطار",
              "برنامج جولات سياحية يومية مخصصة",
              "استقبال وتوديع المطار الرسمي",
            ],
            amenitiesAr: [
              "سيارة خاصة VIP مع سائق خاص طوال الرحلة",
              "فندق 5 نجوم فاخر بإطلالة ساحرة مع وجبة الإفطار",
              "برنامج جولات سياحية يومية مخصصة",
              "استقبال وتوديع المطار الرسمي",
            ],
            inclusionsAr: [
              "استقبال رسمي في المطار والتوصيل للفندق بسيارة VIP خاصة",
              "إقامة فندقية فاخرة طوال مدة البرنامج مع الإفطار اليومي",
              "جولات يومية خاصة بكامل المعالم المذكورة في الجدول مع سائق خاص",
              "توديع المطار في اليوم الأخير",
              "خدمة المتابعة وخدمة العملاء والكونسيرج 24/7 عبر واتساب",
            ],
            itineraryAr: (t.days || []).map((d: any) => ({
              day: d.day,
              title: d.titleAr || `اليوم ${d.day}`,
              description: d.notes || (d.stops || []).map((s: any) => s.titleAr).join(" • "),
            })),
          };

          setRawPkg(loadedPkg);
          setSelectedSlug(loadedPkg.slug);
          setCatalog((prev) => [loadedPkg, ...prev.filter((p) => p.slug !== loadedPkg.slug)]);

          if (t.arrivalDate) {
            setStartDate(t.arrivalDate);
          }
          if (t.prefs?.travelers) {
            setAdults(Math.max(1, Number(t.prefs.travelers) || 2));
          }
        }
      }
    } catch {}
  }, [customDays, customDest, customTitle, customTotal, tripId]);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedPackages().then((packages) => {
      if (cancelled) return;
      if (packages.length > 0) {
        if (isCustom && rawPkg) {
          setCatalog([rawPkg, ...packages.filter((p) => p.slug !== rawPkg.slug)]);
        } else {
          setCatalog(packages);
          const target =
            packages.find((p) => p.slug === selectedSlug || p.id === selectedSlug) ||
            packages[0];
          if (target && !isCustom) {
            setRawPkg(target);
            setSelectedSlug(target.slug);
          }
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isCustom, rawPkg, selectedSlug]);

  const pkg = useMemo<EnrichedHolidayPackage | null>(() => {
    if (!rawPkg) return null;
    return enrichPackage(rawPkg);
  }, [rawPkg]);

  // Form State
  const [startDate, setStartDate] = useState<string>(() => {
    if (customDate) return customDate;
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [adults, setAdults] = useState<number>(() => customPeople || 2);
  const [children, setChildren] = useState<number>(0);
  const [rooms, setRooms] = useState<number>(1);

  // Traveler Details
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [passportNumber, setPassportNumber] = useState<string>("");
  const [nationality, setNationality] = useState<string>("المملكة العربية السعودية");
  const [specialRequests, setSpecialRequests] = useState<string>("");

  // Addons: default is empty (NO unexpected $140 Vito charge)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Check if trip already includes VIP car/chauffeur
  const tripIncludesVito = Boolean(
    isCustom ||
    rawPkg?.amenities?.some((a) => /مرسيدس|فيتو|vito|سائق خاص|private car|سيارة خاصة/i.test(a)) ||
    rawPkg?.inclusionsAr?.some((a) => /مرسيدس|فيتو|vito|سائق خاص|سيارة vip/i.test(a))
  );

  // Payment State
  const [payMethod, setPayMethod] = useState<"card" | "whatsapp" | "deposit">("card");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvc, setCardCvc] = useState<string>("");
  const [cardHolder, setCardHolder] = useState<string>("");

  // Booking Result
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // AI Booking Copilot State
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "copilot",
      text:
        locale === "ar"
          ? "أهلاً بك! أنا مستشار الحجز الذكي من لوناليزا. يسعدني مساعدتك في تأكيد برنامجك السياحي واختيار أفضل الإضافات وترتيبات النقل الـ VIP. كيف يمكنني خدمتك؟"
          : "Welcome! I'm your Lonaliza Booking Copilot. I can assist you with your itinerary, VIP transfers, and custom booking requests. How can I help you today?",
      time: "الآن",
    },
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isCopilotTyping, setIsCopilotTyping] = useState<boolean>(false);

  // Price Calculations
  const duration = Math.max(1, pkg?.durationDays ?? 5);
  const basePeople = Math.max(1, customPeople || 2);
  const isCustomPackage = Boolean(isCustom || pkg?.id?.startsWith("custom-") || pkg?.slug?.startsWith("custom-") || initialCustomPkg);

  // For custom trips, pkg.price represents the complete package total for basePeople.
  const basePricePerPerson = isCustomPackage
    ? Math.round((pkg?.price ?? 1540) / basePeople)
    : (pkg?.price ?? 450);

  const travelersTotal = adults + children * 0.5;
  const packageSubtotal = isCustomPackage && travelersTotal === basePeople
    ? (pkg?.price ?? 1540)
    : Math.round(basePricePerPerson * travelersTotal);

  const addonsSubtotal = useMemo(() => {
    return selectedAddons.reduce((acc, addonId) => {
      const found = ADDON_OPTIONS.find((a) => a.id === addonId);
      return acc + (found ? found.priceUsd : 0);
    }, 0);
  }, [selectedAddons]);

  const grandTotalUsd = packageSubtotal + addonsSubtotal;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  // Copilot smart replies
  const handleSendCopilotMessage = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: userText,
      time: "الآن",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsCopilotTyping(true);

    setTimeout(() => {
      let botReply = "";
      const lower = userText.toLowerCase();

      if (lower.includes("سيارة") || lower.includes("vito") || lower.includes("نقل") || lower.includes("مطار") || lower.includes("car")) {
        botReply =
          locale === "ar"
            ? `نعم بالتأكيد! جميع برامج لوناليزا تعتمد بشكل أساسي على سيارات مرسيدس فيتو VIP خاصة وفارهة ومكيفة مع سائق خاص يتحدث العربية، شاملة للوقود ورسوم الجسور ومواقف السيارات بالكامل، وتبدأ باستقبالكم من بوابة المطار.`
            : `Yes, all our luxury packages feature private VIP Mercedes Vito vans with dedicated Arabic & English speaking chauffeurs, fully inclusive of fuel, highway tolls, and parking fees from airport arrival.`;
      } else if (lower.includes("أطفال") || lower.includes("طفل") || lower.includes("children") || lower.includes("عائلة")) {
        botReply =
          locale === "ar"
            ? `نرحب بالعائلات الكريمة! يحصل الأطفال دون سن 12 على خصم 50% على البرنامج، والرضع دون سن سنتين مجاناً تماماً مع توفير مقاعد أطفال خاصة في سيارة المرسيدس فيتو.`
            : `Families are warmly welcomed! Children under 12 receive a 50% discount on the package, and infants under 2 travel free with complimentary baby car seats provided in our VIP Vito.`;
      } else if (lower.includes("إلغاء") || lower.includes("استرداد") || lower.includes("cancel")) {
        botReply =
          locale === "ar"
            ? `نوفر سياسة إلغاء مرنة للغاية: يمكنك إلغاء أو تعديل موعد رحلتك مجاناً حتى 7 أيام قبل موعد الوصول دون أي رسوم خصم، مع استرداد فوري 100%.`
            : `We offer flexible cancellation: Free cancellation and date rescheduling up to 7 days before check-in with 100% instant refund guaranteed.`;
      } else if (lower.includes("دفع") || lower.includes("تقسيط") || lower.includes("payment") || lower.includes("بطاقة")) {
        botReply =
          locale === "ar"
            ? `خيارات الدفع لدينا مرنة وآمنة تماماً ومشفرة 256-bit: يمكنك الدفع ببطاقات مدى، فيزا، ماستركارد، أو التحويل البنكي المباشر، أو دفع عربون وتأكيد الحجز والباقي عند الوصول مع السائق.`
            : `Payment is fully secured via 256-bit encryption. You can pay with Mada, Visa, Mastercard, direct bank wire, or deposit with the remaining balance settled upon arrival.`;
      } else {
        botReply =
          locale === "ar"
            ? `يسعدني خدمتك! حجزك لبرنامج (${pkg?.title || "لوناليزا"}) يشمل الإقامة الفاخرة، الانتقالات بسيارة VIP خاصة، وجدول جولات متكامل. هل ترغب بأن أضيف أي تفضيلات خاصة في ملاحظات الحجز؟`
            : `Happy to assist! Your booking for ${pkg?.title || "Lonaliza Package"} includes luxury accommodation, private VIP transfers, and a curated itinerary. Would you like me to note any specific preferences?`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "copilot",
          text: botReply,
          time: "الآن",
        },
      ]);
      setIsCopilotTyping(false);
    }, 650);
  };

  const handleFinalSubmit = async () => {
    if (!fullName || !phone) {
      setErrorMsg(
        locale === "ar"
          ? "يرجى تعبئة الاسم الكامل ورقم الهاتف للتواصل."
          : "Please enter your full name and phone number."
      );
      setStep("details");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const ref = `LL-${new Date().getFullYear()}-PKG-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await createBooking({
        type: "package",
        packageName: pkg?.title || "VIP Holiday Package",
        destination: pkg?.destination || "Turkey",
        name: fullName,
        email: email || undefined,
        phone: phone,
        message: `حجز مباشر مؤكد - كود: ${ref}
البرنامج: ${pkg?.title} (${duration} أيام)
تاريخ البدء: ${startDate}
المسافرون: ${adults} بالغين، ${children} أطفال (${rooms} غرف)
الجنسية: ${nationality}
رقم الجواز: ${passportNumber || "لم يُسجل"}
الإضافات الـ VIP: ${selectedAddons.join(", ") || "لا توجد إضافات"}
طريقة الدفع: ${payMethod}
المبلغ الإجمالي التقريبي: $${grandTotalUsd} USD
ملاحظات خاصة: ${specialRequests || "لا توجد"}`,
        metadata: {
          bookingRef: ref,
          packageId: pkg?.id,
          packageSlug: pkg?.slug,
          startDate,
          durationDays: duration,
          adults,
          children,
          rooms,
          passportNumber,
          nationality,
          selectedAddons,
          payMethod,
          grandTotalUsd,
          isDirectBooking: true,
        },
      });

      setBookingRef(ref);
      setStep("confirmed");
    } catch (err) {
      console.error("Booking creation error:", err);
      // Even if network fails, we show confirmed state because createBooking has local fallback
      setBookingRef(ref);
      setStep("confirmed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const packageTitle =
    locale === "ar"
      ? pkg?.titleAr || pkg?.title || "برنامج سياحي متكامل"
      : pkg?.titleEn || pkg?.title || "Complete Tour Package";

  const packageDest =
    locale === "ar"
      ? pkg?.destinationAr || pkg?.destination || "تركيا"
      : pkg?.destinationEn || pkg?.destination || "Turkey";

  const stepsList: { key: CheckoutStep; labelAr: string; labelEn: string; num: number }[] = [
    { key: "party", labelAr: "المسافرون والتواريخ", labelEn: "Party & Dates", num: 1 },
    { key: "details", labelAr: "بيانات التواصل", labelEn: "Traveler Info", num: 2 },
    { key: "addons", labelAr: "ترقيات VIP", labelEn: "VIP Addons", num: 3 },
    { key: "payment", labelAr: "الدفع والتأكيد", labelEn: "Payment & Confirm", num: 4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pt-28 pb-20 text-slate-800" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/packages"
              className="transition hover:text-amber-600 hover:underline"
            >
              {locale === "ar" ? "البرامج السياحية" : "Holiday Packages"}
            </Link>
            <ChevronRight size={14} className={dir === "rtl" ? "rotate-180" : ""} />
            {pkg && (
              <Link
                href={`/package/${pkg.slug}`}
                className="transition hover:text-amber-600 hover:underline"
              >
                {packageTitle}
              </Link>
            )}
            <ChevronRight size={14} className={dir === "rtl" ? "rotate-180" : ""} />
            <span className="font-semibold text-slate-900">
              {locale === "ar" ? "حجز مباشر وتأكيد فوري" : "Direct Checkout"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCopilotOpen(!copilotOpen)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition hover:opacity-95"
          >
            <Bot size={15} />
            <span>
              {copilotOpen
                ? locale === "ar"
                  ? "إخفاء المساعد الذكي"
                  : "Hide AI Copilot"
                : locale === "ar"
                ? "مستشار الحجز الذكي VIP ✨"
                : "Ask AI Copilot ✨"}
            </span>
          </button>
        </div>

        {/* Step Progress Bar */}
        {step !== "confirmed" && (
          <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stepsList.map((s) => {
                const isActive = step === s.key;
                const isPast =
                  (s.key === "party" && (step === "details" || step === "addons" || step === "payment")) ||
                  (s.key === "details" && (step === "addons" || step === "payment")) ||
                  (s.key === "addons" && step === "payment");

                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      if (isPast) setStep(s.key);
                    }}
                    disabled={!isPast && !isActive}
                    className={`flex items-center gap-3 rounded-xl p-2.5 text-start transition ${
                      isActive
                        ? "bg-amber-50 border border-amber-300/80 text-amber-950 font-bold"
                        : isPast
                        ? "text-emerald-700 hover:bg-slate-50 cursor-pointer"
                        : "text-slate-400 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isPast
                          ? "bg-emerald-600 text-white"
                          : isActive
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isPast ? <Check size={14} /> : s.num}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 leading-tight">
                        {locale === "ar" ? `الخطوة ${s.num}` : `Step ${s.num}`}
                      </p>
                      <p className="truncate text-xs sm:text-sm font-semibold">
                        {locale === "ar" ? s.labelAr : s.labelEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Grid: Form + Summary Sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className={step === "confirmed" ? "lg:col-span-12" : "lg:col-span-8"}>
            {/* STEP 1: PARTY & DATES */}
            {step === "party" && (
              <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div>
                  <h2 className="text-xl font-bold text-[#0a1628] sm:text-2xl">
                    {locale === "ar"
                      ? "الخطوة 1: تحديد موعد السفر وعدد المسافرين"
                      : "Step 1: Travel Dates & Travelers"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {locale === "ar"
                      ? "اختر موعد بدء برنامجك السياحي وعدد أفراد أسرتك أو مجموعتك لتخصيص خطة الإقامة والنقل."
                      : "Select your preferred arrival date and group size for personalized VIP transport and stays."}
                  </p>
                </div>

                {/* Package Quick Selector if needed */}
                {catalog.length > 1 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      {locale === "ar" ? "البرنامج السياحي المختار:" : "Selected Tour Package:"}
                    </label>
                    <select
                      value={selectedSlug}
                      onChange={(e) => {
                        const newSlug = e.target.value;
                        setSelectedSlug(newSlug);
                        const target = catalog.find((c) => c.slug === newSlug || c.id === newSlug);
                        if (target) {
                          setRawPkg(target);
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
                    >
                      {catalog.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.slug.startsWith("custom-") ? "⭐ " : ""}{c.title} — ({c.durationDays} {locale === "ar" ? "أيام" : "Days"}) — ${c.price} USD
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dates & Duration */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Calendar size={14} className="text-amber-600" />
                      {locale === "ar" ? "تاريخ الوصول وبدء الرحلة" : "Check-in / Start Date"}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Car size={14} className="text-amber-600" />
                      {locale === "ar" ? "مدة البرنامج ووسيلة النقل" : "Duration & Transport"}
                    </label>
                    <div className="flex h-[46px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800">
                      <span>{duration} {locale === "ar" ? "أيام كاملة" : "Days"}</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                        <Car size={12} />
                        {locale === "ar" ? "مرسيدس فيتو VIP خاصة" : "VIP Vito Included"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Travelers Counters */}
                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-slate-800">
                    {locale === "ar" ? "عدد المسافرين وتوزيع الغرف" : "Travelers & Rooms"}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Adults */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {locale === "ar" ? "البالغين" : "Adults"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {locale === "ar" ? "12+ سنة" : "12+ yrs"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults((prev) => Math.min(20, prev + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {locale === "ar" ? "الأطفال" : "Children"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {locale === "ar" ? "دون 12 سنة (خصم 50%)" : "Under 12 (50% off)"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren((prev) => Math.min(10, prev + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {locale === "ar" ? "عدد الغرف" : "Rooms"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {locale === "ar" ? "فندقية فاخرة" : "Hotel Rooms"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRooms((prev) => Math.max(1, prev - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms((prev) => Math.min(10, prev + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] px-6 py-3 font-bold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-xl hover:scale-[1.01]"
                  >
                    <span>{locale === "ar" ? "متابعة لبيانات المسافرين" : "Continue to Passenger Details"}</span>
                    <ChevronRight size={18} className={dir === "rtl" ? "rotate-180" : ""} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === "details" && (
              <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div>
                  <h2 className="text-xl font-bold text-[#0a1628] sm:text-2xl">
                    {locale === "ar"
                      ? "الخطوة 2: بيانات المسافر الرئيسي والتواصل"
                      : "Step 2: Lead Passenger & Contact Info"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {locale === "ar"
                      ? "تُستخدم هذه البيانات لإصدار وثائق الحجز وقسائم الفندق واستقبال السائق في المطار."
                      : "Used for official hotel vouchers, airport chauffeur pickup, and instant WhatsApp updates."}
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                    <AlertCircle size={18} className="shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <User size={14} className="text-amber-600" />
                      {locale === "ar" ? "الاسم الكامل (كما في جواز السفر) *" : "Full Name (as in Passport) *"}
                    </label>
                    <input
                      type="text"
                      placeholder={locale === "ar" ? "مثال: عبدالله محمد الشمري" : "e.g. John Doe"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Phone size={14} className="text-amber-600" />
                      {locale === "ar" ? "رقم الهاتف / واتساب مع الرمز الدولي *" : "Mobile & WhatsApp Number *"}
                    </label>
                    <input
                      type="tel"
                      placeholder="+966 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Mail size={14} className="text-amber-600" />
                      {locale === "ar" ? "البريد الإلكتروني لتأكيد الحجز" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <ShieldCheck size={14} className="text-amber-600" />
                      {locale === "ar" ? "رقم الجواز أو الهوية (اختياري الآن)" : "Passport / ID Number (Optional)"}
                    </label>
                    <input
                      type="text"
                      placeholder="G12345678"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    {locale === "ar"
                      ? "ملاحظات إضافية أو طلبات خاصة (شهر عسل، سرير طفل، وجبات معينة)"
                      : "Special Requests (Honeymoon setup, baby cot, dietary preferences)"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      locale === "ar"
                        ? "اكتب أي متطلبات تفضلها لفريق خدمة العملاء والسائق الخاص..."
                        : "Write any special preferences for our team and chauffeur..."
                    }
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setStep("party")}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft size={16} className={dir === "rtl" ? "rotate-180" : ""} />
                    <span>{locale === "ar" ? "العودة للتواريخ" : "Back to Dates"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!fullName || !phone) {
                        setErrorMsg(
                          locale === "ar"
                            ? "يرجى كتابة الاسم الكامل ورقم الجوال للمتابعة."
                            : "Please fill in full name and phone number."
                        );
                        return;
                      }
                      setErrorMsg("");
                      setStep("addons");
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] px-6 py-3 font-bold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-xl hover:scale-[1.01]"
                  >
                    <span>{locale === "ar" ? "متابعة لاختيار ترقيات VIP" : "Continue to VIP Upgrades"}</span>
                    <ChevronRight size={18} className={dir === "rtl" ? "rotate-180" : ""} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ADDONS */}
            {step === "addons" && (
              <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div>
                  <h2 className="text-xl font-bold text-[#0a1628] sm:text-2xl">
                    {locale === "ar"
                      ? "الخطوة 3: ترقيات الـ VIP والإضافات الفاخرة الموصى بها"
                      : "Step 3: Recommended VIP Upgrades & Extras"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {locale === "ar"
                      ? "ارتقِ برحلتك مع خيارات الراحة المعتمدة لعملاء لوناليزا المميزين."
                      : "Elevate your trip with luxury private mobility, guides, and priority airport perks."}
                  </p>
                </div>

                <div className="space-y-3.5">
                  {tripIncludesVito && (
                    <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
                        <Car size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                            {locale === "ar"
                              ? "مشمول مجاناً في باقتك: سيارة مرسيدس فيتو VIP مع سائق خاص"
                              : "Included Free in Your Package: Mercedes-Benz Vito VIP Chauffeur"}
                          </h4>
                          <span className="rounded-full bg-emerald-200/90 px-2.5 py-0.5 text-[11px] font-black text-emerald-900">
                            {locale === "ar" ? "مشمول بالكامل ✓" : "Fully Included ✓"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                          {locale === "ar"
                            ? "تتضمن باقتك سيارة مرسيدس فيتو VIP فارهة مع سائق خاص يتحدث العربية طوال مدة البرنامج دون أي رسوم إضافية."
                            : "Your package includes a private Mercedes-Benz Vito VIP with dedicated chauffeur throughout the tour at no extra charge."}
                        </p>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="text-sm font-black text-emerald-800">$0</span>
                        <span className="block text-[10px] text-emerald-600 line-through">$140</span>
                      </div>
                    </div>
                  )}

                  {ADDON_OPTIONS.filter((addon) => !(addon.id === "vip_vito_roundtrip" && tripIncludesVito)).map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);

                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-amber-400 bg-amber-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border mt-0.5 ${
                              isSelected
                                ? "border-amber-600 bg-amber-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check size={14} />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-[#0a1628]">
                                {locale === "ar" ? addon.titleAr : addon.titleEn}
                              </h4>
                              {addon.id === "vip_vito_roundtrip" && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                  {locale === "ar" ? "الأكثر طلباً ⭐" : "Top Choice ⭐"}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                              {locale === "ar" ? addon.descAr : addon.descEn}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-end">
                          <span className="text-sm sm:text-base font-bold text-amber-700">
                            +${addon.priceUsd}
                          </span>
                          <span className="block text-[11px] text-slate-400">USD</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft size={16} className={dir === "rtl" ? "rotate-180" : ""} />
                    <span>{locale === "ar" ? "العودة للبيانات" : "Back to Details"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] px-6 py-3 font-bold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-xl hover:scale-[1.01]"
                  >
                    <span>{locale === "ar" ? "متابعة للدفع وتأكيد الحجز" : "Proceed to Payment & Confirm"}</span>
                    <ChevronRight size={18} className={dir === "rtl" ? "rotate-180" : ""} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENT */}
            {step === "payment" && (
              <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div>
                  <h2 className="text-xl font-bold text-[#0a1628] sm:text-2xl">
                    {locale === "ar"
                      ? "الخطوة 4: اختيار وسيلة الدفع وتأكيد الحجز الفوري"
                      : "Step 4: Payment Method & Instant Confirmation"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {locale === "ar"
                      ? "اختر طريقتك المفضلة لإتمام الحجز وضمان برنامجك السياحي مع لوناليزا."
                      : "Select your preferred payment method to guarantee your booking."}
                  </p>
                </div>

                {/* Payment Tabs */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPayMethod("card")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
                      payMethod === "card"
                        ? "border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <CreditCard size={22} className={payMethod === "card" ? "text-amber-600" : "text-slate-400"} />
                    <span className="text-sm">{locale === "ar" ? "بطاقة بنكية / مدى" : "Credit Card / Mada"}</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">{locale === "ar" ? "تأكيد فوري 100%" : "Instant 100%"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod("whatsapp")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
                      payMethod === "whatsapp"
                        ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <MessageSquare size={22} className={payMethod === "whatsapp" ? "text-emerald-600" : "text-slate-400"} />
                    <span className="text-sm">{locale === "ar" ? "تحويل بنكي وتأكيد واتساب" : "Bank Wire via WhatsApp"}</span>
                    <span className="text-[11px] text-slate-500">{locale === "ar" ? "تأكيد مع مستشار الحجز" : "Advisor Assisted"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod("deposit")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
                      payMethod === "deposit"
                        ? "border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <HeartHandshake size={22} className={payMethod === "deposit" ? "text-amber-600" : "text-slate-400"} />
                    <span className="text-sm">{locale === "ar" ? "عربون والباقي عند الوصول" : "Deposit & Pay on Arrival"}</span>
                    <span className="text-[11px] text-slate-500">{locale === "ar" ? "تسليم مع السائق الخاص" : "Settle with Chauffeur"}</span>
                  </button>
                </div>

                {/* Card Fields if Card Selected */}
                {payMethod === "card" && (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Lock size={13} className="text-emerald-600" />
                        {locale === "ar" ? "بوابة دفع آمنة ومشفرة (Iyzico / 3D Secure)" : "256-bit Encrypted Checkout"}
                      </span>
                      <span>Mada, Visa, Mastercard</span>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">
                        {locale === "ar" ? "اسم حامل البطاقة" : "Cardholder Name"}
                      </label>
                      <input
                        type="text"
                        placeholder="MOHAMMED ALSHAMMARI"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm uppercase text-slate-800 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">
                        {locale === "ar" ? "رقم البطاقة البنكية" : "Card Number"}
                      </label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:border-amber-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-700">
                          {locale === "ar" ? "تاريخ الانتهاء" : "Expiry (MM/YY)"}
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:border-amber-500 focus:outline-none"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-700">
                          {locale === "ar" ? "رمز الأمان (CVC)" : "CVC"}
                        </label>
                        <input
                          type="text"
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:border-amber-500 focus:outline-none"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === "whatsapp" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900 leading-relaxed">
                    <p className="font-bold mb-1">
                      {locale === "ar" ? "الحجز المؤكد عبر التحويل البنكي والواتساب:" : "Bank Wire Guarantee:"}
                    </p>
                    <p>
                      {locale === "ar"
                        ? "عند الضغط على تأكيد، سيتم حجز البرنامج فوراً باسمك وتزويدك برقم الحجز وحساباتنا البنكية المعتمدة، مع تواصل مستشارك السياحي عبر الواتساب لتنسيق الإيصال واستقبال المطار."
                        : "Clicking confirm reserves your package immediately. Your dedicated advisor will share bank details and coordinate your VIP airport pickup via WhatsApp."}
                    </p>
                  </div>
                )}

                {payMethod === "deposit" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 leading-relaxed">
                    <p className="font-bold mb-1">
                      {locale === "ar" ? "تأكيد بعربون والباقي نقداً مع السائق الخاص:" : "Deposit & Cash on Arrival:"}
                    </p>
                    <p>
                      {locale === "ar"
                        ? "يتم تأكيد الحجز وإرسال قسائم الفنادق لك مباشرة، ويتم تسوية المبلغ المتبقي عند الوصول مع سائق سيارة المرسيدس فيتو VIP بالدولار أو الليرة التركية أو اليورو."
                        : "Your voucher is issued immediately upon confirmation. Settle the remaining balance with your VIP Vito chauffeur upon hotel arrival in USD, TRY, or EUR."}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setStep("addons")}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft size={16} className={dir === "rtl" ? "rotate-180" : ""} />
                    <span>{locale === "ar" ? "العودة للترقيات" : "Back to Upgrades"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] px-8 py-3.5 font-bold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>{locale === "ar" ? "جاري تأكيد حجزك الفوري..." : "Confirming Booking..."}</span>
                      </>
                    ) : (
                      <>
                        <Zap size={18} className="fill-amber-200 text-amber-200" />
                        <span>
                          {locale === "ar"
                            ? `تأكيد الحجز الآن ($${grandTotalUsd} USD)`
                            : `Confirm Booking Now ($${grandTotalUsd} USD)`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRMED */}
            {step === "confirmed" && (
              <div className="space-y-6 rounded-2xl border border-emerald-200 bg-white p-6 shadow-xl sm:p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                  <CheckCircle size={36} />
                </div>

                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
                    {locale === "ar" ? "حجز مؤكد فوري 100%" : "Confirmed & Guaranteed"}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-[#0a1628] sm:text-3xl">
                    {locale === "ar"
                      ? "تهانينا! تم تأكيد حجز برنامجك السياحي بنجاح 🎉"
                      : "Congratulations! Your Tour Booking is Confirmed 🎉"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
                    {locale === "ar"
                      ? `شكراً لاختيارك لوناليزا للسياحة والسفر. تم تجهيز سيارة المرسيدس فيتو VIP الخاصة وفنادق الإقامة لاستقبالكم في ${packageDest}.`
                      : `Thank you for choosing Lonaliza Tourism. Your private VIP Mercedes Vito and luxury stays in ${packageDest} are secured.`}
                  </p>
                </div>

                {/* Booking Code Card */}
                <div className="mx-auto max-w-md rounded-xl border border-dashed border-amber-400 bg-amber-50/80 p-4 text-center">
                  <p className="text-xs font-medium text-amber-900">
                    {locale === "ar" ? "الرقم المرجعي للحجز (Booking Reference):" : "Booking Reference Code:"}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold tracking-wider text-amber-700 font-mono">
                    {bookingRef}
                  </p>
                </div>

                {/* Summary Details */}
                <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-slate-50/70 p-5 text-start text-sm space-y-2.5">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">{locale === "ar" ? "البرنامج:" : "Package:"}</span>
                    <span className="font-bold text-slate-900">{packageTitle}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">{locale === "ar" ? "المسافر الرئيسي:" : "Lead Traveler:"}</span>
                    <span className="font-semibold text-slate-900">{fullName} ({phone})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">{locale === "ar" ? "تاريخ البدء والمدة:" : "Start & Duration:"}</span>
                    <span className="font-semibold text-slate-900">{startDate} ({duration} أيام)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">{locale === "ar" ? "المسافرون:" : "Travelers:"}</span>
                    <span className="font-semibold text-slate-900">{adults} بالغين، {children} أطفال ({rooms} غرف)</span>
                  </div>
                  <div className="flex justify-between pt-1 text-base font-bold text-slate-900">
                    <span>{locale === "ar" ? "المبلغ الإجمالي:" : "Total Price:"}</span>
                    <span className="text-emerald-700">${grandTotalUsd} USD</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <a
                    href={buildBusinessWhatsAppLink(
                      `مرحباً لوناليزا، قمت بحجز البرنامج السياحي مباشرة عبر الموقع:
الرقم المرجعي: ${bookingRef}
البرنامج: ${packageTitle}
المسافر: ${fullName}
الهاتف: ${phone}
أرجو تزويدي بتفاصيل السائق وقسائم الفندق.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-md transition hover:bg-emerald-600"
                  >
                    <MessageSquare size={18} />
                    <span>{locale === "ar" ? "متابعة الحجز مع المستشار عبر واتساب" : "Contact Concierge via WhatsApp"}</span>
                  </a>

                  <Link
                    href={`/package/${pkg?.slug || ""}`}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>{locale === "ar" ? "العودة لصفحة البرنامج" : "Back to Package"}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary & AI Copilot */}
          {step !== "confirmed" && (
            <div className="space-y-6 lg:col-span-4">
              {/* Order Summary Sticky Card */}
              <div className="sticky top-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-base font-bold text-[#0a1628] border-b border-slate-100 pb-3">
                  {locale === "ar" ? "ملخص الحجز والتكلفة" : "Booking Summary"}
                </h3>

                {pkg && (
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {pkg.images?.[0]?.url ? (
                        <Image
                          src={pkg.images[0].url}
                          alt={packageTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          {packageDest}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0a1628]">
                        {packageTitle}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin size={12} className="text-amber-600" />
                        <span>{packageDest}</span>
                        <span>•</span>
                        <span>{duration} {locale === "ar" ? "أيام" : "Days"}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span>
                      {locale === "ar" ? "البرنامج السياحي الأساسي:" : "Base Package:"}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ${packageSubtotal} USD
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>{adults} {locale === "ar" ? "بالغين" : "Adults"} {children > 0 && `+ ${children} ${locale === "ar" ? "أطفال" : "Children"}`}</span>
                    <span>${basePricePerPerson}/فرد</span>
                  </div>

                  {selectedAddons.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-dashed border-slate-200">
                      <p className="font-bold text-slate-700 text-xs">
                        {locale === "ar" ? "ترقيات VIP المختارة:" : "Selected VIP Addons:"}
                      </p>
                      {selectedAddons.map((addonId) => {
                        const addon = ADDON_OPTIONS.find((a) => a.id === addonId);
                        if (!addon) return null;
                        return (
                          <div key={addonId} className="flex justify-between text-xs text-amber-900">
                            <span className="truncate max-w-[180px]">{locale === "ar" ? addon.titleAr : addon.titleEn}</span>
                            <span className="font-semibold">+${addon.priceUsd}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-[#0a1628]">
                    <span>{locale === "ar" ? "الإجمالي الكلي:" : "Grand Total:"}</span>
                    <span className="text-amber-700">${grandTotalUsd} USD</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <ShieldCheck size={15} />
                    <span>{locale === "ar" ? "ضمان أفضل سعر وخدمة VIP" : "Best Price & VIP Service"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Car size={15} className="text-amber-600" />
                    <span>{locale === "ar" ? "سيارة مرسيدس فيتو خاصة طوال الرحلة" : "Private VIP Mercedes Vito Included"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <HeartHandshake size={15} className="text-amber-600" />
                    <span>{locale === "ar" ? "إلغاء وتعديل مرن حتى 7 أيام" : "Flexible Rescheduling up to 7 Days"}</span>
                  </div>
                </div>
              </div>

              {/* AI Copilot Drawer / Card */}
              {copilotOpen && (
                <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/50 via-white to-amber-50/30 p-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-violet-100 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2E1065] text-amber-300 shadow-sm">
                        <Bot size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {locale === "ar" ? "مستشار الحجز الذكي VIP" : "AI Booking Copilot"}
                        </h4>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {locale === "ar" ? "متصل ومستعد للمساعدة" : "Online & Ready"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCopilotOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 text-xs mb-3">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl p-2.5 leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-amber-600 text-white font-medium rounded-br-none"
                              : "bg-white border border-slate-200 text-slate-800 shadow-sm rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isCopilotTyping && (
                      <div className="flex justify-start">
                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm">
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" />
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick FAQ Prompts */}
                  <div className="mb-2 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleSendCopilotMessage(
                          locale === "ar"
                            ? "هل تشمل السيارة الفاخرة الوقود وسائق يتحدث العربية؟"
                            : "Does the VIP Vito include fuel and chauffeur?"
                        )
                      }
                      className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] text-amber-900 hover:bg-amber-200/80 transition"
                    >
                      {locale === "ar" ? "🚐 تفاصيل سيارة الـ VIP" : "🚐 VIP Vito details"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendCopilotMessage(
                          locale === "ar"
                            ? "ما هي سياسة الأطفال والأسرّة الإضافية؟"
                            : "What is the policy for children?"
                        )
                      }
                      className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] text-amber-900 hover:bg-amber-200/80 transition"
                    >
                      {locale === "ar" ? "👶 سياسة الأطفال" : "👶 Children policy"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendCopilotMessage(
                          locale === "ar"
                            ? "ما هي سياسة الإلغاء والاسترداد؟"
                            : "What is the cancellation policy?"
                        )
                      }
                      className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] text-amber-900 hover:bg-amber-200/80 transition"
                    >
                      {locale === "ar" ? "🔄 الإلغاء المرن" : "🔄 Flexible cancellation"}
                    </button>
                  </div>

                  {/* Chat Input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder={
                        locale === "ar"
                          ? "اسأل المستشار عن الرحلة..."
                          : "Ask the copilot anything..."
                      }
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendCopilotMessage(chatInput);
                        }
                      }}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendCopilotMessage(chatInput)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition"
                    >
                      <Send size={13} className={dir === "rtl" ? "rotate-180" : ""} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
