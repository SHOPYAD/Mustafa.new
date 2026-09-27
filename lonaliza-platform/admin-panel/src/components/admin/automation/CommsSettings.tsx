"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flame,
  Globe,
  Headphones,
  Info,
  Layers,
  Loader2,
  MessageCircle,
  MessageSquare,
  Plane,
  QrCode,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Unlink,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CommsMessage } from "@/lib/automation/comms-message-store";
import type { B2BTrainingConfig, B2CTrainingConfig } from "@/lib/automation/agent-training-store";
import type { RecoveryCandidate } from "@/lib/automation/abandoned-recovery";

const inputClass =
  "w-full px-3.5 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-border-focus/40 text-sm transition-all";
const labelClass = "block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider";
const cardClass = "rounded-2xl border border-border bg-card p-5 shadow-2xl";

type WhatsAppMode = "qr" | "cloud_api";
type MainTab = "whatsapp" | "telegram" | "inbox" | "ai_training" | "automation_rules";

type SettingsState = {
  otpEnabled: boolean;
  otpChannels: string[];
  otpTtlSec: number;
  whatsappMode?: WhatsAppMode;
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  whatsappWabaId: string;
  whatsappVerifyToken: string;
  whatsappGraphVersion: string;
  whatsappOtpTemplate: string;
  whatsappTransactionalTemplate: string;
  whatsappMarketingTemplate: string;
  telegramBotToken: string;
  telegramDefaultChatId: string;
  rateLimitPerMinute: number;
  whatsappReady?: boolean;
  telegramReady?: boolean;
  whatsappPhoneIdInvalid?: boolean;
};

type TestResult = {
  ok: boolean;
  summaryAr: string;
  error?: string;
};

type QrStatus = {
  status: "disconnected" | "connecting" | "qr_ready" | "connected";
  qrCodeUrl: string | null;
  phone: string | null;
  name: string | null;
  updatedAt: string;
  error?: string;
};

type SlotStatus = {
  slotId: number;
  label: string;
  isDefault: boolean;
  aiEnabled: boolean;
  aiTrack: "b2b" | "b2c" | "auto";
  status: "disconnected" | "connecting" | "qr_ready" | "connected";
  qrCodeUrl: string | null;
  phone: string | null;
  name: string | null;
  updatedAt: string;
  error?: string;
};

type ConversationSummary = {
  contact: string;
  channel: "whatsapp" | "telegram";
  track: "b2b" | "b2c" | "general";
  customerName?: string;
  leadScore?: number;
  intent?: string;
  slotId?: number;
  slotLabel?: string;
  lastMessage: CommsMessage;
  totalMessages: number;
};

const defaultSlots: SlotStatus[] = [
  { slotId: 1, label: "الرقم 1 (المبيعات والتسويق)", isDefault: true, aiEnabled: true, aiTrack: "auto", status: "disconnected", qrCodeUrl: null, phone: null, name: null, updatedAt: "" },
  { slotId: 2, label: "الرقم 2 (خدمة عملاء B2C)", isDefault: false, aiEnabled: true, aiTrack: "b2c", status: "disconnected", qrCodeUrl: null, phone: null, name: null, updatedAt: "" },
  { slotId: 3, label: "الرقم 3 (مبيعات B2B SaaS)", isDefault: false, aiEnabled: true, aiTrack: "b2b", status: "disconnected", qrCodeUrl: null, phone: null, name: null, updatedAt: "" },
  { slotId: 4, label: "الرقم 4 (الحجوزات والتذاكر)", isDefault: false, aiEnabled: false, aiTrack: "b2c", status: "disconnected", qrCodeUrl: null, phone: null, name: null, updatedAt: "" },
  { slotId: 5, label: "الرقم 5 (الدعم الفني VIP)", isDefault: false, aiEnabled: false, aiTrack: "auto", status: "disconnected", qrCodeUrl: null, phone: null, name: null, updatedAt: "" },
];

const emptySettings: SettingsState = {
  otpEnabled: false,
  otpChannels: ["whatsapp", "telegram", "email"],
  otpTtlSec: 600,
  whatsappMode: "qr",
  whatsappPhoneNumberId: "",
  whatsappAccessToken: "",
  whatsappWabaId: "",
  whatsappVerifyToken: "",
  whatsappGraphVersion: "v21.0",
  whatsappOtpTemplate: "otp_code",
  whatsappTransactionalTemplate: "",
  whatsappMarketingTemplate: "",
  telegramBotToken: "",
  telegramDefaultChatId: "",
  rateLimitPerMinute: 20,
};

function Copyable({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className='mt-1 inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-foreground/5 px-3 py-2 text-start font-mono text-[12px] text-muted-foreground hover:border-border/30 transition-all'
    >
      <span className="break-all">{value}</span>
      <Copy className="size-3.5 shrink-0" />
      {done ? <span className="text-[10px] text-primary">نُسخ</span> : null}
    </button>
  );
}

export default function CommsSettings() {
  const [mainTab, setMainTab] = useState<MainTab>("whatsapp");
  const [trainingSubTab, setTrainingSubTab] = useState<"b2b" | "b2c">("b2b");
  const [values, setValues] = useState<SettingsState>(emptySettings);
  const [webhooks, setWebhooks] = useState({ whatsapp: "", telegram: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [waTest, setWaTest] = useState<TestResult | null>(null);
  const [tgTest, setTgTest] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  // Telegram Executive Alert Dispatcher State
  const [tgCustomMsg, setTgCustomMsg] = useState("");
  const [tgSendingCustom, setTgSendingCustom] = useState(false);
  const [tgCustomFeedback, setTgCustomFeedback] = useState<string | null>(null);

  // 5-Slot Multi-Number WhatsApp QR State
  const [slots, setSlots] = useState<SlotStatus[]>(defaultSlots);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [inboxSlotFilter, setInboxSlotFilter] = useState<number | "all">("all");
  const [loadingQrAction, setLoadingQrAction] = useState(false);
  const [qrTestPhone, setQrTestPhone] = useState("");
  const [qrTestSending, setQrTestSending] = useState(false);
  const [qrTestFeedback, setQrTestFeedback] = useState<string | null>(null);

  // Live Inbox State
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<CommsMessage[]>([]);
  const [manualReplyText, setManualReplyText] = useState("");
  const [manualSending, setManualSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // AI Training State
  const [isMaster, setIsMaster] = useState(true);
  const [b2bTraining, setB2bTraining] = useState<B2BTrainingConfig | null>(null);
  const [b2cTraining, setB2cTraining] = useState<B2CTrainingConfig | null>(null);
  const [savingTraining, setSavingTraining] = useState(false);
  const [trainingFeedback, setTrainingFeedback] = useState("");

  // Abandoned recovery state
  const [recoveryCandidates, setRecoveryCandidates] = useState<RecoveryCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);

  const masterTabsScrollRef = useRef<HTMLDivElement>(null);
  const scrollNavTabs = (direction: "left" | "right") => {
    if (masterTabsScrollRef.current) {
      const offset = direction === "right" ? 200 : -200;
      masterTabsScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const activeMode: WhatsAppMode = values.whatsappMode || "qr";
  const activeSlot = slots.find((s) => s.slotId === selectedSlotId) || slots[0];

  const fetchQrStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/automation/whatsapp-qr", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        status?: QrStatus;
        slots?: Array<SlotStatus & { id?: number }>;
      };
      if (data.slots && data.slots.length > 0) {
        const normalized = data.slots.map((s) => ({
          ...s,
          slotId: Number(s.slotId ?? s.id ?? 1),
          id: Number(s.id ?? s.slotId ?? 1),
        }));
        setSlots(normalized);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchMessages = useCallback(async (contact?: string, slotIdFilter?: number | "all") => {
    setLoadingMessages(true);
    try {
      const effectiveFilter = slotIdFilter !== undefined ? slotIdFilter : inboxSlotFilter;
      let url = contact
        ? `/api/admin/automation/messages?contact=${encodeURIComponent(contact)}`
        : "/api/admin/automation/messages";
      if (effectiveFilter !== "all") {
        url += `${contact ? "&" : "?"}slotId=${effectiveFilter}`;
      }
      const res = await fetch(url, { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        conversations?: ConversationSummary[];
        messages?: CommsMessage[];
      };
      if (data.conversations) {
        setConversations(data.conversations);
        if (!contact && data.conversations.length > 0) {
          if (!activeContact || !data.conversations.some((c) => c.contact === activeContact)) {
            setActiveContact(data.conversations[0].contact);
          }
        }
      }
      if (data.messages) setActiveMessages(data.messages);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeContact, inboxSlotFilter]);

  const fetchTrainingState = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/automation/agent-training", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        isMaster?: boolean;
        state?: { b2b?: B2BTrainingConfig; b2c: B2CTrainingConfig };
      };
      if (data.isMaster !== undefined) setIsMaster(data.isMaster);
      if (data.state) {
        if (data.state.b2b) setB2bTraining(data.state.b2b);
        if (data.state.b2c) setB2cTraining(data.state.b2c);
        if (!data.isMaster) setTrainingSubTab("b2c");
      }
    } catch {
      // ignore
    }
  }, []);

  type ExcludedContactItem = {
    id: string;
    phone: string;
    normalizedPhone?: string;
    name?: string;
    reason?: string;
    addedAt: string;
  };

  const [excludedContacts, setExcludedContacts] = useState<ExcludedContactItem[]>([]);
  const [newExcludedPhone, setNewExcludedPhone] = useState("");
  const [newExcludedName, setNewExcludedName] = useState("");
  const [addingExcluded, setAddingExcluded] = useState(false);

  const fetchExcludedContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/automation/excluded-contacts", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; contacts?: ExcludedContactItem[] };
      if (data.ok && Array.isArray(data.contacts)) {
        setExcludedContacts(data.contacts);
      }
    } catch {
      // ignore
    }
  }, []);

  const addExcludedContact = async () => {
    if (!newExcludedPhone.trim()) return;
    setAddingExcluded(true);
    try {
      const res = await fetch("/api/admin/automation/excluded-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newExcludedPhone, name: newExcludedName }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (data.ok) {
        setNewExcludedPhone("");
        setNewExcludedName("");
        void fetchExcludedContacts();
      }
    } finally {
      setAddingExcluded(false);
    }
  };

  const deleteExcludedContact = async (id: string) => {
    try {
      await fetch(`/api/admin/automation/excluded-contacts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      void fetchExcludedContacts();
    } catch {
      // ignore
    }
  };

  const fetchAbandonedBookings = useCallback(async () => {
    setLoadingCandidates(true);
    try {
      const res = await fetch("/api/admin/automation/abandoned-recovery", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; candidates?: RecoveryCandidate[] };
      if (data.candidates) setRecoveryCandidates(data.candidates);
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  const updateSlotConfig = async (slotId: number, patch: Partial<SlotStatus>) => {
    setLoadingQrAction(true);
    try {
      const res = await fetch("/api/admin/automation/whatsapp-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_config", slotId, ...patch }),
      });
      const data = (await res.json()) as { ok?: boolean; slots?: SlotStatus[] };
      if (data.slots) setSlots(data.slots);
    } finally {
      setLoadingQrAction(false);
    }
  };

  const startQrSession = async (slotId?: number) => {
    const targetId = slotId || selectedSlotId;
    setLoadingQrAction(true);
    setQrTestFeedback(null);
    try {
      const res = await fetch("/api/admin/automation/whatsapp-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", slotId: targetId }),
      });
      const data = (await res.json()) as { ok?: boolean; slots?: SlotStatus[] };
      if (data.slots) setSlots(data.slots);
    } finally {
      setLoadingQrAction(false);
    }
  };

  const logoutQrSession = async (slotId?: number) => {
    const targetId = slotId || selectedSlotId;
    setLoadingQrAction(true);
    setQrTestFeedback(null);
    try {
      const res = await fetch("/api/admin/automation/whatsapp-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout", slotId: targetId }),
      });
      const data = (await res.json()) as { ok?: boolean; slots?: SlotStatus[] };
      if (data.slots) setSlots(data.slots);
    } finally {
      setLoadingQrAction(false);
    }
  };

  const testQrMessage = async (slotId?: number) => {
    const targetId = slotId || selectedSlotId;
    if (!qrTestPhone.trim()) {
      setQrTestFeedback("يرجى إدخال رقم الهاتف للتجربة");
      return;
    }
    setQrTestSending(true);
    setQrTestFeedback(null);
    try {
      const res = await fetch("/api/admin/automation/whatsapp-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          slotId: targetId,
          to: qrTestPhone.trim(),
          message: "🎉 تجربة اتصال واتساب المباشر بنجاح من منصة لوناليزا (Lonaliza) عبر الرقم المحدد!",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setQrTestFeedback("✅ تم إرسال الرسالة التجريبية بنجاح إلى الرقم!");
        void fetchMessages();
      } else {
        setQrTestFeedback(`❌ تعذّر الإرسال: ${data.error || "خطأ غير معروف"}`);
      }
    } finally {
      setQrTestSending(false);
    }
  };

  const sendManualMessage = async () => {
    if (!activeContact || !manualReplyText.trim()) return;
    setManualSending(true);
    try {
      const activeConv = conversations.find((c) => c.contact === activeContact);
      const res = await fetch("/api/admin/automation/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: activeContact,
          body: manualReplyText.trim(),
          channel: "whatsapp",
          category: "manual",
          slotId: activeConv?.slotId || selectedSlotId,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: CommsMessage };
      if (data.ok && data.message) {
        setActiveMessages((prev) => [...prev, data.message!]);
        setManualReplyText("");
        void fetchMessages();
      }
    } finally {
      setManualSending(false);
    }
  };

  const saveTrainingSettings = async () => {
    setSavingTraining(true);
    setTrainingFeedback("");
    try {
      const res = await fetch("/api/admin/automation/agent-training", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          b2b: b2bTraining,
          b2c: b2cTraining,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setTrainingFeedback("✅ تم حفظ وتحديث تدريب وكيل المبيعات بنجاح!");
      } else {
        setTrainingFeedback(`❌ تعذّر الحفظ: ${data.error || "خطأ غير معروف"}`);
      }
    } finally {
      setSavingTraining(false);
    }
  };

  const recoverBooking = async (candidate: RecoveryCandidate) => {
    setRecoveringId(candidate.bookingId);
    try {
      const res = await fetch("/api/admin/automation/abandoned-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setRecoveryCandidates((prev) => prev.filter((c) => c.bookingId !== candidate.bookingId));
        void fetchMessages();
      }
    } finally {
      setRecoveringId(null);
    }
  };

  // Poll QR status when connecting or qr_ready for any slot
  const isAnySlotConnecting = slots.some((s) => s.status === "qr_ready" || s.status === "connecting");
  useEffect(() => {
    if (isAnySlotConnecting) {
      const timer = setInterval(() => {
        void fetchQrStatus();
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [isAnySlotConnecting, fetchQrStatus]);

  // Auto-poll messages when inbox tab is active
  useEffect(() => {
    if (mainTab === "inbox") {
      const timer = setInterval(() => {
        void fetchMessages(activeContact || undefined);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [mainTab, activeContact, fetchMessages]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [commsRes] = await Promise.all([
        fetch("/api/admin/automation/comms", { cache: "no-store" }),
        fetchQrStatus(),
        fetchMessages(),
        fetchTrainingState(),
        fetchAbandonedBookings(),
        fetchExcludedContacts(),
      ]);
      const data = (await commsRes.json()) as {
        settings?: SettingsState;
        webhooks?: { whatsapp: string; telegram: string };
      };
      if (data.settings) setValues({ ...emptySettings, ...data.settings });
      if (data.webhooks) setWebhooks(data.webhooks);
    } finally {
      setLoading(false);
    }
  }, [fetchQrStatus, fetchMessages, fetchTrainingState, fetchAbandonedBookings, fetchExcludedContacts]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const saveSettings = async () => {
    setSaving(true);
    setFeedbackMessage("");
    try {
      const res = await fetch("/api/admin/automation/comms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; settings?: SettingsState };
      if (!res.ok || !data.ok) {
        setFeedbackMessage(data.error || "تعذّر الحفظ");
        return;
      }
      if (data.settings) setValues({ ...emptySettings, ...data.settings });
      setFeedbackMessage("تم حفظ إعدادات الرسائل والمزودين بنجاح.");
    } catch {
      setFeedbackMessage("تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (channel: "whatsapp" | "telegram") => {
    setTesting(channel);
    try {
      const res = await fetch("/api/admin/automation/comms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      const data = (await res.json()) as { result?: TestResult };
      if (channel === "whatsapp") setWaTest(data.result || { ok: false, summaryAr: "لا نتيجة" });
      else setTgTest(data.result || { ok: false, summaryAr: "لا نتيجة" });
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-muted-foreground gap-3'>
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="text-sm font-medium">جاري تحميل مركز الاتصالات الذكي والمحادثات الحية…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <Tabs value={mainTab} onValueChange={(val) => {
        setMainTab(val as MainTab);
        if (val === "inbox") void fetchMessages();
        if (val === "automation_rules") void fetchAbandonedBookings();
      }} className="w-full flex flex-col gap-6">
        {/* Top Header Navigation Tabs */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4'>
          <div className="flex items-center gap-3">
            <div className='size-11 rounded-2xl bg-gradient-to-tr from-admin-btn-primary-hover to-indigo-950 flex items-center justify-center text-foreground font-bold shadow-lg shadow-[hsl(var(--primary))]/20'>
              <MessageSquare size={22} />
            </div>
            <div>
              <h1 className='text-lg font-black text-foreground flex items-center gap-2'>
                مركز المراسلات الذكي
                <span className='text-[11px] px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30'>
                  Enterprise AI Hub
                </span>
              </h1>
              <p className='text-xs text-muted-foreground'>
                إدارة قنوات واتساب وتيليجرام، صندوق المحادثات الحية، وتدريب وكيل المبيعات الذكي
              </p>
            </div>
          </div>

          {/* Master Tabs: Clean single-line sliding strip matching platform Bordeaux theme */}
          <div className="w-full mt-3">
            <TabsList className="w-full">
              <TabsTrigger
                value="whatsapp"
                className={`gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold text-xs cursor-pointer transition-all ${
                  mainTab === "whatsapp"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Smartphone size={14} />
                <span>بوابة واتساب (5 أرقام QR)</span>
              </TabsTrigger>

              <TabsTrigger
                value="telegram"
                className={`gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold text-xs cursor-pointer transition-all ${
                  mainTab === "telegram"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Bot size={14} />
                <span>مركز تيليجرام والإشعارات الإدارية</span>
              </TabsTrigger>

              <TabsTrigger
                value="inbox"
                className={`gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold text-xs cursor-pointer transition-all ${
                  mainTab === "inbox"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <MessageCircle size={14} />
                <span>صندوق المحادثات الحية</span>
                {conversations.length > 0 && (
                  <span
                    className={`size-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                      mainTab === "inbox" ? "bg-white text-primary" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {conversations.length}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="ai_training"
                className={`gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold text-xs cursor-pointer transition-all ${
                  mainTab === "ai_training"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Sparkles size={14} />
                <span>تدريب وكيل المبيعات (AI Agent)</span>
              </TabsTrigger>

              <TabsTrigger
                value="automation_rules"
                className={`gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold text-xs cursor-pointer transition-all ${
                  mainTab === "automation_rules"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Flame size={14} />
                <span>السلات المتروكة و OTP</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

      {/* TAB 1: WHATSAPP FULL-WIDTH GATEWAY (5 SLOTS) */}
      <TabsContent value="whatsapp">
        <div className="w-full">
          <div className={`${cardClass} flex flex-col gap-5 border-primary/20`}>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4'>
              <div className="flex items-center gap-3">
                <div className='p-2 rounded-xl bg-primary/15 border border-primary/30 text-primary'>
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h2 className='text-sm font-black text-foreground'>تكامل واتساب المتقدم (WhatsApp Gateway)</h2>
                  <p className='text-xs text-muted-foreground'>إدارة 5 أرقام واتساب برمز QR وتعيين المسارات والوكلاء الأذكياء</p>
                </div>
              </div>
              {/* Sub Mode Toggle */}
              <div className='flex rounded-xl bg-card-2 p-1 border border-border text-xs'>
                <button
                  type="button"
                  onClick={() => setValues({ ...values, whatsappMode: "qr" })}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeMode === "qr" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ربط QR المباشر (متعدد الأرقام)
                </button>
                <button
                  type="button"
                  onClick={() => setValues({ ...values, whatsappMode: "cloud_api" })}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeMode === "cloud_api" ? "bg-secondary text-secondary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Meta Cloud API
                </button>
              </div>
            </div>

            {activeMode === "qr" ? (
              <div className="flex flex-col gap-6">
                <div className='rounded-2xl border border-primary/20 bg-primary/10 p-4 text-xs text-muted-foreground/90 leading-relaxed flex items-center justify-between gap-4'>
                  <div>
                    ✨ <strong>نظام تعدد أرقام واتساب (حتى 5 أرقام بكامل الصفحة):</strong> يمكنك ربط حتى 5 أرقام واتساب مختلفة برمز QR في نفس الوقت، مع تخصيص دور كل رقم وربط أو فصل وكيل الذكاء الاصطناعي لكل رقم على حدة.
                  </div>
                  <button
                    type="button"
                    onClick={() => void fetchQrStatus()}
                    className='shrink-0 px-3 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/20 transition-all flex items-center gap-1.5 font-bold'
                    title="تحديث حالة الأرقام"
                  >
                    <RefreshCw size={14} className={loadingQrAction ? "animate-spin" : ""} />
                    <span>تحديث الحالة</span>
                  </button>
                </div>

                {/* 5 Slots Selector Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>اختر رقم الواتساب لإدارته أو فحصه:</label>
                    <span className="text-[11px] text-muted-foreground font-mono">5 قنوات اتصال متاحة</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    {slots.map((s) => {
                      const isSelected = s.slotId === selectedSlotId;
                      const isConnected = s.status === "connected";
                      return (
                        <button
                          key={s.slotId}
                          type="button"
                          onClick={() => setSelectedSlotId(s.slotId)}
                          className={`p-3.5 rounded-2xl border text-start transition-all flex flex-col justify-between gap-2.5 relative ${
                            isSelected
                              ? "border-primary bg-primary/15 shadow-lg shadow-[var(--admin-btn-primary-bg)]/10 ring-2 ring-admin-accent/30"
                              : "border-border bg-muted hover:bg-card/80 hover:border-primary/50"
                          }`}
                        >
                          {s.isDefault && (
                            <span className='absolute -top-2 left-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] font-black uppercase shadow'>
                              ★ الافتراضي
                            </span>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Smartphone size={16} className={isConnected ? "text-primary" : "text-muted-foreground"} />
                              <span className='text-xs font-bold text-foreground'>الرقم {s.slotId}</span>
                            </div>
                            <span
                              className={`size-2.5 rounded-full ${
                                isConnected
                                  ? "bg-secondary shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                                  : s.status === "qr_ready"
                                    ? "bg-secondary animate-pulse"
                                    : "bg-card/20"
                              }`}
                            />
                          </div>

                          <div>
                            <p className='text-xs font-bold text-foreground/90 truncate'>{s.label}</p>
                            <p className='text-[10px] text-muted-foreground truncate mt-0.5 font-mono'>
                              {s.phone ? `+${s.phone}` : "غير متصل"}
                            </p>
                          </div>

                          <div className='flex items-center justify-between pt-2 border-t border-border text-[10px]'>
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold ${
                                isConnected
                                  ? "bg-primary/20 text-primary"
                                  : "bg-card/5 text-muted-foreground"
                              }`}
                            >
                              {isConnected ? "متصل" : s.status === "qr_ready" ? "مسح QR" : "مفصول"}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                                s.aiEnabled
                                  ? "bg-primary/20 text-primary border border-primary/30"
                                  : "bg-card/5 text-foreground/30"
                              }`}
                            >
                              {s.aiEnabled ? `AI (${s.aiTrack.toUpperCase()})` : "AI معطل"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Slot Detailed Management Box */}
                {(() => {
                  const activeSlot = slots.find((s) => s.slotId === selectedSlotId) || slots[0];
                  return (
                    <div className='rounded-2xl border border-border bg-foreground/5 p-5 space-y-5'>
                      {/* Slot Configuration Header */}
                      <div className='grid sm:grid-cols-12 gap-4 pb-4 border-b border-border'>
                        <div className="sm:col-span-5">
                          <label className={labelClass}>مسمى ودور الرقم (Slot {activeSlot.slotId})</label>
                          <div className="flex gap-2">
                            <input
                              className={inputClass}
                              value={activeSlot.label}
                              onChange={(e) => {
                                const newLabel = e.target.value;
                                setSlots((prev) =>
                                  prev.map((s) => (s.slotId === activeSlot.slotId ? { ...s, label: newLabel } : s))
                                );
                              }}
                              placeholder="مثال: مبيعات B2B، خدمة عملاء..."
                            />
                            <button
                              type="button"
                              onClick={() => void updateSlotConfig(activeSlot.slotId, { label: activeSlot.label })}
                              className='px-3 py-2 bg-card/10 hover:bg-card/20 text-foreground rounded-xl text-xs font-bold transition-all'
                            >
                              حفظ
                            </button>
                          </div>
                        </div>

                        <div className="sm:col-span-4 flex flex-col justify-between">
                          <label className={labelClass}>الوكيل الذكي (AI Sales Agent)</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void updateSlotConfig(activeSlot.slotId, { aiEnabled: !activeSlot.aiEnabled })
                              }
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                activeSlot.aiEnabled
                                  ? "bg-primary/20 border-primary/40 text-primary"
                                  : "bg-card/5 border-border text-muted-foreground"
                              }`}
                            >
                              <Bot size={14} />
                              {activeSlot.aiEnabled ? "الوكيل مفعّل" : "الوكيل معطّل"}
                            </button>

                            {activeSlot.aiEnabled && (
                              <select
                                value={activeSlot.aiTrack}
                                onChange={(e) =>
                                  void updateSlotConfig(activeSlot.slotId, {
                                    aiTrack: e.target.value as "b2b" | "b2c" | "auto",
                                  })
                                }
                                className='bg-background border border-border rounded-xl px-2.5 py-2 text-xs text-foreground outline-none font-bold'
                              >
                                <option value="auto">🤖 مسار ذكي (Auto)</option>
                                <option value="b2c">✈️ سياحة (B2C Travel)</option>
                                <option value="b2b">🏢 شركات (B2B SaaS)</option>
                              </select>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-3 flex flex-col justify-end">
                          <button
                            type="button"
                            onClick={() => void updateSlotConfig(activeSlot.slotId, { isDefault: true })}
                            disabled={activeSlot.isDefault}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              activeSlot.isDefault
                                ? "bg-secondary/20 border-admin-btn-secondary-border/40 text-secondary cursor-default"
                                : "bg-card/5 border-border text-muted-foreground hover:text-foreground hover:bg-card/10"
                            }`}
                          >
                            {activeSlot.isDefault ? "★ الرقم الافتراضي الحالي" : "تعيين كرقم افتراضي"}
                          </button>
                        </div>
                      </div>

                      {/* Slot Connection Status & Action */}
                      <div className="flex flex-col items-center justify-center text-center gap-4 py-2">
                        {activeSlot.status === "connected" ? (
                          <div className="flex flex-col items-center gap-3 py-2 w-full">
                            <div className='size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/40 shadow-lg shadow-[hsl(var(--primary))]/20 animate-pulse'>
                              <CheckCircle2 size={36} />
                            </div>
                            <div>
                              <h3 className='text-base font-black text-foreground'>
                                الرقم {activeSlot.slotId} متصل بنجاح وجاهز للإرسال والرد الآلي 🟢
                              </h3>
                              <p className='text-xs text-muted-foreground mt-1 font-mono'>
                                الرقم المتصل: <span className="text-primary font-bold font-sans">+{activeSlot.phone || "رقم هاتفك"}</span>
                                {activeSlot.name ? ` (${activeSlot.name})` : ""}
                              </p>
                            </div>

                            {/* Test message box for this slot */}
                            <div className='w-full mt-3 pt-4 border-t border-border flex flex-col gap-2'>
                              <label className={labelClass}>إرسال رسالة تجريبية من هذا الرقم (Slot {activeSlot.slotId})</label>
                              <div className="flex gap-2">
                                <input
                                  className={inputClass}
                                  placeholder="أدخل رقم الهاتف للتجربة (مثال: 905015709201)"
                                  value={qrTestPhone}
                                  onChange={(e) => setQrTestPhone(e.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => void testQrMessage(activeSlot.slotId)}
                                  disabled={qrTestSending}
                                  className='shrink-0 px-4 py-2 bg-primary hover:bg-primary disabled:opacity-60 text-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md'
                                >
                                  {qrTestSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                  إرسال تجربة
                                </button>
                              </div>
                              {qrTestFeedback && (
                                <p className="text-xs text-start mt-1 text-primary">{qrTestFeedback}</p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => void logoutQrSession(activeSlot.slotId)}
                              disabled={loadingQrAction}
                              className="mt-2 text-xs text-rose-300 hover:text-rose-200 border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                            >
                              {loadingQrAction ? <Loader2 size={12} className="animate-spin" /> : <Unlink size={12} />}
                              قطع اتصال الرقم {activeSlot.slotId}
                            </button>
                          </div>
                        ) : activeSlot.status === "qr_ready" && activeSlot.qrCodeUrl ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className='p-3 bg-card rounded-2xl shadow-2xl border-2 border-primary'>
                              <img
                                src={activeSlot.qrCodeUrl}
                                alt={`WhatsApp QR Code Slot ${activeSlot.slotId}`}
                                className="size-60 rounded-lg object-contain"
                              />
                            </div>
                            <div className='flex flex-col items-center gap-1 text-xs text-foreground/80 max-w-sm'>
                              <p className='font-bold text-secondary text-sm'>امسح الكود لربط الرقم {activeSlot.slotId} 📱</p>
                              <p className='text-muted-foreground leading-relaxed text-[11px]'>
                                افتح واتساب على جوالك ⬅️ <strong>الإعدادات</strong> ⬅️ <strong>الأجهزة المرتبطة</strong> ⬅️ <strong>ربط جهاز</strong> ووجّه الكاميرا نحو الشاشة.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void startQrSession(activeSlot.slotId)}
                                disabled={loadingQrAction}
                                className='mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/30 px-3 py-1.5 rounded-lg transition-all'
                              >
                                <RefreshCw size={12} className={loadingQrAction ? "animate-spin" : ""} />
                                تحديث الرمز
                              </button>
                              <button
                                type="button"
                                onClick={() => void logoutQrSession(activeSlot.slotId)}
                                disabled={loadingQrAction}
                                className='mt-1 inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-foreground border border-rose-500/30 px-3 py-1.5 rounded-lg transition-all'
                              >
                                إلغاء الربط
                              </button>
                            </div>
                          </div>
                        ) : activeSlot.status === "connecting" ? (
                          <div className='flex flex-col items-center gap-3 py-8 text-foreground/70 text-sm'>
                            <Loader2 size={28} className="animate-spin text-primary" />
                            <p>جاري تشغيل محرك الرقم {activeSlot.slotId} وتوليد رمز QR…</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 py-6 max-w-md">
                            <QrCode size={44} className="text-primary opacity-80" />
                            <div>
                              <h3 className='text-sm font-bold text-foreground'>الرقم {activeSlot.slotId} غير متصل حالياً</h3>
                              <p className='text-xs text-muted-foreground mt-1'>
                                اضغط على الزر أدناه لتوليد رمز الـ QR ومسحه بالجوال لربط الرقم {activeSlot.slotId} فوراً.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void startQrSession(activeSlot.slotId)}
                              disabled={loadingQrAction}
                              className='mt-2 inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary px-5 py-2.5 text-sm font-bold text-foreground shadow-lg shadow-[hsl(var(--primary))]/30 disabled:opacity-60 transition-all'
                            >
                              {loadingQrAction ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                              بدء ربط الرقم {activeSlot.slotId} عبر QR
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Cloud API View */
              <div className="flex flex-col gap-3 text-xs">
                {webhooks.whatsapp && (
                  <div>
                    <label className={labelClass}>Callback URL (انسخوه إلى ميتا)</label>
                    <Copyable value={webhooks.whatsapp} />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Phone Number ID</label>
                    <input
                      className={inputClass}
                      placeholder="123456789012345"
                      value={values.whatsappPhoneNumberId}
                      onChange={(e) => setValues({ ...values, whatsappPhoneNumberId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Access Token</label>
                    <input
                      className={inputClass}
                      type="password"
                      value={values.whatsappAccessToken}
                      onChange={(e) => setValues({ ...values, whatsappAccessToken: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void testConnection("whatsapp")}
                  disabled={testing === "whatsapp"}
                  className='mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border/40 px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary/10 transition-all'
                >
                  {testing === "whatsapp" ? <Loader2 size={13} className="animate-spin" /> : null}
                  اختبار اتصال Cloud API
                </button>
                {waTest && (
                  <p className={`text-xs ${waTest.ok ? "text-primary" : "text-rose-300"}`}>
                    {waTest.ok ? <CheckCircle2 className="inline size-3.5" /> : <XCircle className="inline size-3.5" />}{" "}
                    {waTest.summaryAr}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* EXCLUDED PERSONAL & FAMILY CONTACTS CARD */}
          <div className={`${cardClass} mt-6 flex flex-col gap-4 border-rose-500/20 bg-card/80`}>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                <ShieldCheck size={18} />
                <span>أرقام العائلة والأصدقاء المستثناة من الرد الآلي (Personal Excluded Contacts)</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                {excludedContacts.length} أرقام مستثناة
              </span>
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed'>
              لن يقوم وكيل الذكاء الاصطناعي بالرد على هذه الأرقام إطلاقاً عند مراسلتك على واتساب، لحماية خصوصية محادثاتك مع عائلتك وأصدقائك وعدم إهدار الرصيد في رسائل غير تجارية.
            </p>

            {/* Add Excluded Contact Form */}
            <div className='grid sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-background/60 border border-border'>
              <div className="sm:col-span-6">
                <label className={labelClass}>رقم الهاتف (مع الرمز الدولي أو محلي)</label>
                <input
                  className={inputClass}
                  placeholder="مثال: +212600000000 أو 0612345678"
                  value={newExcludedPhone}
                  onChange={(e) => setNewExcludedPhone(e.target.value)}
                />
              </div>
              <div className="sm:col-span-4">
                <label className={labelClass}>الاسم / الصفة (اختياري)</label>
                <input
                  className={inputClass}
                  placeholder="مثال: الزوجة، أخي، صديق..."
                  value={newExcludedName}
                  onChange={(e) => setNewExcludedName(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => void addExcludedContact()}
                  disabled={addingExcluded || !newExcludedPhone.trim()}
                  className='w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md'
                >
                  {addingExcluded ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  استثناء الرقم
                </button>
              </div>
            </div>

            {/* List of Excluded Contacts */}
            {excludedContacts.length === 0 ? (
              <div className='p-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl'>
                لا توجد أرقام شخصية مستثناة حالياً. أضف رقمك الخاص أو أرقام العائلة لتجنب رد الروبوت عليهم.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {excludedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className='flex items-center justify-between p-3 rounded-xl bg-background/70 border border-border text-xs'
                  >
                    <div className="flex flex-col">
                      <span className='font-bold text-foreground font-mono'>{contact.phone}</span>
                      <span className="text-[11px] text-rose-300/80">{contact.name || "رقم شخصي مستثنى"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteExcludedContact(contact.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="إلغاء الاستثناء"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* TAB 2: DEDICATED FULL-WIDTH TELEGRAM OPERATIONS & EXECUTIVE HUB */}
      <TabsContent value="telegram">
        <div className="w-full space-y-6">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Bot Config & Webhook */}
            <div className={`lg:col-span-5 ${cardClass} flex flex-col gap-4 border-sky-500/20`}>
              <div className='flex items-center gap-2 text-sky-400 font-bold text-sm border-b border-border pb-3'>
                <Bot size={18} />
                <span>إعدادات بوت تيليجرام للإدارة والاعتماد (@Lonalizabot)</span>
              </div>

              <p className='text-xs leading-relaxed text-muted-foreground'>
                يُستخدم لاستقبال تنبيهات الحجوزات الجديدة فوراً، طلبات التحويل لموظف بشري، تقارير خلية الوكلاء الأذكياء، وأوامر اعتماد الميزانيات والنشر.
              </p>

              {webhooks.telegram && (
                <div>
                  <label className={labelClass}>Webhook URL للتيليجرام</label>
                  <Copyable value={webhooks.telegram} />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Bot Token</label>
                  <input
                    className={inputClass}
                    type="password"
                    value={values.telegramBotToken}
                    onChange={(e) => setValues({ ...values, telegramBotToken: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Chat ID للإدارة (قناة / محادثتك)</label>
                  <input
                    className={inputClass}
                    placeholder="5805365203"
                    value={values.telegramDefaultChatId}
                    onChange={(e) => setValues({ ...values, telegramDefaultChatId: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => void testConnection("telegram")}
                  disabled={testing === "telegram"}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-500/40 px-4 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/10 transition-all"
                >
                  {testing === "telegram" ? <Loader2 size={13} className="animate-spin" /> : null}
                  إرسال فحص اتصال
                </button>
                <button
                  type="button"
                  onClick={() => void saveSettings()}
                  disabled={saving}
                  className='inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary px-4 py-2 text-xs font-bold text-foreground shadow-md transition-all'
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  حفظ الإعدادات
                </button>
              </div>

              {tgTest && (
                <p className={`text-xs ${tgTest.ok ? "text-primary" : "text-rose-300"}`}>
                  {tgTest.ok ? <CheckCircle2 className="inline size-3.5" /> : <XCircle className="inline size-3.5" />}{" "}
                  {tgTest.summaryAr}
                </p>
              )}

              {feedbackMessage && (
                <p className="text-xs text-primary mt-1">{feedbackMessage}</p>
              )}
            </div>

            {/* Right 7 Cols: Telegram Executive Alerts Dispatcher & Live Log */}
            <div className="lg:col-span-7 space-y-6">
              {/* Dispatch Custom Alert */}
              <div className={`${cardClass} border-sky-500/20 space-y-3.5`}>
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Send size={16} />
                  <span>إرسال إشعار فوري مباشر لقناة الإدارة (Executive Dispatcher)</span>
                </div>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  أرسل رسالة مخصصة أو تقريراً إدارياً فورياً من لوحة التحكم إلى مجموعة وتطبيق تيليجرام الخاص بالإدارة.
                </p>

                <div className="space-y-3">
                  <textarea
                    rows={3}
                    className='w-full bg-background/70 border border-border rounded-2xl p-3 text-xs text-foreground placeholder-white/30 outline-none focus:border-sky-500 transition-all leading-relaxed'
                    placeholder="اكتب نص الإشعار الإداري هنا..."
                    value={tgCustomMsg}
                    onChange={(e) => setTgCustomMsg(e.target.value)}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTgCustomMsg("📊 تقرير مبيعات وحجوزات اليوم: تم تسجيل 4 حجوزات مؤكدة وتفاعل 18 عميلاً عبر الواتساب.")}
                        className='text-[10px] px-2 py-1 rounded-lg bg-card/5 hover:bg-card/10 text-muted-foreground hover:text-foreground'
                      >
                        📊 ملخص مبيعات
                      </button>
                      <button
                        type="button"
                        onClick={() => setTgCustomMsg("🚨 تنبيه فحص السيرفر والأنظمة: جميع العمليات وخدمات الأتمتة تعمل بكفاءة 100%.")}
                        className='text-[10px] px-2 py-1 rounded-lg bg-card/5 hover:bg-card/10 text-muted-foreground hover:text-foreground'
                      >
                        🚨 حالة السيرفر
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!tgCustomMsg.trim() || tgSendingCustom) return;
                        setTgSendingCustom(true);
                        setTgCustomFeedback(null);
                        try {
                          const res = await fetch("/api/admin/automation/comms/test", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ channel: "telegram", customMessage: tgCustomMsg }),
                          });
                          const data = (await res.json()) as { ok?: boolean; error?: string };
                          if (data.ok) {
                            setTgCustomMsg("");
                            setTgCustomFeedback("✅ تم إرسال الإشعار بنجاح لقناة الإدارة!");
                          } else {
                            setTgCustomFeedback(`❌ تعذر الإرسال: ${data.error || "تحقق من الإعدادات"}`);
                          }
                        } catch {
                          setTgCustomFeedback("❌ خطأ أثناء الإرسال");
                        } finally {
                          setTgSendingCustom(false);
                        }
                      }}
                      disabled={tgSendingCustom || !tgCustomMsg.trim()}
                      className='px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-40 text-foreground rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5'
                    >
                      {tgSendingCustom ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>إرسال لقناة الإدارة</span>
                    </button>
                  </div>

                  {tgCustomFeedback && (
                    <p className="text-xs font-bold text-sky-300 animate-in fade-in">{tgCustomFeedback}</p>
                  )}
                </div>
              </div>

              {/* Streams & Monitored Alert Categories */}
              <div className={`${cardClass} border-sky-500/20 space-y-3`}>
                <div className='flex items-center justify-between border-b border-border pb-2.5'>
                  <h3 className='text-xs font-bold text-foreground'>قنوات الإشعارات المرتبطة بالبوت</h3>
                  <span className="text-[10px] text-primary font-mono">🟢 متصل ونشط لحظياً</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className='p-3 rounded-xl bg-foreground/5 border border-border space-y-1'>
                    <span className='text-secondary font-bold block'>⚡ قرارات خلية الوكلاء (AI Swarm)</span>
                    <p className='text-[11px] text-muted-foreground'>إرسال توصيات تعديل الميزانيات واعتماد القرارات فور توليدها من الوكلاء.</p>
                  </div>
                  <div className='p-3 rounded-xl bg-foreground/5 border border-border space-y-1'>
                    <span className="text-rose-400 font-bold block">🚨 التحويل لموظف بشري (Handover)</span>
                    <p className='text-[11px] text-muted-foreground'>تنبيه فوري بالاسم ورقم العميل وموضوع الطلب عند رغبة العميل بالتحدث مع موظف.</p>
                  </div>
                  <div className='p-3 rounded-xl bg-foreground/5 border border-border space-y-1'>
                    <span className="text-primary font-bold block">💳 الحجوزات وتأكيد الدفع</span>
                    <p className='text-[11px] text-muted-foreground'>إشعار تفصيلي بكل حجز جديد (طيران، فنادق، بكجات) مع المبلغ ورقم المعاملة.</p>
                  </div>
                  <div className='p-3 rounded-xl bg-foreground/5 border border-border space-y-1'>
                    <span className="text-sky-400 font-bold block">📊 تقارير الإعلانات والميزانية</span>
                    <p className='text-[11px] text-muted-foreground'>ملخصات أداء الحملات ونسبة العائد على الإنفاق وتنبيهات تجاوز الميزانية.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* TAB 2: LIVE INBOX & OPERATIONS MONITOR */}
      <TabsContent value="inbox">
        <div className="grid lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Contacts & Conversations List */}
          <div className='lg:col-span-4 rounded-2xl border border-border bg-background/50 p-4 flex flex-col gap-3'>
            <div className='flex items-center justify-between border-b border-border pb-3'>
              <div className='flex items-center gap-2 text-foreground font-bold text-sm'>
                <Users size={16} className="text-primary" />
                <span>المحادثات النشطة ({conversations.length})</span>
              </div>
              <button
                type="button"
                onClick={() => void fetchMessages()}
                className='p-1.5 rounded-lg hover:bg-card/5 text-muted-foreground hover:text-foreground transition-all'
                title="تحديث الرسائل"
              >
                <RefreshCw size={13} className={loadingMessages ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Slot Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs custom-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setInboxSlotFilter("all");
                  void fetchMessages(undefined, "all");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  inboxSlotFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                جميع الأرقام
              </button>
              {slots.map((s) => {
                const isActive = inboxSlotFilter === s.slotId;
                return (
                  <button
                    key={s.slotId}
                    type="button"
                    onClick={() => {
                      setInboxSlotFilter(s.slotId);
                      void fetchMessages(undefined, s.slotId);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm font-bold"
                        : "bg-card/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>رقم {s.slotId}</span>
                    <span
                      className={`size-1.5 rounded-full ${
                        s.status === "connected" ? "bg-secondary" : "bg-card/20"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] pe-1">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  لا توجد محادثات مطابقة للفلتر. عند مراسلة أي عميل أو إرسال OTP ستظهر هنا فوراً.
                </div>
              ) : (
                conversations.map((c) => {
                  const isSelected = activeContact === c.contact;
                  return (
                    <button
                      key={c.contact}
                      type="button"
                      onClick={() => {
                        setActiveContact(c.contact);
                        void fetchMessages(c.contact);
                      }}
                      className={`text-start p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? "border-primary/50 bg-primary/15 shadow-md"
                          : "border-border bg-card/[0.02] hover:bg-card/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className='size-7 rounded-full bg-card text-primary flex items-center justify-center font-bold text-xs'>
                            <User size={14} />
                          </div>
                          <span className='text-xs font-bold text-foreground font-mono'>
                            {c.customerName || `+${c.contact}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {c.slotId && (
                            <span className='text-[9px] font-bold px-1.5 py-0.2 rounded bg-card text-slate-300 border border-border'>
                              📱 رقم {c.slotId}
                            </span>
                          )}
                          {c.leadScore !== undefined && (
                            <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-border/30'>
                              ⭐ {c.leadScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                        <span className="truncate max-w-[180px]">{c.lastMessage.body}</span>
                        <span className="text-[10px] font-mono shrink-0">
                          {new Date(c.lastMessage.timestamp).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span
                          className={`px-1.5 py-0.2 rounded font-semibold ${
                            c.track === "b2b" ? "bg-primary/20 text-primary" : "bg-sky-500/20 text-sky-300"
                          }`}
                        >
                          {c.track === "b2b" ? "🏢 B2B منصة" : "✈️ B2C سياحة"}
                        </span>
                        {c.intent && (
                          <span className="text-muted-foreground truncate">
                            🎯 {c.intent}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Conversation Feed & Reply Box */}
          <div className='lg:col-span-8 rounded-2xl border border-border bg-background/50 p-5 flex flex-col justify-between gap-4'>
            {activeContact ? (
              <>
                {/* Chat Header */}
                <div className='flex items-center justify-between border-b border-border pb-3'>
                  <div className="flex items-center gap-3">
                    <div className='size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold'>
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className='text-sm font-bold text-foreground font-mono'>+{activeContact}</h3>
                      <p className="text-[11px] text-primary">محادثة واتساب مباشرة — وكيل الذكاء الاصطناعي متصل</p>
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className='flex flex-col gap-3 overflow-y-auto max-h-[420px] p-4 bg-muted/30 rounded-2xl border border-border shadow-inner'>
                  {activeMessages.map((m) => {
                    const isInbound = m.direction === "inbound";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[85%] gap-1.5 ${
                          isInbound ? "self-start items-start" : "self-end items-end"
                        }`}
                      >
                        <div
                          className={`p-4 rounded-2xl text-[13px] leading-relaxed font-sans ${
                            isInbound
                              ? "bg-card text-foreground border border-border shadow-xs rounded-tr-none"
                              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-md shadow-purple-600/20 rounded-tl-none border border-purple-500/30"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.body}</p>
                        </div>
                        <div className='flex items-center gap-2 text-[10px] text-muted-foreground px-1 font-mono'>
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                              m.category === "otp"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : m.category === "booking"
                                  ? "bg-sky-500/10 text-sky-600 border border-sky-500/20"
                                  : m.category === "ai_sales"
                                    ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                    : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {m.category === "otp"
                              ? "OTP"
                              : m.category === "booking"
                                ? "حجز"
                                : m.category === "ai_sales"
                                  ? "رد آلي ذكي"
                                  : m.category === "manual"
                                    ? "رد يدوي"
                                    : "عميل"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Manual Reply Input Box */}
                <div className='border-t border-border pt-3 flex gap-2'>
                  <input
                    className={inputClass}
                    placeholder="اكتب رداً يدوياً للعميل هنا (سيتوقف الرد الآلي في هذا التدخل)…"
                    value={manualReplyText}
                    onChange={(e) => setManualReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendManualMessage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => void sendManualMessage()}
                    disabled={manualSending || !manualReplyText.trim()}
                    className='shrink-0 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/25 transition-all cursor-pointer'
                  >
                    {manualSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    إرسال
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-muted-foreground gap-2">
                <MessageSquare size={36} className="opacity-40" />
                <p className="text-xs">اختر محادثة من القائمة لعرض الرسائل المتبادلة</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* TAB 3: AI AGENT TRAINING (B2B & B2C) */}
      <TabsContent value="ai_training">
        <div className="flex flex-col gap-6">
          {/* Sub-tabs for B2B vs B2C */}
          <div className='flex items-center gap-3 border-b border-border pb-3'>
            {isMaster && (
              <button
                type="button"
                onClick={() => setTrainingSubTab("b2b")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  trainingSubTab === "b2b"
                    ? "bg-primary text-foreground shadow-md shadow-[var(--admin-accent)]/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase size={14} />
                🏢 مسار B2B (تسويق منصة لوناليزا لشركات السياحة — سوبر أدمن فقط)
              </button>
            )}
            <button
              type="button"
              onClick={() => setTrainingSubTab("b2c")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                trainingSubTab === "b2c"
                  ? "bg-sky-600 text-foreground shadow-md shadow-sky-600/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plane size={14} />
              ✈️ مسار B2C (تسويق الرحلات والحجوزات للمسافرين والسياح)
            </button>
          </div>

          {/* B2B Settings (Super Admin Only) */}
          {trainingSubTab === "b2b" && isMaster && b2bTraining && (
            <div className={`${cardClass} flex flex-col gap-4 border-primary/20`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-primary">
                    تدريب وكيل مبيعات المنصة لشركات السياحة (B2B Sales Agent)
                  </h2>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    هذا الوكيل مخصص للتجاوب مع أصحاب المكاتب والشركات وإقناعهم بالاشتراك في لوناليزا وطلب الديمو.
                  </p>
                </div>
                <label className='flex items-center gap-2 text-xs font-bold text-foreground'>
                  <input
                    type="checkbox"
                    checked={b2bTraining.enabled}
                    onChange={(e) => setB2bTraining({ ...b2bTraining, enabled: e.target.checked })}
                    className="accent-purple-500 size-4"
                  />
                  تفعيل الرد الآلي لـ B2B
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={labelClass}>اسم الوكيل / المسمى الوظيفي</label>
                  <input
                    className={inputClass}
                    value={b2bTraining.agentName}
                    onChange={(e) => setB2bTraining({ ...b2bTraining, agentName: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>رابط طلب الديمو (Demo URL)</label>
                  <input
                    className={inputClass}
                    value={b2bTraining.demoUrl}
                    onChange={(e) => setB2bTraining({ ...b2bTraining, demoUrl: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>رسالة الترحيب الأولى</label>
                  <input
                    className={inputClass}
                    value={b2bTraining.greetingMessage}
                    onChange={(e) => setB2bTraining({ ...b2bTraining, greetingMessage: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>نبذة إقناع الشركات بمميزات المنصة (Platform Pitch)</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={b2bTraining.platformPitch}
                    onChange={(e) => setB2bTraining({ ...b2bTraining, platformPitch: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>تعليمات التحدث والإقناع الخاصة (Custom Prompt Instructions)</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={b2bTraining.customInstructions}
                    onChange={(e) => setB2bTraining({ ...b2bTraining, customInstructions: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>الحد الأقصى للخصم % المسموح به للوكيل</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={b2bTraining.maxDiscountPercent}
                    onChange={(e) => setB2bTraining({ ...b2bTraining, maxDiscountPercent: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>كلمات التحويل لموظف بشري (مفصولة بفواصل)</label>
                  <input
                    className={inputClass}
                    value={b2bTraining.handoverKeywords.join("، ")}
                    onChange={(e) =>
                      setB2bTraining({
                        ...b2bTraining,
                        handoverKeywords: e.target.value.split("،").map((s) => s.trim()),
                      })
                    }
                  />
                </div>
              </div>

              <div className='flex items-center justify-between border-t border-border pt-4 mt-2'>
                <button
                  type="button"
                  onClick={() => void saveTrainingSettings()}
                  disabled={savingTraining}
                  className='px-6 py-2.5 bg-primary hover:bg-primary disabled:opacity-50 text-foreground rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[hsl(var(--primary))]/30 transition-all'
                >
                  {savingTraining ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  حفظ تدريب وكيل B2B
                </button>
                {trainingFeedback && <p className="text-xs text-primary">{trainingFeedback}</p>}
              </div>
            </div>
          )}

          {/* B2C Tourism Settings */}
          {trainingSubTab === "b2c" && b2cTraining && (
            <div className={`${cardClass} flex flex-col gap-4 border-sky-500/20`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-sky-300">
                    تدريب وكيل الحجوزات والسياحة (B2C Tourism Agent)
                  </h2>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    هذا الوكيل مخصص للتجاوب مع السياح والمسافرين، وتقديم الباقات السياحية وحجوزات الفنادق والطيران.
                  </p>
                </div>
                <label className='flex items-center gap-2 text-xs font-bold text-foreground'>
                  <input
                    type="checkbox"
                    checked={b2cTraining.enabled}
                    onChange={(e) => setB2cTraining({ ...b2cTraining, enabled: e.target.checked })}
                    className="accent-sky-500 size-4"
                  />
                  تفعيل الرد الآلي لـ B2C
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={labelClass}>اسم الوكيل السياحي</label>
                  <input
                    className={inputClass}
                    value={b2cTraining.agentName}
                    onChange={(e) => setB2cTraining({ ...b2cTraining, agentName: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>رابط الموقع والحجز المباشر</label>
                  <input
                    className={inputClass}
                    value={b2cTraining.bookingUrl}
                    onChange={(e) => setB2cTraining({ ...b2cTraining, bookingUrl: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>رسالة الترحيب الأولى للعميل</label>
                  <input
                    className={inputClass}
                    value={b2cTraining.greetingMessage}
                    onChange={(e) => setB2cTraining({ ...b2cTraining, greetingMessage: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>نبذة العروض والخدمات السياحية (Tourism Pitch)</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={b2cTraining.tourismPitch}
                    onChange={(e) => setB2cTraining({ ...b2cTraining, tourismPitch: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>الوجهات السياحية المشمولة (مفصولة بفواصل)</label>
                  <input
                    className={inputClass}
                    value={b2cTraining.destinationsCovered.join("، ")}
                    onChange={(e) =>
                      setB2cTraining({
                        ...b2cTraining,
                        destinationsCovered: e.target.value.split("،").map((s) => s.trim()),
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>الحد الأقصى لكوبون الخصم %</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={b2cTraining.maxDiscountPercent}
                    onChange={(e) => setB2cTraining({ ...b2cTraining, maxDiscountPercent: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>تعليمات التحدث والإرشاد السياحي الخاصة</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={b2cTraining.customInstructions}
                    onChange={(e) => setB2cTraining({ ...b2cTraining, customInstructions: e.target.value })}
                  />
                </div>
              </div>

              <div className='flex items-center justify-between border-t border-border pt-4 mt-2'>
                <button
                  type="button"
                  onClick={() => void saveTrainingSettings()}
                  disabled={savingTraining}
                  className='px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-foreground rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all'
                >
                  {savingTraining ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  حفظ تدريب وكيل B2C
                </button>
                {trainingFeedback && <p className="text-xs text-sky-300">{trainingFeedback}</p>}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      {/* TAB 4: ABANDONED BOOKINGS & OTP RULES */}
      <TabsContent value="automation_rules">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Abandoned Bookings Recovery */}
          <div className={`${cardClass} flex flex-col gap-4 border-border/20`}>
            <div className='flex items-center justify-between border-b border-border pb-3'>
              <div className='flex items-center gap-2 text-secondary font-bold text-sm'>
                <Flame size={18} />
                <span>استعادة الحجوزات والسلات المتروكة ({recoveryCandidates.length})</span>
              </div>
              <button
                type="button"
                onClick={() => void fetchAbandonedBookings()}
                className='p-1 rounded-lg hover:bg-card/5 text-muted-foreground hover:text-foreground'
              >
                <RefreshCw size={13} className={loadingCandidates ? "animate-spin" : ""} />
              </button>
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed'>
              الحجوزات التي أنشأها العملاء ولم يُتموا الدفع خلال 20 دقيقة. يمكنك إرسال رسالة واتساب تذكيرية مع كود خصم تلقائياً لتشجيعهم على إتمام الحجز.
            </p>

            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto">
              {recoveryCandidates.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  لا توجد حجوزات معلقة تحتاج استعادة حالياً.
                </div>
              ) : (
                recoveryCandidates.map((c) => (
                  <div
                    key={c.bookingId}
                    className='p-3 rounded-xl border border-border bg-card/[0.02] flex items-center justify-between gap-3 text-xs'
                  >
                    <div>
                      <h4 className='font-bold text-foreground'>{c.customerName}</h4>
                      <p className='text-muted-foreground text-[11px] font-mono'>+{c.phone} — {c.itemTitle}</p>
                      <p className="text-primary font-bold text-[11px] mt-0.5">
                        {c.totalAmount} {c.currency} (كود الخصم: {c.couponCode})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void recoverBooking(c)}
                      disabled={recoveringId === c.bookingId}
                      className='px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary disabled:opacity-50 text-foreground font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-md'
                    >
                      {recoveringId === c.bookingId ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      إرسال تذكير
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* OTP Settings Card */}
          <div className={`${cardClass} flex flex-col gap-4 border-primary/20`}>
            <div className='flex items-center gap-2 text-primary font-bold text-sm border-b border-border pb-3'>
              <ShieldCheck size={18} />
              <span>قواعد رموز التحقق OTP</span>
            </div>

            <p className='text-xs leading-6 text-muted-foreground'>
              يُرسل الرمز عند تأكيد الحجز، تسجيل حساب جديد، أو التحقق من الهوية.
            </p>

            <label className='flex items-center gap-3 text-sm text-foreground/90'>
              <input
                type="checkbox"
                checked={values.otpEnabled}
                onChange={(e) => setValues({ ...values, otpEnabled: e.target.checked })}
                className="accent-purple-600 size-4"
              />
              تفعيل OTP للحجز والتسجيل والتحقق
            </label>

            <div>
              <label className={labelClass}>صلاحية الرمز (ثوانٍ)</label>
              <input
                className={inputClass}
                type="number"
                min={60}
                max={1800}
                value={values.otpTtlSec}
                onChange={(e) => setValues({ ...values, otpTtlSec: Number(e.target.value) })}
              />
            </div>

            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving}
              className='mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary px-5 py-2.5 text-xs font-bold text-foreground shadow-lg transition-all'
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              حفظ قواعد OTP
            </button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
    </div>
  );
}
