"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Sparkles,
  MessageSquareHeart,
  TrendingUp,
  AlertCircle,
  Eye,
  Send,
  Calendar,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  RefreshCw,
  X,
  Plane,
  Building,
  Utensils,
  Coffee,
  ShoppingBag,
} from "lucide-react";

interface TripFeedbackItem {
  id: string;
  rating: number;
  feedback?: string;
  destination?: string;
  tripTitle?: string;
  tags?: string[];
  sessionId?: string;
  tripData?: any;
  createdAt: string;
}

interface FeedbackApiResponse {
  ok: boolean;
  feedbacks: TripFeedbackItem[];
  totalCount: number;
  averageRating: number;
  ratingBreakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
  topTags: { tag: string; count: number }[];
}

export default function AiFeedbackPage() {
  const [data, setData] = useState<FeedbackApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTripModal, setActiveTripModal] = useState<any | null>(null);
  const [activeDirectiveModal, setActiveDirectiveModal] = useState<TripFeedbackItem | null>(null);
  const [directiveText, setDirectiveText] = useState("");
  const [isSendingDirective, setIsSendingDirective] = useState(false);
  const [directiveSuccess, setDirectiveSuccess] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/advisor/feedback");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSendDirective = async () => {
    if (!directiveText.trim() || !activeDirectiveModal) return;
    setIsSendingDirective(true);
    try {
      const res = await fetch("/api/advisor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "directive",
          targetAgent: "site_advisor",
          directive: directiveText,
          destination: activeDirectiveModal.destination,
        }),
      });
      if (res.ok) {
        setDirectiveSuccess(true);
        setTimeout(() => {
          setDirectiveSuccess(false);
          setActiveDirectiveModal(null);
          setDirectiveText("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to send directive:", err);
    } finally {
      setIsSendingDirective(false);
    }
  };

  const filteredFeedbacks = (data?.feedbacks || []).filter((item) => {
    if (filterRating !== null && Math.round(item.rating) !== filterRating) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const dest = (item.destination || "").toLowerCase();
      const title = (item.tripTitle || "").toLowerCase();
      const text = (item.feedback || "").toLowerCase();
      return dest.includes(q) || title.includes(q) || text.includes(q);
    }
    return true;
  });

  const stopIcon = (kind?: string) => {
    switch (kind) {
      case "restaurant":
        return <Utensils className="h-4 w-4 text-emerald-500" />;
      case "cafe":
        return <Coffee className="h-4 w-4 text-amber-500" />;
      case "shopping":
        return <ShoppingBag className="h-4 w-4 text-pink-500" />;
      default:
        return <Compass className="h-4 w-4 text-violet-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs">
              <Star className="h-6 w-6 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                تقييمات برامج الذكاء الاصطناعي (AI Travel Reviews)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                متابعة آراء وملاحظات العملاء على البرامج السياحية وتغذية وكيل التخطيط وخلية الوكلاء بالتعلم المستمر
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchFeedback}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            تحديث التقييمات
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Average Rating */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/70 to-white dark:from-amber-950/20 dark:to-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">متوسط تقييم المسافرين</span>
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {data?.averageRating || "5.0"}
            </span>
            <span className="text-xs text-slate-400 font-bold">من 5.0</span>
          </div>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${
                  s <= Math.round(data?.averageRating || 5)
                    ? "fill-amber-400 text-amber-500"
                    : "fill-slate-200 text-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Total Feedbacks */}
        <div className="rounded-2xl border border-violet-200 dark:border-violet-900/40 bg-gradient-to-br from-violet-50/70 to-white dark:from-violet-950/20 dark:to-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-900 dark:text-violet-300">إجمالي التقييمات</span>
            <MessageSquareHeart className="h-5 w-5 text-violet-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {data?.totalCount || 0}
            </span>
            <span className="text-xs text-violet-600 font-bold">تقييم معتمد</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            تغذية تفاعلية حية من مسار الشات والكانفاس
          </p>
        </div>

        {/* 5-Star Percentage */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">التقييمات الممتازة (5 نجوم)</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {data?.ratingBreakdown?.[5] || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">
              ({data?.totalCount ? Math.round(((data.ratingBreakdown[5] || 0) / data.totalCount) * 100) : 100}%)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300">
            برامج نالت الإعجاب الكامل للعملاء
          </p>
        </div>

        {/* Attention Needed */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/70 to-white dark:from-rose-950/20 dark:to-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 dark:text-rose-300">تحتاج توجيه للخلية</span>
            <AlertCircle className="h-5 w-5 text-rose-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {(data?.ratingBreakdown?.[1] || 0) + (data?.ratingBreakdown?.[2] || 0)}
            </span>
            <span className="text-xs text-slate-400 font-bold">مراجعة سريعة</span>
          </div>
          <p className="mt-2 text-[11px] text-rose-700 dark:text-rose-300">
            تقييمات تقل عن 3 نجوم لتصحيح التخطيط
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterRating === null
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            الكل ({data?.totalCount || 0})
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFilterRating(r)}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterRating === r
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <span>{r}</span>
              <Star className="h-3 w-3 fill-current" />
              <span>({data?.ratingBreakdown?.[r as 1 | 2 | 3 | 4 | 5] || 0})</span>
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالوجهة، اسم البرنامج، أو الملاحظة..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <MessageSquareHeart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد تقييمات مطابقة للفلتر
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              ستظهر هنا تقييمات العملاء المرسلة فور تفاعلهم مع برامج التخطيط
            </p>
          </div>
        ) : (
          filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Right Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 border border-amber-500/20">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= item.rating
                              ? "fill-amber-400 text-amber-500"
                              : "fill-slate-200 text-slate-300"
                          }`}
                        />
                      ))}
                      <span className="mr-1 text-xs font-black text-amber-700 dark:text-amber-300">
                        {item.rating}.0
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      <span>{item.destination || "روما"}</span>
                    </div>

                    {item.tripTitle ? (
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        • {item.tripTitle}
                      </span>
                    ) : null}

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(item.createdAt).toLocaleString("ar-SA")}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-violet-100 dark:border-violet-900/40 bg-violet-50/60 dark:bg-violet-950/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* Feedback text */}
                  {item.feedback ? (
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/40 p-3 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      "{item.feedback}"
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      تم التقييم بالنجوم دون كتابة ملاحظات إضافية.
                    </p>
                  )}
                </div>

                {/* Left Action Buttons */}
                <div className="flex shrink-0 items-center gap-2">
                  {item.tripData ? (
                    <button
                      type="button"
                      onClick={() => setActiveTripModal(item.tripData)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300 shadow-xs hover:bg-violet-100 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      استعراض البرنامج الكامل
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDirectiveModal(item);
                      setDirectiveText(`توجيه بخصوص رحلة ${item.destination || "روما"}: بناءً على تقييم العميل (${item.rating} نجوم)، يرجى مراعاة: `);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-xs hover:bg-amber-100 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    توجيه فوري لـ Swarm
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Full Trip Preview */}
      {activeTripModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTripModal(null)}
              className="absolute left-6 top-6 rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-xs font-black">
                {activeTripModal.durationDays || 5} أيام • {activeTripModal.destination}
              </span>
              <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {activeTripModal.titleAr || activeTripModal.titleEn}
              </h2>
              {activeTripModal.notes ? (
                <p className="mt-1 text-xs text-slate-500 leading-relaxed font-medium">
                  {activeTripModal.notes}
                </p>
              ) : null}
            </div>

            {/* Days Itinerary */}
            <div className="space-y-6">
              {(activeTripModal.days || []).map((day: any) => (
                <div
                  key={day.day}
                  className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-2">
                    <span className="font-black text-sm text-violet-700 dark:text-violet-400">
                      اليوم {day.day}: {day.titleAr || day.titleEn}
                    </span>
                  </div>
                  {day.notes ? (
                    <p className="mb-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {day.notes}
                    </p>
                  ) : null}

                  {/* Stops */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {(day.stops || []).map((stop: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="flex gap-3 rounded-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs"
                      >
                        {stop.image ? (
                          <img
                            src={stop.image}
                            alt={stop.titleAr}
                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {stopIcon(stop.kind)}
                            <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                              {stop.titleAr || stop.titleEn}
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            {stop.slotAr || "خلال اليوم"}
                          </span>
                          {stop.detailAr ? (
                            <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 leading-snug">
                              {stop.detailAr}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal: Send Directive to Swarm */}
      {activeDirectiveModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveDirectiveModal(null)}
              className="absolute left-6 top-6 rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  إرسال توجيه إداري لخلية الوكلاء (Swarm Hive)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تحديث فوري لذاكرة وكيل التخطيط السياحي (site_advisor)
                </p>
              </div>
            </div>

            {directiveSuccess ? (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                <h4 className="mt-2 text-sm font-bold text-emerald-950">
                  تم إرسال التوجيه بنجاح لخلية الوكلاء!
                </h4>
                <p className="mt-1 text-xs text-emerald-800">
                  تم تدوين التوجيه في نقاشات الخلية وقرارات الإدارة الحية.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نص التوجيه الموجه لوكيل التخطيط (site_advisor):
                </label>
                <textarea
                  rows={4}
                  value={directiveText}
                  onChange={(e) => setDirectiveText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDirectiveModal(null)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSendDirective}
                    disabled={isSendingDirective || !directiveText.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-black text-white shadow-md hover:bg-amber-600 transition disabled:opacity-50"
                  >
                    {isSendingDirective ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>إرسال التوجيه للخلية</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
