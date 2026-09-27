"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { featuredPackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import type { HolidayPackage } from "@/types/package";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { tContent } from "@/lib/utils";

const destinationInfo: Record<
  string,
  {
    nameAr: string;
    nameEn: string;
    nameTr: string;
    descriptionAr: string;
    descriptionEn: string;
    descriptionTr: string;
    heroImage: string;
    highlightsAr: string[];
    highlightsEn: string[];
    highlightsTr: string[];
    match: string[];
  }
> = {
  istanbul: {
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    nameTr: "İstanbul",
    descriptionAr: "حيث تلتقي أوروبا وآسيا — مساجد تاريخية، البوسفور، والسوق الكبير ضمن برامج متعددة الأيام.",
    descriptionEn: "Where Europe meets Asia — historic mosques, the Bosphorus, and the Grand Bazaar in multi-day programs.",
    descriptionTr: "Avrupa ile Asya’nın buluştuğu şehir — çok günlük programlarda camiler, Boğaz ve Kapalıçarşı.",
    heroImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920",
    highlightsAr: ["آيا صوفيا", "البوسفور", "السوق الكبير", "سلطان أحمت"],
    highlightsEn: ["Hagia Sophia", "Bosphorus", "Grand Bazaar", "Sultanahmet"],
    highlightsTr: ["Ayasofya", "Boğaz", "Kapalıçarşı", "Sultanahmet"],
    match: ["istanbul"],
  },
  antalya: {
    nameAr: "أنطاليا",
    nameEn: "Antalya",
    nameTr: "Antalya",
    descriptionAr: "متوسط تركيا: شواطئ المنتجعات وكاليتشي وبرامج شاطئ وثقافة.",
    descriptionEn: "Turkey’s Mediterranean — resort beaches, Kaleiçi, and beach-and-culture programs.",
    descriptionTr: "Türkiye’nin Akdenizi — tesis plajları, Kaleiçi, plaj ve kültür programları.",
    heroImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920",
    highlightsAr: ["كاليتشي", "منتجعات الشاطئ", "شلالات دودان"],
    highlightsEn: ["Kaleiçi", "Beach resorts", "Düden Falls"],
    highlightsTr: ["Kaleiçi", "Sahil tesisleri", "Düden Şelalesi"],
    match: ["antalya"],
  },
  cappadocia: {
    nameAr: "كابادوكيا",
    nameEn: "Cappadocia",
    nameTr: "Kapadokya",
    descriptionAr: "مداخن جنية، فنادق كهف، ومنطاد عند الشروق ضمن برامج ليالٍ حقيقية.",
    descriptionEn: "Fairy chimneys, cave hotels, and sunrise balloons inside real overnight programs.",
    descriptionTr: "Peri bacaları, mağara otelleri ve gün doğumu balonları — gerçek konaklamalı programlar.",
    heroImage: "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=1920",
    highlightsAr: ["المنطاد", "فنادق الكهف", "وادي غوريم"],
    highlightsEn: ["Hot air balloon", "Cave hotels", "Göreme Valley"],
    highlightsTr: ["Balon", "Mağara otelleri", "Göreme Vadisi"],
    match: ["cappadocia", "kapadokya"],
  },
  trabzon: {
    nameAr: "طرابزون",
    nameEn: "Trabzon",
    nameTr: "Trabzon",
    descriptionAr: "البحر الأسود: أوزنجول، الهضاب، وبرامج متعددة الأيام.",
    descriptionEn: "The Black Sea — Uzungöl, highlands, and multi-day programs.",
    descriptionTr: "Karadeniz — Uzungöl, yaylalar ve çok günlük programlar.",
    heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920",
    highlightsAr: ["أوزنجول", "سوميلا", "آيدر"],
    highlightsEn: ["Uzungöl", "Sümela", "Ayder"],
    highlightsTr: ["Uzungöl", "Sümela", "Ayder"],
    match: ["trabzon", "uzungol", "ayder"],
  },
  bursa: {
    nameAr: "بورصة",
    nameEn: "Bursa",
    nameTr: "Bursa",
    descriptionAr: "أول عاصمة عثمانية مع أولوداغ وبرامج إقامة.",
    descriptionEn: "The first Ottoman capital with Uludağ and overnight programs.",
    descriptionTr: "İlk Osmanlı başkenti — Uludağ ve konaklamalı programlar.",
    heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920",
    highlightsAr: ["أولوداغ", "المسجد الأخضر", "حمّامات"],
    highlightsEn: ["Uludağ", "Green Mosque", "Thermal baths"],
    highlightsTr: ["Uludağ", "Yeşil Camii", "Kaplıcalar"],
    match: ["bursa"],
  },
  sapanca: {
    nameAr: "سبانجا",
    nameEn: "Sapanca",
    nameTr: "Sapanca",
    descriptionAr: "بحيرة وطبيعة مع المعشوقية — إقامة وليس مقال فنادق.",
    descriptionEn: "Lake and nature with Maşukiye — a stay, not a hotels article.",
    descriptionTr: "Göl ve doğa, Maşukiye ile — otel yazısı değil, konaklama.",
    heroImage: "https://images.unsplash.com/photo-1439066615861-d1af74d77396?w=1920",
    highlightsAr: ["بحيرة سبانجا", "المعشوقية", "كابينات"],
    highlightsEn: ["Sapanca Lake", "Maşukiye", "Nature cabins"],
    highlightsTr: ["Sapanca Gölü", "Maşukiye", "Doğa kabinleri"],
    match: ["sapanca"],
  },
  ayder: {
    nameAr: "آيدر",
    nameEn: "Ayder",
    nameTr: "Ayder",
    descriptionAr: "هضاب ريزا والشلالات ضمن برامج البحر الأسود.",
    descriptionEn: "Rize highlands and waterfalls inside Black Sea programs.",
    descriptionTr: "Rize yaylaları ve şelaleler — Karadeniz programlarında.",
    heroImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920",
    highlightsAr: ["هضبة آيدر", "شلالات", "ينابيع"],
    highlightsEn: ["Ayder Plateau", "Waterfalls", "Hot springs"],
    highlightsTr: ["Ayder Yaylası", "Şelaleler", "Kaplıcalar"],
    match: ["ayder", "trabzon"],
  },
  bodrum: {
    nameAr: "بودروم",
    nameEn: "Bodrum",
    nameTr: "Bodrum",
    descriptionAr: "إيجه: ميناء وقلعة وشاطئ في برامج متعددة الأيام.",
    descriptionEn: "The Aegean — harbour, castle, and beach in multi-day programs.",
    descriptionTr: "Ege — liman, kale ve plajlı çok günlük programlar.",
    heroImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1920",
    highlightsAr: ["القلعة", "الميناء", "الشاطئ"],
    highlightsEn: ["Castle", "Harbour", "Beach"],
    highlightsTr: ["Kale", "Liman", "Plaj"],
    match: ["bodrum"],
  },
  izmir: {
    nameAr: "إزمير",
    nameEn: "Izmir",
    nameTr: "İzmir",
    descriptionAr: "إزمير وأفسس وتشيشمه ضمن برامج الساحل الغربي.",
    descriptionEn: "Izmir, Ephesus, and Çeşme in western-coast programs.",
    descriptionTr: "İzmir, Efes ve Çeşme — batı kıyısı programları.",
    heroImage: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1920",
    highlightsAr: ["أفسس", "كمرألتي", "تشيشمه"],
    highlightsEn: ["Ephesus", "Kemeraltı", "Çeşme"],
    highlightsTr: ["Efes", "Kemeraltı", "Çeşme"],
    match: ["izmir"],
  },
};

interface Props {
  params: Promise<{ destination: string }>;
}

export default function DestinationPage({ params }: Props) {
  const { destination } = use(params);
  const router = useRouter();
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const slug = destination.toLowerCase();
  const info = destinationInfo[slug];
  const cat = t.catalog;

  const [allPackages, setAllPackages] = useState(featuredPackages);

  useEffect(() => {
    void fetchPublishedPackages().then(setAllPackages);
  }, []);

  const pkgMatch = allPackages.find((p: HolidayPackage) => p.slug === destination);
  if (pkgMatch && !info) {
    router.replace(`/package/${pkgMatch.slug}`);
    return null;
  }

  if (!info) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">{cat.comingSoon}</p>
        <Link href="/holidays" className="text-orange-600 font-semibold">
          {t.nav.holidays}
        </Link>
      </div>
    );
  }

  const name =
    locale === "ar" ? info.nameAr : locale === "tr" ? info.nameTr : info.nameEn;
  const description =
    locale === "ar"
      ? info.descriptionAr
      : locale === "tr"
        ? info.descriptionTr
        : info.descriptionEn;
  const highlights =
    locale === "ar"
      ? info.highlightsAr
      : locale === "tr"
        ? info.highlightsTr
        : info.highlightsEn;

  const packages = allPackages.filter((pkg) => {
    const hay = [
      pkg.destination,
      pkg.destinationEn,
      pkg.destinationAr,
      ...(pkg.destinations ?? []),
      ...(pkg.destinationsEn ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return info.match.some((token) => hay.includes(token));
  });

  return (
    <>
      <section className="relative h-[50vh] min-h-[400px]">
        <Image src={info.heroImage} alt={name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <Link
          href="/holidays"
          className="absolute top-24 start-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full"
        >
          <ArrowLeft size={18} className="rtl:rotate-180" />
          <span>{t.nav.holidays}</span>
        </Link>
        <div className="absolute bottom-0 inset-x-0 z-10 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="inline-flex mb-4 items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
              {cat.inTurkey}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{name}</h1>
            <p className="text-lg text-white/80 max-w-2xl">{description}</p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{cat.popularHighlights}</h2>
          <div className="flex flex-wrap gap-3">
            {highlights.map((highlight) => (
              <span key={highlight} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium">
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
            {cat.destinationPackages(name)}
          </h2>
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/package/${pkg.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl"
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={pkg.images[0]?.url || ""}
                      alt={tContent(pkg, "title", locale)}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <span className="absolute top-4 start-4 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                      {cat.inTurkey}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <MapPin size={14} />
                      <span>{tContent(pkg, "destination", locale)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {tContent(pkg, "title", locale)}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {pkg.durationDays} {cat.days}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        {pkg.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">{formatPrice(pkg.price, pkg.currency || "USD")}</span>
                        <span className="text-slate-500 text-sm">{cat.perPerson}</span>
                      </div>
                      <span className="flex items-center gap-1 text-blue-600 font-semibold text-sm">
                        {cat.view} <ArrowRight size={16} className="rtl:rotate-180" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <h3 className="text-xl font-bold mb-2">{cat.comingSoon}</h3>
              <Link href="/contact" className="text-orange-600 font-semibold">
                {cat.customQuote}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
