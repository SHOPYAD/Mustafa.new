import type { CabinClass } from "@/components/flights/types";
import { eticketIssuanceNote } from "@/lib/booking-notices";
import type { Locale } from "@/lib/i18n/types";

export type FlightCopy = {
  searchTitle: string;
  searchSubtitle: string;
  oneWay: string;
  roundTrip: string;
  multiCity: string;
  from: string;
  to: string;
  departureAirport: string;
  arrivalAirport: string;
  departure: string;
  return: string;
  passengers: string;
  cabin: string;
  searchCta: string;
  searchShort: string;
  nonstopOnly: string;
  swap: string;
  adults: string;
  children: string;
  infants: string;
  addLeg: string;
  removeLeg: string;
  done: string;
  nearbyHint: string;
  airportPlaceholder: string;
  noAirports: string;
  cheapestDay: string;
  selectDates: string;
  resultsTitle: string;
  flightsFound: (n: number) => string;
  flightsFoundFiltered: (visible: number, total: number) => string;
  searching: string;
  waitingMessages: string[];
  updating: string;
  emptyTitle: string;
  emptyHint: string;
  errorTitle: string;
  errorHint: string;
  retry: string;
  filters: string;
  stops: string;
  nonstop: string;
  oneStop: string;
  twoPlus: string;
  airlines: string;
  departWindow: string;
  arriveWindow: string;
  duration: string;
  cabinFilter: string;
  anyCabin: string;
  sortBest: string;
  sortPrice: string;
  sortFastest: string;
  sortDepart: string;
  cheapest: string;
  fastest: string;
  bestValue: string;
  selectFlight: string;
  hideDetails: string;
  showDetails: string;
  perPerson: string;
  baseFare: string;
  taxesFees: string;
  total: string;
  layover: string;
  overnight: string;
  selfTransfer: string;
  timeline: string;
  baggage: string;
  cabinBag: string;
  checkedBag: string;
  policies: string;
  refundableFee: string;
  nonRefundable: string;
  freeChange: string;
  fareTiers: string;
  continue: string;
  exploreTitle: string;
  exploreEmpty: string;
  viewFlights: string;
  directFrom: string;
  startingFrom: string;
  anytime: string;
  whyTitle: string;
  whyPrice: string;
  whyPriceBody: string;
  whySupport: string;
  whySupportBody: string;
  whyEasy: string;
  whyEasyBody: string;
  stepSelect: string;
  stepPassengers: string;
  stepReview: string;
  stepPay: string;
  passengerN: (n: number, kind: string) => string;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  passport: string;
  issuingCountry: string;
  expiry: string;
  frequentFlyer: string;
  meal: string;
  contact: string;
  email: string;
  phone: string;
  identity: string;
  identityHelp: string;
  extraBag: string;
  insurance: string;
  priority: string;
  reviewTitle: string;
  payTitle: string;
  payCard: string;
  payWhatsApp: string;
  cardHint: string;
  waHint: string;
  cardDisabled: string;
  noPan: string;
  payCtaCard: string;
  payCtaWa: string;
  loginRequired: string;
  login: string;
  fillFields: string;
  confirmTitle: string;
  bookingRef: string;
  addCalendar: string;
  backFlights: string;
  fareChanged: string;
  acceptFare: string;
  clearFilters: string;
  modifySearch: string;
  directOnly: string;
  baggageFilter: string;
  baggageAny: string;
  baggageIncluded: string;
  baggage20: string;
  baggage23: string;
  selectAirport: string;
  allAirports: string;
  pickFromList: string;
  adultKind: string;
  childKind: string;
  infantKind: string;
  male: string;
  female: string;
  unspecified: string;
  priceRange: string;
  originAirports: string;
  destAirports: string;
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
  detailsTitle: string;
  closeDetails: string;
  cabinBagIncluded: string;
  noCheckedBag: string;
  totalDuration: string;
  loadingDetails: string;
  aircraftLabel: string;
  operatingCarrier: string;
  fareFrom: string;
  seeAllDates: string;
  priceChart: string;
  priceTrends: string;
  priceTrendsHint: string;
  recommended: string;
  flexibility: string;
  otherBenefits: string;
  transferIn: string;
  noRecheckBags: string;
  downloadInvoice: string;
  itineraryTitle: string;
  fareClass: string;
  selectFare: string;
  fromPrice: string;
  pricesReference: string;
  outboundTag: string;
  wifi: string;
  power: string;
  mealOnBoard: string;
  entertainment: string;
  invoiceNote: string;
  changeFee: string;
  cancelFee: string;
  freeCancellation: string;
  refundableFree: string;
  terminalLabel: string;
  gateLabel: string;
  fareRules: string;
  fareBrand: string;
  extrasTitle: string;
  extrasHint: string;
  addExtra: string;
  selectedExtra: string;
  discount: string;
  flightNumber: string;
  inboundTag: string;
  personalDetails: string;
  passportSection: string;
  optionalSection: string;
  contactHint: string;
  reviewPassengers: string;
  eticketIssuanceNote: string;
};

function cabinLabel(locale: Locale, cabin: CabinClass): string {
  switch (cabin) {
    case "economy":
      return locale === "ar" ? "السياحية" : locale === "tr" ? "Ekonomi" : "Economy";
    case "premium_economy":
      return locale === "ar" ? "سياحية مميزة" : locale === "tr" ? "Premium ekonomi" : "Premium economy";
    case "business":
      return locale === "ar" ? "رجال الأعمال" : locale === "tr" ? "Business" : "Business";
    case "first":
      return locale === "ar" ? "الأولى" : locale === "tr" ? "First" : "First";
    default: {
      const _exhaustive: never = cabin;
      return _exhaustive;
    }
  }
}

export function cabinClassLabel(locale: Locale, cabin: CabinClass): string {
  return cabinLabel(locale, cabin);
}

export function flightCopy(locale: Locale): FlightCopy {
  switch (locale) {
    case "ar":
      return {
        searchTitle: "ابحث عن رحلتك",
        searchSubtitle: "قارن الأوقات والأسعار واحجز بخطوات واضحة.",
        oneWay: "ذهاب فقط",
        roundTrip: "ذهاب وعودة",
        multiCity: "مدن متعددة",
        from: "من",
        to: "إلى",
        departureAirport: "مطار المغادرة",
        arrivalAirport: "مطار الوصول",
        departure: "المغادرة",
        return: "العودة",
        passengers: "المسافرون",
        cabin: "المقصورة",
        searchCta: "بحث الرحلات",
        searchShort: "بحث",
        nonstopOnly: "بدون توقف",
        swap: "تبديل الاتجاه",
        adults: "بالغون",
        children: "أطفال",
        infants: "رضّع",
        addLeg: "إضافة قطاع",
        removeLeg: "حذف القطاع",
        done: "تم",
        nearbyHint: "أقرب مطار حسب موقعك",
        airportPlaceholder: "مدينة أو رمز المطار",
        noAirports: "لا توجد مطارات مطابقة",
        cheapestDay: "أقل سعر",
        selectDates: "اختيار التواريخ",
        resultsTitle: "نتائج الرحلات",
        flightsFound: (n) => (n === 1 ? "رحلة واحدة" : `${n} رحلة`),
        flightsFoundFiltered: (visible, total) =>
          visible === total
            ? visible === 1
              ? "رحلة واحدة"
              : `${visible} رحلة`
            : `${visible} من ${total} رحلة`,
        searching: "جاري البحث عن الرحلات…",
        waitingMessages: [
          "جاري البحث لكم على أفضل العروض",
          "الحصول على أفضل الصفقات",
          "نقارن الأسعار لكم الآن",
          "لحظات ونظهر أفضل الخيارات",
          "نبحث في مئات الرحلات لأجلكم",
          "نعثر على الأنسب لجدولكم",
        ],
        updating: "جاري تحديث النتائج…",
        emptyTitle: "لا توجد رحلات لهذه التواريخ",
        emptyHint: "جرّب مطارات قريبة أو تواريخ مرنة.",
        errorTitle: "تعذّر إكمال البحث الآن",
        errorHint: "أعيدوا المحاولة بعد لحظات.",
        retry: "إعادة المحاولة",
        filters: "تصفية",
        stops: "التوقفات",
        nonstop: "مباشر",
        oneStop: "توقف واحد",
        twoPlus: "توقفان أو أكثر",
        airlines: "شركات الطيران",
        departWindow: "وقت المغادرة",
        arriveWindow: "وقت الوصول",
        duration: "أقصى مدة",
        cabinFilter: "درجة السفر",
        anyCabin: "الكل",
        sortBest: "الأفضل",
        sortPrice: "السعر",
        sortFastest: "الأسرع",
        sortDepart: "وقت المغادرة",
        cheapest: "الأرخص",
        fastest: "الأسرع",
        bestValue: "أفضل قيمة",
        selectFlight: "اختيار الرحلة",
        hideDetails: "إخفاء التفاصيل",
        showDetails: "تفاصيل الرحلة",
        perPerson: "للشخص",
        baseFare: "الأجرة الأساسية",
        taxesFees: "الضرائب والرسوم",
        total: "الإجمالي",
        layover: "انتظار",
        overnight: "+١ يوم",
        selfTransfer: "تحويل ذاتي — راجعوا الأمتعة والبوابات",
        timeline: "مسار الرحلة",
        baggage: "الأمتعة",
        cabinBag: "أمتعة المقصورة",
        checkedBag: "أمتعة الشحن",
        policies: "سياسات التذكرة",
        refundableFee: "قابل للاسترداد برسوم",
        nonRefundable: "غير قابل للاسترداد",
        freeChange: "تغيير مجاني حتى ٢٤ ساعة قبل الإقلاع",
        fareTiers: "الباقات المتوفرة",
        continue: "متابعة الحجز",
        exploreTitle: "استكشف الوجهات",
        exploreEmpty: "اختاروا مطار المغادرة لعرض الوجهات.",
        viewFlights: "عرض الرحلات",
        directFrom: "رحلات مباشرة من",
        startingFrom: "يبدأ من",
        anytime: "تواريخ مرنة",
        whyTitle: "لماذا تحجزون معنا؟",
        whyPrice: "أسعار واضحة",
        whyPriceBody: "السعر المعروض بعد الرسوم المعتمدة في النظام.",
        whySupport: "دعم متواصل",
        whySupportBody: "فريق الريان معكم قبل السفر وبعده.",
        whyEasy: "حجز بخطوات قصيرة",
        whyEasyBody: "اختيار الرحلة، بيانات المسافرين، ثم الدفع.",
        stepSelect: "الرحلة",
        stepPassengers: "المسافرون",
        stepReview: "المراجعة",
        stepPay: "الدفع",
        passengerN: (n, kind) => `المسافر ${n} — ${kind}`,
        title: "اللقب",
        firstName: "الاسم الأول كما في الجواز",
        lastName: "اسم العائلة كما في الجواز",
        gender: "الجنس",
        dob: "تاريخ الميلاد",
        nationality: "الجنسية",
        passport: "رقم الجواز",
        issuingCountry: "دولة الإصدار",
        expiry: "انتهاء الجواز",
        frequentFlyer: "برنامج المسافر الدائم",
        meal: "وجبة خاصة",
        contact: "بيانات التواصل",
        email: "البريد الإلكتروني",
        phone: "الهاتف",
        identity: "رقم الهوية / الجواز",
        identityHelp: "للمقيمين في تركيا: رقم الهوية التركية (١١ رقماً).",
        extraBag: "حقيبة شحن إضافية",
        insurance: "تأمين السفر",
        priority: "صعود أولوية",
        reviewTitle: "راجعوا الرحلة والمسافرين",
        payTitle: "طريقة الدفع",
        payCard: "بطاقة ائتمان / خصم",
        payWhatsApp: "رابط بنكي رسمي عبر واتساب",
        cardHint: "ادفعوا بالبطاقة عبر نافذة iyzico الرسمية",
        waHint: "نرسل لكم رابطاً بنكياً رسمياً عبر واتساب",
        cardDisabled: "الدفع بالبطاقة غير مفعّل حالياً.",
        noPan: "إدخال البطاقة والتحقق يتم داخل صفحة iyzico الآمنة. لا نجمع رقم البطاقة ولا رمز CVV على موقعنا.",
        payCtaCard: "الدفع بالبطاقة",
        payCtaWa: "إرسال طلب الرابط البنكي عبر واتساب",
        loginRequired: "سجّلوا الدخول لإتمام الحجز",
        login: "تسجيل الدخول",
        fillFields: "أكملوا بيانات كل مسافر وبيانات التواصل للمتابعة.",
        confirmTitle: "تم استلام الحجز",
        bookingRef: "رقم الحجز",
        addCalendar: "إضافة إلى التقويم",
        backFlights: "العودة إلى بحث الطيران",
        fareChanged: "تغيّر السعر قبل الدفع. راجعوا المبلغ الجديد قبل المتابعة.",
        acceptFare: "المتابعة بالمبلغ الجديد",
        clearFilters: "مسح التصفية",
        modifySearch: "تعديل البحث",
        directOnly: "رحلات مباشرة فقط",
        baggageFilter: "الأمتعة",
        baggageAny: "أي أمتعة",
        baggageIncluded: "أمتعة مضمّنة",
        baggage20: "٢٠ كغ على الأقل",
        baggage23: "٢٣ كغ على الأقل",
        selectAirport: "اختاروا مطاراً من القائمة",
        allAirports: "كل المطارات",
        pickFromList: "اكتبوا ثم اختاروا من النتائج",
        adultKind: "بالغ",
        childKind: "طفل",
        infantKind: "رضيع",
        male: "ذكر",
        female: "أنثى",
        unspecified: "غير محدد",
        priceRange: "نطاق السعر",
        originAirports: "مطارات المغادرة",
        destAirports: "مطارات الوصول",
        morning: "صباح",
        afternoon: "ظهر",
        evening: "مساء",
        night: "ليل",
        detailsTitle: "تفاصيل الرحلة",
        closeDetails: "إغلاق",
        cabinBagIncluded: "حقيبة يد",
        noCheckedBag: "بدون أمتعة مسجلة",
        totalDuration: "إجمالي",
        loadingDetails: "جاري تحميل التفاصيل…",
        aircraftLabel: "الطائرة",
        operatingCarrier: "تشغيل",
        fareFrom: "ابتداءً من",
        seeAllDates: "رؤية الكل",
        priceChart: "مخطط الأسعار",
        priceTrends: "اتجاهات الأسعار",
        priceTrendsHint: "أدنى سعر لكل يوم — الأسعار إرشادية وقد تتغيّر.",
        recommended: "موصى بها",
        flexibility: "المرونة",
        otherBenefits: "المزايا الأخرى",
        transferIn: "تحويل في",
        noRecheckBags: "لا حاجة لاستلام الأمتعة وإعادة تسجيلها",
        downloadInvoice: "تنزيل الفاتورة PDF",
        itineraryTitle: "خط السير",
        fareClass: "درجة السعر",
        selectFare: "تحديد السعر",
        fromPrice: "من",
        pricesReference: "الأسعار للمرجع وقد تتغيّر عند البحث.",
        outboundTag: "الذهاب",
        wifi: "واي فاي",
        power: "مقبس كهرباء",
        mealOnBoard: "وجبة",
        entertainment: "ترفيه",
        invoiceNote: "هذه فاتورة / إيصال رسمي من الريان للسياحة. تفاصيل الرحلة حسب الحجز المدفوع.",
        changeFee: "رسوم التغيير",
        cancelFee: "رسوم الإلغاء",
        freeCancellation: "رحلات قابلة للإلغاء المجاني",
        refundableFree: "إلغاء مجاني",
        terminalLabel: "صالة",
        gateLabel: "بوابة",
        fareRules: "شروط الأجرة",
        fareBrand: "الباقة",
        extrasTitle: "خدمات الوكالة الاختيارية",
        extrasHint: "لن تُضاف إلى الإجمالي إلا بعد اختيارها.",
        addExtra: "إضافة",
        selectedExtra: "مختارة",
        discount: "الخصم / القسيمة",
        flightNumber: "رقم الرحلة",
        inboundTag: "العودة",
        personalDetails: "البيانات الشخصية",
        passportSection: "الجواز",
        optionalSection: "اختياري",
        contactHint: "نرسل تأكيد الحجز والتذكرة إلى هذا البريد والهاتف.",
        reviewPassengers: "المسافرون",
        eticketIssuanceNote: eticketIssuanceNote("ar"),
      };
    case "en":
      return {
        searchTitle: "Search flights",
        searchSubtitle: "Compare times and prices, then book in clear steps.",
        oneWay: "One way",
        roundTrip: "Round trip",
        multiCity: "Multi-city",
        from: "From",
        to: "To",
        departureAirport: "Departure airport",
        arrivalAirport: "Arrival airport",
        departure: "Departure",
        return: "Return",
        passengers: "Passengers",
        cabin: "Cabin",
        searchCta: "Search flights",
        searchShort: "Search",
        nonstopOnly: "Non-stop",
        swap: "Swap route",
        adults: "Adults",
        children: "Children",
        infants: "Infants",
        addLeg: "Add flight",
        removeLeg: "Remove flight",
        done: "Done",
        nearbyHint: "Nearest airport from your location",
        airportPlaceholder: "City or airport code",
        noAirports: "No matching airports",
        cheapestDay: "Lowest",
        selectDates: "Select dates",
        resultsTitle: "Flight results",
        flightsFound: (n) => (n === 1 ? "1 flight" : `${n} flights`),
        flightsFoundFiltered: (visible, total) =>
          visible === total
            ? visible === 1
              ? "1 flight"
              : `${visible} flights`
            : `${visible} of ${total} flights`,
        searching: "Searching flights…",
        waitingMessages: [
          "Finding the best offers for you",
          "Locking in the strongest deals",
          "Comparing prices right now",
          "A moment — the best options are coming",
          "Scanning hundreds of flights for you",
          "Matching the schedule that fits you",
        ],
        updating: "Updating results…",
        emptyTitle: "No flights for these dates",
        emptyHint: "Try nearby airports or more flexible dates.",
        errorTitle: "Search could not be completed",
        errorHint: "Please try again in a moment.",
        retry: "Try again",
        filters: "Filters",
        stops: "Stops",
        nonstop: "Non-stop",
        oneStop: "1 stop",
        twoPlus: "2+ stops",
        airlines: "Airlines",
        departWindow: "Departure time",
        arriveWindow: "Arrival time",
        duration: "Max duration",
        cabinFilter: "Cabin class",
        anyCabin: "Any",
        sortBest: "Best",
        sortPrice: "Price",
        sortFastest: "Fastest",
        sortDepart: "Departure",
        cheapest: "Cheapest",
        fastest: "Fastest",
        bestValue: "Best value",
        selectFlight: "Select flight",
        hideDetails: "Hide details",
        showDetails: "Flight details",
        perPerson: "per person",
        baseFare: "Base fare",
        taxesFees: "Taxes & fees",
        total: "Total",
        layover: "Layover",
        overnight: "+1 day",
        selfTransfer: "Self-transfer — check bags and gates",
        timeline: "Itinerary",
        baggage: "Baggage",
        cabinBag: "Cabin baggage",
        checkedBag: "Checked baggage",
        policies: "Ticket policies",
        refundableFee: "Refundable with fee",
        nonRefundable: "Non-refundable",
        freeChange: "Free date change up to 24h prior",
        fareTiers: "Available fares",
        continue: "Continue to book",
        exploreTitle: "Explore destinations",
        exploreEmpty: "Choose a departure airport to see destinations.",
        viewFlights: "View flights",
        directFrom: "Direct flights from",
        startingFrom: "Starting from",
        anytime: "Flexible dates",
        whyTitle: "Why book with us?",
        whyPrice: "Clear prices",
        whyPriceBody: "The displayed price already includes the system markup.",
        whySupport: "Ongoing support",
        whySupportBody: "Alrayyan is with you before and after travel.",
        whyEasy: "A short booking path",
        whyEasyBody: "Choose a flight, add passengers, then pay.",
        stepSelect: "Flight",
        stepPassengers: "Passengers",
        stepReview: "Review",
        stepPay: "Payment",
        passengerN: (n, kind) => `Passenger ${n} — ${kind}`,
        title: "Title",
        firstName: "First name as in passport",
        lastName: "Last name as in passport",
        gender: "Gender",
        dob: "Date of birth",
        nationality: "Nationality",
        passport: "Passport number",
        issuingCountry: "Issuing country",
        expiry: "Passport expiry",
        frequentFlyer: "Frequent flyer",
        meal: "Special meal",
        contact: "Contact details",
        email: "Email",
        phone: "Phone",
        identity: "ID / passport number",
        identityHelp: "For Turkey residents: 11-digit national ID.",
        extraBag: "Extra checked bag",
        insurance: "Travel insurance",
        priority: "Priority boarding",
        reviewTitle: "Review flight and passengers",
        payTitle: "Payment method",
        payCard: "Credit / debit card",
        payWhatsApp: "Official bank link via WhatsApp",
        cardHint: "Pay by card through the official iyzico window",
        waHint: "We send an official bank link on WhatsApp",
        cardDisabled: "Card payment is not enabled right now.",
        noPan: "Card details and verification happen on the secure iyzico page. We never collect PAN or CVV on this site.",
        payCtaCard: "Pay by card",
        payCtaWa: "Request the bank link on WhatsApp",
        loginRequired: "Sign in to complete the booking",
        login: "Sign in",
        fillFields: "Complete every passenger and your contact details to continue.",
        confirmTitle: "Booking received",
        bookingRef: "Booking reference",
        addCalendar: "Add to calendar",
        backFlights: "Back to flight search",
        fareChanged: "The fare changed before payment. Review the new amount before you continue.",
        acceptFare: "Continue with the new amount",
        clearFilters: "Clear filters",
        modifySearch: "Modify search",
        directOnly: "Direct flights only",
        baggageFilter: "Baggage",
        baggageAny: "Any baggage",
        baggageIncluded: "Baggage included",
        baggage20: "At least 20 kg",
        baggage23: "At least 23 kg",
        selectAirport: "Choose an airport from the list",
        allAirports: "All airports",
        pickFromList: "Type, then pick a result",
        adultKind: "Adult",
        childKind: "Child",
        infantKind: "Infant",
        male: "Male",
        female: "Female",
        unspecified: "Unspecified",
        priceRange: "Price range",
        originAirports: "Departure airports",
        destAirports: "Arrival airports",
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
        night: "Night",
        detailsTitle: "Flight details",
        closeDetails: "Close",
        cabinBagIncluded: "Cabin bag",
        noCheckedBag: "No checked bag",
        totalDuration: "total",
        loadingDetails: "Loading details…",
        aircraftLabel: "Aircraft",
        operatingCarrier: "Operated by",
        fareFrom: "From",
        seeAllDates: "See all",
        priceChart: "Price chart",
        priceTrends: "Price trends",
        priceTrendsHint: "Lowest fare per day — indicative and may change.",
        recommended: "Recommended",
        flexibility: "Flexibility",
        otherBenefits: "Other benefits",
        transferIn: "Transfer in",
        noRecheckBags: "No need to collect and re-check baggage",
        downloadInvoice: "Download PDF invoice",
        itineraryTitle: "Itinerary",
        fareClass: "Fare class",
        selectFare: "Select fare",
        fromPrice: "From",
        pricesReference: "Prices are for reference and may change when you search.",
        outboundTag: "Outbound",
        wifi: "Wi-Fi",
        power: "Power outlet",
        mealOnBoard: "Meal",
        entertainment: "Entertainment",
        invoiceNote: "Official Alrayyan Tourism invoice / receipt for this paid booking.",
        changeFee: "Change fee",
        cancelFee: "Cancellation fee",
        freeCancellation: "Free cancellation flights",
        refundableFree: "Free cancellation",
        terminalLabel: "Terminal",
        gateLabel: "Gate",
        fareRules: "Fare rules",
        fareBrand: "Fare",
        extrasTitle: "Optional agency services",
        extrasHint: "Not added to the total until you select them.",
        addExtra: "Add",
        selectedExtra: "Selected",
        discount: "Discount / voucher",
        flightNumber: "Flight no.",
        inboundTag: "Return",
        personalDetails: "Personal details",
        passportSection: "Passport",
        optionalSection: "Optional",
        contactHint: "We send the booking confirmation and ticket to this email and phone.",
        reviewPassengers: "Passengers",
        eticketIssuanceNote: eticketIssuanceNote("en"),
      };
    case "tr":
      return {
        searchTitle: "Uçuş ara",
        searchSubtitle: "Saatleri ve fiyatları karşılaştırın, ardından net adımlarla rezervasyon yapın.",
        oneWay: "Tek yön",
        roundTrip: "Gidiş-dönüş",
        multiCity: "Çoklu şehir",
        from: "Nereden",
        to: "Nereye",
        departureAirport: "Kalkış havalimanı",
        arrivalAirport: "Varış havalimanı",
        departure: "Gidiş",
        return: "Dönüş",
        passengers: "Yolcular",
        cabin: "Kabin",
        searchCta: "Uçuş ara",
        searchShort: "Ara",
        nonstopOnly: "Aktarmasız",
        swap: "Güzergahı değiştir",
        adults: "Yetişkin",
        children: "Çocuk",
        infants: "Bebek",
        addLeg: "Uçuş ekle",
        removeLeg: "Uçuşu sil",
        done: "Tamam",
        nearbyHint: "Konumunuza en yakın havalimanı",
        airportPlaceholder: "Şehir veya havalimanı kodu",
        noAirports: "Eşleşen havalimanı yok",
        cheapestDay: "En düşük",
        selectDates: "Tarih seçin",
        resultsTitle: "Uçuş sonuçları",
        flightsFound: (n) => (n === 1 ? "1 uçuş" : `${n} uçuş`),
        flightsFoundFiltered: (visible, total) =>
          visible === total
            ? visible === 1
              ? "1 uçuş"
              : `${visible} uçuş`
            : `${visible} / ${total} uçuş`,
        searching: "Uçuşlar aranıyor…",
        waitingMessages: [
          "Sizin için en iyi teklifleri arıyoruz",
          "En güçlü fırsatları buluyoruz",
          "Fiyatları şu anda karşılaştırıyoruz",
          "Birkaç saniye — en iyi seçenekler geliyor",
          "Yüzlerce uçuşu sizin için tarıyoruz",
          "Programınıza uyan seçenekleri ayıklıyoruz",
        ],
        updating: "Sonuçlar güncelleniyor…",
        emptyTitle: "Bu tarihlerde uçuş yok",
        emptyHint: "Yakın havalimanlarını veya esnek tarihleri deneyin.",
        errorTitle: "Arama tamamlanamadı",
        errorHint: "Lütfen biraz sonra yeniden deneyin.",
        retry: "Yeniden dene",
        filters: "Filtreler",
        stops: "Aktarma",
        nonstop: "Aktarmasız",
        oneStop: "1 aktarma",
        twoPlus: "2+ aktarma",
        airlines: "Havayolları",
        departWindow: "Kalkış saati",
        arriveWindow: "Varış saati",
        duration: "En uzun süre",
        cabinFilter: "Kabin sınıfı",
        anyCabin: "Tümü",
        sortBest: "En iyi",
        sortPrice: "Fiyat",
        sortFastest: "En hızlı",
        sortDepart: "Kalkış",
        cheapest: "En ucuz",
        fastest: "En hızlı",
        bestValue: "En iyi değer",
        selectFlight: "Uçuşu seç",
        hideDetails: "Detayları gizle",
        showDetails: "Uçuş detayları",
        perPerson: "kişi başı",
        baseFare: "Baz ücret",
        taxesFees: "Vergi ve harçlar",
        total: "Toplam",
        layover: "Aktarma",
        overnight: "+1 gün",
        selfTransfer: "Kendi aktarmanız — bagaj ve kapıları kontrol edin",
        timeline: "Güzergah",
        baggage: "Bagaj",
        cabinBag: "Kabin bagajı",
        checkedBag: "Kayıtlı bagaj",
        policies: "Bilet kuralları",
        refundableFee: "Ücretli iade",
        nonRefundable: "İade edilemez",
        freeChange: "Kalkıştan 24 saat önce ücretsiz tarih değişikliği",
        fareTiers: "Mevcut tarifeler",
        continue: "Rezervasyona devam",
        exploreTitle: "Destinasyonları keşfedin",
        exploreEmpty: "Destinasyonları görmek için kalkış havalimanı seçin.",
        viewFlights: "Uçuşları gör",
        directFrom: "Direkt uçuşlar",
        startingFrom: "Başlayan fiyat",
        anytime: "Esnek tarihler",
        whyTitle: "Neden bizimle rezervasyon?",
        whyPrice: "Net fiyatlar",
        whyPriceBody: "Görünen fiyat sistemdeki artıştan sonradır.",
        whySupport: "Kesintisiz destek",
        whySupportBody: "Alrayyan seyahatten önce ve sonra yanınızda.",
        whyEasy: "Kısa rezervasyon yolu",
        whyEasyBody: "Uçuş seçin, yolcuları ekleyin, sonra ödeyin.",
        stepSelect: "Uçuş",
        stepPassengers: "Yolcular",
        stepReview: "Özet",
        stepPay: "Ödeme",
        passengerN: (n, kind) => `Yolcu ${n} — ${kind}`,
        title: "Unvan",
        firstName: "Pasaporttaki ad",
        lastName: "Pasaporttaki soyad",
        gender: "Cinsiyet",
        dob: "Doğum tarihi",
        nationality: "Uyruk",
        passport: "Pasaport no",
        issuingCountry: "Veren ülke",
        expiry: "Pasaport bitiş",
        frequentFlyer: "Sık uçuş programı",
        meal: "Özel yemek",
        contact: "İletişim",
        email: "E-posta",
        phone: "Telefon",
        identity: "Kimlik / pasaport no",
        identityHelp: "Türkiye’de yaşayanlar için 11 haneli T.C. kimlik no.",
        extraBag: "Ek kayıtlı bagaj",
        insurance: "Seyahat sigortası",
        priority: "Öncelikli biniş",
        reviewTitle: "Uçuşu ve yolcuları gözden geçirin",
        payTitle: "Ödeme yöntemi",
        payCard: "Kredi / banka kartı",
        payWhatsApp: "WhatsApp ile resmi banka bağlantısı",
        cardHint: "Kartla resmi iyzico penceresinden ödeyin",
        waHint: "Resmi banka bağlantısını WhatsApp’tan göndeririz",
        cardDisabled: "Kart ödemesi şu anda kapalı.",
        noPan: "Kart bilgileri ve doğrulama güvenli iyzico sayfasındadır. Bu sitede PAN veya CVV toplamayız.",
        payCtaCard: "Kartla öde",
        payCtaWa: "WhatsApp banka bağlantısı iste",
        loginRequired: "Rezervasyonu tamamlamak için giriş yapın",
        login: "Giriş",
        fillFields: "Devam etmek için her yolcuyu ve iletişim bilgilerini doldurun.",
        confirmTitle: "Rezervasyon alındı",
        bookingRef: "Rezervasyon no",
        addCalendar: "Takvime ekle",
        backFlights: "Uçuş aramasına dön",
        fareChanged: "Ödemeden önce fiyat değişti. Devam etmeden yeni tutarı kontrol edin.",
        acceptFare: "Yeni tutarla devam",
        clearFilters: "Filtreleri temizle",
        modifySearch: "Aramayı düzenle",
        directOnly: "Sadece aktarmasız",
        baggageFilter: "Bagaj",
        baggageAny: "Bagaj fark etmez",
        baggageIncluded: "Bagaj dahil",
        baggage20: "En az 20 kg",
        baggage23: "En az 23 kg",
        selectAirport: "Listeden havalimanı seçin",
        allAirports: "Tüm havalimanları",
        pickFromList: "Yazın, sonra listedeki sonucu seçin",
        adultKind: "Yetişkin",
        childKind: "Çocuk",
        infantKind: "Bebek",
        male: "Erkek",
        female: "Kadın",
        unspecified: "Belirtilmedi",
        priceRange: "Fiyat aralığı",
        originAirports: "Kalkış havalimanları",
        destAirports: "Varış havalimanları",
        morning: "Sabah",
        afternoon: "Öğleden sonra",
        evening: "Akşam",
        night: "Gece",
        detailsTitle: "Uçuş detayı",
        closeDetails: "Kapat",
        cabinBagIncluded: "Kabin bagajı",
        noCheckedBag: "Kayıtlı bagaj yok",
        totalDuration: "toplam",
        loadingDetails: "Detaylar yükleniyor…",
        aircraftLabel: "Uçak",
        operatingCarrier: "İşleten",
        fareFrom: "Başlangıç",
        seeAllDates: "Tümünü gör",
        priceChart: "Fiyat grafiği",
        priceTrends: "Fiyat eğilimleri",
        priceTrendsHint: "Günlük en düşük fiyat — gösterge niteliğindedir ve değişebilir.",
        recommended: "Önerilen",
        flexibility: "Esneklik",
        otherBenefits: "Diğer avantajlar",
        transferIn: "Aktarma",
        noRecheckBags: "Bagajı alıp yeniden teslim etmeniz gerekmez",
        downloadInvoice: "PDF fatura indir",
        itineraryTitle: "Güzergah",
        fareClass: "Tarife sınıfı",
        selectFare: "Tarife seç",
        fromPrice: "Başlayan",
        pricesReference: "Fiyatlar referans içindir ve aramada değişebilir.",
        outboundTag: "Gidiş",
        wifi: "Wi-Fi",
        power: "Priz",
        mealOnBoard: "Yemek",
        entertainment: "Eğlence",
        invoiceNote: "Bu, Alrayyan Turizm’in resmi fatura / makbuzudur.",
        changeFee: "Değişiklik ücreti",
        cancelFee: "İptal ücreti",
        freeCancellation: "Ücretsiz iptal edilebilir uçuşlar",
        refundableFree: "Ücretsiz iptal",
        terminalLabel: "Terminal",
        gateLabel: "Kapı",
        fareRules: "Tarife kuralları",
        fareBrand: "Tarife",
        extrasTitle: "İsteğe bağlı acente hizmetleri",
        extrasHint: "Seçene kadar toplama eklenmez.",
        addExtra: "Ekle",
        selectedExtra: "Seçildi",
        discount: "İndirim / kupon",
        flightNumber: "Uçuş no",
        inboundTag: "Dönüş",
        personalDetails: "Kişisel bilgiler",
        passportSection: "Pasaport",
        optionalSection: "İsteğe bağlı",
        contactHint: "Rezervasyon onayı ve bilet bu e-posta ve telefona gönderilir.",
        reviewPassengers: "Yolcular",
        eticketIssuanceNote: eticketIssuanceNote("tr"),
      };
    default:
      return flightCopy("en");
  }
}
