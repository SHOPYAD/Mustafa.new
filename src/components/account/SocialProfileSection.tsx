"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Share2,
  Heart,
  MessageSquare,
  Video,
  Camera,
  Compass,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  PlusCircle,
  Trophy,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getOrCreateLocalNostrKey } from "@/lib/nostr/blossom-uploader";

export default function SocialProfileSection({
  userName = "المسافر",
  userEmail = "",
  avatarUrl = "",
}: {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
}) {
  const { t, locale } = useLocale();
  const [pubkey, setPubkey] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    postsCount: 3,
    reelsCount: 2,
    likesReceived: 48,
    pointsEarned: 350,
  });

  useEffect(() => {
    try {
      const keys = getOrCreateLocalNostrKey();
      if (keys.pubkey) setPubkey(keys.pubkey);
    } catch {
      // ignore
    }
  }, []);

  const copyPubkey = () => {
    if (!pubkey) return;
    navigator.clipboard.writeText(pubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";

  const s = {
    verifiedBadge: isAr ? "مسافر موثق في مجتمع لوناليزا" : isTr ? "Doğrulanmış Lonaliza Gezgini" : isFr ? "Voyageur Vérifié Lonaliza" : "Verified Lonaliza Traveler",
    shareExpBtn: isAr ? "مشاركة تجربة سفر" : isTr ? "Deneyim Paylaş" : isFr ? "Partager Expérience" : "Share Travel Story",
    exploreReelsBtn: isAr ? "استكشاف الريلز" : isTr ? "Reels Keşfet" : isFr ? "Explorer Reels" : "Explore Reels",
    copyKeyTitle: isAr ? "نسخ مفتاح السفر" : isTr ? "Seyahat Anahtarını Kopyala" : isFr ? "Copier la clé" : "Copy Travel Key",
    postsCount: isAr ? "المنشورات والتجارب" : isTr ? "Gönderi ve Deneyimler" : isFr ? "Publications & Récits" : "Posts & Stories",
    reelsCount: isAr ? "فيديوهات الريلز" : isTr ? "Reels Videoları" : isFr ? "Vidéos Reels" : "Travel Reels",
    likesCount: isAr ? "الإعجابات المستلمة" : isTr ? "Alınan Beğeniler" : isFr ? "Mentions J'aime" : "Likes Received",
    pointsCount: isAr ? "نقاط المجتمع المكتسبة" : isTr ? "Kazanılan Topluluk Puanı" : isFr ? "Points de Club Gagnés" : "Club Points Earned",
    perksTitle: isAr ? "كيف تكسب نقاط الولاء من مجتمع لوناليزا؟" : isTr ? "Lonaliza Topluluğundan Nasıl Sadakat Puanı Kazanılır?" : isFr ? "Comment gagner des points dans le club Lonaliza ?" : "How to Earn Loyalty Points in Lonaliza Club?",
    perksSub: isAr
      ? "كل تفاعل ومشاركة لتجاربك السياحية تتحول لنقاط حقيقية في محفظتك"
      : isTr
        ? "Seyahat deneyimlerinizi paylaşarak cüzdanınıza gerçek puanlar kazanın"
        : isFr
          ? "Chaque partage d'expérience se transforme en points réels dans votre portefeuille"
          : "Every interaction and travel post turns into real points in your wallet",
    leaderboardLink: isAr ? "لوحة المتصدرين" : isTr ? "Liderler Tablosu" : isFr ? "Classement" : "Leaderboard",
    card1Title: isAr ? "نشر صور وتقارير الرحلات" : isTr ? "Fotoğraf ve Gezi Raporu Yayınla" : isFr ? "Publier photos et carnets" : "Post Travel Photos & Reviews",
    card1Desc: isAr
      ? "احصل على ما يصل إلى 50 نقطة لكل تقرير سفر مميز يوثق الفنادق أو الوجهات السياحية."
      : isTr
        ? "Otelleri veya destinasyonları belgeleyen her gezi raporu için 50 puana kadar kazanın."
        : isFr
          ? "Recevez jusqu'à 50 points pour chaque carnet de voyage validé sur nos hôtels et destinations."
          : "Earn up to 50 points for every featured review covering hotels and destinations.",
    card2Title: isAr ? "مشاركة فيديوهات ريلز السفر" : isTr ? "Seyahat Reels Videoları Paylaş" : isFr ? "Partager des Reels de Voyage" : "Share Travel Reels",
    card2Desc: isAr
      ? "اكسب 100 نقطة لكل مقطع ريلز سياحي يشارك تجارب الإقامة والأنشطة السياحية."
      : isTr
        ? "Konaklama ve turları tanıtan her kısa video için 100 puan kazanın."
        : isFr
          ? "Gagnez 100 points pour chaque vidéo courte partageant vos séjours et activités."
          : "Earn 100 points for every travel reel highlighting unique stays and activities.",
    card3Title: isAr ? "التفاعل والإعجابات والتعليقات" : isTr ? "Etkileşim, Beğeni ve Yorumlar" : isFr ? "Interactions et Commentaires" : "Engagements & Comments",
    card3Desc: isAr
      ? "اكسب نقاطاً إضافية مع كل إعجاب يضعه المسافرون على تجاربك وتفاعلك في الرد على استفسارات الرحالة."
      : isTr
        ? "Paylaşımlarınıza gelen her beğeni ve gezgin sorularına verdiğiniz yanıtlarla ekstra puanlar kazanın."
        : isFr
          ? "Gagnez des points bonus à chaque mention J'aime et en répondant aux questions des voyageurs."
          : "Earn bonus points with every like on your experiences and answering fellow travelers.",
  };

  const initial = (userName || "U")[0]?.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Social Identity Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-br from-[#1b0a33] via-[#2d1052] to-[#140626] p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="h-20 w-20 rounded-3xl object-cover ring-4 ring-amber-400/30 shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#250d44] via-[#3a156b] to-[#d97706] text-3xl font-black text-amber-300 ring-4 ring-amber-400/30 shadow-lg">
                  {initial}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#d97706] to-[#eab308] text-xs text-[#18082e] font-black ring-2 ring-[#18082e]">
                <Sparkles size={12} />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-0.5 text-xs font-bold text-amber-300">
                  {s.verifiedBadge}
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl text-white">{userName}</h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-purple-200/70">
                <span className="font-mono truncate max-w-[200px] sm:max-w-xs">
                  {pubkey ? `${pubkey.slice(0, 14)}...${pubkey.slice(-8)}` : userEmail}
                </span>
                {pubkey && (
                  <button
                    type="button"
                    onClick={copyPubkey}
                    className="rounded-lg bg-white/10 p-1 hover:bg-white/20 text-white transition-colors"
                    title={s.copyKeyTitle}
                  >
                    {copied ? <Check size={13} className="text-amber-400" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:self-center">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 px-4 py-2.5 text-xs font-black text-[#18082e] shadow-lg shadow-amber-500/25 transition-all"
            >
              <PlusCircle size={15} />
              <span>{s.shareExpBtn}</span>
            </Link>
            <Link
              href="/community/reels"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all"
            >
              <Video size={15} />
              <span>{s.exploreReelsBtn}</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-purple-400/20 pt-6">
          <div className="rounded-2xl bg-black/25 border border-purple-400/15 p-3.5 backdrop-blur-md text-center">
            <p className="text-[11px] font-bold text-purple-200/70 uppercase">{s.postsCount}</p>
            <p className="mt-1 text-2xl font-black text-white font-mono">{stats.postsCount}</p>
          </div>
          <div className="rounded-2xl bg-black/25 border border-purple-400/15 p-3.5 backdrop-blur-md text-center">
            <p className="text-[11px] font-bold text-purple-200/70 uppercase">{s.reelsCount}</p>
            <p className="mt-1 text-2xl font-black text-white font-mono">{stats.reelsCount}</p>
          </div>
          <div className="rounded-2xl bg-black/25 border border-purple-400/15 p-3.5 backdrop-blur-md text-center">
            <p className="text-[11px] font-bold text-purple-200/70 uppercase">{s.likesCount}</p>
            <p className="mt-1 text-2xl font-black text-rose-400 font-mono">+{stats.likesReceived}</p>
          </div>
          <div className="rounded-2xl bg-black/25 border border-purple-400/15 p-3.5 backdrop-blur-md text-center">
            <p className="text-[11px] font-bold text-purple-200/70 uppercase">{s.pointsCount}</p>
            <p className="mt-1 text-2xl font-black text-amber-300 font-mono font-black">+{stats.pointsEarned}</p>
          </div>
        </div>
      </div>

      {/* Community Perks Card */}
      <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700">
              <Compass size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{s.perksTitle}</h3>
              <p className="text-xs text-slate-500">{s.perksSub}</p>
            </div>
          </div>
          <Link
            href="/community/leaderboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-950 hover:underline"
          >
            <Trophy size={15} className="text-amber-500" />
            <span>{s.leaderboardLink}</span>
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4 space-y-1">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
              <Camera size={15} />
              <span>{s.card1Title}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {s.card1Desc}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
              <Video size={15} />
              <span>{s.card2Title}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {s.card2Desc}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
              <Heart size={15} />
              <span>{s.card3Title}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {s.card3Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
