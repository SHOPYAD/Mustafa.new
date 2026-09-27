"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Trash2,
  Plus,
  Edit,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Users,
  Calendar,
  Clock,
  Lock,
  Building,
  Phone,
  Mail,
  Save,
  X,
  UserX,
  Sliders,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Loader2,
  ArrowRight,
  Eye,
  Bot,
  Send,
  Search,
  Check,
  Globe2,
  Copy,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  Zap,
  Layers,
  Database,
  Radio,
  Minimize2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Compass,
} from "lucide-react";
import type {
  LegalSettingsPayload,
  LegalCompanyIdentity,
  LegalCustomClause,
  GdprRetentionPolicy,
  AccountDeletionRequest,
  LegalDocTarget,
} from "@/types/legal-settings";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type TabKey = "identity" | "terms" | "privacy" | "gdpr" | "deletions";
type LangPreviewKey = "ar" | "en" | "tr" | "fr";

export interface ToolExecutionStep {
  id: string;
  stepNumber: number;
  toolName: string;
  targetAgent?: string;
  actionType: "tool_call" | "agent_directive" | "db_query" | "mcp_call" | "ai_reasoning";
  status: "running" | "completed" | "failed";
  descriptionAr: string;
  timestamp: string;
  details?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  server?: string;
  executionSteps?: ToolExecutionStep[];
  proposedClause?: LegalCustomClause | null;
  suggestedPrompts?: string[];
}

const inputClass = "admin-field";

const labelClass = "admin-field-label";

const MCP_SERVERS = [
  {
    id: "lonaliza-core-mcp",
    name: "lonaliza-core-mcp",
    title: "خادم المنصة الرسمي للسياسات (موصى به)",
    description: "مفوض بالتحكم الكامل في شروط الاستخدام، سياسات الخصوصية، بوابة GDPR، وقواعد البيانات المركزية.",
    status: "نشط ومتصل بالخادم المركزي",
    isRecommended: true,
    tag: "@lonaliza-core-mcp",
    icon: ShieldCheck,
  },
  {
    id: "legal-compliance-mcp",
    name: "legal-compliance-mcp",
    title: "خادم الامتثال واللوائح القضائية",
    description: "مطابقة الأنظمة مع نظام PDPL السعودي، لوائح GACA للطيران، قوانين الإمارات، والـ KVKK التركي.",
    status: "نشط ومتصل",
    isRecommended: false,
    tag: "@legal-compliance-mcp",
    icon: Scale,
  },
  {
    id: "liotrip-web-search",
    name: "liotrip-web-search",
    title: "خادم البحث المباشر للأنظمة والقوانين",
    description: "البحث الحي عبر الويب والمصادر التنظيمية المفتوحة للتحقق من أحدث المراسيم وتعديلات اللوائح.",
    status: "متصل بالويب المباشر",
    isRecommended: false,
    tag: "@liotrip-web-search",
    icon: Search,
  },
  {
    id: "pocketbase-central-db",
    name: "pocketbase-central-db",
    title: "خادم قاعدة البيانات المركزية",
    description: "الاستعلام المباشر وتحديث سجلات المستخدمين وجداول طلبات الحذف والامتثال المشفر.",
    status: "متزامن لحظياً",
    isRecommended: false,
    tag: "@pocketbase-central-db",
    icon: Database,
  },
  {
    id: "mcp-filesystem",
    name: "mcp-filesystem",
    title: "خادم التخزين والملفات والسياسات",
    description: "الوصول لقراءة وحفظ ملفات التكوين والسياسات القانونية ومسارات التخزين الدائم.",
    status: "صلاحية كتابة كاملة",
    isRecommended: false,
    tag: "@mcp-filesystem",
    icon: FileText,
  },
];

export default function AdminLegalPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "identity";

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Settings State
  const [identity, setIdentity] = useState<LegalCompanyIdentity | null>(null);
  const [clauses, setClauses] = useState<LegalCustomClause[]>([]);
  const [retention, setRetention] = useState<GdprRetentionPolicy | null>(null);

  // Filter and Search for Clauses
  const [clauseSearch, setClauseSearch] = useState("");
  const [clauseLangPreview, setClauseLangPreview] = useState<Record<string, LangPreviewKey>>({});

  // Deletion Requests State
  const [deletionRequests, setDeletionRequests] = useState<AccountDeletionRequest[]>([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [deletionFilter, setDeletionFilter] = useState<string>("all");
  const [retentionModalReq, setRetentionModalReq] = useState<AccountDeletionRequest | null>(null);
  const [customRetentionDays, setCustomRetentionDays] = useState<number>(30);
  const [retentionNotes, setRetentionNotes] = useState<string>("");

  // Clause Add/Edit Modal State
  const [editingClause, setEditingClause] = useState<LegalCustomClause | null>(null);
  const [isClauseModalOpen, setIsClauseModalOpen] = useState(false);

  // AI Legal Copilot Banner State (Droppable Top Banner)
  const [isAiBannerOpen, setIsAiBannerOpen] = useState(false);
  const [selectedServers, setSelectedServers] = useState<string[]>(["lonaliza-core-mcp"]);
  const [showMcpSelectorModal, setShowMcpSelectorModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [lastProposedClause, setLastProposedClause] = useState<LegalCustomClause | null>(null);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([
    "صياغة مادة الامتثال للمرسوم الملكي السعودي م/19 لحماية البيانات (PDPL)",
    "تعديل شرط الاسترداد ليكون 90% مع مهلة 24 ساعة وفق لوائح GACA 2023",
    "إضافة مادة حقوق المستهلك وسياسة الطيران وفق القانون الاتحادي الإماراتي 15/2020",
    "فحص مطابقة سياسة الخصوصية مع معايير الـ KVKK التركية وقانون 6698",
    "صياغة مادة القوة القاهرة (Force Majeure) وفق اتفاقية مونتريال 1999 للطيران",
    "إلزام الناقل بالتعويض الفوري عن تلف أو تأخير الأمتعة وفق التحديث الجديد للمرسوم الملكي م/43",
    "تطبيق ضوابط النقل العابر للحدود للبيانات السحابية للمسافرين وفق المادة 29 من نظام PDPL",
    "صياغة مادة الإفصاح عن خوارزميات التسعير الذكي وحماية المستهلك وفق لوائح وزارة التجارة",
    "سياسة استرداد التذاكر غير القابلة للاسترداد في حالات الطوارئ الطبية وفق اتفاقية إياتا 824",
  ]);

  const suggestionsScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingSuggestions, setIsDraggingSuggestions] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "مرحباً بك سعادة المدير العام. أنا الوكيل المشرف والمستشار القانوني الذكي لمنصة لوناليزا (Legal Copilot & MCP Gateway).\n\nأنا مربوط بخادم المنصة الرسمي (lonaliza-core-mcp) ومفوض بالتحكم في كافة إعدادات وسياسات المنصة:\n• شروط الاستخدام وقواعد تذاكر الطيران (Terms)\n• سياسات الخصوصية وحماية البيانات والتشفير (Privacy)\n• بوابة الـ GDPR وطلب وحذف الحسابات وقوانين الامتثال المحلية (PDPL السعودي / KVKK التركي / الإمارات)\n\nأخبرني بأي تعديل أو بند ترغب في صياغته أو مواءمته وسأقوم بصياغته بـ 4 لغات مع إمكانية نشره فوراً على الموقع الحي بنقرة واحدة!",
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      server: "lonaliza-core-mcp",
      executionSteps: [
        {
          id: "step_init_1",
          stepNumber: 1,
          toolName: "lonaliza-core-mcp (Legal Policies Engine)",
          targetAgent: "وكيل السياسات والامتثال",
          actionType: "mcp_call",
          status: "completed",
          descriptionAr: "الاتصال المباشر بمخزن السياسات والتحقق من سلامة 27 بنداً معتمداً",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          details: "كافة البنود متزامنة وتعمل حياً على /terms و /privacy و /gdpr.",
        },
      ],
      suggestedPrompts: [
        "صياغة مادة الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)",
        "تعديل شرط الاسترداد ليكون 90% مع مهلة 24 ساعة قبل الرحلة",
        "إضافة مادة حقوق المستهلك وسياسة الطيران وفق لوائح دولة الإمارات",
        "فحص مطابقة سياسة الخصوصية مع معايير الـ KVKK التركية",
      ],
    },
  ]);

  const aiChatScrollRef = useRef<HTMLDivElement>(null);

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/legal", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setIdentity(data.settings.identity);
        setClauses(data.settings.clauses || []);
        setRetention(data.settings.retention);
        setDeletionRequests(data.deletionRequests || []);
      } else {
        setMessage({ text: data.error || "تعذر تحميل البيانات", type: "error" });
      }
    } catch {
      setMessage({ text: "فشل الاتصال بالخادم", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (isAiBannerOpen && aiChatScrollRef.current) {
      aiChatScrollRef.current.scrollTop = aiChatScrollRef.current.scrollHeight;
    }
  }, [aiMessages, isAiBannerOpen]);

  // Save Settings
  const handleSaveSettings = async () => {
    if (!identity || !retention) return;
    try {
      setSaving(true);
      const payload: Partial<LegalSettingsPayload> = {
        identity,
        clauses,
        retention,
      };
      const res = await fetch("/api/admin/legal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({
          text: "تم حفظ الإعدادات القانونية بنجاح ونشر جميع التعديلات فوراً على الموقع الحي!",
          type: "success",
        });
        setIdentity(data.settings.identity);
        setClauses(data.settings.clauses);
        setRetention(data.settings.retention);
      } else {
        setMessage({ text: data.error || "حدث خطأ أثناء الحفظ", type: "error" });
      }
    } catch {
      setMessage({ text: "فشل الحفظ في الخادم", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Clause Actions
  const handleOpenClauseModal = (clause?: LegalCustomClause, targetDoc?: LegalDocTarget) => {
    if (clause) {
      setEditingClause({ ...clause });
    } else {
      setEditingClause({
        id: "",
        targetDoc:
          targetDoc ||
          (activeTab === "terms" || activeTab === "privacy" || activeTab === "gdpr"
            ? activeTab
            : "terms"),
        sectionKey: `custom_sec_${Date.now().toString(36)}`,
        titleAr: "",
        titleEn: "",
        titleTr: "",
        titleFr: "",
        contentAr: "",
        contentEn: "",
        contentTr: "",
        contentFr: "",
        badge: "بند معتمد",
        order: (clauses.length + 1) * 10,
        enabled: true,
        createdAt: new Date().toISOString(),
      });
    }
    setIsClauseModalOpen(true);
  };

  const handleSaveClauseModal = async () => {
    if (!editingClause) return;
    if (!editingClause.titleAr.trim() || !editingClause.contentAr.trim()) {
      alert("يرجى إدخال العنوان والمحتوى بالعربية كحد أدنى");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/legal/clauses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingClause),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({
          text: "تم حفظ البند ونشره فوراً على الموقع الحي!",
          type: "success",
        });
        await fetchData();
        setIsClauseModalOpen(false);
        setEditingClause(null);
      } else {
        alert(data.error || "فشل حفظ البند");
      }
    } catch {
      alert("خطأ في الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClause = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف البند "${title}" نهائياً من الموقع الحي؟`)) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/legal/clauses?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: "تم حذف البند بنجاح من الموقع الحي", type: "success" });
        setClauses((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(data.error || "فشل حذف البند");
      }
    } catch {
      alert("خطأ في الاتصال بالخادم أثناء الحذف");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleClause = async (clause: LegalCustomClause) => {
    const updated = { ...clause, enabled: !clause.enabled };
    try {
      const res = await fetch("/api/admin/legal/clauses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.ok) {
        setClauses((prev) => prev.map((c) => (c.id === clause.id ? updated : c)));
      }
    } catch {
      alert("فشل تحديث حالة البند");
    }
  };

  // AI Legal Copilot Actions
  const handleSendAiPrompt = async (customText?: string) => {
    const textToSend = customText || aiPrompt;
    if (!textToSend.trim() || aiLoading) return;

    setAiLoading(true);
    setAiPrompt("");

    const nowTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: nowTime,
      server: selectedServers.join(", "),
    };

    setAiMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/admin/legal/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          prompt: textToSend,
          server: selectedServers[0] || "lonaliza-core-mcp",
          servers: selectedServers,
          targetDoc:
            activeTab === "terms" || activeTab === "privacy" || activeTab === "gdpr"
              ? activeTab
              : "terms",
          clauseData: lastProposedClause,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        if (data.isPublished) {
          await fetchData();
          setMessage({
            text: `تم بنجاح وبأمركم تطبيق ونشر البند "${data.proposedClause?.titleAr || 'المادة القانونية'}" فوراً على الموقع الحي!`,
            type: "success",
          });
        }
        if (data.proposedClause) {
          setLastProposedClause(data.proposedClause);
        }

        const modelMsg: ChatMessage = {
          id: `model_${Date.now()}`,
          role: "model",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          server: selectedServers.join(", "),
          executionSteps: data.executionSteps || [],
          proposedClause: data.proposedClause,
          suggestedPrompts: [
            "تطبيق ونشر هذا البند فوراً على الموقع الحي",
            "صياغة مادة إضافية مكملة لهذا البند",
            "فحص توافق هذا البند مع اللوائح الأوروبية والتركية",
          ],
        };
        setAiMessages((prev) => [...prev, modelMsg]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: "model",
            text: `عذراً، حدث خطأ: ${data.error || "تعذر إتمام الاستشارة القانونية"}`,
            timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "model",
          text: "تعذر الاتصال بخدمة الوكيل المشرف، يرجى التحقق من الشبكة أو تشغيل خادم MCP.",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Mouse Drag-to-Scroll & Live Suggestions Generation
  const handleSuggestionsMouseDown = (e: React.MouseEvent) => {
    if (!suggestionsScrollRef.current) return;
    setIsDraggingSuggestions(true);
    setDragStartX(e.pageX - suggestionsScrollRef.current.offsetLeft);
    setDragScrollLeft(suggestionsScrollRef.current.scrollLeft);
  };

  const handleSuggestionsMouseLeave = () => {
    setIsDraggingSuggestions(false);
  };

  const handleSuggestionsMouseUp = () => {
    setIsDraggingSuggestions(false);
  };

  const handleSuggestionsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSuggestions || !suggestionsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - suggestionsScrollRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.6;
    suggestionsScrollRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const scrollSuggestions = (dir: "left" | "right") => {
    if (!suggestionsScrollRef.current) return;
    const offset = dir === "left" ? -280 : 280;
    suggestionsScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleGenerateFreshSuggestions = async () => {
    try {
      setGeneratingSuggestions(true);
      const res = await fetch("/api/admin/legal/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_suggestions" }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSmartSuggestions(data.suggestions);
        setMessage({
          text: "تم بنجاح توليد مقترحات تشريعية حية مستمدة من أحدث الأنظمة والاتفاقيات الدولية!",
          type: "success",
        });
      }
    } catch {
      /* ignore */
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleApplyAiClause = async (clause: LegalCustomClause) => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/legal/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply_clause",
          clauseData: clause,
          server: selectedServers[0] || "lonaliza-core-mcp",
          servers: selectedServers,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        await fetchData();
        setMessage({
          text: `تم بنجاح تطبيق ونشر البند "${clause.titleAr}" فوراً على الموقع الحي!`,
          type: "success",
        });
      } else {
        alert(data.error || "فشل تطبيق البند");
      }
    } catch {
      alert("خطأ في تطبيق البند");
    } finally {
      setSaving(false);
    }
  };

  // Deletion Request Actions
  const handlePurgeSingle = async (requestId: string) => {
    if (
      !confirm(
        "تحذير صارم: سيتم مسح حساب هذا العميل نهائياً من قاعدة البيانات وجلسات الدخول بدون أي إمكانية للاسترجاع. هل تود المتابعة؟"
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/legal/deletions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purge", requestId }),
      });
      const data = await res.json();
      if (data.ok) {
        setDeletionRequests(data.requests);
        setMessage({ text: data.message, type: "success" });
        setSelectedRequestIds((prev) => prev.filter((id) => id !== requestId));
      } else {
        alert(data.error || "فشل الحذف النهائي");
      }
    } catch {
      alert("خطأ في الاتصال بالخادم أثناء مسح الحساب");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkPurge = async () => {
    if (selectedRequestIds.length === 0) {
      alert("يرجى تحديد عميل واحد على الأقل للحذف الجماعي");
      return;
    }

    if (
      !confirm(
        `تنبيه أمني هام: أنت على وشك حذف (${selectedRequestIds.length}) حسابات للعملاء نهائياً وبالكامل من المنصة. هل أنت متأكد بنسبة 100%؟`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/legal/deletions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_purge", requestIds: selectedRequestIds }),
      });
      const data = await res.json();
      if (data.ok) {
        setDeletionRequests(data.requests);
        setMessage({ text: data.message, type: "success" });
        setSelectedRequestIds([]);
      } else {
        alert(data.error || "فشل الحذف الجماعي");
      }
    } catch {
      alert("خطأ في معالجة الحذف الجماعي");
    } finally {
      setSaving(false);
    }
  };

  const handleSetRetention = async () => {
    if (!retentionModalReq) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/legal/deletions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_retention",
          requestId: retentionModalReq.id,
          days: Number(customRetentionDays),
          adminNotes: retentionNotes,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDeletionRequests(data.requests);
        setMessage({ text: data.message, type: "success" });
        setRetentionModalReq(null);
      } else {
        alert(data.error || "فشل تعديل مدة الإبقاء");
      }
    } catch {
      alert("خطأ في تحديث مدة الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreAccount = async (requestId: string) => {
    if (!confirm("هل ترغب في إلغاء طلب الحذف وإعادة تفعيل حساب العميل؟")) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/legal/deletions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", requestId }),
      });
      const data = await res.json();
      if (data.ok) {
        setDeletionRequests(data.requests);
        setMessage({ text: data.message, type: "success" });
      } else {
        alert(data.error || "فشل استعادة الحساب");
      }
    } catch {
      alert("خطأ في استعادة الحساب");
    } finally {
      setSaving(false);
    }
  };

  // Filter Deletion Requests
  const filteredRequests = useMemo(() => {
    if (deletionFilter === "all") return deletionRequests;
    return deletionRequests.filter((r) => r.status === deletionFilter);
  }, [deletionRequests, deletionFilter]);

  const toggleSelectAll = () => {
    if (selectedRequestIds.length === filteredRequests.length) {
      setSelectedRequestIds([]);
    } else {
      setSelectedRequestIds(filteredRequests.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedRequestIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter Clauses for active tab
  const currentTabClauses = useMemo(() => {
    if (activeTab !== "terms" && activeTab !== "privacy" && activeTab !== "gdpr") {
      return [];
    }
    let list = clauses.filter((c) => c.targetDoc === activeTab);
    if (clauseSearch.trim()) {
      const q = clauseSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.titleAr.toLowerCase().includes(q) ||
          c.titleEn.toLowerCase().includes(q) ||
          c.contentAr.toLowerCase().includes(q) ||
          (c.badge && c.badge.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => a.order - b.order);
  }, [clauses, activeTab, clauseSearch]);

  if (loading || !identity || !retention) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm min-h-[550px] flex flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="h-10 w-10 animate-spin text-[color:var(--admin-gold)]" />
        <p className="text-sm font-bold">
          جاري تحميل مركز السياسات القانونية وهوية المنصة والوكيل المشرف...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page space-y-6 pb-20 w-full max-w-none min-w-0 text-[color:var(--admin-text-primary)]" dir="rtl">
      {/* Toast Notice - Ultra-Clear, High-Contrast Light Card with Dark Icons & Typography */}
      {message && (
        <div
          className={`fixed bottom-6 start-6 z-50 max-w-md w-full p-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 flex items-start justify-between gap-3.5 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 ring-4 bg-[color:var(--admin-bg-surface)] text-[color:var(--admin-text-primary)] ${
            message.type === "success"
              ? "border-emerald-500 ring-emerald-500/15"
              : "border-rose-500 ring-rose-500/15"
          }`}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2.5 rounded-xl shrink-0 border ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-inner"
                  : "bg-rose-50 border-rose-200 text-rose-800 shadow-inner"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-700 animate-pulse" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-rose-700" />
              )}
            </div>
            <div className="space-y-1 text-right flex-1 min-w-0">
              <div
                className={`text-[11px] font-black tracking-wide flex items-center justify-end gap-1.5 ${
                  message.type === "success" ? "text-emerald-800" : "text-rose-800"
                }`}
                style={{ color: message.type === "success" ? "#065f46" : "#9f1239" }}
              >
                <span
                  className={`h-2 w-2 rounded-full animate-ping ${
                    message.type === "success" ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                ></span>
                <span>إشعار النظام والامتثال الحي:</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div
                className="text-xs sm:text-sm font-black leading-relaxed text-[color:var(--admin-text-primary)]"
              >
                {message.text}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="admin-btn-secondary shrink-0"
            title="إغلاق الإشعار"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP DROPPABLE EXECUTIVE AI COPILOT BANNER (Dashboard-Style Header)     */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-0 text-right">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[color:var(--admin-border-subtle)]">
          <div className="flex items-center gap-3.5">
            <span className="admin-page-head__mark relative">
              <Bot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--admin-gold)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[color:var(--admin-gold)]"></span>
              </span>
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-[color:var(--admin-text-primary)]">
                  المشرف العام والوكيل القانوني الذكي
                </h2>
                <span className="admin-chip">
                  متصل بـ Gemini وMCP
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[color:var(--admin-text-muted)] font-medium mt-0.5">
                شروط الاستخدام، الخصوصية، GDPR، والنشر اللحظي.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAiMessages([
                  {
                    id: "init",
                    role: "model",
                    text: `مرحباً بك سعادة المدير العام. أنا الوكيل المشرف والمستشار القانوني الذكي لمنصة لوناليزا (Legal Copilot & MCP Gateway).\n\nأنا متصل مباشرة بخادم [${selectedServers.join(
                      ", "
                    )}] ومفوض بالصياغة القانونية الرصينة بـ 4 لغات (عربي، إنجليزي، تركي، فرنسي) استناداً إلى المراجع والمراسيم الرسمية الصادرة في السعودية والإمارات وتركيا والاتحاد الأوروبي.\n\nكيف تأمرني بدعمك الآن؟`,
                    timestamp: new Date().toLocaleTimeString("ar-EG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ]);
              }}
              className="admin-btn-secondary"
              title="بدء جلسة جديدة مع الوكيل المشرف"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">جلسة جديدة</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAiBannerOpen(!isAiBannerOpen)}
              className="admin-btn-secondary"
              title={isAiBannerOpen ? "طي محادثة الوكيل" : "توسيع وتكبير محادثة الوكيل"}
            >
              {isAiBannerOpen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        {/* Droppable Sliding Chat Body */}
        {isAiBannerOpen && (
          <div className="p-5 sm:p-6 bg-[color:var(--admin-bg-subtle)] border-t border-[color:var(--admin-border-subtle)] space-y-4">
            {/* Draggable Smooth Statutory Carousel with Live Web Generation */}
            <div className="space-y-2 pt-1 border-b border-[color:var(--admin-border-subtle)] pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[color:var(--admin-gold)] flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span>مقترحات ذكية حقيقية (اسحب بالماوس يميناً ويساراً):</span>
                  </span>
                  <span className="hidden sm:inline-block text-[11px] text-[color:var(--admin-text-muted)] font-medium">
                    انقر على أي مقترح لتكييفه نظامياً وتوليد بطاقة النشر
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleGenerateFreshSuggestions}
                    disabled={generatingSuggestions || aiLoading}
                    className="admin-btn-secondary text-xs disabled:opacity-50"
                    title="توليد مقترحات تشريعية جديدة مستمدة من الأنظمة الدولية"
                  >
                    {generatingSuggestions ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" />
                    ) : (
                      <Compass className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span className="hidden sm:inline">توليد مقترحات جديدة من الأنظمة</span>
                    <span className="sm:hidden">توليد جديد</span>
                  </button>

                  <div className="flex items-center gap-1 rounded-xl border border-[color:var(--admin-border-subtle)] p-0.5">
                    <button
                      type="button"
                      onClick={() => scrollSuggestions("right")}
                      className="admin-btn-secondary p-1"
                      title="تحريك لليمين"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollSuggestions("left")}
                      className="admin-btn-secondary p-1"
                      title="تحريك لليسار"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Draggable Mouse-Scroll Container */}
              <div
                ref={suggestionsScrollRef}
                onMouseDown={handleSuggestionsMouseDown}
                onMouseLeave={handleSuggestionsMouseLeave}
                onMouseUp={handleSuggestionsMouseUp}
                onMouseMove={handleSuggestionsMouseMove}
                className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-1 scrollbar-none select-none cursor-grab active:cursor-grabbing"
              >
                {smartSuggestions.map((promptText, idx) => {
                  const tag = promptText.includes("PDPL")
                    ? "السعودية PDPL"
                    : promptText.includes("GACA")
                    ? "طيران GACA"
                    : promptText.includes("الإمارات")
                    ? "الإمارات 15/2020"
                    : promptText.includes("KVKK")
                    ? "تركيا KVKK"
                    : promptText.includes("مونتريال")
                    ? "مونتريال 1999"
                    : promptText.includes("GDPR") || promptText.includes("الأوروبية")
                    ? "أوروبا GDPR"
                    : promptText.includes("إياتا")
                    ? "قواعد إياتا"
                    : "نظام معتمد";

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!isDraggingSuggestions) {
                          handleSendAiPrompt(promptText);
                        }
                      }}
                      disabled={aiLoading}
                      className="shrink-0 group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[color:var(--admin-bg-surface)] border-2 border-[color:var(--admin-border-subtle)] hover:border-[color:var(--admin-gold)] text-right text-xs font-black text-[color:var(--admin-text-primary)] transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <span
                        className="admin-chip shrink-0"
                      >
                        {tag}
                      </span>
                      <span
                        className="truncate max-w-[280px] sm:max-w-xs font-black text-[color:var(--admin-text-primary)]"
                      >
                        {promptText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages Chat Log Area */}
            <div
              ref={aiChatScrollRef}
              className="max-h-[380px] overflow-y-auto space-y-4 rounded-2xl bg-[color:var(--admin-bg-surface)] border border-[color:var(--admin-border-subtle)] p-4 sm:p-5"
            >
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-xs shadow-lg border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-accent)] text-[color:var(--admin-accent-foreground)]"
                        : "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-primary)] rounded-bl-xs border border-[color:var(--admin-border-subtle)]"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between gap-4 mb-2 pb-1.5 border-b text-[11px] ${
                        msg.role === "user" ? "border-[color:var(--admin-gold)]/30" : "border-[color:var(--admin-border-subtle)]"
                      }`}
                    >
                      <span
                        className={`font-black flex items-center gap-1.5 ${
                          msg.role === "user" ? "text-[color:var(--admin-gold)]" : ""
                        }`}
                      >
                        {msg.role === "user" ? "👑 سعادة المدير العام" : "🤖 الوكيل القانوني المشرف"}
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          msg.role === "user" ? "text-[color:var(--admin-text-muted)]" : ""
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    <p
                      className="whitespace-pre-line leading-relaxed font-bold"
                    >
                      {msg.text}
                    </p>

                    {/* Execution Steps / Radar Details */}
                    {msg.executionSteps && msg.executionSteps.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[color:var(--admin-border-subtle)] space-y-1.5">
                        <div className="text-[11px] font-bold text-[color:var(--admin-gold)] flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          <span>العمليات المنفذة حياً عبر بروتوكول MCP:</span>
                        </div>
                        {msg.executionSteps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-start gap-2 text-[11px] bg-[color:var(--admin-bg-subtle)] p-2 rounded-lg border border-[color:var(--admin-border-subtle)]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-[color:var(--admin-text-primary)]">
                                [{step.toolName}]
                              </strong>{" "}
                              <span>{step.descriptionAr}</span>
                              {step.details && (
                                <p className="text-[10px] text-[color:var(--admin-text-muted)] mt-0.5">
                                  {step.details}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Proposed Clause Interactive Preview & Live Publish Button */}
                    {msg.proposedClause && (
                      <div className="mt-4 rounded-xl border-2 border-amber-300 dark:border-amber-500/50 bg-amber-50/90 dark:bg-amber-950/30 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-200 text-amber-900">
                              {msg.proposedClause.badge || "بند مقترح"}
                            </span>
                            <span className="text-xs font-black text-[color:var(--admin-text-primary)]">
                              {msg.proposedClause.titleAr}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[color:var(--admin-text-muted)]">
                            القسم: {msg.proposedClause.targetDoc}
                          </span>
                        </div>

                        <p className="text-xs whitespace-pre-line leading-relaxed">
                          {msg.proposedClause.contentAr}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/80 dark:border-amber-900/60">
                          <span className="text-[11px] text-[color:var(--admin-text-muted)] font-medium">
                            صيغة بـ 4 لغات مكتملة وجاهزة للإدراج المباشر في قاعدة البيانات
                          </span>

                          <button
                            type="button"
                            onClick={() => handleApplyAiClause(msg.proposedClause!)}
                            disabled={saving}
                            className="admin-btn-primary text-xs disabled:opacity-50"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>تطبيق ونشر هذا البند فوراً على الموقع الحي</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-[color:var(--admin-gold)] p-3 bg-[color:var(--admin-gold-soft)] rounded-xl w-fit">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    الوكيل المشرف يتصل بخوادم [{selectedServers.join(", ")}] ويفحص المراجع القانونية...
                  </span>
                </div>
              )}
            </div>

            {/* Active MCP Server Tags Bar & MCP Tools Button */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[color:var(--admin-border-subtle)]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-[color:var(--admin-text-muted)] flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5 text-[color:var(--admin-gold)]" />
                  خوادم MCP الموجهة للوكيل:
                </span>
                {selectedServers.map((srvId) => {
                  const srv = MCP_SERVERS.find((s) => s.id === srvId);
                  return (
                    <span
                      key={srvId}
                      className="admin-chip"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{srv?.tag || `@${srvId}`}</span>
                      {srv?.isRecommended && (
                        <span className="text-[9px] font-black admin-chip px-1.5 py-0.2">
                          موصى به
                        </span>
                      )}
                      {selectedServers.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedServers(selectedServers.filter((id) => id !== srvId))
                          }
                          className="hover:text-rose-500 mr-0.5 text-sm leading-none cursor-pointer"
                          title="إلغاء تفعيل هذا الخادم"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>

              {/* MCP Tools Button to Open Modal */}
              <button
                type="button"
                onClick={() => setShowMcpSelectorModal(true)}
                className="admin-btn-secondary text-xs"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>
                  أدوات وخوادم MCP ({selectedServers.length})
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            {/* Input Prompt Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiPrompt();
              }}
              className="flex items-center gap-2 bg-[color:var(--admin-bg-surface)] p-2 rounded-2xl border border-[color:var(--admin-border-subtle)] shadow-sm"
            >
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="اطلب من الوكيل صياغة مادة قانونية محددة وفق مراسيم وقوانين دولة معينة (مثال: أضف مادة لحماية الأطفال وفق اللائحة السعودية، أو عدّل شرط الاسترداد)..."
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[color:var(--admin-text-primary)] placeholder:text-[color:var(--admin-text-faint)] focus:outline-none font-medium"
                disabled={aiLoading}
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || aiLoading}
                className="admin-btn-primary text-xs sm:text-sm disabled:opacity-40"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>إرسال</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MCP SERVERS SELECTOR INTERACTIVE MODAL                                    */}
      {/* ========================================================================= */}
      {showMcpSelectorModal ? (
        <Dialog open={showMcpSelectorModal} onOpenChange={setShowMcpSelectorModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--admin-border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)]">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">
                    بوابة خوادم بروتوكول MCP للوكيل القانوني
                  </h3>
                  <p className="text-[11px] text-[color:var(--admin-text-muted)]">
                    اختر الخوادم والأدوات التي تريد من الوكيل الاتصال بها عند فحص وصياغة القوانين
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMcpSelectorModal(false)}
                className="admin-btn-secondary p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
              {MCP_SERVERS.map((srv) => {
                const isSelected = selectedServers.includes(srv.id);
                const Icon = srv.icon;
                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      if (isSelected) {
                        if (selectedServers.length > 1) {
                          setSelectedServers(selectedServers.filter((id) => id !== srv.id));
                        }
                      } else {
                        setSelectedServers([...selectedServers, srv.id]);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-[color:var(--admin-gold-soft)] border-[color:var(--admin-gold)] shadow-xs"
                        : "bg-[color:var(--admin-bg-surface)] border-[color:var(--admin-border-subtle)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          isSelected
                            ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)]"
                            : "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-muted)]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-black text-[color:var(--admin-text-primary)]">
                            {srv.name}
                          </span>
                          {srv.isRecommended && (
                            <span className="admin-chip">
                              موصى به
                            </span>
                          )}
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            {srv.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[color:var(--admin-text-muted)] mt-1 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded h-4 w-4 pointer-events-none accent-[color:var(--admin-gold)]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[color:var(--admin-border-subtle)]">
              <button
                type="button"
                onClick={() => setSelectedServers(["lonaliza-core-mcp"])}
                className="admin-btn-secondary text-xs"
              >
                إعادة التعيين للوضع الافتراضي
              </button>
              <button
                type="button"
                onClick={() => setShowMcpSelectorModal(false)}
                className="admin-btn-primary text-xs"
              >
                اعتماد وتطبيق الخوادم ({selectedServers.length})
              </button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* ========================================================================= */}
      {/* 2. LUXURY DAYLIGHT/DARK BANNER (Clean, Organized, Single-Row Buttons)      */}
      {/* ========================================================================= */}
      <div className="admin-page-head">
        <div className="flex min-w-0 items-start gap-3">
          <span className="admin-page-head__mark">
            <Scale className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="admin-kicker">Control module</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[color:var(--admin-text-primary)] lg:text-3xl">
              تخصيص الشروط والخصوصية وإدارة حذف الحسابات
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-[color:var(--admin-text-muted)]">
              تحكم كامل في هوية الشركة، بنود الاستخدام، سياسات الخصوصية، وحقوق الـ GDPR.
            </p>
          </div>
        </div>

          {/* Action Hub - High-Contrast Luxury Badges and Royal Gold Save Button with Pure White Typography */}
          {/* Action Hub - High-Contrast Luxury Badges and Royal Gold Save Button with Pure White Typography */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link href="/terms" target="_blank" className="admin-btn-secondary" title="معاينة شروط الاستخدام على الموقع الحي">
                <Eye className="h-3.5 w-3.5" />
                الشروط
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link href="/privacy" target="_blank" className="admin-btn-secondary" title="معاينة سياسة الخصوصية على الموقع الحي">
                <Eye className="h-3.5 w-3.5" />
                الخصوصية
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link href="/gdpr" target="_blank" className="admin-btn-secondary" title="معاينة بوابة الـ GDPR على الموقع الحي">
                <Eye className="h-3.5 w-3.5" />
                GDPR
                <ExternalLink className="h-3 w-3" />
              </Link>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="admin-btn-primary disabled:opacity-50"
              title="نشر وحفظ التعديلات فوراً على خوادم المنصة وصفحات الموقع"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ ونشر فوراً
            </button>
          </div>
      </div>

      <div className="admin-range overflow-x-auto no-scrollbar">
        <button type="button" data-active={activeTab === "identity"} onClick={() => setActiveTab("identity")}>
          الهوية والشركة
        </button>
        <button type="button" data-active={activeTab === "terms"} onClick={() => setActiveTab("terms")}>
          الشروط ({clauses.filter((c) => c.targetDoc === "terms").length})
        </button>
        <button type="button" data-active={activeTab === "privacy"} onClick={() => setActiveTab("privacy")}>
          الخصوصية ({clauses.filter((c) => c.targetDoc === "privacy").length})
        </button>
        <button type="button" data-active={activeTab === "gdpr"} onClick={() => setActiveTab("gdpr")}>
          GDPR ({clauses.filter((c) => c.targetDoc === "gdpr").length})
        </button>
        <button type="button" data-active={activeTab === "deletions"} onClick={() => setActiveTab("deletions")}>
          حذف الحسابات ({deletionRequests.filter((r) => r.status === "pending_purge").length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB CONTENTS                                                           */}
      {/* ========================================================================= */}

      {/* TAB 1: IDENTITY */}
      {activeTab === "identity" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Card: Company Names in 4 Languages */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[color:var(--admin-border-subtle)] pb-4">
              <h3 className="text-base sm:text-lg font-black text-[color:var(--admin-text-primary)] flex items-center gap-2">
                <Building className="h-5 w-5 text-[color:var(--admin-gold)]" />
                <span>هوية المنصة والاسم التجاري والقانوني</span>
              </h3>
              <span className="admin-chip">
                متعدد اللغات (AR / EN / TR / FR)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>اسم الشركة الرسمي بالعربية</label>
                <input
                  type="text"
                  value={identity.companyNameAr}
                  onChange={(e) => setIdentity({ ...identity, companyNameAr: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>English Legal Name (بالإنجليزية)</label>
                <input
                  type="text"
                  value={identity.companyNameEn}
                  onChange={(e) => setIdentity({ ...identity, companyNameEn: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>Resmî Şirket Unvanı (بالتركية TÜRSAB)</label>
                <input
                  type="text"
                  value={identity.companyNameTr}
                  onChange={(e) => setIdentity({ ...identity, companyNameTr: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>Nom Légal Français (بالفرنسية)</label>
                <input
                  type="text"
                  value={identity.companyNameFr}
                  onChange={(e) => setIdentity({ ...identity, companyNameFr: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>اسم العلامة التجارية العام (Brand Name)</label>
                <input
                  type="text"
                  value={identity.brandName}
                  onChange={(e) => setIdentity({ ...identity, brandName: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>رقم وثيقة وترخيص السياحة (TÜRSAB License No)</label>
                <input
                  type="text"
                  value={identity.tursabLicenseNumber}
                  onChange={(e) => setIdentity({ ...identity, tursabLicenseNumber: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Card: Addresses and Contacts */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base sm:text-lg font-black text-[color:var(--admin-text-primary)] flex items-center gap-2 border-b border-[color:var(--admin-border-subtle)] pb-4">
              <Mail className="h-5 w-5 text-[color:var(--admin-gold)]" />
              <span>العناوين ووسائل الاتصال الرسمية ومسؤول حماية البيانات (DPO)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>العنوان الرسمي بالعربية</label>
                <input
                  type="text"
                  value={identity.officialAddressAr}
                  onChange={(e) => setIdentity({ ...identity, officialAddressAr: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Official Address in English</label>
                <input
                  type="text"
                  value={identity.officialAddressEn}
                  onChange={(e) => setIdentity({ ...identity, officialAddressEn: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>البريد الإلكتروني الرسمي للمراسلات</label>
                <input
                  type="email"
                  value={identity.officialEmail}
                  onChange={(e) => setIdentity({ ...identity, officialEmail: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>رقم الهاتف وخدمة العملاء والواتساب</label>
                <input
                  type="text"
                  value={identity.officialPhone}
                  onChange={(e) => setIdentity({ ...identity, officialPhone: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>بريد مسؤول حماية البيانات (DPO Contact Email)</label>
                <input
                  type="email"
                  value={identity.dpoEmail}
                  onChange={(e) => setIdentity({ ...identity, dpoEmail: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>الخط الساخن لمسؤول حماية البيانات (DPO Hotline)</label>
                <input
                  type="text"
                  value={identity.dpoHotline}
                  onChange={(e) => setIdentity({ ...identity, dpoHotline: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>الغرفة التجارية المسجل بها (Chamber of Commerce)</label>
                <input
                  type="text"
                  value={identity.chamberOfCommerce}
                  onChange={(e) => setIdentity({ ...identity, chamberOfCommerce: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>الرقم الضريبي الرسمي (Tax Identification Number)</label>
                <input
                  type="text"
                  value={identity.taxNumber}
                  onChange={(e) => setIdentity({ ...identity, taxNumber: e.target.value })}
                  className={inputClass}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Jurisdiction Courts */}
            <div className="border-t border-[color:var(--admin-border-subtle)] pt-5 space-y-4">
              <h4 className="admin-field-label">
                المحكمة المختصة بالنزاعات والتحكيم التجاري (Jurisdiction Courts)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>المحكمة المختصة بالعربية</label>
                  <input
                    type="text"
                    value={identity.jurisdictionCityAr}
                    onChange={(e) =>
                      setIdentity({ ...identity, jurisdictionCityAr: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Jurisdiction Court in English</label>
                  <input
                    type="text"
                    value={identity.jurisdictionCityEn}
                    onChange={(e) =>
                      setIdentity({ ...identity, jurisdictionCityEn: e.target.value })
                    }
                    className={inputClass}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS 2, 3, 4: CLAUSE LISTS (Terms, Privacy, GDPR) */}
      {(activeTab === "terms" || activeTab === "privacy" || activeTab === "gdpr") && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Controls: Add Clause + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-[color:var(--admin-text-primary)] flex items-center gap-2">
                {activeTab === "terms" ? (
                  <Scale className="h-5 w-5 text-amber-500" />
                ) : activeTab === "privacy" ? (
                  <FileText className="h-5 w-5 text-blue-500" />
                ) : (
                  <Lock className="h-5 w-5 text-emerald-500" />
                )}
                <span>
                  {activeTab === "terms"
                    ? "البنود والقوانين الرسمية لشروط الاستخدام"
                    : activeTab === "privacy"
                    ? "البنود والسياسات المعتمدة لسياسة الخصوصية"
                    : "اللوائح وبنود الامتثال لحقوق حماية البيانات (GDPR)"}
                </span>
              </h3>
              <p className="text-xs text-[color:var(--admin-text-muted)]">
                جميع البنود الرسمية محملة وجاهزة بالكامل بـ 4 لغات. يمكنك تعديل أي بند أو صياغته بمساعدة الذكاء الاصطناعي، وأي حفظ يظهر فوراً على الموقع.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="h-3.5 w-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--admin-text-muted)]" />
                <input
                  type="text"
                  value={clauseSearch}
                  onChange={(e) => setClauseSearch(e.target.value)}
                  placeholder="بحث في البنود..."
                  className="admin-field pr-9 pl-4 py-2 text-xs"
                />
              </div>

              {/* Add New Clause Button */}
              <button
                type="button"
                onClick={() => handleOpenClauseModal(undefined, activeTab)}
                className="admin-btn-primary text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة قانون / بند جديد</span>
              </button>
            </div>
          </div>

          {/* Clauses Cards List */}
          {currentTabClauses.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-10 w-10 text-[color:var(--admin-text-muted)] mx-auto" />
              <p className="text-sm font-bold">
                {clauseSearch ? "لا توجد نتائج مطابقة لبحثك" : "لا توجد بنود مضافة لهذا القسم"}
              </p>
              <button
                type="button"
                onClick={() => handleOpenClauseModal(undefined, activeTab)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--admin-gold)] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة بند الآن</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentTabClauses.map((clause) => {
                const previewLang = clauseLangPreview[clause.id] || "ar";

                const currentTitle =
                  previewLang === "ar"
                    ? clause.titleAr || clause.titleEn
                    : previewLang === "en"
                    ? clause.titleEn || clause.titleAr
                    : previewLang === "tr"
                    ? clause.titleTr || clause.titleEn
                    : clause.titleFr || clause.titleEn;

                const currentContent =
                  previewLang === "ar"
                    ? clause.contentAr || clause.contentEn
                    : previewLang === "en"
                    ? clause.contentEn || clause.contentAr
                    : previewLang === "tr"
                    ? clause.contentTr || clause.contentEn
                    : clause.contentFr || clause.contentEn;

                return (
                  <div
                    key={clause.id}
                    className={`rounded-xl border border-border bg-card shadow-sm p-5 sm:p-6 transition-all space-y-4 ${
                      clause.enabled ? "" : "opacity-60"
                    }`}
                  >
                    {/* Clause Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[color:var(--admin-border-subtle)] pb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {clause.badge && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                            {clause.badge}
                          </span>
                        )}
                        <span className="admin-chip font-mono">
                          #{clause.order}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-[color:var(--admin-text-primary)] leading-snug">
                          {currentTitle}
                        </h4>
                      </div>

                      {/* Controls: Language Switcher, Toggle, Edit, Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quick 4-Language Switcher */}
                        <div className="flex items-center rounded-lg p-0.5 text-[10px] font-bold border border-[color:var(--admin-border-subtle)]">
                          {(["ar", "en", "tr", "fr"] as LangPreviewKey[]).map((langKey) => (
                            <button
                              key={langKey}
                              type="button"
                              onClick={() =>
                                setClauseLangPreview((prev) => ({ ...prev, [clause.id]: langKey }))
                              }
                              className={`px-2.5 py-1 rounded-md uppercase text-xs font-black transition-all ${
                                previewLang === langKey
                                  ? "bg-[color:var(--admin-accent)] text-[color:var(--admin-accent-foreground)] shadow-sm"
                                  : "text-[color:var(--admin-text-muted)] hover:text-[color:var(--admin-text-primary)]"
                              }`}
                            >
                              <span
                                className={previewLang === langKey ? "font-black" : ""}
                              >
                                {langKey}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Enable/Disable Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleClause(clause)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            clause.enabled
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                              : "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-muted)]"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              clause.enabled ? "bg-emerald-500" : "bg-[color:var(--admin-text-muted)]"
                            }`}
                          />
                          <span>{clause.enabled ? "مفعّل على الموقع" : "معطّل"}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenClauseModal(clause)}
                          className="admin-btn-secondary p-1.5"
                          title="تعديل صياغة البند بجميع اللغات"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteClause(clause.id, clause.titleAr)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="حذف هذا البند"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Clause Content Preview */}
                    <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                      {currentContent}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[color:var(--admin-text-muted)] border-t border-[color:var(--admin-border-subtle)] pt-2 font-mono">
                      <span>معرّف البند: {clause.id}</span>
                      <span>مفتاح القسم: {clause.sectionKey}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Special Section: GDPR Retention Settings (Shown inside GDPR Tab) */}
          {activeTab === "gdpr" && retention && (
            <div className="rounded-xl border border-border bg-card shadow-sm space-y-6 mt-8">
              <h3 className="text-base sm:text-lg font-black text-[color:var(--admin-text-primary)] flex items-center gap-2 border-b border-[color:var(--admin-border-subtle)] pb-4">
                <Clock className="h-5 w-5 text-[color:var(--admin-gold)]" />
                <span>إعدادات فترة السماح للاحتفاظ بالبيانات (Retention Period Window)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div>
                  <label className={labelClass}>مدة الإبقاء الافتراضية للحسابات المحذوفة (بالأيام)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={retention.retentionPeriodDays}
                    onChange={(e) =>
                      setRetention({ ...retention, retentionPeriodDays: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                  <p className="text-[11px] text-[color:var(--admin-text-muted)] mt-1">
                    الفترة التي يمكن للعميل أو الإدارة استعادة الحساب خلالها قبل المسح النهائي.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={retention.allowImmediatePurge}
                      onChange={(e) =>
                        setRetention({ ...retention, allowImmediatePurge: e.target.checked })
                      }
                      className="rounded h-4 w-4 accent-[color:var(--admin-gold)]"
                    />
                    <span>السماح للمسؤول بالحذف النهائي الفوري دون انتظار</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={retention.notifyDpoOnRequest}
                      onChange={(e) =>
                        setRetention({ ...retention, notifyDpoOnRequest: e.target.checked })
                      }
                      className="rounded h-4 w-4 accent-[color:var(--admin-gold)]"
                    />
                    <span>إشعار مسؤول الخصوصية (DPO) فور تسجيل أي طلب حذف</span>
                  </label>
                </div>

                <div>
                  <label className={labelClass}>نص إشعار فترة الاحتفاظ بالعربية</label>
                  <textarea
                    rows={3}
                    value={retention.retentionNoticeAr}
                    onChange={(e) =>
                      setRetention({ ...retention, retentionNoticeAr: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DELETION REQUESTS & PURGE MANAGEMENT */}
      {activeTab === "deletions" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header: Filters + Bulk Purge */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-border bg-card shadow-sm">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[color:var(--admin-text-primary)] flex items-center gap-2">
                <UserX className="h-5 w-5 text-rose-600" />
                <span>إدارة طلبات حذف الحسابات ومحو البيانات (GDPR Art. 17)</span>
              </h3>
              <p className="text-xs text-[color:var(--admin-text-muted)]">
                استعراض طلبات العملاء الراغبين بحذف حساباتهم، مع إمكانية مسحهم فوراً أو إبقائهم لمدة محددة أو استعادة حساباتهم.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Tabs */}
              <div className="admin-range">
                {["all", "pending_purge", "retained", "purged", "restored"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDeletionFilter(st)}
                    data-active={deletionFilter === st}
                    className="capitalize" 
                  >
                    {st === "all"
                      ? "الكل"
                      : st === "pending_purge"
                      ? "معلقة"
                      : st === "retained"
                      ? "فترة سماح"
                      : st === "purged"
                      ? "محذوفة نهائياً"
                      : "مستعادة"}
                  </button>
                ))}
              </div>

              {/* Bulk Purge Button */}
              {selectedRequestIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkPurge}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-foreground font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>حذف جماعي نهائي ({selectedRequestIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Table of Deletion Requests */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden shadow-xs">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold">
                  لا توجد طلبات حذف حسابات مسجلة حالياً
                </p>
                <p className="text-xs text-[color:var(--admin-text-muted)]">
                  عندما يطلب أي عميل حذف حسابه من لوحة العميل سيظهر طلبه هنا فوراً مع خيارات الإدارة.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[color:var(--admin-bg-subtle)] border-b border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-muted)] font-bold uppercase">
                    <tr>
                      <th className="p-4 w-10">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-[color:var(--admin-text-muted)]"
                        >
                          {selectedRequestIds.length === filteredRequests.length ? (
                            <CheckSquare className="h-4 w-4 text-[color:var(--admin-gold)]" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="p-4">العميل / البريد</th>
                      <th className="p-4">تاريخ الطلب</th>
                      <th className="p-4">فترة الإبقاء</th>
                      <th className="p-4">تاريخ المسح المتوقع</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--admin-border-subtle)] font-medium">
                    {filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-[color:var(--admin-bg-subtle)] transition-colors"
                      >
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => toggleSelectOne(req.id)}
                            className="text-[color:var(--admin-text-muted)]"
                          >
                            {selectedRequestIds.includes(req.id) ? (
                              <CheckSquare className="h-4 w-4 text-[color:var(--admin-gold)]" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[color:var(--admin-text-primary)]">
                            {req.customerName || "عميل مسجل"}
                          </div>
                          <div className="text-[color:var(--admin-text-muted)] font-mono text-[11px]" dir="ltr">
                            {req.email}
                          </div>
                          {req.reason && (
                            <div className="text-[10px] text-[color:var(--admin-text-muted)] mt-0.5">
                              السبب: {req.reason}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-[color:var(--admin-text-muted)]">
                          {new Date(req.requestedAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 font-bold">
                            <Clock className="h-3 w-3 text-[color:var(--admin-gold)]" />
                            <span>{req.retentionDaysSet || 30} يوم</span>
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                          {new Date(req.retentionExpiresAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              req.status === "pending_purge"
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300"
                                : req.status === "retained"
                                ? "bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300"
                                : req.status === "purged"
                                ? "bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300"
                                : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300"
                            }`}
                          >
                            {req.status === "pending_purge"
                              ? "طلب معلق"
                              : req.status === "retained"
                              ? "قيد الحفظ المشفر"
                              : req.status === "purged"
                              ? "محذوف نهائياً"
                              : "مستعاد"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Adjust Retention Modal */}
                            <button
                              type="button"
                              onClick={() => {
                                setRetentionModalReq(req);
                                setCustomRetentionDays(req.retentionDaysSet || 30);
                                setRetentionNotes(req.adminNotes || "");
                              }}
                              className="admin-btn-secondary text-xs"
                              title="تعديل مدة الإبقاء"
                            >
                              <Sliders className="h-3.5 w-3.5 inline ml-1" />
                              <span>إبقاء محدد</span>
                            </button>

                            {/* Restore Account */}
                            {req.status !== "restored" && (
                              <button
                                type="button"
                                onClick={() => handleRestoreAccount(req.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                                title="إلغاء طلب الحذف وإعادة تفعيل الحساب"
                              >
                                <RefreshCw className="h-3.5 w-3.5 inline ml-1" />
                                <span>استعادة</span>
                              </button>
                            )}

                            {/* Immediate Purge */}
                            <button
                              type="button"
                              onClick={() => handlePurgeSingle(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                              title="مسح الحساب نهائياً وفوراً"
                            >
                              <Trash2 className="h-3.5 w-3.5 inline ml-1" />
                              <span>حذف نهائي</span>
                            </button>
                          </div>
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

      {/* ========================================================================= */}
      {/* 5. ADD / EDIT CLAUSE MODAL (All 4 Languages)                              */}
      {/* ========================================================================= */}
      {isClauseModalOpen && editingClause ? (
        <Dialog open={Boolean(isClauseModalOpen && editingClause)} onOpenChange={setIsClauseModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[color:var(--admin-border-subtle)] pb-4">
              <h3 className="text-base sm:text-lg font-black text-[color:var(--admin-text-primary)] flex items-center gap-2">
                <Edit className="h-5 w-5 text-[color:var(--admin-gold)]" />
                <span>{editingClause.id ? "تعديل صياغة البند" : "إضافة قانون / بند جديد"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsClauseModalOpen(false)}
                className="admin-btn-secondary p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>القسم التابع له</label>
                <select
                  value={editingClause.targetDoc}
                  onChange={(e) =>
                    setEditingClause({
                      ...editingClause,
                      targetDoc: e.target.value as LegalDocTarget,
                    })
                  }
                  className={inputClass}
                >
                  <option value="terms">شروط الاستخدام (Terms)</option>
                  <option value="privacy">سياسة الخصوصية (Privacy)</option>
                  <option value="gdpr">بوابة الـ GDPR (GDPR)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>شارة البند (Badge)</label>
                <input
                  type="text"
                  value={editingClause.badge}
                  onChange={(e) => setEditingClause({ ...editingClause, badge: e.target.value })}
                  placeholder="مثال: لوائح الطيران"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>الترتيب في العرض (#)</label>
                <input
                  type="number"
                  value={editingClause.order}
                  onChange={(e) =>
                    setEditingClause({ ...editingClause, order: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Arabic Fields */}
            <div className="space-y-3 p-4 rounded-2xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
              <label className={labelClass}>العنوان بالعربية (إلزامي)</label>
              <input
                type="text"
                value={editingClause.titleAr}
                onChange={(e) => setEditingClause({ ...editingClause, titleAr: e.target.value })}
                className={inputClass}
              />

              <label className={labelClass}>المحتوى والنص القانوني بالعربية (إلزامي)</label>
              <textarea
                rows={3}
                value={editingClause.contentAr}
                onChange={(e) => setEditingClause({ ...editingClause, contentAr: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* English Fields */}
            <div className="space-y-3 p-4 rounded-2xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
              <label className={labelClass}>English Title (العنوان بالإنجليزية)</label>
              <input
                type="text"
                value={editingClause.titleEn}
                onChange={(e) => setEditingClause({ ...editingClause, titleEn: e.target.value })}
                className={inputClass}
                dir="ltr"
              />

              <label className={labelClass}>English Content (المحتوى بالإنجليزية)</label>
              <textarea
                rows={3}
                value={editingClause.contentEn}
                onChange={(e) => setEditingClause({ ...editingClause, contentEn: e.target.value })}
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Turkish & French Fields in Collapsible Section */}
            <details className="p-4 rounded-2xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
              <summary className="text-xs font-bold text-[color:var(--admin-gold)] cursor-pointer">
                + إدخال النصوص باللغتين التركية والفرنسية (TÜRSAB & French)
              </summary>
              <div className="space-y-4 pt-4">
                <div>
                  <label className={labelClass}>Türkçe Başlık (التركي)</label>
                  <input
                    type="text"
                    value={editingClause.titleTr}
                    onChange={(e) => setEditingClause({ ...editingClause, titleTr: e.target.value })}
                    className={inputClass}
                    dir="ltr"
                  />
                  <label className={`${labelClass} mt-2`}>Türkçe İçerik</label>
                  <textarea
                    rows={2}
                    value={editingClause.contentTr}
                    onChange={(e) => setEditingClause({ ...editingClause, contentTr: e.target.value })}
                    className={inputClass}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={labelClass}>Titre en Français (الفرنسي)</label>
                  <input
                    type="text"
                    value={editingClause.titleFr}
                    onChange={(e) => setEditingClause({ ...editingClause, titleFr: e.target.value })}
                    className={inputClass}
                    dir="ltr"
                  />
                  <label className={`${labelClass} mt-2`}>Contenu en Français</label>
                  <textarea
                    rows={2}
                    value={editingClause.contentFr}
                    onChange={(e) => setEditingClause({ ...editingClause, contentFr: e.target.value })}
                    className={inputClass}
                    dir="ltr"
                  />
                </div>
              </div>
            </details>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClauseModalOpen(false)}
                className="admin-btn-secondary text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveClauseModal}
                disabled={saving}
                className="admin-btn-primary text-xs sm:text-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>حفظ ونشر فوراً على الموقع الحي</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* ========================================================================= */}
      {/* 6. SET RETENTION DAYS MODAL                                               */}
      {/* ========================================================================= */}
      {retentionModalReq ? (
        <Dialog open={Boolean(retentionModalReq)} onOpenChange={(open) => { if (!open) setRetentionModalReq(null); }}>
          <DialogContent className="sm:max-w-md space-y-4">
            <h3 className="text-base font-black text-[color:var(--admin-text-primary)] flex items-center gap-2">
              <Clock className="h-5 w-5 text-[color:var(--admin-gold)]" />
              <span>تحديد فترة الإبقاء لبيانات العميل</span>
            </h3>
            <p className="text-xs text-[color:var(--admin-text-muted)]">
              تحديد عدد الأيام المسموح خلالها بإبقاء بيانات العميل ({retentionModalReq.email}) في حالة تجميد مشفرة قبل المسح النهائي.
            </p>

            <div>
              <label className={labelClass}>فترة الإبقاء (بالأيام)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={customRetentionDays}
                onChange={(e) => setCustomRetentionDays(Number(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>ملاحظات الإدارة (اختياري)</label>
              <textarea
                rows={2}
                value={retentionNotes}
                onChange={(e) => setRetentionNotes(e.target.value)}
                placeholder="مثال: بناءً على طلب العميل في التذكرة #104"
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRetentionModalReq(null)}
                className="admin-btn-secondary text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSetRetention}
                disabled={saving}
                className="admin-btn-primary text-xs disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "تطبيق الفترة"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
