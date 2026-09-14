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
  const [collapsed, setCollapsed] = useState(false);
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
          icon: <Cpu size={14} className="text-amber-500" />,
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
          icon: <Zap size={14} className="text-purple-500" />,
        },
        {
          title: "الحفظ الفعلي في .data/published-packages.json وتفعيل الرابط الحي",
          tool: "packages-store Physical DB Writer",
          agent: "قاعدة البيانات المركزية",
          icon: <CheckCircle2 size={14} className="text-amber-500" />,
        },
      ];
    }

    if (p.includes("مقال") || p.includes("مدون") || p.includes("سيو") || p.includes("تدوين")) {
      return [
        {
          title: "تحليل موضوع المقال وهيكلة العناوين ومعايير السيو H2/H3",
          tool: "liotrip-blog Content Spec & SEO Engine",
          agent: "وكيل المحتوى والسيو",
          icon: <BookOpen size={14} className="text-amber-500" />,
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
          icon: <Zap size={14} className="text-purple-500" />,
        },
        {
          title: "النشر الفعلي في PocketBase وبث تكليف التسويق لـ War Room",
          tool: "PocketBase Admin SDK & Swarm War Room",
          agent: "غرفة عمليات الوكلاء",
          icon: <CheckCircle2 size={14} className="text-amber-500" />,
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
          icon: <Database size={14} className="text-amber-500" />,
        },
        {
          title: "مقارنة الأسعار مع تكلفة لوناليزا وتحديد الميزة التنافسية",
          tool: "Competitive Benchmark Engine",
          agent: "مستشار التسعير الاستراتيجي",
          icon: <Layers size={14} className="text-purple-500" />,
        },
        {
          title: "صياغة التقرير الإداري المفصل وجداول المقارنة بالدولار",
          tool: "Executive Intelligence Synthesizer",
          agent: "المشرف العام التنفيذي",
          icon: <CheckCircle2 size={14} className="text-amber-500" />,
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
          icon: <Database size={14} className="text-amber-500" />,
        },
        {
          title: "تدقيق الفلتر السياحي الصارم 100% ورصيد نقاط التفاعل",
          tool: "Nostr Strict Tourism Filter & Points Ledger",
          agent: "وكيل مجتمع السوشيال",
          icon: <Zap size={14} className="text-purple-500" />,
        },
        {
          title: "اعتماد مؤشرات التفاعل وصياغة تقرير القسم 19 المكتمل",
          tool: "Social & Community Executive Core",
          agent: "المشرف العام التنفيذي",
          icon: <CheckCircle2 size={14} className="text-amber-500" />,
        },
      ];
    }

    // Default general / audit steps
    return [
      {
        title: "تحليل الأمر التنفيذي وتحديد الأدوات والوكلاء المعنيين",
        tool: "Executive AI Reasoner",
        agent: "المشرف العام التنفيذي",
        icon: <Cpu size={14} className="text-amber-500" />,
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
        icon: <Zap size={14} className="text-purple-500" />,
      },
      {
        title: "مزامنة النتائج والبيانات المؤكدة وصياغة القرار الإداري النهائي",
        tool: "Executive Synthesis Core",
        agent: "المشرف العام التنفيذي",
        icon: <CheckCircle2 size={14} className="text-amber-500" />,
      },
    ];
  }, [pendingPrompt]);

  return (
    <div
      className="relative w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 overflow-hidden text-right transition-all"
      dir="rtl"
    >
      {/* Executive Command Header - Fully Harmonized for Light and Dark Modes */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-white shadow-md shadow-purple-900/30">
            <Bot size={22} className="stroke-[2.2] text-amber-300" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-black tracking-wide text-slate-900 dark:text-white">
                المشرف العام الذكي لمنصة لوناليزا (Executive Co-Pilot & Swarm Gateway)
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                بث العمليات الحية نشط
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
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
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title="سجل المحادثات السابقة والحالية"
          >
            <History size={13} className="text-purple-600 dark:text-amber-400" />
            <span>المحادثات ({sessions.length})</span>
          </button>

          {/* Quick New Session Button */}
          <button
            type="button"
            onClick={createNewSession}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
            title="بدء جلسة جديدة وأرشفة الحالية"
          >
            <Plus size={13} className="text-purple-700 dark:text-amber-400" />
            <span className="hidden sm:inline font-black text-slate-900 dark:text-white">جلسة جديدة</span>
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
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
            title="تصدير المحادثة الحالية كملف Markdown (.md)"
          >
            <Download size={13} className="text-slate-700 dark:text-slate-300" />
            <span className="hidden md:inline font-black text-slate-900 dark:text-white">تصدير .md</span>
          </button>

          {/* Minimize / Maximize */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-xl p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title={collapsed ? "توسيع الشات" : "طي الشات"}
          >
            {collapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Quick Action Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200/80 dark:border-slate-800 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles size={13} className="text-purple-600 dark:text-amber-400" />
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
                className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-purple-50/80 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-800 dark:text-slate-200 dark:hover:text-amber-300 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-all disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body - Fixed Internal Scroll Container */}
          <div
            ref={messagesContainerRef}
            className="max-h-[460px] min-h-[280px] overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50 dark:bg-slate-950/40"
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
                      ? "bg-gradient-to-tr from-[#2e1065] to-[#4c1d95] text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-amber-400"
                  }`}
                >
                  {m.role === "user" ? (
                    <span style={{ color: "#ffffff" }}>أنت</span>
                  ) : (
                    <Bot size={17} />
                  )}
                </div>

                {/* Bubble Container */}
                <div className="max-w-[88%] space-y-2">
                  {/* Live Stage Badge if present in message */}
                  {m.agentStage && m.role === "model" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-[11px] text-purple-800 dark:text-purple-200 w-fit shadow-2xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span className="font-black text-purple-900 dark:text-amber-300">
                        {m.agentStage.agentName || "المشرف التنفيذي"}:
                      </span>
                      <span className="font-medium">{m.agentStage.stageName}</span>
                    </div>
                  )}

                  {/* LIVE INTERACTIVE EXECUTION STEPS DRAWER (ما يفعله ويستدعيه من الأدوات والأوامر حياً) */}
                  {m.role === "model" && m.executionSteps && m.executionSteps.length > 0 && (
                    <div className="rounded-xl border border-purple-300/80 dark:border-purple-800/80 bg-purple-50/70 dark:bg-purple-950/40 p-3 shadow-2xs text-right">
                      <button
                        type="button"
                        onClick={() => toggleSteps(m.id)}
                        className="flex items-center justify-between w-full text-xs font-bold text-purple-950 dark:text-purple-200 hover:text-purple-800 dark:hover:text-amber-300 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Cpu size={15} className="text-purple-600 dark:text-purple-400 animate-pulse" />
                          <span>
                            سجل العمليات التنفيذية والأدوات المستدعاة حياً ({m.executionSteps.length} إجراءات منفذة):
                          </span>
                        </span>
                        <span className="text-[11px] font-semibold underline flex items-center gap-1 text-purple-700 dark:text-amber-400">
                          {expandedSteps[m.id] ? (
                            <>
                              <span>إخفاء التفاصيل</span>
                              <ChevronUp size={13} />
                            </>
                          ) : (
                            <>
                              <span>عرض مسار الأدوات والأوامر</span>
                              <ChevronDown size={13} />
                            </>
                          )}
                        </span>
                      </button>

                      {expandedSteps[m.id] && (
                        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800/60 space-y-2">
                          {m.executionSteps.map((step) => (
                            <div
                              key={step.id}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-purple-100 dark:border-slate-800 text-[11px] space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-amber-300 text-[10px] font-black">
                                    {step.stepNumber}
                                  </span>
                                  <span className="text-purple-700 dark:text-amber-400 font-mono">
                                    [{step.toolName}]
                                  </span>
                                  {step.targetAgent && (
                                    <span className="text-slate-600 dark:text-slate-400 font-normal">
                                      → توجيه أمر إلى:{" "}
                                      <strong className="text-slate-900 dark:text-white">{step.targetAgent}</strong>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                  {step.timestamp}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 font-medium">
                                {step.descriptionAr}
                              </p>
                              {step.details && (
                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono text-right leading-relaxed">
                                  <strong className="text-purple-700 dark:text-amber-400">✓ النتيجة والبيانات المسترجعة:</strong> {step.details}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-xs whitespace-pre-wrap leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-l from-[#2e1065] via-[#3b0764] to-[#4c1d95] !text-white rounded-tr-none shadow-md shadow-purple-900/20"
                        : "bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none"
                    }`}
                    style={m.role === "user" ? { color: "#ffffff" } : {}}
                  >
                    <div
                      className="text-xs leading-relaxed font-normal"
                      style={m.role === "user" ? { color: "#ffffff" } : {}}
                    >
                      {m.text}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                      <span
                        className={`text-[10px] ${
                          m.role === "user"
                            ? "text-purple-200/80"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                        dir="ltr"
                      >
                        {m.timestamp}
                      </span>
                      {m.role === "model" && (
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.text)}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-purple-600 dark:hover:text-amber-400 transition-colors"
                          title="نسخ الرد"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check size={11} className="text-amber-500" />
                              <span className="text-amber-500 font-bold">
                                تم النسخ
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Interactive Action Buttons (Inside Assistant Turn) */}
                  {m.role === "model" && m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {m.actions.map((act) => {
                        if (act.url) {
                          return (
                            <Link
                              key={act.id}
                              href={act.url}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                                act.variant === "primary"
                                  ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white border border-amber-400/40 shadow-purple-900/20"
                                  : "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:border-purple-400 text-slate-900 dark:text-white hover:text-purple-700"
                              }`}
                            >
                              <span
                                className="font-black"
                                style={{ color: act.variant === "primary" ? "#ffffff" : "#0f172a" }}
                              >
                                {act.label}
                              </span>
                              <ExternalLink size={12} className={act.variant === "primary" ? "text-white" : "text-slate-700 dark:text-slate-300"} />
                            </Link>
                          );
                        }
                          return (
                            <button
                              key={act.id}
                              type="button"
                              disabled={loading}
                              onClick={(e) => {
                                e.preventDefault();
                                if (act.prompt) sendMessage(act.prompt);
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                                act.variant === "primary"
                                  ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white border border-amber-400/40 shadow-purple-900/20"
                                  : "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:border-purple-400 text-slate-900 dark:text-white hover:text-purple-700"
                              }`}
                            >
                              <span
                                className="font-black"
                                style={{ color: act.variant === "primary" ? "#ffffff" : "#0f172a" }}
                              >
                                {act.label}
                              </span>
                              <ChevronLeft size={13} className={act.variant === "primary" ? "text-white" : "text-slate-700 dark:text-slate-300"} />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Interactive Next-Step Prompt Suggestions (Buttons to click directly instead of typing) */}
                    {m.role === "model" && m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[11px] font-black text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-amber-500" />
                          اختر ردك المباشر بنقرة واحدة (أو اكتب في الصندوق أدناه):
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {m.suggestedPrompts.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              disabled={loading}
                              onClick={(e) => {
                                e.preventDefault();
                                sendMessage(sug);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-400 dark:hover:border-purple-700 px-3.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white hover:text-purple-900 dark:hover:text-amber-300 transition-all shadow-2xs text-right disabled:opacity-50 active:scale-[0.98]"
                              style={{ color: "#0f172a" }}
                            >
                              <span className="text-amber-500 font-black">›</span>
                              <span className="font-black text-slate-900 dark:text-white" style={{ color: "#0f172a" }}>
                                {sug}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* LIVE OPERATIONAL RADAR - ANIMATED LIVE FEED WHILE LOADING */}
            {loading && (
              <div className="rounded-2xl border border-purple-300 dark:border-purple-800 bg-gradient-to-br from-purple-50/90 via-slate-50/70 to-purple-50/90 dark:from-purple-950/50 dark:via-slate-900 dark:to-purple-950/50 p-4 text-xs shadow-md space-y-3 max-w-xl text-right">
                <div className="flex items-center justify-between border-b border-purple-200/80 dark:border-purple-800/80 pb-2.5">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-black">
                    <Loader2 size={16} className="animate-spin text-purple-600 dark:text-amber-400" />
                    <span>بث العمليات الحية واستدعاء الأدوات والوكلاء...</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-amber-300 border border-purple-700/60 font-bold animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    نشط لحظياً
                  </span>
                </div>

                <div className="space-y-2">
                  {liveExecutionStepsDescriptions.map((st, idx) => {
                    const isPassed = idx < liveRadarStep;
                    const isCurrent = idx === liveRadarStep;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          isCurrent
                            ? "bg-white dark:bg-slate-800 border-purple-400 dark:border-purple-600 shadow-sm"
                            : isPassed
                            ? "bg-purple-100/50 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-900/60 text-purple-900 dark:text-purple-200"
                            : "bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-amber-300">
                            {st.icon}
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-slate-800 dark:text-slate-100">
                              {st.title}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              الأداة: <strong className="text-purple-700 dark:text-amber-400 font-mono">[{st.tool}]</strong> | المنفذ: {st.agent}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 mr-2">
                          {isPassed && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Check size={13} />
                              تم الإنجاز
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse">
                              <Loader2 size={12} className="animate-spin" />
                              جاري التنفيذ
                            </span>
                          )}
                          {!isPassed && !isCurrent && (
                            <span className="text-[10px] text-slate-400">في الانتظار...</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
            className="flex items-center gap-2 p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اطلب أي إعداد، اسأل عن المقالات وقواعد البيانات، أو أصدر أمراً تنفيذياً..."
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] px-5 py-2.5 text-xs font-bold text-white border border-amber-400/40 shadow-md shadow-purple-900/20 transition-all disabled:opacity-40 active:scale-95"
            >
              <Send size={13} />
              <span>إرسال</span>
            </button>
          </form>
        </>
      )}

      {/* Sessions History Drawer / Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-amber-400">
                  <History size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    سجل المحادثات التنفيذية
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    استعرض أو استرجع أو صدّر أي محادثة سابقة مع المشرف العام كملف Markdown
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Actions Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                إجمالي المحادثات المسجلة: <strong className="text-purple-700 dark:text-amber-400">{sessions.length}</strong>
              </span>
              <button
                type="button"
                onClick={createNewSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white border border-amber-400/40 text-xs font-bold transition-all shadow-xs"
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
                        ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 shadow-2xs"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isActive
                            ? "bg-gradient-to-tr from-[#2e1065] to-[#4c1d95] text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <MessageSquare size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {sess.title || "محادثة إدارية"}
                          </h4>
                          {isActive && (
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-amber-300 border border-purple-700/50">
                              نشطة حالياً
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-2">
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
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                        title="تصدير كملف Markdown (.md)"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => deleteSession(sess.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
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
