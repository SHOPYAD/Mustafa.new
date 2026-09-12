"use client";

/* eslint-disable @next/next/no-img-element */
/**
 * Trip.com-style hotel page for supplier-backed hotels (Hotelbeds / RateHawk / Travelport / Seeru).
 *
 * Everything rendered here comes from `/api/hotels/details` (supplier payload) plus RapidAPI guest
 * reviews fetched on open. Sections whose data a supplier did not deliver are hidden — no template
 * text, stock photos or invented numbers. Review comments come from Booking / Travel Advisor when
 * those endpoints are enabled — never fabricated.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ImageOff,
  MapPin,
  MessageSquareText,
  Mail,
  Phone,
  Users,
  X,
} from "lucide-react";
import HotelFeatureIcon from "@/components/hotels/HotelFeatureIcon";
import HotelStars from "@/components/hotels/HotelStars";
import SupplierRoomCard from "@/components/hotels/SupplierRoomCard";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { nightsBetween } from "@/lib/hotel-display";
import { localizeHotelLabel } from "@/lib/hotel-i18n";
import { distanceLabel, fmtStayDate, offerCopy, ratingWord, reviewSourceLabel, scoreOutOf10 } from "@/lib/hotel-offer-copy";
import type { TravelAdvisorHotelDetails, TravelAdvisorReview, TravelAdvisorRoom, TravelAdvisorRoomRate } from "@/types/travel-advisor";

const HotelLocationMap = dynamic(() => import("@/components/maps/HotelLocationMap"), {
  ssr: false,
  loading: () => <div className="h-[360px] rounded-2xl bg-slate-100 animate-pulse" />,
});

const PAGE_CLASS = "lz-supplier-hotel-detail";

type Props = {
  slug: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  rooms?: string;
  childrenAges?: string;
  query: string;
  sessionId?: string;
  masterId?: string;
};

type Tab = "overview" | "rooms" | "reviews" | "facilities" | "location" | "policies";

const CATEGORY_LABEL: Record<string, { ar: string; en: string; tr: string }> = {
  all: { ar: "كل الصور", en: "All photos", tr: "Tüm fotoğraflar" },
  exterior: { ar: "الواجهة", en: "Exterior", tr: "Dış görünüm" },
  room: { ar: "الغرف", en: "Rooms", tr: "Odalar" },
  lobby: { ar: "الاستقبال", en: "Lobby", tr: "Lobi" },
  pool: { ar: "المسبح", en: "Pool", tr: "Havuz" },
  restaurant: { ar: "المطاعم", en: "Dining", tr: "Restoran" },
  bar: { ar: "البار والصالة", en: "Bar & lounge", tr: "Bar" },
  spa: { ar: "السبا", en: "Spa", tr: "Spa" },
  gym: { ar: "اللياقة", en: "Fitness", tr: "Spor salonu" },
  beach: { ar: "الشاطئ", en: "Beach", tr: "Plaj" },
  conference: { ar: "الاجتماعات", en: "Meetings", tr: "Toplantı" },
  sports: { ar: "الرياضة", en: "Sports", tr: "Spor" },
  terrace: { ar: "التراس", en: "Terrace", tr: "Teras" },
  general: { ar: "عام", en: "General", tr: "Genel" },
  other: { ar: "أخرى", en: "Other", tr: "Diğer" },
};

const COPY = {
  ar: {
    back: "نتائج البحث",
    notFound: "لم نعثر على هذا الفندق.",
    loadFail: "تعذّر تحميل تفاصيل الفندق.",
    unavailable: "الفندق غير متاح.",
    showMap: "عرض على الخريطة",
    lowestFor: (n: string) => `أقل سعر لـ ${n}`,
    chooseRoom: "اختر غرفتك",
    allPhotos: (n: number) => `عرض كل الصور (${n})`,
    noPhotos: "لم يوفّر المورد صوراً لهذا الفندق",
    tabs: { overview: "نظرة عامة", rooms: "الغرف", reviews: "التقييمات", facilities: "المرافق", location: "الموقع", policies: "السياسات" },
    about: "عن الفندق",
    readMore: "اقرأ المزيد",
    readLess: "عرض أقل",
    topFacilities: "أبرز المرافق",
    allFacilities: (n: number) => `كل المرافق (${n})`,
    yourStay: "إقامتك",
    from: "من",
    until: "حتى",
    guestsLine: (a: string, r: string, n: string) => `${a} بالغ · ${r} غرفة · ${n}`,
    totalFrom: "الإجمالي من",
    seeRooms: "عرض الغرف المتاحة",
    noRoomsDates: "لا توجد غرف متاحة لهذه التواريخ.",
    supplierTimeout: "قد تظهر عروض إضافية خلال لحظات.",
    roomsTitle: "الغرف والأسعار",
    roomsCount: (n: number) => (n === 1 ? "نوع غرفة واحد" : n === 2 ? "نوعا غرف" : n <= 10 ? `${n} أنواع غرف` : `${n} نوع غرفة`),
    filterFreeCancel: "إلغاء مجاني",
    filterMeals: "شامل وجبات",
    noRatesMatch: "لا خطط أسعار تطابق الفلاتر المحددة.",
    noRooms: "لا توجد غرف متاحة لهذه التواريخ.",
    showAllRooms: (n: number) => `عرض جميع الغرف (${n})`,
    showFewerRooms: "عرض غرف أقل",
    reviewsTitle: "تقييمات النزلاء",
    reviewsSource: (src: string) => `تقييم إجمالي من ${src}`,
    reviewsEmptyTitle: "لا توجد تقييمات بعد",
    reviewsEmptyBody: "لم تصلنا بعد تعليقات نزلاء مكتوبة عن هذا الفندق.",
    reviewsEmptyScore: "لم يصلنا تقييم إجمالي بعد.",
    facilitiesTitle: "المرافق والخدمات",
    showAllFacilities: "عرض جميع المرافق",
    hideFacilities: "عرض أقل",
    locationTitle: "الموقع",
    nearby: "أماكن قريبة",
    fromCentre: "من مركز المدينة",
    policiesTitle: "سياسات الفندق",
    checkIn: "تسجيل الوصول",
    checkOut: "تسجيل المغادرة",
    contact: "هاتف الفندق",
    stickyFrom: "من",
    perNight: "/ ليلة",
  },
  en: {
    back: "Search results",
    notFound: "We could not find this hotel.",
    loadFail: "Failed to load hotel details.",
    unavailable: "Hotel unavailable.",
    showMap: "Show on map",
    lowestFor: (n: string) => `Lowest price for ${n}`,
    chooseRoom: "Choose your room",
    allPhotos: (n: number) => `All photos (${n})`,
    noPhotos: "No photos provided by the supplier",
    tabs: { overview: "Overview", rooms: "Rooms", reviews: "Reviews", facilities: "Facilities", location: "Location", policies: "Policies" },
    about: "About the hotel",
    readMore: "Read more",
    readLess: "Show less",
    topFacilities: "Top facilities",
    allFacilities: (n: number) => `All facilities (${n})`,
    yourStay: "Your stay",
    from: "from",
    until: "until",
    guestsLine: (a: string, r: string, n: string) => `${a} adults · ${r} room · ${n}`,
    totalFrom: "Total from",
    seeRooms: "See available rooms",
    noRoomsDates: "No rooms available for these dates.",
    supplierTimeout: "More offers may appear in a moment.",
    roomsTitle: "Rooms & rates",
    roomsCount: (n: number) => `${n} room type${n === 1 ? "" : "s"}`,
    filterFreeCancel: "Free cancellation",
    filterMeals: "Meals included",
    noRatesMatch: "No rates match the selected filters.",
    noRooms: "No rooms available for these dates.",
    showAllRooms: (n: number) => `Show all rooms (${n})`,
    showFewerRooms: "Show fewer rooms",
    reviewsTitle: "Guest reviews",
    reviewsSource: (src: string) => `Overall score from ${src}`,
    reviewsEmptyTitle: "No reviews yet",
    reviewsEmptyBody: "No written guest comments have arrived for this hotel yet.",
    reviewsEmptyScore: "No overall guest score yet.",
    facilitiesTitle: "Facilities & services",
    showAllFacilities: "Show all facilities",
    hideFacilities: "Show less",
    locationTitle: "Location",
    nearby: "Nearby",
    fromCentre: "from city centre",
    policiesTitle: "Hotel policies",
    checkIn: "Check-in",
    checkOut: "Check-out",
    contact: "Hotel phone",
    stickyFrom: "from",
    perNight: "/ night",
  },
  tr: {
    back: "Arama sonuçları",
    notFound: "Bu otel bulunamadı.",
    loadFail: "Otel bilgileri yüklenemedi.",
    unavailable: "Otel müsait değil.",
    showMap: "Haritada göster",
    lowestFor: (n: string) => `${n} için en düşük fiyat`,
    chooseRoom: "Odanızı seçin",
    allPhotos: (n: number) => `Tüm fotoğraflar (${n})`,
    noPhotos: "Tedarikçi fotoğraf sağlamadı",
    tabs: { overview: "Genel bakış", rooms: "Odalar", reviews: "Yorumlar", facilities: "Olanaklar", location: "Konum", policies: "Politikalar" },
    about: "Otel hakkında",
    readMore: "Devamını oku",
    readLess: "Daha az göster",
    topFacilities: "Öne çıkan olanaklar",
    allFacilities: (n: number) => `Tüm olanaklar (${n})`,
    yourStay: "Konaklamanız",
    from: "başlangıç",
    until: "bitiş",
    guestsLine: (a: string, r: string, n: string) => `${a} yetişkin · ${r} oda · ${n}`,
    totalFrom: "Toplam",
    seeRooms: "Müsait odaları gör",
    noRoomsDates: "Bu tarihler için müsait oda yok.",
    supplierTimeout: "Kısa süre içinde ek teklifler görünebilir.",
    roomsTitle: "Odalar ve fiyatlar",
    roomsCount: (n: number) => `${n} oda tipi`,
    filterFreeCancel: "Ücretsiz iptal",
    filterMeals: "Yemek dahil",
    noRatesMatch: "Seçilen filtrelere uyan fiyat yok.",
    noRooms: "Bu tarihler için müsait oda yok.",
    showAllRooms: (n: number) => `Tüm odaları göster (${n})`,
    showFewerRooms: "Daha az oda göster",
    reviewsTitle: "Misafir yorumları",
    reviewsSource: (src: string) => `${src} genel puanı`,
    reviewsEmptyTitle: "Henüz yorum yok",
    reviewsEmptyBody: "Bu otel için henüz yazılı misafir yorumu gelmedi.",
    reviewsEmptyScore: "Henüz genel bir misafir puanı yok.",
    facilitiesTitle: "Olanaklar ve hizmetler",
    showAllFacilities: "Tüm olanakları göster",
    hideFacilities: "Daha az göster",
    locationTitle: "Konum",
    nearby: "Yakın yerler",
    fromCentre: "şehir merkezinden",
    policiesTitle: "Otel politikaları",
    checkIn: "Giriş",
    checkOut: "Çıkış",
    contact: "Otel telefonu",
    stickyFrom: "başlangıç",
    perNight: "/ gece",
  },
};

const INITIAL_ROOMS = 3;
const DESCRIPTION_CLAMP = 420;

export default function SupplierHotelDetail({ slug, checkIn, checkOut, adults, rooms = "1", childrenAges = "", query, sessionId, masterId }: Props) {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const k = locale === "ar" || locale === "tr" ? COPY[locale] : COPY.en;
  const c = offerCopy(locale);
  const { formatPrice } = useCurrency();
  const [hotel, setHotel] = useState<TravelAdvisorHotelDetails | null>(null);
  const [roomList, setRoomList] = useState<TravelAdvisorRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [category, setCategory] = useState("all");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [onlyFreeCancel, setOnlyFreeCancel] = useState(false);
  const [onlyMeals, setOnlyMeals] = useState(false);
  const [allRooms, setAllRooms] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [allFacilities, setAllFacilities] = useState(false);
  const [guestReviews, setGuestReviews] = useState<TravelAdvisorReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [guestScore, setGuestScore] = useState<{ source: string; score: number; scale: number; count?: number } | null>(null);
  const sectionRefs = useRef<Record<Tab, HTMLElement | null>>({ overview: null, rooms: null, reviews: null, facilities: null, location: null, policies: null });

  const nights = nightsBetween(checkIn, checkOut);
  const nightsText = c.nights(nights);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ id: slug, checkIn, checkOut, adults, rooms, q: query, lang: locale });
        if (childrenAges) qs.set("children", childrenAges);
        if (sessionId) qs.set("sid", sessionId);
        if (masterId) qs.set("master", masterId);
        const res = await fetch(`/api/hotels/details?${qs}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !json?.ok || !json.hotel) {
          setHotel(null);
          setRoomList([]);
          setError(json?.errorCode === "not_found" || res.status === 404 ? k.notFound : json?.error || k.loadFail);
          return;
        }
        setHotel(json.hotel as TravelAdvisorHotelDetails);
        setRoomList(Array.isArray(json.rooms) ? (json.rooms as TravelAdvisorRoom[]) : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, checkIn, checkOut, adults, rooms, childrenAges, query, locale, sessionId, masterId]);

  useEffect(() => {
    if (!hotel?.name) return;
    let cancelled = false;
    setReviewsLoading(true);
    const qs = new URLSearchParams({
      hotelId: hotel.id,
      name: hotel.name,
      city: hotel.city || "",
      lang: locale,
    });
    if (hotel.bookingHotelId) qs.set("bookingHotelId", hotel.bookingHotelId);
    if (hotel.masterId) qs.set("masterId", hotel.masterId);
    if (hotel.lat) qs.set("lat", String(hotel.lat));
    if (hotel.lng) qs.set("lng", String(hotel.lng));
    void fetch(`/api/hotels/reviews?${qs}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setGuestReviews(Array.isArray(json?.reviews) ? (json.reviews as TravelAdvisorReview[]) : []);
        const score = json?.reviewScore;
        setGuestScore(
          score && Number(score.score) > 0
            ? {
                source: String(score.source || "tripadvisor"),
                score: Number(score.score),
                scale: Number(score.scale) || 10,
                count: Number(score.count) || undefined,
              }
            : null
        );
      })
      .catch(() => {
        if (!cancelled) {
          setGuestReviews([]);
          setGuestScore(null);
        }
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hotel?.id, hotel?.masterId, hotel?.name, hotel?.city, hotel?.lat, hotel?.lng, hotel?.bookingHotelId, locale]);

  const allImages = useMemo(() => (hotel?.images?.length ? hotel.images : hotel?.image ? [hotel.image] : []), [hotel]);
  const categories = useMemo(() => {
    const cats = (hotel?.imageCategories || []).filter((x) => x.urls.length);
    return cats.length > 1 ? cats : [];
  }, [hotel]);
  const galleryImages = useMemo(() => {
    if (category === "all") return allImages;
    return categories.find((x) => x.category === category)?.urls || allImages;
  }, [category, categories, allImages]);

  const filteredRooms = useMemo(() => {
    return roomList
      .map((room) => ({
        ...room,
        rates: room.rates.filter((r) => (!onlyFreeCancel || r.freeCancellation) && (!onlyMeals || r.breakfastIncluded)),
      }))
      .filter((room) => room.rates.length > 0)
      .sort((a, b) => (a.rates[0]?.totalStay || 0) - (b.rates[0]?.totalStay || 0));
  }, [roomList, onlyFreeCancel, onlyMeals]);
  const visibleRooms = allRooms ? filteredRooms : filteredRooms.slice(0, INITIAL_ROOMS);

  const cheapest = useMemo(() => {
    let best: TravelAdvisorRoomRate | null = null;
    for (const room of roomList) for (const r of room.rates) if (r.totalStay != null && (!best || (r.totalStay as number) < (best.totalStay as number))) best = r;
    return best;
  }, [roomList]);

  // The fixed site header changes height (dismissable app banner, mobile),
  // so measure it and derive the sticky offset / scroll margins from it.
  const [headerH, setHeaderH] = useState(80);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.alrayyan-site-header") ?? document.querySelector<HTMLElement>("header");
    if (!header) return;
    const update = () => setHeaderH(Math.round(header.getBoundingClientRect().height));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
  const TABS_H = 52;
  const sectionOffset = headerH + TABS_H + 8;

  const scrollTo = useCallback((key: Tab) => {
    setTab(key);
    const el = sectionRefs.current[key];
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - sectionOffset, behavior: "smooth" });
  }, [sectionOffset]);

  // Highlight the tab of the section in view.
  useEffect(() => {
    if (!hotel) return;
    const entries = Object.entries(sectionRefs.current).filter(([, el]) => el) as Array<[Tab, HTMLElement]>;
    if (!entries.length) return;
    const obs = new IntersectionObserver(
      (list) => {
        const visible = list.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const key = entries.find(([, el]) => el === visible.target)?.[0];
          if (key) setTab(key);
        }
      },
      { rootMargin: `-${sectionOffset + 10}px 0px -60% 0px` }
    );
    for (const [, el] of entries) obs.observe(el);
    return () => obs.disconnect();
  }, [hotel, sectionOffset]);

  useEffect(() => {
    if (lightbox == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i == null ? i : (i + 1) % galleryImages.length));
      if (e.key === "ArrowLeft") setLightbox((i) => (i == null ? i : (i - 1 + galleryImages.length) % galleryImages.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, galleryImages.length]);

  // The site-wide `html/body/main { overflow-x: hidden }` turns <body> and
  // <main> into scroll containers and breaks `position: sticky` for the tab
  // bar. Scope an `overflow-x: clip` override to this page only (same approach
  // as the flights embed page; see PAGE_CLASS style below).
  useEffect(() => {
    document.documentElement.classList.add(PAGE_CLASS);
    return () => document.documentElement.classList.remove(PAGE_CLASS);
  }, []);

  const openImage = useCallback(
    (url: string) => {
      const idx = allImages.indexOf(url);
      setCategory("all");
      setLightbox(idx >= 0 ? idx : 0);
    },
    [allImages]
  );

  const bookHref = useCallback(
    (room: TravelAdvisorRoom, rate: TravelAdvisorRoomRate) => {
      const params = new URLSearchParams({
        hotel: slug,
        hotelName: hotel?.name || "",
        provider: rate.supplier === "travelport" ? "travelport_hotels" : rate.supplier === "seeru" ? "seeru_hotels" : rate.supplier || hotel?.supplier || "",
        supplier: rate.supplier || hotel?.supplier || "",
        checkIn,
        checkOut,
        adults,
        rooms,
        price: String(rate.totalStay ?? rate.price ?? ""),
        nightly: String(rate.nightly ?? ""),
        currency: rate.currency,
        room: rate.id,
        roomName: room.name,
        board: rate.boardCode || "",
        rateKey: rate.supplierToken || "",
        rateType: rate.rateType || "BOOKABLE",
        hotelImage: room.images[0] || hotel?.image || "",
        stars: String(hotel?.stars || 0),
        rating: String(hotel?.rating || 0),
        freeCancel: rate.freeCancellation ? "1" : "0",
        nonRefundable: rate.freeCancellation ? "0" : "1",
      });
      if (childrenAges) params.set("children", childrenAges);
      if (rate.freeCancellationUntil) params.set("freeCancelUntil", rate.freeCancellationUntil);
      if (sessionId || hotel?.sessionId) params.set("sid", sessionId || hotel?.sessionId || "");
      if (masterId || hotel?.masterId) params.set("master", masterId || hotel?.masterId || "");
      if (rate.supplierContext) params.set("ctx", JSON.stringify(rate.supplierContext));
      return `/hotels/book?${params}`;
    },
    [slug, hotel, checkIn, checkOut, adults, rooms, childrenAges, sessionId, masterId]
  );

  /* ------------------------------------------------------------------------------------------ */

  if (loading) return <DetailSkeleton />;

  const backHref = `/hotels?q=${encodeURIComponent(query)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`;

  if (error || !hotel) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 pt-24 text-center">
        <Building2 className="size-10 text-slate-300" />
        <p className="text-slate-600 text-lg">{error || k.unavailable}</p>
        <Link href={backHref} className="font-semibold hover:underline text-[var(--brand-primary)]">
          ← {k.back}
        </Link>
      </div>
    );
  }

  const available = hotel.available || {
    description: Boolean(hotel.description),
    facilities: Boolean(hotel.amenities?.length),
    pois: Boolean(hotel.pois?.length),
    policies: Boolean(hotel.policies?.length || hotel.checkInTime || hotel.checkOutTime || hotel.phone || hotel.email || hotel.address),
    reviews: Boolean(hotel.reviewScore || guestScore || guestReviews.length),
    map: Boolean(hotel.lat && hotel.lng),
  };
  const failedSuppliers = (hotel.supplierStatus || []).filter((s) => !s.ok).length;
  const review = guestScore || hotel.reviewScore;
  const score10 = review ? scoreOutOf10(review.score, review.scale) : 0;
  const reviewSource = reviewSourceLabel(review?.source);
  const tabs: Array<{ key: Tab; show: boolean }> = [
    { key: "overview", show: true },
    { key: "rooms", show: true },
    { key: "reviews", show: true },
    { key: "facilities", show: available.facilities },
    { key: "location", show: available.map || available.pois || Boolean(hotel.address) },
    { key: "policies", show: available.policies },
  ];
  const description = hotel.description || "";
  const descriptionLong = description.length > DESCRIPTION_CLAMP;
  const descriptionShown = descOpen || !descriptionLong ? description : `${description.slice(0, DESCRIPTION_CLAMP).trimEnd()}…`;
  const facilityGroups = hotel.facilityGroups?.length ? hotel.facilityGroups : hotel.amenities?.length ? [{ title: "", items: hotel.amenities }] : [];
  const facilityTotal = facilityGroups.reduce((n, g) => n + g.items.length, 0);
  const facilitiesCollapsed = !allFacilities && facilityTotal > 24;
  const distance = hotel.distanceFromCenterM != null ? distanceLabel(hotel.distanceFromCenterM, locale) : "";
  const cheapestCurrency = cheapest?.currency || hotel.currency || "USD";

  return (
    <div className="bg-slate-50 min-h-screen pt-20 pb-24 md:pb-0" dir={ar ? "rtl" : "ltr"}>
      <style>{`
        html.${PAGE_CLASS}:not([data-admin-theme]) { overflow-x: clip; }
        html.${PAGE_CLASS}:not([data-admin-theme]) body { overflow-x: clip; overflow-y: visible; }
        html.${PAGE_CLASS}:not([data-admin-theme]) main { overflow-x: clip; }
      `}</style>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          {ar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {k.back}
        </Link>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{hotel.name}</h1>
              <HotelStars stars={hotel.stars} size={16} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              {review && score10 > 0 ? (
                <button type="button" data-keep-color="true" onClick={() => scrollTo("reviews")} className="inline-flex items-center gap-1.5 bg-transparent hover:opacity-90">
                  <span className="px-1.5 py-0.5 rounded-md text-white text-xs font-extrabold tabular-nums" style={{ background: "var(--brand-primary)" }}>
                    {score10.toFixed(1)}
                    <span className="text-[10px] font-semibold opacity-80">/10</span>
                  </span>
                  <span className="font-bold text-slate-800">{ratingWord(score10, locale)}</span>
                  <span className="text-slate-500 text-xs">
                    {review.count ? c.reviews(review.count) : null}
                    {reviewSource ? ` · ${reviewSource}` : ""}
                  </span>
                </button>
              ) : null}
              {hotel.address || hotel.city ? (
                <span className="inline-flex items-start gap-1.5 text-slate-600 min-w-0">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />
                  <span className="leading-snug">
                    {hotel.address || hotel.city}
                    {hotel.address && hotel.city && !hotel.address.toLowerCase().includes(hotel.city.toLowerCase()) ? `، ${hotel.city}` : ""}
                    {distance ? <span className="text-slate-400"> · {distance} {k.fromCentre}</span> : null}
                  </span>
                  {available.map ? (
                    <button type="button" data-keep-color="true" onClick={() => scrollTo("location")} className="font-bold hover:underline shrink-0 bg-transparent text-[var(--brand-primary)]">
                      {k.showMap}
                    </button>
                  ) : null}
                </span>
              ) : null}
            </div>
          </div>
          <div className="text-start lg:text-end shrink-0">
            {cheapest ? (
              <>
                <div className="text-xs text-slate-500">{k.lowestFor(nightsText)}</div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">{formatPrice(cheapest.totalStay || 0, cheapestCurrency)}</div>
                <div className="text-xs text-slate-500">
                  {formatPrice(cheapest.nightly || 0, cheapestCurrency)} {k.perNight}
                  {" · "}
                  {cheapest.taxesIncluded === false ? c.taxesExcluded : c.taxesIncluded}
                </div>
              </>
            ) : null}
            <button type="button" onClick={() => scrollTo("rooms")} className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-extrabold text-sm shadow-md hover:brightness-110 transition-all" style={{ background: "var(--brand-primary)" }}>
              {k.chooseRoom}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categories.length ? (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {[{ category: "all", urls: allImages }, ...categories].map((x) => (
              <button
                key={x.category}
                type="button"
                onClick={() => setCategory(x.category)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${category === x.category ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}
                style={category === x.category ? { background: "var(--brand-accent)" } : undefined}
              >
                {(CATEGORY_LABEL[x.category] || CATEGORY_LABEL.other)[locale === "ar" || locale === "tr" ? locale : "en"]} <span className="opacity-60">({x.urls.length})</span>
              </button>
            ))}
          </div>
        ) : null}
        {galleryImages.length ? (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[260px] sm:h-[380px] lg:h-[440px]">
            <button type="button" onClick={() => setLightbox(0)} className="col-span-4 sm:col-span-2 row-span-2 relative group bg-slate-100">
              <img src={galleryImages[0]} alt={hotel.name} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              <span className="sm:hidden absolute bottom-2 end-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[11px] font-bold text-white">
                <Camera size={12} /> {galleryImages.length}
              </span>
            </button>
            {galleryImages.slice(1, 5).map((img, i) => (
              <button key={img + i} type="button" onClick={() => setLightbox(i + 1)} className="hidden sm:block relative group bg-slate-100">
                <img src={img} alt="" className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                {i === 3 && galleryImages.length > 5 ? (
                  <span className="absolute inset-0 bg-black/45 text-white font-bold flex items-center justify-center gap-2 text-sm">
                    <Camera size={16} /> {k.allPhotos(galleryImages.length)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="h-[220px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
            <ImageOff size={28} />
            <span className="text-sm">{k.noPhotos}</span>
          </div>
        )}
      </div>

      {/* Sticky tabs */}
      <div className="sticky z-30 bg-white/95 backdrop-blur border-b border-slate-200 mt-4" style={{ top: headerH }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs
              .filter((x) => x.show)
              .map((x) => (
                <button
                  key={x.key}
                  type="button"
                  data-keep-color="true"
                  onClick={() => scrollTo(x.key)}
                  className={`shrink-0 bg-transparent px-4 py-3.5 text-sm font-bold border-b-2 transition-colors ${tab === x.key ? "border-[var(--brand-primary)] text-[var(--brand-primary)]" : "border-transparent text-slate-600 hover:text-slate-900"}`}
                >
                  {k.tabs[x.key]}
                </button>
              ))}
          </nav>
          {cheapest ? (
            <div className="hidden md:flex items-center gap-3 text-sm">
              <span className="font-black text-slate-900 tabular-nums">{formatPrice(cheapest.nightly || 0, cheapestCurrency)}</span>
              <span className="text-slate-500">{k.perNight}</span>
              <button type="button" onClick={() => scrollTo("rooms")} className="px-4 py-2 rounded-lg text-white font-bold text-xs hover:brightness-110" style={{ background: "var(--brand-primary)" }}>
                {k.tabs.rooms}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Overview */}
        <section id="overview" style={{ scrollMarginTop: sectionOffset }} ref={(el) => void (sectionRefs.current.overview = el)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {available.description && description ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                <h2 className="text-lg font-black text-slate-900 mb-3">{k.about}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[15px]">{descriptionShown}</p>
                {descriptionLong ? (
                  <button type="button" data-keep-color="true" onClick={() => setDescOpen((v) => !v)} className="mt-2 inline-flex items-center gap-1 text-sm font-bold hover:underline bg-transparent text-[var(--brand-primary)]">
                    {descOpen ? k.readLess : k.readMore}
                    {descOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                ) : null}
              </div>
            ) : null}
            {available.facilities && hotel.amenities?.length ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-black text-slate-900">{k.topFacilities}</h2>
                  <button type="button" data-keep-color="true" onClick={() => scrollTo("facilities")} className="text-sm font-semibold hover:underline bg-transparent text-[var(--brand-primary)]">
                    {k.allFacilities(facilityTotal || hotel.amenities.length)}
                  </button>
                </div>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {hotel.amenities.slice(0, 9).map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm text-slate-700">
                      <HotelFeatureIcon label={a} className="size-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{localizeHotelLabel(a, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <h3 className="font-black text-slate-900">{k.yourStay}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[11px] text-slate-500">{k.checkIn}</div>
                  <div className="font-bold text-slate-900">{fmtStayDate(checkIn, locale)}</div>
                  {hotel.checkInTime ? (
                    <div className="text-[11px] text-slate-500">
                      {k.from} {hotel.checkInTime}
                    </div>
                  ) : null}
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[11px] text-slate-500">{k.checkOut}</div>
                  <div className="font-bold text-slate-900">{fmtStayDate(checkOut, locale)}</div>
                  {hotel.checkOutTime ? (
                    <div className="text-[11px] text-slate-500">
                      {k.until} {hotel.checkOutTime}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={15} />
                {k.guestsLine(adults, rooms, nightsText)}
              </div>
              {cheapest ? (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">{k.totalFrom}</div>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">{formatPrice(cheapest.totalStay || 0, cheapestCurrency)}</div>
                  <div className="text-[11px] text-slate-400">{cheapest.taxesIncluded === false ? c.taxesExcluded : c.taxesIncluded}</div>
                  <button type="button" onClick={() => scrollTo("rooms")} className="mt-3 w-full py-3 rounded-xl text-white font-extrabold text-sm hover:brightness-110" style={{ background: "var(--brand-primary)" }}>
                    {k.seeRooms}
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">{k.noRoomsDates}</div>
              )}
              {failedSuppliers ? (
                <p className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  {k.supplierTimeout}
                </p>
              ) : null}
            </div>
            {available.map && hotel.lat && hotel.lng ? (
              <button type="button" onClick={() => scrollTo("location")} className="block w-full bg-white rounded-2xl border border-slate-200/80 overflow-hidden text-start">
                <div className="h-36 pointer-events-none relative isolate z-0">
                  <HotelLocationMap hotelLat={hotel.lat} hotelLng={hotel.lng} hotelLabel={hotel.name} locale={locale} height={144} />
                </div>
                <div className="p-3 text-sm font-semibold text-[var(--brand-primary)]">{k.showMap}</div>
              </button>
            ) : null}
          </aside>
        </section>

        {/* Rooms */}
        <section id="rooms" style={{ scrollMarginTop: sectionOffset }} ref={(el) => void (sectionRefs.current.rooms = el)} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-900">
              {k.roomsTitle}
              {filteredRooms.length ? <span className="ms-2 text-sm font-semibold text-slate-500">{k.roomsCount(filteredRooms.length)}</span> : null}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOnlyFreeCancel((v) => !v)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${onlyFreeCancel ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}
              >
                {k.filterFreeCancel}
              </button>
              <button
                type="button"
                onClick={() => setOnlyMeals((v) => !v)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${onlyMeals ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}
              >
                {k.filterMeals}
              </button>
            </div>
          </div>
          {filteredRooms.length ? (
            <>
              <div className="space-y-4">
                {visibleRooms.map((room) => (
                  <SupplierRoomCard key={room.id} room={room} nights={nights} locale={locale} bookHref={bookHref} onOpenImage={openImage} />
                ))}
              </div>
              {filteredRooms.length > INITIAL_ROOMS ? (
                <button
                  type="button"
                  onClick={() => {
                    if (allRooms) scrollTo("rooms");
                    setAllRooms((v) => !v);
                  }}
                  className="w-full py-3 rounded-2xl border border-dashed border-slate-300 bg-white text-sm font-bold text-[var(--brand-primary)] hover:bg-slate-50 inline-flex items-center justify-center gap-1"
                >
                  {allRooms ? k.showFewerRooms : k.showAllRooms(filteredRooms.length)}
                  {allRooms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              ) : null}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 text-sm">{roomList.length ? k.noRatesMatch : k.noRooms}</div>
          )}
        </section>

        {/* Reviews from Booking.com15 / Travel Advisor when those RapidAPI endpoints are enabled. */}
        <section id="reviews" style={{ scrollMarginTop: sectionOffset }} ref={(el) => void (sectionRefs.current.reviews = el)} className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h2 className="text-xl font-black text-slate-900 mb-4">{k.reviewsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            {review && score10 > 0 ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 flex flex-col items-center text-center">
                <div className="text-4xl font-black text-white rounded-2xl px-4 py-2 tabular-nums" style={{ background: "var(--brand-primary)" }}>
                  {score10.toFixed(1)}
                  <span className="text-base font-bold opacity-80">/10</span>
                </div>
                <div className="mt-3 text-lg font-extrabold text-slate-900">{ratingWord(score10, locale)}</div>
                {review.count ? <div className="text-sm text-slate-500">{c.reviews(review.count)}</div> : null}
                {reviewSource ? <div className="mt-1 text-[11px] text-slate-400">{k.reviewsSource(reviewSource)}</div> : null}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-sm text-slate-500 text-center">{k.reviewsEmptyScore}</div>
            )}
            {reviewsLoading ? (
              <div className="rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">{locale === "ar" ? "جاري جلب التقييمات…" : "Loading reviews…"}</div>
            ) : guestReviews.length ? (
              <ul className="max-h-[520px] space-y-3 overflow-y-auto pe-1 [scrollbar-width:thin]">
                {guestReviews.map((rv) => (
                  <li key={`${rv.source || "rv"}-${rv.id}`} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-extrabold text-slate-900">{rv.author}</span>
                      {rv.rating > 0 ? (
                        <span className="rounded-md bg-[#2e1065] px-1.5 py-0.5 text-[11px] font-black text-white tabular-nums">
                          {scoreOutOf10(rv.rating, rv.rating <= 5 ? 5 : 10).toFixed(1)}
                        </span>
                      ) : null}
                      {rv.source ? (
                        <span className="text-[11px] text-slate-400">{reviewSourceLabel(rv.source)}</span>
                      ) : null}
                      {rv.date ? <span className="text-xs text-slate-400">{rv.date}</span> : null}
                    </div>
                    {rv.title ? (
                      <p className="mt-1 text-sm font-bold text-slate-800" dir="auto">
                        {rv.title}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed whitespace-pre-line" dir="auto" style={{ unicodeBidi: "plaintext" }}>
                      {rv.text}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center">
                <MessageSquareText size={26} className="text-slate-300" />
                <div className="mt-2 font-bold text-slate-700">{k.reviewsEmptyTitle}</div>
                <p className="mt-1 max-w-md text-sm text-slate-500 leading-relaxed">{k.reviewsEmptyBody}</p>
              </div>
            )}
          </div>
        </section>

        {/* Facilities */}
        {available.facilities && facilityGroups.length ? (
          <section id="facilities" style={{ scrollMarginTop: sectionOffset }} ref={(el) => void (sectionRefs.current.facilities = el)} className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {k.facilitiesTitle}
              <span className="ms-2 text-sm font-semibold text-slate-500">({facilityTotal})</span>
            </h2>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${facilitiesCollapsed ? "max-h-[480px] overflow-hidden relative" : ""}`}>
              {facilityGroups.map((g, gi) => (
                <div key={g.title || gi} className="rounded-2xl border border-[#2e1065]/10 bg-gradient-to-b from-[#2e1065]/[0.04] to-white p-4">
                  {g.title ? (
                    <h3 className="mb-3 flex items-center gap-2 text-[14px] font-black text-[#1e1b4b]">
                      <span className="inline-flex size-8 items-center justify-center rounded-xl bg-[#2e1065]/10">
                        <HotelFeatureIcon label={g.title} className="size-4 text-[#2e1065]" />
                      </span>
                      {localizeHotelLabel(g.title, locale)}
                    </h3>
                  ) : null}
                  <ul className="space-y-2">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <HotelFeatureIcon label={item} size={15} className="mt-0.5 shrink-0 text-[#2e1065]" />
                        <span>{localizeHotelLabel(item, locale)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {facilitiesCollapsed ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" /> : null}
            </div>
            {facilityTotal > 24 ? (
              <button type="button" data-keep-color="true" onClick={() => setAllFacilities((v) => !v)} className="mt-4 inline-flex items-center gap-1 text-sm font-bold hover:underline bg-transparent text-[var(--brand-primary)]">
                {allFacilities ? k.hideFacilities : k.showAllFacilities}
                {allFacilities ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : null}
          </section>
        ) : null}

        {/* Location */}
        {available.map || available.pois || hotel.address ? (
          <section id="location" style={{ scrollMarginTop: sectionOffset }} ref={(el) => void (sectionRefs.current.location = el)} className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">{k.locationTitle}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {available.map && hotel.lat && hotel.lng ? (
                  <div className="relative isolate z-0 rounded-xl overflow-hidden">
                    <HotelLocationMap hotelLat={hotel.lat} hotelLng={hotel.lng} hotelLabel={hotel.name} locale={locale} height={380} />
                  </div>
                ) : null}
                {hotel.address ? (
                  <p className="mt-2 text-sm text-slate-600 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[var(--brand-primary)]" /> {hotel.address}
                    {distance ? <span className="text-slate-400">· {distance} {k.fromCentre}</span> : null}
                  </p>
                ) : null}
              </div>
              {available.pois && hotel.pois?.length ? (
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">{k.nearby}</h3>
                  <ul className="divide-y divide-slate-100">
                    {hotel.pois.slice(0, 15).map((p) => (
                      <li key={p.name} className="py-2 flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-700">{p.name}</span>
                        <span className="text-slate-500 shrink-0 tabular-nums">{distanceLabel(p.distanceM, locale)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Policies */}
        {available.policies ? (
          <section id="policies" style={{ scrollMarginTop: sectionOffset }} ref={(el) => void (sectionRefs.current.policies = el)} className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">{k.policiesTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {hotel.address ? (
                <div className="rounded-2xl border border-[#2e1065]/10 bg-gradient-to-b from-[#2e1065]/[0.04] to-white p-4 flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-[#2e1065]" />
                  <div>
                    <div className="text-xs text-slate-500">{k.locationTitle}</div>
                    <div className="font-bold text-slate-900 leading-snug">{hotel.address}</div>
                  </div>
                </div>
              ) : null}
              {hotel.checkInTime ? (
                <div className="rounded-2xl border border-[#2e1065]/10 bg-gradient-to-b from-[#2e1065]/[0.04] to-white p-4 flex items-center gap-3">
                  <Clock size={18} className="text-[#2e1065]" />
                  <div>
                    <div className="text-xs text-slate-500">{k.checkIn}</div>
                    <div className="font-bold text-slate-900">
                      {k.from} {hotel.checkInTime}
                    </div>
                  </div>
                </div>
              ) : null}
              {hotel.checkOutTime ? (
                <div className="rounded-2xl border border-[#2e1065]/10 bg-gradient-to-b from-[#2e1065]/[0.04] to-white p-4 flex items-center gap-3">
                  <Clock size={18} className="text-[#2e1065]" />
                  <div>
                    <div className="text-xs text-slate-500">{k.checkOut}</div>
                    <div className="font-bold text-slate-900">
                      {k.until} {hotel.checkOutTime}
                    </div>
                  </div>
                </div>
              ) : null}
              {hotel.phone ? (
                <div className="rounded-2xl border border-[#2e1065]/10 bg-gradient-to-b from-[#2e1065]/[0.04] to-white p-4 flex items-center gap-3">
                  <Phone size={18} className="text-[#2e1065]" />
                  <div>
                    <div className="text-xs text-slate-500">{k.contact}</div>
                    <a href={`tel:${hotel.phone}`} className="font-bold text-slate-900" dir="ltr">
                      {hotel.phone}
                    </a>
                  </div>
                </div>
              ) : null}
              {hotel.email ? (
                <div className="rounded-2xl border border-[#2e1065]/10 bg-gradient-to-b from-[#2e1065]/[0.04] to-white p-4 flex items-center gap-3">
                  <Mail size={18} className="text-[#2e1065]" />
                  <div>
                    <div className="text-xs text-slate-500">{locale === "ar" ? "البريد" : "Email"}</div>
                    <a href={`mailto:${hotel.email}`} className="font-bold text-slate-900 break-all" dir="ltr">
                      {hotel.email}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
            {hotel.policies?.filter((p) => !/^(تسجيل الوصول|تسجيل المغادرة|Check-in|Check-out)/.test(p)).length ? (
              <ul className="space-y-2">
                {hotel.policies
                  .filter((p) => !/^(تسجيل الوصول|تسجيل المغادرة|Check-in|Check-out)/.test(p))
                  .map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check size={14} className="text-slate-400 mt-0.5 shrink-0" /> <span className="whitespace-pre-line">{p}</span>
                    </li>
                  ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>

      {/* Mobile sticky price bar */}
      {cheapest ? (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-2.5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10.5px] text-slate-500">{k.stickyFrom}</div>
            <div className="text-lg font-black text-slate-900 leading-none tabular-nums">
              {formatPrice(cheapest.nightly || 0, cheapestCurrency)} <span className="text-[11px] font-semibold text-slate-500">{k.perNight}</span>
            </div>
          </div>
          <button type="button" onClick={() => scrollTo("rooms")} className="px-5 py-2.5 rounded-xl text-white font-extrabold text-sm" style={{ background: "var(--brand-primary)" }}>
            {k.chooseRoom}
          </button>
        </div>
      ) : null}

      {/* Lightbox */}
      {lightbox != null && galleryImages.length ? (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button type="button" onClick={() => setLightbox(null)} className="absolute top-4 end-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white" aria-label="close">
            <X size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => (e.stopPropagation(), setLightbox((i) => (i == null ? i : (i - 1 + galleryImages.length) % galleryImages.length)))}
            className="absolute start-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="prev"
          >
            {ar ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          <img src={galleryImages[lightbox]} alt="" className="max-h-[82vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button
            type="button"
            onClick={(e) => (e.stopPropagation(), setLightbox((i) => (i == null ? i : (i + 1) % galleryImages.length)))}
            className="absolute end-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="next"
          >
            {ar ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
          <div className="absolute bottom-3 inset-x-0 flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1.5 overflow-x-auto max-w-[92vw] no-scrollbar px-2">
              {galleryImages.slice(Math.max(0, lightbox - 6), Math.max(0, lightbox - 6) + 13).map((img, i) => {
                const idx = Math.max(0, lightbox - 6) + i;
                return (
                  <button key={img + idx} type="button" onClick={() => setLightbox(idx)} className={`h-12 w-16 shrink-0 rounded-md overflow-hidden border-2 ${idx === lightbox ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                );
              })}
            </div>
            <div className="text-white/80 text-sm font-mono">
              {lightbox + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-8 w-2/3 bg-slate-200 rounded" />
        <div className="h-4 w-1/2 bg-slate-200 rounded" />
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[380px]">
          <div className="col-span-2 row-span-2 bg-slate-200 rounded-2xl" />
          <div className="bg-slate-200 rounded-xl" />
          <div className="bg-slate-200 rounded-xl" />
          <div className="bg-slate-200 rounded-xl" />
          <div className="bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-48 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}
