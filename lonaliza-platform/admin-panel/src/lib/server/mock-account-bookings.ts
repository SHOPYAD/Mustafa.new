import type { InvoiceService } from "@/lib/booking-service";

export type MockBookingDetail = {
  id: string;
  serviceType: InvoiceService;
  title: string;
  subtitle: string;
  pnr: string;
  provider: string;
  status: "paid" | "confirmed" | "pending" | "cancelled" | "completed";
  paymentStatus: string;
  paymentMethod: "card" | "whatsapp" | "binance";
  price: number;
  currency: string;
  created: string;
  // Flight specifics
  flightDetails?: {
    airline: string;
    airlineCode: string;
    flightNumber: string;
    aircraft: string;
    origin: string;
    originAirport: string;
    originTerminal: string;
    destination: string;
    destinationAirport: string;
    destinationTerminal: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
    cabinClass: string;
    returnFlight?: {
      flightNumber: string;
      origin: string;
      destination: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
    };
  };
  // Hotel specifics
  hotelDetails?: {
    hotelName: string;
    stars: number;
    address: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: string;
    boardType: string;
  };
  // Other service specifics
  serviceDetails?: {
    categoryName: string;
    vehicleModel?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    guideLanguage?: string;
    inclusions: string[];
  };
  // Passengers / Guests
  passengers: Array<{
    name: string;
    type: "adult" | "child" | "infant";
    ticketNumber: string;
    seat: string;
    baggage: string;
    meal: string;
    passportNumber?: string;
  }>;
  // Price breakdown
  priceBreakdown: {
    baseFare: number;
    taxesAndFees: number;
    ancillaryFee: number;
    discount: number;
    total: number;
  };
  // Ancillary options & capabilities
  capabilities: {
    canCancel: boolean;
    canModify: boolean;
    canAddBaggage: boolean;
    freeCancellation: boolean;
    cancellationDeadline?: string;
    supportsAutomatedSupplierRefund: boolean;
    isTravelpayouts: boolean;
  };
  baggageOptions: Array<{
    id: string;
    weightKg: number;
    price: number;
    currency: string;
    description: string;
  }>;
  cancelStatus?: "none" | "pending_admin" | "approved" | "rejected" | "refunded";
  cancelReason?: string;
  cancelAdminNote?: string;
  refundAmount?: number;
  postBookingRequests?: Array<{
    id: string;
    type: "baggage" | "modification" | "cancellation";
    date: string;
    status: "submitted" | "processing" | "completed";
    details: string;
  }>;
};

export const MOCK_BOOKINGS_DATA: MockBookingDetail[] = [
  // 1. Confirmed Round-Trip Flight
  {
    id: "mock-flight-roundtrip-tk",
    serviceType: "flight",
    title: "إسطنبول (IST) ⇄ لندن (LHR)",
    subtitle: "الخطوط الجوية التركية (Turkish Airlines) · TK-1821 / TK-1822",
    pnr: "TK-849204",
    provider: "amadeus_live",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 840,
    currency: "USD",
    created: "2026-09-02T10:30:00Z",
    flightDetails: {
      airline: "الخطوط الجوية التركية - Turkish Airlines",
      airlineCode: "TK",
      flightNumber: "TK-1821",
      aircraft: "Airbus A350-900",
      origin: "إسطنبول (IST)",
      originAirport: "مطار إسطنبول الدولي الجديد",
      originTerminal: "مبنى الركاب الدولي - الصالة الرئيسية",
      destination: "لندن (LHR)",
      destinationAirport: "مطار لندن هيثرو",
      destinationTerminal: "Terminal 2 - The Queen's Terminal",
      departureTime: "2026-09-20T08:30:00Z",
      arrivalTime: "2026-09-20T10:45:00Z",
      duration: "4 ساعات و 15 دقيقة",
      stops: 0,
      cabinClass: "الدرجة الاقتصادية المرنة (Economy Flex)",
      returnFlight: {
        flightNumber: "TK-1822",
        origin: "لندن (LHR)",
        destination: "إسطنبول (IST)",
        departureTime: "2026-09-28T17:15:00Z",
        arrivalTime: "2026-09-28T23:10:00Z",
        duration: "3 ساعات و 55 دقيقة",
      },
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "235-9482019481",
        seat: "14A (نافذة) / 14A",
        baggage: "30 كجم شحن + 8 كجم مقصورة",
        meal: "وجبة شرقية حلال مشمولة",
        passportNumber: "N8492018",
      },
    ],
    priceBreakdown: {
      baseFare: 680,
      taxesAndFees: 120,
      ancillaryFee: 40,
      discount: 0,
      total: 840,
    },
    capabilities: {
      canCancel: true,
      canModify: true,
      canAddBaggage: true,
      freeCancellation: false,
      cancellationDeadline: "2026-09-18T00:00:00Z",
      supportsAutomatedSupplierRefund: true,
      isTravelpayouts: false,
    },
    baggageOptions: [
      { id: "bag-10", weightKg: 10, price: 35, currency: "USD", description: "إضافة حقيبة إضافية 10 كجم" },
      { id: "bag-20", weightKg: 20, price: 60, currency: "USD", description: "إضافة حقيبة شحن 20 كجم" },
      { id: "bag-30", weightKg: 30, price: 85, currency: "USD", description: "إضافة حقيبة شحن كبرى 30 كجم" },
    ],
    cancelStatus: "none",
  },

  // 2. One-Way Business Flight with Free Cancellation
  {
    id: "mock-flight-oneway-sv",
    serviceType: "flight",
    title: "الرياض (RUH) ➔ القاهرة (CAI)",
    subtitle: "الخطوط السعودية (Saudia) · SV-301 · درجة رجال الأعمال",
    pnr: "SV-592180",
    provider: "travelport",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 490,
    currency: "USD",
    created: "2026-09-04T14:15:00Z",
    flightDetails: {
      airline: "الخطوط السعودية - Saudia Airlines",
      airlineCode: "SV",
      flightNumber: "SV-301",
      aircraft: "Boeing 787-9 Dreamliner",
      origin: "الرياض (RUH)",
      originAirport: "مطار الملك خالد الدولي",
      originTerminal: "Terminal 4",
      destination: "القاهرة (CAI)",
      destinationAirport: "مطار القاهرة الدولي",
      destinationTerminal: "Terminal 2",
      departureTime: "2026-10-05T14:15:00Z",
      arrivalTime: "2026-10-05T16:45:00Z",
      duration: "2 ساعة و 30 دقيقة",
      stops: 0,
      cabinClass: "درجة رجال الأعمال (Business Class)",
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "065-2019482910",
        seat: "3B (سرير منبسط بالكامل)",
        baggage: "قطعتين شحن × 32 كجم (64 كجم) + 12 كجم مقصورة",
        meal: "قائمة طعام فاخرة 5 نجوم مع مشروبات ترحيبية",
        passportNumber: "N8492018",
      },
    ],
    priceBreakdown: {
      baseFare: 420,
      taxesAndFees: 70,
      ancillaryFee: 0,
      discount: 0,
      total: 490,
    },
    capabilities: {
      canCancel: true,
      canModify: true,
      canAddBaggage: false,
      freeCancellation: true,
      cancellationDeadline: "2026-10-04T12:00:00Z",
      supportsAutomatedSupplierRefund: true,
      isTravelpayouts: false,
    },
    baggageOptions: [],
    cancelStatus: "none",
  },

  // 3. Flight with Cancellation / Refund Pending
  {
    id: "mock-flight-refund-qr",
    serviceType: "flight",
    title: "الدوحة (DOH) ➔ باريس (CDG)",
    subtitle: "الخطوط الجوية القطرية · طلب الاسترجاع قيد المراجعة",
    pnr: "QR-110294",
    provider: "travelport",
    status: "cancelled",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 650,
    currency: "USD",
    created: "2026-08-28T09:00:00Z",
    flightDetails: {
      airline: "الخطوط الجوية القطرية - Qatar Airways",
      airlineCode: "QR",
      flightNumber: "QR-007",
      aircraft: "Airbus A350-1000",
      origin: "الدوحة (DOH)",
      originAirport: "مطار حمد الدولي",
      originTerminal: "Main Terminal",
      destination: "باريس (CDG)",
      destinationAirport: "مطار باريس شارل ديغول",
      destinationTerminal: "Terminal 1",
      departureTime: "2026-09-15T01:20:00Z",
      arrivalTime: "2026-09-15T07:10:00Z",
      duration: "6 ساعات و 50 دقيقة",
      stops: 0,
      cabinClass: "الدرجة السياحية (Economy Classic)",
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "157-8830192841",
        seat: "22K",
        baggage: "25 كجم + 7 كجم مقصورة",
        meal: "وجبة كلاسيكية ساخنة",
      },
    ],
    priceBreakdown: {
      baseFare: 550,
      taxesAndFees: 100,
      ancillaryFee: 0,
      discount: 0,
      total: 650,
    },
    capabilities: {
      canCancel: false,
      canModify: false,
      canAddBaggage: false,
      freeCancellation: false,
      supportsAutomatedSupplierRefund: true,
      isTravelpayouts: false,
    },
    baggageOptions: [],
    cancelStatus: "pending_admin",
    cancelReason: "طلب العميل إلغاء الحجز لظروف عمل خاصة طارئة",
    cancelAdminNote: "تم استلام الطلب والتنسيق مع شركة الطيران لاسترداد $520 بعد خصم رسوم الإلغاء $130",
    refundAmount: 520,
    postBookingRequests: [
      {
        id: "req-ref-01",
        type: "cancellation",
        date: "2026-09-05 16:20",
        status: "processing",
        details: "طلب استرجاع التذكرة - المبلغ المتوقع استرداده: $520.00 USD",
      },
    ],
  },

  // 4. International Partner / Travelpayouts / Aviasales
  {
    id: "mock-flight-partner-tp",
    serviceType: "flight",
    title: "باريس (CDG) ➔ روما (FCO)",
    subtitle: "Air France · موثق عبر شبكة الشراكة الدولية (Travelpayouts)",
    pnr: "TP-772910",
    provider: "travelpayouts_flights",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 195,
    currency: "USD",
    created: "2026-09-01T12:00:00Z",
    flightDetails: {
      airline: "الخطوط الجوية الفرنسية - Air France",
      airlineCode: "AF",
      flightNumber: "AF-1024",
      aircraft: "Airbus A320",
      origin: "باريس (CDG)",
      originAirport: "مطار باريس شارل ديغول",
      originTerminal: "Terminal 2F",
      destination: "روما (FCO)",
      destinationAirport: "مطار روما فيوميتشينو",
      destinationTerminal: "Terminal 1",
      departureTime: "2026-11-12T11:00:00Z",
      arrivalTime: "2026-11-12T13:05:00Z",
      duration: "2 ساعة و 5 دقائق",
      stops: 0,
      cabinClass: "Light Economy",
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "057-7729102849",
        seat: "18C",
        baggage: "حقيبة مقصورة 12 كجم فقط",
        meal: "وجبة خفيفة ومشروبات",
      },
    ],
    priceBreakdown: {
      baseFare: 160,
      taxesAndFees: 35,
      ancillaryFee: 0,
      discount: 0,
      total: 195,
    },
    capabilities: {
      canCancel: false,
      canModify: false,
      canAddBaggage: false,
      freeCancellation: false,
      supportsAutomatedSupplierRefund: false,
      isTravelpayouts: true,
    },
    baggageOptions: [],
    cancelStatus: "none",
  },

  // 5. Luxury 5-Star Hotel with Free Cancellation & Breakfast
  {
    id: "mock-hotel-rixos-pera",
    serviceType: "hotel",
    title: "فندق ريكسوس بيرا إسطنبول (Rixos Pera)",
    subtitle: "غرفة ديلوكس بإطلالة بانورامية على البوسفور · 4 ليالٍ",
    pnr: "RX-992014",
    provider: "ratehawk",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 1120,
    currency: "USD",
    created: "2026-09-03T11:40:00Z",
    hotelDetails: {
      hotelName: "فندق ريكسوس بيرا إسطنبول (Rixos Pera Istanbul - 5 Stars)",
      stars: 5,
      address: "Kamerhatun Mah. Mesrutiyet Cad. No:44 Tepebasi, Beyoglu, Istanbul",
      roomType: "غرفة ديلوكس كينغ بإطلالة على القرن الذهبي والبوسفور (Deluxe King Room)",
      checkIn: "2026-09-22T14:00:00Z",
      checkOut: "2026-09-26T12:00:00Z",
      nights: 4,
      guests: "2 بالغين (شخصين)",
      boardType: "شامل إفطار بوفيه مفتوح يومياً في مطعم الفندق الفاخر",
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "HTL-VOUCHER-992014",
        seat: "غرفة رئيسية بالطابق السابع",
        baggage: "خدمة حمل ونقل الأمتعة مجاناً (Bellboy)",
        meal: "إفطار بوفيه مفتوح يومياً مشمول",
      },
    ],
    priceBreakdown: {
      baseFare: 980,
      taxesAndFees: 140,
      ancillaryFee: 0,
      discount: 0,
      total: 1120,
    },
    capabilities: {
      canCancel: true,
      canModify: true,
      canAddBaggage: false,
      freeCancellation: true,
      cancellationDeadline: "2026-09-19T18:00:00Z",
      supportsAutomatedSupplierRefund: true,
      isTravelpayouts: false,
    },
    baggageOptions: [],
    cancelStatus: "none",
  },

  // 6. Non-Refundable Luxury Dubai Hotel
  {
    id: "mock-hotel-address-dubai",
    serviceType: "hotel",
    title: "العنوان داون تاون دبي (Address Downtown)",
    subtitle: "جناح تنفيذي بإطلالة برج خليفة والنافورة الراقصة · 4 ليالٍ",
    pnr: "AD-338192",
    provider: "hotelbeds",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 2450,
    currency: "USD",
    created: "2026-09-02T16:00:00Z",
    hotelDetails: {
      hotelName: "العنوان داون تاون دبي (Address Downtown Dubai)",
      stars: 5,
      address: "Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, UAE",
      roomType: "جناح تنفيذي برج فيو (Executive Suite Burj View)",
      checkIn: "2026-10-18T15:00:00Z",
      checkOut: "2026-10-22T12:00:00Z",
      nights: 4,
      guests: "2 بالغين + طفل واحد",
      boardType: "إقامة بدون وجبات (Room Only) - خيارات المطاعم متوفرة",
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "HTL-VOUCHER-338192",
        seat: "الطابق التنفيذي 28",
        baggage: "دخول حصري إلى صالة النادي التنفيذي (Club Lounge)",
        meal: "مشروبات وضيافة النادي طوال اليوم",
      },
    ],
    priceBreakdown: {
      baseFare: 2150,
      taxesAndFees: 300,
      ancillaryFee: 0,
      discount: 0,
      total: 2450,
    },
    capabilities: {
      canCancel: false,
      canModify: false,
      canAddBaggage: false,
      freeCancellation: false,
      supportsAutomatedSupplierRefund: false,
      isTravelpayouts: false,
    },
    baggageOptions: [],
    cancelStatus: "none",
  },

  // 7. VIP Airport Transfer
  {
    id: "mock-transfer-maybach",
    serviceType: "transfer",
    title: "توصيل VIP خاص - مطار إسطنبول (IST) إلى فندق ريكسوس",
    subtitle: "مرسيدس مايباخ سبرينتر VIP · استقبال بالاسم وضيافة فاخرة",
    pnr: "TRF-55012",
    provider: "manual",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 85,
    currency: "USD",
    created: "2026-09-03T11:45:00Z",
    serviceDetails: {
      categoryName: "خدمات الترانسفير والاستقبال VIP",
      vehicleModel: "Mercedes-Benz Maybach VIP Sprinter (طراز 2026)",
      pickupLocation: "مطار إسطنبول الدولي (IST) - بوابة خروج 13",
      dropoffLocation: "فندق ريكسوس بيرا إسطنبول - بيوغلو",
      inclusions: [
        "استقبال في المطار مع لوحة تحمل اسم العميل",
        "مقاعد جلدية مساج مع إضاءة محيطية سينمائية",
        "إنترنت واي فاي فائق السرعة مجاني طوال الطريق",
        "مشروبات غازية وباردة ومياه معدنية وسناكس مجانية",
        "تتبع رقم الرحلة والانتظار مجاناً حتى 90 دقيقة في حال تأخر الطائرة",
      ],
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "TRF-VCH-55012",
        seat: "فان VIP خاص بالكامل (حتى 6 ركاب)",
        baggage: "مساحة حتى 8 حقائب سفر كبيرة",
        meal: "مشروبات ضيافة منعشة",
      },
    ],
    priceBreakdown: {
      baseFare: 75,
      taxesAndFees: 10,
      ancillaryFee: 0,
      discount: 0,
      total: 85,
    },
    capabilities: {
      canCancel: true,
      canModify: true,
      canAddBaggage: false,
      freeCancellation: true,
      cancellationDeadline: "2026-09-21T10:00:00Z",
      supportsAutomatedSupplierRefund: true,
      isTravelpayouts: false,
    },
    baggageOptions: [],
    cancelStatus: "none",
  },

  // 8. Luxury Car Rental
  {
    id: "mock-car-rangerover",
    serviceType: "car",
    title: "تأجير رينج روفر سبورت (Range Rover Sport 2026)",
    subtitle: "استلام وتسليم مطار إسطنبول · تأمين شامل بدون نسبة تحمل",
    pnr: "CAR-88291",
    provider: "manual",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 750,
    currency: "USD",
    created: "2026-09-02T15:00:00Z",
    serviceDetails: {
      categoryName: "تأجير السيارات الفارهة",
      vehicleModel: "Land Rover Range Rover Sport HSE Dynamic 2026 (Black Edition)",
      pickupLocation: "مطار إسطنبول الدولي (IST) - صالة استلام السيارات",
      dropoffLocation: "مطار إسطنبول الدولي (IST)",
      inclusions: [
        "تأمين شامل Full Comprehensive ضد الحوادث والسرقة 0% نسبة تحمل",
        "كيلومترات مفتوحة غير محدودة (Unlimited Kilometers)",
        "نظام ملاحة GPS محدث مع كاميرات 360",
        "سائق إضافي مسجل مجاناً",
        "تسليم السيارة معقمة وبخزان وقود ممتلئ",
      ],
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "CAR-AGR-88291",
        seat: "سائق رئيسي مؤمن",
        baggage: "صندوق خلفي واسع",
        meal: "خدمة المساعدة على الطريق 24/7",
      },
    ],
    priceBreakdown: {
      baseFare: 650,
      taxesAndFees: 100,
      ancillaryFee: 0,
      discount: 0,
      total: 750,
    },
    capabilities: {
      canCancel: true,
      canModify: true,
      canAddBaggage: false,
      freeCancellation: true,
      cancellationDeadline: "2026-09-20T12:00:00Z",
      supportsAutomatedSupplierRefund: true,
      isTravelpayouts: false,
    },
    baggageOptions: [],
    cancelStatus: "none",
  },

  // 9. Cappadocia Tour
  {
    id: "mock-tour-cappadocia",
    serviceType: "tour",
    title: "جولة كبادوكيا الساحرة مع طيران المنطاد VIP",
    subtitle: "إقامة في فندق كهفي + ركوب المنطاد عند الشروق + سيارة خاصة ومرشد",
    pnr: "TUR-44019",
    provider: "manual",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    price: 920,
    currency: "USD",
    created: "2026-09-01T17:30:00Z",
    serviceDetails: {
      categoryName: "الباقات والجولات السياحية VIP",
      pickupLocation: "كبادوكيا - مطار قيصري (ASR) أو نافشهير (NAV)",
      dropoffLocation: "مطار قيصري أو الفندق",
      guideLanguage: "مرشد سياحي خاص يتحدث العربية بطلاقة",
      inclusions: [
        "طيران المنطاد الهوائي VIP عند شروق الشمس مع شهادة طيران واحتفال",
        "إقامة ليلتين في فندق كهفي فاخر (Cave Suite Hotel) مع الإفطار",
        "سيارة مرسيدس فيتو VIP خاصة مع سائق طوال الرحلة",
        "زيارة وادي الخيال (Devrent)، متحف غوريمي المفتوح، ووادي الحب",
        "تذاكر الدخول لجميع المعالم والمواقع الأثرية مشمولة بالكامل",
      ],
    },
    passengers: [
      {
        name: "ferdos elhayat",
        type: "adult",
        ticketNumber: "TUR-VCH-44019",
        seat: "رحلة خاصة بالكامل لشخصين",
        baggage: "شامل نقل الحقائب بين المطار والفندق",
        meal: "إفطار يومي + غداء مشوي في مطاعم كبادوكيا التقليدية",
      },
    ],
    priceBreakdown: {
      baseFare: 820,
      taxesAndFees: 100,
      ancillaryFee: 0,
      discount: 0,
      total: 920,
    },
    capabilities: {
      canCancel: true,
      canModify: true,
      canAddBaggage: false,
      freeCancellation: true,
      cancellationDeadline: "2026-09-28T12:00:00Z",
      supportsAutomatedSupplierRefund: true,
      isTravelpayouts: false,
    },
    baggageOptions: [],
    cancelStatus: "none",
  },
];

/**
 * Demo bookings are NEVER shown in production accounts (no fabricated data).
 * They can be enabled explicitly for design previews with ACCOUNT_DEMO_BOOKINGS=1.
 */
function demoBookingsEnabled(): boolean {
  return process.env.ACCOUNT_DEMO_BOOKINGS === "1";
}

export function getMockGuestBookingRows() {
  if (!demoBookingsEnabled()) return [];
  return MOCK_BOOKINGS_DATA.map((b) => ({
    id: b.id,
    hotel_name: b.title,
    room_name: b.subtitle,
    check_in: b.flightDetails?.departureTime || b.hotelDetails?.checkIn || b.created,
    check_out: b.flightDetails?.returnFlight?.arrivalTime || b.hotelDetails?.checkOut || b.created,
    status: b.status,
    payment_status: b.paymentStatus,
    payment_method: b.paymentMethod,
    price: b.price,
    currency: b.currency,
    cancel_status: b.cancelStatus || "none",
    cancel_admin_note: b.cancelAdminNote || "",
    refund_amount: b.refundAmount || 0,
    can_cancel: b.capabilities.canCancel,
    free_cancellation: b.capabilities.freeCancellation,
    non_refundable: !b.capabilities.freeCancellation && !b.capabilities.canCancel,
    service: b.serviceType,
    airline: b.flightDetails?.airline || "",
    airline_code: b.flightDetails?.airlineCode || "",
    origin: b.flightDetails?.origin || "",
    destination: b.flightDetails?.destination || "",
    route: b.flightDetails ? `${b.flightDetails.origin} ➔ ${b.flightDetails.destination}` : "",
    pnr: b.pnr,
    fare_class: b.flightDetails?.cabinClass || "",
    flight_number: b.flightDetails?.flightNumber || "",
    departure_time: b.flightDetails?.departureTime || b.hotelDetails?.checkIn || b.created,
    arrival_time: b.flightDetails?.arrivalTime || b.hotelDetails?.checkOut || b.created,
    duration: b.flightDetails?.duration || "",
    stops: b.flightDetails?.stops || 0,
    passenger_name: b.passengers?.[0]?.name || "ferdos elhayat",
    hotel_stars: b.hotelDetails?.stars || 5,
    hotel_address: b.hotelDetails?.address || b.subtitle || "",
    nights: b.hotelDetails?.nights || 3,
    board_type: b.hotelDetails?.boardType || "شامل الإفطار",
  }));
}

export function findMockBookingDetail(id: string): MockBookingDetail | undefined {
  if (!demoBookingsEnabled()) return undefined;
  return MOCK_BOOKINGS_DATA.find((item) => item.id === id);
}
