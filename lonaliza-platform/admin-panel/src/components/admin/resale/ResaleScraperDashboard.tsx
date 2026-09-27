"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Filter,
  Download,
  Send,
  Sparkles,
  Bot,
  RefreshCw,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  Layers,
  FileText,
  MessageSquare,
  Building2,
  ShieldCheck,
  Plus,
  Trash2,
  Clock,
  History,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Sliders,
  Share2,
  SlidersHorizontal,
  Maximize2,
  Tv,
  Radio,
  Square,
} from "lucide-react";
import type {
  ScraperJob,
  ScrapedBusinessLead,
  B2BMarketingTemplate,
  B2BCampaign,
  OutreachStatus,
} from "@/lib/server/gmaps-scraper/types";
import NewspaperCardsGrid from "./NewspaperCardsGrid";
import WhatsAppDirectModal from "./WhatsAppDirectModal";
import EmailDirectModal from "./EmailDirectModal";
import EmailMarketingHub from "./EmailMarketingHub";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import TemplateVisualPreviewModal from "./TemplateVisualPreviewModal";

type ActiveTab = "leads" | "launch" | "email_marketing" | "campaigns" | "templates" | "skills_rules";

export default function ResaleScraperDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("leads");

  // View Mode: Newspaper Editorial Cards vs Data Table
  const [viewMode, setViewMode] = useState<"newspaper" | "table">("newspaper");

  // In-App Confirmation Modal State (replaces native window.confirm)
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Template Visual Preview Modal State
  const [previewingTemplate, setPreviewingTemplate] = useState<B2BMarketingTemplate | null>(null);
  const [templateChannelFilter, setTemplateChannelFilter] = useState<"all" | "email" | "whatsapp">("all");

  // Direct Modal States
  const [activeWhatsAppLead, setActiveWhatsAppLead] = useState<ScrapedBusinessLead | null>(null);
  const [activeEmailLead, setActiveEmailLead] = useState<ScrapedBusinessLead | null>(null);

  // Core Data States
  const [leads, setLeads] = useState<ScrapedBusinessLead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [templates, setTemplates] = useState<B2BMarketingTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<B2BCampaign[]>([]);
  const [scraperHealthy, setScraperHealthy] = useState<boolean>(true);

  // Loading States
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [filterHasWhatsapp, setFilterHasWhatsapp] = useState(false);
  const [filterHasEmail, setFilterHasEmail] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Launch Scraper Form State
  const [launchCity, setLaunchCity] = useState("إسطنبول");
  const [launchCountry, setLaunchCountry] = useState("تركيا");
  const [launchKeywords, setLaunchKeywords] = useState("وكالات سياحة وسفر, حجز فنادق وطيران, Tourism Agency");
  const [launchDepth, setLaunchDepth] = useState(6);
  const [launchEmail, setLaunchEmail] = useState(true);
  const [launchSocials, setLaunchSocials] = useState(true);
  const [launchRadius, setLaunchRadius] = useState(15000);

  // Live Crawler & Tabs Scroll State
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [crawlerActive, setCrawlerActive] = useState(false);
  const [crawlerStatus, setCrawlerStatus] = useState<{
    active?: boolean;
    step?: string;
    message?: string;
    city?: string;
    country?: string;
    totalFound?: number;
    currentKeyword?: string;
    progressPercent?: number;
    lastLead?: unknown;
  } | null>(null);
  const [vncIframeKey, setVncIframeKey] = useState(0);

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsScrollRef.current) return;
    const amount = 240;
    const sign = direction === "left" ? -amount : amount;
    tabsScrollRef.current.scrollBy({ left: sign, behavior: "smooth" });
  };

  // Campaign Modal / Launch State
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignChannel, setCampaignChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [campaignTemplateId, setCampaignTemplateId] = useState("");

  // AI Studio State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState<"template" | "skills_rules">("template");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setStatusFeedback({ type, message });
    setTimeout(() => setStatusFeedback(null), 5000);
  };

  // Fetch Leads
  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCity) params.set("city", selectedCity);
      if (selectedStatus) params.set("status", selectedStatus);
      if (filterHasWhatsapp) params.set("hasWhatsapp", "true");
      if (filterHasEmail) params.set("hasEmail", "true");
      params.set("limit", "100");

      const res = await fetch(`/api/admin/resale/scraper/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotalLeads(data.total || 0);
        setStats(data.stats || null);
      }
    } catch {
      showNotification("error", "تعذر جلب بيانات الشركات");
    } finally {
      setLoadingLeads(false);
    }
  }, [searchQuery, selectedCity, selectedStatus, filterHasWhatsapp, filterHasEmail]);

  // Fetch Jobs
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/admin/resale/scraper/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setScraperHealthy(Boolean(data.healthy));
      }
    } catch {
      // ignore
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  // Fetch Templates
  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/admin/resale/scraper/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  // Fetch Campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/resale/scraper/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchLeads();
    void fetchJobs();
    void fetchTemplates();
    void fetchCampaigns();
  }, [fetchLeads, fetchJobs, fetchTemplates, fetchCampaigns]);

  // Real-time polling for live crawler status & continuous leads sync
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const checkCrawlerStatus = async () => {
      try {
        const res = await fetch("/api/admin/resale/scraper/live-crawler");
        if (res.ok) {
          const data = await res.json();
          setCrawlerStatus(data);
          const isActive = Boolean(data.active);
          setCrawlerActive(isActive);
          if (isActive) {
            void fetchLeads();
            void fetchJobs();
          }
        }
      } catch {}
    };

    void checkCrawlerStatus();
    interval = setInterval(checkCrawlerStatus, 2500);
    return () => clearInterval(interval);
  }, [fetchLeads, fetchJobs]);

  // Handle Launch Live Job
  const handleLaunchJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const kws = launchKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      const res = await fetch("/api/admin/resale/scraper/live-crawler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: launchCity,
          country: launchCountry,
          keywords: kws,
          depth: launchDepth,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        showNotification("success", `تم تشغيل محرك المسح الحي بنجاح لمدينة ${launchCity}! شاهد تفاعل المتصفح مباشرة بالأسفل.`);
        setCrawlerActive(true);
        setVncIframeKey((prev) => prev + 1);
        void fetchJobs();
        setActiveTab("launch");
      } else {
        showNotification("error", data.error || "فشل إطلاق محرك المسح الحي");
      }
    } catch {
      showNotification("error", "حدث خطأ غير متوقع أثناء إطلاق المهمة");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopCrawler = async () => {
    try {
      await fetch("/api/admin/resale/scraper/live-crawler", { method: "DELETE" });
      showNotification("success", "تم إيقاف عملية المسح الحي بنجاح");
      setCrawlerActive(false);
      void fetchJobs();
    } catch {
      showNotification("error", "فشل إيقاف المسح");
    }
  };

  // Handle Job Deletion (Using Custom In-App Modal)
  const handleDeleteJob = (jobId: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: "حذف سجل العملية نهائياً",
      description: "هل أنت متأكد من حذف سجل هذه العملية نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
      confirmLabel: "نعم، حذف السجل",
      cancelLabel: "إلغاء التراجع",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/resale/scraper/jobs?id=${jobId}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
            showNotification("success", "تم حذف سجل العملية بنجاح");
          }
        } catch {
          showNotification("error", "فشل حذف العملية");
        }
      },
    });
  };

  const handleClearAllJobs = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: "مسح كافة سجلات العمليات",
      description: "هل أنت متأكد من مسح كافة سجلات العمليات السابقة نهائياً من قاعدة البيانات؟",
      confirmLabel: "نعم، مسح السجل كاملاً",
      cancelLabel: "إلغاء التراجع",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/resale/scraper/jobs?all=true", {
            method: "DELETE",
          });
          if (res.ok) {
            setJobs([]);
            showNotification("success", "تم مسح كافة سجلات العمليات السابقة");
          }
        } catch {
          showNotification("error", "فشل مسح السجلات");
        }
      },
    });
  };

  // Handle Single & Bulk Lead Deletion
  const handleDeleteSingleLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/admin/resale/scraper/leads?id=${leadId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        setSelectedLeadIds((prev) => prev.filter((x) => x !== leadId));
        showNotification("success", "تم حذف الشركة بنجاح من قاعدة البيانات");
      }
    } catch {
      showNotification("error", "فشل حذف الشركة");
    }
  };

  const handleBulkDeleteLeads = () => {
    if (selectedLeadIds.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: `حذف ${selectedLeadIds.length} شركة محددة`,
      description: `هل أنت متأكد من حذف ${selectedLeadIds.length} شركة محددة نهائياً من قاعدة بيانات السكرابر؟ لا يمكن استرجاعها.`,
      confirmLabel: `نعم، حذف (${selectedLeadIds.length}) شركة`,
      cancelLabel: "إلغاء التراجع",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/resale/scraper/leads", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedLeadIds }),
          });
          if (res.ok) {
            const idSet = new Set(selectedLeadIds);
            setLeads((prev) => prev.filter((l) => !idSet.has(l.id)));
            setSelectedLeadIds([]);
            showNotification("success", `تم حذف ${selectedLeadIds.length} شركة بنجاح`);
            void fetchLeads();
          }
        } catch {
          showNotification("error", "فشل حذف الشركات المحددة");
        }
      },
    });
  };

  // Handle Lead Selection
  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Outreach Status Change
  const handleStatusChange = async (leadId: string, newStatus: OutreachStatus) => {
    try {
      const res = await fetch("/api/admin/resale/scraper/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, outreachStatus: newStatus } : l))
        );
        showNotification("success", "تم تحديث حالة الشركة بنجاح");
      }
    } catch {
      showNotification("error", "فشل تحديث الحالة");
    }
  };

  // Handle Export
  const handleExport = async (format: "csv" | "markdown" | "pdf_html") => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/resale/scraper/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          selectedIds: selectedLeadIds.length > 0 ? selectedLeadIds : undefined,
          filters: {
            search: searchQuery,
            city: selectedCity,
            status: selectedStatus as OutreachStatus,
            hasWhatsapp: filterHasWhatsapp,
            hasEmail: filterHasEmail,
          },
        }),
      });

      if (!res.ok) throw new Error("فشل إنشاء ملف التصدير");

      if (format === "pdf_html") {
        const html = await res.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
        }
      } else {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lonaliza_leads_${Date.now()}.${format === "csv" ? "csv" : "md"}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      showNotification("success", "تم تصدير البيانات بنجاح!");
    } catch {
      showNotification("error", "تعذر إتمام عملية التصدير");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Launch Campaign
  const handleLaunchCampaign = async () => {
    if (!campaignTemplateId) {
      showNotification("error", "يرجى اختيار القالب أولاً");
      return;
    }
    const targetIds = selectedLeadIds.length > 0 ? selectedLeadIds : leads.map((l) => l.id);
    if (targetIds.length === 0) {
      showNotification("error", "لا توجد شركات مستهدفة للإرسال");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/resale/scraper/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaignTitle || `حملة ${campaignChannel === "whatsapp" ? "واتساب" : "بريد"} (${targetIds.length} شركة)`,
          channel: campaignChannel,
          templateId: campaignTemplateId,
          targetLeadIds: targetIds,
        }),
      });

      if (res.ok) {
        showNotification("success", `تم إطلاق الحملة بنجاح إلى ${targetIds.length} شركة مع تأخير أمان ضد الحظر!`);
        setCampaignModalOpen(false);
        void fetchCampaigns();
        setActiveTab("campaigns");
      } else {
        const d = await res.json();
        showNotification("error", d.error || "فشل إطلاق الحملة");
      }
    } catch {
      showNotification("error", "حدث خطأ غير متوقع");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle AI Studio Request
  const handleAiStudio = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/admin/resale/scraper/ai-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: aiMode,
          prompt: aiPrompt,
          channel: campaignChannel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setAiResult(data.result);
        showNotification("success", "تم إنشاء المقترح الذكي بنجاح!");
      } else {
        showNotification("error", data.error || "فشل الذكاء الاصطناعي في إتمام الطلب");
      }
    } catch {
      showNotification("error", "خطأ أثناء الاتصال بالذكاء الاصطناعي");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-7 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
              رادار واستخبارات الشركات B2B
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                scraperHealthy
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
              }`}
            >
              <span className={`size-1.5 rounded-full ${scraperHealthy ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              {scraperHealthy ? "محرك السكرابر جاهز (8085)" : "حاوية السكرابر غير متصلة"}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-foreground mt-1">
            رادار شركات السياحة والسفر ومسح خرائط جوجل (Google Maps Scout)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            استخراج بيانات المكاتب السياحية، إثراء أرقام واتساب والإيميلات، وإطلاق حملات تسويقية ذكية وموزونة عبر خلية الوكلاء.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("launch")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Play className="size-3.5 fill-current" />
            <span>إطلاق مسح جديد</span>
          </button>

          <button
            type="button"
            onClick={() => setCampaignModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card-2 hover:bg-muted text-foreground text-xs font-bold border border-border transition-all cursor-pointer"
          >
            <Send className="size-3.5 text-primary" />
            <span>إطلاق حملة تسويقية</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            statusFeedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
          }`}
        >
          {statusFeedback.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
          <span>{statusFeedback.message}</span>
        </div>
      )}

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">إجمالي الشركات</span>
            <Building2 className="size-4 text-primary" />
          </div>
          <div className="text-xl font-black text-foreground font-mono">{totalLeads}</div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">يتوفر واتساب</span>
            <Phone className="size-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">
            {typeof stats?.totalWithWhatsapp === "number" ? stats.totalWithWhatsapp : 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">يتوفر إيميل</span>
            <Mail className="size-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-600 font-mono">
            {typeof stats?.totalWithEmail === "number" ? stats.totalWithEmail : 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">موقع وسوشيال</span>
            <Globe className="size-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-600 font-mono">
            {typeof stats?.totalWithSocials === "number" ? stats.totalWithSocials : 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">تم التواصل</span>
            <Send className="size-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 font-mono">
            {typeof stats?.totalContacted === "number" ? stats.totalContacted : 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">شركات مؤهلة</span>
            <ShieldCheck className="size-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-600 font-mono">
            {typeof stats?.totalQualified === "number" ? stats.totalQualified : 0}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation Bar (Styled to match Lonaliza standard) */}
      <div className="flex items-center gap-2 border-b border-border pb-3 w-full">
        {/* Scroll Navigation Arrows */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => scrollTabs("right")}
            className="size-8 rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="التمرير لليمين"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollTabs("left")}
            className="size-8 rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="التمرير لليسار"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Smooth Scrollable Tabs Strip with No Scrollbar */}
        <div
          ref={tabsScrollRef}
          className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth select-none p-1 rounded-2xl bg-muted/60 border border-border"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Tab 1: Leads */}
          <button
            type="button"
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "leads"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <Building2 className={`size-4 ${activeTab === "leads" ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
            <span>قائمة الشركات المستهدفة</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "leads" ? "bg-white text-purple-700" : "bg-purple-500/10 text-purple-600"
              }`}
            >
              {totalLeads}
            </span>
          </button>

          {/* Tab 2: Live Crawler */}
          <button
            type="button"
            onClick={() => setActiveTab("launch")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "launch"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <Play className={`size-4 ${activeTab === "launch" ? "text-white fill-current" : "text-purple-600 dark:text-purple-400"}`} />
            <span>المتصفح الحي ورادار الخرائط</span>
            {crawlerActive ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                <span className="size-1.5 rounded-full bg-white animate-ping" />
                بث حي نشط
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "launch" ? "bg-white text-purple-700" : "bg-muted text-muted-foreground"
                }`}
              >
                {jobs.length}
              </span>
            )}
          </button>

          {/* Tab 3: Email Marketing Hub */}
          <button
            type="button"
            onClick={() => setActiveTab("email_marketing")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "email_marketing"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <Mail className={`size-4 ${activeTab === "email_marketing" ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
            <span>لوحة التسويق بالبريد وخادم SMTP</span>
          </button>

          {/* Tab 4: Campaigns */}
          <button
            type="button"
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "campaigns"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <Send className={`size-4 ${activeTab === "campaigns" ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
            <span>حملات واتساب والبريد</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "campaigns" ? "bg-white text-purple-700" : "bg-purple-500/10 text-purple-600"
              }`}
            >
              {campaigns.length}
            </span>
          </button>

          {/* Tab 4: Templates */}
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "templates"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <FileText className={`size-4 ${activeTab === "templates" ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
            <span>مكتبة القوالب التسويقية</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "templates" ? "bg-white text-purple-700" : "bg-purple-500/10 text-purple-600"
              }`}
            >
              {templates.length}
            </span>
          </button>

          {/* Tab 5: Skills & AI */}
          <button
            type="button"
            onClick={() => setActiveTab("skills_rules")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "skills_rules"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <Sparkles className={`size-4 ${activeTab === "skills_rules" ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
            <span>استوديو الذكاء والمهارات</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LEADS EXPLORER & DATA TABLE */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="size-4 text-muted-foreground absolute start-3 top-3" />
                <input
                  type="text"
                  placeholder="ابحث باسم الشركة، الهاتف، الإيميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full ps-9 pe-3 py-2 rounded-xl bg-card-2 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="تصفية حسب المدينة (مثال: إسطنبول)..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card-2 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">كافة حالات التواصل</option>
                  <option value="new">جديدة (New)</option>
                  <option value="contacted_whatsapp">تمت مراسلتها واتساب</option>
                  <option value="contacted_email">أُرسل لها إيميل</option>
                  <option value="qualified">مؤهلة ومهتمة (Qualified)</option>
                  <option value="meeting_booked">تم حجز ديمو</option>
                  <option value="converted">تم التعاقد والتحويل</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterHasWhatsapp(!filterHasWhatsapp)}
                  className={`flex-1 py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    filterHasWhatsapp ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-card-2 border-border text-muted-foreground"
                  }`}
                >
                  <Phone className="size-3" />
                  <span>واتساب فقط</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterHasEmail(!filterHasEmail)}
                  className={`flex-1 py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    filterHasEmail ? "bg-blue-500/10 border-blue-500/30 text-blue-600" : "bg-card-2 border-border text-muted-foreground"
                  }`}
                >
                  <Mail className="size-3" />
                  <span>إيميل فقط</span>
                </button>
              </div>
            </div>

            {/* Bulk Action Controls & View Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs">
              <div className="flex items-center gap-3">
                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
                  <button
                    type="button"
                    onClick={() => setViewMode("newspaper")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      viewMode === "newspaper"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Layers className="size-3.5 text-purple-600" />
                    <span>بطاقات الجريدة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <SlidersHorizontal className="size-3.5 text-blue-600" />
                    <span>جدول البيانات</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 font-bold text-muted-foreground">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    {selectedLeadIds.length === leads.length ? "إلغاء التحديد" : "تحديد الكل"}
                  </button>
                  <span>• ({selectedLeadIds.length}) محدد من ({leads.length})</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-2 hover:bg-muted text-foreground font-bold border border-border cursor-pointer transition-all"
                >
                  <Download className="size-3.5 text-emerald-600" />
                  <span>تصدير CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport("markdown")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-2 hover:bg-muted text-foreground font-bold border border-border cursor-pointer transition-all"
                >
                  <FileText className="size-3.5 text-blue-600" />
                  <span>تصدير MD</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport("pdf_html")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-2 hover:bg-muted text-foreground font-bold border border-border cursor-pointer transition-all"
                >
                  <Download className="size-3.5 text-amber-600" />
                  <span>تقرير PDF</span>
                </button>

                {selectedLeadIds.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCampaignModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-xs cursor-pointer hover:bg-primary/90 transition-all text-xs"
                    >
                      <Send className="size-3.5" />
                      <span>إرسال حملة ({selectedLeadIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkDeleteLeads}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 font-bold text-xs cursor-pointer transition-all"
                      title="حذف الشركات المحددة نهائياً"
                    >
                      <Trash2 className="size-3.5" />
                      <span>حذف المحددين ({selectedLeadIds.length})</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: NEWSPAPER CARDS GRID */}
          {viewMode === "newspaper" ? (
            <NewspaperCardsGrid
              leads={leads}
              selectedLeadIds={selectedLeadIds}
              onToggleSelect={(id) => {
                setSelectedLeadIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                );
              }}
              onStatusChange={handleStatusChange}
              onOpenWhatsApp={(lead) => setActiveWhatsAppLead(lead)}
              onOpenEmail={(lead) => setActiveEmailLead(lead)}
              onDeleteLead={handleDeleteSingleLead}
              loading={loadingLeads}
            />
          ) : (
            /* VIEW MODE 2: DETAILED DATA TABLE */
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            {loadingLeads ? (
              <div className="p-16 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-xs font-bold">جاري تحميل بيانات رادار الشركات...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                  <MapPin className="size-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">لا توجد نتائج مطابقة لبحثك</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  قم بإطلاق مهمة مسح جديدة لمدينتك المستهدفة أو قم بتوسيع نطاق التصفية أعلاه.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("launch")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                >
                  <Play className="size-3" />
                  <span>إطلاق أول مهمة مسح الآن</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-card-2 border-b border-border text-muted-foreground">
                    <tr>
                      <th className="p-3 text-start w-10">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.length === leads.length && leads.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-border text-primary cursor-pointer"
                        />
                      </th>
                      <th className="p-3 text-start">الشركة والتصنيف</th>
                      <th className="p-3 text-start">المدينة والدولة</th>
                      <th className="p-3 text-start">الهاتف وواتساب</th>
                      <th className="p-3 text-start">البريد الإلكتروني</th>
                      <th className="p-3 text-start">التقييم</th>
                      <th className="p-3 text-start">الموقع والحسابات</th>
                      <th className="p-3 text-start">حالة التواصل</th>
                      <th className="p-3 text-end">إجراء مباشر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      return (
                        <tr
                          key={lead.id}
                          className={`hover:bg-card-2/50 transition-colors ${
                            isSelected ? "bg-primary/5" : ""
                          }`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectLead(lead.id)}
                              className="rounded border-border text-primary cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-black text-foreground text-xs">{lead.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{lead.category}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-foreground font-bold">{lead.city}</div>
                            <div className="text-[10px] text-muted-foreground">{lead.country}</div>
                          </td>
                          <td className="p-3 font-mono">
                            {lead.whatsappPhone ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 font-bold" dir="ltr">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                <span>+{lead.whatsappPhone}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{lead.phone || "—"}</span>
                            )}
                          </td>
                          <td className="p-3 font-mono">
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-blue-600 hover:underline truncate max-w-[140px] block"
                                title={lead.email}
                              >
                                {lead.email}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {lead.reviewRating ? (
                              <div className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="size-3 fill-current" />
                                <span>{lead.reviewRating}</span>
                                <span className="text-[10px] text-muted-foreground">({lead.reviewCount})</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {lead.website && (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="size-6 rounded-lg bg-card-2 border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                  title="زيارة الموقع"
                                >
                                  <Globe className="size-3" />
                                </a>
                              )}
                              {lead.instagram && (
                                <a
                                  href={lead.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="size-6 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600"
                                  title="انستغرام"
                                >
                                  <span className="text-[9px] font-black">IG</span>
                                </a>
                              )}
                              {lead.facebook && (
                                <a
                                  href={lead.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="size-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600"
                                  title="فيسبوك"
                                >
                                  <span className="text-[9px] font-black">FB</span>
                                </a>
                              )}
                              {lead.linkedin && (
                                <a
                                  href={lead.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="size-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600"
                                  title="لينكدإن"
                                >
                                  <span className="text-[9px] font-black">IN</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <select
                              value={lead.outreachStatus}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as OutreachStatus)}
                              className="px-2 py-1 rounded-lg bg-card-2 border border-border text-[10px] font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="new">جديدة</option>
                              <option value="contacted_whatsapp">أُرسل واتساب</option>
                              <option value="contacted_email">أُرسل إيميل</option>
                              <option value="qualified">مؤهلة ومهتمة</option>
                              <option value="meeting_booked">تم حجز ديمو</option>
                              <option value="converted">تم التحويل</option>
                              <option value="archived">أرشيف</option>
                            </select>
                          </td>
                          <td className="p-3 text-end">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setActiveWhatsAppLead(lead)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                title="مراسلة واتساب من لوحة التحكم"
                              >
                                <MessageSquare className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveEmailLead(lead)}
                                className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors cursor-pointer"
                                title="مراسلة بريد عبر خادم SMTP"
                              >
                                <Mail className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE GMAPS CRAWLER WORKSTATION & VNC */}
      {activeTab === "launch" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Control & Launch Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                      <Play className="size-5 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground">لوحة التحكم في المسح المباشر</h3>
                      <p className="text-[11px] text-muted-foreground">Playwright Headful على شاشة VNC :99</p>
                    </div>
                  </div>
                  {crawlerActive && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse">
                      <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                      يعمل الآن
                    </span>
                  )}
                </div>

                <form onSubmit={handleLaunchJob} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">المدينة المستهدفة</label>
                    <input
                      type="text"
                      required
                      value={launchCity}
                      onChange={(e) => setLaunchCity(e.target.value)}
                      placeholder="مثال: إسطنبول، طرابزون، أنطاليا..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">الدولة</label>
                    <input
                      type="text"
                      value={launchCountry}
                      onChange={(e) => setLaunchCountry(e.target.value)}
                      placeholder="مثال: تركيا، الإمارات، السعودية..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">الكلمات المفتاحية (مفصولة بفاصلة)</label>
                    <textarea
                      rows={2}
                      value={launchKeywords}
                      onChange={(e) => setLaunchKeywords(e.target.value)}
                      placeholder="وكالات سياحة وسفر, حجز فنادق وطيران..."
                      className="w-full px-3.5 py-2 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary leading-relaxed font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span>عمق وسرعة المسح (Depth: {launchDepth})</span>
                      <span className="text-purple-600 font-mono font-black">~{launchDepth * 10} شركات سياحية مستهدفة</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={launchDepth}
                      onChange={(e) => setLaunchDepth(parseInt(e.target.value, 10))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {[
                        { label: "20 شركة (سريع)", depth: 2 },
                        { label: "50 شركة (متوسط)", depth: 5 },
                        { label: "100 شركة (موسع)", depth: 10 },
                        { label: "200+ شركة (شامل)", depth: 20 },
                      ].map((preset) => (
                        <button
                          key={preset.depth}
                          type="button"
                          onClick={() => setLaunchDepth(preset.depth)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            launchDepth === preset.depth
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : "bg-card-2 text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading || crawlerActive}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : crawlerActive ? (
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-white animate-ping" />
                          المسح جاري الآن...
                        </span>
                      ) : (
                        <>
                          <Play className="size-4 fill-current" />
                          <span>بدء المسح الحي والمباشر</span>
                        </>
                      )}
                    </button>

                    {crawlerActive && (
                      <button
                        type="button"
                        onClick={handleStopCrawler}
                        className="px-3 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 font-bold text-xs transition-colors cursor-pointer"
                        title="إيقاف المسح"
                      >
                        <Square className="size-4 fill-current" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Real-time Status Card */}
                <div className="p-3.5 rounded-2xl bg-card-2 border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-foreground flex items-center gap-1.5">
                      <Radio className={`size-3.5 ${crawlerActive ? "text-rose-500 animate-pulse" : "text-muted-foreground"}`} />
                      حالة الرادار المباشر
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {crawlerStatus?.totalFound || 0} شركة مكتشفة
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${crawlerStatus?.progressPercent || (crawlerActive ? 40 : 0)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                    {crawlerStatus?.message || "جاهز للبدء. اضغط 'بدء المسح الحي والمباشر' لمشاهدة المتصفح يتنقل ويبحث."}
                  </p>
                </div>
              </div>
            </div>

            {/* Live VNC Workstation Column (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden">
                {/* macOS Style Window Titlebar */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ms-3 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <Tv className="size-3.5 text-purple-400" />
                      Chromium Live Headful Workstation (Display :99)
                    </span>
                  </div>

                  {/* Browser URL Bar Mockup */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 w-1/2 justify-center">
                    <span className="text-emerald-400 text-xs">🔒</span>
                    <span className="truncate">https://www.google.com/maps/search/{encodeURIComponent(launchCity)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVncIframeKey((prev) => prev + 1)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="إعادة تحميل البث"
                    >
                      <RefreshCw className="size-3" />
                      <span>تحديث البث</span>
                    </button>
                    <a
                      href="/novnc/vnc.html?autoconnect=true&resize=scale&path=/novnc/websockify&reconnect=true&reconnect_delay=2000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="فتح في نافذة كاملة"
                    >
                      <Maximize2 className="size-3.5" />
                    </a>
                  </div>
                </div>

                {/* VNC Iframe Container */}
                <div className="relative w-full h-[620px] bg-slate-950 flex flex-col items-center justify-center">
                  <iframe
                    key={vncIframeKey}
                    src="/novnc/vnc.html?autoconnect=true&resize=scale&path=/novnc/websockify&reconnect=true&reconnect_delay=2000"
                    className="w-full h-full border-0"
                    title="Live VNC Google Maps Browser"
                  />
                </div>

                {/* Workstation Footer Banner */}
                <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${crawlerActive ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                    <span>
                      {crawlerActive
                        ? "البث المباشر نشط: الروبوت يتصفح الخريطة ويستخرج الشركات الآن..."
                        : "شاشة VNC متصلة وجاهزة. عند إطلاق المسح ستشاهد المتصفح يتنقل ويبحث مباشرة."}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-purple-400">
                    Engine: Playwright v1.63 + Chromium / Xvfb :99
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FULL-WIDTH PREVIOUS & ACTIVE OPERATIONS CONTAINER */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <History className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    سجل عمليات المسح السابقة والمهام المسجلة
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-mono text-[11px] font-bold">
                      {jobs.length} عمليات
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    متابعة تفاصيل كل مهمة مسح تم إطلاقها، حالة التنفيذ، مع إمكانية الإيقاف الفوري أو حذف السجلات نهائياً
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void fetchJobs()}
                  disabled={loadingJobs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card-2 hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
                  title="تحديث قائمة المهام"
                >
                  <RefreshCw className={`size-3.5 ${loadingJobs ? "animate-spin" : ""}`} />
                  <span>تحديث السجل</span>
                </button>

                {jobs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllJobs}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-600 transition-colors cursor-pointer"
                    title="مسح كافة سجلات العمليات السابقة"
                  >
                    <Trash2 className="size-3.5" />
                    <span>مسح كافة السجلات</span>
                  </button>
                )}
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                لا توجد عمليات مسح سابقة مسجلة.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {jobs.map((j) => {
                  const isWorking = j.status === "working" || j.status === "running";
                  return (
                    <div
                      key={j.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isWorking
                          ? "border-purple-500/50 bg-purple-500/5 shadow-xs ring-1 ring-purple-500/20"
                          : "border-border bg-card-2 hover:bg-card"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-purple-600" />
                            <span>{j.city} ({j.country || "تركيا"})</span>
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              j.status === "ok" || j.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : isWorking
                                ? "bg-purple-600 text-white animate-pulse shadow-xs"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {j.status === "ok" || j.status === "completed" ? "نجاح (مكتملة)" : isWorking ? "جاري المسح الآن" : "متوقفة / ملغاة"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {j.keywords?.map((kw, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {j.totalFound || 0} شركة مكتشفة
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isWorking && (
                            <button
                              type="button"
                              onClick={handleStopCrawler}
                              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-[10px] transition-colors"
                            >
                              إيقاف فوري
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteJob(j.id)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="حذف هذا السجل"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: EMAIL MARKETING & SMTP HUB */}
      {activeTab === "email_marketing" && (
        <EmailMarketingHub
          leads={leads}
          templates={templates}
          onRefreshLeads={fetchLeads}
        />
      )}

      {/* TAB 3: CAMPAIGNS & DISPATCHER */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-foreground">حملات التسويق B2B الآمنة</h2>
              <p className="text-xs text-muted-foreground">
                إرسال رسائل مخصصة للشركات السياحية مع تأخير زمني أمان (Anti-Ban Jitter) لحماية أرقام واتساب من الحظر.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCampaignModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs cursor-pointer hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              <span>إنشاء حملة تسويقية جديدة</span>
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-16 rounded-3xl border border-border bg-card text-center space-y-3">
              <Send className="size-8 mx-auto text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">لا توجد حملات تسويقية سابقة</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                اختر الشركات من التبويب الأول، ثم اضغط على «إرسال حملة» لتبدأ إرسال رسائل واتساب أو إيميلات مخصصة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${camp.channel === "whatsapp" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}>
                        {camp.channel === "whatsapp" ? <MessageSquare className="size-4" /> : <Mail className="size-4" />}
                      </span>
                      <h4 className="font-black text-foreground text-xs">{camp.title}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        camp.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : camp.status === "sending"
                          ? "bg-amber-500/10 text-amber-600 animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {camp.status === "completed" ? "مكتملة" : camp.status === "sending" ? "جاري الإرسال بأمان..." : "في الانتظار"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-card-2 font-mono text-center">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-sans">المستهدفون</div>
                      <div className="text-sm font-bold text-foreground">{camp.totalRecipients}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-600 font-sans">تم الإرسال</div>
                      <div className="text-sm font-bold text-emerald-600">{camp.sentCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-600 font-sans">فشل</div>
                      <div className="text-sm font-bold text-rose-600">{camp.failedCount}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>التأخير الآمن: {camp.jitterMinSeconds}-{camp.jitterMaxSeconds} ثانية</span>
                    <span>{new Date(camp.createdAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TEMPLATES & AI STUDIO WITH LIVE VISUAL PREVIEWS */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-border bg-card shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <FileText className="size-5" />
                </div>
                <h2 className="text-base font-black text-foreground">استوديو قوالب B2B والمعاينة البصرية المباشرة</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                استعراض وتخصيص 20 قالب بريد إلكتروني HTML تفاعلي و 20 قالب واتساب تسويقي موجه للشركات السياحية.
              </p>
            </div>

            {/* Channel Filter Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/80 border border-border self-start sm:self-center">
              <button
                type="button"
                onClick={() => setTemplateChannelFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  templateChannelFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                الكل ({templates.length})
              </button>
              <button
                type="button"
                onClick={() => setTemplateChannelFilter("email")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  templateChannelFilter === "email"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="size-3.5" />
                <span>بريد HTML ({templates.filter((t) => t.channel === "email").length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTemplateChannelFilter("whatsapp")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  templateChannelFilter === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="size-3.5" />
                <span>واتساب ({templates.filter((t) => t.channel === "whatsapp").length})</span>
              </button>
            </div>
          </div>

          {/* Templates Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates
              .filter((tmpl) => {
                if (templateChannelFilter === "email") return tmpl.channel === "email";
                if (templateChannelFilter === "whatsapp") return tmpl.channel === "whatsapp";
                return true;
              })
              .map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-5 rounded-3xl border border-border bg-card hover:border-primary/40 shadow-xs hover:shadow-md transition-all space-y-4 text-xs flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                          tmpl.channel === "whatsapp"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {tmpl.channel === "whatsapp" ? <MessageSquare className="size-3" /> : <Mail className="size-3" />}
                        <span>{tmpl.channel === "whatsapp" ? "واتساب B2B" : "بريد HTML فاخر"}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-lg border border-border/50">
                        {tmpl.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                        {tmpl.title}
                      </h4>
                      {tmpl.subject && (
                        <div className="text-[11px] font-bold text-primary mt-1 line-clamp-1">
                          عنوان البريد: {tmpl.subject}
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-line bg-muted/30 p-2.5 rounded-xl border border-border/40">
                      {tmpl.body}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-1 text-[9px] font-mono text-muted-foreground">
                      {tmpl.variables.map((v) => (
                        <span key={v} className="bg-muted px-1.5 py-0.5 rounded text-foreground/80 font-bold">
                          {`{${v}}`}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Visual Live Preview Trigger */}
                      <button
                        type="button"
                        onClick={() => setPreviewingTemplate(tmpl)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="معاينة بصرية حية لشكل القالب النهائي"
                      >
                        <Eye className="size-3.5 text-primary" />
                        <span>معاينة بصرية</span>
                      </button>

                      {/* Launch Campaign with this Template */}
                      <button
                        type="button"
                        onClick={() => {
                          setCampaignChannel(tmpl.channel);
                          setCampaignTemplateId(tmpl.id);
                          setCampaignModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Send className="size-3" />
                        <span>إطلاق حملة</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: SKILLS & RULES + AI CHAT ASSISTANT */}
      {activeTab === "skills_rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-3xl border border-border bg-card shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <ShieldCheck className="size-6 text-primary" />
                <div>
                  <h3 className="text-sm font-black text-foreground">قواعد التأريض الصارم ومهارات الوكلاء (Grounded Skills & Rules)</h3>
                  <p className="text-[11px] text-muted-foreground">الضوابط الحاكمة لوكلاء المبيعات والرادار لمنع التخريف أو الوعود غير الحقيقية</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-card-2 border border-border space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>شخصية خبير المبيعات البشري (Human-Like Warm Advisor)</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    يلتزم وكيل واتساب بالرد بأسلوب خبير سياحي بشري، راقٍ وودود، خالي من الجمل الروبوتية الجافة، مع تأخير واقعي في الكتابة (Composing Presence من 2.5 إلى 5 ثوانٍ) لمنع شعور العميل بأنه يتحدث مع بوت.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-card-2 border border-border space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-foreground">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span>حظر التخريف والوعود الوهمية (Zero Hallucination Grounding)</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    يُحظر على الوكيل اختراع أي أسعار حجز أو نسب خصم تتجاوز 15%، أو ادعاء ميزات لا توجد في لوناليزا. يجب الاعتماد فقط على رابط الديمو الحي ومحركات الفنادق والطيران المربوطة فعلياً.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-card-2 border border-border space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-foreground">
                    <span className="size-2 rounded-full bg-blue-500" />
                    <span>التسليم الفوري لموظف بشري (Human Handover)</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    عندما يطلب العميل التحدث مع موظف أو يطلب عقداً رسمياً أو اتصالاً هاتفياً، يقوم الوكيل فوراً بتأكيد الطلب بلطف وإرسال إشعار تليجرام عاجل للمدير العام مع رقم العميل ورابط المحادثة.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-card-2 border border-border space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-foreground">
                    <span className="size-2 rounded-full bg-purple-500" />
                    <span>حماية أرقام واتساب من الحظر (Anti-Ban Protocol)</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    تطبيق فواصل زمنية متغيرة (Jitter) تتراوح بين 25 و 50 ثانية، مع تنويع نصوص الرسائل باستخدام المتغيرات الذكية وعدم إرسال أكثر من 150 رسالة تسويقية يومياً للرقم الواحد.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat Studio for Skills & Rules */}
          <div className="lg:col-span-1 rounded-3xl border border-border bg-card p-5 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Bot className="size-5 text-primary" />
              <div>
                <h3 className="font-black text-foreground">مساعد الذكاء الاصطناعي للمهارات والقواعد</h3>
                <p className="text-[11px] text-muted-foreground">صياغة وتحديث القواعد والمهارات بأوامر نصية</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-foreground block mb-1">الهدف المطلوب</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAiMode("skills_rules")}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                      aiMode === "skills_rules" ? "bg-primary text-primary-foreground border-primary" : "bg-card-2 border-border text-muted-foreground"
                    }`}
                  >
                    مهارة / قاعدة لوكيل
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiMode("template")}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                      aiMode === "template" ? "bg-primary text-primary-foreground border-primary" : "bg-card-2 border-border text-muted-foreground"
                    }`}
                  >
                    قالب تسويقي جديد
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">اكتب تعليماتك للمساعد</label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={
                    aiMode === "skills_rules"
                      ? "مثال: أضف مهارة لوكيل المبيعات ترشده لكيفية إقناع مكاتب العمرة بالسياحة في تركيا..."
                      : "مثال: صمم رسالة واتساب حصرية تركز على خصم 20% لوكالات السياحة في الرياض..."
                  }
                  className="w-full p-2.5 rounded-xl bg-card-2 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleAiStudio}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-xs cursor-pointer hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                <span>{aiLoading ? "جاري التوليد الذكي..." : "توليد بالذكاء الاصطناعي"}</span>
              </button>

              {/* AI Result Card */}
              {aiResult && (
                <div className="p-3.5 rounded-2xl bg-card-2 border border-border space-y-2 animate-in fade-in">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" />
                    <span>المقترح المولد:</span>
                  </div>
                  <div className="font-black text-foreground text-xs">{String(aiResult.title || "")}</div>
                  <p className="text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed">
                    {String(aiResult.body || aiResult.markdown || "")}
                  </p>
                  {aiMode === "template" && (
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch("/api/admin/resale/scraper/templates", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            title: aiResult.title,
                            channel: campaignChannel,
                            body: aiResult.body,
                            isAiGenerated: true,
                          }),
                        });
                        showNotification("success", "تم حفظ القالب بنجاح في المكتبة!");
                        void fetchTemplates();
                      }}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                    >
                      إضافة القالب للمكتبة فوراً
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGN LAUNCH MODAL */}
      {campaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-black text-foreground text-sm flex items-center gap-2">
                <Send className="size-4 text-primary" />
                <span>إطلاق حملة تسويقية ذكية للشركات</span>
              </h3>
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-foreground block mb-1">عنوان الحملة (داخلي)</label>
                <input
                  type="text"
                  placeholder="مثال: حملة مكاتب إسطنبول - عروض الوايت ليبل"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">قناة الإرسال</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCampaignChannel("whatsapp")}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      campaignChannel === "whatsapp" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-black" : "bg-card-2 border-border text-muted-foreground"
                    }`}
                  >
                    <MessageSquare className="size-3.5" />
                    <span>واتساب (WhatsApp Slot 1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCampaignChannel("email")}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      campaignChannel === "email" ? "bg-blue-500/10 border-blue-500/30 text-blue-600 font-black" : "bg-card-2 border-border text-muted-foreground"
                    }`}
                  >
                    <Mail className="size-3.5" />
                    <span>بريد إلكتروني (SMTP)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">اختيار القالب التسويقي</label>
                <select
                  value={campaignTemplateId}
                  onChange={(e) => setCampaignTemplateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary cursor-pointer font-bold"
                >
                  <option value="">اختر قالباً من القائمة...</option>
                  {templates
                    .filter((t) => t.channel === campaignChannel)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-card-2 border border-border space-y-1 text-[11px] text-muted-foreground">
                <div className="flex justify-between font-bold text-foreground">
                  <span>الشركات المشمولة بالحملة:</span>
                  <span className="text-primary font-mono">{selectedLeadIds.length > 0 ? selectedLeadIds.length : leads.length} شركة</span>
                </div>
                <div className="flex justify-between">
                  <span>فاصل الأمان ضد الحظر (Jitter):</span>
                  <span>25 إلى 50 ثانية بين كل رسالة</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card-2 text-foreground font-bold hover:bg-muted"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleLaunchCampaign}
                disabled={actionLoading || !campaignTemplateId}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-black flex items-center gap-1.5 shadow-xs hover:bg-primary/90 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                <span>بدء الإرسال الفوري</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct WhatsApp Modal */}
      {activeWhatsAppLead && (
        <WhatsAppDirectModal
          isOpen={Boolean(activeWhatsAppLead)}
          onClose={() => setActiveWhatsAppLead(null)}
          lead={activeWhatsAppLead}
          templates={templates}
          onSentSuccess={(leadId) => {
            handleStatusChange(leadId, "contacted_whatsapp" as OutreachStatus);
            showNotification("success", "تم تسجيل إرسال رسالة واتساب للشركة بنجاح!");
          }}
        />
      )}

      {/* Direct Email via SMTP Modal */}
      {activeEmailLead && (
        <EmailDirectModal
          isOpen={Boolean(activeEmailLead)}
          onClose={() => setActiveEmailLead(null)}
          lead={activeEmailLead}
          templates={templates}
          onSentSuccess={(leadId) => {
            handleStatusChange(leadId, "contacted_email" as OutreachStatus);
            showNotification("success", "تم إرسال البريد الإلكتروني عبر خادم SMTP بنجاح!");
          }}
        />
      )}

      {/* Global In-App Confirmation Modal (Replaces browser confirm) */}
      <ConfirmDeleteModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        confirmLabel={confirmModalConfig.confirmLabel}
        cancelLabel={confirmModalConfig.cancelLabel}
        isDestructive={confirmModalConfig.isDestructive ?? true}
      />

      {/* Interactive Visual Template Preview Modal */}
      <TemplateVisualPreviewModal
        isOpen={Boolean(previewingTemplate)}
        onClose={() => setPreviewingTemplate(null)}
        template={previewingTemplate}
        onUseInCampaign={(tmpl) => {
          setCampaignChannel(tmpl.channel);
          setCampaignTemplateId(tmpl.id);
          setCampaignModalOpen(true);
        }}
      />
    </div>
  );
}
