import { promises as fs } from "fs";
import path from "path";
import { PHOTO } from "@/data/catalog-photos";
import {
  PRICE_ESTIMATE_AR,
  digitsWhatsApp,
  whatsappMeUrl,
} from "@/lib/sales-price-copy";
import type { SavedAiProgram } from "@/types/ai-program";
import type { SalesChatCard } from "@/types/sales-chat";

function cheapest(cards: SalesChatCard[], type: SalesChatCard["type"]): number {
  const prices = (cards || [])
    .filter((c) => c.type === type && Number(c.clientPrice) > 0)
    .map((c) => Number(c.clientPrice));
  return prices.length ? Math.min(...prices) : 0;
}

function looksRental(card: SalesChatCard): boolean {
  const blob = `${card.titleEn} ${card.titleAr} ${card.subtitleEn || ""} ${card.subtitleAr || ""}`.toLowerCase();
  return /rental|hire|بدون سائق|self.?drive|ekonomik|economy car/i.test(blob) && !/سائق|chauffeur|driver|vip/i.test(blob);
}

function looksChauffeur(card: SalesChatCard): boolean {
  const blob = `${card.titleEn} ${card.titleAr} ${card.subtitleEn || ""} ${card.subtitleAr || ""}`.toLowerCase();
  return /سائق|chauffeur|driver|private|vip|خاص/.test(blob);
}

export function liveSorted(cards: SalesChatCard[], type: SalesChatCard["type"]): SalesChatCard[] {
  return (cards || [])
    .filter((c) => c.type === type && (Number(c.clientPrice) > 0 || Boolean(c.image && c.href)))
    .sort((a, b) => (Number(a.clientPrice) || 999999) - (Number(b.clientPrice) || 999999));
}

export function programCost(cards: SalesChatCard[], days: number, currency = "USD") {
  const nights = Math.max(1, days - 1);
  const tourDays = Math.max(1, days);
  const hotels = liveSorted(cards, "hotel");
  const cars = liveSorted(cards, "car");
  const flight = cheapest(cards, "flight");
  const hotelCard = hotels[0];
  const hotel = hotelCard ? Math.round(Number(hotelCard.clientPrice)) : 0;
  const hotelNightly = hotelCard?.unitPrice || (nights ? Math.round(hotel / nights) : hotel);
  const liveTransfer = cheapest(cards, "transfer");
  const transferEstimated = liveTransfer <= 0;
  const transferOne = liveTransfer || 55;
  const transferRound = transferOne * 2;
  const chauffeur = cars.find(looksChauffeur);
  const rental = cars.find(looksRental) || cars.filter((c) => c !== chauffeur)[0];
  const privateEstimated = !chauffeur;
  const rentalEstimated = !rental;
  const privateCar = chauffeur
    ? Math.round(Number(chauffeur.clientPrice))
    : Math.round(95 * tourDays);
  const rentalCar = rental ? Math.round(Number(rental.clientPrice)) : Math.round(42 * tourDays);
  const tours = cheapest(cards, "package");
  const totalPrivate = flight + hotel + transferRound + privateCar + tours;
  const totalRental = flight + hotel + transferRound + rentalCar + tours;
  return {
    flight,
    hotel,
    hotelNightly,
    nights,
    transfer: transferOne,
    transferRound,
    privateCar,
    rentalCar,
    totalPrivate,
    totalRental,
    total: totalPrivate || totalRental || flight + hotel + transferRound,
    currency,
    transferEstimated,
    toursEstimated: tours <= 0,
    privateEstimated,
    rentalEstimated,
    tours,
  };
}

const GLOBAL_THEME_FALLBACKS: Record<string, string> = {
  nature: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  historical: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
  cultural: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
  cityscape: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
  shopping: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
  food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  attraction: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
};

const GLOBAL_CITY_COVERS: Record<string, string> = {
  trabzon: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  طرابزون: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  istanbul: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
  إسطنبول: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
  اسطنبول: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
  antalya: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  أنطاليا: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  cappadocia: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800",
  كابادوكيا: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800",
  rize: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  ريزا: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  sapanca: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
  سبانجا: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
  bursa: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  بورصة: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
};

export function getSafeAttractionFallback(kind?: string, city?: string): string {
  if (city) {
    const norm = city.toLowerCase().trim();
    for (const [k, cover] of Object.entries(GLOBAL_CITY_COVERS)) {
      if (norm.includes(k) || k.includes(norm)) return cover;
    }
  }
  const k = String(kind || "default").toLowerCase();
  return GLOBAL_THEME_FALLBACKS[k] || GLOBAL_THEME_FALLBACKS.default;
}

export type ProgramPdfModel = SavedAiProgram & {
  locale?: "ar" | "en" | "tr" | "fr";
  cards?: SalesChatCard[];
  whatsappNumber?: string;
  brandName?: string;
  logoDataUri?: string;
  fontDataUri?: string;
};

type PdfLocale = "ar" | "en" | "tr" | "fr";

const PDF_I18N: Record<PdfLocale, {
  isRtl: boolean;
  officialLicense: string;
  vipPackageBadge: string;
  flightBadge: string;
  hotelBadge: string;
  transferBadge: string;
  travelDates: string;
  travelers: string;
  flexibleDates: string;
  costStatementTitle: string;
  transparentPricesNote: string;
  flightCostItem: string;
  hotelCostItem: (nights: number) => string;
  transferCostItem: (days: number) => string;
  totalCostItem: string;
  pricePerQuote: string;
  flightsSectionTitle: string;
  flightsSectionSubtitle: string;
  flightConfirmedBadge: string;
  bookFlightBtn: string;
  flightNumberLabel: string;
  departure: string;
  arrival: string;
  directFlight: string;
  stopFlight: (n: number) => string;
  directConfirmed: string;
  baggageInfo: string;
  hotelsSectionTitle: string;
  hotelsSectionSubtitle: string;
  hotelVipBadge: string;
  breakfastIncluded: string;
  vipReception: string;
  freeCancellation: string;
  nightlyRate: string;
  stayTotal: string;
  bookHotelBtn: string;
  transferSectionTitle: string;
  transferSectionSubtitle: string;
  transferFleetBadge: string;
  transferTitle: string;
  transferDesc: string;
  confirmTransferBtn: string;
  itinerarySectionTitle: string;
  itinerarySectionSubtitle: (days: number) => string;
  dayLabel: (n: number) => string;
  stopsCount: (n: number) => string;
  defaultStopName: string;
  guaranteesTitle: string;
  driverPerk: string;
  supportPerk: string;
  whatsappCta: string;
  companyName: string;
  officialSite: string;
}> = {
  ar: {
    isRtl: true,
    officialLicense: "شركة لوناليزا للسياحة والسفر الرسمية — ترخيص سياحي TÜRSAB Class A — رقم: 13128",
    vipPackageBadge: "★ باقة VIP متكاملة",
    flightBadge: "طيران",
    hotelBadge: "فنادق 5 نجوم",
    transferBadge: "سيارة خاصة VIP",
    travelDates: "تواريخ السفر:",
    travelers: "عدد المسافرين: مسافران (شخصين)",
    flexibleDates: "مواعيد سياحية مرنة حسب اختيار العميل",
    costStatementTitle: "بيان التكلفة الشامل المعتمد للباقة السياحية",
    transparentPricesNote: "أسعار نهائية شفافة بدون أي رسوم خفية",
    flightCostItem: "تذاكر الطيران المباشر المعتمدة (ذهاب وعودة لشخصين)",
    hotelCostItem: (n) => `الإقامة الفندقية الفاخرة (5 نجوم شاملة وجبة الإفطار لـ ${n} ليالٍ)`,
    transferCostItem: (d) => `جولات سيارة مرسيدس فيتو VIP خاصة مع سائق واستقبال المطار (${d} أيام)`,
    totalCostItem: "إجمالي تكلفة الباقة الشاملة المعتمدة",
    pricePerQuote: "حسب تاريخ الحجز",
    flightsSectionTitle: "✈️ تذاكر وخيارات الطيران المعتمدة للرحلة",
    flightsSectionSubtitle: "عروض مؤكدة قابلة للحجز الفوري",
    flightConfirmedBadge: "تذكرة سفر مؤكدة",
    bookFlightBtn: "احجز التذكرة عبر المنصة ←",
    flightNumberLabel: "رقم الرحلة:",
    departure: "المغادرة",
    arrival: "الوصول",
    directFlight: "رحلة مباشرة بدون توقف",
    stopFlight: (n) => `${n} توقف`,
    directConfirmed: "رحلة مباشرة مؤكدة",
    baggageInfo: "أمتعة 20 كجم + حقيبة يد",
    hotelsSectionTitle: "🏨 فنادق الإقامة الفاخرة المعتمدة (5 نجوم)",
    hotelsSectionSubtitle: "خيارات VIP راقية مع إفطار بوفيه مفتوح",
    hotelVipBadge: "إقامة 5 نجوم VIP",
    breakfastIncluded: "✓ بوفيه إفطار فاخر مشمول",
    vipReception: "✓ خدمة استقبال VIP 24/7",
    freeCancellation: "✓ إلغاء واسترداد مرن",
    nightlyRate: "سعر الليلة",
    stayTotal: "الإجمالي:",
    bookHotelBtn: "احجز الفندق عبر المنصة ←",
    transferSectionTitle: "🚐 خدمة النقل والجولات بسيارة مرسيدس فيتو VIP خاصة",
    transferSectionSubtitle: "سائق خاص يتحدث العربية طوال الرحلة",
    transferFleetBadge: "أسطول لوناليزا VIP",
    transferTitle: "مرسيدس فيتو VIP مع سائق خاص يتحدث العربية",
    transferDesc: "سيارة مرسيدس فيتو VIP مجهزة بمقاعد جلدية فاخرة، شاشات ترفيه، واي فاي مجاني، وتشمل استقبال وتوديع المطار، الوقود، ورسوم الطرق السريعة للجولات اليومية بمرونة وخصوصية تامة.",
    confirmTransferBtn: "تأكيد خدمة النقل الخاص عبر المنصة ←",
    itinerarySectionTitle: "📍 المسار السياحي اليومي والمزارات المصورة",
    itinerarySectionSubtitle: (d) => `${d} أيام منظمة بعناية`,
    dayLabel: (n) => `اليوم ${n}`,
    stopsCount: (n) => `${n} محطات ومعالم سياحية`,
    defaultStopName: "معلم سياحي",
    guaranteesTitle: "✨ مميزات وضمانات الباقة مع لوناليزا للسياحة والسفر:",
    driverPerk: "سائق مرخص يتحدث العربية مع إلمام كامل بجميع المعالم",
    supportPerk: "دعم سياحي واستشارات على مدار الساعة عبر الواتساب",
    whatsappCta: "تواصل معنا عبر الواتساب:",
    companyName: "شركة لوناليزا للسياحة والسفر المحدودة",
    officialSite: "موقع رسمي: lonaliza.com",
  },
  en: {
    isRtl: false,
    officialLicense: "Lonaliza Travel & Tourism Official Agency — TÜRSAB Class A License No: 13128",
    vipPackageBadge: "★ All-Inclusive VIP Package",
    flightBadge: "Flights",
    hotelBadge: "5-Star Hotels",
    transferBadge: "VIP Private Car",
    travelDates: "Travel Dates:",
    travelers: "Travelers: 2 Guests",
    flexibleDates: "Flexible travel dates tailored to your schedule",
    costStatementTitle: "Official Itemized Package Cost Statement",
    transparentPricesNote: "Transparent final pricing with no hidden fees",
    flightCostItem: "Confirmed Direct Round-Trip Flight Tickets (2 Guests)",
    hotelCostItem: (n) => `Luxury 5-Star Hotel Stay with Breakfast Included (${n} Nights)`,
    transferCostItem: (d) => `VIP Mercedes Vito Private Chauffeur & Airport Transfers (${d} Days)`,
    totalCostItem: "Total Confirmed All-Inclusive Package Cost",
    pricePerQuote: "Subject to booking dates",
    flightsSectionTitle: "✈️ Confirmed Flight Tickets & Schedule",
    flightsSectionSubtitle: "Instant booking confirmed airline offers",
    flightConfirmedBadge: "Confirmed Flight Ticket",
    bookFlightBtn: "Book Ticket on Platform →",
    flightNumberLabel: "Flight No:",
    departure: "Departure",
    arrival: "Arrival",
    directFlight: "Non-stop Direct Flight",
    stopFlight: (n) => `${n} Stop(s)`,
    directConfirmed: "Confirmed Direct Flight",
    baggageInfo: "20kg Baggage + Hand Luggage",
    hotelsSectionTitle: "🏨 Confirmed Luxury 5-Star Accommodations",
    hotelsSectionSubtitle: "Elite VIP properties with open buffet breakfast",
    hotelVipBadge: "5-Star VIP Stay",
    breakfastIncluded: "✓ Premium Buffet Breakfast Included",
    vipReception: "✓ 24/7 VIP Concierge & Reception",
    freeCancellation: "✓ Flexible Cancellation & Refund",
    nightlyRate: "Per Night",
    stayTotal: "Total:",
    bookHotelBtn: "Book Hotel on Platform →",
    transferSectionTitle: "🚐 Mercedes-Benz Vito VIP Private Chauffeur Service",
    transferSectionSubtitle: "Dedicated English-speaking private driver throughout your stay",
    transferFleetBadge: "Lonaliza VIP Fleet",
    transferTitle: "Mercedes Vito VIP with Dedicated Private Chauffeur",
    transferDesc: "Luxury Mercedes Vito equipped with plush leather reclining seats, entertainment screens, complimentary high-speed Wi-Fi, full airport meet & greet, fuel, and highway tolls for complete comfort and privacy.",
    confirmTransferBtn: "Confirm Private Transfer on Platform →",
    itinerarySectionTitle: "📍 Day-by-Day Illustrated Sightseeing Itinerary",
    itinerarySectionSubtitle: (d) => `${d} Carefully Curated Days`,
    dayLabel: (n) => `Day ${n}`,
    stopsCount: (n) => `${n} Highlights & Landmarks`,
    defaultStopName: "Sightseeing Landmark",
    guaranteesTitle: "✨ Package Highlights & Lonaliza Travel Guarantees:",
    driverPerk: "Licensed dedicated professional chauffeur with expert destination knowledge",
    supportPerk: "24/7 VIP travel advisor support via WhatsApp",
    whatsappCta: "Contact Us on WhatsApp:",
    companyName: "Lonaliza Travel & Tourism Co. Ltd.",
    officialSite: "Official Site: lonaliza.com",
  },
  tr: {
    isRtl: false,
    officialLicense: "Lonaliza Turizm ve Seyahat Acentesi — TÜRSAB A Grubu Belge No: 13128",
    vipPackageBadge: "★ Kapsamlı VIP Paket",
    flightBadge: "Uçuşlar",
    hotelBadge: "5 Yıldızlı Oteller",
    transferBadge: "VIP Özel Araç",
    travelDates: "Seyahat Tarihleri:",
    travelers: "Yolcular: 2 Kişi",
    flexibleDates: "Müşteri tercihine göre esnek seyahat tarihleri",
    costStatementTitle: "Resmi Onaylı Paket Maliyet Tablosu",
    transparentPricesNote: "Gizli ücret içermeyen şeffaf net fiyatlar",
    flightCostItem: "Onaylı Direkt Gidiş-Dönüş Uçak Biletleri (2 Kişi)",
    hotelCostItem: (n) => `Lüks 5 Yıldızlı Otel Konaklaması (Kahvaltı Dahil, ${n} Gece)`,
    transferCostItem: (d) => `VIP Mercedes Vito Özel Şoförlü Tur ve Havalimanı Karşılama (${d} Gün)`,
    totalCostItem: "Toplam Onaylı Kapsamlı Paket Ücreti",
    pricePerQuote: "Rezervasyon tarihine bağlı",
    flightsSectionTitle: "✈️ Seyahat İçin Onaylı Uçuş Seçenekleri",
    flightsSectionSubtitle: "Anında rezervasyona açık kesin teklifler",
    flightConfirmedBadge: "Onaylı Uçak Bileti",
    bookFlightBtn: "Platformdan Bilet Al →",
    flightNumberLabel: "Uçuş No:",
    departure: "Kalkış",
    arrival: "Varış",
    directFlight: "Aktarmasız Direkt Uçuş",
    stopFlight: (n) => `${n} Aktarma`,
    directConfirmed: "Onaylı Direkt Uçuş",
    baggageInfo: "20 kg Bagaj + El Bagajı",
    hotelsSectionTitle: "🏨 Onaylı 5 Yıldızlı Lüks Konaklama Otelleri",
    hotelsSectionSubtitle: "Açık büfe kahvaltı dahil seçkin VIP oteller",
    hotelVipBadge: "5 Yıldızlı VIP Konaklama",
    breakfastIncluded: "✓ Zengin Açık Büfe Kahvaltı Dahil",
    vipReception: "✓ 7/24 VIP Karşılama ve Destek",
    freeCancellation: "✓ Esnek İptal ve İade İmkanı",
    nightlyRate: "Gecelik Fiyat",
    stayTotal: "Toplam:",
    bookHotelBtn: "Platformdan Oteli Ayırt →",
    transferSectionTitle: "🚐 Mercedes-Benz Vito VIP Özel Şoför Hizmeti",
    transferSectionSubtitle: "Tüm gezi boyunca özel tahsisli şoför",
    transferFleetBadge: "Lonaliza VIP Filo",
    transferTitle: "Özel Şoförlü VIP Mercedes Vito",
    transferDesc: "Lüks deri koltuklar, multimedya eğlence ekranları, ücretsiz yüksek hızlı Wi-Fi, havalimanı karşılama-uğurlama, yakıt ve otoyol ücretleri dahil maksimum konfor ve mahremiyet.",
    confirmTransferBtn: "Özel Transferi Platformdan Onayla →",
    itinerarySectionTitle: "📍 Günlük Gezi Planı ve Fotoğraflı Duraklar",
    itinerarySectionSubtitle: (d) => `${d} Günlük Özenle Hazırlanmış Rota`,
    dayLabel: (n) => `Gün ${n}`,
    stopsCount: (n) => `${n} Önemli Gezi Noktası`,
    defaultStopName: "Turistik Cazibe Merkezi",
    guaranteesTitle: "✨ Lonaliza Turizm Paket Avantajları ve Güvenceleri:",
    driverPerk: "Tüm tarihi ve turistik rotalara hakim lisanslı profesyonel şoför",
    supportPerk: "WhatsApp üzerinden 7/24 kesintisiz seyahat danışmanlığı",
    whatsappCta: "WhatsApp ile İletişime Geçin:",
    companyName: "Lonaliza Seyahat ve Turizm Ltd. Şti.",
    officialSite: "Resmi Web Sitesi: lonaliza.com",
  },
  fr: {
    isRtl: false,
    officialLicense: "Agence Officielle Lonaliza Voyages — Licence TÜRSAB Classe A N°: 13128",
    vipPackageBadge: "★ Forfait VIP Tout Compris",
    flightBadge: "Vols",
    hotelBadge: "Hôtels 5 Étoiles",
    transferBadge: "Véhicule Privé VIP",
    travelDates: "Dates de Voyage:",
    travelers: "Voyageurs: 2 Personnes",
    flexibleDates: "Dates de voyage flexibles selon vos préférences",
    costStatementTitle: "Relevé Officiel du Coût Total du Séjour",
    transparentPricesNote: "Tarifs transparents sans frais cachés",
    flightCostItem: "Billets d'Avion Directs Aller-Retour Confirmés (2 Personnes)",
    hotelCostItem: (n) => `Hébergement de Luxe 5 Étoiles avec Petit-Déjeuner (${n} Nuits)`,
    transferCostItem: (d) => `Excursions Privées Mercedes Vito avec Chauffeur et Accueil Aéroport (${d} Jours)`,
    totalCostItem: "Coût Total Confirmé du Forfait Clé en Main",
    pricePerQuote: "Selon les dates de réservation",
    flightsSectionTitle: "✈️ Billets et Vols Confirmés pour le Séjour",
    flightsSectionSubtitle: "Offres garanties prêtes pour réservation immédiate",
    flightConfirmedBadge: "Billet Confirmé",
    bookFlightBtn: "Réserver sur la Plateforme →",
    flightNumberLabel: "Vol N°:",
    departure: "Départ",
    arrival: "Arrivée",
    directFlight: "Vol Direct Sans Escale",
    stopFlight: (n) => `${n} Escale(s)`,
    directConfirmed: "Vol Direct Garanti",
    baggageInfo: "Bagage 20 kg + Bagage Cabine",
    hotelsSectionTitle: "🏨 Hôtels de Luxe 5 Étoiles Sélectionnés",
    hotelsSectionSubtitle: "Options VIP raffinées avec petit-déjeuner buffet complet",
    hotelVipBadge: "Séjour 5 Étoiles VIP",
    breakfastIncluded: "✓ Petit-Déjeuner Buffet Inclus",
    vipReception: "✓ Conciergerie & Accueil VIP 24h/24",
    freeCancellation: "✓ Annulation et Remboursement Flexibles",
    nightlyRate: "Par Nuit",
    stayTotal: "Total:",
    bookHotelBtn: "Réserver l'Hôtel sur la Plateforme →",
    transferSectionTitle: "🚐 Chauffeur Privé VIP en Mercedes-Benz Vito",
    transferSectionSubtitle: "Chauffeur dédié tout au long du séjour",
    transferFleetBadge: "Flotte Lonaliza VIP",
    transferTitle: "Mercedes Vito VIP avec Chauffeur Privé Dédié",
    transferDesc: "Mercedes Vito VIP tout confort avec sièges en cuir inclinables, écrans multimédia, Wi-Fi gratuit, accueil personnalisé à l'aéroport, carburant et péages inclus pour une intimité et sérénité absolues.",
    confirmTransferBtn: "Confirmer le Chauffeur sur la Plateforme →",
    itinerarySectionTitle: "📍 Programme Quotidien et Lieux Illustrés",
    itinerarySectionSubtitle: (d) => `${d} Jours Organisés avec Précision`,
    dayLabel: (n) => `Jour ${n}`,
    stopsCount: (n) => `${n} Points d'Intérêt Touristiques`,
    defaultStopName: "Site Touristique",
    guaranteesTitle: "✨ Garanties et Avantages Lonaliza Voyages:",
    driverPerk: "Chauffeur professionnel agréé avec maîtrise parfaite des sites touristiques",
    supportPerk: "Assistance et conciergerie VIP 24h/24 via WhatsApp",
    whatsappCta: "Contactez-nous via WhatsApp:",
    companyName: "Lonaliza Voyages & Tourisme SARL",
    officialSite: "Site Officiel: lonaliza.com",
  }
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(raw: unknown): string {
  const url = String(raw || "").trim();
  if (!url) return "";
  if (url.startsWith("data:image/")) return url;
  if (/^https?:\/\//i.test(url) && !/^https?:\/\/javascript/i.test(url)) {
    return url;
  }
  return "";
}

function toAbsoluteUrl(href?: string): string {
  if (!href) return "https://lonaliza.com";
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  return `https://lonaliza.com${href.startsWith("/") ? "" : "/"}${href}`;
}

function money(amount: number): string {
  const n = Math.round(Number(amount) || 0);
  return `${n.toLocaleString("en-US")} $USD`;
}

function coverFor(program: SavedAiProgram): string {
  const thumb = safeUrl(program.thumbnail);
  if (thumb) return thumb;
  const d = `${program.destination} ${program.titleEn} ${program.titleAr}`.toLowerCase();
  if (/antalya|أنطاليا|belek|kemer|lara/.test(d)) return PHOTO.antalyaCoast;
  if (/trabzon|طرابزون|ayder|uzungol|أوزنجول/.test(d)) return PHOTO.alpineLake;
  if (/cappadocia|kapadokya|كابادوكيا/.test(d)) return PHOTO.cappadociaBalloons;
  if (/istanbul|إسطنبول|اسطنبول/.test(d)) return PHOTO.istanbulSkyline;
  if (/sapanca|سبانجا/.test(d)) return PHOTO.forest;
  return getSafeAttractionFallback("default", program.destination);
}

export async function loadPdfAssets(): Promise<{
  fontDataUri: string;
  logoDataUri: string;
}> {
  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoNaskhArabic-Regular.ttf"
  );
  let fontDataUri = "";
  try {
    const fontBuf = await fs.readFile(fontPath);
    fontDataUri = `data:font/ttf;base64,${fontBuf.toString("base64")}`;
  } catch {
    /* fallback to system font */
  }

  const logoCandidates = [
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "public", "brand-logo.png"),
    path.join(process.cwd(), "public", "lonaliza-logo.png"),
  ];
  let logoDataUri = "";
  for (const candidate of logoCandidates) {
    try {
      const buf = await fs.readFile(candidate);
      logoDataUri = `data:image/png;base64,${buf.toString("base64")}`;
      break;
    } catch {
      /* try next */
    }
  }
  return { fontDataUri, logoDataUri };
}

export function renderProgramHtml(model: ProgramPdfModel): string {
  const loc: PdfLocale =
    model.locale === "en" || model.locale === "tr" || model.locale === "fr"
      ? model.locale
      : "ar";
  const t = PDF_I18N[loc];
  const isRtl = t.isRtl;

  const brand = esc(model.brandName || (isRtl ? "لوناليزا للسياحة والسفر VIP" : "Lonaliza Travel VIP"));
  const title = esc(isRtl ? (model.titleAr || model.titleEn) : (model.titleEn || model.titleAr));
  const dest = esc(model.destination);
  const cover = coverFor(model);

  const rawIncludes =
    loc === "ar"
      ? (Array.isArray(model.includesAr) && model.includesAr.length ? model.includesAr : model.includesEn)
      : (Array.isArray(model.includesEn) && model.includesEn.length ? model.includesEn : model.includesAr);
  const includes = (Array.isArray(rawIncludes) ? rawIncludes : [])
    .map((item) => esc(item))
    .filter(Boolean);

  const daysCount = (model as { durationDays?: number }).durationDays || days.length || (model.nights ? model.nights + 1 : 5);
  const nightsCount = model.nights || Math.max(1, daysCount - 1);
  const rawCards = Array.isArray(model.cards) ? model.cards : [];

  // Group cards cleanly
  const flights = liveSorted(rawCards, "flight");
  const hotels = liveSorted(rawCards, "hotel");
  const cost = programCost(rawCards, daysCount, "USD");

  const wa = digitsWhatsApp(model.whatsappNumber || "905444486363");
  const waUrl = whatsappMeUrl(wa);
  const dates =
    model.arrivalDate || model.departureDate
      ? `${model.arrivalDate || "—"} ← ${model.departureDate || "—"}`
      : t.flexibleDates;

  const dateLocaleMap: Record<PdfLocale, string> = {
    ar: "ar-SA",
    en: "en-US",
    tr: "tr-TR",
    fr: "fr-FR",
  };
  const generatedDate = new Date().toLocaleDateString(dateLocaleMap[loc] || "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Financial calculation table
  const flightCostStr = cost.flight > 0 ? money(cost.flight) : t.pricePerQuote;
  const hotelCostStr = cost.hotel > 0 ? money(cost.hotel) : money(140 * nightsCount);
  const transferCostStr = cost.privateCar > 0 ? money(cost.privateCar) : money(95 * daysCount);
  const totalCost = cost.totalPrivate || cost.total || (cost.flight + cost.hotel + cost.privateCar);
  const totalCostStr = totalCost > 0 ? money(totalCost) : money(650);

  // Render Features & Includes
  const includeItemsHtml = includes
    .slice(0, 6)
    .map(
      (item) =>
        `<div class="include-badge"><span class="check-icon">✓</span><span>${item}</span></div>`
    )
    .join("");

  // Top 2-3 Flight Boarding Passes
  const topFlights = flights.slice(0, 3);
  const flightPassesHtml = topFlights.length
    ? topFlights
        .map((f, idx) => {
          const airline = esc(f.airline || (isRtl ? (f.titleAr || f.titleEn) : (f.titleEn || f.titleAr)) || "Turkish Airlines");
          const fnum = esc(f.flightNumber || `LN-${100 + idx}`);
          const from = esc(f.fromIata || (isRtl ? "الرياض" : "RUH"));
          const to = esc(f.toIata || dest);
          const departTime = f.departAt ? f.departAt.slice(11, 16) : "14:30";
          const arriveTime = f.arriveAt ? f.arriveAt.slice(11, 16) : "18:45";
          const directText =
            typeof f.stopCount === "number"
              ? f.stopCount === 0
                ? t.directFlight
                : t.stopFlight(f.stopCount)
              : t.directConfirmed;
          const flightPrice = f.clientPrice ? money(f.clientPrice) : (isRtl ? "مشمول بالباقة" : "Package Included");
          const bookUrl = toAbsoluteUrl(f.href || `/flights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

          return `
          <div class="ticket-card">
            <div class="ticket-stub">
              <div class="ticket-badge">${t.flightConfirmedBadge}</div>
              <div class="ticket-price">${flightPrice}</div>
              <a href="${bookUrl}" class="ticket-btn" target="_blank">${t.bookFlightBtn}</a>
            </div>
            <div class="ticket-main">
              <div class="ticket-header">
                <div class="airline-brand">
                  <span class="airline-icon">✈</span>
                  <span class="airline-name">${airline}</span>
                </div>
                <div class="flight-no">${t.flightNumberLabel} <strong>${fnum}</strong></div>
              </div>
              <div class="flight-route-row">
                <div class="station">
                  <div class="station-code">${from}</div>
                  <div class="station-time">${departTime}</div>
                  <div class="station-label">${t.departure}</div>
                </div>
                <div class="flight-path">
                  <span class="path-type">${directText}</span>
                  <div class="path-line">
                    <span class="path-plane">✈</span>
                  </div>
                  <span class="path-info">${t.baggageInfo}</span>
                </div>
                <div class="station">
                  <div class="station-code">${to}</div>
                  <div class="station-time">${arriveTime}</div>
                  <div class="station-label">${t.arrival}</div>
                </div>
              </div>
            </div>
          </div>`;
        })
        .join("")
    : `<div class="empty-notice">${isRtl ? "يتم تأكيد جداول الطيران المباشر فور تحديد التواريخ." : "Flight schedules confirmed upon booking dates."}</div>`;

  // Top 2-3 Hotel Showcase
  const topHotels = hotels.slice(0, 3);
  const hotelsHtml = topHotels.length
    ? topHotels
        .map((h) => {
          const hName = esc(isRtl ? (h.titleAr || h.titleEn) : (h.titleEn || h.titleAr));
          const hArea = esc(isRtl ? (h.subtitleAr || h.subtitleEn || dest) : (h.subtitleEn || h.subtitleAr || dest));
          const hImg = safeUrl(h.image) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
          const hStars = "★".repeat(h.stars || 5);
          const nightlyRate = h.unitPrice ? `${money(h.unitPrice)} / ${t.nightlyRate}` : (isRtl ? "سعر الإقامة مشمول" : "Stay included");
          const stayTotal = h.clientPrice ? money(h.clientPrice) : `${money(h.unitPrice ? h.unitPrice * nightsCount : 600)}`;
          const roomType = esc(
            h.roomName ||
            (isRtl ? "غرفة ديلوكس فاخرة مع إفطار بوفيه مفتوح" : "Deluxe Luxury Room with Open Buffet Breakfast")
          );
          const bookUrl = toAbsoluteUrl(h.href || `/hotels?q=${encodeURIComponent(dest)}`);

          return `
          <div class="hotel-card">
            <div class="hotel-img-box">
              <img src="${esc(hImg)}" alt="" class="hotel-img" />
              <div class="hotel-stars">${hStars}</div>
            </div>
            <div class="hotel-info">
              <div class="hotel-meta">
                <span class="hotel-badge">${t.hotelVipBadge}</span>
                <span class="hotel-area">📍 ${hArea}</span>
              </div>
              <h4 class="hotel-title">${hName}</h4>
              <p class="hotel-room">🛏️ ${roomType}</p>
              <div class="hotel-features">
                <span>${t.breakfastIncluded}</span>
                <span>${t.vipReception}</span>
                <span>${t.freeCancellation}</span>
              </div>
              <div class="hotel-bottom">
                <div class="hotel-pricing">
                  <span class="nightly-rate">${nightlyRate}</span>
                  <span class="stay-total">${t.stayTotal} <strong>${stayTotal}</strong></span>
                </div>
                <a href="${bookUrl}" class="hotel-btn" target="_blank">${t.bookHotelBtn}</a>
              </div>
            </div>
          </div>`;
        })
        .join("")
    : `<div class="empty-notice">${isRtl ? "يتم تأكيد أفضل عروض الفنادق الفاخرة فور تأكيد تواريخ السفر." : "Luxury hotel options confirmed upon booking dates."}</div>`;

  // Day by Day Sightseeing Stops
  const daysHtml = days
    .map((day, idx) => {
      const dayNum = esc(day.day || idx + 1);
      const dayTitle = esc(isRtl ? (day.titleAr || day.titleEn || t.dayLabel(Number(dayNum))) : (day.titleEn || day.titleAr || t.dayLabel(Number(dayNum))));
      const detail = esc(isRtl ? (day.detailAr || day.detailEn || "") : (day.detailEn || day.detailAr || ""));
      const dayAny = day as { stops?: Array<{ titleAr?: string; titleEn?: string; nameAr?: string; nameEn?: string; labelAr?: string; labelEn?: string; image?: string }> };
      const rawStops = (dayAny.stops && dayAny.stops.length) ? dayAny.stops : (day.items || []);
      const stopsHtml = rawStops
        .slice(0, 4)
        .map((s: { titleAr?: string; titleEn?: string; nameAr?: string; nameEn?: string; labelAr?: string; labelEn?: string; image?: string }) => {
          const sName = esc(isRtl ? (s.titleAr || s.nameAr || s.labelAr || s.titleEn || s.nameEn || s.labelEn || t.defaultStopName) : (s.titleEn || s.nameEn || s.labelEn || s.titleAr || s.nameAr || t.defaultStopName));
          const sImg = safeUrl(s.image) || getSafeAttractionFallback("landmark", dest);
          return `
          <div class="stop-box">
            <img src="${esc(sImg)}" alt="" class="stop-img" />
            <div class="stop-name">${sName}</div>
          </div>`;
        })
        .join("");

      return `
      <div class="day-section">
        <div class="day-head">
          <div class="day-circle">${t.dayLabel(Number(dayNum))}</div>
          <div class="day-head-info">
            <h4 class="day-head-title">${dayTitle}</h4>
            <span class="day-head-count">${t.stopsCount(rawStops.length)}</span>
          </div>
        </div>
        ${detail ? `<p class="day-description">${detail}</p>` : ""}
        ${stopsHtml ? `<div class="stops-grid">${stopsHtml}</div>` : ""}
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="${loc}" dir="${isRtl ? "rtl" : "ltr"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${brand}</title>
  <style>
    @font-face {
      font-family: "Noto Naskh Arabic";
      src: url("${model.fontDataUri || ""}") format("truetype");
      font-weight: 400 700;
      font-style: normal;
      font-display: block;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+0000-00FF;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: #1A1438;
      font-family: ${isRtl ? '"Noto Naskh Arabic", Tahoma, Arial, sans-serif' : 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'};
      direction: ${isRtl ? "rtl" : "ltr"};
      text-align: ${isRtl ? "right" : "left"};
      -webkit-font-smoothing: antialiased;
    }
    body { font-size: 13px; line-height: 1.7; }
    .page { width: 100%; max-width: 820px; margin: 0 auto; padding: 22px 26px; }

    /* Top Branding Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #EDE9FE;
      padding-bottom: 16px;
      margin-bottom: 18px;
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      height: 44px;
      width: auto;
      object-fit: contain;
    }
    .brand-text {
      font-size: 20px;
      font-weight: 900;
      color: #1E0B4B;
      letter-spacing: -0.3px;
    }
    .agency-badge {
      text-align: ${isRtl ? "left" : "right"};
      font-size: 11px;
      color: #64748B;
      line-height: 1.4;
    }
    .agency-title {
      font-weight: 900;
      color: #7C3AED;
      font-size: 12px;
    }

    /* Hero Cover */
    .hero {
      position: relative;
      height: 250px;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 20px;
      box-shadow: 0 12px 30px -12px rgba(46,16,101,0.3);
    }
    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(30,11,75,0.92) 0%, rgba(30,11,75,0.45) 60%, transparent 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 22px 26px;
      color: #FFFFFF;
    }
    .hero-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
    }
    .hero-pill {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .hero-pill-gold {
      background: #F59E0B;
      color: #1E0B4B;
      border: none;
      font-weight: 900;
    }
    .hero-title {
      font-size: 24px;
      font-weight: 900;
      margin: 0 0 8px;
      line-height: 1.3;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      opacity: 0.95;
    }

    /* Financial Breakdown Table */
    .financial-card {
      background: #1E0B4B;
      color: #FFFFFF;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 22px;
      box-shadow: 0 8px 24px -6px rgba(30,11,75,0.4);
    }
    .financial-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.15);
      padding-bottom: 8px;
    }
    .financial-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .financial-table tr td:first-child {
      text-align: ${isRtl ? "right" : "left"};
      padding: 6px 0;
      opacity: 0.92;
    }
    .financial-table tr td:last-child {
      text-align: ${isRtl ? "left" : "right"};
      font-weight: 900;
      font-family: monospace;
      font-size: 13px;
      color: #FBBF24;
    }
    .financial-table tr.total-row td {
      border-top: 1px dashed rgba(255,255,255,0.25);
      padding-top: 10px;
      font-size: 15px;
      font-weight: 900;
      color: #FFFFFF;
    }
    .financial-table tr.total-row td:last-child {
      font-size: 20px;
      color: #FBBF24;
    }

    /* Section Headers */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px solid #EDE9FE;
      padding-bottom: 8px;
      margin: 22px 0 14px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 900;
      color: #1E0B4B;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-sub {
      font-size: 12px;
      color: #7C3AED;
      font-weight: 700;
    }

    /* Boarding Pass Flight Cards */
    .ticket-card {
      display: flex;
      background: #FAFAFD;
      border: 1.5px solid #E9D5FF;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 14px;
      page-break-inside: avoid;
      box-shadow: 0 4px 14px -6px rgba(124,58,237,0.1);
    }
    .ticket-stub {
      width: 170px;
      background: #F3E8FF;
      border-inline-end: 2px dashed #D8B4FE;
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 6px;
    }
    .ticket-badge {
      font-size: 10px;
      font-weight: 800;
      color: #6D28D9;
      background: #FFFFFF;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .ticket-price {
      font-size: 18px;
      font-weight: 900;
      color: #1E0B4B;
      font-family: monospace;
    }
    .ticket-btn, .hotel-btn, .action-btn {
      display: inline-block;
      text-decoration: none;
      background: #7C3AED;
      color: #FFFFFF !important;
      font-size: 11px;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: 8px;
      text-align: center;
      margin-top: 4px;
    }
    .ticket-main {
      flex: 1;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .ticket-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .airline-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 900;
      color: #1E0B4B;
    }
    .airline-icon {
      color: #7C3AED;
      font-size: 15px;
    }
    .flight-no {
      font-size: 11px;
      color: #64748B;
    }
    .flight-route-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .station {
      text-align: center;
      min-width: 65px;
    }
    .station-code {
      font-size: 18px;
      font-weight: 900;
      color: #1E0B4B;
    }
    .station-time {
      font-size: 14px;
      font-weight: 800;
      color: #7C3AED;
      font-family: monospace;
    }
    .station-label {
      font-size: 10px;
      color: #64748B;
    }
    .flight-path {
      flex: 1;
      text-align: center;
    }
    .path-type {
      font-size: 10px;
      font-weight: 800;
      color: #059669;
    }
    .path-line {
      position: relative;
      height: 2px;
      background: #D8B4FE;
      margin: 6px 0;
    }
    .path-plane {
      position: absolute;
      top: -8px;
      left: 50%;
      margin-left: -6px;
      font-size: 12px;
      color: #7C3AED;
      transform: ${isRtl ? "rotate(180deg)" : "rotate(0deg)"};
    }
    .path-info {
      font-size: 10px;
      color: #64748B;
    }

    /* Luxury Hotel Cards */
    .hotel-card {
      display: flex;
      background: #FFFFFF;
      border: 1.5px solid #EDE9FE;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 14px;
      page-break-inside: avoid;
      box-shadow: 0 4px 14px -6px rgba(30,11,75,0.06);
    }
    .hotel-img-box {
      width: 200px;
      position: relative;
      overflow: hidden;
    }
    .hotel-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .hotel-stars {
      position: absolute;
      bottom: 6px;
      right: 6px;
      background: rgba(30,11,75,0.85);
      color: #F59E0B;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 10px;
      letter-spacing: 1px;
    }
    .hotel-info {
      flex: 1;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .hotel-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .hotel-badge {
      background: #F3E8FF;
      color: #6D28D9;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .hotel-area {
      font-size: 11px;
      color: #64748B;
    }
    .hotel-title {
      font-size: 16px;
      font-weight: 900;
      color: #1E0B4B;
      margin: 2px 0 4px;
    }
    .hotel-room {
      font-size: 11px;
      color: #475569;
      margin: 0 0 8px;
    }
    .hotel-features {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 10px;
      font-weight: 700;
      color: #059669;
      margin-bottom: 8px;
    }
    .hotel-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #F1F5F9;
      padding-top: 8px;
    }
    .hotel-pricing {
      display: flex;
      flex-direction: column;
    }
    .nightly-rate {
      font-size: 11px;
      color: #64748B;
    }
    .stay-total {
      font-size: 13px;
      color: #1E0B4B;
    }
    .stay-total strong {
      color: #7C3AED;
      font-size: 15px;
      font-family: monospace;
    }

    /* Mercedes Vito VIP Card */
    .vito-card {
      background: #FFFBEB;
      border: 1.5px solid #FDE68A;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .vito-img {
      width: 170px;
      height: 115px;
      object-fit: cover;
      border-radius: 10px;
    }
    .vito-info {
      flex: 1;
    }
    .vito-badge {
      background: #D97706;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .vito-title {
      font-size: 15px;
      font-weight: 900;
      color: #78350F;
      margin: 4px 0;
    }
    .vito-desc {
      font-size: 11px;
      color: #92400E;
      line-height: 1.6;
      margin: 0 0 6px;
    }

    /* Day by Day Sections */
    .day-section {
      background: #FFFFFF;
      border: 1.5px solid #EDE9FE;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .day-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .day-circle {
      background: #7C3AED;
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 900;
      padding: 4px 12px;
      border-radius: 12px;
      white-space: nowrap;
    }
    .day-head-info {
      flex: 1;
    }
    .day-head-title {
      margin: 0;
      font-size: 14px;
      font-weight: 900;
      color: #1E0B4B;
    }
    .day-head-count {
      font-size: 10px;
      color: #64748B;
    }
    .day-description {
      font-size: 11px;
      color: #334155;
      line-height: 1.6;
      margin: 0 0 10px;
    }
    .stops-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .stop-box {
      border: 1px solid #F1F5F9;
      border-radius: 10px;
      overflow: hidden;
      background: #F8FAFC;
    }
    .stop-img {
      width: 100%;
      height: 70px;
      object-fit: cover;
      display: block;
    }
    .stop-name {
      font-size: 10px;
      font-weight: 800;
      color: #1E0B4B;
      padding: 4px 6px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Inclusions & Guarantees */
    .includes-box {
      background: #F5F3FF;
      border-radius: 14px;
      padding: 16px 20px;
      margin-top: 20px;
      page-break-inside: avoid;
    }
    .includes-title {
      font-size: 13px;
      font-weight: 900;
      color: #5B21B6;
      margin-bottom: 10px;
    }
    .includes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .include-badge {
      font-size: 11px;
      color: #1E0B4B;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .check-icon {
      color: #059669;
      font-weight: 900;
    }

    /* Footer */
    .footer {
      border-top: 1.5px solid #EDE9FE;
      padding-top: 14px;
      margin-top: 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: #64748B;
      page-break-inside: avoid;
    }
    .footer-stamp {
      font-weight: 800;
      color: #1E0B4B;
    }
    .wa-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #059669;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 11px;
    }
    .empty-notice {
      padding: 16px;
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      border-radius: 12px;
      color: #64748B;
      font-size: 11px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <div class="brand-box">
        ${model.logoDataUri ? `<img src="${model.logoDataUri}" alt="${brand}" class="brand-logo" />` : `<span class="brand-text">${brand}</span>`}
      </div>
      <div class="agency-badge">
        <div class="agency-title">${t.officialLicense.split("—")[0].trim()}</div>
        <div>${t.officialLicense.includes("—") ? t.officialLicense.split("—").slice(1).join("—").trim() : t.officialLicense}</div>
        <div>${generatedDate}</div>
      </div>
    </header>

    <!-- Hero Cover -->
    <div class="hero">
      <img src="${cover}" alt="${dest}" class="hero-img" />
      <div class="hero-gradient">
        <div class="hero-badges">
          <span class="hero-pill hero-pill-gold">${t.vipPackageBadge}</span>
          <span class="hero-pill">📍 ${dest}</span>
          <span class="hero-pill">🗓️ ${daysCount} ${isRtl ? "أيام" : "Days"} / ${nightsCount} ${isRtl ? "ليالٍ" : "Nights"}</span>
        </div>
        <h1 class="hero-title">${title}</h1>
        <div class="hero-meta">
          <span>📅 ${t.travelDates} ${dates}</span>
          <span>👥 ${t.travelers}</span>
          <span>✈️ ${t.flightBadge} + ${t.hotelBadge} + ${t.transferBadge}</span>
        </div>
      </div>
    </div>

    <!-- Financial Breakdown Table -->
    <div class="financial-card">
      <div class="financial-title">
        <span>${t.costStatementTitle}</span>
        <span style="font-size:11px; color:#A78BFA;">${t.transparentPricesNote}</span>
      </div>
      <table class="financial-table">
        <tbody>
          <tr>
            <td>✈️ ${t.flightCostItem}</td>
            <td>${flightCostStr}</td>
          </tr>
          <tr>
            <td>🏨 ${t.hotelCostItem(nightsCount)}</td>
            <td>${hotelCostStr}</td>
          </tr>
          <tr>
            <td>🚐 ${t.transferCostItem(daysCount)}</td>
            <td>${transferCostStr}</td>
          </tr>
          <tr class="total-row">
            <td>💎 ${t.totalCostItem}</td>
            <td>${totalCostStr}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Flight Boarding Passes Section -->
    <div class="section-header">
      <div class="section-title">
        <span>${t.flightsSectionTitle}</span>
      </div>
      <span class="section-sub">${t.flightsSectionSubtitle}</span>
    </div>
    <div class="flights-list">
      ${flightPassesHtml}
    </div>

    <!-- Luxury Hotels Section -->
    <div class="section-header">
      <div class="section-title">
        <span>${t.hotelsSectionTitle}</span>
      </div>
      <span class="section-sub">${t.hotelsSectionSubtitle}</span>
    </div>
    <div class="hotels-list">
      ${hotelsHtml}
    </div>

    <!-- Mercedes Vito VIP Private Van Section -->
    <div class="section-header">
      <div class="section-title">
        <span>${t.transferSectionTitle}</span>
      </div>
      <span class="section-sub">${t.transferSectionSubtitle}</span>
    </div>
    <div class="vito-card">
      <img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80" alt="Mercedes Vito VIP" class="vito-img" />
      <div class="vito-info">
        <span class="vito-badge">${t.transferFleetBadge}</span>
        <h4 class="vito-title">${t.transferTitle}</h4>
        <p class="vito-desc">${t.transferDesc}</p>
        <a href="https://lonaliza.com/transfers" class="action-btn" style="margin-top:8px;" target="_blank">${t.confirmTransferBtn}</a>
      </div>
    </div>

    <!-- Day-by-Day Timeline -->
    <div class="section-header">
      <div class="section-title">
        <span>${t.itinerarySectionTitle}</span>
      </div>
      <span class="section-sub">${t.itinerarySectionSubtitle(days.length)}</span>
    </div>
    <div class="days-list">
      ${daysHtml}
    </div>

    <!-- Inclusions Box -->
    <div class="includes-box">
      <div class="includes-title">${t.guaranteesTitle}</div>
      <div class="includes-grid">
        ${includeItemsHtml}
        <div class="include-badge"><span class="check-icon">✓</span><span>${t.driverPerk}</span></div>
        <div class="include-badge"><span class="check-icon">✓</span><span>${t.supportPerk}</span></div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div>
        <div class="footer-stamp">${t.companyName}</div>
        <div>${t.officialSite}</div>
      </div>
      <div>
        <a href="${waUrl}" class="wa-link" target="_blank">💬 ${t.whatsappCta} ${wa}</a>
      </div>
    </footer>
  </div>
</body>
</html>`;
}
