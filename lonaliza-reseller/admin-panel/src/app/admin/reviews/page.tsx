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
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type {
  CustomerReviewRecord,
  ReviewsSettings,
  ReviewStatus,
  ServiceType,
} from "@/lib/server/customer-reviews-store";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";

const SERVICE_LABELS: Record<ServiceType, { label: string; icon: typeof Building2; color: string }> = {
  hotel: { label: "فندق", icon: Building2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  transfer: { label: "توصيل / سيارة بسائق", icon: Bus, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  car: { label: "تأجير سيارة", icon: Car, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  tour: { label: "جولة / برنامج سياحي", icon: Compass, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
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
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المجتمع والعملاء", href: "/admin/customers" },
          { label: "إدارة التقييمات الموثقة" },
        ]}
        icon={<Star className="h-6 w-6 text-primary" />}
        title="إدارة تقييمات العملاء ووكيل TripAdvisor"
        subtitle="مراجعة واعتماد تقييمات المسافرين الموثقة للفنادق والسيارات والجولات، وتشغيل وكيل الزحف والترجمة الحية."
        actions={
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-4 py-2.5 backdrop-blur-xl shadow-xs">
            <div className="text-start">
              <div className="text-xs font-bold text-foreground">الاعتماد التلقائي</div>
              <div className="text-[10px] text-muted-foreground">
                {settings.autoApprove ? "نشر فوري للتقييمات" : "يتطلب موافقة المشرف"}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoApprove}
              onClick={handleToggleAutoApprove}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoApprove ? "bg-amber-500" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  settings.autoApprove ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        }
      />

      {/* Stats Cards */}
      <EnterpriseKpiGrid columns={5}>
        <EnterpriseKpiCard
          title="إجمالي التقييمات"
          value={stats.total}
          icon={<Star className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="المعتمدة والمنشورة"
          value={stats.approved}
          icon={<CheckCircle2 className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="بانتظار الموافقة"
          value={stats.pending}
          icon={<Clock className="size-5" />}
          color="amber"
          change={stats.pending > 0 ? `+${stats.pending}` : "0"}
          trend={stats.pending > 0 ? "up" : "neutral"}
        />
        <EnterpriseKpiCard
          title="التقييمات المخفية"
          value={stats.hidden}
          icon={<EyeOff className="size-5" />}
          color="rose"
        />
        <EnterpriseKpiCard
          title="متوسط التقييم العام"
          value={`${stats.averageRating} / 5`}
          icon={<Star className="size-5 fill-amber-500 text-amber-500" />}
          color="amber"
        />
      </EnterpriseKpiGrid>

      {/* TripAdvisor Reviews MCP Autonomous Agent Section */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-card/90 via-primary/5 to-card/90 p-6 backdrop-blur-xl shadow-lg shadow-black/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30">
                <Compass className="h-5 w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                وكيل تقييمات تريب أدفايزر الذكي (TripAdvisor Reviews MCP Agent)
              </h2>
              <EnterpriseStatusBadge
                variant="ai"
                label="متصل وجاهز 24/7"
                pulse
              />
            </div>
            <p className="max-w-2xl text-xs text-muted-foreground leading-relaxed">
              وكيل ذكاء اصطناعي مستقل يقوم بمسح فنادق المنصة في PocketBase، واستدعاء خادم MCP المخصص (<code className="text-primary font-mono font-bold">liotrip-tripadvisor-reviews</code>) لجلب تقييمات TripAdvisor الحقيقية، ثم ترجمتها آلياً للغة العربية عبر حاوية Docker LibreTranslate وحقنها بقاعدة البيانات.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>خادم MCP: <b className="text-foreground">liotrip-tripadvisor-reviews</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>محرك الترجمة: <b className="text-foreground">Docker LibreTranslate (127.0.0.1:5000)</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>تقييمات TripAdvisor المحقونة: <b className="text-amber-500 font-bold tabular-nums">{agentInfo.totalTripAdvisorReviews} تقييم</b></span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Button
              type="button"
              disabled={agentRunning}
              onClick={handleRunAgent}
              className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-2 h-11 px-5"
            >
              <RefreshCw className={`h-4 w-4 ${agentRunning ? "animate-spin" : ""}`} />
              <span>{agentRunning ? "جاري الزحف والترجمة..." : "تشغيل وكيل الزحف والترجمة الآن"}</span>
            </Button>
          </div>
        </div>

        {agentMessage && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{agentMessage}</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <EnterpriseFilterBar
        searchPlaceholder="البحث باسم العميل، الخدمة، أو نص التقييم..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        tabs={[
          { id: "all", label: "كافة التقييمات", count: reviews.length },
          { id: "pending", label: "بانتظار الموافقة", count: stats.pending },
          { id: "approved", label: "معتمد ومنشور", count: stats.approved },
          { id: "hidden", label: "مخفي", count: stats.hidden },
        ]}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        totalResults={filtered.length}
        filtersSlot={
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-9 rounded-xl border border-border/60 bg-background/80 px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">جميع الخدمات</option>
            <option value="hotel">الفنادق</option>
            <option value="transfer">التوصيل والمطارات</option>
            <option value="car">تأجير السيارات</option>
            <option value="tour">الجولات السياحية</option>
          </select>
        }
      />

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/60">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <p className="mt-2 text-xs font-bold text-muted-foreground">جاري تحميل التقييمات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/40 p-6 text-center">
          <Star className="h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-sm font-bold text-foreground">لا توجد تقييمات مطابقة</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {searchQuery || statusFilter !== "all" || serviceFilter !== "all"
              ? "جرّب تغيير خيارات البحث أو التصفية."
              : "لم يقم أي عميل بإضافة تقييم حتى الآن."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((rev) => {
            const serviceMeta = SERVICE_LABELS[rev.serviceType] || SERVICE_LABELS.hotel;
            const ServiceIcon = serviceMeta.icon;

            return (
              <div
                key={rev.id}
                className="overflow-hidden rounded-2xl border border-border/50 bg-card/70 p-4 sm:p-5 backdrop-blur-xl shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left info: Customer & Service */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 font-bold text-primary border border-primary/20 shadow-xs">
                      {rev.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{rev.userName}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500 border border-emerald-500/20">
                          <ShieldCheck className="h-3 w-3" />
                          حجز موثق #{rev.bookingId.slice(0, 8)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${serviceMeta.color}`}
                        >
                          <ServiceIcon className="h-3 w-3" />
                          {serviceMeta.label}: {rev.serviceName || rev.serviceId}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        {/* Rating stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                          <span className="mr-1 font-bold text-foreground tabular-nums">{rev.rating}.0</span>
                        </div>
                        <span>•</span>
                        <span className="tabular-nums">
                          {new Date(rev.createdAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                        </span>
                      </div>

                      {rev.title && (
                        <h4 className="font-bold text-foreground text-sm pt-1">{rev.title}</h4>
                      )}
                      <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-3xl whitespace-pre-wrap">
                        {rev.comment}
                      </p>

                      {/* Attached photos */}
                      {rev.photos && rev.photos.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          {rev.photos.map((p, idx) => (
                            <a
                              key={idx}
                              href={p}
                              target="_blank"
                              rel="noreferrer"
                              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/50 group"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p}
                                alt={`صورة التقييم ${idx + 1}`}
                                className="h-full w-full object-cover transition-transform group-hover:scale-110 no-theme-image"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status badge & Moderation Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
                    <EnterpriseStatusBadge
                      variant={
                        rev.status === "approved"
                          ? "success"
                          : rev.status === "pending"
                          ? "pending"
                          : "danger"
                      }
                      label={
                        rev.status === "approved"
                          ? "معتمد ومنشور"
                          : rev.status === "pending"
                          ? "بانتظار الموافقة"
                          : "مخفي"
                      }
                      pulse={rev.status === "pending"}
                    />

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {rev.status !== "approved" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleModerate(rev.id, "approve")}
                          disabled={actionLoadingId === rev.id}
                          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>اعتماد</span>
                        </Button>
                      )}

                      {rev.status !== "hidden" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerate(rev.id, "hide")}
                          disabled={actionLoadingId === rev.id}
                          className="rounded-xl border-border/60 bg-card/60 hover:bg-muted text-xs h-8 px-2.5 gap-1"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>إخفاء</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => handleModerate(rev.id, "delete")}
                        disabled={actionLoadingId === rev.id}
                        title="حذف نهائي"
                        className="rounded-xl h-8 w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
