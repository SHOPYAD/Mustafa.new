"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Eye,
  Heart,
  Check,
  Film,
} from "lucide-react";
import type { TravelReelItem, ParsedTravelPost } from "@/lib/nostr/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const REELS_I18N = {
  ar: {
    badge: "ريلز وتجارب المسافرين الحية",
    title: "شاهد أجمل اللحظات السياحية بعدسة عملاء لوناليزا",
    subtitle: "مقاطع فيديو قصيرة وموثقة بالكامل، جولات يخوت، إقامات فندقية، ومرتفعات ساحرة يشاركها المسافرون مباشرة من الميدان.",
    exploreAll: "استكشف كل مقاطع الريلز",
    verifiedReel: "ريلز موثق",
    watchReel: "مشاهدة الريلز",
    shareReel: "مشاركة هذا الريلز",
    copied: "تم نسخ الرابط!",
    vipTraveler: "مسافر لوناليزا VIP",
    prevReels: "المقاطع السابقة",
    nextReels: "المقاطع التالية",
  },
  en: {
    badge: "Live Traveler Reels & Experiences",
    title: "Watch Unforgettable Moments Through Our Travelers' Lens",
    subtitle: "Authentic, verified short videos: private yacht cruises, luxury resorts, and stunning mountain escapes shared live by travelers.",
    exploreAll: "Explore All Reels",
    verifiedReel: "Verified Reel",
    watchReel: "Watch Reel",
    shareReel: "Share Reel",
    copied: "Link copied!",
    vipTraveler: "Lonaliza VIP Traveler",
    prevReels: "Previous Reels",
    nextReels: "Next Reels",
  },
  tr: {
    badge: "Canlı Gezgin Reels & Deneyimleri",
    title: "Lonaliza Misafirlerinin Gözünden Eşsiz Anlar",
    subtitle: "Özel yat turları, lüks otel konaklamaları ve büyüleyici yaylaların gezginlerimiz tarafından anlık paylaşılan özgün videoları.",
    exploreAll: "Tüm Videoları Keşfet",
    verifiedReel: "Doğrulanmış Video",
    watchReel: "Videoyu İzle",
    shareReel: "Videoyu Paylaş",
    copied: "Bağlantı kopyalandı!",
    vipTraveler: "Lonaliza VIP Gezgini",
    prevReels: "Önceki Videolar",
    nextReels: "Sonraki Videolar",
  },
  fr: {
    badge: "Reels & Expériences en Direct des Voyageurs",
    title: "Moments Inoubliables à Travers les Yeux de nos Voyageurs",
    subtitle: "Vidéos courtes et vérifiées : croisières privées en yacht, résidences de prestige et paysages de montagne partagés en direct.",
    exploreAll: "Explorer Tous les Reels",
    verifiedReel: "Reel Vérifié",
    watchReel: "Regarder le Reel",
    shareReel: "Partager ce Reel",
    copied: "Lien copié !",
    vipTraveler: "Voyageur VIP Lonaliza",
    prevReels: "Reels Précédents",
    nextReels: "Reels Suivants",
  },
} as const;

type SupportedLocale = keyof typeof REELS_I18N;

const FALLBACK_REELS_BY_LOCALE: Record<SupportedLocale, TravelReelItem[]> = {
  ar: [
    {
      id: "home_reel_01",
      pubkey: "npub1lonaliza1",
      title: "جولة يخت خاص فاخر في مضيق البوسفور وقت الغروب 🌅",
      description: "بين سحر البوسفور وأنوار قصر دولمة بهجة والجسور المعلقة، رحلة بحرية خاصة بقمة الفخامة والخصوصية في إسطنبول.",
      videoUrl: "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.mp4",
      category: "tours",
      destination: "إسطنبول",
      likesCount: 284,
      commentsCount: 38,
      viewsCount: 2450,
      created_at: Math.floor(Date.now() / 1000) - 3600,
      author: {
        pubkey: "npub1lonaliza1",
        name: "سلطان الشمري",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SultanReel",
      },
    },
    {
      id: "home_reel_02",
      pubkey: "npub1lonaliza2",
      title: "أكواخ طرابزون وأوزنجول وسط الضباب والشلالات 🌲",
      description: "أجواء خيالية وهدوء منعش وسط الغيوم ومزارع الشاي الخضراء في الشمال التركي برفقة سائق ومرشد خاص.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fog-over-a-mountain-forest-42861-large.mp4",
      category: "hotels",
      destination: "طرابزون",
      likesCount: 342,
      commentsCount: 49,
      viewsCount: 3120,
      created_at: Math.floor(Date.now() / 1000) - 10800,
      author: {
        pubkey: "npub1lonaliza2",
        name: "ريم المنصوري",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ReemReel",
      },
    },
    {
      id: "home_reel_03",
      pubkey: "npub1lonaliza3",
      title: "تحليق مناطيد كابادوكيا مع شروق الشمس الساحر 🎈",
      description: "إطلالة بانورامية لا مثيل لها فوق وادي الصخور والكهوف المنحوتة في تجربة مغامرة استثنائية تستحق التوثيق.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4",
      category: "tours",
      destination: "كابادوكيا",
      likesCount: 215,
      commentsCount: 27,
      viewsCount: 1980,
      created_at: Math.floor(Date.now() / 1000) - 21600,
      author: {
        pubkey: "npub1lonaliza3",
        name: "عبدالعزيز القحطاني",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AzizReel",
      },
    },
    {
      id: "home_reel_04",
      pubkey: "npub1lonaliza4",
      title: "منتجع سياحي فاخر على ساحل أنطاليا الفيروزي 🏖️",
      description: "إقامة متكاملة مع إطلالات مباشرة على البحر الأبيض المتوسط، شاطئ خاص وخدمات كبار الشخصيات من لوناليزا.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41559-large.mp4",
      category: "hotels",
      destination: "أنطاليا",
      likesCount: 198,
      commentsCount: 22,
      viewsCount: 1740,
      created_at: Math.floor(Date.now() / 1000) - 32400,
      author: {
        pubkey: "npub1lonaliza4",
        name: "د. هدى التميمي",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=HudaReel",
      },
    },
  ],
  en: [
    {
      id: "home_reel_01",
      pubkey: "npub1lonaliza1",
      title: "Private Luxury Sunset Yacht Cruise Along the Bosphorus 🌅",
      description: "Sailing through the Golden Horn and Bosphorus under shimmering palace lights. Unrivaled VIP comfort in Istanbul.",
      videoUrl: "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.mp4",
      category: "tours",
      destination: "Istanbul",
      likesCount: 284,
      commentsCount: 38,
      viewsCount: 2450,
      created_at: Math.floor(Date.now() / 1000) - 3600,
      author: {
        pubkey: "npub1lonaliza1",
        name: "Alexander Wright",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexReel",
      },
    },
    {
      id: "home_reel_02",
      pubkey: "npub1lonaliza2",
      title: "Misty Pine Cabins & Waterfalls in Trabzon & Uzungöl 🌲",
      description: "Waking up above cloud level surrounded by lush tea hills and roaring alpine cascades with a private chauffeur.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fog-over-a-mountain-forest-42861-large.mp4",
      category: "hotels",
      destination: "Trabzon",
      likesCount: 342,
      commentsCount: 49,
      viewsCount: 3120,
      created_at: Math.floor(Date.now() / 1000) - 10800,
      author: {
        pubkey: "npub1lonaliza2",
        name: "Sophia Martinez",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SophiaReel",
      },
    },
    {
      id: "home_reel_03",
      pubkey: "npub1lonaliza3",
      title: "Cappadocia Hot Air Balloons Drifting at Sunrise 🎈",
      description: "A panoramic spectacle over ancient fairy chimneys and cave valleys in Cappadocia. A once-in-a-lifetime adventure.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4",
      category: "tours",
      destination: "Cappadocia",
      likesCount: 215,
      commentsCount: 27,
      viewsCount: 1980,
      created_at: Math.floor(Date.now() / 1000) - 21600,
      author: {
        pubkey: "npub1lonaliza3",
        name: "David Laurent",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DavidReel",
      },
    },
    {
      id: "home_reel_04",
      pubkey: "npub1lonaliza4",
      title: "Luxury 5-Star Beachfront Resort on Antalya's Turquoise Coast 🏖️",
      description: "Direct Mediterranean beach access, private cabanas, and premium VIP concierge service curated by Lonaliza.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41559-large.mp4",
      category: "hotels",
      destination: "Antalya",
      likesCount: 198,
      commentsCount: 22,
      viewsCount: 1740,
      created_at: Math.floor(Date.now() / 1000) - 32400,
      author: {
        pubkey: "npub1lonaliza4",
        name: "Emily Zhao",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EmilyReel",
      },
    },
  ],
  tr: [
    {
      id: "home_reel_01",
      pubkey: "npub1lonaliza1",
      title: "Gün Batımında Boğaz'da Lüks Özel Yat Turu 🌅",
      description: "Dolmabahçe Sarayı ışıkları ve asma köprüler arasında, İstanbul'un en seçkin özel tekne turu deneyimi.",
      videoUrl: "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.mp4",
      category: "tours",
      destination: "İstanbul",
      likesCount: 284,
      commentsCount: 38,
      viewsCount: 2450,
      created_at: Math.floor(Date.now() / 1000) - 3600,
      author: {
        pubkey: "npub1lonaliza1",
        name: "Burak Yılmaz",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=BurakReel",
      },
    },
    {
      id: "home_reel_02",
      pubkey: "npub1lonaliza2",
      title: "Sisli Dağlar ve Şelaleler Arasında Trabzon Yayla Evleri 🌲",
      description: "Özel şoför ve rehber eşliğinde Karadeniz yaylalarında bulutların üzerinde eşsiz bir doğa kaçamağı.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fog-over-a-mountain-forest-42861-large.mp4",
      category: "hotels",
      destination: "Trabzon",
      likesCount: 342,
      commentsCount: 49,
      viewsCount: 3120,
      created_at: Math.floor(Date.now() / 1000) - 10800,
      author: {
        pubkey: "npub1lonaliza2",
        name: "Elif Kaya",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ElifReel",
      },
    },
    {
      id: "home_reel_03",
      pubkey: "npub1lonaliza3",
      title: "Kapadokya'da Gün Doğumunda Sıcak Hava Balonu Turu 🎈",
      description: "Peri bacaları ve vadilerin üzerinden süzülen balonlarla unutulmaz bir gökyüzü manzarası.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4",
      category: "tours",
      destination: "Kapadokya",
      likesCount: 215,
      commentsCount: 27,
      viewsCount: 1980,
      created_at: Math.floor(Date.now() / 1000) - 21600,
      author: {
        pubkey: "npub1lonaliza3",
        name: "Mert Demir",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MertReel",
      },
    },
    {
      id: "home_reel_04",
      pubkey: "npub1lonaliza4",
      title: "Antalya Turkuaz Sahilinde 5 Yıldızlı Lüks Tatil Köyü 🏖️",
      description: "Akdeniz'e sıfır özel plajı ve Lonaliza VIP ayrıcalıklarıyla kusursuz bir tatil konaklaması.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41559-large.mp4",
      category: "hotels",
      destination: "Antalya",
      likesCount: 198,
      commentsCount: 22,
      viewsCount: 1740,
      created_at: Math.floor(Date.now() / 1000) - 32400,
      author: {
        pubkey: "npub1lonaliza4",
        name: "Selin Öztürk",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SelinReel",
      },
    },
  ],
  fr: [
    {
      id: "home_reel_01",
      pubkey: "npub1lonaliza1",
      title: "Croisière Privée en Yacht sur le Bosphore au Coucher du Soleil 🌅",
      description: "Au fil de l'eau entre les palais illuminés et les ponts suspendus d'Istanbul. Une expérience VIP exclusive.",
      videoUrl: "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.mp4",
      category: "tours",
      destination: "Istanbul",
      likesCount: 284,
      commentsCount: 38,
      viewsCount: 2450,
      created_at: Math.floor(Date.now() / 1000) - 3600,
      author: {
        pubkey: "npub1lonaliza1",
        name: "Julien Mercier",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=JulienReel",
      },
    },
    {
      id: "home_reel_02",
      pubkey: "npub1lonaliza2",
      title: "Chalets Panoramiques et Cascades dans les Forêts de Trabzon 🌲",
      description: "Au-dessus des nuages et des plantations de thé de la mer Noire avec chauffeur et guide privé de prestige.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fog-over-a-mountain-forest-42861-large.mp4",
      category: "hotels",
      destination: "Trabzon",
      likesCount: 342,
      commentsCount: 49,
      viewsCount: 3120,
      created_at: Math.floor(Date.now() / 1000) - 10800,
      author: {
        pubkey: "npub1lonaliza2",
        name: "Camille Dupont",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CamilleReel",
      },
    },
    {
      id: "home_reel_03",
      pubkey: "npub1lonaliza3",
      title: "Vol en Montgolfière au Lever du Soleil sur la Cappadoce 🎈",
      description: "Spectacle panoramique féerique au-dessus des cheminées de fées et des vallées troglodytiques.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4",
      category: "tours",
      destination: "Cappadoce",
      likesCount: 215,
      commentsCount: 27,
      viewsCount: 1980,
      created_at: Math.floor(Date.now() / 1000) - 21600,
      author: {
        pubkey: "npub1lonaliza3",
        name: "Marc Moreau",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MarcReel",
      },
    },
    {
      id: "home_reel_04",
      pubkey: "npub1lonaliza4",
      title: "Séjour de Prestige Face aux Eaux Turquoise d'Antalya 🏖️",
      description: "Accès direct à la plage privée, cabanas réservées et conciergerie VIP signée Lonaliza.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41559-large.mp4",
      category: "hotels",
      destination: "Antalya",
      likesCount: 198,
      commentsCount: 22,
      viewsCount: 1740,
      created_at: Math.floor(Date.now() / 1000) - 32400,
      author: {
        pubkey: "npub1lonaliza4",
        name: "Élodie Laurent",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ElodieReel",
      },
    },
  ],
};

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

export function CommunityReelsSlider() {
  const { locale } = useLocale();
  const activeLocale: SupportedLocale = (locale in REELS_I18N ? locale : "ar") as SupportedLocale;
  const tReels = REELS_I18N[activeLocale];
  const isRtl = activeLocale === "ar";

  const [reels, setReels] = useState<TravelReelItem[]>(FALLBACK_REELS_BY_LOCALE[activeLocale]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReels(FALLBACK_REELS_BY_LOCALE[activeLocale]);
  }, [activeLocale]);

  useEffect(() => {
    fetch("/api/community/feed?limit=30")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.posts)) {
          const videoPosts: TravelReelItem[] = data.posts
            .filter((p: ParsedTravelPost) => p.videos && p.videos.length > 0)
            .map((p: ParsedTravelPost) => ({
              id: p.id,
              pubkey: p.pubkey,
              title: p.content.slice(0, 55),
              description: p.content,
              videoUrl: p.videos![0],
              category: p.category || "tours",
              destination: p.destination || (activeLocale === "ar" ? "إسطنبول" : "Istanbul"),
              likesCount: p.likesCount || 12,
              commentsCount: p.commentsCount || 2,
              viewsCount: p.viewsCount || ((p.likesCount || 12) * 14 + 180),
              created_at: p.created_at,
              author: {
                pubkey: p.author?.pubkey || p.pubkey,
                name: p.author?.name || p.authorName || tReels.vipTraveler,
                avatar:
                  p.author?.avatar ||
                  p.authorAvatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${p.pubkey}`,
              },
            }));

          if (videoPosts.length > 0) {
            setReels((prev) => {
              const existing = new Set(videoPosts.map((v) => v.id));
              const remainder = prev.filter((r) => !existing.has(r.id));
              return [...videoPosts, ...remainder];
            });
          }
        }
      })
      .catch(() => {});
  }, [activeLocale, tReels.vipTraveler]);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleShareReel = (e: React.MouseEvent, reel: TravelReelItem) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/community/reels?id=${reel.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(reel.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section
      className="py-12 bg-gradient-to-b from-white via-purple-50/25 to-white overflow-hidden border-y border-purple-100/60"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100/80 text-purple-950 text-xs font-black border border-purple-200 mb-2.5">
              <Film className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>{tReels.badge}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {tReels.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 max-w-2xl leading-relaxed">
              {tReels.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <Link
              href="/community/reels"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>{tReels.exploreAll}</span>
            </Link>

            {/* Slider Nav Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll(isRtl ? "right" : "left")}
                aria-label={tReels.prevReels}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => handleScroll(isRtl ? "left" : "right")}
                aria-label={tReels.nextReels}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Reels Track */}
        <div
          ref={sliderRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none overscroll-x-contain"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="relative shrink-0 w-[240px] sm:w-[270px] snap-start rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col group"
            >
              {/* Video Player / Thumbnail Preview */}
              <Link
                href={`/community/reels?id=${reel.id}`}
                className="relative aspect-[9/14] w-full bg-slate-950 overflow-hidden block cursor-pointer"
              >
                <video
                  src={reel.videoUrl}
                  muted
                  loop
                  playsInline
                  onMouseOver={(e) => {
                    void (e.target as HTMLVideoElement).play().catch(() => {});
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLVideoElement).pause();
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 shadow-sm">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>{tReels.verifiedReel}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 shadow-sm">
                    <MapPin className="h-3 w-3 text-rose-400" />
                    <span>{reel.destination}</span>
                  </span>
                </div>

                {/* Center Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 fill-white ml-0.5 text-white" />
                  </div>
                </div>

                {/* Bottom Stats on Video */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[11px] font-bold z-10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                      <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                      <span className="font-mono">{reel.likesCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                      <Eye className="h-3.5 w-3.5 text-amber-400" />
                      <span className="font-mono">{formatViews(reel.viewsCount || 1200)}</span>
                    </span>
                  </div>

                  {/* Share on Slide Button */}
                  <button
                    type="button"
                    onClick={(e) => handleShareReel(e, reel)}
                    className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 backdrop-blur-xs border border-white/20 text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    title={tReels.shareReel}
                  >
                    {copiedId === reel.id ? (
                      <Check className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </Link>

              {/* Reel Metadata Card Below Video */}
              <div className="p-3.5 flex flex-col flex-1 justify-between bg-white text-start">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={reel.author.avatar}
                      alt={reel.author.name}
                      className="w-6 h-6 rounded-full border border-amber-400 object-cover bg-slate-100 shrink-0"
                    />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {reel.author.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-extrabold shrink-0">
                      VIP
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-slate-900 line-clamp-1 leading-snug group-hover:text-purple-700 transition-colors">
                    {reel.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-1 font-medium">
                    {reel.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <Link
                    href={`/community/reels`}
                    className="text-purple-700 hover:text-purple-900 font-extrabold flex items-center gap-1 group/btn"
                  >
                    <span>{tReels.watchReel}</span>
                    <ChevronRight className="h-3.5 w-3.5 ltr:rotate-0 rtl:rotate-180 group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5 transition-transform" />
                  </Link>

                  {copiedId === reel.id && (
                    <span className="text-[10px] text-amber-600 font-bold">{tReels.copied}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
