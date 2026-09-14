"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Clock,
  EyeOff,
  Trash2,
  ShieldCheck,
  Building2,
  Car,
  Compass,
  Bus,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import type { CustomerReviewRecord, ServiceType } from "@/lib/server/customer-reviews-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const SERVICE_META: Record<ServiceType, { label: string; icon: typeof Building2; color: string }> = {
  hotel: { label: "فندق", icon: Building2, color: "text-blue-600 bg-blue-50 border-blue-200" },
  transfer: { label: "توصيل / سيارة خاصة", icon: Bus, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  car: { label: "تأجير سيارة", icon: Car, color: "text-amber-600 bg-amber-50 border-amber-200" },
  tour: { label: "جولة / برنامج سياحي", icon: Compass, color: "text-purple-600 bg-purple-50 border-purple-200" },
};

export default function AccountReviews() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [reviews, setReviews] = useState<CustomerReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reviews/my", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to load customer reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMyReviews();
  }, []);

  const handleDelete = async (reviewId: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من رغبتك في حذف هذا التقييم؟" : "Are you sure you want to delete this review?")) return;

    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/my/${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/70 to-amber-50/50 p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-800 shadow-2xs">
              <Star className="h-4 w-4 fill-purple-800" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {isAr ? "تقييماتي وتجارب السفر الموثقة" : "My Verified Travel Reviews"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            {isAr
              ? "استعرض التقييمات التي أضفتها لحجوزاتك المؤكدة، وحالة اعتمادها من إدارة المنصة."
              : "View reviews you submitted for your verified bookings and their approval status."}
          </p>
        </div>

        <button
          onClick={() => void fetchMyReviews()}
          title={isAr ? "تحديث" : "Refresh"}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          <span>{isAr ? "تحديث التقييمات" : "Refresh"}</span>
        </button>
      </div>

      {/* Content */}
      {loading && reviews.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
          <p className="mt-2 text-xs font-bold text-slate-500">
            {isAr ? "جاري تحميل تقييماتك..." : "Loading reviews..."}
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <Star className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-sm sm:text-base font-black text-slate-900">
            {isAr ? "لم تقم بإضافة أي تقييم بعد" : "You haven't submitted any reviews yet"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md">
            {isAr
              ? "بعد إتمام أي حجز فندقي أو جولة أو سيارة، يمكنك مشاركة تجربتك مع باقي المسافرين وإضافة صورك الحية."
              : "After completing your hotel, car, transfer, or tour booking, share your authentic review and photos."}
          </p>
          <Link
            href="/account?tab=bookings"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-900 px-4 py-2 text-xs font-black text-white hover:bg-purple-950 shadow-md shadow-purple-950/20 transition-all"
          >
            <span>{isAr ? "عرض حجوزاتي المؤكدة" : "View My Bookings"}</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => {
            const meta = SERVICE_META[rev.serviceType] || SERVICE_META.hotel;
            const Icon = meta.icon;

            return (
              <div
                key={rev.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${meta.color}`}
                      >
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {rev.serviceName || rev.serviceId}
                      </h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" />
                        {isAr ? "حجز موثق" : "Verified"} #{rev.bookingId.slice(0, 8)}
                      </span>
                    </div>

                    {/* Stars and date */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        ))}
                        <span className="mr-1 font-bold text-slate-800">{rev.rating}.0</span>
                      </div>
                      <span>•</span>
                      <span>
                        {new Date(rev.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                          dateStyle: "medium",
                        })}
                      </span>
                    </div>

                    {/* Title & Comment */}
                    {rev.title && (
                      <h5 className="mt-2 text-sm font-bold text-slate-900">{rev.title}</h5>
                    )}
                    <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
                      {rev.comment}
                    </p>

                    {/* Photos */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        {rev.photos.map((p, idx) => (
                          <a
                            key={idx}
                            href={p}
                            target="_blank"
                            rel="noreferrer"
                            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 group"
                          >
                            <img
                              src={p}
                              alt="Review attachment"
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status & Delete */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    {rev.status === "approved" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isAr ? "معتمد ومنشور" : "Approved & Live"}
                      </span>
                    )}
                    {rev.status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                        <Clock className="h-3.5 w-3.5" />
                        {isAr ? "قيد المراجعة" : "Under Review"}
                      </span>
                    )}
                    {rev.status === "hidden" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                        <EyeOff className="h-3.5 w-3.5" />
                        {isAr ? "مخفي من الإدارة" : "Hidden"}
                      </span>
                    )}

                    <button
                      onClick={() => void handleDelete(rev.id)}
                      disabled={deletingId === rev.id}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/60 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{isAr ? "حذف التقييم" : "Delete"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
