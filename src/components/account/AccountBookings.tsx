"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bus,
  Car,
  Hotel,
  Loader2,
  MapPin,
  Plane,
  Ticket,
  Sliders,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/components/ui/CurrencySelector";
import {
  BOOKING_FILTERS,
  type AccountService,
  type BookingFilter,
} from "@/lib/account/booking-display";
import type { InvoiceService } from "@/lib/booking-service";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/types";

type CancelStatus =
  | "none"
  | "pending_admin"
  | "approved"
  | "rejected"
  | "refunded"
  | "refund_failed";

type GuestBooking = {
  id: string;
  hotel_name: string;
  room_name: string;
  check_in: string;
  check_out: string;
  status: string;
  payment_status: string;
  payment_method: "card" | "whatsapp" | "other";
  price: number;
  currency: string;
  cancel_status: CancelStatus;
  cancel_admin_note: string;
  refund_amount: number;
  can_cancel: boolean;
  free_cancellation: boolean;
  non_refundable: boolean;
  service: InvoiceService;
  airline: string;
  airline_code: string;
  origin: string;
  destination: string;
  route: string;
  pnr: string;
  fare_class: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  duration?: string;
  stops?: number;
  passenger_name?: string;
  hotel_stars?: number;
  hotel_address?: string;
  nights?: number;
  board_type?: string;
};

type EnquiryRow = {
  id: string;
  type: string;
  service: AccountService;
  service_name: string;
  destination: string;
  status: string;
  created: string;
};

const PAGE_SIZE = 10;

const bI18n: Record<string, any> = {
  ar: {
    filters: {
      all: "الكل",
      flight: "طيران",
      hotel: "فنادق",
      car: "سيارات",
      transfer: "ترانسفير VIP",
      package: "برامج وجولات",
      enquiry: "استفسارات",
    },
    exportCsv: "تصدير الحجوزات (CSV)",
    loading: "جارٍ تحميل جدول الحجوزات الرسمية...",
    emptyTitle: "لا توجد حجوزات في هذا القسم",
    emptyDesc:
      "لم يتم العثور على أي حجز مطابق للتصنيف المحدد. يمكنك تصفح عروض الطيران والفنادق وحجز رحلتك القادمة الآن.",
    exploreFlights: "استكشاف رحلات الطيران",
    flightTableTitle: "جدول تذاكر وحجوزات الطيران",
    flightTableSubtitle: "مواعيد الإقلاع، مسارات الرحلات، ورموز الحجز الرسمية (PNR)",
    ticketSuffix: "تذكرة",
    colAirline: "شركة الطيران والرحلة",
    colRoute: "مسار الرحلة",
    colTimeDate: "التوقيت والتاريخ والمدة",
    colPassengerCabin: "المسافر والفئة",
    colPnr: "رمز PNR",
    colStatus: "حالة الحجز",
    colTotal: "الإجمالي",
    colManage: "إدارة الحجز",
    manageBtn: "إدارة الحجز والتفاصيل",
    direct: "مباشرة",
    stop: "توقف",
    confirmedFlight: "رحلة دولية معتمدة",
    hotelTableTitle: "جدول حجوزات الإقامة الفندقية المؤكدة",
    hotelTableSubtitle: "الفنادق، مدد الإقامة، فئات الغرف، وباقات الإفطار المعتمدة",
    hotelSuffix: "فندق",
    colHotel: "الفندق والدرجة",
    colCity: "المدينة والموقع",
    colDates: "تواريخ الإقامة",
    colRoom: "الغرفة والباقة",
    colVoucher: "رقم القسيمة",
    starsSuffix: "نجوم",
    nightsStay: "ليالٍ إقامة",
    breakfastIncluded: "شامل الإفطار",
    freeCancel: "إلغاء مجاني",
    otherTableTitle: "جدول التنقلات والسيارات والبرامج السياحية",
    otherTableSubtitle: "خدمات VIP، سيارات بسائق أو بدون، والجولات السياحية",
    colServiceType: "نوع الخدمة",
    colVehicle: "المركبة / المسار والموقع",
    colDateTime: "التاريخ والموعد",
    colBookingNo: "رقم الحجز",
    carRental: "تأجير سيارة",
    vipTransfer: "ترانسفير VIP",
    tourPackage: "برنامج سياحي",
    manageDetails: "إدارة وتفاصيل",
    showing: "عرض",
    of: "من أصل",
    bookingsSuffix: "حجز",
    prev: "السابق",
    next: "التالي",
    statusCancellationPending: "قيد معالجة الإلغاء",
    statusCancellationRejected: "تم رفض الإلغاء",
    statusRefunded: "مسترد بالكامل",
    statusRefundProcessing: "جارٍ تحويل الاسترداد",
    statusCancelled: "ملغي",
    statusConfirmed: "مؤكد",
    statusProcessing: "قيد المعالجة",
    csvHeaders: [
      "رقم الحجز",
      "الخدمة",
      "المسار / المنشأة",
      "شركة الطيران / التفاصيل",
      "رمز PNR",
      "تاريخ السفر / الدخول",
      "تاريخ المغادرة",
      "الحالة",
      "طريقة الدفع",
      "المبلغ",
      "العملة",
    ],
    csvPaymentCard: "بطاقة بنكية",
    csvPaymentOther: "واتساب / أخرى",
  },
  en: {
    filters: {
      all: "All",
      flight: "Flights",
      hotel: "Hotels",
      car: "Cars",
      transfer: "VIP Transfers",
      package: "Tours & Packages",
      enquiry: "Inquiries",
    },
    exportCsv: "Export Bookings (CSV)",
    loading: "Loading official bookings schedule...",
    emptyTitle: "No bookings found in this category",
    emptyDesc:
      "No bookings match the selected filter. Explore our flight and hotel deals to book your next trip.",
    exploreFlights: "Explore Flights",
    flightTableTitle: "Flight Tickets & Bookings Schedule",
    flightTableSubtitle:
      "Departure times, flight routes, and official PNR booking codes",
    ticketSuffix: "Tickets",
    colAirline: "Airline & Flight",
    colRoute: "Route",
    colTimeDate: "Time, Date & Duration",
    colPassengerCabin: "Passenger & Cabin",
    colPnr: "PNR Code",
    colStatus: "Status",
    colTotal: "Total",
    colManage: "Manage",
    manageBtn: "Manage Booking & Details",
    direct: "Direct",
    stop: "stop(s)",
    confirmedFlight: "Confirmed International Flight",
    hotelTableTitle: "Confirmed Hotel Stays Schedule",
    hotelTableSubtitle:
      "Hotels, stay duration, room categories, and meal plans",
    hotelSuffix: "Hotels",
    colHotel: "Hotel & Rating",
    colCity: "City & Location",
    colDates: "Stay Dates",
    colRoom: "Room & Board",
    colVoucher: "Voucher #",
    starsSuffix: "Stars",
    nightsStay: "Nights Stay",
    breakfastIncluded: "Breakfast Included",
    freeCancel: "Free Cancellation",
    otherTableTitle: "Transfers, Cars & Tour Packages",
    otherTableSubtitle:
      "VIP services, rental cars with or without driver, and guided tours",
    colServiceType: "Service Type",
    colVehicle: "Vehicle / Route & Location",
    colDateTime: "Date & Time",
    colBookingNo: "Booking #",
    carRental: "Car Rental",
    vipTransfer: "VIP Transfer",
    tourPackage: "Tour Package",
    manageDetails: "Manage & Details",
    showing: "Showing",
    of: "of",
    bookingsSuffix: "bookings",
    prev: "Previous",
    next: "Next",
    statusCancellationPending: "Cancellation Pending",
    statusCancellationRejected: "Cancellation Rejected",
    statusRefunded: "Refunded",
    statusRefundProcessing: "Refund Processing",
    statusCancelled: "Cancelled",
    statusConfirmed: "Confirmed",
    statusProcessing: "Processing",
    csvHeaders: [
      "Booking ID",
      "Service",
      "Route / Property",
      "Airline / Details",
      "PNR Code",
      "Travel / Check-in",
      "Departure / Check-out",
      "Status",
      "Payment Method",
      "Amount",
      "Currency",
    ],
    csvPaymentCard: "Credit Card",
    csvPaymentOther: "WhatsApp / Other",
  },
  tr: {
    filters: {
      all: "Tümü",
      flight: "Uçuşlar",
      hotel: "Oteller",
      car: "Araçlar",
      transfer: "VIP Transfer",
      package: "Turlar ve Paketler",
      enquiry: "Talepler",
    },
    exportCsv: "Rezervasyonları İndir (CSV)",
    loading: "Resmi rezervasyon tablosu yükleniyor...",
    emptyTitle: "Bu kategoride rezervasyon bulunamadı",
    emptyDesc:
      "Seçilen kategoriye ait rezervasyon bulunamadı. Uçuş ve otel fırsatlarımızı inceleyerek bir sonraki seyahatinizi hemen planlayın.",
    exploreFlights: "Uçuşları Keşfet",
    flightTableTitle: "Uçak Biletleri ve Rezervasyonlar",
    flightTableSubtitle:
      "Kalkış saatleri, uçuş rotaları ve resmi PNR rezervasyon kodları",
    ticketSuffix: "Bilet",
    colAirline: "Havayolu ve Uçuş",
    colRoute: "Uçuş Rotası",
    colTimeDate: "Saat, Tarih ve Süre",
    colPassengerCabin: "Yolcu ve Kabin",
    colPnr: "PNR Kodu",
    colStatus: "Durum",
    colTotal: "Toplam",
    colManage: "Yönet",
    manageBtn: "Rezervasyonu Yönet ve Detaylar",
    direct: "Aktarmasız",
    stop: "aktarma",
    confirmedFlight: "Onaylı Uluslararası Uçuş",
    hotelTableTitle: "Onaylı Otel Konaklamaları",
    hotelTableSubtitle:
      "Oteller, konaklama süreleri, oda tipleri ve onaylı kahvaltı paketleri",
    hotelSuffix: "Otel",
    colHotel: "Otel ve Kategori",
    colCity: "Şehir ve Konum",
    colDates: "Konaklama Tarihleri",
    colRoom: "Oda ve Pansiyon",
    colVoucher: "Kupon No",
    starsSuffix: "Yıldız",
    nightsStay: "Gece Konaklama",
    breakfastIncluded: "Kahvaltı Dahil",
    freeCancel: "Ücretsiz İptal",
    otherTableTitle: "Transfer, Araç ve Tur Paketleri",
    otherTableSubtitle:
      "VIP hizmetler, şoförlü/şoförsüz araç kiralama ve turlar",
    colServiceType: "Hizmet Türü",
    colVehicle: "Araç / Güzergah ve Konum",
    colDateTime: "Tarih ve Saat",
    colBookingNo: "Rezervasyon No",
    carRental: "Araç Kiralama",
    vipTransfer: "VIP Transfer",
    tourPackage: "Tur Paketi",
    manageDetails: "Yönet ve Detaylar",
    showing: "Gösterilen:",
    of: "/",
    bookingsSuffix: "rezervasyon",
    prev: "Önceki",
    next: "Sonraki",
    statusCancellationPending: "İptal İşleniyor",
    statusCancellationRejected: "İptal Reddedildi",
    statusRefunded: "İade Edildi",
    statusRefundProcessing: "İade İşleniyor",
    statusCancelled: "İptal Edildi",
    statusConfirmed: "Onaylandı",
    statusProcessing: "İşleniyor",
    csvHeaders: [
      "Rezervasyon No",
      "Hizmet",
      "Güzergah / Tesis",
      "Havayolu / Detay",
      "PNR Kodu",
      "Giriş / Seyahat Tarihi",
      "Çıkış Tarihi",
      "Durum",
      "Ödeme Yöntemi",
      "Tutar",
      "Para Birimi",
    ],
    csvPaymentCard: "Kredi Kartı",
    csvPaymentOther: "WhatsApp / Diğer",
  },
  fr: {
    filters: {
      all: "Tous",
      flight: "Vols",
      hotel: "Hôtels",
      car: "Voitures",
      transfer: "Transferts VIP",
      package: "Circuits & Séjours",
      enquiry: "Demandes",
    },
    exportCsv: "Exporter les réservations (CSV)",
    loading: "Chargement du tableau officiel des réservations...",
    emptyTitle: "Aucune réservation dans cette catégorie",
    emptyDesc:
      "Aucune réservation ne correspond au filtre sélectionné. Découvrez nos offres de vols et d'hôtels dès maintenant.",
    exploreFlights: "Explorer les vols",
    flightTableTitle: "Billets d'Avion & Réservations",
    flightTableSubtitle: "Horaires de départ, itinéraires et codes PNR officiels",
    ticketSuffix: "Billets",
    colAirline: "Compagnie & Vol",
    colRoute: "Itinéraire",
    colTimeDate: "Date, Heure & Durée",
    colPassengerCabin: "Passager & Cabine",
    colPnr: "Code PNR",
    colStatus: "Statut",
    colTotal: "Total",
    colManage: "Gérer",
    manageBtn: "Gérer la réservation & Détails",
    direct: "Direct",
    stop: "escale(s)",
    confirmedFlight: "Vol international confirmé",
    hotelTableTitle: "Séjours Hôteliers Confirmés",
    hotelTableSubtitle:
      "Hôtels, durées de séjour, types de chambres et formules",
    hotelSuffix: "Hôtels",
    colHotel: "Hôtel & Catégorie",
    colCity: "Ville & Emplacement",
    colDates: "Dates de séjour",
    colRoom: "Chambre & Formule",
    colVoucher: "N° Bon",
    starsSuffix: "Étoiles",
    nightsStay: "Nuits de séjour",
    breakfastIncluded: "Petit-déjeuner inclus",
    freeCancel: "Annulation gratuite",
    otherTableTitle: "Transferts, Voitures & Circuits",
    otherTableSubtitle:
      "Services VIP, location avec ou sans chauffeur et circuits",
    colServiceType: "Type de service",
    colVehicle: "Véhicule / Itinéraire & Lieu",
    colDateTime: "Date & Heure",
    colBookingNo: "N° Réservasyon",
    carRental: "Location de voiture",
    vipTransfer: "Transfert VIP",
    tourPackage: "Circuit touristique",
    manageDetails: "Gérer & Détails",
    showing: "Affichage de",
    of: "sur",
    bookingsSuffix: "réservations",
    prev: "Précédent",
    next: "Suivant",
    statusCancellationPending: "Annulation en cours",
    statusCancellationRejected: "Annulation refusée",
    statusRefunded: "Remboursé",
    statusRefundProcessing: "Remboursement en cours",
    statusCancelled: "Annulé",
    statusConfirmed: "Confirmé",
    statusProcessing: "En traitement",
    csvHeaders: [
      "N° Réservation",
      "Service",
      "Itinéraire / Établissement",
      "Compagnie / Détails",
      "Code PNR",
      "Date de voyage / Entrée",
      "Date de départ",
      "Statut",
      "Mode de paiement",
      "Montant",
      "Devise",
    ],
    csvPaymentCard: "Carte Bancaire",
    csvPaymentOther: "WhatsApp / Autre",
  },
};

function localizeStatus(b: GuestBooking, loc: string): string {
  const dict = bI18n[loc] || bI18n.en;
  if (b.cancel_status === "pending_admin" || b.cancel_status === "refund_failed") {
    return dict.statusCancellationPending;
  }
  if (b.cancel_status === "rejected") return dict.statusCancellationRejected;
  if (b.cancel_status === "refunded") return dict.statusRefunded;
  if (b.cancel_status === "approved" && b.payment_method === "card" && b.refund_amount > 0) {
    return dict.statusRefundProcessing;
  }
  if (b.cancel_status === "approved" || b.status === "cancelled") return dict.statusCancelled;
  if (b.status === "paid" || b.payment_status === "paid" || b.status === "confirmed") return dict.statusConfirmed;
  return dict.statusProcessing;
}

function localizeCabinClass(raw: string, loc: string): string {
  const text = String(raw || "").toLowerCase();
  if (text.includes("flex") || text.includes("مرنة")) {
    return loc === "ar"
      ? "الدرجة الاقتصادية المرنة (Economy Flex)"
      : loc === "tr"
        ? "Esnek Ekonomi (Economy Flex)"
        : loc === "fr"
          ? "Économie Flexible (Economy Flex)"
          : "Economy Flex";
  }
  if (text.includes("business") || text.includes("رجال أعمال")) {
    return loc === "ar"
      ? "درجة رجال الأعمال (Business Class)"
      : loc === "tr"
        ? "Business Sınıfı"
        : loc === "fr"
          ? "Classe Affaires"
          : "Business Class";
  }
  if (text.includes("first") || text.includes("أولى")) {
    return loc === "ar"
      ? "الدرجة الأولى (First Class)"
      : loc === "tr"
        ? "First Class"
        : loc === "fr"
          ? "Première Classe"
          : "First Class";
  }
  if (text.includes("basic") || text.includes("أساسية")) {
    return loc === "ar"
      ? "درجة أساسية (Basic)"
      : loc === "tr"
        ? "Temel Ekonomi (Basic)"
        : loc === "fr"
          ? "Économie Standard (Basic)"
          : "Economy Basic";
  }
  return loc === "ar"
    ? "درجة اقتصادية"
    : loc === "tr"
      ? "Ekonomi Sınıfı"
      : loc === "fr"
        ? "Classe Économique"
        : "Economy Class";
}

function localizeAirline(name: string, loc: string): string {
  const raw = String(name || "").trim();
  if (/turkish airlines|الخطوط الجوية التركية/i.test(raw)) {
    return loc === "ar" ? "الخطوط الجوية التركية" : "Turkish Airlines";
  }
  if (/saudia|الخطوط السعودية/i.test(raw)) {
    return loc === "ar" ? "الخطوط السعودية" : "Saudia Airlines";
  }
  if (/pegasus/i.test(raw)) {
    return "Pegasus Airlines";
  }
  if (/flynas|طيران ناس/i.test(raw)) {
    return loc === "ar" ? "طيران ناس" : "Flynas";
  }
  if (/flyadeal|طيران أديل/i.test(raw)) {
    return loc === "ar" ? "طيران أديل" : "Flyadeal";
  }
  if (loc !== "ar" && raw.includes(" - ")) {
    const parts = raw.split(" - ");
    const engPart = parts.find((p) => /[a-zA-Z]/.test(p));
    if (engPart) return engPart.trim();
  }
  return raw || (bI18n[loc] || bI18n.en).colAirline;
}

function localizeRouteCity(cityOrCode: string, loc: string): string {
  const raw = String(cityOrCode || "").trim();
  const map: Record<string, Record<string, string>> = {
    IST: { ar: "إسطنبول (IST)", tr: "İstanbul (IST)", fr: "Istanbul (IST)", en: "Istanbul (IST)" },
    SAW: { ar: "صبيحة (SAW)", tr: "Sabiha Gökçen (SAW)", fr: "Sabiha (SAW)", en: "Sabiha (SAW)" },
    LHR: { ar: "لندن (LHR)", tr: "Londra (LHR)", fr: "Londres (LHR)", en: "London (LHR)" },
    RUH: { ar: "الرياض (RUH)", tr: "Riyad (RUH)", fr: "Riyad (RUH)", en: "Riyadh (RUH)" },
    CAI: { ar: "القاهرة (CAI)", tr: "Kahire (CAI)", fr: "Le Caire (CAI)", en: "Cairo (CAI)" },
    DXB: { ar: "دبي (DXB)", tr: "Dubai (DXB)", fr: "Dubaï (DXB)", en: "Dubai (DXB)" },
  };
  for (const [code, trans] of Object.entries(map)) {
    if (raw.toUpperCase().includes(code)) {
      return trans[loc] || trans.en;
    }
  }
  if (loc !== "ar") {
    if (raw.includes("إسطنبول")) return loc === "tr" ? "İstanbul" : "Istanbul";
    if (raw.includes("لندن")) return loc === "fr" ? "Londres" : loc === "tr" ? "Londra" : "London";
    if (raw.includes("الرياض")) return loc === "tr" || loc === "fr" ? "Riyad" : "Riyadh";
    if (raw.includes("القاهرة")) return loc === "fr" ? "Le Caire" : loc === "tr" ? "Kahire" : "Cairo";
  }
  return raw;
}

function localizeDuration(raw: string, _loc: string): string {
  return String(raw || "").trim();
}

function localizeBoardType(raw: string, loc: string): string {
  const text = String(raw || "").toLowerCase();
  if (text.includes("إفطار") || text.includes("breakfast") || text.includes("kahvaltı")) {
    return (bI18n[loc] || bI18n.en).breakfastIncluded;
  }
  return raw;
}

export default function AccountBookings() {
  const { t, locale, dir } = useLocale();
  const { currency, convert } = useCurrency();
  const isRtl = dir === "rtl" || locale === "ar";
  const txt = bI18n[locale] || bI18n.en;

  const [hotels, setHotels] = useState<GuestBooking[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const reload = () =>
    fetch("/api/account/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setHotels(d.hotels || []);
        setEnquiries(d.enquiries || []);
      });

  useEffect(() => {
    void reload().finally(() => setLoading(false));
  }, []);

  const formatPrice = (amount: number, source = "USD") => {
    const n = convert(amount, source || "USD");
    return `${currency.symbol}${n.toLocaleString(
      locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const statusClass = (b: GuestBooking) => {
    if (b.cancel_status === "pending_admin" || b.cancel_status === "refund_failed") {
      return "border-amber-200 bg-amber-50 text-amber-900";
    }
    if (b.cancel_status === "rejected") return "border-rose-200 bg-rose-50 text-rose-800";
    if (
      b.cancel_status === "refunded" ||
      b.cancel_status === "approved" ||
      b.status === "cancelled"
    ) {
      return "border-slate-200 bg-slate-100 text-slate-700";
    }
    if (b.status === "paid" || b.payment_status === "paid" || b.status === "confirmed") {
      return "border-emerald-200 bg-emerald-50 text-emerald-800 font-bold";
    }
    return "border-purple-200 bg-purple-50 text-purple-900";
  };

  // Filtered lists
  const filteredBookings = useMemo(() => {
    if (filter === "all") return hotels;
    return hotels.filter((b) => {
      if (filter === "flight") return b.service === "flight";
      if (filter === "hotel") return b.service === "hotel";
      if (filter === "car") return b.service === "car";
      if (filter === "transfer") return b.service === "transfer";
      if (filter === "package") return b.service === "tour" || b.service === "package";
      return true;
    });
  }, [hotels, filter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Paginated bookings
  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBookings.slice(start, start + PAGE_SIZE);
  }, [filteredBookings, currentPage]);

  // Export Bookings to CSV
  const exportToCsv = () => {
    const headers = txt.csvHeaders;
    const rows = filteredBookings.map((b) => [
      `"${b.id}"`,
      `"${
        b.service === "flight"
          ? txt.filters.flight
          : b.service === "hotel"
            ? txt.filters.hotel
            : b.service === "car"
              ? txt.carRental
              : b.service === "transfer"
                ? txt.vipTransfer
                : b.service === "tour" || b.service === "package"
                  ? txt.tourPackage
                  : b.service
      }"`,
      `"${(b.route || b.hotel_name || "").replace(/"/g, '""')}"`,
      `"${(localizeAirline(b.airline, locale) || b.room_name || "").replace(/"/g, '""')}"`,
      `"${b.pnr || ""}"`,
      `"${b.check_in || ""}"`,
      `"${b.check_out || ""}"`,
      `"${localizeStatus(b, locale)}"`,
      `"${b.payment_method === "card" ? txt.csvPaymentCard : txt.csvPaymentOther}"`,
      `"${b.price}"`,
      `"${b.currency || "USD"}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `lonaliza-bookings-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFilterCount = (key: BookingFilter) => {
    if (key === "all") return hotels.length;
    if (key === "enquiry") return enquiries.length;
    return hotels.filter((b) => {
      if (key === "flight") return b.service === "flight";
      if (key === "hotel") return b.service === "hotel";
      if (key === "car") return b.service === "car";
      if (key === "transfer") return b.service === "transfer";
      if (key === "package") return b.service === "tour" || b.service === "package";
      return false;
    }).length;
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-md">
        <Loader2 className="mx-auto animate-spin text-[#280e46]" size={32} />
        <p className="mt-3 text-xs font-bold text-slate-600">{txt.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and CSV Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {BOOKING_FILTERS.map((key) => {
            const count = getFilterCount(key);
            const active = filter === key;
            const label = txt.filters[key] || key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer",
                  active
                    ? "bg-[#280e46] text-amber-300 shadow-md border border-amber-400/40"
                    : "bg-slate-50 text-slate-700 hover:bg-purple-50/80 hover:text-purple-950 border border-slate-200/80"
                )}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
                    active
                      ? "bg-amber-400/20 text-amber-300"
                      : "bg-slate-200/80 text-slate-700"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={exportToCsv}
          disabled={filteredBookings.length === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-sm transition-all self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          <FileSpreadsheet size={15} className="text-emerald-700" />
          <span>{txt.exportCsv}</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-900">
            <Ticket size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900">{txt.emptyTitle}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{txt.emptyDesc}</p>
          <div className="pt-2">
            <Link
              href="/flights"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#280e46] px-5 py-2.5 text-xs font-bold text-amber-300 shadow-md"
            >
              <Plane size={15} />
              <span>{txt.exploreFlights}</span>
            </Link>
          </div>
        </div>
      )}

      {/* 1. PROFESSIONAL FLIGHTS TABLE */}
      {paginatedBookings.some((b) => b.service === "flight") &&
        (filter === "all" || filter === "flight") && (
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md">
            <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50/60 via-white to-amber-50/40 p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#280e46] text-amber-300 shadow-sm">
                  <Plane size={15} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {txt.flightTableTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {txt.flightTableSubtitle}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 border border-purple-200 rounded-xl px-2.5 py-1">
                {filteredBookings.filter((b) => b.service === "flight").length}{" "}
                {txt.ticketSuffix}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4 text-start whitespace-nowrap">{txt.colAirline}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colRoute}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colTimeDate}</th>
                    <th className="p-4 text-start whitespace-nowrap">
                      {txt.colPassengerCabin}
                    </th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colPnr}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colStatus}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colTotal}</th>
                    <th className="p-4 text-center whitespace-nowrap">{txt.colManage}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {paginatedBookings
                    .filter((b) => b.service === "flight")
                    .map((b) => {
                      const originCity = localizeRouteCity(
                        b.origin || b.route?.split("→")?.[0]?.trim() || "IST",
                        locale
                      );
                      const destCity = localizeRouteCity(
                        b.destination || b.route?.split("→")?.[1]?.trim() || "LHR",
                        locale
                      );
                      const airlineTitle = localizeAirline(b.airline, locale);
                      const cabinTitle = localizeCabinClass(b.fare_class, locale);
                      const stopsText =
                        b.stops === 0 || b.stops === undefined
                          ? txt.direct
                          : `${b.stops} ${txt.stop}`;

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-purple-50/30 transition-colors"
                        >
                          {/* Airline Logo & Flight Number */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 shadow-sm">
                                <AirlineLogo
                                  code={b.airline_code}
                                  name={airlineTitle}
                                  size="md"
                                />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-xs">
                                  {airlineTitle}
                                </p>
                                <p className="text-[11px] font-mono text-purple-900 font-bold">
                                  {b.flight_number || b.fare_class || "TK-849204"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Route */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <span>{originCity}</span>
                              <Plane
                                size={13}
                                className="text-amber-500 shrink-0 rtl:-scale-x-100"
                              />
                              <span>{destCity}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {txt.confirmedFlight}
                            </p>
                          </td>

                          {/* Dates & Duration */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Calendar size={13} className="text-purple-700 shrink-0" />
                              <span>
                                {b.check_in ? b.check_in.slice(0, 10) : "2026-09-20"}
                              </span>
                              {b.check_in && b.check_in.length > 11 && (
                                <span className="text-slate-500 font-normal">
                                  ({b.check_in.slice(11, 16)})
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                {stopsText}
                              </span>
                              {b.duration && (
                                <span>· {localizeDuration(b.duration, locale)}</span>
                              )}
                            </div>
                          </td>

                          {/* Passenger & Cabin */}
                          <td className="p-4 whitespace-nowrap">
                            <p className="font-bold text-slate-900">
                              {b.passenger_name || "—"}
                            </p>
                            <span className="inline-block mt-0.5 rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-900">
                              {cabinTitle}
                            </span>
                          </td>

                          {/* PNR Code */}
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-black text-amber-950 bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1">
                              {b.pnr || `#${b.id.slice(0, 8)}`}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-4 whitespace-nowrap">
                            <Badge className={cn("text-[11px] font-bold border", statusClass(b))}>
                              {localizeStatus(b, locale)}
                            </Badge>
                          </td>

                          {/* Price */}
                          <td className="p-4 whitespace-nowrap font-mono font-black text-slate-900 text-sm">
                            {formatPrice(b.price, b.currency)}
                          </td>

                          {/* Action Button */}
                          <td className="p-4 whitespace-nowrap text-center">
                            <Link
                              href={`/account/bookings/${b.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#280e46] hover:bg-[#391563] px-3.5 py-2 text-xs font-bold text-amber-300 border border-amber-400/30 shadow-sm transition-all cursor-pointer"
                            >
                              <Sliders size={13} className="text-amber-400" />
                              <span>{txt.manageBtn}</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* 2. PROFESSIONAL HOTELS TABLE */}
      {paginatedBookings.some((b) => b.service === "hotel") &&
        (filter === "all" || filter === "hotel") && (
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md">
            <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50/60 via-white to-amber-50/40 p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#280e46] text-amber-300 shadow-sm">
                  <Hotel size={15} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {txt.hotelTableTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {txt.hotelTableSubtitle}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 border border-purple-200 rounded-xl px-2.5 py-1">
                {filteredBookings.filter((b) => b.service === "hotel").length}{" "}
                {txt.hotelSuffix}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4 text-start whitespace-nowrap">{txt.colHotel}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colCity}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colDates}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colRoom}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colVoucher}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colStatus}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colTotal}</th>
                    <th className="p-4 text-center whitespace-nowrap">{txt.colManage}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {paginatedBookings
                    .filter((b) => b.service === "hotel")
                    .map((b) => {
                      const city = b.destination ? localizeRouteCity(b.destination, locale) : "";
                      const board = b.board_type ? localizeBoardType(b.board_type, locale) : "";
                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-purple-50/30 transition-colors"
                        >
                          {/* Hotel Name & Stars */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-900 border border-purple-200 shadow-sm">
                                <Hotel size={18} />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-xs">
                                  {b.hotel_name}
                                </p>
                                {b.hotel_stars ? (
                                  <div className="flex items-center gap-0.5 text-amber-500 text-[10px] mt-0.5 font-bold">
                                    {"★".repeat(Math.min(5, Math.round(b.hotel_stars)))}
                                    <span className="text-slate-500 ms-1 font-semibold">
                                      {b.hotel_stars} {txt.starsSuffix}
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          {/* City & Location */}
                          <td className="p-4 whitespace-nowrap">
                            <p className="font-bold text-slate-900 flex items-center gap-1">
                              <MapPin size={12} className="text-rose-500 shrink-0" />
                              <span>{city}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {b.hotel_address || (locale === "ar" ? "وسط المدينة" : "City Center")}
                            </p>
                          </td>

                          {/* Dates & Nights */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Calendar size={13} className="text-purple-700" />
                              <span>
                                {b.check_in?.slice(0, 10)} ➔ {b.check_out?.slice(0, 10)}
                              </span>
                            </div>
                            {b.nights ? (
                              <p className="text-[11px] text-purple-900 font-bold mt-1">
                                {b.nights} {txt.nightsStay}
                              </p>
                            ) : null}
                          </td>

                          {/* Room & Inclusions */}
                          <td className="p-4 whitespace-nowrap">
                            <p className="font-bold text-slate-900">
                              {b.room_name || "—"}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {board ? (
                                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  {board}
                                </span>
                              ) : null}
                              {b.free_cancellation && (
                                <span className="rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                                  {txt.freeCancel}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Confirmation / Voucher # */}
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-purple-950 bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1">
                              {b.pnr || `#${b.id.slice(0, 8)}`}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-4 whitespace-nowrap">
                            <Badge className={cn("text-[11px] font-bold border", statusClass(b))}>
                              {localizeStatus(b, locale)}
                            </Badge>
                          </td>

                          {/* Price */}
                          <td className="p-4 whitespace-nowrap font-mono font-black text-slate-900 text-sm">
                            {formatPrice(b.price, b.currency)}
                          </td>

                          {/* Action Button */}
                          <td className="p-4 whitespace-nowrap text-center">
                            <Link
                              href={`/account/bookings/${b.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#280e46] hover:bg-[#391563] px-3.5 py-2 text-xs font-bold text-amber-300 border border-amber-400/30 shadow-sm transition-all cursor-pointer"
                            >
                              <Sliders size={13} className="text-amber-400" />
                              <span>{txt.manageBtn}</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* 3. PROFESSIONAL TRANSFERS & CARS TABLE */}
      {paginatedBookings.some(
        (b) =>
          b.service === "car" ||
          b.service === "transfer" ||
          b.service === "tour" ||
          b.service === "package"
      ) &&
        (filter === "all" ||
          filter === "car" ||
          filter === "transfer" ||
          filter === "package") && (
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md">
            <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50/60 via-white to-amber-50/40 p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#280e46] text-amber-300 shadow-sm">
                  <Car size={15} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {txt.otherTableTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {txt.otherTableSubtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4 text-start whitespace-nowrap">{txt.colServiceType}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colVehicle}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colDateTime}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colBookingNo}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colStatus}</th>
                    <th className="p-4 text-start whitespace-nowrap">{txt.colTotal}</th>
                    <th className="p-4 text-center whitespace-nowrap">{txt.colManage}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {paginatedBookings
                    .filter(
                      (b) =>
                        b.service === "car" ||
                        b.service === "transfer" ||
                        b.service === "tour" ||
                        b.service === "package"
                    )
                    .map((b) => {
                      const serviceBadge =
                        b.service === "car"
                          ? txt.carRental
                          : b.service === "transfer"
                            ? txt.vipTransfer
                            : txt.tourPackage;
                      const routeOrCity = localizeRouteCity(
                        b.route || b.destination || "إسطنبول",
                        locale
                      );

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-purple-50/30 transition-colors"
                        >
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-bold text-purple-950 bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1 text-xs">
                              {serviceBadge}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <p className="font-bold text-slate-900">
                              {b.hotel_name || b.room_name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {routeOrCity}
                            </p>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <Clock size={12} className="text-purple-700" />
                              <span>{b.check_in?.slice(0, 16) || "2026-09-10"}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                              #{b.id.slice(0, 10)}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <Badge className={cn("text-[11px] font-bold border", statusClass(b))}>
                              {localizeStatus(b, locale)}
                            </Badge>
                          </td>
                          <td className="p-4 whitespace-nowrap font-mono font-black text-slate-900 text-sm">
                            {formatPrice(b.price, b.currency)}
                          </td>
                          <td className="p-4 whitespace-nowrap text-center">
                            <Link
                              href={`/account/bookings/${b.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#280e46] hover:bg-[#391563] px-3.5 py-2 text-xs font-bold text-amber-300 border border-amber-400/30 shadow-sm transition-all cursor-pointer"
                            >
                              <Sliders size={13} className="text-amber-400" />
                              <span>{txt.manageDetails}</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Pagination Bar (10 items per page) */}
      {filteredBookings.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
          <p className="text-xs font-bold text-slate-500">
            {txt.showing}{" "}
            <span className="text-slate-900 font-mono font-black">
              {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredBookings.length)}
            </span>{" "}
            {txt.of}{" "}
            <span className="text-purple-950 font-mono font-black">
              {filteredBookings.length}
            </span>{" "}
            {txt.bookingsSuffix}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              <span>{txt.prev}</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentPage(num)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-mono font-black transition-all cursor-pointer",
                  currentPage === num
                    ? "bg-[#280e46] text-amber-300 shadow-md border border-amber-400/40"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-purple-50"
                )}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <span>{txt.next}</span>
              {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
