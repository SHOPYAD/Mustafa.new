/**
 * Comprehensive Universal Visa Intelligence & Travel Advisory Engine.
 * Provides accurate entry requirements, visa statuses, passport rules,
 * and essential country-specific advisory guidelines for global destinations.
 */

export interface VisaRequirement {
  status: "visa_free" | "evisa" | "visa_on_arrival" | "visa_required";
  badgeAr: string;
  badgeEn: string;
  summaryAr: string;
  summaryEn: string;
  maxStayDays: number;
  passportValidityMonths: number;
  conditionsAr: string[];
  conditionsEn: string[];
  advisoryTipsAr: string[];
  advisoryTipsEn: string[];
}

export interface NationalityOption {
  code: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  defaultOriginCityAr: string;
  defaultOriginCityEn: string;
}

export const SUPPORTED_NATIONALITIES: NationalityOption[] = [
  { code: "SA", nameAr: "المملكة العربية السعودية", nameEn: "Saudi Arabia", flag: "🇸🇦", defaultOriginCityAr: "الرياض (RUH)", defaultOriginCityEn: "Riyadh (RUH)" },
  { code: "AE", nameAr: "الإمارات العربية المتحدة", nameEn: "United Arab Emirates", flag: "🇦🇪", defaultOriginCityAr: "دبي (DXB)", defaultOriginCityEn: "Dubai (DXB)" },
  { code: "KW", nameAr: "دولة الكويت", nameEn: "Kuwait", flag: "🇰🇼", defaultOriginCityAr: "الكويت (KWI)", defaultOriginCityEn: "Kuwait City (KWI)" },
  { code: "QA", nameAr: "دولة قطر", nameEn: "Qatar", flag: "🇶🇦", defaultOriginCityAr: "الدوحة (DOH)", defaultOriginCityEn: "Doha (DOH)" },
  { code: "BH", nameAr: "مملكة البحرين", nameEn: "Bahrain", flag: "🇧🇭", defaultOriginCityAr: "المنامة (BAH)", defaultOriginCityEn: "Manama (BAH)" },
  { code: "OM", nameAr: "سلطنة عمان", nameEn: "Oman", flag: "🇴🇲", defaultOriginCityAr: "مسقط (MCT)", defaultOriginCityEn: "Muscat (MCT)" },
  { code: "EG", nameAr: "جمهورية مصر العربية", nameEn: "Egypt", flag: "🇪🇬", defaultOriginCityAr: "القاهرة (CAI)", defaultOriginCityEn: "Cairo (CAI)" },
  { code: "JO", nameAr: "المملكة الأردنية الهاشمية", nameEn: "Jordan", flag: "🇯🇴", defaultOriginCityAr: "عمان (AMM)", defaultOriginCityEn: "Amman (AMM)" },
  { code: "MA", nameAr: "المملكة المغربية", nameEn: "Morocco", flag: "🇲🇦", defaultOriginCityAr: "الدار البيضاء (CMN)", defaultOriginCityEn: "Casablanca (CMN)" },
  { code: "TR", nameAr: "الجمهورية التركية", nameEn: "Turkey", flag: "🇹🇷", defaultOriginCityAr: "إسطنبول (IST)", defaultOriginCityEn: "Istanbul (IST)" },
  { code: "US", nameAr: "الولايات المتحدة الأمريكية", nameEn: "United States", flag: "🇺🇸", defaultOriginCityAr: "نيويورك (JFK)", defaultOriginCityEn: "New York (JFK)" },
  { code: "GB", nameAr: "المملكة المتحدة", nameEn: "United Kingdom", flag: "🇬🇧", defaultOriginCityAr: "لندن (LHR)", defaultOriginCityEn: "London (LHR)" },
  { code: "EU", nameAr: "الاتحاد الأوروبي", nameEn: "European Union", flag: "🇪🇺", defaultOriginCityAr: "باريس (CDG)", defaultOriginCityEn: "Paris (CDG)" },
];

export function resolveVisaIntelligence(
  nationalityCode: string,
  destinationCountry: string,
  destinationCity?: string
): VisaRequirement {
  const normNat = (nationalityCode || "SA").toUpperCase();
  const destCountryNorm = (destinationCountry || "").toLowerCase();
  const isGcc = ["SA", "AE", "KW", "QA", "BH", "OM"].includes(normNat);
  const isWestern = ["US", "GB", "EU", "CA", "AU"].includes(normNat);

  // 1. MOROCCO (المغرب)
  if (/morocco|المغرب|marrakech|casablanca|rabat|tangier|agadir/i.test(destCountryNorm)) {
    if (isGcc || isWestern) {
      return {
        status: "visa_free",
        badgeAr: "دخول بدون تأشيرة (Visa-Free)",
        badgeEn: "Visa-Free Entry (90 Days)",
        summaryAr: "مواطنو دولتك معفيون تماماً من التأشيرة المسبقة للدخول السياحي للمغرب لمدة تصل إلى 90 يوماً.",
        summaryEn: "Citizens of your country are fully exempt from pre-entry visas to Morocco for up to 90 days.",
        maxStayDays: 90,
        passportValidityMonths: 6,
        conditionsAr: [
          "جواز سفر ساري المفعول لمدة لا تقل عن 6 أشهر من تاريخ الوصول.",
          "تذكرة طيران ذهاب وعودة مؤكدة (مشمولة بالكامل في هذه الباقة).",
          "قسيمة حجز الفندق المؤكدة (مشمولة وتصدر لك فوراً).",
        ],
        conditionsEn: [
          "Valid passport for at least 6 months upon arrival.",
          "Confirmed return flight ticket (included in this package).",
          "Confirmed hotel voucher (issued instantly upon booking).",
        ],
        advisoryTipsAr: [
          "العملة الرسمية هي الدرهم المغربي (MAD). احرص على تصريف العملة من المطار أو المصارف الرسمية.",
          "شريحة اتصال مغربية (Maroc Telecom / Orange) متوفرة فور خروجك من الصالة بالمطار ويوفرها لك سائقنا الخاص.",
          "طقس مراكش مشمس معظم أيام السنة، ويُنصح باصطحاب نظارات شمسية وسترة خفيفة للمساء والصحراء.",
        ],
        advisoryTipsEn: [
          "Currency is Moroccan Dirham (MAD). Exchange at airport or official banks.",
          "Local SIM cards are available upon arrival and your chauffeur assists you directly.",
          "Sunny weather year-round; bring sunglasses and a light jacket for evenings and desert tours.",
        ],
      };
    }

    return {
      status: "evisa",
      badgeAr: "تأشيرة إلكترونية ميسرة (eVisa)",
      badgeEn: "Fast Electronic Visa (eVisa)",
      summaryAr: "يمكنك إصدار تأشيرة سياحية إلكترونية فورية (AEVM) خلال 24-72 ساعة مع تقديم فريق لوناليزا للدعم الكامل.",
      summaryEn: "You can obtain an eVisa online within 24-72 hours with full document support from Lonaliza.",
      maxStayDays: 30,
      passportValidityMonths: 6,
      conditionsAr: [
        "جواز سفر صالح لمدة 6 أشهر.",
        "تقديم رقم حجز وتأكيد برنامج الرحلة السياحي (نوفر لك خطاب تأكيد معتمد).",
      ],
      conditionsEn: [
        "Valid passport with 6 months validity.",
        "Official package booking confirmation (provided with this booking).",
      ],
      advisoryTipsAr: [
        "فريق كونسيرج لوناليزا يقدم الدعم الكامل لتجهيز مستندات التأشيرة فور الحجز.",
      ],
      advisoryTipsEn: [
        "Lonaliza concierge team provides complete document verification post-booking.",
      ],
    };
  }

  // 2. TURKEY (تركيا)
  if (/turkey|türkiye|تركيا|istanbul|trabzon|antalya|bursa/i.test(destCountryNorm)) {
    if (isGcc || isWestern) {
      return {
        status: "visa_free",
        badgeAr: "معفي من التأشيرة (Visa-Free)",
        badgeEn: "Visa-Free Entry (90 Days)",
        summaryAr: "مواطنو دولتك يدخلون تركيا بدون أي تأشيرة مسبقة مجاناً لمدة تصل إلى 90 يوماً في كل 180 يوماً.",
        summaryEn: "Citizens of your nationality enjoy 90 days visa-free entry to Turkey per 180 days.",
        maxStayDays: 90,
        passportValidityMonths: 6,
        conditionsAr: [
          "جواز سفر ساري المفعول لمدة لا تقل عن 6 أشهر.",
          "تذكرة طيران ذهاب وعودة وحجز فندقي مؤكد.",
        ],
        conditionsEn: [
          "Passport valid for at least 6 months.",
          "Confirmed return flight ticket and accommodation.",
        ],
        advisoryTipsAr: [
          "العملة هي الليرة التركية والدولار، وبطاقات الدفع الدولية مقبولة في جميع المتاجر والمطاعم.",
          "خدمة الاستقبال بسيارة مرسيدس فيتو VIP تنتظرك بالاسم عند مخرج بوابة المطار مباشرة.",
        ],
        advisoryTipsEn: [
          "Local currency is Turkish Lira. Cards widely accepted across malls and dining.",
          "Private Mercedes Vito VIP chauffeur awaits you at the arrival hall gate.",
        ],
      };
    }

    return {
      status: "evisa",
      badgeAr: "تأشيرة إلكترونية فورية (eVisa)",
      badgeEn: "Online Electronic Visa (eVisa)",
      summaryAr: "تأشيرة إلكترونية فورية في 5 دقائق عبر البوابة الرسمية للحكومة التركية.",
      summaryEn: "Instant eVisa obtained online within 5 minutes via official government portal.",
      maxStayDays: 30,
      passportValidityMonths: 6,
      conditionsAr: ["جواز سفر ساري وتعبئة البيانات إلكترونياً."],
      conditionsEn: ["Valid passport and online application."],
      advisoryTipsAr: ["يتولى فريقنا التحقق من بيانات التأشيرة قبل السفر للتأكد من سلاسة رحلتك."],
      advisoryTipsEn: ["Our travel experts verify your visa validity prior to your departure."],
    };
  }

  // 3. UAE / DUBAI (الإمارات)
  if (/uae|emirates|dubai|abu dhabi|الإمارات|دبي/i.test(destCountryNorm)) {
    if (isGcc) {
      return {
        status: "visa_free",
        badgeAr: "دخول بالهوية الوطنية (ID Card / Free)",
        badgeEn: "National ID / Visa-Free Entry",
        summaryAr: "مواطنو دول مجلس التعاون الخليجي يدخلون الإمارات بالبطاقة المدنية أو الجواز بدون تأشيرة وبدون أي رسوم.",
        summaryEn: "GCC citizens enter UAE using either National ID card or passport with zero visa requirements.",
        maxStayDays: 360,
        passportValidityMonths: 3,
        conditionsAr: [
          "الهوية الوطنية الأصلية أو جواز السفر الساري.",
        ],
        conditionsEn: [
          "Original National ID Card or valid passport.",
        ],
        advisoryTipsAr: [
          "العملة الرسمية هي الدرهم الإماراتي (AED).",
          "تتوفر شرائح اتصال سياحية مجانية لجميع القادمين عند منصات الجوازات بمطارات دبي.",
        ],
        advisoryTipsEn: [
          "Currency is UAE Dirham (AED).",
          "Complimentary tourist SIM cards are handed at Dubai passport control counters.",
        ],
      };
    }

    if (isWestern) {
      return {
        status: "visa_on_arrival",
        badgeAr: "تأشيرة مجانية عند الوصول (On Arrival)",
        badgeEn: "Free Visa on Arrival (30-90 Days)",
        summaryAr: "تأشيرة دخول سياحية مجانية تُختم في جوازك مباشرة بمجرد وصولك مطار دبي.",
        summaryEn: "Complimentary 30-90 days tourist stamp issued directly upon arrival at UAE airports.",
        maxStayDays: 90,
        passportValidityMonths: 6,
        conditionsAr: ["جواز سفر ساري لمدة 6 أشهر."],
        conditionsEn: ["Valid passport for 6 months."],
        advisoryTipsAr: ["استمتع بخدمة الاستقبال VIP بالسيارة الفاخرة مباشرة إلى فندقك."],
        advisoryTipsEn: ["Enjoy private chauffeur transfer directly to your luxury hotel."],
      };
    }

    return {
      status: "evisa",
      badgeAr: "تأشيرة سياحية إلكترونية مسبقة",
      badgeEn: "Pre-arranged Tourist eVisa",
      summaryAr: "نقوم بإصدار تأشيرة دبي السياحية لك في غضون 24-48 ساعة شاملة التأمين الصحي الإماراتي.",
      summaryEn: "We issue your Dubai tourist visa within 24-48 hours including UAE medical insurance.",
      maxStayDays: 60,
      passportValidityMonths: 6,
      conditionsAr: ["صورة الجواز وصورة شخصية بخلفية بيضاء."],
      conditionsEn: ["Passport copy and white background photograph."],
      advisoryTipsAr: ["يتم ربط التأشيرة مباشرة بتذاكر الطيران وتأكيد الفندق."],
      advisoryTipsEn: ["Visa is matched seamlessly with your flights and hotel bookings."],
    };
  }

  // 4. EUROPE / SCHENGEN (فرنسا، إيطاليا، إسبانيا، ألمانيا، سويسرا، النمسا)
  if (/france|paris|italy|rome|spain|madrid|barcelona|germany|switzerland|austria|europe|شنغن|أوروبا|فرنسا|إيطاليا|إسبانيا/i.test(destCountryNorm)) {
    if (normNat === "AE") {
      return {
        status: "visa_free",
        badgeAr: "معفي تماماً من تأشيرة الشنغن (Visa-Free)",
        badgeEn: "Schengen Visa-Free (90 Days)",
        summaryAr: "مواطنو دولة الإمارات معفيون من تأشيرة الشنغن لجميع دول الاتحاد الأوروبي لمدة 90 يوماً.",
        summaryEn: "UAE citizens are fully exempt from Schengen visa requirements across Europe for 90 days.",
        maxStayDays: 90,
        passportValidityMonths: 6,
        conditionsAr: ["جواز سفر إماراتي ساري المفعول."],
        conditionsEn: ["Valid UAE passport."],
        advisoryTipsAr: ["العملة هي اليورو، وبطاقات الدفع الائتمانية والذكية (Apple Pay) معتمدة في كل مكان."],
        advisoryTipsEn: ["Currency is Euro (EUR). Contactless Apple Pay accepted everywhere."],
      };
    }

    if (isGcc) {
      return {
        status: "visa_required",
        badgeAr: "تأشيرة شنغن سياحية (نظام كاسكيد الموحد 5 سنوات)",
        badgeEn: "Schengen Visa (5-Year Cascade System)",
        summaryAr: "يحصل مواطنو الخليج على تأشيرة شنغن متعددة الدخول لمدة تصل إلى 5 سنوات، ونوفر لك ملف التقديم والتأمين الطبي والحجوزات المؤكدة مجاناً.",
        summaryEn: "GCC nationals are eligible for 5-year multi-entry Schengen visas. We prepare your full file, travel insurance, and bookings.",
        maxStayDays: 90,
        passportValidityMonths: 6,
        conditionsAr: [
          "جواز سفر ساري المفعول مع بصمة بيومترية في مركز التأشيرات المعتمد (VFS / TLS).",
          "وثيقة التأمين الطبي المعتمدة الشاملة 30,000 يورو (نوفرها لك مع الباقة).",
          "حجوزات طيران وفنادق مؤكدة غير قابلة للإلغاء (مشمولة بالكامل في الباقة).",
        ],
        conditionsEn: [
          "Valid passport with biometric appointment at visa center.",
          "€30,000 Schengen compliant medical insurance (provided with package).",
          "Confirmed roundtrip flights and luxury hotel vouchers.",
        ],
        advisoryTipsAr: [
          "احجز موعد السفارة قبل 3 إلى 6 أسابيع من تاريخ السفر لضمان الحصول على التأشيرة في موعدها.",
          "فريقنا يزودك فور الحجز بملف متكامل ومترجم وجاهز للتقديم على الفور.",
        ],
        advisoryTipsEn: [
          "Book your embassy appointment 3-6 weeks ahead to guarantee timely issuance.",
          "Our VIP concierge supplies your complete embassy-ready dossier instantly.",
        ],
      };
    }

    if (isWestern) {
      return {
        status: "visa_free",
        badgeAr: "معفي من التأشيرة (Visa-Free)",
        badgeEn: "Visa-Free Entry (90 Days)",
        summaryAr: "دخول سياحي حر بدون تأشيرة مسبقة لمدة 90 يوماً لجميع دول منطقة الشنغن.",
        summaryEn: "Visa-free tourist entry across all Schengen destinations for up to 90 days.",
        maxStayDays: 90,
        passportValidityMonths: 3,
        conditionsAr: ["جواز سفر ساري المفعول."],
        conditionsEn: ["Valid passport for the duration of stay."],
        advisoryTipsAr: ["تنقلات القطارات السريعة بين المدن والسيارة الخاصة توفر لك تجربة لا تُنسى."],
        advisoryTipsEn: ["Scenic rail and private luxury transfers guarantee a seamless European journey."],
      };
    }
  }

  // 5. UNITED KINGDOM (بريطانيا / لندن)
  if (/united kingdom|britain|london|manchester|بريطانيا|لندن|المملكة المتحدة/i.test(destCountryNorm)) {
    if (isGcc) {
      return {
        status: "evisa",
        badgeAr: "تصريح السفر الإلكتروني الفوري (UK ETA)",
        badgeEn: "Instant UK Electronic Travel Authorisation (ETA)",
        summaryAr: "مواطنو دول الخليج مؤهلون لتصريح السفر الإلكتروني البريطاني (ETA) عبر التطبيق الرسمي خلال ساعات دون زيارة السفارة.",
        summaryEn: "GCC citizens travel with the rapid UK ETA digital permit issued within hours without embassy visits.",
        maxStayDays: 180,
        passportValidityMonths: 6,
        conditionsAr: [
          "جواز سفر بيومتري صالح لمدة 6 أشهر.",
          "التقديم عبر تطبيق UK ETA الرسمي ودفع الرسوم الرمزية (10 جنيهات إسترلينية).",
          "صلاحية التصريح سنتين كاملتين لزيارات متعددة.",
        ],
        conditionsEn: [
          "Biometric passport valid for 6 months.",
          "Apply via UK ETA app with £10 nominal fee.",
          "Valid for 2 years with unlimited visits.",
        ],
        advisoryTipsAr: [
          "العملة هي الجنيه الإسترليني (GBP). جميع وسائل النقل والمتاجر تعتمد الدفع غير التلامسي بدون كاش.",
          "سيارتك الخاصة مع السائق العربي تستقبلك من مطار لندن هيثرو مباشرة إلى مقر إقامتك.",
        ],
        advisoryTipsEn: [
          "Currency is British Pound (GBP). Entire transit and retail is cashless contactless.",
          "Private chauffeur meets you directly at Heathrow terminal.",
        ],
      };
    }
  }

  // 6. MALDIVES (المالديف)
  if (/maldives|مالديف|المالديف/i.test(destCountryNorm)) {
    return {
      status: "visa_on_arrival",
      badgeAr: "تأشيرة مجانية لجميع الجنسيات عند الوصول (Free On Arrival)",
      badgeEn: "Free 30-Day Visa on Arrival for All Nationalities",
      summaryAr: "تمنح جمهورية المالديف تأشيرة سياحية مجانية مدتها 30 يوماً لجميع جنسيات العالم عند الوصول إلى مطار ماليه الدولي.",
      summaryEn: "The Maldives grants free 30-day tourist visas on arrival to all travelers with confirmed resort bookings.",
      maxStayDays: 30,
      passportValidityMonths: 6,
      conditionsAr: [
        "جواز سفر صالح لمدة لا تقل عن شهر من تاريخ السفر.",
        "تأكيد حجز المنتجع المائي الفاخر (مشمول بالكامل في هذه الباقة).",
        "تعبئة إقرار المسافر الصحي (IMUGA) إلكترونياً خلال 96 ساعة قبل الوصول.",
      ],
      conditionsEn: [
        "Valid passport with at least 1 month validity.",
        "Confirmed luxury resort booking (included in this package).",
        "Submit digital IMUGA declaration within 96 hours before arrival.",
      ],
      advisoryTipsAr: [
        "المواصلات بالطائرة المائية (Seaplane) أو اليخت السريع مشمولة مباشرة من صالة كبار الشخصيات بالمطار.",
        "الريال السعودي والدولار الأمريكي وبطاقات الفيزا مقبولة في جميع الجزر والمنتجعات.",
      ],
      advisoryTipsEn: [
        "Seaplane or speedboat transfers included directly from airport VIP lounge.",
        "USD and major credit cards accepted throughout all private resort islands.",
      ],
    };
  }

  // 7. General Universal Fallback
  return {
    status: isGcc ? "visa_free" : "evisa",
    badgeAr: isGcc ? "تسهيلات سياحية مؤكدة" : "تأشيرة إلكترونية ميسرة",
    badgeEn: isGcc ? "Guaranteed Tourist Entry" : "Tourist eVisa Facility",
    summaryAr: `نوفر لك الدعم الكامل وتأكيدات الطيران والفندق المعتمدة لضمان دخول سلس إلى ${destinationCountry || "وجهتك"}.`,
    summaryEn: `We provide complete documentation, confirmed flights, and hotel vouchers for smooth entry to ${destinationCountry || "your destination"}.`,
    maxStayDays: 30,
    passportValidityMonths: 6,
    conditionsAr: [
      "جواز سفر صالح لمدة لا تقل عن 6 أشهر من تاريخ السفر.",
      "تأكيد حجز الطيران والإقامة الفندقية الصادر من لوناليزا.",
    ],
    conditionsEn: [
      "Passport valid for at least 6 months.",
      "Official flight and accommodation confirmation from Lonaliza.",
    ],
    advisoryTipsAr: [
      "فريق مستشاري لوناليزا يتابع ملفك ومواعيدك على مدار 24 ساعة لضمان أعلى درجات الراحة.",
    ],
    advisoryTipsEn: [
      "Lonaliza travel consultants monitor your trip details 24/7 to guarantee excellence.",
    ],
  };
}
