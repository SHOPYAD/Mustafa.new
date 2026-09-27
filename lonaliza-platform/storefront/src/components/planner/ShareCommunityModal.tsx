"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Coins,
  Share2,
  MapPin,
  Calendar,
} from "lucide-react";
import type { PlannerTrip } from "@/types/planner";
import type { SalesChatCard } from "@/types/sales-chat";
import { tripHeadline } from "@/lib/planner/day-copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ShareCommunityModal({
  trip,
  cards,
  isOpen,
  onClose,
}: {
  trip: PlannerTrip;
  cards?: SalesChatCard[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const headline = tripHeadline(trip, isAr ? "ar" : "en");
  const cover =
    trip.days.flatMap((d) => d.stops).find((s) => s.image)?.image ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";

  const handleShare = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/planner/share-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip,
          cards,
          customNote: note,
          userName: "مسافر لوناليزا VIP",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "failed_to_share");
      }
      setSuccess(true);
      setPostId(data.postId);
    } catch (err: unknown) {
      setError(
        isAr
          ? "تعذر إتمام النشر حالياً، يرجى المحاولة مرة أخرى."
          : "Failed to publish to community. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
      dir={isAr ? "rtl" : "ltr"}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-violet-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative bg-gradient-to-r from-[#1E0B4B] via-[#2E1065] to-[#4C1D95] p-5 sm:p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 end-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-black text-amber-300 border border-amber-400/30">
              <Coins size={14} className="text-amber-400 animate-bounce" />
              <span>{isAr ? "+250 نقطة مكافأة فورية" : "+250 Reward Points"}</span>
            </span>
            <span className="text-[11px] font-bold text-violet-200">
              {isAr ? "مجتمع لوناليزا للمسافرين" : "Lonaliza Community"}
            </span>
          </div>

          <h3 className="text-[20px] sm:text-[22px] font-black leading-snug">
            {isAr
              ? "شارك خطتك في مجتمع لوناليزا واربح 250 نقطة"
              : "Share in Lonaliza Community & Earn 250 Points"}
          </h3>
          <p className="mt-1.5 text-[12px] sm:text-[13px] text-white/80 leading-relaxed">
            {isAr
              ? "انشر برنامجك السياحي مع مسافري مجتمع لوناليزا الحصري، تبادل الخبرات، واكسب 250 نقطة تضاف تلقائياً إلى محفظتك لاستخدامها في حجوزاتك القادمة."
              : "Publish your itinerary to Lonaliza's exclusive community, inspire fellow travelers, and instantly claim 250 loyalty reward points."}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {success ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[20px] font-black text-slate-900">
                  {isAr ? "تهانينا! تم النشر بنجاح 🎉" : "Congratulations! Published 🎉"}
                </h4>
                <p className="text-[13px] text-slate-600 font-medium">
                  {isAr
                    ? "تم نشر مسار رحلتك في مجتمع لوناليزا، وأضيفت 250 نقطة مكافأة إلى رصيدك فورياً."
                    : "Your itinerary is now live in Lonaliza Community, and 250 reward points have been credited to your wallet."}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-3.5 flex items-center justify-center gap-3">
                <Coins size={22} className="text-amber-600 shrink-0" />
                <span className="text-[13px] font-black text-amber-900">
                  {isAr ? "الرصيد المكتسب: +250 نقطة لوناليزا VIP" : "Earned: +250 Lonaliza VIP Points"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Link
                  href="/community"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-[13px] font-black text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
                >
                  <span>{isAr ? "مشاهدة المنشور في المجتمع" : "View Post in Community"}</span>
                  <ExternalLink size={15} />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 items-center justify-center rounded-2xl bg-slate-100 px-5 text-[13px] font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  {isAr ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Trip Preview Mini Card */}
              <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/40 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase text-[#7C3AED] tracking-wider">
                    {isAr ? "البرنامج السياحي" : "Tour Program"}
                  </span>
                  <h4 className="line-clamp-1 text-[13px] font-black text-[#1A1438]">
                    {headline}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[#7C3AED]" />
                      {trip.destination}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-violet-500" />
                      {trip.durationDays} {isAr ? "أيام" : "days"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note / Caption Input */}
              <div className="space-y-1.5">
                <label className="block text-[12px] font-black text-slate-800">
                  {isAr
                    ? "كلمتك أو نصيحتك للمسافرين (اختياري):"
                    : "Your advice or note to travelers (optional):"}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    isAr
                      ? "شارك انطباعك، أفضل وقت للزيارة، أو نصائح خاصة بهذا البرنامج..."
                      : "Share your thoughts, recommended seasons, or tips for this trip..."
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-[13px] text-slate-800 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
                />
              </div>

              {error ? (
                <p className="rounded-xl bg-rose-50 p-2.5 text-[12px] font-bold text-rose-700">
                  {error}
                </p>
              ) : null}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleShare()}
                  className="flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7] text-[14px] font-black text-white shadow-[0_12px_28px_-12px_rgba(124,58,237,0.8)] transition-all hover:opacity-95 active:scale-98 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>
                    {isAr
                      ? "نشر في مجتمع لوناليزا والحصول على 250 نقطة"
                      : "Publish in Community & Claim 250 Points"}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
