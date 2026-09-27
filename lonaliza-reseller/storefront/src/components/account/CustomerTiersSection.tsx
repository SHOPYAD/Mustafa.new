"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  Shield,
  Gem,
  Crown,
  Check,
  ChevronRight,
  Zap,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface Tier {
  id: string;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  nameFr: string;
  minPoints: number;
  badge: string;
  color: string;
  bgGradient: string;
  multiplier: number;
  hotelDiscountPercent: number;
  perksAr: string[];
  perksEn: string[];
  perksTr: string[];
  perksFr: string[];
}

const TIERS: Tier[] = [
  {
    id: "bronze",
    nameAr: "المستكشف البرونزي",
    nameEn: "Bronze Explorer",
    nameTr: "Bronz Gezgin",
    nameFr: "Explorateur Bronze",
    minPoints: 0,
    badge: "🥉",
    color: "text-amber-700",
    bgGradient: "from-amber-700/10 to-transparent",
    multiplier: 1.0,
    hotelDiscountPercent: 2,
    perksAr: [
      "كسب نقاط الولاء الأساسية على كل حجز طيران أو فندق",
      "استبدال فوري للنقاط بقسائم خصم",
      "إمكانية المشاركة في مجتمع السفر ونشر الريلز",
    ],
    perksEn: [
      "Earn base loyalty points on every flight or hotel booking",
      "Instant redemption of points for discount vouchers",
      "Access to post and share travel stories & reels in community",
    ],
    perksTr: [
      "Her uçuş veya otel rezervasyonunda temel sadakat puanı kazanın",
      "Puanları anında indirim kuponlarına dönüştürün",
      "Toplulukta seyahat hikayeleri ve reels paylaşma imkanı",
    ],
    perksFr: [
      "Gagnez des points de fidélité sur chaque vol ou hôtel",
      "Conversion instantanée des points en bons de réduction",
      "Partagez vos récits et reels dans la communauté",
    ],
  },
  {
    id: "silver",
    nameAr: "الرحالة الفضي",
    nameEn: "Silver Traveler",
    nameTr: "Gümüş Seyyah",
    nameFr: "Voyageur Argent",
    minPoints: 500,
    badge: "🥈",
    color: "text-slate-600",
    bgGradient: "from-slate-400/10 to-transparent",
    multiplier: 1.25,
    hotelDiscountPercent: 4,
    perksAr: [
      "مضاعفة كسب النقاط بنسبة 1.25x",
      "خصم إضافي 4% على الفنادق المختارة",
      "أولوية معالجة طلبات تعديل وإلغاء الحجوزات",
      "شارة مميزة تظهر بجانب اسمك في مجتمع لوناليزا",
    ],
    perksEn: [
      "1.25x boosted loyalty points earning rate",
      "Extra 4% discount on selected partner hotels",
      "Priority processing for booking modifications and refunds",
      "Exclusive Silver badge displayed in Lonaliza community",
    ],
    perksTr: [
      "1.25x artırılmış puan kazanma oranı",
      "Seçili anlaşmalı otellerde ek %4 indirim",
      "Rezervasyon iptal ve değişikliklerinde öncelikli işlem",
      "Toplulukta adınızın yanında özel Gümüş rozet",
    ],
    perksFr: [
      "Multiplicateur de points 1.25x sur toutes les réservations",
      "Remise supplémentaire de 4% sur les hôtels partenaires",
      "Traitement prioritaire des modifications et annulations",
      "Badge Argent exclusif affiché dans la communauté",
    ],
  },
  {
    id: "gold",
    nameAr: "المسافر الذهبي",
    nameEn: "Gold Adventurer",
    nameTr: "Altın Maceracı",
    nameFr: "Aventurier Or",
    minPoints: 2000,
    badge: "🥇",
    color: "text-amber-500",
    bgGradient: "from-amber-500/15 to-transparent",
    multiplier: 1.5,
    hotelDiscountPercent: 7,
    perksAr: [
      "مضاعفة النقاط بنسبة 1.5x على كافة الخدمات",
      "خصم حصري 7% على الفنادق والجولات السياحية",
      "دعم عملاء ذو أولوية عبر الواتساب على مدار الساعة",
      "ترقية مجانية للغرفة في الفنادق الشريكة عند التوافر",
    ],
    perksEn: [
      "1.5x boosted loyalty points across all services",
      "Exclusive 7% discount on hotels and guided tours",
      "24/7 dedicated WhatsApp customer support concierge",
      "Free room upgrade at partner hotels upon availability",
    ],
    perksTr: [
      "Tüm hizmetlerde 1.5x puan kazanma çarpanı",
      "Otellerde ve rehberli turlarda özel %7 indirim",
      "7/24 öncelikli WhatsApp müşteri desteği",
      "Anlaşmalı otellerde müsaitlik durumunda ücretsiz oda yükseltme",
    ],
    perksFr: [
      "Multiplicateur 1.5x sur l'ensemble des services",
      "Réduction exclusive de 7% sur les hôtels et circuits",
      "Support client prioritaire 24/7 via WhatsApp",
      "Surclassement gratuit selon disponibilité dans les hôtels partenaires",
    ],
  },
  {
    id: "platinum",
    nameAr: "سفير لوناليزا البلاتيني",
    nameEn: "Platinum Ambassador",
    nameTr: "Platin Elçi",
    nameFr: "Ambassadeur Platine",
    minPoints: 5000,
    badge: "💎",
    color: "text-cyan-600",
    bgGradient: "from-cyan-500/15 to-transparent",
    multiplier: 2.0,
    hotelDiscountPercent: 10,
    perksAr: [
      "مضاعفة النقاط بنسبة 2.0x (ضعف النقاط المعتادة)",
      "خصم فندقي مميز 10% على أفخم الفنادق والمنتجعات",
      "مستشار سفر مخصص للتخطيط الشامل لرحلاتك الخاصة",
      "إلغاء وتعديل مجاني على باقات مختارة بدون رسوم منصة",
    ],
    perksEn: [
      "2.0x double loyalty points on every single booking",
      "Premium 10% discount on luxury hotels and resorts",
      "Dedicated personal travel advisor for bespoke itineraries",
      "Zero platform cancellation and modification fees on packages",
    ],
    perksTr: [
      "Tüm rezervasyonlarda 2.0x (çift kat) sadakat puanı",
      "Lüks otel ve tatil köylerinde %10 indirim",
      "Özel seyahat planlaması için atanmış kişisel danışman",
      "Seçili paketlerde sıfır platform iptal/değişiklik ücreti",
    ],
    perksFr: [
      "Points doublés (2.0x) sur toutes vos réservations",
      "Remise de 10% sur les hôtels et resorts de luxe",
      "Conseiller personnel dédié pour la planification de vos voyages",
      "Frais de modification et d'annulation offerts sur les forfaits",
    ],
  },
  {
    id: "diamond",
    nameAr: "نخبة كبار الشخصيات VIP Diamond",
    nameEn: "VIP Diamond Elite",
    nameTr: "VIP Elit Elmas",
    nameFr: "Élite VIP Diamant",
    minPoints: 10000,
    badge: "👑",
    color: "text-purple-600",
    bgGradient: "from-purple-600/20 to-transparent",
    multiplier: 3.0,
    hotelDiscountPercent: 15,
    perksAr: [
      "مضاعفة النقاط القصوى بنسبة 3.0x",
      "خصومات استثنائية تصل إلى 15% على حجوزات الـ VIP",
      "خدمة استقبال وتوديع VIP مجانية في مطارات محددة",
      "دعوات خاصة لفعاليات السفر وعروض الفنادق الحصرية قبل طرحها للعامة",
    ],
    perksEn: [
      "Maximum 3.0x triple points accumulation rate",
      "Exclusive discounts up to 15% on VIP transfers and stays",
      "Complimentary VIP airport Meet & Greet at selected hubs",
      "Early private access to unreleased travel deals & events",
    ],
    perksTr: [
      "Maksimum 3.0x (üç kat) puan kazanma oranı",
      "VIP transfer ve konaklamalarda %15'e varan indirim",
      "Seçili havalimanlarında ücretsiz VIP karşılama hizmeti",
      "Özel seyahat etkinliklerine ve erken fırsatlara davetiye",
    ],
    perksFr: [
      "Taux maximal de points multiplié par 3.0x",
      "Remises exceptionnelles jusqu'à 15% sur les séjours VIP",
      "Accueil VIP aéroport offert dans les aéroports sélectionnés",
      "Accès exclusif en avant-première aux offres et événements",
    ],
  },
];

export default function CustomerTiersSection({
  userPoints = 0,
  userName = "المسافر",
}: {
  userPoints?: number;
  userName?: string;
}) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";
  const points = Math.max(0, userPoints);

  const l = {
    currLevel: isAr ? "مستواك الحالي" : isTr ? "Mevcut Seviyeniz" : isFr ? "Votre Niveau Actuel" : "Your Current Tier",
    multiplier: isAr ? "مضاعف النقاط" : isTr ? "Puan Çarpanı" : isFr ? "Multiplicateur de Points" : "Points Multiplier",
    youHave: isAr ? "لديك حالياً" : isTr ? "Şu anda" : isFr ? "Vous avez" : "You currently have",
    ptsLabel: isAr ? "نقطة ولاء" : isTr ? "sadakat puanı" : isFr ? "points de fidélité" : "loyalty points",
    hotelDiscount: isAr ? "الخصم الفندقي المكتسب" : isTr ? "Kazanılan Otel İndirimi" : isFr ? "Réduction Hôtelière" : "Earned Hotel Discount",
    autoApplied: isAr ? "يطبق تلقائياً عند الدفع" : isTr ? "Ödemede otomatik uygulanır" : isFr ? "Appliqué au paiement" : "Applied at checkout",
    progressTo: isAr ? "التقدم نحو" : isTr ? "Hedefe İlerleme:" : isFr ? "Progression vers" : "Progress towards",
    ladderTitle: isAr ? "سلّم مستويات ومزايا عملاء لوناليزا" : isTr ? "Lonaliza Müşteri Seviyeleri ve Ayrıcalıkları" : isFr ? "Niveaux et Avantages Lonaliza" : "Lonaliza Customer Tiers & Privileges",
    ladderSub: isAr
      ? "ارتقِ بمستواك مع كل حجز وتفاعل داخل المجتمع لتفتح مميزات حصرية"
      : isTr
        ? "Her rezervasyonla seviyenizi yükseltin ve özel seyahat ayrıcalıklarının kilidini açın"
        : isFr
          ? "Montez en niveau à chaque voyage et débloquez des avantages exclusifs"
          : "Level up with each booking and interaction to unlock exclusive privileges",
    currentBadge: isAr ? "رتبتك الحالية" : isTr ? "Mevcut Seviye" : isFr ? "Niveau Actuel" : "Current Tier",
    passedBadge: isAr ? "تم اجتيازه" : isTr ? "Açıldı" : isFr ? "Débloqué" : "Unlocked",
    lockedBadge: isAr ? "مغلق" : isTr ? "Kilitli" : isFr ? "Verrouillé" : "Locked",
    perksTitle: isAr ? "المزايا الحصرية:" : isTr ? "Ayrıcalıklı Avantajlar:" : isFr ? "Avantages Exclusifs :" : "Exclusive Perks:",
    startPoint: isAr ? "نقطة البداية" : isTr ? "Başlangıç" : isFr ? "Point de départ" : "Starting Tier",
    congratsMax: isAr
      ? "تهانينا! لقد وصلت إلى أعلى رتبة مسافر في المنصة (VIP Diamond Elite)."
      : isTr
        ? "Tebrikler! Platformdaki en yüksek gezgin seviyesine (VIP Diamond Elite) ulaştınız."
        : isFr
          ? "Félicitations ! Vous avez atteint le niveau suprême de la plateforme (VIP Diamond Elite)."
          : "Congratulations! You have reached the highest tier on the platform (VIP Diamond Elite).",
  };

  // Find current tier
  const currentTierIndex = TIERS.reduce((acc, tier, idx) => {
    return points >= tier.minPoints ? idx : acc;
  }, 0);

  const currentTier = TIERS[currentTierIndex];
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;

  // Calculate progress
  let progressPercent = 100;
  let pointsNeeded = 0;
  if (nextTier) {
    const range = nextTier.minPoints - currentTier.minPoints;
    const progress = points - currentTier.minPoints;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    pointsNeeded = nextTier.minPoints - points;
  }

  return (
    <div className="space-y-6">
      {/* Current Level Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-br from-[#1b0a33] via-[#2c104f] to-[#140626] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-purple-600/25 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-3xl shadow-inner backdrop-blur-md ring-2 ring-amber-400/30">
              {currentTier.badge}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-0.5 text-xs font-bold text-amber-300">
                  {l.currLevel}
                </span>
                <span className="text-xs text-purple-200/80">{l.multiplier}: {currentTier.multiplier}x</span>
              </div>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl text-white">
                {locale === "ar"
                  ? currentTier.nameAr
                  : locale === "tr"
                    ? currentTier.nameTr
                    : locale === "fr"
                      ? currentTier.nameFr
                      : currentTier.nameEn}
              </h2>
              <p className="mt-1 text-xs text-purple-200/70">
                {l.youHave} <span className="font-bold text-amber-300 font-mono">{points.toLocaleString()}</span> {l.ptsLabel}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-400/20 bg-black/30 p-4 text-center backdrop-blur-md sm:min-w-[180px]">
            <p className="text-[11px] font-bold text-amber-200/80 uppercase">{l.hotelDiscount}</p>
            <p className="mt-1 text-3xl font-black text-amber-400 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              +{currentTier.hotelDiscountPercent}%
            </p>
            <p className="text-[10px] text-purple-200/60">{l.autoApplied}</p>
          </div>
        </div>

        {/* Next Tier Progress Bar */}
        {nextTier ? (
          <div className="relative mt-8 rounded-2xl bg-black/25 border border-purple-400/20 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-bold text-white/90">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={15} className="text-amber-400" />
                <span>
                  {l.progressTo}{" "}
                  {locale === "ar"
                    ? nextTier.nameAr
                    : locale === "tr"
                      ? nextTier.nameTr
                      : locale === "fr"
                        ? nextTier.nameFr
                        : nextTier.nameEn}{" "}
                  ({nextTier.badge})
                </span>
              </span>
              <span className="font-mono text-amber-300">{progressPercent}%</span>
            </div>
            <div className="mt-2.5 h-3.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#facc15] transition-all duration-700 shadow-md shadow-amber-500/40"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-purple-200/70">
              {isAr ? (
                <>باقي لك <span className="font-bold font-mono text-amber-300">{pointsNeeded.toLocaleString()}</span> نقطة لتصل إلى الرتبة التالية وتفتح مزايا إضافية ومضاعف {nextTier.multiplier}x.</>
              ) : isTr ? (
                <>Sonraki seviyeye ve {nextTier.multiplier}x çarpanına ulaşmak için <span className="font-bold font-mono text-amber-300">{pointsNeeded.toLocaleString()}</span> puan kaldı.</>
              ) : (
                <>Only <span className="font-bold font-mono text-amber-300">{pointsNeeded.toLocaleString()}</span> points remaining to unlock {nextTier.nameEn} with {nextTier.multiplier}x multiplier.</>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-amber-400/15 border border-amber-400/30 p-3.5 text-xs font-bold text-amber-300">
            <Crown size={16} className="text-amber-400" />
            <span>{l.congratsMax}</span>
          </div>
        )}
      </div>

      {/* Tiers Ladder Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">{l.ladderTitle}</h3>
            <p className="text-xs text-slate-500">{l.ladderSub}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((tier, idx) => {
            const isCurrent = idx === currentTierIndex;
            const isUnlocked = idx <= currentTierIndex;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 transition-all ${
                  isCurrent
                    ? "border-amber-400/80 bg-gradient-to-br from-amber-50/60 via-purple-50/30 to-white shadow-lg ring-2 ring-amber-400/30"
                    : isUnlocked
                    ? "border-purple-100 bg-white shadow-sm"
                    : "border-slate-100 bg-slate-50/60 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{tier.badge}</span>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          {locale === "ar"
                            ? tier.nameAr
                            : locale === "tr"
                              ? tier.nameTr
                              : locale === "fr"
                                ? tier.nameFr
                                : tier.nameEn}
                        </h4>
                        <p className="text-[11px] font-bold text-slate-400 font-mono">
                          {tier.minPoints === 0 ? l.startPoint : `${tier.minPoints.toLocaleString()} ${l.ptsLabel}`}
                        </p>
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="rounded-full bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] px-2.5 py-0.5 text-[10px] font-black text-[#18082e] shadow-sm">
                        {l.currentBadge}
                      </span>
                    ) : isUnlocked ? (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                        {l.passedBadge}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {l.lockedBadge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{l.multiplier}:</span>
                      <span className="font-bold text-slate-900 font-mono">{tier.multiplier}x</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{l.hotelDiscount}:</span>
                      <span className="font-bold text-amber-600 font-mono font-black">+{tier.hotelDiscountPercent}%</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-bold text-slate-700">{l.perksTitle}</p>
                    <ul className="space-y-1">
                      {(locale === "ar"
                        ? tier.perksAr
                        : locale === "tr"
                          ? tier.perksTr
                          : locale === "fr"
                            ? tier.perksFr
                            : tier.perksEn
                      ).map((perk, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <Check size={13} className="mt-0.5 shrink-0 text-amber-500" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
