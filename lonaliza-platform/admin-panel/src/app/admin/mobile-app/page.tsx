"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Smartphone,
  Bot,
  Bell,
  Layers,
  Compass,
  Sparkles,
  Terminal,
  Download,
  Play,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Plus,
  Send,
  Wand2,
  RefreshCw,
  Clock,
  Trash2,
  Check,
  Maximize2,
  Home,
  Wallet,
  PlayCircle,
  User,
  Plane,
  Building,
  MessageCircle,
  Gift,
  ArrowUp,
  ArrowDown,
  Palette,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  MobileAppStudioSettings,
  MobileAppBuildStatus,
  BottomNavTabConfig,
  SplashSlideConfig,
} from "@/lib/mobile-app-types";
import { DEFAULT_BOTTOM_NAV_TABS, DEFAULT_SPLASH_SLIDES } from "@/lib/mobile-app-types";
import { MobileAppBuilderView } from "@/components/builder/mobile-app-builder-view";
import { StoreShowcaseStudio } from "@/components/admin/mobile-app/StoreShowcaseStudio";
import { AppIconsStudio } from "@/components/admin/mobile-app/AppIconsStudio";
import { StoreLinksPublishingStudio } from "@/components/admin/mobile-app/StoreLinksPublishingStudio";
import { MediaPickerModal } from "@/components/admin/mobile-app/MediaPickerModal";

type SearchTabVisibility = Record<string, boolean>;

interface PushTemplate {
  id: string;
  titleAr: string;
  bodyAr: string;
  targetScreen: string;
  deepLink?: string;
  category: "flash_deal" | "price_drop" | "wallet_cashback" | "weekend_escape" | "abandoned_search";
  badgeText?: string;
  createdAt: string;
  sentCount: number;
}

interface SwarmAgentData {
  id: string;
  nameAr: string;
  titleAr: string;
  missionAr: string;
  systemPrompt: string;
  enabled: boolean;
}

const TABS = [
  { id: "builder", label: "المحرر البصري للهاتف", icon: Smartphone },
  { id: "store_links", label: "روابط المتاجر ونشر التطبيق (Google & Apple)", icon: Globe },
  { id: "concierge_agent", label: "مساعد لوناليزا (Concierge)", icon: Bot },
  { id: "push_agent", label: "وكيل الإشعارات الذكي", icon: Bell },
  { id: "services", label: "مصفوفة الخدمات الثنائية", icon: Layers },
  { id: "bottom_nav", label: "شريط التنقل السفلي (5 تبويبات)", icon: Compass },
  { id: "splash_showcase", label: "سلايدات التعريف والترحيب (5)", icon: Sparkles },
  { id: "store_showcase", label: "أصول وشاشات المتاجر (Showcase)", icon: Sparkles },
  { id: "app_icons", label: "أيقونة وهوية التطبيق (App Icons)", icon: Palette },
  { id: "build", label: "محرك البناء والتنزيل الفوري", icon: Terminal },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminMobileAppStudioPage() {
  const [activeTab, setActiveTab] = useState<TabId>("builder");

  const [settings, setSettings] = useState<MobileAppStudioSettings | null>(null);
  const [build, setBuild] = useState<MobileAppBuildStatus>({ state: "idle" });
  const [webServices, setWebServices] = useState<SearchTabVisibility>({});
  const [appServices, setAppServices] = useState<SearchTabVisibility>({});
  const [saving, setSaving] = useState(false);
  const [building, setBuilding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollTabs = (offset: number) => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Bottom Navigation State
  const [bottomNavTabs, setBottomNavTabs] = useState<BottomNavTabConfig[]>(DEFAULT_BOTTOM_NAV_TABS);
  const [bottomNavBg, setBottomNavBg] = useState("#ffffff");
  const [bottomNavActiveColor, setBottomNavActiveColor] = useState("#2E1065");
  const [bottomNavInactiveColor, setBottomNavInactiveColor] = useState("#64748B");

  // Splash Showcase State
  const [splashSlides, setSplashSlides] = useState<SplashSlideConfig[]>(DEFAULT_SPLASH_SLIDES);
  const [aiSlidesPrompt, setAiSlidesPrompt] = useState("");
  const [generatingSlides, setGeneratingSlides] = useState(false);
  const [splashPickerSlideId, setSplashPickerSlideId] = useState<string | null>(null);

  // Live Studio Preview States
  const [previewActiveNavIndex, setPreviewActiveNavIndex] = useState(0);
  const [previewActiveSlideIndex, setPreviewActiveSlideIndex] = useState(0);

  // Helper to render icon by name
  const renderTabIcon = (iconName: string, className = "h-5 w-5") => {
    const norm = (iconName || "").toLowerCase();
    switch (norm) {
      case "home":
        return <Home className={className} />;
      case "wallet":
        return <Wallet className={className} />;
      case "compass":
        return <Compass className={className} />;
      case "user":
        return <User className={className} />;
      case "play":
      case "playcircle":
      case "video":
        return <PlayCircle className={className} />;
      case "plane":
      case "flight":
        return <Plane className={className} />;
      case "hotel":
      case "building":
        return <Building className={className} />;
      case "sparkles":
        return <Sparkles className={className} />;
      case "gift":
        return <Gift className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  // Concierge Agent State
  const [conciergeAgent, setConciergeAgent] = useState<SwarmAgentData | null>(null);
  const [savingAgent, setSavingAgent] = useState(false);

  // Push Notifications State
  const [pushTemplates, setPushTemplates] = useState<PushTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PushTemplate | null>(null);
  const [sendingPush, setSendingPush] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  const terminalRef = useRef<HTMLDivElement>(null);

  const reload = () => {
    void fetch("/api/admin/mobile-app", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
          if (Array.isArray(data.settings.bottomNavTabs) && data.settings.bottomNavTabs.length) {
            setBottomNavTabs(data.settings.bottomNavTabs);
          }
          if (Array.isArray(data.settings.splashSlides) && data.settings.splashSlides.length) {
            setSplashSlides(data.settings.splashSlides);
          }
          if (data.settings.bottomNavBg) setBottomNavBg(data.settings.bottomNavBg);
          if (data.settings.bottomNavActiveColor) setBottomNavActiveColor(data.settings.bottomNavActiveColor);
          if (data.settings.bottomNavInactiveColor) setBottomNavInactiveColor(data.settings.bottomNavInactiveColor);
        }
        if (data.build) setBuild(data.build);
      });

    void fetch("/api/admin/search-tabs", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (data.websiteEnabled) setWebServices(data.websiteEnabled);
        if (data.appEnabled) setAppServices(data.appEnabled);
      });

    void fetch("/api/admin/mobile-app/agents", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.agents?.app_concierge) {
          setConciergeAgent(data.agents.app_concierge);
        }
      });

    void fetch("/api/admin/mobile-app/notifications", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.templates)) {
          setPushTemplates(data.templates);
          if (!selectedTemplate && data.templates.length > 0) {
            setSelectedTemplate(data.templates[0]);
          }
        }
      });
  };

  useEffect(() => {
    reload();
    const interval = window.setInterval(reload, 4000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [build.logs]);

  const saveSettings = async (customSuccessMessage?: string) => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      ...settings,
      bottomNavTabs,
      splashSlides,
      bottomNavBg,
      bottomNavActiveColor,
      bottomNavInactiveColor,
    };

    try {
      const res = await fetch("/api/admin/mobile-app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);

      // Save channel services dual toggle
      await fetch("/api/admin/search-tabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteEnabled: webServices,
          appEnabled: appServices,
        }),
      });

      setMessage({ type: "success", text: customSuccessMessage || "تم حفظ إعدادات التطبيق ومصفوفة الخدمات بنجاح!" });
    } catch {
      setMessage({ type: "error", text: "حدث خطأ أثناء حفظ الإعدادات." });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAiSlides = async () => {
    setGeneratingSlides(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/mobile-app/ai-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiSlidesPrompt }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.slides)) {
        setSplashSlides(data.slides);
        setMessage({ type: "success", text: "تمت إعادة صياغة وتصميم سلايدات الترحيب بنجاح بواسطة الذكاء الاصطناعي!" });
      } else {
        setMessage({ type: "error", text: data.error || "فشل توليد السلايدات بالذكاء الاصطناعي." });
      }
    } catch {
      setMessage({ type: "error", text: "فشل الاتصال بخدمة الذكاء الاصطناعي." });
    } finally {
      setGeneratingSlides(false);
    }
  };

  // Bottom Nav Helpers
  const addBottomNavTab = () => {
    const newId = `tab_${Date.now()}`;
    const newTab: BottomNavTabConfig = {
      id: newId,
      titleAr: "تبويب جديد",
      titleEn: "New Tab",
      path: "/flights",
      icon: "plane",
      enabled: true,
      order: bottomNavTabs.length + 1,
    };
    setBottomNavTabs([...bottomNavTabs, newTab]);
  };

  const removeBottomNavTab = (id: string) => {
    if (bottomNavTabs.length <= 1) {
      setMessage({ type: "error", text: "يجب الإبقاء على تبويب واحد على الأقل في شريط التنقل." });
      return;
    }
    setBottomNavTabs(bottomNavTabs.filter((t) => t.id !== id));
  };

  const moveBottomNavTab = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bottomNavTabs.length) return;
    const clone = [...bottomNavTabs];
    const [moved] = clone.splice(index, 1);
    clone.splice(targetIndex, 0, moved);
    setBottomNavTabs(clone);
  };

  const updateBottomNavTab = (id: string, patch: Partial<BottomNavTabConfig>) => {
    setBottomNavTabs(bottomNavTabs.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  // Splash Slides Helpers
  const addSplashSlide = () => {
    const newId = `slide_${Date.now()}`;
    const newSlide: SplashSlideConfig = {
      id: newId,
      titleAr: "ميزة سياحية جديدة ومميزة",
      titleEn: "Exclusive Feature",
      descAr: "وصف تسويقي جذاب يبرز قوة حجز هذه الخدمة عبر لوناليزا بأسعار واضحة وتأكيد فوري.",
      descEn: "Bespoke luxury travel feature with instant confirmation.",
      tagAr: "ميزة حصرية",
      tagEn: "VIP Feature",
      icon: "sparkles",
      badgeColor: "#F59E0B",
      enabled: true,
      order: splashSlides.length + 1,
    };
    setSplashSlides([...splashSlides, newSlide]);
  };

  const removeSplashSlide = (id: string) => {
    if (splashSlides.length <= 1) {
      setMessage({ type: "error", text: "يجب الإبقاء على سلايد ترحيبي واحد على الأقل." });
      return;
    }
    setSplashSlides(splashSlides.filter((s) => s.id !== id));
  };

  const moveSplashSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= splashSlides.length) return;
    const clone = [...splashSlides];
    const [moved] = clone.splice(index, 1);
    clone.splice(targetIndex, 0, moved);
    setSplashSlides(clone);
  };

  const updateSplashSlide = (id: string, patch: Partial<SplashSlideConfig>) => {
    setSplashSlides(splashSlides.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const saveConciergeAgent = async () => {
    if (!conciergeAgent) return;
    setSavingAgent(true);
    try {
      const res = await fetch("/api/admin/mobile-app/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "app_concierge",
          systemPrompt: conciergeAgent.systemPrompt,
          missionAr: conciergeAgent.missionAr,
          enabled: conciergeAgent.enabled,
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "تم تحديث وكيل مساعد لوناليزا الذكي للتطبيق بنجاح!" });
      }
    } catch {
      setMessage({ type: "error", text: "تعذر حفظ إعدادات الوكيل." });
    } finally {
      setSavingAgent(false);
    }
  };

  const triggerInServerBuild = async () => {
    setBuilding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/mobile-app/build", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (res.ok) {
        setBuild(data.build || { state: "queued" });
        setActiveTab("build");
        setMessage({ type: "success", text: "بدأت عملية بناء الـ APK بالسيرفر بنجاح! السجلات المباشرة تظهر أدناه." });
      } else {
        setMessage({ type: "error", text: data.error || "تعذر بدء عملية البناء." });
      }
    } catch {
      setMessage({ type: "error", text: "فشل الاتصال بخادم البناء." });
    } finally {
      setBuilding(false);
    }
  };

  const handleSendPush = async () => {
    if (!selectedTemplate) return;
    setSendingPush(true);
    try {
      const res = await fetch("/api/admin/mobile-app/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dispatch",
          title: selectedTemplate.titleAr,
          body: selectedTemplate.bodyAr,
          targetScreen: selectedTemplate.targetScreen,
          badgeText: selectedTemplate.badgeText,
          templateId: selectedTemplate.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `تم إرسال الإشعار بنجاح! تم استلامه وتوثيقه (${data.sentAt})` });
        reload();
      } else {
        setMessage({ type: "error", text: data.error || "فشل إرسال الإشعار." });
      }
    } catch {
      setMessage({ type: "error", text: "تعذر الاتصال بخادم الإشعارات." });
    } finally {
      setSendingPush(false);
    }
  };

  const handleGeneratePushAI = async () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/admin/mobile-app/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topic: aiTopic,
        }),
      });
      const data = await res.json();
      if (res.ok && data.template) {
        setSelectedTemplate(data.template);
        setPushTemplates((prev) => [data.template, ...prev]);
        setAiTopic("");
        setMessage({ type: "success", text: "تم توليد حملة إشعارات تسويقية ذكية وجذابة بنجاح!" });
      } else {
        setMessage({ type: "error", text: data.error || "فشل توليد الإشعار." });
      }
    } catch {
      setMessage({ type: "error", text: "خطأ في الاتصال بالذكاء الاصطناعي." });
    } finally {
      setAiGenerating(false);
    }
  };

  if (!settings) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center text-muted-foreground'>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SERVICE_LABELS: Record<string, string> = {
    flight: "رحلات الطيران",
    hotel: "الفنادق والإقامة",
    cars: "استئجار السيارات",
    transfers: "خدمات الترانسفير والمطار",
    holiday: "الباقات والبرامج السياحية",
    tours: "الجولات والرحلات الداخلية",
    visa: "التأشيرات السياحية",
    insurance: "تأمين السفر",
    offers: "العروض الحصرية",
  };

  return (
    <div className='mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8 font-sans antialiased text-foreground' dir="rtl">
      {/* Executive Luxury Header - Fully Adaptive to Active Theme Preset */}
      <header className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 sm:p-6 shadow-xs">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Smartphone className="h-7 w-7 stroke-[2.3]" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  استوديو إدارة تطبيق لوناليزا الأصلي (Enterprise Native Shell)
                </h1>
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-black text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  باقة التملك الكامل (مفعل تلقائياً)
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  تطبيق PWA مجاناً
                </span>

                {build.state === "succeeded" && (
                  <a
                    href="/app/app-lonaliza-release.apk"
                    download
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    حزمة APK جاهزة للتنزيل
                  </a>
                )}
              </div>

              <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
                المحرر البصري الفوري بوضع الهاتف المقفل، نشر وإدارة روابط المتاجر (Google & Apple)، أتمتة GitHub Actions، وتحميل سورس كود Flutter الكامل.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/api/admin/mobile-app/download?type=source"
              download="lonaliza-flutter-source.zip"
              className="flex items-center justify-center gap-2 rounded-xl bg-card hover:bg-muted text-foreground px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs border border-border transition active:scale-95 cursor-pointer"
              title="تحميل سورس كود Flutter الكامل بصيغة ZIP"
            >
              <Download className="h-4 w-4 text-primary" />
              <span>تحميل سورس كود Flutter</span>
            </a>

            <a
              href="/admin/mobile-app-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 stroke-[2.5]" />
              <span>المحرر البصري الكامل</span>
            </a>

            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:brightness-110 px-4 py-2.5 text-xs sm:text-sm font-black shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 stroke-[2.5]" />}
              <span>حفظ الإعدادات</span>
            </button>

            <button
              type="button"
              onClick={() => void triggerInServerBuild()}
              disabled={building || build.state === "running"}
              className='flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-md shadow-primary/30 border border-primary/40 transition hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer'
            >
              {building || build.state === "running" ? (
                <Loader2 className='h-4 w-4 animate-spin text-white stroke-white' />
              ) : (
                <Play className="h-4 w-4 fill-white stroke-white text-white" />
              )}
              <span className="text-white">{build.state === "running" ? "جاري البناء..." : "بناء APK بالسيرفر"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alert Notification */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium shadow-xs transition-all ${
            message.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Mobile Telemetry KPI Cards - 100% Localized High-Contrast Arabic */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">بيئة وتطبيق الجوال</span>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">إنتاج أصلي</span>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black tracking-tight text-foreground">فلاتر 3.27 وريأكت نيتف</p>
          <p className="text-[11px] font-medium text-muted-foreground">أداء فائق السرعة 60fps أصلي (Native)</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">إشعارات الدفع الفورية</span>
            <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-black text-teal-600 dark:text-teal-400">نشط ومفعل</span>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black tracking-tight text-foreground">سحابة FCM & APNs Firebase</p>
          <p className="text-[11px] font-medium text-muted-foreground">عروض الفلاش الذكية وتنبيهات الأسعار</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">نشر وإدارة المتاجر</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">جاهز للإطلاق</span>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black tracking-tight text-foreground">App Store & Google Play</p>
          <p className="text-[11px] font-medium text-muted-foreground">لقطات شاشة وأيقونات معربة للمتاجر</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">مساعد النزيل والرحلات الذكي</span>
            <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-black text-teal-600 dark:text-teal-400">متصل لحظياً</span>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black tracking-tight text-foreground">المساعد الذكي (VIP Concierge)</p>
          <p className="text-[11px] font-medium text-muted-foreground">مخطط الجولات والرحلات السياحي الآلي</p>
        </div>
      </div>

      {/* Navigation Tabs Bar — Elegant Horizontal Slide Carousel */}
      <div className="w-full relative group">
        <button
          type="button"
          onClick={() => scrollTabs(-240)}
          className='hidden md:flex absolute -start-3 top-1/2 -translate-y-1/2 z-10 size-8 items-center justify-center rounded-full bg-card shadow-lg border border-border text-foreground hover:bg-muted transition-all opacity-80 group-hover:opacity-100 cursor-pointer'
          title="التمرير للخلف"
          aria-label="Previous tabs"
        >
          <ChevronRight className="size-4" />
        </button>

        <div
          ref={tabsRef}
          className='flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2 px-2.5 rounded-2xl bg-card border border-border shadow-xs whitespace-nowrap scroll-smooth'
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                data-mobile-tab-active={active ? "true" : "false"}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-white stroke-white" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span className="whitespace-nowrap font-bold">
                  {tab.label}
                </span>
                {active && (
                  <span className='h-1.5 w-1.5 rounded-full bg-white animate-pulse ml-0.5' />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollTabs(240)}
          className='hidden md:flex absolute -end-3 top-1/2 -translate-y-1/2 z-10 size-8 items-center justify-center rounded-full bg-card shadow-lg border border-border text-foreground hover:bg-muted transition-all opacity-80 group-hover:opacity-100 cursor-pointer'
          title="التمرير للأمام"
          aria-label="Next tabs"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* TAB 1: THE REAL VISUAL BUILDER (LOCKED TO SMARTPHONE + REAL COPILOT) */}
      {activeTab === "builder" && (
        <div className="space-y-4">
          <MobileAppBuilderView />
        </div>
      )}

      {/* TAB 2: STORE LINKS, PUBLISHING & CI/CD */}
      {activeTab === "store_links" && (
        <StoreLinksPublishingStudio settings={settings} onUpdate={reload} />
      )}

      {/* TAB 2: CONCIERGE SWARM AGENT (app_concierge) */}
      {activeTab === "concierge_agent" && (
        <div className='space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4'>
            <div className="flex items-center gap-3">
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-700 text-secondary shadow-md'>
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className='text-xl font-black text-foreground'>
                  وكيل المساعد الشخصي للتطبيق (app_concierge)
                </h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  وكيل ذكي مدمج في تطبيق الجوال، يخدم العميل في حجوزات الطيران والفنادق، الاستعلام عن رصيد المحفظة، وتقديم الاقتراحات السفرية.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => void saveConciergeAgent()}
                disabled={savingAgent}
                className='flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-foreground hover:hover:bg-primary/90 transition cursor-pointer'
              >
                {savingAgent ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>حفظ تعليمات الوكيل</span>
              </button>
            </div>
          </div>

          {conciergeAgent ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                <div className="space-y-1.5">
                  <label className='text-xs font-bold text-foreground'>المهمة الرسمية للوكيل (Mission)</label>
                  <input
                    type="text"
                    value={conciergeAgent.missionAr}
                    onChange={(e) => setConciergeAgent({ ...conciergeAgent, missionAr: e.target.value })}
                    className='w-full rounded-xl border border-border bg-card-2 px-4 py-2.5 text-xs font-bold text-foreground focus:bg-card focus:outline-none'
                  />
                </div>

                <div className="space-y-1.5">
                  <label className='text-xs font-bold text-foreground'>البرومبت التأسيسي والنظامي للوكيل (System Prompt)</label>
                  <textarea
                    rows={12}
                    value={conciergeAgent.systemPrompt}
                    onChange={(e) => setConciergeAgent({ ...conciergeAgent, systemPrompt: e.target.value })}
                    className='w-full rounded-2xl border border-border bg-card-2 p-4 text-xs font-mono text-foreground leading-relaxed focus:bg-card focus:outline-none resize-none'
                  />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className='rounded-2xl border border-border bg-admin-bg-subtle/40 p-5 space-y-3'>
                  <h3 className="text-xs font-black text-admin-btn-primary-bg">صلاحيات وقدرات الوكيل في التطبيق</h3>
                  <ul className="space-y-2 text-xs text-admin-btn-primary-bg/90 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>البحث ومقارنة أسعار الطيران والفنادق الحية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>قراءة رصيد محفظة العميل ونقاط المكافآت</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>توليد كروت الحجز والتوجيه المباشر للدفع</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>الدعم الفوري على مدار الساعة بدون انقطاع</span>
                    </li>
                  </ul>
                </div>

                <div className='rounded-2xl border border-border bg-amber-50/50 p-5 space-y-2'>
                  <h3 className="text-xs font-black text-admin-btn-secondary-border">التكامل مع منظومة Swarm</h3>
                  <p className="text-[11px] text-admin-btn-secondary-border leading-relaxed">
                    هذا الوكيل مسجل رسمياً في سجل الوكلاء المركزي (Agent Registry)، ويعمل بتناغم مع وكيلي المبيعات والحملات التسويقية.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='p-8 text-center text-muted-foreground'>جاري تحميل بيانات الوكيل...</div>
          )}
        </div>
      )}

      {/* TAB 3: SMART PUSH NOTIFICATIONS AGENT (app_notifications) */}
      {activeTab === "push_agent" && (
        <div className='space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4'>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-admin-btn-secondary-bg to-admin-btn-secondary-hover text-admin-btn-primary-bg shadow-md">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className='text-xl font-black text-foreground'>
                  وكيل إشعارات التطبيق التسويقية (app_notifications)
                </h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  توليد وإرسال إشعارات تسويقية ذكية لزيادة معدل التحويل، عروض الفلاش، استرداد الكاش باك، وتنبيهات انخفاض الأسعار.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleSendPush()}
                disabled={sendingPush || !selectedTemplate}
                className="flex items-center gap-2 rounded-xl bg-primary hover:brightness-110 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50"
              >
                {sendingPush ? <Loader2 size={14} className="animate-spin text-white stroke-white" /> : <Send size={14} className="text-white stroke-white" />}
                <span className="text-white">إرسال الإشعار المحدد فوراً</span>
              </button>
            </div>
          </div>

          {/* AI Generator Box */}
          <div className='rounded-2xl border-2 border-border bg-admin-bg-subtle/40 p-4 space-y-3'>
            <div className="flex items-center gap-2 text-xs font-black text-admin-btn-primary-bg">
              <Wand2 className='h-4 w-4 text-secondary' />
              <span>توليد إشعار تسويقي ذكي بواسطة الذكاء الاصطناعي (Gemini)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="مثال: خصم 20% على تذاكر إسطنبول لنهاية الأسبوع، أو كاش باك 100$ في محفظتك..."
                className='flex-1 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-admin-accent/30'
              />
              <button
                type="button"
                onClick={() => void handleGeneratePushAI()}
                disabled={aiGenerating || !aiTopic.trim()}
                className='flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-foreground hover:hover:bg-primary/90 disabled:opacity-50 cursor-pointer'
              >
                {aiGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>توليد فوري</span>
              </button>
            </div>
          </div>

          {/* Templates Grid & Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Templates List */}
            <div className="lg:col-span-6 space-y-2.5">
              <h3 className='text-xs font-black text-foreground'>قوالب الحملات الجاهزة والمولدة ({pushTemplates.length})</h3>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pe-1">
                {pushTemplates.map((item) => {
                  const isSelected = selectedTemplate?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTemplate(item)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-admin-bg-subtle/70 shadow-sm ring-1 ring-admin-accent/30"
                          : "border-border hover:bg-muted bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className='text-xs font-black text-foreground'>{item.titleAr}</span>
                        {item.badgeText && (
                          <span className="text-[10px] font-bold bg-admin-bg-subtle text-admin-btn-secondary-border px-2 py-0.5 rounded">
                            {item.badgeText}
                          </span>
                        )}
                      </div>
                      <p className='text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>{item.bodyAr}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>الوجهة: {item.targetScreen}</span>
                        <span>تم الإرسال: {item.sentCount} مرة</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notification Smartphone Preview */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className='text-xs font-black text-foreground'>معاينة الإشعار على شاشة قفل الهاتف (Live Phone Lockscreen Preview)</h3>
              <div className='rounded-3xl bg-background p-6 shadow-xl text-foreground space-y-4'>
                <div className="text-center text-xs text-muted-foreground font-mono">
                  {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                </div>

                {selectedTemplate ? (
                  <div className='rounded-2xl bg-card/10 backdrop-blur-md border border-border p-4 shadow-lg space-y-2'>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className='h-6 w-6 rounded-lg bg-secondary text-admin-btn-primary-bg flex items-center justify-center font-black text-xs'>
                          L
                        </div>
                        <span className='text-xs font-bold text-secondary'>لوناليزا للسياحة والسفر</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">الآن</span>
                    </div>

                    <h4 className='text-xs font-black text-foreground'>{selectedTemplate.titleAr}</h4>
                    <p className="text-[11px] text-slate-200 leading-relaxed">{selectedTemplate.bodyAr}</p>

                    <div className='pt-1 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border'>
                      <span>انقر للفتح في: {selectedTemplate.targetScreen}</span>
                      <span className='text-secondary font-bold'>عرض التفاصيل ←</span>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-xs text-muted-foreground py-8'>اختر قالباً لمعاينته</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES DUAL-TOGGLE MATRIX */}
      {activeTab === "services" && (
        <div className='space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm'>
          <div className='flex items-center gap-3 border-b border-border pb-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-bg-subtle text-primary'>
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className='text-xl font-black text-foreground'>مصفوفة التحكم الثنائي بالخدمات (Web & App Dual-Toggle)</h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                تفعيل أو إلغاء أي خدمة للموقع أو للتطبيق بشكل مستقل تماماً. الخدمة المعطلة في التطبيق تختفي فورياً من واجهات الهاتف.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {Object.keys(SERVICE_LABELS).map((key) => {
              const isWeb = webServices[key] !== false;
              const isApp = appServices[key] !== false;
              return (
                <div key={key} className='flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4 hover:bg-card-2/60 px-3 rounded-2xl transition'>
                  <div>
                    <h3 className='font-bold text-foreground text-base'>{SERVICE_LABELS[key] || key}</h3>
                    <p className="text-xs text-muted-foreground font-mono">service_key: {key}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <span className='text-xs font-bold text-foreground flex items-center gap-1.5'>
                        <Globe className="h-4 w-4 text-blue-600" />
                        الموقع
                      </span>
                      <input
                        type="checkbox"
                        checked={isWeb}
                        onChange={(e) => setWebServices({ ...webServices, [key]: e.target.checked })}
                        className="h-5 w-5 rounded-md text-primary focus:ring-admin-accent cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <span className='text-xs font-bold text-foreground flex items-center gap-1.5'>
                        <Smartphone className="h-4 w-4 text-primary" />
                        التطبيق
                      </span>
                      <input
                        type="checkbox"
                        checked={isApp}
                        onChange={(e) => setAppServices({ ...appServices, [key]: e.target.checked })}
                        className='h-5 w-5 rounded-md text-secondary focus:ring-border cursor-pointer'
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='flex justify-end pt-4 border-t border-border'>
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving}
              className='flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black text-foreground hover:hover:bg-primary/90 cursor-pointer'
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>حفظ مصفوفة الخدمات</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: BOTTOM NAVIGATION (DYNAMIC CONTROLLER & LIVE PHONE PREVIEW) */}
      {activeTab === "bottom_nav" && (
        <div className='space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm'>
          {/* Header with Title and Action buttons */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4'>
            <div className="flex items-center gap-3">
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-bg-subtle text-primary shadow-sm'>
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h2 className='text-xl font-black text-foreground'>شريط ومينيو التنقل السفلي الأصلي (Native Bottom Navigation)</h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  تحكم ديناميكي كامل في تبويبات التطبيق: إضافة وحذف وتعديل المسميات والمسارات والأيقونات وترتيب الظهور والألوان فورياً.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addBottomNavTab}
                className='flex items-center gap-1.5 rounded-xl bg-admin-bg-subtle hover:bg-admin-bg-subtle text-admin-btn-primary-hover border border-border px-4 py-2.5 text-xs font-black shadow-sm transition active:scale-95 cursor-pointer'
              >
                <Plus className="h-4 w-4" />
                <span>إضافة تبويب جديد</span>
              </button>

              <button
                type="button"
                onClick={() => void saveSettings("تم حفظ وتحديث شريط ومينيو التنقل السفلي للتطبيق بنجاح!")}
                disabled={saving}
                className='admin-btn-dark flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-purple-950/20 border border-primary/40 transition active:scale-95 cursor-pointer disabled:opacity-50'
                style={{ color: "#ffffff" }}
              >
                {saving ? <Loader2 className='h-4 w-4 animate-spin text-white' /> : <Save className='h-4 w-4 text-white' />}
                <span className="text-white">حفظ ونشر شريط التنقل</span>
              </button>
            </div>
          </div>

          {/* Color Styling Bar & Live Smartphone Preview in a Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main Column: Color Settings + Tab Cards Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Color Customizer */}
              <div className='rounded-2xl border border-border/90 bg-card-2/70 p-4 space-y-3'>
                <div className="flex items-center justify-between">
                  <span className='text-xs font-black text-foreground flex items-center gap-1.5'>
                    <Palette className="h-4 w-4 text-primary" />
                    تخصيص ألوان وتصميم الشريط السفلي
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBottomNavBg("#ffffff");
                      setBottomNavActiveColor("#2E1065");
                      setBottomNavInactiveColor("#64748B");
                    }}
                    className='text-[11px] font-bold text-primary hover:underline cursor-pointer'
                  >
                    استعادة الألوان الملكية الافتراضية
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className='text-[11px] font-bold text-muted-foreground block'>لون خلفية الشريط</label>
                    <div className='flex items-center gap-2 rounded-xl border border-border bg-card p-1.5'>
                      <input
                        type="color"
                        value={bottomNavBg}
                        onChange={(e) => setBottomNavBg(e.target.value)}
                        className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={bottomNavBg}
                        onChange={(e) => setBottomNavBg(e.target.value)}
                        className='w-full text-xs font-mono font-bold text-foreground uppercase focus:outline-none'
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className='text-[11px] font-bold text-muted-foreground block'>لون التبويب النشط</label>
                    <div className='flex items-center gap-2 rounded-xl border border-border bg-card p-1.5'>
                      <input
                        type="color"
                        value={bottomNavActiveColor}
                        onChange={(e) => setBottomNavActiveColor(e.target.value)}
                        className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={bottomNavActiveColor}
                        onChange={(e) => setBottomNavActiveColor(e.target.value)}
                        className='w-full text-xs font-mono font-bold text-foreground uppercase focus:outline-none'
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className='text-[11px] font-bold text-muted-foreground block'>لون الأيقونات الخاملة</label>
                    <div className='flex items-center gap-2 rounded-xl border border-border bg-card p-1.5'>
                      <input
                        type="color"
                        value={bottomNavInactiveColor}
                        onChange={(e) => setBottomNavInactiveColor(e.target.value)}
                        className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={bottomNavInactiveColor}
                        onChange={(e) => setBottomNavInactiveColor(e.target.value)}
                        className='w-full text-xs font-mono font-bold text-foreground uppercase focus:outline-none'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs List */}
              <div className="space-y-3">
                <div className='flex items-center justify-between text-xs font-bold text-muted-foreground px-1'>
                  <span>قائمة التبويبات الحالية ({bottomNavTabs.length})</span>
                  <span>الترتيب والتحكم الميداني</span>
                </div>

                {bottomNavTabs.map((tab, idx) => (
                  <div
                    key={tab.id}
                    className='rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs hover:border-border transition'
                  >
                    <div className='flex items-center justify-between border-b border-border pb-2.5'>
                      <div className="flex items-center gap-2.5">
                        <span className='flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-xs font-black text-secondary'>
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className='text-primary'>{renderTabIcon(tab.icon, "h-4 w-4")}</span>
                          <span className='font-black text-sm text-foreground'>{tab.titleAr || "بدون اسم"}</span>
                          {tab.titleEn && <span className="text-xs text-muted-foreground font-mono">({tab.titleEn})</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveBottomNavTab(idx, "up")}
                          disabled={idx === 0}
                          className='h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-card-2 disabled:opacity-30 cursor-pointer'
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBottomNavTab(idx, "down")}
                          disabled={idx === bottomNavTabs.length - 1}
                          className='h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-card-2 disabled:opacity-30 cursor-pointer'
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBottomNavTab(tab.id)}
                          className="h-7 w-7 rounded-lg border border-rose-200 bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 cursor-pointer"
                          title="حذف التبويب"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className='text-[11px] font-bold text-muted-foreground block mb-1'>الاسم بالعربية</label>
                        <input
                          type="text"
                          value={tab.titleAr}
                          onChange={(e) => updateBottomNavTab(tab.id, { titleAr: e.target.value })}
                          className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-purple-500'
                        />
                      </div>
                      <div>
                        <label className='text-[11px] font-bold text-muted-foreground block mb-1'>الاسم بالإنجليزية (Title En)</label>
                        <input
                          type="text"
                          value={tab.titleEn || ""}
                          onChange={(e) => updateBottomNavTab(tab.id, { titleEn: e.target.value })}
                          className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-purple-500'
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className='text-[11px] font-bold text-muted-foreground block mb-1'>الأيقونة (Icon)</label>
                        <select
                          value={tab.icon}
                          onChange={(e) => updateBottomNavTab(tab.id, { icon: e.target.value })}
                          className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-purple-500'
                        >
                          <option value="home">الرئيسية (Home)</option>
                          <option value="wallet">المحفظة والكاش باك (Wallet)</option>
                          <option value="play">سوشيال وفيديوهات وريلز (Play / Reels)</option>
                          <option value="user">الملف الشخصي وحسابي (User / Profile)</option>
                          <option value="menu">القائمة والمزيد (Menu / More)</option>
                          <option value="compass">استكشف والوجهات (Compass)</option>
                          <option value="plane">رحلات الطيران (Flights)</option>
                          <option value="hotel">الفنادق والإقامة (Hotels)</option>
                          <option value="sparkles">العروض والذكاء الاصطناعي (Sparkles)</option>
                          <option value="gift">المكافآت والخصومات (Gift / Rewards)</option>
                        </select>
                      </div>

                      <div>
                        <label className='text-[11px] font-bold text-muted-foreground block mb-1'>بادج اختياري (Badge)</label>
                        <input
                          type="text"
                          value={tab.badgeText || ""}
                          placeholder="مثال: VIP أو جديد أو خصم"
                          onChange={(e) => updateBottomNavTab(tab.id, { badgeText: e.target.value })}
                          className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-purple-500'
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className='text-[11px] font-bold text-muted-foreground'>المسار أو الرابط (Route Path)</label>
                        <span className="text-[10px] text-muted-foreground font-mono">يفتح فوراً داخل شيل التطبيق</span>
                      </div>
                      <input
                        type="text"
                        value={tab.path}
                        onChange={(e) => updateBottomNavTab(tab.id, { path: e.target.value })}
                        className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-mono font-bold text-admin-btn-primary-bg focus:bg-card focus:outline-purple-500'
                        dir="ltr"
                      />
                      {/* Presets chips */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground">روابط سريعة:</span>
                        {[
                          { label: "الرئيسية", path: "/" },
                          { label: "المحفظة", path: "/account?tab=wallet" },
                          { label: "السوشيال", path: "/community" },
                          { label: "حسابي", path: "/account" },
                          { label: "المزيد", path: "/menu" },
                          { label: "الطيران", path: "/flights" },
                          { label: "الفنادق", path: "/hotels" },
                        ].map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => updateBottomNavTab(tab.id, { path: preset.path })}
                            className='rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:border-primary hover:text-primary cursor-pointer'
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Live Interactive Smartphone Bottom Bar Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-6 space-y-4">
              <div className='rounded-3xl border border-border/80 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-2xl text-foreground'>
                <div className='flex items-center justify-between border-b border-border pb-3 mb-4'>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className='text-xs font-black text-secondary'>معاينة شريط التنقل بالهاتف (Live Native Preview)</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Interactive Phone Bar</span>
                </div>

                {/* Simulated Phone Screen Bottom */}
                <div className='rounded-2xl border-4 border-border bg-background p-2 shadow-inner overflow-hidden'>
                  <div className="h-44 bg-gradient-to-b from-slate-800/40 via-admin-btn-primary-bg/20 to-slate-950 rounded-xl p-3 flex flex-col justify-end text-center">
                    <p className='text-xs font-bold text-muted-foreground/80 mb-1'>انقر على أي تبويب لمعاينة التأثير والتوهج اللحظي</p>
                    <p className='text-[11px] font-mono text-secondary/90'>
                      التبويب النشط: {bottomNavTabs[previewActiveNavIndex]?.titleAr || ""} ({bottomNavTabs[previewActiveNavIndex]?.path || ""})
                    </p>
                  </div>

                  {/* The actual live bottom bar */}
                  <div
                    className="mt-2 rounded-xl p-2 border-t transition-all duration-200 flex items-center justify-around"
                    style={{
                      backgroundColor: bottomNavBg,
                      borderColor: "rgba(0,0,0,0.06)",
                    }}
                  >
                    {bottomNavTabs.map((tab, idx) => {
                      const isActive = previewActiveNavIndex === idx;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPreviewActiveNavIndex(idx)}
                          className="flex flex-col items-center justify-center flex-1 py-1 transition-all relative cursor-pointer"
                        >
                          <div
                            className="flex items-center justify-center rounded-2xl px-3.5 py-1.5 transition-all"
                            style={{
                              backgroundColor: isActive ? bottomNavActiveColor : "transparent",
                              color: isActive ? "#FBBF24" : bottomNavInactiveColor,
                              boxShadow: isActive ? "0 4px 14px rgba(46,16,101,0.35)" : "none",
                            }}
                          >
                            {renderTabIcon(tab.icon, "h-5 w-5")}
                            {tab.badgeText && (
                              <span className='absolute -top-1 right-2 bg-secondary text-admin-btn-primary-bg text-[9px] font-black px-1 rounded-full shadow-sm'>
                                {tab.badgeText}
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[10px] mt-1 font-black truncate max-w-[64px]"
                            style={{
                              color: isActive ? bottomNavActiveColor : bottomNavInactiveColor,
                            }}
                          >
                            {tab.titleAr}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Phone Home Bar Indicator */}
                  <div className="mt-2 flex justify-center">
                    <div className="h-1 w-28 rounded-full bg-slate-700/60" />
                  </div>
                </div>

                <div className='mt-4 p-3 rounded-2xl bg-card/5 border border-border space-y-1.5 text-xs'>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>عدد التبويبات النشطة:</span>
                    <span className='font-bold text-secondary'>{bottomNavTabs.length} تبويبات</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>زمن الانتقال بين التبويبات:</span>
                    <span className="font-bold text-emerald-400">فوري (0.0ms) دون تحميل</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>التزامن التلقائي:</span>
                    <span className="font-bold text-blue-400">مباشر عبر API المنظومة</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => void saveSettings("تم حفظ ونشر شريط التنقل السفلي بنجاح!")}
                    disabled={saving}
                    className='w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:brightness-110 py-3 text-xs font-black text-white shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50'
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin text-white stroke-white" /> : <Save className="h-4 w-4 text-white stroke-white" />}
                    <span className="text-white">اعتماد ونشر شريط التنقل فوراً</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SPLASH & ONBOARDING SHOWCASE CONTROLLER (WITH AI COPILOT) */}
      {activeTab === "splash_showcase" && (
        <div className='space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4'>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-bg-subtle text-admin-btn-secondary-hover shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className='text-xl font-black text-foreground'>سلايدات التعريف وشاشة السبلاش السينمائية (Splash & Showcase)</h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  تحكم يدوي وتوليد كامل بواسطة الذكاء الاصطناعي (AI Copilot): إعادة صياغة السلايدات، تغيير العناوين والشارات والألوان ونشرها لحظياً في التطبيق.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addSplashSlide}
                className='flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-admin-bg-subtle text-admin-btn-secondary-hover border border-border px-4 py-2.5 text-xs font-black shadow-sm transition active:scale-95 cursor-pointer'
              >
                <Plus className="h-4 w-4" />
                <span>إضافة سلايد جديد</span>
              </button>

              <button
                type="button"
                onClick={() => void saveSettings("تم حفظ ونشر سلايدات التعريف والترحيب للتطبيق بنجاح!")}
                disabled={saving}
                className='flex items-center gap-2 rounded-xl bg-primary hover:brightness-110 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-primary/20 transition active:scale-95 cursor-pointer disabled:opacity-50'
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin text-white stroke-white" /> : <Save className="h-4 w-4 text-white stroke-white" />}
                <span className="text-white">حفظ ونشر السلايدات</span>
              </button>
            </div>
          </div>

          {/* AI Copilot Slide Generator Box */}
          <div className='rounded-3xl border border-border/80 bg-gradient-to-r from-[#17082e] via-[#2a0e50] to-[#17082e] p-5 sm:p-6 text-foreground shadow-xl space-y-3'>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-admin-btn-secondary-bg to-admin-btn-secondary-hover text-admin-btn-primary-bg font-black shadow-md">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className='font-black text-sm text-foreground'>وكيل الذكاء الاصطناعي لإعادة تصميم وصياغة السلايدات (AI Copilot)</h3>
                  <p className='text-[11px] text-muted-foreground'>
                    اكتب رؤيتك التسويقية وسيقوم الوكيل بإعادة كتابة وهيكلة السلايدات بالكامل بأسلوب تسويقي فاخر يناسب كبار الشخصيات.
                  </p>
                </div>
              </div>

              <span className='inline-flex items-center gap-1 rounded-md border border-border/40 bg-secondary/20 px-2 py-0.5 text-[11px] font-black text-secondary'>
                <Sparkles className='h-3 w-3 text-secondary' />
                Gemini Multi-Slide AI
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <input
                type="text"
                value={aiSlidesPrompt}
                onChange={(e) => setAiSlidesPrompt(e.target.value)}
                placeholder="مثال: أعد تصميم السلايدات بأسلوب فاخر جداً يركز على عروض الطيران الحصرية وحجوزات كبار الشخصيات والذكاء الاصطناعي..."
                className='w-full rounded-2xl border border-border bg-card/10 px-4 py-3 text-xs font-bold text-foreground placeholder:text-primary/60 focus:bg-card/15 focus:outline-amber-400'
              />
              <button
                type="button"
                onClick={handleGenerateAiSlides}
                disabled={generatingSlides}
                className='w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-primary hover:brightness-110 px-6 py-3 text-xs font-black text-white shadow-md shadow-primary/25 transition active:scale-95 cursor-pointer disabled:opacity-50'
              >
                {generatingSlides ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white stroke-white" />
                ) : (
                  <Sparkles className="h-4 w-4 text-white stroke-white" />
                )}
                <span className="text-white">توليد وإعادة تصميم بالذكاء الاصطناعي</span>
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-primary font-bold">أفكار مقترحة بضغطة زر:</span>
              {[
                "أسلوب فندقي فاخر لكبار الشخصيات VIP",
                "التركيز على عروض الطيران المباشر والأسعار الحية",
                "إبراز ريلز السفر التفاعلية ومجتمع نوستر",
                "التركيز على استرداد الكاش باك والمحفظة الفورية",
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAiSlidesPrompt(p)}
                  className='rounded-lg border border-primary/30 bg-primary/60 hover:bg-primary px-2.5 py-1 text-[10px] font-bold text-muted-foreground transition cursor-pointer'
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Slides Editor & Live Splash Screen Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Slides Cards Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className='flex items-center justify-between text-xs font-bold text-muted-foreground px-1'>
                <span>سلايدات الترحيب الحالية ({splashSlides.length})</span>
                <span>تعديل يدوي دقيق وفوري</span>
              </div>

              {splashSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className='rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs hover:border-border transition'
                >
                  <div className='flex items-center justify-between border-b border-border pb-2.5'>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-admin-btn-secondary-bg to-admin-btn-secondary-hover text-xs font-black text-admin-btn-primary-bg shadow-sm">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className='font-black text-sm text-foreground'>{slide.titleAr}</span>
                        {slide.tagAr && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                            style={{
                              borderColor: slide.badgeColor ? `${slide.badgeColor}40` : "var(--admin-btn-secondary-bg)40",
                              color: slide.badgeColor || "var(--admin-btn-secondary-bg)",
                              backgroundColor: slide.badgeColor ? `${slide.badgeColor}15` : "var(--admin-btn-secondary-bg)15",
                            }}
                          >
                            {slide.tagAr}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveSplashSlide(idx, "up")}
                        disabled={idx === 0}
                        className='h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-card-2 disabled:opacity-30 cursor-pointer'
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSplashSlide(idx, "down")}
                        disabled={idx === splashSlides.length - 1}
                        className='h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-card-2 disabled:opacity-30 cursor-pointer'
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSplashSlide(slide.id)}
                        className="h-7 w-7 rounded-lg border border-rose-200 bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 cursor-pointer"
                        title="حذف السلايد"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className='text-[11px] font-bold text-muted-foreground block mb-1'>عنوان السلايد بالعربية</label>
                    <input
                      type="text"
                      value={slide.titleAr}
                      onChange={(e) => updateSplashSlide(slide.id, { titleAr: e.target.value })}
                      className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-amber-500'
                    />
                  </div>

                  <div>
                    <label className='text-[11px] font-bold text-muted-foreground block mb-1'>الوصف التسويقي الجذاب</label>
                    <textarea
                      value={slide.descAr}
                      rows={2}
                      onChange={(e) => updateSplashSlide(slide.id, { descAr: e.target.value })}
                      className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-medium text-foreground focus:bg-card focus:outline-amber-500 leading-relaxed'
                    />
                  </div>

                  {/* Image / Artwork URL & Quick Travel Presets */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className='text-[11px] font-bold text-foreground'>الصورة الخلفية أو الجرافيكس (Slide Photo / Artwork)</label>
                      <span className="text-[10px] text-muted-foreground font-mono">رابط صورة عالية الدقة أو جرافيكس</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={slide.imageUrl || ""}
                        onChange={(e) => updateSplashSlide(slide.id, { imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-mono font-bold text-admin-btn-primary-bg focus:bg-card focus:outline-amber-500'
                        dir="ltr"
                      />
                      {slide.imageUrl && (
                        <img
                          src={slide.imageUrl}
                          alt="thumbnail"
                          className='h-8 w-8 rounded-lg object-cover border border-border shrink-0 shadow-xs'
                        />
                      )}
                    </div>
                    {/* Travel Artwork Presets & Media Picker */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setSplashPickerSlideId(slide.id)}
                        className='flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/60 hover:bg-primary px-2.5 py-1 text-[10px] font-black text-secondary transition cursor-pointer shadow-xs'
                      >
                        <Sparkles className='h-3.5 w-3.5 text-secondary' />
                        <span>اختيار من مكتبة الصور (Unsplash & Pexels)</span>
                      </button>
                      <span className="text-[10px] font-bold text-muted-foreground">أو نماذج سريعة:</span>
                      {[
                        { label: "🎈 كابادوكيا", url: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=80" },
                        { label: "🕌 إسطنبول", url: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80" },
                        { label: "✈️ طيران VIP", url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" },
                        { label: "🏨 منتجعات", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
                        { label: "💳 محفظة VIP", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80" },
                        { label: "🤖 مستشار AI", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateSplashSlide(slide.id, { imageUrl: preset.url })}
                          className="rounded-lg border border-[var(--admin-btn-secondary-border)]/80 bg-amber-50/70 hover:bg-admin-bg-subtle px-2 py-0.5 text-[10px] font-bold text-admin-btn-secondary-border transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <label className='text-[11px] font-bold text-muted-foreground block mb-1'>الشارة / البادج (Tag)</label>
                      <input
                        type="text"
                        value={slide.tagAr || ""}
                        onChange={(e) => updateSplashSlide(slide.id, { tagAr: e.target.value })}
                        className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-amber-500'
                        placeholder="Live Engine"
                      />
                    </div>

                    <div>
                      <label className='text-[11px] font-bold text-muted-foreground block mb-1'>نمط الأنيميشن</label>
                      <select
                        value={slide.animationType || "cinematic"}
                        onChange={(e) => updateSplashSlide(slide.id, { animationType: e.target.value as any })}
                        className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-amber-500'
                      >
                        <option value="cinematic">سينمائي 3D Parallax</option>
                        <option value="zoom-fade">وميض وتكبير ناعم (Pulse)</option>
                        <option value="slide-up">صعود انسيابي (Slide Up)</option>
                        <option value="shimmer-glow">توهج هالة ذهبية (Glow)</option>
                      </select>
                    </div>

                    <div>
                      <label className='text-[11px] font-bold text-muted-foreground block mb-1'>طابع الأجواء (Theme)</label>
                      <select
                        value={slide.themeStyle || "royal"}
                        onChange={(e) => updateSplashSlide(slide.id, { themeStyle: e.target.value as any })}
                        className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-amber-500'
                      >
                        <option value="royal">لوناليزا البنفسجي والذهبي</option>
                        <option value="amber">الذهبي الفاخر (Amber)</option>
                        <option value="blue">الأزرق النيلي (Sapphire)</option>
                        <option value="emerald">الزمردي الراقي (Emerald)</option>
                      </select>
                    </div>

                    <div>
                      <label className='text-[11px] font-bold text-muted-foreground block mb-1'>الأيقونة (Icon)</label>
                      <select
                        value={slide.icon}
                        onChange={(e) => updateSplashSlide(slide.id, { icon: e.target.value })}
                        className='w-full rounded-xl border border-border bg-card-2/60 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-card focus:outline-amber-500'
                      >
                        <option value="plane">طيران مباشر (Flight)</option>
                        <option value="hotel">فنادق وإقامة (Hotel)</option>
                        <option value="video">ريلز وسوشيال (Video / Reels)</option>
                        <option value="wallet">محفظة وكاش باك (Wallet)</option>
                        <option value="sparkles">مساعد الذكاء الاصطناعي (AI Concierge)</option>
                        <option value="shield">أمان وحساب موحد (Security)</option>
                        <option value="gift">مكافآت وهدايا (Gift)</option>
                        <option value="compass">استكشاف وبرامج (Tours)</option>
                      </select>
                    </div>

                    <div>
                      <label className='text-[11px] font-bold text-muted-foreground block mb-1'>لون الشارة (Badge Color)</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={slide.badgeColor || "#F59E0B"}
                          onChange={(e) => updateSplashSlide(slide.id, { badgeColor: e.target.value })}
                          className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={slide.badgeColor || "#F59E0B"}
                          onChange={(e) => updateSplashSlide(slide.id, { badgeColor: e.target.value })}
                          className='w-full rounded-xl border border-border bg-card-2/60 px-2 py-1 text-[11px] font-mono font-bold text-foreground uppercase'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Live Interactive Splash Screen Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-6 space-y-4">
              <div className='rounded-3xl border border-[hsl(var(--primary))]/60 bg-gradient-to-b from-[#140522] via-[#220a40] to-[#0f041b] p-6 shadow-2xl text-foreground'>
                <div className='flex items-center justify-between border-b border-border pb-3 mb-4'>
                  <div className="flex items-center gap-2">
                    <span className='flex h-2.5 w-2.5 rounded-full bg-secondary animate-pulse' />
                    <span className='text-xs font-black text-secondary'>معاينة شاشة السبلاش المتحركة (Live Splash Preview)</span>
                  </div>
                  <span className="text-[10px] font-mono text-primary">Cinematic App Splash</span>
                </div>

                {/* Simulated Phone Splash Container */}
                <div className='rounded-3xl border-4 border-border bg-[#120422] p-5 shadow-inner text-center space-y-4 relative overflow-hidden min-h-[470px] flex flex-col justify-between'>
                  {/* Dynamic Slide Background Image with Luxury Dark Vignette Overlay */}
                  {splashSlides[previewActiveSlideIndex]?.imageUrl && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <img
                        src={splashSlides[previewActiveSlideIndex].imageUrl}
                        alt="splash background"
                        className="w-full h-full object-cover transition-all duration-700 scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#140522]/90 via-[#1e0836]/82 to-[#140522]/95" />
                    </div>
                  )}

                  {/* Top Status & Notch */}
                  <div className='relative z-10 flex items-center justify-between text-[11px] text-muted-foreground/90 px-2 font-semibold'>
                    <span className="font-mono">02:30</span>
                    <div className='h-3 w-16 bg-foreground/5 rounded-full' />
                    <span>5G 100%</span>
                  </div>

                  {/* Logo Center with Ambient Pulsing Glow */}
                  <div className="relative z-10 py-2 flex flex-col items-center">
                    <div className='h-20 w-20 rounded-2xl bg-card p-3 shadow-2xl shadow-[hsl(var(--secondary))]/30 flex items-center justify-center ring-4 ring-border/40 transform transition hover:scale-105'>
                      <span className="font-black text-3xl text-admin-btn-primary-bg font-serif">L</span>
                    </div>
                    <h3 className='text-lg font-black text-foreground mt-3 drop-shadow-md'>لوناليزا للسياحة والسفر</h3>
                    <p className='text-[11px] text-secondary font-bold drop-shadow-sm'>بوابة السفر الفاخر وحجوزات الطيران والفنادق المباشرة</p>
                  </div>

                  {/* Current Active Slide Showcase Card */}
                  {splashSlides[previewActiveSlideIndex] && (
                    <div className='relative z-10 rounded-2xl border border-border bg-card/15 p-4 text-right space-y-2 shadow-2xl backdrop-blur-md transition-all'>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-xl flex items-center justify-center text-admin-btn-primary-bg shadow-md"
                            style={{
                              backgroundColor: splashSlides[previewActiveSlideIndex].badgeColor || "#F59E0B",
                            }}
                          >
                            {renderTabIcon(splashSlides[previewActiveSlideIndex].icon, "h-4 w-4")}
                          </div>
                          <span className='text-xs font-black text-foreground'>
                            {splashSlides[previewActiveSlideIndex].titleAr}
                          </span>
                        </div>
                        {splashSlides[previewActiveSlideIndex].tagAr && (
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md border shadow-xs"
                            style={{
                              borderColor: splashSlides[previewActiveSlideIndex].badgeColor ? `${splashSlides[previewActiveSlideIndex].badgeColor}60` : "var(--admin-btn-secondary-bg)60",
                              color: splashSlides[previewActiveSlideIndex].badgeColor || "var(--admin-btn-secondary-bg)",
                              backgroundColor: splashSlides[previewActiveSlideIndex].badgeColor ? `${splashSlides[previewActiveSlideIndex].badgeColor}30` : "var(--admin-btn-secondary-bg)30",
                            }}
                          >
                            {splashSlides[previewActiveSlideIndex].tagAr}
                          </span>
                        )}
                      </div>
                      <p className='text-[11px] text-muted-foreground leading-relaxed font-medium'>
                        {splashSlides[previewActiveSlideIndex].descAr}
                      </p>
                    </div>
                  )}

                  {/* Slides Navigation Controls in Preview */}
                  <div className='relative z-10 flex items-center justify-between pt-2 border-t border-border'>
                    <button
                      type="button"
                      onClick={() => setPreviewActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : splashSlides.length - 1))}
                      className='rounded-lg bg-card/10 hover:bg-card/20 px-2.5 py-1 text-[10px] font-bold text-foreground cursor-pointer'
                    >
                      السابق
                    </button>

                    <div className="flex items-center gap-1">
                      {splashSlides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewActiveSlideIndex(i)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            previewActiveSlideIndex === i ? "w-6 bg-secondary" : "w-2 bg-card/30"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewActiveSlideIndex((prev) => (prev + 1) % splashSlides.length)}
                      className='rounded-lg bg-card/10 hover:bg-card/20 px-2.5 py-1 text-[10px] font-bold text-foreground cursor-pointer'
                    >
                      التالي
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => void saveSettings("تم حفظ ونشر سلايدات الترحيب بنجاح!")}
                    disabled={saving}
                    className='w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-admin-btn-secondary-bg to-admin-btn-secondary-hover py-3 text-xs font-black text-admin-btn-primary-bg shadow-lg shadow-[hsl(var(--secondary))]/20 hover:brightness-105 transition cursor-pointer disabled:opacity-50'
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin text-admin-btn-primary-bg" /> : <Save className="h-4 w-4 text-admin-btn-primary-bg" />}
                    <span>اعتماد ونشر السلايدات بالتطبيق فوراً</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: IN-SERVER BUILD & ARTIFACTS */}
      {activeTab === "build" && (
        <div className='space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4'>
            <div className="flex items-center gap-3">
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-bg-subtle text-primary'>
                <Terminal className="h-6 w-6" />
              </div>
              <div>
                <h2 className='text-xl font-black text-foreground'>محرك البناء بالسيرفر والتنزيل الفوري (In-Server Build Engine)</h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  بناء حزمة Android APK الحقيقية وتجهيز مشروع iOS مباشرة باستخدام Flutter 3.47.1 و Android SDK المثبتين على السيرفر.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void triggerInServerBuild()}
              disabled={building || build.state === "running"}
              className='flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-black text-foreground shadow-md hover:bg-primary active:scale-95 disabled:opacity-50 cursor-pointer'
            >
              {building || build.state === "running" ? (
                <Loader2 className='h-4 w-4 animate-spin text-foreground' />
              ) : (
                <Play className="h-4 w-4 fill-white stroke-white" />
              )}
              <span>{build.state === "running" ? "البناء جارٍ الآن..." : "بدء بناء جديد بالسيرفر"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className='rounded-2xl border border-border p-5 bg-card-2/80'>
              <span className='text-xs font-bold text-muted-foreground'>حالة عملية البناء</span>
              <div className="mt-2 flex items-center gap-2.5">
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full ${
                    build.state === "running"
                      ? "bg-secondary animate-ping"
                      : build.state === "succeeded"
                      ? "bg-emerald-500"
                      : build.state === "failed"
                      ? "bg-rose-500"
                      : "bg-slate-400"
                  }`}
                />
                <span className='text-lg font-black uppercase text-foreground'>{build.state}</span>
              </div>
              {build.stage && <p className='text-xs text-muted-foreground mt-1 font-semibold'>المرحلة: {build.stage}</p>}
            </div>

            <div className='rounded-2xl border border-border p-5 bg-card-2/80'>
              <span className='text-xs font-bold text-muted-foreground'>نسبة التقدم الكلية</span>
              <div className="mt-2">
                <div className='flex justify-between text-xs font-bold text-foreground mb-1.5'>
                  <span>{build.progress || 0}%</span>
                  <span>{build.state === "succeeded" ? "مكتمل 100%" : ""}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-admin-accent to-admin-btn-secondary-bg transition-all duration-500"
                    style={{ width: `${build.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-border p-5 bg-card-2/80'>
              <span className='text-xs font-bold text-muted-foreground'>تنزيل النسخ المجهزة فورياً</span>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <a
                  href="/api/admin/mobile-app/download?type=source"
                  download="lonaliza-flutter-source.zip"
                  className='flex items-center gap-1.5 rounded-xl hover:bg-primary/90 px-4 py-2.5 text-xs font-black text-foreground shadow-md hover:bg-primary-hover transition border border-primary/40 cursor-pointer'
                >
                  <Download className='h-4 w-4 text-secondary shrink-0' />
                  <span>سورس كود Flutter الكامل (ZIP)</span>
                </a>
                <a
                  href="/app/app-lonaliza-release.apk"
                  download="app-lonaliza-release.apk"
                  className='flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:brightness-105 transition cursor-pointer'
                >
                  <Download className='h-4 w-4 text-white shrink-0' />
                  <span className="text-white">تنزيل APK المباشر (30.9 MB)</span>
                </a>
                <a
                  href="/api/admin/mobile-app/download?type=ios"
                  download="ios-export-bundle.zip"
                  className='flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-2.5 text-xs font-black text-white shadow-md hover:brightness-110 transition border border-primary/40 cursor-pointer'
                >
                  <Download className='h-4 w-4 text-white shrink-0' />
                  <span className="text-white">حزمة iOS الكاملة</span>
                </a>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-border bg-background p-5 shadow-2xl'>
            <div className='flex items-center justify-between border-b border-border pb-3 mb-3'>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className='text-foreground font-bold'>سجل البناء المباشر (Terminal Live Logs)</span>
              </div>
              <span className='text-xs text-muted-foreground font-mono'>
                {build.startedAt ? new Date(build.startedAt).toLocaleTimeString("ar-EG") : ""}
              </span>
            </div>
            <div
              ref={terminalRef}
              className="h-72 overflow-y-auto font-mono text-xs text-emerald-400/90 leading-relaxed space-y-1 select-text"
              dir="ltr"
            >
              {build.logs && build.logs.length > 0 ? (
                build.logs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className='text-muted-foreground'>لا توجد سجلات بعد. انقر على زر البناء للبدء.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: STORE SHOWCASE STUDIO */}
      {activeTab === "store_showcase" && <StoreShowcaseStudio />}

      {/* TAB 9: APP ICONS STUDIO */}
      {activeTab === "app_icons" && <AppIconsStudio />}

      {/* Splash Slide Media Picker Modal */}
      <MediaPickerModal
        isOpen={splashPickerSlideId !== null}
        onClose={() => setSplashPickerSlideId(null)}
        onSelect={(url) => {
          if (splashPickerSlideId) {
            updateSplashSlide(splashPickerSlideId, { imageUrl: url });
            setSplashPickerSlideId(null);
          }
        }}
        title="اختر صورة فاخرة للسلايد من مكتبة Unsplash & Pexels"
      />
    </div>
  );
}
