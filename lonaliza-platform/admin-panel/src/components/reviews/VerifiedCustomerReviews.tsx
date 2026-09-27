"use client";

import { useEffect, useState, useRef } from "react";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ImagePlus,
  Send,
  Sparkles,
  User,
  Camera,
  X,
  Lock,
} from "lucide-react";
import type { CustomerReviewRecord, ServiceType } from "@/lib/server/customer-reviews-store";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Props = {
  serviceType: ServiceType;
  serviceId: string;
  serviceName: string;
  className?: string;
};

export default function VerifiedCustomerReviews({
  serviceType,
  serviceId,
  serviceName,
  className = "",
}: Props) {
  const { user, openAuth } = useCustomerAuth();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [reviews, setReviews] = useState<CustomerReviewRecord[]>([]);
  const [stats, setStats] = useState({ count: 0, average: 5.0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);

  // Eligibility state
  const [eligibility, setEligibility] = useState<{
    checked: boolean;
    eligible: boolean;
    bookingId?: string;
    reason?: string;
  }>({ checked: false, eligible: false });

  // Review Form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/reviews?serviceType=${serviceType}&serviceId=${encodeURIComponent(serviceId)}`
      );
      const data = await res.json();
      if (data.ok) {
        setReviews(data.reviews || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch service reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) {
      setEligibility({ checked: true, eligible: false, reason: "login_required" });
      return;
    }
    try {
      const res = await fetch(
        `/api/reviews/eligibility?serviceType=${serviceType}&serviceId=${encodeURIComponent(serviceId)}`
      );
      const data = await res.json();
      if (data.ok) {
        setEligibility({
          checked: true,
          eligible: Boolean(data.eligible),
          bookingId: data.bookingId,
          reason: data.reason,
        });
      }
    } catch {
      setEligibility({ checked: true, eligible: false });
    }
  };

  useEffect(() => {
    void fetchReviews();
    void checkEligibility();
  }, [serviceType, serviceId, user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remainingSlots = 3 - formPhotos.length;
    const allowed = Array.from(files).slice(0, remainingSlots);

    for (const file of allowed) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 3 * 1024 * 1024) continue; // 3MB limit

      const reader = new FileReader();
      reader.onload = (loadEv) => {
        const result = loadEv.target?.result as string;
        if (result) {
          setFormPhotos((prev) => [...prev, result].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment || formComment.trim().length < 5) {
      setSubmitError(isAr ? "يرجى كتابة تعليق لا يقل عن 5 أحرف." : "Please write a comment of at least 5 characters.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          serviceId,
          serviceName,
          bookingId: eligibility.bookingId,
          rating: formRating,
          title: formTitle,
          comment: formComment,
          photos: formPhotos,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSubmitError(data.error || (isAr ? "فشل إرسال التقييم." : "Failed to submit review."));
        return;
      }

      setSubmitSuccess(data.message || (isAr ? "تم إرسال تقييمك بنجاح!" : "Review submitted successfully!"));
      setShowForm(false);
      setFormTitle("");
      setFormComment("");
      setFormPhotos([]);
      // Refresh reviews list
      void fetchReviews();
    } catch (err) {
      setSubmitError(isAr ? "حدث خطأ غير متوقع." : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="verified-customer-reviews" className={`space-y-6 ${className}`}>
      {/* Section Header & Rating summary */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-900 shadow-2xs">
                <Star className="h-4 w-4 fill-purple-900" />
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {isAr ? "تقييمات المسافرين الموثقة" : "Verified Traveler Reviews"}
              </h3>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {isAr
                ? "تقييمات حقيقية وحصرية من عملاء لوناليزا الذين أتموا حجوزات مؤكدة لهذه الخدمة."
                : "Authentic reviews exclusively from travelers with verified bookings for this service."}
            </p>
          </div>

          {/* Action button */}
          <div>
            {!user ? (
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="inline-flex items-center gap-2 rounded-2xl bg-purple-900 px-4 py-2.5 text-xs font-black text-white hover:bg-purple-950 shadow-md shadow-purple-950/15 transition-all"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{isAr ? "سجّل دخولك للتقييم" : "Sign In to Review"}</span>
              </button>
            ) : eligibility.eligible ? (
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 hover:brightness-105 shadow-md shadow-amber-500/20 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{showForm ? (isAr ? "إغلاق نموذج التقييم" : "Close Form") : (isAr ? "أضف تقييمك الموثق" : "Write a Verified Review")}</span>
              </button>
            ) : eligibility.reason === "already_reviewed" ? (
              <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>{isAr ? "شكراً! لقد قمت بتقييم هذه الخدمة" : "You have reviewed this service"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3.5 py-2 text-xs font-medium text-slate-600 border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span>{isAr ? "التقييم متاح فقط لأصحاب الحجوزات المؤكدة" : "Reserved for verified bookings"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Rating Score Dashboard */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 border-t border-slate-100 pt-6">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-purple-50/80 px-6 py-4 text-center">
            <div className="text-3xl sm:text-4xl font-black text-purple-950 font-mono">
              {stats.count > 0 ? stats.average.toFixed(1) : "5.0"}
            </div>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(stats.count > 0 ? stats.average : 5)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 text-[11px] font-bold text-purple-800">
              {isAr ? `استناداً إلى ${stats.count} تقييم موثق` : `Based on ${stats.count} verified reviews`}
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map((ratingVal) => {
              const countForVal = (stats.ratingBreakdown as any)[ratingVal] || 0;
              const pct = stats.count > 0 ? Math.round((countForVal / stats.count) * 100) : ratingVal === 5 ? 100 : 0;

              return (
                <div key={ratingVal} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-600 font-bold flex items-center gap-1 justify-end">
                    {ratingVal} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-[11px] text-slate-400 font-mono">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success / Error alerts */}
        {submitSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{submitSuccess}</span>
          </div>
        )}
        {submitError && (
          <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
            {submitError}
          </div>
        )}

        {/* Review Submission Form Modal / Drawer */}
        {showForm && (
          <form
            onSubmit={handleSubmitReview}
            className="mt-6 rounded-2xl border border-purple-200 bg-purple-50/40 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{isAr ? `تقييم تجربتك في ${serviceName}` : `Review your experience at ${serviceName}`}</span>
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck className="h-3 w-3" />
                {isAr ? "حجز مؤكد" : "Verified Booking"}
              </span>
            </div>

            {/* Interactive Stars */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "تقييمك العام:" : "Your Rating:"}
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    onMouseEnter={() => setFormHoverRating(star)}
                    onMouseLeave={() => setFormHoverRating(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= (formHoverRating || formRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="mr-2 text-sm font-black text-slate-800">
                  {formHoverRating || formRating} / 5
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "عنوان موجز لتجربتك (اختياري):" : "Short title (optional):"}
              </label>
              <input
                type="text"
                placeholder={isAr ? "مثال: إقامة استثنائية وخدمة راقية جداً" : "e.g. Exceptional stay and top-notch service"}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={100}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "تفاصيل رأيك وتجربتك بالتفصيل:" : "Your detailed feedback:"}
              </label>
              <textarea
                rows={4}
                placeholder={
                  isAr
                    ? "صف تجربتك، نظافة المكان، تعامل طاقم العمل، دقة المواعيد، أو أي نصائح تود تقديمها للمسافرين الآخرين..."
                    : "Describe your experience, cleanliness, staff courtesy, punctuality, or tips for fellow travelers..."
                }
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                maxLength={1500}
                required
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-purple-600 focus:outline-hidden"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>{isAr ? "يتم فحص التعليقات ضد الروابط الخارجية" : "External links are automatically filtered"}</span>
                <span>{formComment.length} / 1500</span>
              </div>
            </div>

            {/* Photos upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "صور حية من تجربتك (حتى 3 صور):" : "Add photos from your trip (up to 3):"}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {formPhotos.map((photo, idx) => (
                  <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-300">
                    <img src={photo} alt="Upload preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormPhotos((p) => p.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-rose-600"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}

                {formPhotos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple-300 bg-white text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="mt-1 text-[9px] font-bold">{isAr ? "إضافة صورة" : "Add"}</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-900 px-5 py-2 text-xs font-black text-white hover:bg-purple-950 shadow-md shadow-purple-950/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? (isAr ? "جاري الإرسال..." : "Submitting...") : (isAr ? "إرسال التقييم" : "Submit Review")}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Customer Reviews List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-400">{isAr ? "جاري تحميل التقييمات..." : "Loading reviews..."}</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-xs font-bold text-slate-500">
            {isAr
              ? "كن أول من يكتب تقييماً موثقاً لهذه الخدمة بعد إتمام حجزك!"
              : "Be the first verified customer to write a review for this service!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-xs font-black text-purple-900">
                    {rev.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">{rev.userName}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {isAr ? "إقامة / حجز موثق" : "Verified Booking"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span>•</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", { dateStyle: "medium" })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {rev.title && (
                <h5 className="text-xs sm:text-sm font-bold text-slate-900 pt-1">{rev.title}</h5>
              )}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{rev.comment}</p>

              {rev.photos && rev.photos.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  {rev.photos.map((p, idx) => (
                    <a
                      key={idx}
                      href={p}
                      target="_blank"
                      rel="noreferrer"
                      className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 group"
                    >
                      <img
                        src={p}
                        alt="Guest photo"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
