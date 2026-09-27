"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Check,
  Copy,
  Trash2,
  Minimize2,
  Maximize2,
  Loader2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageSquare,
  History,
  Download,
  Plus,
  X,
  Radio,
  Layers,
  Zap,
  Terminal,
  Cpu,
  CheckCircle2,
  Search,
  Database,
  ArrowRight,
} from "lucide-react";
import ExecutiveReportRenderer from "./ExecutiveReportRenderer";

export interface ChatAction {
  id: string;
  label: string;
  url?: string;
  prompt?: string;
  variant?: "primary" | "secondary" | "outline";
}

export interface AgentStageInfo {
  agentName?: string;
  stageName?: string;
  status?: "completed" | "in_progress" | "idle";
}

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
  agentStage?: AgentStageInfo;
  executionSteps?: ToolExecutionStep[];
  actions?: ChatAction[];
  suggestedPrompts?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const SESSIONS_STORAGE_KEY = "lonaliza_admin_copilot_sessions_v5";
const ACTIVE_SESSION_STORAGE_KEY = "lonaliza_admin_copilot_active_id_v5";

function createInitialMessage(live?: { posts?: number; mcp?: number; pocketbase?: boolean; bookings?: number }): ChatMessage {
  const posts = live?.posts;
  const mcp = live?.mcp;
  const bookings = live?.bookings;
  const pb = live?.pocketbase;
  const postsLine =
    typeof posts === "number"
      ? `• المدونة: ${posts} مقالاً فعلياً من مخزن النظام.`
      : "• المدونة: جاري قراءة العدد الفعلي من المخزن…";
  const mcpLine =
    typeof mcp === "number" ? `• خوادم MCP المدمجة: ${mcp}.` : "• خوادم MCP: تُحسب من الكتالوج عند التحميل.";
  const bookLine =
    typeof bookings === "number"
      ? `• الحجوزات: ${bookings} من لوحة التحكم${pb === false ? " (PocketBase غير متصل)" : ""}.`
      : "• الحجوزات: تُقرأ من لوحة التحكم الحية.";
  return {
    id: "welcome",
    role: "model",
    text: `مرحباً بك سعادة المدير العام. أنا المشرف العام والمنسق التنفيذي لمنصة لوناليزا، وأعتمد فقط على بيانات النظام الحية.\n\n${postsLine}\n${mcpLine}\n${bookLine}\n• خلية الوكلاء في غرفة العمليات مربوطة بنفس مصادر البيانات — بلا أرقام مخترعة.\n\nكيف تأمرني بدعمكم الآن؟`,
    timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    agentStage: {
      agentName: "المشرف التنفيذي لمنصة لوناليزا",
      stageName: typeof posts === "number" ? `قراءة حية: ${posts} مقالاً` : "بانتظار مؤشرات النظام الحية",
      status: "completed",
    },
    executionSteps: [
      {
        id: "init_step_1",
        stepNumber: 1,
        toolName: "مخازن المنصة وPocketBase",
        targetAgent: "وكيل قواعد البيانات",
        actionType: "db_query",
        status: "completed",
        descriptionAr: typeof posts === "number" ? `عُدّت ${posts} مقالة من المخزن الفعلي` : "جاري عد المقالات من المخزن",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        details: bookLine,
      },
      {
        id: "init_step_2",
        stepNumber: 2,
        toolName: "بوابة MCP وخلية الوكلاء",
        targetAgent: "منسق الخلية",
        actionType: "mcp_call",
        status: "completed",
        descriptionAr: mcpLine,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        details: "الأرقام أدناه تُحدَّث من GET غرفة العمليات عند فتح اللوحة.",
      },
    ],
    actions: [
      {
        id: "view_blog",
        label: typeof posts === "number" ? `إدارة المدونة (${posts} مقالاً) ↗` : "إدارة المدونة ↗",
        url: "/admin/blog",
        variant: "primary",
      },
      {
        id: "war_room",
        label: "غرفة عمليات الوكلاء (War Room) ⚡",
        url: "/admin/agent-war-room",
        variant: "secondary",
      },
    ],
    suggestedPrompts: [
      "ابحث في النت وجوجل تريندز عن أحدث مواضيع سياحة تركيا 2027",
      "وجه أمراً فورياً لوكيل المبيعات ووكيل المحتوى في غرفة العمليات",
      "ما هي أدوات MCP المتاحة للمشرف العام في المنصة؟",
    ],
  };
}

export default function AdminExecutiveCopilot({ previewMode = false }: { previewMode?: boolean } = {}) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentStage, setCurrentStage] = useState<AgentStageInfo | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [liveRadarStep, setLiveRadarStep] = useState(0);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [liveStats, setLiveStats] = useState<{ posts: number; mcp: number; bookings: number; pocketbase: boolean } | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Cycle live execution radar steps when loading
  useEffect(() => {
    if (!loading) {
      setLiveRadarStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLiveRadarStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [loading]);

  const toggleSteps = (msgId: string) => {
    setExpandedSteps((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Initialize and load sessions (strictly disabled in previewMode to protect user privacy)
  useEffect(() => {
    if (previewMode) {
      const demoMessages: ChatMessage[] = [
        createInitialMessage(),
        {
          id: "demo_user_1",
          role: "user",
          text: "حلل أداء مبيعات محركات الحجز اليوم وقدم توصية تنفيذية لزيادة أرباح الوكالة.",
          timestamp: "10:30 ص",
        },
        {
          id: "demo_copilot_1",
          role: "model",
          text: "مرحباً بك. إجمالي مبيعات اليوم عبر محركات الطيران والفنادق بلغ $18,450 بنسبة نمو 24% مقارنة بالأسبوع الماضي. صافي هامش ربح الوكالة المحصل: $2,214.\n\nالتوصيات التنفيذية المقترحة:\n1. إطلاق حملة استعادة آلية عبر بوابة واتساب لـ 12 حجزاً غير مكتمل بنسبة نجاح متوقعة 35%.\n2. رفع هامش أرباح رحلات عطلة نهاية الأسبوع المتجهة إلى أنطاليا ودبي بنسبة 3% إضافية لمواكبة الطلب العالي.\n3. تم تجهيز بطاقة اعتماد النشر في تيليجرام بنقرة واحدة.",
          timestamp: "10:31 ص",
        },
      ];
      setMessages(demoMessages);
      return;
    }

    try {
      const savedSessionsRaw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);

      if (savedSessionsRaw) {
        const parsed: ChatSession[] = JSON.parse(savedSessionsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const active = parsed.find((s) => s.id === savedActiveId) || parsed[0];
          setActiveSessionId(active.id);
          setMessages(active.messages || []);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load saved chat sessions:", e);
    }

    // Default fresh session
    const initialSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: "جلسة إدارية جديدة",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [createInitialMessage()],
    };
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
    setMessages(initialSession.messages);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([initialSession]));
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, initialSession.id);
    } catch {}
  }, []);

  useEffect(() => {
    if (previewMode) return;
    void fetch("/api/admin/automation/agent-war-room", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { ok?: boolean; platform?: { catalog?: { posts?: number; mcpServers?: number; bookings?: number; pocketbase?: boolean } } }) => {
        const c = data.platform?.catalog;
        if (!c) return;
        const live = {
          posts: c.posts || 0,
          mcp: c.mcpServers || 0,
          bookings: c.bookings || 0,
          pocketbase: Boolean(c.pocketbase),
        };
        setLiveStats(live);
        setMessages((prev) => {
          if (prev.length === 1 && prev[0]?.id === "welcome") {
            return [createInitialMessage(live)];
          }
          return prev;
        });
      })
      .catch(() => {});
  }, [previewMode]);

  // Save changes to localStorage whenever messages or active session changes
  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return;

    setSessions((prevSessions) => {
      const updated = prevSessions.map((s) => {
        if (s.id === activeSessionId) {
          let title = s.title;
          const firstUserMsg = messages.find((m) => m.role === "user");
          if (firstUserMsg && (s.title === "جلسة إدارية جديدة" || !s.title)) {
            title = firstUserMsg.text.slice(0, 35) + (firstUserMsg.text.length > 35 ? "..." : "");
          }
          return {
            ...s,
            title,
            updatedAt: new Date().toISOString(),
            messages,
          };
        }
        return s;
      });

      if (!previewMode) {
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
          localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, activeSessionId);
        } catch {}
      }
      return updated;
    });
  }, [messages, activeSessionId, previewMode]);

  // Smoothly scroll only the chat internal container
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, liveRadarStep]);

  // Listen for handover events
  useEffect(() => {
    const handleHandover = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>;
      if (customEvent.detail?.prompt) {
        setCollapsed(false);
        sendMessage(customEvent.detail.prompt);
      }
    };
    window.addEventListener("lonaliza:admin-agent-chat", handleHandover as EventListener);
    return () =>
      window.removeEventListener("lonaliza:admin-agent-chat", handleHandover as EventListener);
  }, []);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: "جلسة إدارية جديدة",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [createInitialMessage(liveStats || undefined)],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    setShowHistoryModal(false);

    try {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, newSession.id);
    } catch {}
  };

  const switchSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;
    setActiveSessionId(target.id);
    setMessages(target.messages || []);
    setShowHistoryModal(false);
    try {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, target.id);
    } catch {}
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      createNewSession();
      return;
    }
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      const nextActive = filtered[0];
      setActiveSessionId(nextActive.id);
      setMessages(nextActive.messages || []);
    }
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}
  };

  const exportSessionMarkdown = (session: ChatSession, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let md = `# محضر محادثة المشرف العام التنفيذي - منصة لوناليزا (Lonaliza Executive Transcript)\n\n`;
    md += `* **عنوان الجلسة:** ${session.title}\n`;
    md += `* **معرّف الجلسة:** \`${session.id}\`\n`;
    md += `* **تاريخ الإنشاء:** ${new Date(session.createdAt).toLocaleString("ar-EG")}\n`;
    md += `* **عدد الرسائل:** ${session.messages.length}\n\n`;
    md += `---\n\n`;

    for (const msg of session.messages) {
      const sender = msg.role === "user" ? "👤 سعادة المدير العام" : "🤖 المشرف العام التنفيذي";
      md += `### ${sender} [${msg.timestamp}]\n\n`;
      if (msg.agentStage) {
        md += `> 📍 **المرحلة:** ${msg.agentStage.stageName} (${msg.agentStage.agentName})\n\n`;
      }
      if (msg.executionSteps && msg.executionSteps.length > 0) {
        md += `**العمليات والأدوات المنفذة حياً:**\n`;
        for (const step of msg.executionSteps) {
          md += `- **خطوة ${step.stepNumber}:** [${step.toolName}] → ${step.descriptionAr} (${step.timestamp})\n`;
          if (step.details) md += `  * التفاصيل: ${step.details}\n`;
        }
        md += `\n`;
      }
      md += `${msg.text}\n\n`;
      if (msg.actions && msg.actions.length > 0) {
        md += `**الإجراءات التنفيذية:**\n`;
        for (const act of msg.actions) {
          md += `- [${act.label}](${act.url || "#"})\n`;
        }
        md += `\n`;
      }
      if (msg.suggestedPrompts && msg.suggestedPrompts.length > 0) {
        md += `*خيارات المتابعة المقترحة:* ${msg.suggestedPrompts.join(" | ")}\n\n`;
      }
      md += `---\n\n`;
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lonaliza-chat-${session.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setPendingPrompt(text);
    setLoading(true);
    setCurrentStage({
      agentName: "المشرف التنفيذي",
      stageName: "جاري استدعاء الأدوات والتواصل مع محركات المنصة...",
      status: "in_progress",
    });

    try {
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/admin/platform-admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historyPayload }),
      });
      const data = await res.json();

      const modelMsg: ChatMessage = {
        id: `model_${Date.now()}`,
        role: "model",
        text: data.reply || data.error || "تمت المعالجة بنجاح يا فندم.",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        agentStage: data.agentStage,
        executionSteps: data.executionSteps || [],
        actions: data.actions || [],
        suggestedPrompts: data.suggestedPrompts || [],
      };

      setMessages((prev) => [...prev, modelMsg]);
      if (data.agentStage) {
        setCurrentStage(data.agentStage);
      }

      // Automatically expand steps if present
      if (modelMsg.executionSteps && modelMsg.executionSteps.length > 0) {
        setExpandedSteps((prev) => ({ ...prev, [modelMsg.id]: true }));
      }

      // If settings changed, trigger live header update!
      if (data.actionTaken === "save_key" || text.includes("احفظ") || text.includes("إعداد")) {
        window.dispatchEvent(new Event("lonaliza:settings-updated"));
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "model",
          text: "تعذر الاتصال بالخادم حالياً، يرجى المحاولة بعد لحظات.",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
      setPendingPrompt("");
    }
  };

  const quickChips = [
    { label: "🔍 ابحث في النت وتريندز 2027", prompt: "ابحث في النت وجوجل تريندز عن أحدث مواضيع سياحة تركيا 2027" },
    { label: "⚡ أمر لخلية الوكلاء (War Room)", prompt: "وجه أمراً فورياً لوكيل المبيعات ووكيل المحتوى في غرفة العمليات" },
    { label: "🛠️ استعراض أدوات MCP", prompt: "ما هي أدوات MCP المتاحة للمشرف العام في المنصة؟" },
    { label: "📚 المقالات والمدونة (34)", prompt: "ما هي حالة المقالات في المنصة الآن وكم عددها؟" },
    { label: "📱 تقرير تيليجرام اللحظي", prompt: "أرسل لي تقريراً إدارياً شاملاً بالجاهزية على تيليجرام الآن." },
  ];

  const liveExecutionStepsDescriptions = useMemo(() => {
    const p = (pendingPrompt || "").toLowerCase();

    if (
      p.includes("برنامج") ||
      p.includes("باقة") ||
      p.includes("رحلة") ||
      p.includes("طربزون") ||
      p.includes("بورصة") ||
      p.includes("سبانجا") ||
      p.includes("كبادوكيا") ||
      p.includes("أنطاليا") ||
      p.includes("انطاليا") ||
      p.includes("يالوفا") ||
      p.includes("اسطنبول") ||
      p.includes("سياحي")
    ) {
      return [
        {
          title: "تحليل طلب الباقة السياحية ومواءمة المواصفات الفاخرة",
          tool: "Destination & Luxury Preset Router",
          agent: "وكيل البرامج السياحية",
          icon: <Cpu size={14} className='text-secondary' />,
        },
        {
          title: "استدعاء روبوت البحث الميداني وفحص أسعار السوق 2027",
          tool: "DuckDuckGo & MCP Live Web Search",
          agent: "وكيل الاستقصاء الميداني",
          icon: <Search size={14} className="text-cyan-500" />,
        },
        {
          title: "توليف خطة السير اليومية وتجهيز مرسيدس فيتو VIP والفنادق",
          tool: "Dynamic Tour Package Synthesizer",
          agent: "وكيل العمليات والتشغيل",
          icon: <Zap size={14} className="text-primary" />,
        },
        {
          title: "الحفظ الفعلي في .data/published-packages.json وتفعيل الرابط الحي",
          tool: "packages-store Physical DB Writer",
          agent: "قاعدة البيانات المركزية",
          icon: <CheckCircle2 size={14} className='text-secondary' />,
        },
      ];
    }

    if (p.includes("مقال") || p.includes("مدون") || p.includes("سيو") || p.includes("تدوين")) {
      return [
        {
          title: "تحليل موضوع المقال وهيكلة العناوين ومعايير السيو H2/H3",
          tool: "liotrip-blog Content Spec & SEO Engine",
          agent: "وكيل المحتوى والسيو",
          icon: <BookOpen size={14} className='text-secondary' />,
        },
        {
          title: "الاستعلام الميداني وجلب حقائق وأسعار الوجهة عبر الويب المباشر",
          tool: "DuckDuckGo Live Search MCP",
          agent: "وكيل أبحاث المحتوى",
          icon: <Search size={14} className="text-cyan-500" />,
        },
        {
          title: "توليد جدول أسعار 2027 بالدولار وصياغة محتوى المقال الفاخر",
          tool: "Dynamic Article HTML Synthesizer",
          agent: "وكيل التحرير السياحي",
          icon: <Zap size={14} className="text-primary" />,
        },
        {
          title: "النشر الفعلي في PocketBase وبث تكليف التسويق لـ War Room",
          tool: "PocketBase Admin SDK & Swarm War Room",
          agent: "غرفة عمليات الوكلاء",
          icon: <CheckCircle2 size={14} className='text-secondary' />,
        },
      ];
    }

    if (
      p.includes("سعر") ||
      p.includes("اسعار") ||
      p.includes("منافس") ||
      p.includes("بحث") ||
      p.includes("نت") ||
      p.includes("جوجل")
    ) {
      return [
        {
          title: "توجيه روبوت الاستكشاف للويب وفحص مؤشرات السوق التركي",
          tool: "DuckDuckGo Live Scraping MCP",
          agent: "وكيل الاستخبارات التنافسية",
          icon: <Search size={14} className="text-cyan-500" />,
        },
        {
          title: "استخراج أسعار وكالات السفر والسيارات الفارهة لموسم 2026/2027",
          tool: "Market Pricing Extraction Matrix",
          agent: "محلل السوق والتسعير",
          icon: <Database size={14} className='text-secondary' />,
        },
        {
          title: "مقارنة الأسعار مع تكلفة لوناليزا وتحديد الميزة التنافسية",
          tool: "Competitive Benchmark Engine",
          agent: "مستشار التسعير الاستراتيجي",
          icon: <Layers size={14} className="text-primary" />,
        },
        {
          title: "صياغة التقرير الإداري المفصل وجداول المقارنة بالدولار",
          tool: "Executive Intelligence Synthesizer",
          agent: "المشرف العام التنفيذي",
          icon: <CheckCircle2 size={14} className='text-secondary' />,
        },
      ];
    }

    if (
      p.includes("سوشيال") ||
      p.includes("نوستر") ||
      p.includes("ريلز") ||
      p.includes("ريلاي") ||
      p.includes("نقاط") ||
      p.includes("محفظ")
    ) {
      return [
        {
          title: "فحص الاتصال اللحظي بخوادم ريلايز النوستر اللامركزية",
          tool: "Nostr Multi-Relay Ping Engine",
          agent: "وكيل البروتوكولات اللامركزية",
          icon: <Radio size={14} className="text-cyan-500" />,
        },
        {
          title: "التحقق من جاهزية سيرفرات Blossom BUD-01 وبث الفيديو",
          tool: "Blossom Media Server Gateway",
          agent: "مشرف البنية التحتية",
          icon: <Database size={14} className='text-secondary' />,
        },
        {
          title: "تدقيق الفلتر السياحي الصارم 100% ورصيد نقاط التفاعل",
          tool: "Nostr Strict Tourism Filter & Points Ledger",
          agent: "وكيل مجتمع السوشيال",
          icon: <Zap size={14} className="text-primary" />,
        },
        {
          title: "اعتماد مؤشرات التفاعل وصياغة تقرير القسم 19 المكتمل",
          tool: "Social & Community Executive Core",
          agent: "المشرف العام التنفيذي",
          icon: <CheckCircle2 size={14} className='text-secondary' />,
        },
      ];
    }

    // Default general / audit steps
    return [
      {
        title: "تحليل الأمر التنفيذي وتحديد الأدوات والوكلاء المعنيين",
        tool: "Executive AI Reasoner",
        agent: "المشرف العام التنفيذي",
        icon: <Cpu size={14} className='text-secondary' />,
      },
      {
        title: "استدعاء بروتوكول MCP وخوادم البحث وقاعدة البيانات PocketBase",
        tool: "MCP Tool Calling Gateway",
        agent: "بوابة الأدوات المدمجة",
        icon: <Terminal size={14} className="text-cyan-500" />,
      },
      {
        title: "بث التوجيهات وتوزيع المهام اللحظية في غرفة العمليات War Room",
        tool: "Swarm Orchestrator Engine",
        agent: "خلية الوكلاء (المبيعات، المحتوى، الموقع)",
        icon: <Zap size={14} className="text-primary" />,
      },
      {
        title: "مزامنة النتائج والبيانات المؤكدة وصياغة القرار الإداري النهائي",
        tool: "Executive Synthesis Core",
        agent: "المشرف العام التنفيذي",
        icon: <CheckCircle2 size={14} className='text-secondary' />,
      },
    ];
  }, [pendingPrompt]);

  return (
    <div
      className='relative w-full rounded-2xl border border-border/90 dark:border-border bg-card dark:bg-background shadow-xl shadow-slate-900/5 overflow-hidden text-right transition-all'
      dir="rtl"
    >
      {/* Executive Command Header - Fully Harmonized for Light and Dark Modes */}
      <div className='flex items-center justify-between bg-card dark:bg-background px-5 py-4 border-b border-border dark:border-border'>
        <div className="flex items-center gap-3.5">
          <div className='relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25'>
            <Bot size={22} className='stroke-[2.2] text-primary-foreground' />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className='text-sm font-black tracking-wide text-foreground dark:text-foreground'>
                المشرف العام الذكي لمنصة لوناليزا (Executive Co-Pilot & Swarm Gateway)
              </h2>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-admin-bg-subtle dark:bg-primary/60 border border-border dark:border-admin-btn-primary-hover px-2.5 py-0.5 text-[11px] font-bold text-admin-btn-primary-hover dark:text-secondary'>
                <span className='h-1.5 w-1.5 rounded-full bg-secondary'></span>
                بث العمليات الحية نشط
              </span>
            </div>
            <p className='text-[11px] text-muted-foreground dark:text-muted-foreground font-medium mt-0.5'>
              {liveStats
                ? `متصل بـ ${liveStats.mcp} خادم MCP، ${liveStats.posts} مقالاً فعلياً، ${liveStats.bookings} حجزاً${liveStats.pocketbase ? "" : " (PocketBase غير متصل)"}`
                : "يتصل بمصادر النظام الحية — بدون أرقام ثابتة"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* History & Sessions Drawer Button */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className='inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold bg-card-2 hover:bg-slate-200 dark:bg-card dark:hover:bg-slate-700 text-foreground dark:text-slate-200 border border-border dark:border-slate-700 transition-colors shadow-2xs'
            title="سجل المحادثات السابقة والحالية"
          >
            <History size={13} className='text-primary dark:text-secondary' />
            <span>المحادثات ({sessions.length})</span>
          </button>

          {/* Quick New Session Button */}
          <button
            type="button"
            onClick={createNewSession}
            className='inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold bg-card dark:bg-card hover:bg-card-2 dark:hover:bg-slate-700 text-foreground dark:text-foreground border-2 border-border dark:border-slate-700 transition-colors shadow-xs'
            title="بدء جلسة جديدة وأرشفة الحالية"
          >
            <Plus size={13} className='text-primary dark:text-secondary' />
            <span className='hidden sm:inline font-black text-foreground dark:text-foreground'>جلسة جديدة</span>
          </button>

          {/* Export Current Session */}
          <button
            type="button"
            onClick={() => {
              const current = sessions.find((s) => s.id === activeSessionId) || {
                id: activeSessionId,
                title: "جلسة حالية",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messages,
              };
              exportSessionMarkdown(current);
            }}
            className='inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold bg-card dark:bg-card hover:bg-card-2 dark:hover:bg-slate-700 text-foreground dark:text-foreground border-2 border-border dark:border-slate-700 transition-colors shadow-xs'
            title="تصدير المحادثة الحالية كملف Markdown (.md)"
          >
            <Download size={13} className='text-foreground dark:text-slate-300' />
            <span className='hidden md:inline font-black text-foreground dark:text-foreground'>تصدير .md</span>
          </button>

          {/* Minimize / Maximize */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className='rounded-xl p-1.5 bg-card-2 hover:bg-slate-200 dark:bg-card dark:hover:bg-slate-700 text-muted-foreground dark:text-slate-300 border border-border dark:border-slate-700 transition-colors shadow-2xs'
            title={collapsed ? "توسيع الشات" : "طي الشات"}
          >
            {collapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Quick Action Chips Bar */}
          <div className='flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-card-2/80 dark:bg-background/50 border-b border-border/80 dark:border-border scrollbar-none'>
            <span className='text-[11px] font-bold text-muted-foreground dark:text-muted-foreground shrink-0 flex items-center gap-1'>
              <Sparkles size={13} className='text-primary dark:text-secondary' />
              أوامر تنفيذية سريعة:
            </span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  sendMessage(chip.prompt);
                }}
                className='shrink-0 inline-flex items-center gap-1 rounded-xl border border-border dark:border-slate-700 bg-card dark:bg-card hover:bg-admin-bg-subtle/80 dark:hover:bg-primary/40 hover:border-border dark:hover:border-primary hover:text-admin-btn-primary-hover dark:text-slate-200 dark:hover:text-secondary px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs transition-all disabled:opacity-50'
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body - Fixed Internal Scroll Container */}
          <div
            ref={messagesContainerRef}
            className='max-h-[460px] min-h-[280px] overflow-y-auto p-4 space-y-4 text-xs bg-card-2/50 dark:bg-background/40'
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border border-border text-foreground"
                  }`}
                >
                  {m.role === "user" ? "أنت" : <Bot size={17} />}
                </div>

                {/* Bubble Container */}
                <div className="max-w-[88%] space-y-2">
                  {/* Live Stage Badge if present in message */}
                  {m.agentStage && m.role === "model" && (
                    <div className='flex items-center gap-2 px-3 py-1.5 rounded-xl bg-admin-bg-subtle/90 dark:bg-primary/40 border border-border dark:border-admin-btn-primary-hover/80 text-[11px] text-admin-btn-primary-hover dark:text-muted-foreground w-fit shadow-2xs'>
                      <span className="relative flex h-2 w-2">
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75'></span>
                        <span className='relative inline-flex rounded-full h-2 w-2 bg-secondary'></span>
                      </span>
                      <span className='font-black text-admin-btn-primary-bg dark:text-secondary'>
                        {m.agentStage.agentName || "المشرف التنفيذي"}:
                      </span>
                      <span className="font-medium">{m.agentStage.stageName}</span>
                    </div>
                  )}

                  {m.role === "user" ? (
                    <div className="rounded-2xl px-4 py-3 shadow-sm bg-primary text-primary-foreground rounded-tr-none text-xs leading-relaxed font-normal whitespace-pre-wrap">
                      {m.text}
                      <div className="mt-1.5 pt-1 border-t border-primary-foreground/20 text-[10px] text-primary-foreground/70" dir="ltr">
                        {m.timestamp}
                      </div>
                    </div>
                  ) : (
                    <ExecutiveReportRenderer
                      content={m.text}
                      executionSteps={m.executionSteps}
                      actions={m.actions}
                      suggestedPrompts={m.suggestedPrompts}
                      isExpandedSteps={Boolean(expandedSteps[m.id])}
                      onToggleSteps={() => toggleSteps(m.id)}
                      onSendPrompt={(p) => sendMessage(p)}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* LIVE OPERATIONAL REASONING BEACON WHILE LOADING */}
            {loading && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-primary/30 shadow-sm text-xs max-w-lg animate-pulse text-right">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-black text-foreground text-xs flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    المشرف العام يفكر ويستدعي أدوات النظام حياً...
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    جاري فحص قواعد البيانات والاستعلام عبر نموذج Gemini 3.6 Flash التوليدي
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className='flex items-center gap-2 p-3.5 border-t border-border dark:border-border bg-card dark:bg-background'
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اطلب أي إعداد، اسأل عن المقالات وقواعد البيانات، أو أصدر أمراً تنفيذياً..."
              disabled={loading}
              className='flex-1 rounded-xl border border-border dark:border-slate-700 bg-card-2 dark:bg-background px-4 py-2.5 text-xs text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:bg-card dark:focus:bg-background focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-admin-accent/20 focus:outline-none transition-all'
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className='inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-all disabled:opacity-40 active:scale-95'
            >
              <Send size={13} />
              <span>إرسال</span>
            </button>
          </form>
        </>
      )}

      {/* Sessions History Drawer / Modal */}
      {showHistoryModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-xs p-4'>
          <div className='relative w-full max-w-xl bg-card dark:bg-background rounded-2xl shadow-2xl border border-border dark:border-border overflow-hidden text-right flex flex-col max-h-[85vh]'>
            {/* Modal Header */}
            <div className='flex items-center justify-between px-5 py-4 border-b border-border dark:border-border bg-card-2/70 dark:bg-background/60'>
              <div className="flex items-center gap-2.5">
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-admin-bg-subtle dark:bg-primary text-primary dark:text-secondary'>
                  <History size={18} />
                </div>
                <div>
                  <h3 className='text-sm font-bold text-foreground dark:text-foreground'>
                    سجل المحادثات التنفيذية
                  </h3>
                  <p className='text-[11px] text-muted-foreground dark:text-muted-foreground'>
                    استعرض أو استرجع أو صدّر أي محادثة سابقة مع المشرف العام كملف Markdown
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className='p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-slate-200 hover:bg-card-2 dark:hover:bg-card transition-colors'
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Actions Bar */}
            <div className='flex items-center justify-between px-5 py-3 border-b border-border/80 dark:border-border bg-card dark:bg-background'>
              <span className='text-xs text-muted-foreground dark:text-muted-foreground'>
                إجمالي المحادثات المسجلة: <strong className='text-primary dark:text-secondary'>{sessions.length}</strong>
              </span>
              <button
                type="button"
                onClick={createNewSession}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs'
              >
                <Plus size={14} />
                <span>بدء محادثة جديدة</span>
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => switchSession(sess.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-admin-bg-subtle/70 dark:bg-primary/30 border-border dark:border-admin-btn-primary-hover shadow-2xs"
                        : "bg-muted/60 dark:bg-card/40 border-border dark:border-border hover:bg-muted/80 dark:hover:bg-card/70"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isActive
                            ? "bg-gradient-to-tr from-admin-btn-primary-bg to-admin-btn-primary-hover text-foreground"
                            : "bg-slate-200 dark:bg-slate-700 text-foreground dark:text-slate-300"
                        }`}
                      >
                        <MessageSquare size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className='text-xs font-bold text-foreground dark:text-slate-200 truncate'>
                            {sess.title || "محادثة إدارية"}
                          </h4>
                          {isActive && (
                            <span className='shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-admin-btn-primary-bg to-admin-btn-primary-hover text-secondary border border-primary/50'>
                              نشطة حالياً
                            </span>
                          )}
                        </div>
                        <p className='text-[10px] text-muted-foreground dark:text-muted-foreground mt-1 flex items-center gap-2'>
                          <span>{new Date(sess.updatedAt).toLocaleDateString("ar-EG")}</span>
                          <span>•</span>
                          <span>{sess.messages.length} رسالة</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 mr-2">
                      <button
                        type="button"
                        onClick={(e) => exportSessionMarkdown(sess, e)}
                        className='p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-admin-bg-subtle dark:hover:bg-primary/50 transition-colors'
                        title="تصدير كملف Markdown (.md)"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => deleteSession(sess.id, e)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="حذف هذه المحادثة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
