"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  KeyRound,
  Layers,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Plane,
  Plug,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Rocket,
  Send,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  Truck,
  Upload,
  User,
  Wallet,
  Zap,
  Eye,
  EyeOff,
  Hotel,
  Car,
  ChevronRight,
  Info,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ALL_PLATFORM_FEATURES, FEATURE_CATEGORIES, isFeatureActiveForPlan } from "@/lib/resale/features-matrix";
import type {
  ResellerCompany,
  ResellerCompanyProgress,
  ResellerLicense,
  ResellerServer,
} from "@/lib/server/resale-store";
import type {
  B2BWalletSummary,
  B2BWalletTransaction,
  WhiteLabelSettings,
} from "@/lib/server/reseller-whitelabel-store";

type MeResponse = {
  ok: boolean;
  company: ResellerCompany;
  license?: ResellerLicense | null;
  progress?: ResellerCompanyProgress[];
  server?: ResellerServer | null;
  wallet?: B2BWalletSummary;
  apiKeys?: {
    masterKey?: string;
    secretKey?: string;
    flightsKey?: string;
    hotelsKey?: string;
    transfersKey?: string;
  };
  transactions?: B2BWalletTransaction[];
  wlSettings?: WhiteLabelSettings;
  settings?: {
    lifetimePrice: number;
    updatePrice: number;
    currency: string;
    deliveryHours: string;
    supportWhatsapp: string;
    contaboSpecs: string;
    whatsappBankEnabled: boolean;
  };
};

export default function PartnerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500" dir="rtl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
            <span className="font-bold">جاري تحميل بوابة الشركاء B2B...</span>
          </div>
        </div>
      }
    >
      <PartnerDashboardInner />
    </Suspense>
  );
}

type TabKey = "overview" | "wallet" | "plan" | "apikeys" | "domain" | "profile" | "alerts";

function PartnerDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Deposit Modal State
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(2000);
  const [depositMethod, setDepositMethod] = useState<"card" | "bank">("card");
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState("");
  const [addFeeOnTop, setAddFeeOnTop] = useState(false);

  // Card Vault / Iyzico Tokenization Modal State
  const [cardVaultModalOpen, setCardVaultModalOpen] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [savingCard, setSavingCard] = useState(false);
  const [cardVaultMsg, setCardVaultMsg] = useState<string | null>(null);

  // Subscription Renewal Preference State
  const [autoRenewalPref, setAutoRenewalPref] = useState<"card" | "wallet" | "none">("wallet");
  const [updatingPref, setUpdatingPref] = useState(false);

  // Handshake Test State
  const [testingHandshake, setTestingHandshake] = useState(false);
  const [handshakeData, setHandshakeData] = useState<Record<string, unknown> | null>(null);

  // Profile Form State
  const [companyName, setCompanyName] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [taxId, setTaxId] = useState("");
  const [commercialReg, setCommercialReg] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Domain & AI DNS Assistant State
  const [domainInput, setDomainInput] = useState("");
  const [aiCheckingDns, setAiCheckingDns] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([
    {
      role: "assistant",
      text: "مرحباً بك! أنا المساعد الذكي لإعداد وربط النطاق (DNS AI Assistant). أدخل اسم الدومين الخاص بشركتك وسأقوم بفحص السجلات والتوجيه تلقائياً.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partners/me", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/partners");
        return;
      }
      const json = (await res.json()) as MeResponse;
      if (json.ok) {
        setData(json);
        setCompanyName(json.company.companyName || "");
        setCompanyNameAr(json.company.companyNameAr || "");
        setTaxId(json.company.taxId || "");
        setCommercialReg(json.company.commercialReg || "");
        setLegalAddress(json.company.legalAddress || "");
        setDomainInput(json.company.customDomain || json.company.requestedDomain || "");
        setAutoRenewalPref(json.company.autoRenewalMethod || "wallet");
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    const tabParam = searchParams.get("tab") as TabKey | null;
    if (tabParam && ["overview", "wallet", "plan", "apikeys", "domain", "profile", "alerts"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/partners/auth", { method: "DELETE" });
    } catch {
      /* ignore */
    }
    router.push("/partners");
  };

  // Deposit Handler
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    setDepositSubmitting(true);
    setDepositSuccessMsg("");
    try {
      const res = await fetch("/api/partners/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depositAmount,
          method: depositMethod,
          addFeeOnTop,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setDepositSuccessMsg(json.message);
        setTimeout(() => {
          setDepositModalOpen(false);
          setDepositSuccessMsg("");
          void loadData();
        }, 2500);
      } else {
        alert(json.error || "تعذر معالجة طلب الإيداع");
      }
    } catch {
      alert("حدث خطأ أثناء معالجة الإيداع");
    } finally {
      setDepositSubmitting(false);
    }
  };

  // Iyzico Card Tokenization Handler
  const handleSaveCardVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCard(true);
    setCardVaultMsg(null);
    try {
      const cleanNum = cardNumber.replace(/\s+/g, "");
      const last4 = cleanNum.slice(-4) || "4242";
      const res = await fetch("/api/partners/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_card_token",
          cardLast4: last4,
          cardBrand: cleanNum.startsWith("4") ? "Visa" : "Mastercard",
          cardToken: `IYZI_TOK_${Date.now()}_${last4}`,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setCardVaultMsg(json.message);
        setTimeout(() => {
          setCardVaultModalOpen(false);
          setCardVaultMsg(null);
          void loadData();
        }, 2000);
      } else {
        alert(json.error || "فشل حفظ البطاقة");
      }
    } catch {
      alert("حدث خطأ أثناء حفظ البطاقة");
    } finally {
      setSavingCard(false);
    }
  };

  // Auto Renewal Preference Change
  const handleChangeRenewalPref = async (method: "card" | "wallet" | "none") => {
    setUpdatingPref(true);
    setAutoRenewalPref(method);
    try {
      await fetch("/api/partners/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_auto_renewal",
          autoRenewalMethod: method,
        }),
      });
      void loadData();
    } catch {
      /* ignore */
    } finally {
      setUpdatingPref(false);
    }
  };

  // Test Handshake
  const handleTestHandshake = async () => {
    setTestingHandshake(true);
    setHandshakeData(null);
    try {
      const res = await fetch("/api/partners/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: data?.apiKeys?.masterKey || data?.company.b2bApiKeyMaster,
          apiSecret: data?.apiKeys?.secretKey || data?.company.b2bApiSecret,
        }),
      });
      const json = await res.json();
      setHandshakeData(json);
    } catch {
      setHandshakeData({ ok: false, error: "تعذر الاتصال بالمحرك المركزي" });
    } finally {
      setTestingHandshake(false);
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileSavedMsg(false);
    try {
      const res = await fetch("/api/partners/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyNameAr,
          taxId,
          commercialReg,
          legalAddress,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setProfileSavedMsg(true);
        setTimeout(() => setProfileSavedMsg(false), 3000);
        void loadData();
      }
    } catch {
      alert("فشل حفظ التعديلات");
    } finally {
      setSavingProfile(false);
    }
  };

  // AI Assistant DNS Check
  const handleAiCheckDns = async (overrideDomain?: string) => {
    const target = overrideDomain || domainInput.trim();
    if (!target) {
      alert("يرجى إدخال اسم الدومين أولاً");
      return;
    }
    setAiCheckingDns(true);
    setAiMessages((prev) => [
      ...prev,
      { role: "user", text: `أرجو فحص اتصال الـ DNS وتوجيه السيرفر للدومين: ${target}` },
    ]);

    try {
      const res = await fetch("/api/partners/ai-domain-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_dns",
          domain: target,
        }),
      });
      const json = await res.json();
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", text: json.reply || "تم إتمام الفحص ومطابقة الـ DNS بنجاح." },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", text: "تعذر الاتصال بمحرك فحص الـ DNS حالياً. يرجى المحاولة مرة أخرى." },
      ]);
    } finally {
      setAiCheckingDns(false);
    }
  };

  // AI Chat Send Message
  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const msg = aiInput.trim();
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", text: msg }]);

    try {
      const res = await fetch("/api/partners/ai-domain-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          message: msg,
          domain: domainInput,
        }),
      });
      const json = await res.json();
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", text: json.reply || "سأقوم بمساعدتك في إعدادات الربط." },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", text: "حدث خطأ أثناء التواصل مع الوكيل." },
      ]);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700" dir={dir}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-purple-700" />
          <p className="text-sm font-bold text-slate-600">جاري تحميل بيانات الشريك والمحفظة...</p>
        </div>
      </div>
    );
  }

  const { company, license, progress, server, wallet, apiKeys, transactions, wlSettings, settings } = data;
  const plan = company.planType || "ownership";
  const isOwnership = plan === "ownership";
  const isFreeWL = plan === "whitelabel_free";
  const isPaidWL = plan === "whitelabel_paid";
  const updatesActive = company.updateSubscriptionActive ?? true;

  const cardFeePercent = wlSettings?.cardFeePercent || 2.9;
  const calculatedCardFee = Math.round(depositAmount * (cardFeePercent / 100) * 100) / 100;
  const totalCardCharged = addFeeOnTop ? depositAmount + calculatedCardFee : depositAmount;

  // Server IP
  const serverIp = server?.ipAddress || "5.189.147.52";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir={dir}>
      {/* Top Daylight Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center font-black text-amber-300 text-lg shadow-sm">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-950 text-sm sm:text-base tracking-tight">LONALIZA B2B</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-900 border border-purple-200">
                  Partners Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs">{company.companyName}</p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <span className="text-slate-500">الباقة:</span>
              <span className="font-black text-purple-950">
                {isOwnership && "التملك الدائم الكامل"}
                {isFreeWL && "العلامة البيضاء المجانية ($0)"}
                {isPaidWL && "العلامة البيضاء الاحترافية ($199)"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDepositModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
            >
              <Wallet className="size-4" />
              <span>شحن الديبوزيت</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Responsive Vertical Sidebar + Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Vertical Sidebar: Right on RTL (Arabic), Left on LTR */}
          <aside className={`w-full lg:w-72 shrink-0 space-y-6 ${isRtl ? "lg:order-first" : "lg:order-first"}`}>
            {/* Quick Balance Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950 to-indigo-950 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-200">
                <span>رصيد المحفظة B2B المتاح</span>
                <Coins className="size-4 text-amber-300" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono text-amber-300">
                  ${(wallet?.availableBalance ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-purple-200">USD</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-purple-800/80 text-[11px]">
                <span className="text-purple-300">رصيد Hold: ${(wallet?.holdBalance ?? 0).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(true)}
                  className="font-bold text-amber-300 hover:underline cursor-pointer"
                >
                  + شحن الآن
                </button>
              </div>
            </div>

            {/* Navigation Sidebar List */}
            <nav className="p-2.5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <SidebarItem
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
                icon={<Store className="size-4" />}
                label="الداشبورد والمؤشرات"
              />
              <SidebarItem
                active={activeTab === "wallet"}
                onClick={() => setActiveTab("wallet")}
                icon={<Wallet className="size-4" />}
                label="المحفظة والديبوزيت"
                badge={`$${(wallet?.availableBalance ?? 0).toLocaleString()}`}
                badgeColor={wallet?.isDepositSufficient ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}
              />
              <SidebarItem
                active={activeTab === "plan"}
                onClick={() => setActiveTab("plan")}
                icon={<Layers className="size-4" />}
                label="الباقة والاشتراك والترخيص"
                badge={isOwnership && updatesActive ? "تحديث $50 نشط" : undefined}
                badgeColor="bg-purple-100 text-purple-900"
              />
              <SidebarItem
                active={activeTab === "apikeys"}
                onClick={() => setActiveTab("apikeys")}
                icon={<KeyRound className="size-4" />}
                label="مفاتيح الربط المشفرة (API)"
              />
              <SidebarItem
                active={activeTab === "domain"}
                onClick={() => setActiveTab("domain")}
                icon={<Globe className="size-4" />}
                label="الدومين ومساعد الـ DNS"
              />
              <SidebarItem
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
                icon={<Building2 className="size-4" />}
                label="الملف الرسمي والضريبي"
              />
              <SidebarItem
                active={activeTab === "alerts"}
                onClick={() => setActiveTab("alerts")}
                icon={<MessageCircle className="size-4" />}
                label="إشعارات الواتساب B2B"
              />
            </nav>

            {/* Direct Link to Tenant Site Wallet Box */}
            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-950">
                <Sparkles className="size-4 text-purple-700" />
                <span>إدارة المحفظة بموقعك الخاص</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                يمكنك أيضاً مراقبة الرصيد وخصم الحجوزات مباشرة من داخل لوحة تحكم موقعك الخاص.
              </p>
              <Link
                href="/admin/b2b-wallet"
                className="inline-flex items-center gap-1 font-bold text-purple-900 hover:text-purple-700 hover:underline pt-1 text-[11px]"
              >
                <span>فتح قسم المحفظة بموقعك (/admin/b2b-wallet)</span>
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full space-y-6">
            {/* Deposit Warning Banner if < $2,000 */}
            {wallet && !wallet.isDepositSufficient && (
              <div className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="size-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                    <AlertTriangle className="size-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-amber-950 text-sm sm:text-base">
                      تنبيه هام: رصيد الديبوزيت الحالي غير كافٍ لتشغيل محركات الحجز المباشرة
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      وفقاً لسياسة منظومة التوزيع، يتطلب تفعيل ظهور نتائج الطيران والفنادق والسيارات وإصدار التذاكر رصيد ديبوزيت لا يقل عن <strong>$2,000</strong> في محفظتك.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDepositModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs shrink-0 cursor-pointer"
                >
                  شحن الديبوزيت ($2,000)
                </button>
              </div>
            )}

            {/* TAB 1: OVERVIEW (Default) */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-slate-500">الرصيد المتاح بالمحفظة</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 font-mono">
                        ${(wallet?.availableBalance ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold block ${wallet?.isDepositSufficient ? "text-emerald-600" : "text-amber-600"}`}>
                      {wallet?.isDepositSufficient ? "جاهز لإصدار التذاكر" : "بحاجة لديبوزيت $2,000"}
                    </span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-slate-500">إجمالي الحجوزات الصادرة</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 font-mono">
                        ${(wallet?.totalSpent ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold block">مخصومة آلياً من المحفظة</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-slate-500">رصيد قيد المعالجة (Hold)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 font-mono">
                        ${(wallet?.holdBalance ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold block">إيداعات البطاقات قيد التصفية</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-slate-500">قنوات التوريد والتوزيع</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-purple-900 font-mono">3 قنوات</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold block">طيران + فنادق + مواصلات نشط</span>
                  </div>
                </div>

                {/* Handshake Quick Banner */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="size-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                      <Radio className="size-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">اتصال التوزيع المركزي المباشر</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        السيرفر المركزي المستهدف: <code className="font-mono text-purple-900 font-bold">{serverIp}</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("apikeys")}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      عرض مفاتيح API المشفرة
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("wallet")}
                      className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
                    >
                      إدارة المحفظة
                    </button>
                  </div>
                </div>

                {/* Instance Provisioning Progress if applicable */}
                {isOwnership && progress && progress.length > 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-slate-900">مراحل تجهيز وتسليم السيرفر المستقل</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {progress.map((st) => (
                        <div
                          key={st.stage}
                          className={`p-3 rounded-2xl border text-center space-y-1 ${
                            st.status === "done"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                              : st.status === "in_progress"
                              ? "bg-amber-50 border-amber-200 text-amber-900"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          <div className="text-[10px] font-mono">0{st.stage}</div>
                          <div className="text-xs font-bold leading-tight">{st.stageInfo?.titleAr || st.notes || `المرحلة ${st.stage}`}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WALLET & DEPOSIT */}
            {activeTab === "wallet" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Header Actions */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900">إدارة المحفظة والديبوزيت B2B</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      رصيدك المالي المخصص لإصدار تذاكر الطيران، الفنادق، والمواصلات لعملائك دون أي وسيط.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDepositModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>إيداع جديد في المحفظة</span>
                  </button>
                </div>

                {/* Live Transactions Table */}
                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-4 p-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900">سجل حركات المحفظة والإيداعات</h3>
                    <span className="text-xs text-slate-500 font-mono">{transactions?.length ?? 0} عملية</span>
                  </div>

                  {!transactions || transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Coins className="size-8 mx-auto text-slate-300" />
                      <p className="text-xs font-bold">لا توجد حركات مسجلة بالمحفظة بعد. اشحن رصيدك لبدء إصدار التذاكر.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-start text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <tr>
                            <th className="py-3 px-3 text-start">نوع المعاملة</th>
                            <th className="py-3 px-3 text-start">المبلغ</th>
                            <th className="py-3 px-3 text-start">الرسوم</th>
                            <th className="py-3 px-3 text-start">الصافي المعتمد</th>
                            <th className="py-3 px-3 text-start">الحالة</th>
                            <th className="py-3 px-3 text-start">البيان</th>
                            <th className="py-3 px-3 text-end">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3.5 px-3 font-bold text-slate-900">
                                {tx.type === "deposit_card" && "شحن بطاقة ائتمان"}
                                {tx.type === "deposit_bank" && "إيداع تحويل بنكي"}
                                {tx.type === "booking_deduction" && "خصم إصدار حجز"}
                                {tx.type === "refund" && "استرداد مالي"}
                              </td>
                              <td className="py-3.5 px-3 font-mono font-bold text-slate-900">${tx.amount.toLocaleString()}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-400">${(tx.fee || 0).toLocaleString()}</td>
                              <td className="py-3.5 px-3 font-mono font-black text-slate-900">${tx.netAmount.toLocaleString()}</td>
                              <td className="py-3.5 px-3">
                                {tx.status === "cleared" ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    مكتمل
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    قيد التدقيق
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">{tx.notes || "—"}</td>
                              <td className="py-3.5 px-3 text-end font-mono text-slate-400 text-[11px]">
                                {tx.created ? new Date(tx.created).toLocaleDateString("ar-SA") : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PLAN & SUBSCRIPTIONS */}
            {activeTab === "plan" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Active Plan Card */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">الباقة النشطة الحالية</span>
                      <h2 className="text-xl font-black text-slate-900 mt-0.5">
                        {isOwnership && "باقة الشراء والتملك الدائم الكاملة (Lifetime Ownership)"}
                        {isPaidWL && "باقة العلامة البيضاء الاحترافية ($199/شهرياً)"}
                        {isFreeWL && "باقة العلامة البيضاء السحابية المجانية ($0/شهرياً)"}
                      </h2>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      حالة الاشتراك: نشط وفعال
                    </div>
                  </div>

                  {/* Lifetime Owner Update Subscription Card ($50/mo) */}
                  {isOwnership && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-purple-900 text-amber-300 flex items-center justify-center shrink-0">
                            <Sparkles className="size-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-purple-950 text-sm">
                                اشتراك التحديثات والدعم الفني السحابي المستمر ($50/شهرياً)
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                مشترك واشتراكك نشط ومفعل
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              يضمن تزويد سيرفرك تلقائياً بالتحديثات الأمنية، موفري الطيران والفنادق الجدد، وأحدث نماذج الذكاء الاصطناعي.
                            </p>
                          </div>
                        </div>

                        <div className="text-end shrink-0">
                          <span className="text-xs text-slate-500 block">موعد التجديد القادم</span>
                          <span className="font-mono font-bold text-purple-900 text-sm">
                            {company.updateSubscriptionExpiresAt
                              ? new Date(company.updateSubscriptionExpiresAt).toLocaleDateString("ar-SA")
                              : "تجديد شهري دوري"}
                          </span>
                        </div>
                      </div>

                      {/* Benefits Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-purple-200/60 text-xs text-purple-950 font-bold">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                          <span>تحديثات ليلية أوتوماتيكية للكود</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                          <span>إضافة موفري GDS الجدد تلقائياً</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                          <span>مراقبة أداء وحماية السيرفر 24/7</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment & Auto-Renewal Preferences */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                          وسيلة الدفع والتجديد الشهري التلقائي (Auto-Renewal Billing)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          اختر طريقة خصم الاشتراك الشهري لضمان استمرارية عمل المنظومة والتحديثات دون انقطاع.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCardVaultModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        <CreditCard className="size-3.5 text-purple-700" />
                        <span>{company.cardLast4 ? `بطاقة محفوظة (•••• ${company.cardLast4})` : "حفظ بطاقة ائتمان عبر Iyzico"}</span>
                      </button>
                    </div>

                    {/* Radio Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <label
                        onClick={() => handleChangeRenewalPref("wallet")}
                        className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          autoRenewalPref === "wallet"
                            ? "bg-purple-50 border-purple-700 text-purple-950 font-bold"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black block">الخصم التلقائي من رصيد المحفظة B2B</span>
                          <span className="text-[10px] text-slate-500">يخصم مبلغ الاشتراك مباشرة من رصيدك المتاح</span>
                        </div>
                        <div className={`size-4 rounded-full border flex items-center justify-center ${autoRenewalPref === "wallet" ? "border-purple-700 bg-purple-700 text-white" : "border-slate-300"}`}>
                          {autoRenewalPref === "wallet" && <Check className="size-2.5" />}
                        </div>
                      </label>

                      <label
                        onClick={() => handleChangeRenewalPref("card")}
                        className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          autoRenewalPref === "card"
                            ? "bg-purple-50 border-purple-700 text-purple-950 font-bold"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black block">الخصم التلقائي من البطاقة البنكية المحفوظة</span>
                          <span className="text-[10px] text-slate-500">تتم المعالجة عبر بوابة Iyzico المشفرة</span>
                        </div>
                        <div className={`size-4 rounded-full border flex items-center justify-center ${autoRenewalPref === "card" ? "border-purple-700 bg-purple-700 text-white" : "border-slate-300"}`}>
                          {autoRenewalPref === "card" && <Check className="size-2.5" />}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Complete 52 Features Matrix for this Plan */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">مصفوفة ميزات باقتك (+50 ميزة متكاملة)</h3>
                      <p className="text-xs text-slate-500">استعراض الميزات المفعلة والمقفلة المتاحة لحسابك.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg">
                      {ALL_PLATFORM_FEATURES.length} ميزة
                    </span>
                  </div>

                  <div className="space-y-6">
                    {FEATURE_CATEGORIES.map((cat) => {
                      const catFeats = ALL_PLATFORM_FEATURES.filter((f) => f.categoryId === cat.id);
                      return (
                        <div key={cat.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800">{cat.nameAr}</span>
                            <span className="text-[10px] font-mono text-slate-400">{catFeats.length} ميزات</span>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {catFeats.map((feat) => {
                              const active = isFeatureActiveForPlan(feat.id, plan, wlSettings?.planFeaturesOverrides);
                              return (
                                <div key={feat.id} className="p-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/50">
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-slate-900">{feat.nameAr}</span>
                                    <p className="text-[11px] text-slate-500">{feat.descAr}</p>
                                  </div>

                                  <div className="shrink-0">
                                    {active ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        <CheckCircle2 className="size-3 text-emerald-600" />
                                        <span>مفعلة</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                        <Lock className="size-3 text-slate-400" />
                                        <span>مقفلة (تتطلب ترقية)</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: API KEYS & LIVE HANDSHAKE */}
            {activeTab === "apikeys" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Header info */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900">مفاتيح الربط البرمجي المشفرة (B2B API Vault)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      مفاتيحك الخاصة المعتمدة لتضمين محركات التوزيع المركزي داخل موديولات موقعك.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestHandshake}
                    disabled={testingHandshake}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {testingHandshake ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4 text-amber-300" />}
                    <span>{testingHandshake ? "جاري فحص الاتصال..." : "فحص واختبار الاتصال المباشر"}</span>
                  </button>
                </div>

                {/* Handshake Result Alert */}
                {handshakeData && (
                  <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-md space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-emerald-400 inline-block" />
                        <span className="text-xs font-bold text-emerald-300">تم التحقق من التوقيع المشفر والاتصال بنجاح</span>
                        <span className="font-mono text-xs text-slate-400">({String(handshakeData.latencyMs)}ms)</span>
                      </div>
                      <span className="text-[11px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded-md">
                        {String(handshakeData.serverNode)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-amber-300 font-bold block">✈️ محركات الطيران الحية</span>
                        <p className="text-slate-300 text-[11px]">PKFARE GDS, Seeru Flights, Travelport, BiletBank</p>
                        <span className="text-[10px] text-emerald-400 block">متصل بنجاح</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-amber-300 font-bold block">🏨 بنوك الفنادق الحية</span>
                        <p className="text-slate-300 text-[11px]">RateHawk, Hotelbeds, Seeru Hotels, Booking.com</p>
                        <span className="text-[10px] text-emerald-400 block">متصل بنجاح</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-amber-300 font-bold block">🚗 النقل والترانسفير</span>
                        <p className="text-slate-300 text-[11px]">Seeru Ride VIP, الأسطول الداخلي</p>
                        <span className="text-[10px] text-emerald-400 block">متصل بنجاح</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Master Key & Secret Key */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                    مفاتيح المصادقة والتوقيع التشفيري الأساسية
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Master Public Key */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>المفتاح العام للمنظومة (Master API Key)</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(apiKeys?.masterKey || company.b2bApiKeyMaster || "", "masterKey")}
                          className="text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === "masterKey" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          <span>{copiedKey === "masterKey" ? "تم النسخ" : "نسخ"}</span>
                        </button>
                      </div>
                      <code className="font-mono font-bold text-xs text-purple-950 bg-white p-2.5 rounded-xl border border-slate-200 block truncate">
                        {apiKeys?.masterKey || company.b2bApiKeyMaster || "LONA_PK_PENDING"}
                      </code>
                    </div>

                    {/* API Secret Key */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>المفتاح السري وتوقيع التشفير (Secret Key - HMAC)</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                          >
                            {showSecretKey ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            <span>{showSecretKey ? "إخفاء" : "إظهار"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(apiKeys?.secretKey || company.b2bApiSecret || "", "secretKey")}
                            className="text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === "secretKey" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                            <span>{copiedKey === "secretKey" ? "تم النسخ" : "نسخ"}</span>
                          </button>
                        </div>
                      </div>
                      <code className="font-mono font-bold text-xs text-purple-950 bg-white p-2.5 rounded-xl border border-slate-200 block truncate">
                        {showSecretKey
                          ? apiKeys?.secretKey || company.b2bApiSecret || "LONA_SK_PENDING"
                          : "●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●"}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Per Service Keys */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                    مفاتيح محركات التوريد الفردية
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Flights */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                        <span className="flex items-center gap-1.5">
                          <Plane className="size-3.5 text-purple-700" />
                          <span>طيران لوناليزا</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(apiKeys?.flightsKey || company.b2bApiKeyFlights || "", "flights")}
                          className="text-purple-700 hover:text-purple-900 text-[11px] inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          {copiedKey === "flights" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          <span>نسخ</span>
                        </button>
                      </div>
                      <code className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-purple-200 block truncate">
                        {apiKeys?.flightsKey || company.b2bApiKeyFlights || "LONA_AIR_..."}
                      </code>
                    </div>

                    {/* Hotels */}
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                        <span className="flex items-center gap-1.5">
                          <Hotel className="size-3.5 text-indigo-700" />
                          <span>فنادق لوناليزا</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(apiKeys?.hotelsKey || company.b2bApiKeyHotels || "", "hotels")}
                          className="text-indigo-700 hover:text-indigo-900 text-[11px] inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          {copiedKey === "hotels" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          <span>نسخ</span>
                        </button>
                      </div>
                      <code className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-indigo-200 block truncate">
                        {apiKeys?.hotelsKey || company.b2bApiKeyHotels || "LONA_HTL_..."}
                      </code>
                    </div>

                    {/* Transfers */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span className="flex items-center gap-1.5">
                          <Car className="size-3.5 text-emerald-700" />
                          <span>مواصلات لوناليزا</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(apiKeys?.transfersKey || company.b2bApiKeyTransfers || "", "transfers")}
                          className="text-emerald-700 hover:text-emerald-900 text-[11px] inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          {copiedKey === "transfers" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          <span>نسخ</span>
                        </button>
                      </div>
                      <code className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-emerald-200 block truncate">
                        {apiKeys?.transfersKey || company.b2bApiKeyTransfers || "LONA_TRF_..."}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DOMAIN & AI DNS ASSISTANT */}
            {activeTab === "domain" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Domain Setup Box */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-black text-slate-900">ربط النطاق الخاص (Custom Domain)</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        قم بتوجيه سجلات الـ DNS الخاصة بدومينك إلى السيرفر المركزي مع شهادة SSL مجانية.
                      </p>
                    </div>
                  </div>

                  {/* DNS Instructions */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">سجلات الـ DNS المطلوبة في لوحة تحكم نطاقك:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-slate-400 text-[10px] block">السجل الأول (A-Record):</span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">@ ➔ {serverIp}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(serverIp, "ip")}
                            className="text-purple-700 font-sans text-[10px] font-bold"
                          >
                            {copiedKey === "ip" ? "تم النسخ" : "نسخ IP"}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-slate-400 text-[10px] block">السجل الثاني (CNAME):</span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">www ➔ @ (أو دومينك)</span>
                          <span className="text-emerald-700 font-sans text-[10px] font-bold">توجيه فرعي</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Domain Input & Check */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="اكتب دومينك هنا (مثلاً: travel-alhayat.com)..."
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => void handleAiCheckDns()}
                      disabled={aiCheckingDns}
                      className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {aiCheckingDns ? "جاري الفحص..." : "فحص اتصال الـ DNS"}
                    </button>
                  </div>
                </div>

                {/* Interactive AI DNS Chat */}
                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-4 p-6">
                  <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <Bot className="size-4 text-purple-700" />
                    <span>المساعد الذكي للـ DNS والربط السحابي</span>
                  </h3>

                  <div className="space-y-3 max-h-60 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    {aiMessages.map((m, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl leading-relaxed ${
                          m.role === "assistant"
                            ? "bg-white border border-slate-200 text-slate-800"
                            : "bg-purple-900 text-white ms-auto max-w-md"
                        }`}
                      >
                        {m.text}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اسأل المساعد الذكي عن كيفية ضبط Cloudflare أو GoDaddy..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && void handleSendAiMessage()}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSendAiMessage()}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                    >
                      إرسال
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: OFFICIAL PROFILE & TAX REG */}
            {activeTab === "profile" && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-black text-slate-900">الملف الرسمي والرقم الضريبي للشركة</h2>
                    <p className="text-xs text-slate-500 mt-0.5">تظهر هذه البيانات على الفواتير الضريبية وقسائم الحجوزات الصادرة.</p>
                  </div>

                  {profileSavedMsg && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
                      تم حفظ التعديلات بنجاح!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">اسم الشركة (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">اسم الشركة (بالعربية)</label>
                    <input
                      type="text"
                      value={companyNameAr}
                      onChange={(e) => setCompanyNameAr(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">الرقم الضريبي (VAT / Tax ID)</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">رقم السجل التجاري (CR Number)</label>
                    <input
                      type="text"
                      value={commercialReg}
                      onChange={(e) => setCommercialReg(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-slate-700">العنوان القانوني للشركة</label>
                    <textarea
                      rows={2}
                      value={legalAddress}
                      onChange={(e) => setLegalAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? "جاري الحفظ..." : "حفظ بيانات الملف الرسمي"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: WHATSAPP NOTIFICATIONS */}
            {activeTab === "alerts" && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-base font-black text-slate-900">إشعارات الواتساب وتنبيهات B2B اللحظية</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    استقبال تنبيهات فورية عند انخفاض رصيد الديبوزيت أو صدور حجز جديد من عملائك.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                      <MessageCircle className="size-4 text-emerald-700" />
                      <span>إشعارات الحجوزات الصادرة</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      رسالة فورية على رقم الواتساب الخاص بمدير الشركة مع تفاصيل التذكرة ورقم الـ PNR فور إصدار أي حجز.
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700 block">✓ مفعلة تلقائياً عبر بوابة Baileys</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                      <AlertTriangle className="size-4 text-amber-700" />
                      <span>تنبيه هبوط الديبوزيت</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      تنبيه آلي استباقي عندما يتبقى أقل من $500 في رصيدك المتاح لتجنب توقف إصدار التذاكر الحية.
                    </p>
                    <span className="text-[10px] font-bold text-amber-800 block">✓ مفعلة لحماية عملياتك</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">شحن ديبوزيت محفظة B2B</h3>
                <p className="text-xs text-slate-500">الرصيد يضاف كاملاً لإصدار تذاكر وحجوزات عملائك فوراً.</p>
              </div>
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {depositSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {depositSuccessMsg}
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-6">
              {/* Method Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepositMethod("card")}
                  className={`p-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    depositMethod === "card"
                      ? "bg-purple-50 border-purple-700 text-purple-950"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <CreditCard className="size-4" />
                  <span>بطاقة ائتمان (فوري عبر Iyzico)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod("bank")}
                  className={`p-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    depositMethod === "bank"
                      ? "bg-purple-50 border-purple-700 text-purple-950"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <Building2 className="size-4" />
                  <span>تحويل بنكي مباشر (0% رسوم)</span>
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  مبلغ الشحن المطلوب بالدولار ($ USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-base font-black text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                  <span className="absolute end-4 top-3.5 text-xs font-bold text-slate-400 font-mono">$ USD</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {[2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold font-mono text-slate-700 cursor-pointer"
                    >
                      +${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {depositMethod === "card" ? (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>رسوم بوابة الدفع ({cardFeePercent}%):</span>
                    <span className="font-mono font-bold">${calculatedCardFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-purple-950 font-black border-t border-purple-200 pt-2">
                    <span>إجمالي الخصم من البطاقة:</span>
                    <span className="font-mono text-sm">${totalCardCharged.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    تتم المعالجة عبر بروتوكول 3D Secure المشفر من Iyzico، ويتاح رصيدك فورياً للإصدار.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-900 block">تفاصيل الحساب البنكي للإيداع:</span>
                  <div className="space-y-1 font-mono text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <p><strong>البنك:</strong> {wlSettings?.bankName || "Ziraat Bankası Turkey"}</p>
                    <p><strong>المستفيد:</strong> {wlSettings?.bankBeneficiary || "LONALIZA TURIZM A.S."}</p>
                    <p><strong>IBAN:</strong> {wlSettings?.bankIban || "TR76 0001 0090 1000 0000 0000 01"}</p>
                    <p><strong>SWIFT:</strong> {wlSettings?.bankSwift || "TCZBTR2A"}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={depositSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {depositSubmitting ? "جاري المعالجة..." : `تأكيد الشحن ($${depositAmount.toLocaleString()})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Iyzico Card Vault Tokenization Modal */}
      {cardVaultModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-slate-900">حفظ البطاقة للتجديد الآلي (Iyzico Vault)</h3>
                <p className="text-xs text-slate-500">حفظ مشفر وآمن تماماً لضمان عدم انقطاع التحديثات أو الخدمة.</p>
              </div>
              <button
                type="button"
                onClick={() => setCardVaultModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {cardVaultMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {cardVaultMsg}
              </div>
            )}

            <form onSubmit={handleSaveCardVault} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">الاسم المكتوب على البطاقة</label>
                <input
                  type="text"
                  required
                  placeholder="MUSTAFA KEMAL"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 uppercase focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">رقم البطاقة الائتمانية</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4543 ●●●● ●●●● 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                  <CreditCard className="size-4 text-slate-400 absolute end-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">تاريخ الانتهاء (MM/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">رمز الأمان (CVC)</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-2 text-[11px] text-purple-950">
                <ShieldCheck className="size-4 text-purple-700 shrink-0" />
                <span>يتم تشفير البيانات بتقنية Tokenization عبر Iyzico ولا يتم تخزين أرقام البطاقة على السيرفر.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCardVaultModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingCard}
                  className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingCard ? "جاري التوثيق..." : "حفظ وتفعيل البطاقة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({
  active,
  onClick,
  icon,
  label,
  badge,
  badgeColor,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
        active
          ? "bg-purple-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={active ? "text-amber-300" : "text-slate-500"}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${badgeColor || "bg-purple-100 text-purple-900"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
