"use client";

import React, { useState } from "react";
import { Star, Sparkles, CheckCircle2, Send, MessageSquareHeart } from "lucide-react";
import type { PlannerTrip } from "@/types/planner";

interface TripFeedbackCardProps {
  destination?: string;
  tripTitle?: string;
  sessionId?: string;
  tripData?: PlannerTrip | null;
  onSubmitted?: () => void;
}

const FEEDBACK_TAGS = [
  "معالم أيقونية أصيلة 🏛️",
  "مطاعم ومقاهي ممتازة ☕",
  "توزيع متوازن ومريح ⏱️",
  "خيارات الفنادق راقية 🏨",
  "طيران ومواعيد مناسبة ✈️",
  "أسعار واضحة ومدروسة 💎",
];

export const TripFeedbackCard: React.FC<TripFeedbackCardProps> = ({
  destination,
  tripTitle,
  sessionId,
  tripData,
  onSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/advisor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          feedback: comment,
          destination: destination || tripTitle || tripData?.destination || "إسطنبول",
          tripTitle: tripTitle || tripData?.titleAr || tripData?.titleEn,
          tags: selectedTags,
          sessionId,
          tripData: tripData || null,
        }),
      });
      if (res.ok) {
        setIsSubmitted(true);
        if (onSubmitted) onSubmitted();
      }
    } catch (err) {
      console.error("Failed to submit trip feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="my-4 rounded-2xl border border-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/40 p-5 text-center shadow-md backdrop-blur-md">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="text-base font-black text-emerald-950 dark:text-emerald-100">شكراً جزيلاً لتقييمكم!</h4>
        <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
          تمت مشاركة تقييمكم وملاحظاتكم مع وكيل التخطيط السياحي وخلية الوكلاء لدعم التعلم التراكمي وتطوير الرحلات القادمة بأعلى معايير الرفاهية.
        </p>
      </div>
    );
  }

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-violet-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg backdrop-blur-md transition-all">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <MessageSquareHeart className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">تقييم مقترح البرنامج السياحي</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              ساعد وكيل التخطيط وخبير الرحلات في ضبط خط السير وفق تطلعاتك
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-amber-300 dark:border-amber-600/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 shadow-xs">
          <Sparkles className="h-3 w-3" />
          تغذية ذكية
        </div>
      </div>

      {/* Star Rating */}
      <div className="my-3 flex items-center justify-center gap-2 py-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (hoverRating || rating) >= star;
          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-125 focus:outline-none"
              aria-label={`تقييم ${star} نجوم`}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  active
                    ? "fill-amber-400 text-amber-500 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                    : "fill-transparent text-slate-300 dark:text-slate-600"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Sentiment Tags */}
      <div className="my-3 flex flex-wrap gap-1.5 justify-center">
        {FEEDBACK_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all shadow-xs ${
                isSelected
                  ? "border border-amber-500 bg-amber-500 text-white shadow-sm"
                  : "border border-violet-100 dark:border-slate-700 bg-violet-50/70 dark:bg-slate-800 text-violet-800 dark:text-slate-200 hover:bg-violet-100 hover:border-violet-200"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Comment Input */}
      <div className="mt-3">
        <textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="أخبرنا بأي ملاحظات أو تعديلات خاصة تود إضافتها للبرنامج..."
          className="w-full resize-none rounded-xl border border-violet-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:bg-white focus:ring-1 focus:ring-violet-400 transition"
        />
      </div>

      {/* Submit Button */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {rating === 5 ? "ممتاز جداً 🌟" : rating === 4 ? "جيد جداً 👍" : "نعمل على تحسينه 🛠️"}
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-5 py-2.5 text-xs font-black text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>إرسال التقييم</span>
        </button>
      </div>
    </div>
  );
};
export default TripFeedbackCard;
