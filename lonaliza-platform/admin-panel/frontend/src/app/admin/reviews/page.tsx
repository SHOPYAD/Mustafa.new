"use client";

import { useEffect, useState, useTransition } from "react";
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
  Search,
  Filter,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import type {
  CustomerReviewRecord,
  ReviewsSettings,
  ReviewStatus,
  ServiceType,
} from "@/lib/server/customer-reviews-store";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";

const SERVICE_LABELS: Record<ServiceType, { label: string; icon: typeof Building2; color: string }> = {
  hotel: { label: "فندق", icon: Building2, color: "text-blue-600 bg-blue-50 border-blue-200" },
  transfer: { label: "توصيل / سيارة بسائق", icon: Bus, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  car: { label: "تأجير سيارة", icon: Car, color: "text-amber-600 bg-amber-50 border-amber-200" },
  tour: { label: "جولة / برنامج سياحي", icon: Compass, color: "text-purple-600 bg-purple-50 border-purple-200" },
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReviewRecord[]>([]);
  const [settings, setSettings] = useState<ReviewsSettings>({ autoApprove: true });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    hidden: 0,
    averageRating: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // TripAdvisor Autonomous Agent State
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentInfo, setAgentInfo] = useState<{
    totalTripAdvisorReviews: number;
    isRunning: boolean;
    lastRun?: any;
  }>({ totalTripAdvisorReviews: 0, isRunning: false });
  const [agentMessage, setAgentMessage] = useState<string | null>(null);

  const fetchAgentStatus = async () => {
    try {
      const res = await fetch("/api/admin/reviews/agent", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setAgentInfo({
          totalTripAdvisorReviews: data.stats?.totalTripAdvisorReviews || 0,
          isRunning: Boolean(data.agent?.isRunning),
          lastRun: data.agent?.lastRun,
        });
      }
    } catch {}
  };

  const handleRunAgent = async () => {
    try {
      setAgentRunning(true);
      setAgentMessage("جاري تشغيل وكيل التقييمات: زحف TripAdvisor ➔ ترجمة فورية عبر Docker LibreTranslate ➔ حقن بقاعدة البيانات...");
      const res = await fetch("/api/admin/reviews/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchSize: 3, targetLang: "ar" }),
      });
      const data = await res.json();
      if (data.ok) {
        setAgentMessage(data.message || "اكتملت مهمة وكيل التقييمات بنجاح!");
        void fetchAgentStatus();
        void fetchReviews();
      } else {
        setAgentMessage(`تنبيه: ${data.error || "تعذر إكمال عملية الوكيل"}`);
      }
    } catch (err: any) {
      setAgentMessage(`خطأ أثناء الاتصال بالوكيل: ${err.message || String(err)}`);
    } finally {
      setAgentRunning(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setReviews(data.reviews || []);
        if (data.settings) setSettings(data.settings);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews();
    void fetchAgentStatus();
  }, []);

  const handleToggleAutoApprove = async () => {
    const nextVal = !settings.autoApprove;
    setSettings((s) => ({ ...s, autoApprove: nextVal }));
    try {
      await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_auto_approve",
          autoApprove: nextVal,
        }),
      });
    } catch (err) {
      console.error("Failed to toggle auto-approve:", err);
    }
  };

  const handleModerate = async (reviewId: string, action: "approve" | "hide" | "delete") => {
    if (action === "delete") {
      if (!confirm("هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً؟")) return;
    }

    setActionLoadingId(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewId }),
      });
      const data = await res.json();
      if (data.ok) {
        if (action === "delete") {
          setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } else {
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? { ...r, status: action === "approve" ? "approved" : "hidden" }
                : r
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to moderate review:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (serviceFilter !== "all" && r.serviceType !== serviceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText =
        (r.userName || "").toLowerCase().includes(q) ||
        (r.serviceName || "").toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q) ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.bookingId || "").toLowerCase().includes(q);
      if (!matchText) return false;
    }
    return true;
  });

  return (
    <AdminPage className="space-y-6 pb-12">
      <AdminPageHeader
        icon={<Star className="size-5" />}
        title="إدارة تقييمات العملاء الموثقة"
        description="مراجعة واعتماد تقييمات المسافرين الموثقة للفنادق والسيارات والجولات وخدمات التوصيل (مستثنى منها الطيران)"
        actions={
          <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-4 py-3">
            <div className="text-right">
              <div className="text-xs font-bold text-[color:var(--admin-text-primary)]">الاعتماد التلقائي</div>
              <div className="text-[11px] text-[color:var(--admin-text-muted)]">
                {settings.autoApprove ? "مفعّل (نشر فوري للتقييمات)" : "يدوي (يتطلب موافقة المشرف)"}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoApprove}
              onClick={handleToggleAutoApprove}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.autoApprove ? "bg-[color:var(--admin-gold)]" : "bg-[color:var(--admin-bg-subtle)]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[color:var(--admin-bg-surface)] shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.autoApprove ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي التقييمات</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Star className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المعتمدة والمنشورة</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{stats.approved}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">بانتظار الموافقة</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{stats.pending}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المخفية</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <EyeOff className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{stats.hidden}</div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط التقييم</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Star className="h-4 w-4 fill-amber-500" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1 text-2xl font-black text-slate-900">
            {stats.averageRating}
            <span className="text-xs font-bold text-slate-400">/ 5</span>
          </div>
        </div>
      </div>

      {/* TripAdvisor Reviews MCP Autonomous Agent Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200">
                <Compass className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                وكيل تقييمات تريب أدفايزر الذكي (TripAdvisor Reviews MCP Agent)
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                متصل وجاهز 24/7
              </span>
            </div>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              وكيل ذكاء اصطناعي مستقل يقوم بمسح فنادق المنصة في PocketBase، واستدعاء خادم MCP المخصص (<code className="text-indigo-800">liotrip-tripadvisor-reviews</code>) لجلب تقييمات TripAdvisor الحقيقية، ثم ترجمتها آلياً للغة العربية عبر حاوية Docker LibreTranslate وحقنها بقاعدة البيانات.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>خادم MCP: <b className="text-slate-900">liotrip-tripadvisor-reviews</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>محرك الترجمة: <b className="text-slate-900">Docker LibreTranslate (127.0.0.1:5000)</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-800" />
                <span>تقييمات TripAdvisor المحقونة: <b className="text-indigo-800 font-bold">{agentInfo.totalTripAdvisorReviews} تقييم</b></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={agentRunning}
              onClick={handleRunAgent}
              className={`inline-flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-black transition-all cursor-pointer ${
                agentRunning
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed ring-1 ring-slate-200"
                  : "bg-indigo-800 hover:bg-indigo-900 text-white"
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${agentRunning ? "animate-spin" : ""}`} />
              {agentRunning ? "جاري الزحف والترجمة والحقن..." : "تشغيل وكيل جلب وترجمة التقييمات الآن"}
            </button>
          </div>
        </div>

        {agentMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs sm:text-sm text-emerald-900 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>{agentMessage}</span>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          {[
            { id: "all", label: "الكل" },
            { id: "pending", label: "بانتظار الموافقة" },
            { id: "approved", label: "معتمد" },
            { id: "hidden", label: "مخفي" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === tab.id
                  ? "bg-indigo-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Service Dropdown */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs focus:border-purple-500 focus:outline-hidden"
          >
            <option value="all">جميع الخدمات</option>
            <option value="hotel">الفنادق</option>
            <option value="transfer">التوصيل والمطارات</option>
            <option value="car">تأجير السيارات</option>
            <option value="tour">الجولات السياحية</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالعميل أو الحجز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-60 rounded-xl border border-slate-300 bg-slate-50 py-1.5 pr-8 pl-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => void fetchReviews()}
            title="تحديث القائمة"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
          <p className="mt-2 text-xs font-bold text-slate-500">جاري تحميل التقييمات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <Star className="h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">لا توجد تقييمات مطابقة</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery || statusFilter !== "all" || serviceFilter !== "all"
              ? "جرّب تغيير خيارات البحث أو التصفية."
              : "لم يقم أي عميل بإضافة تقييم حتى الآن."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rev) => {
            const serviceMeta = SERVICE_LABELS[rev.serviceType] || SERVICE_LABELS.hotel;
            const ServiceIcon = serviceMeta.icon;

            return (
              <div
                key={rev.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left info: Customer & Service */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 font-black text-purple-900 shadow-xs">
                      {rev.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rev.userName}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="h-3 w-3" />
                          حجز موثق #{rev.bookingId.slice(0, 10)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${serviceMeta.color}`}
                        >
                          <ServiceIcon className="h-3 w-3" />
                          {serviceMeta.label}: {rev.serviceName || rev.serviceId}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        {/* Rating stars */}
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
                        <span>{new Date(rev.createdAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })}</span>
                      </div>

                      {rev.title && (
                        <h4 className="mt-2 text-sm font-bold text-slate-900">{rev.title}</h4>
                      )}
                      <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                        {rev.comment}
                      </p>

                      {/* Attached photos */}
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
                                alt={`صورة التقييم ${idx + 1}`}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status badge & Moderation Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    {/* Status badge */}
                    {rev.status === "approved" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        معتمد ومنشور
                      </span>
                    )}
                    {rev.status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        بانتظار المراجعة
                      </span>
                    )}
                    {rev.status === "hidden" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                        <EyeOff className="h-3 w-3" />
                        مخفي
                      </span>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {rev.status !== "approved" && (
                        <button
                          onClick={() => handleModerate(rev.id, "approve")}
                          disabled={actionLoadingId === rev.id}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-emerald-700 shadow-xs transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          اعتماد
                        </button>
                      )}

                      {rev.status !== "hidden" && (
                        <button
                          onClick={() => handleModerate(rev.id, "hide")}
                          disabled={actionLoadingId === rev.id}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          <EyeOff className="h-3 w-3" />
                          إخفاء
                        </button>
                      )}

                      <button
                        onClick={() => handleModerate(rev.id, "delete")}
                        disabled={actionLoadingId === rev.id}
                        title="حذف نهائي"
                        className="inline-flex items-center justify-center h-7 w-7 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
}
