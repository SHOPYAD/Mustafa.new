"use client";

import { useState } from "react";
import {
  Compass,
  Crown,
  Globe,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

const LUXURY_PEN_NAMES = [
  "رحالة الأناضول",
  "صقر البوسفور",
  "سفير الفخامة",
  "عاشق الريفيرا",
  "أمير الأسفار",
  "مستكشف القمم",
  "سندباد الخليج",
  "بوصلة الذهب",
];

export default function SocialCommunityReelsShowcase() {
  const { dir, locale } = useLocale();
  const [selectedPenName, setSelectedPenName] = useState(LUXURY_PEN_NAMES[0]);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likesCount, setLikesCount] = useState(1420);
  const [hasLiked, setHasLiked] = useState(false);

  const handleRandomizeName = () => {
    setIsGeneratingName(true);
    setTimeout(() => {
      const filtered = LUXURY_PEN_NAMES.filter((n) => n !== selectedPenName);
      const random = filtered[Math.floor(Math.random() * filtered.length)];
      setSelectedPenName(random);
      setIsGeneratingName(false);
    }, 300);
  };

  const handleToggleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 border-b border-slate-200 overflow-hidden" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-950 text-xs font-bold shadow-2xs">
            <Compass className="h-3.5 w-3.5 text-purple-700" />
            <span>
              {pickLocaleText(locale, {
                ar: "مجتمع السوشيال ميديا ونوستر (Decentralized Social & Travel Reels)",
                en: "Decentralized Travel Community & Social Reels",
                fr: "Communauté de Voyage Décentralisée & Reels",
                tr: "Merkeziyetsiz Seyahat Topluluğu ve Reels",
              })}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight font-sans">
            {pickLocaleText(locale, {
              ar: "شبكة اجتماعية سياحية متكاملة تضاعف ولاء عملائك وتفاعلهم",
              en: "Integrated Travel Social Network Multiplying Customer Engagement",
              fr: "Réseau Social Touristique Intégré Multipliant l'Engagement Client",
              tr: "Müşteri Bağlılığını ve Etkileşimini Katlayan Entegre Seyahat Ağı",
            })}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pickLocaleText(locale, {
              ar: "اجعل عملاءك يوثقون تجارب رحلاتهم بفيديوهات الريلز والصور، مع نظام مكافآت ذكي، وشارة الإدارة الرسمية المعتمدة، وإمكانية النشر بالأسماء المستعارة الفاخرة.",
              en: "Empower travelers to share experiences with video reels and photos, complete with verified official admin badges and luxury pseudonym generator.",
              fr: "Permettez aux voyageurs de partager leurs aventures avec des reels vidéo et photos, avec badges officiels d'administration et générateur de pseudonymes de luxe.",
              tr: "Gezginlerin deneyimlerini video reels ve fotoğraflarla paylaşmasını sağlayın; onaylı resmi yönetici rozeti ve lüks takma ad oluşturucu ile birlikte.",
            })}
          </p>
        </div>

        {/* Interactive Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Smartphone Mockup with Video Reel */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[310px] rounded-[42px] border-[7px] border-slate-900 bg-slate-950 p-2 shadow-2xl shadow-slate-400/40">
              {/* Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-24 rounded-full bg-black z-30 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-slate-800 me-2" />
                <div className="h-1.5 w-8 rounded-full bg-slate-900" />
              </div>

              {/* Reel Screen Container */}
              <div className="relative aspect-[9/18.5] rounded-[34px] overflow-hidden bg-slate-900 text-white select-none">
                <img
                  src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=700&auto=format&fit=crop&q=80"
                  alt="Bosphorus Travel Reel"
                  className="w-full h-full object-cover"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 flex flex-col justify-between p-4 pt-10">
                  {/* Top Bar: Official Admin Badge - Commercial Crown Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      <div className="size-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950">
                        <Crown className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
                      </div>
                      <span className="text-[11px] font-bold text-white">
                        {pickLocaleText(locale, {
                          ar: "إدارة المنصة العامة",
                          en: "Official Platform Admin",
                          fr: "Administration Officielle",
                          tr: "Resmi Platform Yönetimi",
                        })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20"
                    >
                      {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Right Floating Actions */}
                  <div className="self-end flex flex-col items-center gap-3 pe-1">
                    <button
                      type="button"
                      onClick={handleToggleLike}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className={`p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-125 ${hasLiked ? "bg-rose-600 text-white" : "bg-black/40 text-white"}`}>
                        <Heart className={`h-5 w-5 ${hasLiked ? "fill-white" : ""}`} />
                      </div>
                      <span className="text-[10px] font-bold font-mono">{likesCount.toLocaleString()}</span>
                    </button>

                    <div className="flex flex-col items-center gap-1">
                      <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono">184</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                        <Share2 className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono">92</span>
                    </div>
                  </div>

                  {/* Bottom Reel Caption */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-xs">
                        {selectedPenName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-white">
                          <span>{selectedPenName}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                            VIP
                          </span>
                        </div>
                        <div className="text-[10px] text-white/70">
                          {pickLocaleText(locale, {
                            ar: "نشر عبر شبكة نوستر اللامركزية",
                            en: "Published via Nostr Relay",
                            fr: "Publié via le Réseau Nostr",
                            tr: "Nostr Ağı Üzerinden Paylaşıldı",
                          })}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-white/95 leading-relaxed line-clamp-2">
                      {pickLocaleText(locale, {
                        ar: "غروب استثنائي من يخت البوسفور الخاص في إسطنبول مع طاقم الضيافة الفاخر.",
                        en: "Spectacular sunset view from private Bosphorus yacht charter in Istanbul.",
                        fr: "Coucher de soleil spectaculaire depuis un yacht privé sur le Bosphore à Istanbul.",
                        tr: "İstanbul Boğazı'nda lüks özel yatta unutulmaz bir gün batımı manzarası.",
                      })}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                      <span className="text-white/80">
                        {pickLocaleText(locale, {
                          ar: "رحلة البوسفور الفاخرة",
                          en: "Bosphorus Luxury Cruise",
                          fr: "Croisière de Luxe Bosphore",
                          tr: "Boğaz Lüks Yat Turu",
                        })}
                      </span>
                      <span className="text-[10px] font-bold text-amber-300 font-mono">
                        {pickLocaleText(locale, {
                          ar: "حجز فوري",
                          en: "Book Now",
                          fr: "Réserver",
                          tr: "Hemen Ayırt",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Feature Highlights & Interactive Pseudonym Generator */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Crown Badge Feature Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-600 flex items-center justify-center">
                  <Crown className="h-5 w-5 fill-amber-500 text-amber-500" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {pickLocaleText(locale, {
                      ar: "شارة التاج الذهبي لإدارة المنصة (Official Admin Badge)",
                      en: "Official Admin Crown Badge",
                      fr: "Badge Couronne d'Administration Officielle",
                      tr: "Resmi Yönetici Altın Taç Rozeti",
                    })}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {pickLocaleText(locale, {
                      ar: "تمييز فوري لملاك المنصة يمنح منشوراتك وتعليقاتك موثوقية وهيبة مطلقة أمام كافة الزوار",
                      en: "Distinct official badge granting total credibility and prestige to administrative publications",
                      fr: "Badge officiel distinct accordant une crédibilité et un prestige absolus aux publications administratives",
                      tr: "Yönetici paylaşımlarına ve duyurularına tüm ziyaretçiler nezdinde tam güvenilirlik ve prestij kazandıran rozet",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black shadow-2xs border border-amber-400">
                  <Crown className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
                  <span>
                    {pickLocaleText(locale, {
                      ar: "إدارة المنصة العامة (Official Admin)",
                      en: "Official Admin",
                      fr: "Administration Officielle",
                      tr: "Resmi Yönetim",
                    })}
                  </span>
                </span>
                <span className="text-xs text-slate-500">
                  {pickLocaleText(locale, {
                    ar: "ظهور حصري للمشرفين والمالك",
                    en: "Exclusively for verified platform owners",
                    fr: "Réservé exclusivement aux propriétaires vérifiés",
                    tr: "Yalnızca doğrulanmış platform sahiplerine özel",
                  })}
                </span>
              </div>
            </div>

            {/* 2. Interactive Pen-Name Generator Simulator */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    {pickLocaleText(locale, {
                      ar: "مولد الأسماء المستعارة الفاخرة للأعضاء (Luxury Pseudonyms)",
                      en: "Luxury Traveler Pseudonym Generator",
                      fr: "Générateur de Pseudonymes de Voyage de Luxe",
                      tr: "Lüks Gezgin Takma Ad Oluşturucu",
                    })}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {pickLocaleText(locale, {
                    ar: "خصوصية تامة",
                    en: "Full Privacy",
                    fr: "Confidentialité Totale",
                    tr: "Tam Gizlilik",
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pickLocaleText(locale, {
                  ar: "يتيح لأعضاء المجتمع التبديل بحرية بين النشر بأسمائهم الحقيقية أو توليد لقب سياحي فاخر بضغطة زر لحماية خصوصيتهم وتشجيعهم على مشاركة مراجعاتهم.",
                  en: "Members can choose between their real name or an automated luxury travel pen-name to preserve anonymity.",
                  fr: "Les membres peuvent basculer entre leur vrai nom ou un pseudonyme de voyage luxueux pour préserver leur anonymat.",
                  tr: "Topluluk üyeleri gizliliklerini korumak için gerçek adları ile tek tıkla üretilen lüks seyahat unvanları arasında özgürce geçiş yapabilir.",
                })}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:flex-1 p-3 rounded-2xl bg-white border border-indigo-200 text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between shadow-2xs">
                  <span>
                    {pickLocaleText(locale, {
                      ar: "الاسم المولد الحالي:",
                      en: "Current Name:",
                      fr: "Nom Généré :",
                      tr: "Oluşturulan Ad:",
                    })}
                  </span>
                  <span className="text-indigo-600 font-extrabold font-sans">
                    «{selectedPenName}»
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRandomizeName}
                  disabled={isGeneratingName}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                  <Sparkles className={`h-4 w-4 ${isGeneratingName ? "animate-spin" : ""}`} />
                  <span>
                    {pickLocaleText(locale, {
                      ar: "توليد اسم مستعار فاخر",
                      en: "Generate Travel Title",
                      fr: "Générer un Pseudonyme",
                      tr: "Lüks Unvan Oluştur",
                    })}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Nostr & Multi-Platform Auto-Poster */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-2xl bg-purple-500/10 border border-purple-400/40 text-purple-800 flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {pickLocaleText(locale, {
                      ar: "سيرفرات نوستر اللامركزية والنشر المتزامن",
                      en: "Decentralized Nostr Relays & Multi-Publishing",
                      fr: "Relais Décentralisés Nostr & Multi-Diffusion",
                      tr: "Merkeziyetsiz Nostr Sunucuları ve Çoklu Paylaşım",
                    })}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {pickLocaleText(locale, {
                      ar: "قاعدة بيانات اجتماعية مفتوحة لا تخضع لرقابة أي جهة خارجية، مع مزامنة فورية لحسابات التواصل",
                      en: "Open decentralized social protocol independent of big tech algorithms with auto-syndication",
                      fr: "Protocole social décentralisé et ouvert indépendant des algorithmes des géants du web",
                      tr: "Büyük teknoloji algoritmalarından bağımsız, açık ve merkeziyetsiz sosyal seyahat protokolü",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                  TikTok Auto-Post
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                  Instagram Reels
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                  X Travel Feed
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                  YouTube Shorts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
