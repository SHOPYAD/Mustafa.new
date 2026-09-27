"use client";

import { use, useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Car,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Crown,
  Globe,
  Heart,
  Hotel,
  Info,
  Luggage,
  MapPin,
  Phone,
  Plane,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Utensils,
  XCircle,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import EnquiryModal from "@/components/ui/EnquiryModal";
import { ShareToCommunityButton } from "@/components/community/ShareToCommunityButton";
import { PackageAiConsultant } from "@/components/packages/PackageAiConsultant";
import { PackageFlightHotelHeroShowcase } from "@/components/packages/PackageFlightHotelHeroShowcase";
import { PackageVisaCard } from "@/components/packages/PackageVisaCard";
import {
  resolveDestinationMeta,
  type DestinationMetadata,
} from "@/lib/destination-resolver";
import { WORLD_CITIES_MASTER } from "@/lib/geo/world-cities-data";
import {
  enrichPackage,
  getLocalizedItinerary,
  getLocalizedList,
  type EnrichedHolidayPackage,
} from "@/data/package-enrichment";
import {
  getAuthenticStopsForDay,
  getDestinationPlacesList,
} from "@/lib/destination-places-resolver";
import { getDestinationHotelOffers } from "@/lib/destination-hotel-offers";
import { featuredPackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { tContent } from "@/lib/utils";
import { buildBusinessWhatsAppLink } from "@/lib/site-whatsapp";
import type { HolidayPackage } from "@/types/package";

const OsmRouteMap = dynamic(() => import("@/components/maps/OsmRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
  ),
});

interface Props {
  params: Promise<{ slug: string }>;
}

function SectionHeading({
  children,
  icon,
  badge,
}: {
  children: ReactNode;
  icon?: ReactNode;
  badge?: string;
}) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
      <h2 className="flex items-center gap-3 text-xl font-black leading-snug text-[#1A1438] sm:text-2xl">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-amber-300 shadow-md shadow-violet-500/20">
            {icon}
          </span>
        )}
        <span>{children}</span>
      </h2>
      {badge ? (
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#7C3AED]">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

interface DynamicFlightInfo {
  airline: string;
  airlineAr: string;
  outbound: {
    departureTime: string;
    departureAirport: string;
    arrivalTime: string;
    arrivalAirport: string;
    duration: string;
  };
  inbound: {
    departureTime: string;
    departureAirport: string;
    arrivalTime: string;
    arrivalAirport: string;
    duration: string;
  };
}

function resolveDynamicFlight(
  destMeta: DestinationMetadata,
  isAr: boolean
): DynamicFlightInfo {
  const cityLower = destMeta.cityEn.toLowerCase();
  const countryLower = destMeta.countryEn.toLowerCase();

  const cityItem = WORLD_CITIES_MASTER.find(
    (item) =>
      item.cityNameEn.toLowerCase() === cityLower ||
      (item.aliases && item.aliases.some((a) => a.toLowerCase() === cityLower))
  );

  const iataMatch = cityItem?.aliases?.find((a) => /^[A-Z]{3}$/.test(a));
  const iataCode = iataMatch || destMeta.cityEn.slice(0, 3).toUpperCase();

  const airportName = isAr
    ? `مطار ${destMeta.cityAr} الدولي (${iataCode})`
    : `${destMeta.cityEn} International Airport (${iataCode})`;

  const depAirport = isAr ? "الرياض / جدة / دبي" : "Riyadh / Jeddah / Dubai";

  let airline = "Saudia / Partner Airlines";
  let airlineAr = "الخطوط السعودية / طيران شركاء التحالف";
  let duration = "5h 15m";

  const targetCheck = `${countryLower} ${cityLower} ${destMeta.cityAr || ""} ${destMeta.countryAr || ""}`;

  if (/morocco|marrakech|casablanca|rabat|مراكش|المغرب|الدار البيضاء/i.test(targetCheck)) {
    airline = "Royal Air Maroc / Saudia";
    airlineAr = "الخطوط الملكية المغربية / الخطوط السعودية";
    duration = "5h 45m";
  } else if (/united kingdom|britain|london|manchester|بريطانيا|لندن|المملكة المتحدة/i.test(targetCheck)) {
    airline = "British Airways / Saudia";
    airlineAr = "الخطوط الجوية البريطانية / الخطوط السعودية";
    duration = "6h 50m";
  } else if (/france|paris|nice|فرنسا|باريس/i.test(targetCheck)) {
    airline = "Air France / Saudia";
    airlineAr = "الخطوط الجوية الفرنسية / الخطوط السعودية";
    duration = "6h 15m";
  } else if (/turkey|istanbul|trabzon|antalya|تركيا|إسطنبول|طرابزون|أنطاليا/i.test(targetCheck)) {
    airline = "Turkish Airlines / Saudia";
    airlineAr = "الخطوط الجوية التركية / الخطوط السعودية";
    duration = "3h 50m";
  } else if (/egypt|cairo|alexandria|hurghada|مصر|القاهرة|الإسكندرية/i.test(targetCheck)) {
    airline = "EgyptAir / Saudia";
    airlineAr = "مصر للطيران / الخطوط السعودية";
    duration = "2h 45m";
  } else if (/italy|rome|milan|venice|إيطاليا|روما|ميلانو/i.test(targetCheck)) {
    airline = "ITA Airways / Saudia";
    airlineAr = "الخطوط الجوية الإيطالية / الخطوط السعودية";
    duration = "5h 30m";
  } else if (/spain|madrid|barcelona|malaga|إسبانيا|مدريد|برشلونة/i.test(targetCheck)) {
    airline = "Iberia / Saudia";
    airlineAr = "الخطوط الجوية الإسبانية / الخطوط السعودية";
    duration = "6h 30m";
  } else if (/germany|berlin|munich|frankfurt/i.test(countryLower)) {
    airline = "Lufthansa / Saudia";
    airlineAr = "لوفتهانزا الألمانية / الخطوط السعودية";
    duration = "5h 55m";
  } else if (/switzerland|geneva|zurich/i.test(countryLower)) {
    airline = "Swiss International / Saudia";
    airlineAr = "الخطوط الجوية السويسرية / الخطوط السعودية";
    duration = "5h 40m";
  } else if (/austria|vienna/i.test(countryLower)) {
    airline = "Austrian Airlines / Saudia";
    airlineAr = "الخطوط النمساوية / الخطوط السعودية";
    duration = "5h 10m";
  } else if (/netherlands|amsterdam/i.test(countryLower)) {
    airline = "KLM Royal Dutch / Saudia";
    airlineAr = "الخطوط الملكية الهولندية KLM / الخطوط السعودية";
    duration = "6h 20m";
  } else if (/united arab emirates|uae|dubai|abu dhabi/i.test(countryLower)) {
    airline = "Emirates / Flydubai / Saudia";
    airlineAr = "طيران الإمارات / فلاي دبي / الخطوط السعودية";
    duration = "1h 55m";
  } else if (/qatar|doha/i.test(countryLower)) {
    airline = "Qatar Airways / Saudia";
    airlineAr = "الخطوط الجوية القطرية / الخطوط السعودية";
    duration = "1h 30m";
  } else if (/thailand|bangkok|phuket/i.test(countryLower)) {
    airline = "Thai Airways / Saudia";
    airlineAr = "الخطوط الجوية التايلاندية / الخطوط السعودية";
    duration = "8h 15m";
  } else if (/malaysia|kuala lumpur/i.test(countryLower)) {
    airline = "Malaysia Airlines / Saudia";
    airlineAr = "الخطوط الجوية الماليزية / الخطوط السعودية";
    duration = "8h 40m";
  } else if (/indonesia|bali/i.test(countryLower)) {
    airline = "Garuda Indonesia / Saudia";
    airlineAr = "جارودا إندونيسيا / الخطوط السعودية";
    duration = "9h 50m";
  } else if (/japan|tokyo/i.test(countryLower)) {
    airline = "Japan Airlines / ANA / Saudia";
    airlineAr = "الخطوط الجوية اليابانية / الخطوط السعودية";
    duration = "11h 20m";
  } else if (/united states|usa|new york|miami/i.test(countryLower)) {
    airline = "Delta Air Lines / Saudia";
    airlineAr = "خطوط دلتا الجوية / الخطوط السعودية";
    duration = "13h 40m";
  } else if (/maldives/i.test(countryLower)) {
    airline = "Emirates / Qatar Airways / Saudia";
    airlineAr = "طيران الإمارات / الخطوط القطرية / الخطوط السعودية";
    duration = "4h 45m";
  }

  return {
    airline,
    airlineAr,
    outbound: {
      departureTime: "08:30",
      departureAirport: depAirport,
      arrivalTime: "13:45",
      arrivalAirport: airportName,
      duration,
    },
    inbound: {
      departureTime: "16:20",
      departureAirport: airportName,
      arrivalTime: "22:50",
      arrivalAirport: depAirport,
      duration,
    },
  };
}

function getStopsForDay(
  dayPlan: any,
  dayIdx: number,
  destMeta: DestinationMetadata,
  isAr: boolean
) {
  return getAuthenticStopsForDay(dayPlan, dayIdx, destMeta, isAr);
}

export default function PackageDetailPage({ params }: Props) {
  const { slug } = use(params);
  const [rawPkg, setRawPkg] = useState<HolidayPackage | null>(() =>
    featuredPackages.find((p) => p.slug === slug) ?? null
  );
  const [catalog, setCatalog] = useState<HolidayPackage[]>(featuredPackages);
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedPackages().then((packages) => {
      if (cancelled) return;
      setCatalog(packages);
      const found = packages.find((p) => p.slug === slug || p.id === slug);
      setRawPkg(found ?? null);
      setCatalogReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const pkg = useMemo<EnrichedHolidayPackage | null>(() => {
    if (!rawPkg) return null;
    return enrichPackage(rawPkg);
  }, [rawPkg]);

  if (!pkg && !catalogReady) {
    return (
      <section className="pt-28 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 h-80 bg-slate-200 rounded-2xl animate-pulse" />
      </section>
    );
  }

  if (!pkg) {
    notFound();
  }

  return <PackageDetailContent pkg={pkg} catalog={catalog} slug={slug} />;
}

function PackageDetailContent({
  pkg,
  catalog,
  slug,
}: {
  pkg: EnrichedHolidayPackage;
  catalog: HolidayPackage[];
  slug: string;
}) {
  const { locale, dir, t } = useLocale();
  const isAr = locale === "ar";
  const { formatPrice } = useCurrency();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);

  const related = useMemo(() => {
    return catalog
      .filter(
        (p) =>
          p.slug !== pkg.slug &&
          (p.destination === pkg.destination ||
            p.country === pkg.country ||
            p.countryEn === pkg.countryEn)
      )
      .slice(0, 3);
  }, [pkg, catalog]);

  const pd = t.packageDetail;
  const title = tContent(pkg, "title", locale);
  const destMeta = resolveDestinationMeta(
    `${pkg.destination || ""} ${pkg.country || ""} ${pkg.title || ""} ${slug}`
  );
  const isMorocco = destMeta.countryEn === "Morocco";
  const isTurkey = destMeta.countryEn === "Turkey";
  const isEgypt = destMeta.countryEn === "Egypt";

  const destination = isAr
    ? (destMeta.cityAr || tContent(pkg, "destination", locale))
    : (destMeta.cityEn || tContent(pkg, "destination", locale));
  const country = isAr
    ? (destMeta.countryAr || tContent(pkg, "country", locale))
    : (destMeta.countryEn || tContent(pkg, "country", locale));
  const descriptionHtml = tContent(pkg, "description", locale);
  const nights = Math.max(1, pkg.durationDays - 1);
  const durationLabel = `${pkg.durationDays} ${pd.days} / ${nights} ${pd.nights}`;

  const itinerary = getLocalizedItinerary(pkg, locale);
  const inclusions = getLocalizedList(pkg, "inclusions", locale);
  const exclusions = getLocalizedList(pkg, "exclusions", locale);
  const features = getLocalizedList(pkg, "features", locale);
  const rules = getLocalizedList(pkg, "rules", locale);
  const tips = getLocalizedList(pkg, "tips", locale);
  const reviews = pkg.reviews ?? [];

  const isTr = isTurkey;

  const destinationPlaces = useMemo(() => {
    const q = `${destMeta.cityEn} ${destMeta.cityAr} ${destination}`;
    return getDestinationPlacesList(q);
  }, [destMeta.cityEn, destMeta.cityAr, destination]);

  // Authentic photos mapping for gallery from verified landmarks
  const images = useMemo(() => {
    if (pkg.images && pkg.images.length > 2) {
      return pkg.images;
    }
    const landmarkImages = destinationPlaces.slice(0, 6).map((p) => ({
      url: p.image,
      alt: isAr ? p.titleAr : p.titleEn,
      width: 1200,
      height: 800,
    }));
    return [
      {
        url: destMeta.coverUrl || landmarkImages[0]?.url || "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200",
        alt: title,
        width: 1200,
        height: 800,
      },
      ...landmarkImages,
    ];
  }, [pkg.images, destinationPlaces, destMeta.coverUrl, title, isAr]);

  // Dynamic Live Hotels from Provider Engine (Hotelbeds, Travelport, Ratehawk, Seeru)
  const [liveHotels, setLiveHotels] = useState<any[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setHotelsLoading(true);
    const qCity = destMeta.cityEn || destMeta.cityAr || "London";

    fetch(`/api/hotels/search?query=${encodeURIComponent(qCity)}&pageSize=8&lang=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data && data.ok && Array.isArray(data.hotels) && data.hotels.length > 0) {
          const sorted = [...data.hotels].sort(
            (a, b) => (Number(b.stars) || 0) - (Number(a.stars) || 0)
          );
          setLiveHotels(sorted.slice(0, 6));
        } else {
          setLiveHotels([]);
        }
      })
      .catch((err) => {
        console.warn("[Hotels] Live search error:", err);
        if (active) setLiveHotels([]);
      })
      .finally(() => {
        if (active) setHotelsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [destMeta.cityEn, destMeta.cityAr, locale]);

  const fallbackHotels = useMemo(() => {
    return getDestinationHotelOffers(destMeta, isAr);
  }, [destMeta, isAr]);

  const luxuryHotels = liveHotels.length > 0 ? liveHotels : fallbackHotels;

  // Dynamic Flight Route based on destination airport & country airlines
  const flightDetails = useMemo(() => {
    return resolveDynamicFlight(destMeta, isAr);
  }, [destMeta, isAr]);

  const mapPoints = (() => {
    const fromItinerary = itinerary
      .filter((d) => d.lat != null && d.lng != null)
      .map((d) => ({
        lat: d.lat as number,
        lng: d.lng as number,
        label: `${pd.days} ${d.day}: ${d.title}`,
        description: d.description,
        photo: (d as any).photo || images[0]?.url,
        day: d.day,
      }));

    if (fromItinerary.length > 0) return fromItinerary;

    if (pkg.mapPoints && pkg.mapPoints.length > 0) {
      return pkg.mapPoints.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        label: isAr ? p.labelAr : p.labelEn,
        description: isAr ? p.descriptionAr : p.descriptionEn,
        photo: p.photo || images[0]?.url,
        day: p.day,
      }));
    }

    const baseLat = destMeta.lat || 31.6295;
    const baseLng = destMeta.lng || -7.9811;

    return itinerary.map((d, idx) => {
      const latOffset = (idx % 3 === 0 ? 0.012 : idx % 3 === 1 ? -0.015 : 0.008) * (idx + 1);
      const lngOffset = (idx % 2 === 0 ? 0.014 : -0.012) * (idx + 1);
      return {
        lat: baseLat + latOffset,
        lng: baseLng + lngOffset,
        label: `${pd.days} ${d.day}: ${d.title}`,
        description: d.description,
        photo: images[idx % images.length]?.url || destMeta.coverUrl,
        day: d.day,
      };
    });
  })();

  const totalPrice = pkg.price || 3861;
  const perPersonPrice = Math.round(totalPrice / 2);

  const whatsappMessage = isAr
    ? `مرحباً لوناليزا، أود حجز باقة "${title}" إلى ${destination} (${durationLabel}). السعر: ${formatPrice(totalPrice, pkg.currency || "USD")}.`
    : `Hello Lonaliza, I would like to book "${title}" to ${destination} (${durationLabel}). Price: ${formatPrice(totalPrice, pkg.currency || "USD")}.`;

  const activeDayPlan = itinerary.find((d) => d.day === selectedDay) || itinerary[0];

  return (
    <>
      {/* 1. Ultra-Luxury Hero Section */}
      <section className="relative overflow-x-hidden bg-gradient-to-b from-[#090616] via-[#140E2C] to-[#1E1548] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.25),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8 lg:pt-32">
          {/* Breadcrumb & Navigation */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/holidays"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-102"
            >
              <ArrowLeft size={16} className={dir === "rtl" ? "rotate-180" : ""} />
              <span>{t.common.back} — {t.nav.holidays}</span>
            </Link>

            <div className="flex items-center gap-2">
              <ShareToCommunityButton
                service={{
                  id: pkg.id || pkg.slug,
                  type: "package",
                  title: title,
                  destination: destination,
                  price: totalPrice,
                  currency: pkg.currency || "USD",
                  imageUrl: images[0]?.url,
                  url: `/package/${pkg.slug}`,
                }}
                variant="pill"
              />
            </div>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-2xl shadow-violet-950/50">
                <Image
                  src={images[activeImage]?.url ?? images[0].url}
                  alt={images[activeImage]?.alt ?? title}
                  fill
                  className="object-cover transition-all duration-500"
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Floating Image Badges */}
                <div className="absolute top-4 start-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-black text-white shadow-lg">
                    <Crown size={13} className="text-amber-200" />
                    <span>{isAr ? "برنامج VIP معتمد" : "Certified VIP Package"}</span>
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/20">
                    {country}
                  </span>
                </div>

                <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between text-white/90 text-xs">
                  <span className="font-semibold">{destination}</span>
                  <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-mono">
                    {activeImage + 1} / {images.length}
                  </span>
                </div>
              </div>

              {/* Thumbnails Rail */}
              {images.length > 1 && (
                <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`relative h-18 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                        activeImage === idx
                          ? "border-[#A855F7] ring-2 ring-violet-500/50 scale-102"
                          : "border-white/20 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Highlights Column (5 cols) */}
            <div className="flex flex-col justify-between lg:col-span-5">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#7C3AED]/30 border border-[#A855F7]/40 px-3 py-1 text-xs font-bold text-violet-200">
                    <Car size={13} className="text-amber-300" />
                    {isAr ? "سيارة مرسيدس خاصة VIP" : "Private Mercedes Chauffeur"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                    <ShieldCheck size={13} />
                    {isAr ? "تأكيد فوري 100%" : "Instant Guarantee"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white">
                  {title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-amber-400" />
                    <span className="font-semibold">{destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-amber-400" />
                    <span className="font-semibold">{durationLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-300">{pkg.rating || 4.9}</span>
                    <span className="text-xs text-white/60">({reviews.length || 24}+ {isAr ? "تقييم" : "reviews"})</span>
                  </div>
                </div>

                {/* Quick VIP Highlights Banner */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md space-y-2.5">
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {isAr ? "مميزات الباقة الحصرية:" : "Exclusive Package Highlights:"}
                  </p>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-white/90">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? "طيران دولي ذهاب وعودة مع حقائب 23 كجم" : "Round-trip flights with 23kg luggage"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? "إقامة فندقية فاخرة 5 نجوم مع بوفيه إفطار يومي" : "5-Star Luxury hotel stay with daily breakfast"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? "سيارة مرسيدس فيتو VIP خاصة وسائق مرافق طوال الرحلة" : "Private Mercedes Vito with multilingual chauffeur"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? "تذاكر المعالم والمزارات التاريخية مع مرشد خاص" : "VIP fast-track passes to iconic landmarks"}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Price Preview & Instant CTAs */}
              <div className="mt-6 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-white/10 via-violet-900/30 to-black/40 p-4 sm:p-5 backdrop-blur-md">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-amber-200/80 uppercase block">
                      {isAr ? "السعر الإجمالي للباقة (شخصين):" : "Total Package Price (2 Adults):"}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                      {formatPrice(totalPrice, pkg.currency || "USD")}
                    </span>
                  </div>
                  <div className="text-end">
                    <span className="text-xs text-white/60 block">{isAr ? "للفرد الواحد:" : "Per Person:"}</span>
                    <span className="text-lg font-bold text-white">
                      {formatPrice(perPersonPrice, pkg.currency || "USD")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Link
                    href={`/package/book?slug=${encodeURIComponent(pkg.slug)}&total=${totalPrice}&days=${pkg.durationDays}&dest=${encodeURIComponent(destination)}`}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] px-4 font-black text-white shadow-lg shadow-violet-600/30 transition hover:scale-102 active:scale-98"
                  >
                    <Zap size={16} className="text-amber-300 fill-amber-300" />
                    <span>{isAr ? "احجز الآن مباشرة" : "Book Instantly"}</span>
                  </Link>

                  <a
                    href={buildBusinessWhatsAppLink(whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#128C7E] px-4 font-bold text-white shadow-md transition hover:bg-[#0e7467] active:scale-98"
                  >
                    <Phone size={15} />
                    <span>{isAr ? "تواصل مع خبير الرحلة" : "WhatsApp Expert"}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Booking Column */}
      <section className="bg-[#FAF8FD] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left/Main Column: 8 cols */}
            <div className="space-y-8 lg:col-span-8">
              {/* 1. Top Full-Width Live Flight & 5-Star Hotel Showcase */}
              <PackageFlightHotelHeroShowcase
                destMeta={destMeta}
                destination={destination}
                flightDetails={flightDetails}
                luxuryHotels={luxuryHotels}
                hotelsLoading={hotelsLoading}
              />

              {/* 2. Smart VIP Travel Concierge (Compact Banner + Floating Capsule + Slide-out Drawer) */}
              <PackageAiConsultant
                pkg={pkg}
                destMeta={destMeta}
                destination={destination}
                country={country}
                totalPrice={totalPrice}
                itinerary={itinerary}
                flightDetails={flightDetails}
                luxuryHotels={luxuryHotels}
                images={images}
              />

              {/* 3. Interactive Sequential Daily Itinerary Timeline */}
              <div className="rounded-3xl border border-violet-100 bg-white p-5 sm:p-7 shadow-sm">
                <SectionHeading
                  icon={<Calendar size={18} />}
                  badge={`${itinerary.length} ${isAr ? "أيام سياحية غنية" : "Curated Days"}`}
                >
                  {isAr ? "تفاصيل الجدول اليومي والمزارات بصور حية" : "Detailed Day-by-Day Itinerary & Places"}
                </SectionHeading>

                {/* Day selector / Quick jump anchor pill bar */}
                <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
                  {itinerary.map((d) => (
                    <a
                      key={d.day}
                      href={`#day-${d.day}`}
                      className="group flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/60 px-3.5 text-xs font-bold text-slate-700 transition hover:bg-[#7C3AED] hover:text-white hover:border-[#7C3AED]"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-200 text-[#4C1D95] text-[10px] font-black group-hover:bg-white/20 group-hover:text-white">
                        {d.day}
                      </span>
                      <span>{isAr ? `اليوم ${d.day}` : `Day ${d.day}`}</span>
                    </a>
                  ))}
                </div>

                {/* Full sequential vertical timeline connecting all days */}
                <div className="relative space-y-8 before:absolute before:top-4 before:bottom-4 before:start-4 sm:before:start-5 before:w-0.5 before:bg-violet-200">
                  {itinerary.map((dayPlan, dayIdx) => {
                    const stopsForDay = getStopsForDay(dayPlan, dayIdx, destMeta, isAr);
                    const stop1 = stopsForDay[0];
                    const stop2 = stopsForDay[1];
                    const stop3 = stopsForDay[2];

                    return (
                      <div
                        key={dayPlan.day}
                        id={`day-${dayPlan.day}`}
                        className="relative ps-11 sm:ps-14 scroll-mt-24"
                      >
                        {/* Day badge positioned on the vertical connecting timeline */}
                        <div className="absolute start-0 top-0 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-amber-300 font-black text-xs sm:text-sm shadow-md shadow-violet-500/25 ring-4 ring-white">
                          {dayPlan.day}
                        </div>

                        {/* Day content card */}
                        <div className="rounded-2xl border border-violet-100/90 bg-gradient-to-b from-[#FBF9FF] to-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-violet-300 transition">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100 pb-3">
                            <div>
                              <span className="text-xs font-bold text-[#7C3AED] uppercase block">
                                {isAr ? `اليوم ${dayPlan.day}` : `Day ${dayPlan.day}`}
                              </span>
                              <h3 className="text-lg sm:text-xl font-black text-[#1A1438]">
                                {dayPlan.title}
                              </h3>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-[#7C3AED]">
                              <Car size={13} />
                              {isAr ? "مرسيدس فيتو VIP خاصة وسائق (10 ساعات)" : "Mercedes Vito VIP Chauffeur (10h)"}
                            </span>
                          </div>

                          <p className="text-sm leading-relaxed text-slate-700">
                            {dayPlan.description}
                          </p>

                          {/* Day Highlights Photo Showcase */}
                          <div className="pt-2">
                            <p className="text-xs font-black text-slate-900 mb-2.5">
                              {isAr ? "أبرز محطات ومزارات هذا اليوم:" : "Key Highlights & Sights of the Day:"}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-3">
                              {/* Morning Stop */}
                              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs group/item hover:border-violet-200 transition">
                                <div className="relative aspect-[16/10] overflow-hidden">
                                  <Image
                                    src={stop1.image || destMeta.coverUrl}
                                    alt={isAr ? (stop1.titleAr || (stop1 as any).title) : (stop1.titleEn || (stop1 as any).title)}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                                  />
                                  <span className="absolute top-2 start-2 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                    {isAr ? (stop1.slotAr || "الصباح 09:30 - 13:00") : (stop1.slotEn || "Morning 09:30 - 13:00")}
                                  </span>
                                  <span className="absolute top-2 end-2 rounded-md bg-emerald-600/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    {isAr ? "وكيل خرائط جوجل" : "Google Maps"}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <p className="text-xs font-bold text-[#1A1438] line-clamp-1">
                                      {isAr ? (stop1.titleAr || (stop1 as any).title) : (stop1.titleEn || (stop1 as any).title)}
                                    </p>
                                    {stop1.rating && (
                                      <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 shrink-0">
                                        <Star size={10} className="fill-amber-400 text-amber-400" />
                                        <span>{stop1.rating}</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {isAr ? (stop1.detailAr || (stop1 as any).description || "") : (stop1.detailEn || (stop1 as any).description || "")}
                                  </p>
                                </div>
                              </div>

                              {/* Afternoon Stop */}
                              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs group/item hover:border-violet-200 transition">
                                <div className="relative aspect-[16/10] overflow-hidden">
                                  <Image
                                    src={stop2.image || destMeta.coverUrl}
                                    alt={isAr ? (stop2.titleAr || (stop2 as any).title) : (stop2.titleEn || (stop2 as any).title)}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                                  />
                                  <span className="absolute top-2 start-2 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                    {isAr ? (stop2.slotAr || "الظهيرة 14:00 - 17:30") : (stop2.slotEn || "Afternoon 14:00 - 17:30")}
                                  </span>
                                  <span className="absolute top-2 end-2 rounded-md bg-emerald-600/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    {isAr ? "وكيل خرائط جوجل" : "Google Maps"}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <p className="text-xs font-bold text-[#1A1438] line-clamp-1">
                                      {isAr ? (stop2.titleAr || (stop2 as any).title) : (stop2.titleEn || (stop2 as any).title)}
                                    </p>
                                    {stop2.rating && (
                                      <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 shrink-0">
                                        <Star size={10} className="fill-amber-400 text-amber-400" />
                                        <span>{stop2.rating}</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {isAr ? (stop2.detailAr || (stop2 as any).description || "") : (stop2.detailEn || (stop2 as any).description || "")}
                                  </p>
                                </div>
                              </div>

                              {/* Evening Stop */}
                              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs group/item hover:border-violet-200 transition">
                                <div className="relative aspect-[16/10] overflow-hidden">
                                  <Image
                                    src={stop3.image || destMeta.coverUrl}
                                    alt={isAr ? (stop3.titleAr || (stop3 as any).title) : (stop3.titleEn || (stop3 as any).title)}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                                  />
                                  <span className="absolute top-2 start-2 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                    {isAr ? (stop3.slotAr || "المساء 18:30 - 21:30") : (stop3.slotEn || "Evening 18:30 - 21:30")}
                                  </span>
                                  <span className="absolute top-2 end-2 rounded-md bg-emerald-600/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    {isAr ? "وكيل خرائط جوجل" : "Google Maps"}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <p className="text-xs font-bold text-[#1A1438] line-clamp-1">
                                      {isAr ? (stop3.titleAr || (stop3 as any).title) : (stop3.titleEn || (stop3 as any).title)}
                                    </p>
                                    {stop3.rating && (
                                      <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 shrink-0">
                                        <Star size={10} className="fill-amber-400 text-amber-400" />
                                        <span>{stop3.rating}</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {isAr ? (stop3.detailAr || (stop3 as any).description || "") : (stop3.detailEn || (stop3 as any).description || "")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Interactive Route Map */}
              {mapPoints.length > 0 && (
                <div className="rounded-3xl border border-violet-100 bg-white p-5 sm:p-7 shadow-sm">
                  <SectionHeading
                    icon={<MapPin size={18} />}
                    badge={isAr ? "مسار تفاعلي حي" : "Live Interactive Route"}
                  >
                    {pd.map}
                  </SectionHeading>
                  <OsmRouteMap points={mapPoints} className="h-[440px] rounded-2xl overflow-hidden" />
                </div>
              )}
            </div>

            {/* Left/Sidebar Sticky Column: 4 cols */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-5">
                {/* 1. Verified VIP Price Card */}
                <div className="overflow-hidden rounded-3xl border border-violet-200/80 bg-white shadow-xl shadow-violet-950/10">
                  {/* Card Header with Royal Purple Gradient */}
                  <div className="bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#4C1D95] p-6 text-white">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      {isAr ? "السعر الإجمالي المعتمد (شخصين):" : "Verified Total Price (2 Guests):"}
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                        {formatPrice(totalPrice, pkg.currency || "USD")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/80 font-medium">
                      {formatPrice(perPersonPrice, pkg.currency || "USD")} {isAr ? "للفرد الواحد شامل كل الخدمات" : "per person all-inclusive"}
                    </p>
                  </div>

                  <div className="p-6 space-y-4 text-slate-700 text-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Clock size={16} className="text-[#7C3AED]" />
                        {isAr ? "المدة" : "Duration"}
                      </span>
                      <span className="font-bold text-[#1A1438]">{durationLabel}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Users size={16} className="text-[#7C3AED]" />
                        {isAr ? "المسافرون" : "Travelers"}
                      </span>
                      <span className="font-bold text-[#1A1438]">{isAr ? "شخصين (زوجين / مرافقين)" : "2 Adults (Couple)"}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Plane size={16} className="text-[#7C3AED]" />
                        {isAr ? "الطيران" : "Flights"}
                      </span>
                      <span className="font-bold text-emerald-600">{isAr ? "مشمول مباشر 100%" : "Included"}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Car size={16} className="text-[#7C3AED]" />
                        {isAr ? "التنقلات" : "Transfers"}
                      </span>
                      <span className="font-bold text-[#1A1438]">{isAr ? "مرسيدس فيتو VIP خاصة" : "VIP Vito"}</span>
                    </div>

                    {/* Booking Buttons */}
                    <div className="space-y-2.5 pt-2">
                      <Link
                        href={`/package/book?slug=${encodeURIComponent(pkg.slug)}&total=${totalPrice}&days=${pkg.durationDays}&dest=${encodeURIComponent(destination)}`}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] px-4 font-black text-white shadow-lg shadow-violet-600/30 transition hover:scale-102 active:scale-98"
                      >
                        <Zap size={18} className="fill-amber-300 text-amber-300" />
                        <span>{isAr ? "احجز الآن مباشرة (تأكيد فوري)" : "Book Instantly Online"}</span>
                        <ChevronRight size={18} className={dir === "rtl" ? "rotate-180" : ""} />
                      </Link>

                      <a
                        href={buildBusinessWhatsAppLink(whatsappMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-700 font-bold transition hover:bg-emerald-100"
                      >
                        <Phone size={16} />
                        <span>{isAr ? "استفسار فوري عبر واتساب" : "WhatsApp Inquiry"}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setIsEnquiryOpen(true)}
                        className="flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        {isAr ? "طلب تعديل أو برنامج مخصص" : "Request Custom Plan"}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <ShieldCheck size={14} />
                        {isAr ? "حجز آمن 100%" : "Secure Booking"}
                      </span>
                      <span>•</span>
                      <span>{isAr ? "دعم عربي 24/7" : "24/7 Support"}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Visa Intelligence Card */}
                <PackageVisaCard
                  country={country}
                  destination={destination}
                />

                {/* 3. Travel Advisories & Guidelines */}
                <div className="rounded-3xl border border-violet-100 bg-white p-5 sm:p-6 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-violet-50 pb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-[#7C3AED]">
                      <Compass size={17} />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-[#1A1438]">
                        {isAr ? `إرشادات السفر الهامة إلى ${destination}` : `Travel Guidelines for ${destination}`}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isAr ? "توجيهات معتمدة من خبرائنا" : "Verified by our local team"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="rounded-2xl border border-violet-50 bg-[#FAF9FD] p-3 space-y-1">
                      <span className="text-[11px] font-black text-[#7C3AED] flex items-center gap-1.5">
                        <Calendar size={13} />
                        {isAr ? "أفضل أوقات الزيارة والطقس:" : "Best Seasons & Weather:"}
                      </span>
                      <p className="leading-relaxed text-[11px]">
                        {destMeta.bestMonthsAr}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-violet-50 bg-[#FAF9FD] p-3 space-y-1.5">
                      <span className="text-[11px] font-black text-slate-900 block">
                        {isAr ? "نصائح وتوصيات ذهبية:" : "Golden Recommendations:"}
                      </span>
                      <ul className="space-y-1.5 text-[11px]">
                        {destMeta.guidelinesAr.slice(0, 3).map((g, gIdx) => (
                          <li key={gIdx} className="flex items-start gap-1.5">
                            <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 4. Inclusions & Exclusions Card */}
                <div className="rounded-3xl border border-emerald-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <CheckCircle size={18} />
                      </span>
                      <h3 className="text-sm font-black text-emerald-950">
                        {isAr ? "ما تشمله الباقة وما لا تشمله" : "Inclusions & Exclusions"}
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      VIP 100%
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-black text-emerald-800 uppercase block mb-1.5">
                        {isAr ? "المشتملات المؤكدة:" : "Confirmed Inclusions:"}
                      </span>
                      <ul className="space-y-2 text-[11px] text-slate-800">
                        <li className="flex items-start gap-2">
                          <Car size={13} className="mt-0.5 shrink-0 text-emerald-600 font-bold" />
                          <span>{isAr ? "سيارة مرسيدس فيتو VIP خاصة وسائق مرافق طوال الرحلة" : "Private Mercedes Vito VIP & chauffeur"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Hotel size={13} className="mt-0.5 shrink-0 text-emerald-600 font-bold" />
                          <span>{isAr ? "إقامة فندقية 5 نجوم ديلوكس مع إفطار يومي" : "5-Star Deluxe Hotel stay with daily breakfast"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Plane size={13} className="mt-0.5 shrink-0 text-emerald-600 font-bold" />
                          <span>{isAr ? "تذاكر طيران دولية ذهاب وعودة مع حقائب 23 كجم" : "Round-trip flights with 23kg luggage"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Sparkles size={13} className="mt-0.5 shrink-0 text-emerald-600 font-bold" />
                          <span>{isAr ? "تذاكر المزارات والمعالم مع أولوية دخول VIP" : "VIP fast-track passes to iconic landmarks"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-600 font-bold" />
                          <span>{isAr ? "كونسيرج ومساعد سفر شخصي 24/7" : "24/7 Dedicated Concierge support"}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-[11px] font-black text-slate-600 uppercase block mb-1.5">
                        {isAr ? "غير مشمول:" : "Not Included:"}
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-slate-500">
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                          <span>{isAr ? "المصاريف الشخصية والمشتريات الخاصة" : "Personal expenses and shopping"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                          <span>{isAr ? "الأنشطة الإضافية غير المذكورة بالجدول" : "Optional extra activities"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                          <span>{isAr ? "رسوم التأشيرة (نقدم الدعم الكامل لاستخراجها)" : "Visa fees (we assist you directly)"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      {isEnquiryOpen && (
        <EnquiryModal
          isOpen={isEnquiryOpen}
          onClose={() => setIsEnquiryOpen(false)}
          packageName={title}
          destination={destination}
        />
      )}
    </>
  );
}
