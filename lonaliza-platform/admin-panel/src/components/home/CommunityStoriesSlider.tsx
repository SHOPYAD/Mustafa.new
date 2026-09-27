"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Star,
  MessageCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  ArrowRight,
} from "lucide-react";
import type { ParsedTravelPost } from "@/lib/nostr/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const STORIES_I18N = {
  ar: {
    badge: "مجتمع السفر التفاعلي",
    title: "تجارب ومراجعات حقيقية يدونها ضيوفنا",
    subtitle: "اكتشف تقييمات واقعية وموثقة من مسافرين عاشوا التجربة بالفعل، وشارك تقريرك لتكسب رصيد مكافآت يخصم من رحلتك القادمة.",
    joinCommunity: "انضم إلى مجتمع السفر وشارك تجربتك",
    verifiedBooking: "حجز مؤكد",
    viewStory: "عرض التجربة",
    verifiedTraveler: "مسافر موثق",
    prevStories: "التجارب السابقة",
    nextStories: "التجارب التالية",
  },
  en: {
    badge: "Interactive Travel Community",
    title: "Real Experiences & Reviews Written by Our Guests",
    subtitle: "Discover authentic, verified reviews from travelers who lived the journey, and share your own travel story to earn travel credits.",
    joinCommunity: "Join the Community & Share Your Trip",
    verifiedBooking: "Verified Booking",
    viewStory: "View Experience",
    verifiedTraveler: "Verified Traveler",
    prevStories: "Previous Experiences",
    nextStories: "Next Experiences",
  },
  tr: {
    badge: "İnteraktif Gezgin Topluluğu",
    title: "Misafirlerimizin Kaleminden Gerçek Deneyimler",
    subtitle: "Gerçek gezginlerin onaylı seyahat değerlendirmelerini keşfedin, kendi anılarınızı paylaşarak sonraki seyahatiniz için indirim kazanın.",
    joinCommunity: "Topluluğa Katıl & Deneyimini Paylaş",
    verifiedBooking: "Onaylı Rezervasyon",
    viewStory: "Deneyimi İncele",
    verifiedTraveler: "Onaylı Gezgin",
    prevStories: "Önceki Deneyimler",
    nextStories: "Sonraki Deneyimler",
  },
  fr: {
    badge: "Communauté de Voyage Interactive",
    title: "Expériences Réelles & Avis Partagés par nos Clients",
    subtitle: "Découvrez des avis authentiques et vérifiés de voyageurs, et partagez votre carnet de voyage pour cumuler des crédits de fidélité.",
    joinCommunity: "Rejoindre la Communauté & Partager",
    verifiedBooking: "Réservation Vérifiée",
    viewStory: "Voir l'Expérience",
    verifiedTraveler: "Voyageur Vérifié",
    prevStories: "Expériences Précédentes",
    nextStories: "Expériences Suivantes",
  },
} as const;

type SupportedLocale = keyof typeof STORIES_I18N;

const FALLBACK_STORIES_BY_LOCALE: Record<SupportedLocale, ParsedTravelPost[]> = {
  ar: [
    {
      id: "story_01",
      pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
      content: "إقامة استثنائية في اسطنبول! الإطلالة على مضيق البوسفور من الفندق لا تُنسى، وجولة اليخت الخاص وقت الغروب كانت قمة في الروعة والتنظيم الفاخر مع لوناليزا. أنصح كل زائر باختيار الغرف المطلة على البوسفور مباشرة. ✨🇹🇷",
      created_at: Math.floor(Date.now() / 1000) - 3600,
      category: "hotels",
      categoryName: "الفنادق والمنتجعات",
      destination: "اسطنبول",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 64,
      commentsCount: 9,
      viewsCount: 1450,
      booking: {
        id: "bk_01",
        type: "hotel",
        title: "حجز جناح البوسفور الملكي وجولة يخت خاص",
        destination: "اسطنبول",
        typeLabel: "فندق ويخت فاخر",
      },
      author: {
        pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
        name: "أحمد بن سلطان",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AhmedSultan",
        tier: "سفير لوناليزا VIP",
      },
    },
    {
      id: "story_02",
      pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
      content: "رحلتنا إلى طرابزون ومرتفعات أوزنجول الساحرة! الأكواخ الخشبية وسط الغيوم وتدفق الشلالات تجربة خيالية للأسر. السائق الخاص من لوناليزا كان خبيراً ودوداً ومرشداً سياحياً محترفاً بأعلى المقاييس. 🏔️🌲",
      created_at: Math.floor(Date.now() / 1000) - 14400,
      category: "tours",
      categoryName: "الجولات والبرامج السياحية",
      destination: "طرابزون",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 89,
      commentsCount: 14,
      viewsCount: 2100,
      booking: {
        id: "bk_02",
        type: "tour",
        title: "برنامج سياحي عائلي 7 أيام في الشمال التركي",
        destination: "طرابزون",
        typeLabel: "جولات وسائق خاص",
      },
      author: {
        pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
        name: "سارة المهندي",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SaraM",
        tier: "نخبة السفر البلاتينية",
      },
    },
    {
      id: "story_03",
      pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
      content: "خدمة سيارة مرسيدس فيانو VIP مع سائق خاص يتحدث العربية في اسطنبول وبورصة. دقة المواعيد وسرعة التوصيل وراحة السيارة مع شاشة وواي فاي جعلت الرحلة ممتعة بدون أي إرهاق. 🚘✨",
      created_at: Math.floor(Date.now() / 1000) - 28800,
      category: "transfers",
      categoryName: "الترانسفير والسيارات الخاصة",
      destination: "بورصة",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 42,
      commentsCount: 6,
      viewsCount: 980,
      booking: {
        id: "bk_03",
        type: "car",
        title: "خدمة سيارة VIP خاصة مع سائق 5 أيام",
        destination: "بورصة",
        typeLabel: "ترانسفير VIP",
      },
      author: {
        pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
        name: "محمد العتيبي",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Otaibi",
        tier: "رحالة ذهبي VIP",
      },
    },
  ],
  en: [
    {
      id: "story_01",
      pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
      content: "Exceptional stay in Istanbul! The view over the Bosphorus Strait from our hotel was unforgettable, and the private sunset yacht tour was pure luxury. I highly recommend booking waterfront suites through Lonaliza. ✨🇹🇷",
      created_at: Math.floor(Date.now() / 1000) - 3600,
      category: "hotels",
      categoryName: "Hotels & Resorts",
      destination: "Istanbul",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 64,
      commentsCount: 9,
      viewsCount: 1450,
      booking: {
        id: "bk_01",
        type: "hotel",
        title: "Bosphorus Royal Suite & Private Yacht Cruise",
        destination: "Istanbul",
        typeLabel: "Luxury Hotel & Yacht",
      },
      author: {
        pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
        name: "Marcus Vance",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MarcusV",
        tier: "Lonaliza VIP Ambassador",
      },
    },
    {
      id: "story_02",
      pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
      content: "Our trip to Trabzon and the breathtaking Uzungöl highlands! Wooden chalets surrounded by clouds and alpine waterfalls made for an enchanting family escape. Our private chauffeur was punctual, friendly, and deeply knowledgeable. 🏔️🌲",
      created_at: Math.floor(Date.now() / 1000) - 14400,
      category: "tours",
      categoryName: "Tours & Sightseeing",
      destination: "Trabzon",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 89,
      commentsCount: 14,
      viewsCount: 2100,
      booking: {
        id: "bk_02",
        type: "tour",
        title: "7-Day Black Sea Family Escape",
        destination: "Trabzon",
        typeLabel: "Private Tour & Chauffeur",
      },
      author: {
        pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
        name: "Clara Sterling",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ClaraS",
        tier: "Platinum Travel Elite",
      },
    },
    {
      id: "story_03",
      pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
      content: "Mercedes VIP V-Class private transfer service across Istanbul and Bursa. Punctual airport meet-and-greet, luxury leather seating with onboard Wi-Fi and entertainment. Effortless travel with zero fatigue. 🚘✨",
      created_at: Math.floor(Date.now() / 1000) - 28800,
      category: "transfers",
      categoryName: "Airport & Private Transfers",
      destination: "Bursa",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 42,
      commentsCount: 6,
      viewsCount: 980,
      booking: {
        id: "bk_03",
        type: "car",
        title: "5-Day Private VIP Chauffeur Service",
        destination: "Bursa",
        typeLabel: "VIP Transfer",
      },
      author: {
        pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
        name: "Oliver Hayes",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=OliverH",
        tier: "Gold VIP Explorer",
      },
    },
  ],
  tr: [
    {
      id: "story_01",
      pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
      content: "İstanbul'da harika bir konaklama! Boğaz manzaralı süit ve gün batımında gerçekleştirdiğimiz özel yat turu tek kelimeyle kusursuzdu. Lonaliza ekibine özenli organizasyonları için teşekkür ederiz. ✨🇹🇷",
      created_at: Math.floor(Date.now() / 1000) - 3600,
      category: "hotels",
      categoryName: "Otel & Tatil Köyleri",
      destination: "İstanbul",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 64,
      commentsCount: 9,
      viewsCount: 1450,
      booking: {
        id: "bk_01",
        type: "hotel",
        title: "Kral Dairesi ve Özel Boğaz Yat Turu",
        destination: "İstanbul",
        typeLabel: "Lüks Otel & Yat",
      },
      author: {
        pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
        name: "Ahmet Çelik",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AhmetC",
        tier: "Lonaliza VIP Elçisi",
      },
    },
    {
      id: "story_02",
      pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
      content: "Trabzon ve Uzungöl yaylalarına yaptığımız aile gezisi rüya gibiydi. Sislerin içindeki ahşap dağ evleri ve temiz hava harikaydı. Özel şoförümüz güzergahı çok iyi biliyordu ve her konuda yardımcı oldu. 🏔️🌲",
      created_at: Math.floor(Date.now() / 1000) - 14400,
      category: "tours",
      categoryName: "Tur ve Gezi Programları",
      destination: "Trabzon",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 89,
      commentsCount: 14,
      viewsCount: 2100,
      booking: {
        id: "bk_02",
        type: "tour",
        title: "7 Günlük Karadeniz Aile Turu",
        destination: "Trabzon",
        typeLabel: "Özel Tur & Şoför",
      },
      author: {
        pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
        name: "Zeynep Demir",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ZeynepD",
        tier: "Platin Gezgin",
      },
    },
    {
      id: "story_03",
      pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
      content: "Mercedes VIP Viano araçla İstanbul ve Bursa transferleri çok rahattı. Zamanlama dakikliği ve araç içi konfor yolculuğumuzu oldukça dinlendirici kıldı. 🚘✨",
      created_at: Math.floor(Date.now() / 1000) - 28800,
      category: "transfers",
      categoryName: "Havalimanı & Özel Transfer",
      destination: "Bursa",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 42,
      commentsCount: 6,
      viewsCount: 980,
      booking: {
        id: "bk_03",
        type: "car",
        title: "5 Günlük Özel Şoförlü VIP Araç",
        destination: "Bursa",
        typeLabel: "VIP Transfer",
      },
      author: {
        pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
        name: "Caner Aydın",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CanerA",
        tier: "Altın VIP Gezgin",
      },
    },
  ],
  fr: [
    {
      id: "story_01",
      pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
      content: "Séjour inoubliable à Istanbul ! La vue sur le Bosphore depuis l'hôtel était spectaculaire et la croisière privée au coucher du soleil a été organisée à la perfection par Lonaliza. ✨🇹🇷",
      created_at: Math.floor(Date.now() / 1000) - 3600,
      category: "hotels",
      categoryName: "Hôtels & Résidences",
      destination: "Istanbul",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 64,
      commentsCount: 9,
      viewsCount: 1450,
      booking: {
        id: "bk_01",
        type: "hotel",
        title: "Suite Royale Bosphore & Yacht Privé",
        destination: "Istanbul",
        typeLabel: "Hôtel & Yacht de Luxe",
      },
      author: {
        pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
        name: "Guillaume Renard",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GuillaumeR",
        tier: "Ambassadeur VIP Lonaliza",
      },
    },
    {
      id: "story_02",
      pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
      content: "Notre escapade à Trabzon et sur les hauteurs d'Uzungöl était magique. Chalets en bois au-dessus des nuages, cascades et théiers. Chauffeur privé ponctuel et aux petits soins. 🏔️🌲",
      created_at: Math.floor(Date.now() / 1000) - 14400,
      category: "tours",
      categoryName: "Circuits & Visites",
      destination: "Trabzon",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 89,
      commentsCount: 14,
      viewsCount: 2100,
      booking: {
        id: "bk_02",
        type: "tour",
        title: "Séjour Famille 7 Jours Mer Noire",
        destination: "Trabzon",
        typeLabel: "Visite & Chauffeur Privé",
      },
      author: {
        pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
        name: "Sophie Mercier",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SophieM",
        tier: "Élite Platine Voyage",
      },
    },
    {
      id: "story_03",
      pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
      content: "Service de transport VIP Mercedes Classe V entre Istanbul et Bursa. Ponctualité exemplaire, confort exceptionnel à bord et sérénité totale tout au long du trajet. 🚘✨",
      created_at: Math.floor(Date.now() / 1000) - 28800,
      category: "transfers",
      categoryName: "Transfert Privé & Aéroport",
      destination: "Bursa",
      rating: 5,
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      ],
      likesCount: 42,
      commentsCount: 6,
      viewsCount: 980,
      booking: {
        id: "bk_03",
        type: "car",
        title: "Chauffeur Privé VIP 5 Jours",
        destination: "Bursa",
        typeLabel: "Transfert VIP",
      },
      author: {
        pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
        name: "Antoine Lefebvre",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AntoineL",
        tier: "Explorateur VIP Or",
      },
    },
  ],
};

export function CommunityStoriesSlider() {
  const { locale } = useLocale();
  const activeLocale: SupportedLocale = (locale in STORIES_I18N ? locale : "ar") as SupportedLocale;
  const tStories = STORIES_I18N[activeLocale];
  const isRtl = activeLocale === "ar";

  const [stories, setStories] = useState<ParsedTravelPost[]>(FALLBACK_STORIES_BY_LOCALE[activeLocale]);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStories(FALLBACK_STORIES_BY_LOCALE[activeLocale]);
  }, [activeLocale]);

  useEffect(() => {
    fetch("/api/community/feed?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.posts) && data.posts.length > 0) {
          const photoStories = data.posts.filter((p: ParsedTravelPost) => p.images && p.images.length > 0);
          if (photoStories.length > 0) {
            setStories(photoStories);
          }
        }
      })
      .catch(() => {});
  }, [activeLocale]);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const offset = direction === "left" ? -360 : 360;
    sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section
      className="py-14 bg-gradient-to-b from-white via-purple-50/20 to-white border-y border-purple-100/60 overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row with Prominent Community CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100/80 text-purple-950 text-xs font-black border border-purple-200 mb-2.5">
              <Compass className="h-3.5 w-3.5 text-amber-500" />
              <span>{tStories.badge}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {tStories.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 max-w-2xl leading-relaxed">
              {tStories.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            {/* Big Prominent Community Button */}
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <span>{tStories.joinCommunity}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll(isRtl ? "right" : "left")}
                aria-label={tStories.prevStories}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => handleScroll(isRtl ? "left" : "right")}
                aria-label={tStories.nextStories}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Stories Cards Slider */}
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none overscroll-x-contain"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {stories.map((story) => {
            const hasBooking = Boolean(story.booking);
            return (
              <div
                key={story.id}
                className="relative shrink-0 w-[300px] sm:w-[360px] snap-start rounded-2xl overflow-hidden bg-white border border-slate-200/85 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Photo Preview if available */}
                {story.images && story.images.length > 0 && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <img
                      src={story.images[0]}
                      alt={story.destination || "Travel story"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-3 end-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 border border-white/20 shadow-sm">
                        <MapPin className="h-3 w-3 text-rose-400" />
                        <span>{story.destination}</span>
                      </span>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="absolute bottom-3 end-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      {[...Array(story.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between text-start">
                  <div>
                    {/* Author Row */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <img
                        src={story.author?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=traveler"}
                        alt={story.author?.name || tStories.verifiedTraveler}
                        className="w-9 h-9 rounded-full border border-amber-400 object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {story.author?.name}
                        </div>
                        <div className="text-[10px] text-purple-700 font-bold">
                          {story.author?.tier || tStories.verifiedTraveler}
                        </div>
                      </div>

                      {hasBooking && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-950 border border-purple-200 text-[10px] font-extrabold shrink-0">
                          <ShieldCheck className="h-3 w-3 text-amber-500" />
                          <span>{tStories.verifiedBooking}</span>
                        </span>
                      )}
                    </div>

                    {/* Review Snippet */}
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed line-clamp-3">
                      "{story.content}"
                    </p>
                  </div>

                  {/* Footer Stats & Read More */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-bold">
                        <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                        <span className="font-mono">{story.likesCount || 0}</span>
                      </span>
                      <span className="flex items-center gap-1 font-bold">
                        <MessageCircle className="h-3.5 w-3.5 text-purple-600" />
                        <span className="font-mono">{story.commentsCount || 0}</span>
                      </span>
                    </div>

                    <Link
                      href="/community"
                      className="text-purple-700 hover:text-purple-900 font-black flex items-center gap-1 group/link"
                    >
                      <span>{tStories.viewStory}</span>
                      <ChevronRight className="h-3.5 w-3.5 ltr:rotate-0 rtl:rotate-180 group-hover/link:translate-x-0.5 rtl:group-hover/link:-translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
