"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  X,
  MessageCircle,
  CalendarDays,
  Loader2,
  Paperclip,
  ImagePlus,
  FileText,
  User,
  Sparkles,
  Plane,
} from "lucide-react";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import SearchCtaCards from "@/components/chat/SearchCtaCards";
import WorkStagesTimeline, {
  emptyStageMap,
  type StageMap,
} from "@/components/chat/WorkStagesTimeline";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import {
  isSalesChatStageId,
  type SalesChatStageId,
} from "@/lib/sales-chat-stages";
import { buildWhatsAppLink, cn, tContent, normalizeWhatsAppNumber } from "@/lib/utils";
import {
  DEFAULT_SITE_WHATSAPP,
  getSiteContact,
} from "@/data/site-contact";
import {
  hydrateSalesChatResponse,
  stripSalesChatJson,
} from "@/lib/sales-chat-parse";
import type {
  SalesChatCard,
  SalesChatItinerary,
} from "@/types/sales-chat";

function resolveSalesWhatsApp(apiNumber?: string | null): string {
  const fromApi = normalizeWhatsAppNumber(String(apiNumber || ""));
  if (fromApi) return fromApi;
  const fromSite = normalizeWhatsAppNumber(getSiteContact().whatsappNumber);
  return fromSite || DEFAULT_SITE_WHATSAPP;
}

type ChatRole = "user" | "assistant";

type PendingAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataBase64: string;
  previewUrl?: string;
};

type MessageAttachment = {
  id: string;
  name: string;
  mimeType: string;
  previewUrl?: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  cards?: SalesChatCard[];
  itinerary?: SalesChatItinerary | null;
  readyForWhatsApp?: boolean;
  attachments?: MessageAttachment[];
  createdAt?: number;
  flightHref?: string;
  transferHref?: string;
  carsHref?: string;
  hotelsHref?: string;
};

export type SalesChatPanelProps = {
  embedded?: boolean;
  className?: string;
  onClose?: () => void;
  conversationId?: string;
};

const GUEST_CHAT_KEY = "alrayyan_guest_sales_chat";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_ATTACHMENTS = 4;
const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

function resolveMime(file: File): string {
  if (file.type && ALLOWED_MIME.has(file.type.toLowerCase())) {
    return file.type.toLowerCase() === "image/jpg"
      ? "image/jpeg"
      : file.type.toLowerCase();
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return EXT_MIME[ext] || file.type || "";
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(ts: number, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-GB",
      {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsDataURL(file);
  });
}


function ItineraryBlock({
  itinerary,
  locale,
}: {
  itinerary: SalesChatItinerary;
  locale: Locale;
}) {
  const { t } = useLocale();
  const { formatPrice } = useCurrency();
  const title = tContent(itinerary, "title", locale) || t.admin.itineraryLabel;
  const days = itinerary.days || [];
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-[#0c1a2e]/95 to-[#071018]/95 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 border-b border-emerald-500/15 bg-emerald-500/10 px-4 py-2.5">
        <CalendarDays size={16} className="text-emerald-400" />
        <h5 className="text-sm font-bold text-emerald-50">{title}</h5>
      </div>
      {days.length > 0 && (
        <ol className="relative space-y-2 p-3 ps-4">
          {days.map((d, i) => {
            const dayTitle = tContent(d, "title", locale);
            const dayDetail =
              tContent(d, "detail", locale) ||
              tContent(d, "description", locale);
            return (
              <li
                key={`${d.day}-${i}`}
                className="relative rounded-xl border border-white/8 bg-black/20 px-4 py-3"
              >
                <p className="text-xs font-bold text-emerald-300">
                  {t.admin.dayLabel.replace("{n}", String(d.day || i + 1))}
                  {dayTitle ? ` — ${dayTitle}` : ""}
                </p>
                {dayDetail ? (
                  <p className="mt-1 text-sm leading-relaxed text-white/65">
                    {dayDetail}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
      {itinerary.totalClientPrice > 0 && (
        <div className="border-t border-white/5 bg-black/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">
              {t.admin.totalLabel}
            </span>
            <span className="text-lg font-bold text-emerald-300">
              {formatPrice(itinerary.totalClientPrice, "USD")}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-emerald-100/70">
            {t.chat.priceEstimateNote}
          </p>
        </div>
      )}
    </div>
  );
}

function AttachmentChips({
  items,
  onRemove,
  removeLabel,
}: {
  items: { id: string; name: string; mimeType: string; previewUrl?: string; size?: number }[];
  onRemove?: (id: string) => void;
  removeLabel?: string;
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((att) => (
        <div
          key={att.id}
          className="group relative flex max-w-[160px] items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 p-1.5 pe-2"
        >
          {isImageMime(att.mimeType) && att.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={att.previewUrl}
              alt={att.name}
              className="h-11 w-11 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
              <FileText size={18} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-white/85">
              {att.name}
            </p>
            {typeof att.size === "number" && (
              <p className="text-[10px] text-white/35">{formatBytes(att.size)}</p>
            )}
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white/70 ring-1 ring-white/15 transition hover:bg-red-600 hover:text-white"
              aria-label={removeLabel || "Remove"}
            >
              <X size={11} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function MessageAttachments({ items }: { items: MessageAttachment[] }) {
  if (!items?.length) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {items.map((att) =>
        isImageMime(att.mimeType) && att.previewUrl ? (
          <a
            key={att.id}
            href={att.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-white/15 shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={att.previewUrl}
              alt={att.name}
              className="h-28 w-auto max-w-[200px] object-cover"
            />
          </a>
        ) : (
          <div
            key={att.id}
            className="inline-flex max-w-[200px] items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2"
          >
            <FileText size={16} className="shrink-0 text-amber-300" />
            <span className="truncate text-[11px] text-white/80">{att.name}</span>
          </div>
        )
      )}
    </div>
  );
}

function buildWhatsAppTranscript(
  messages: ChatMessage[],
  locale: Locale,
  labels: { offers: string; itinerary: string; total: string },
  money: (amount: number, currency: string) => string
): string {
  const lines: string[] = [
    locale === "ar"
      ? "طلب حجز من مستشار السفر الذكي — الريان للسياحة"
      : locale === "tr"
        ? "Alrayyan Turizm AI danışmanı üzerinden rezervasyon talebi"
        : "Booking request via Alrayyan Tourism AI consultant",
    "",
  ];

  for (const m of messages) {
    const who =
      m.role === "user"
        ? locale === "ar"
          ? "العميل"
          : locale === "tr"
            ? "Müşteri"
            : "Client"
        : locale === "ar"
          ? "المستشار"
          : locale === "tr"
            ? "Danışman"
            : "Consultant";
    lines.push(`${who}: ${m.text || "(attachment)"}`);

    if (m.attachments?.length) {
      lines.push(
        locale === "ar"
          ? `مرفقات: ${m.attachments.map((a) => a.name).join(", ")}`
          : locale === "tr"
            ? `Ekler: ${m.attachments.map((a) => a.name).join(", ")}`
            : `Attachments: ${m.attachments.map((a) => a.name).join(", ")}`
      );
    }

    if (m.cards?.length) {
      lines.push(labels.offers);
      for (const c of m.cards) {
        const title = tContent(c, "title", locale);
        lines.push(
          `• [${c.type}] ${title} — ${money(c.clientPrice, c.currency)}`
        );
      }
    }

    if (m.itinerary) {
      const it = m.itinerary;
      lines.push(
        `${labels.itinerary}: ${tContent(it, "title", locale)}`
      );
      lines.push(
        `${labels.total}: ${money(it.totalClientPrice, it.currency)}`
      );
    }
    lines.push("");
  }

  lines.push(
    locale === "ar"
      ? "السعر المعروض تقديري حسب أسعار السوق الحالية. للتأكيد النهائي أرجو تأكيد الحجز والمتابعة عبر واتساب مع تفاصيل هذا البرنامج."
      : locale === "tr"
        ? "Fiyat tahminidir. Lütfen WhatsApp üzerinden rezervasyonu onaylayın ve bu programla devam edin."
        : "The displayed price is an estimate. Please confirm the final price on WhatsApp and continue from this program."
  );
  return lines.join("\n").trim();
}

export default function SalesChatPanel({
  embedded = false,
  className,
  onClose,
  conversationId: initialConversationId,
}: SalesChatPanelProps) {
  const { locale, t, dir } = useLocale();
  const { formatPrice } = useCurrency();
  const { user, loading: authLoading } = useCustomerAuth();
  const [conversationId, setConversationId] = useState(initialConversationId || "");
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedRef = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_SITE_WHATSAPP);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [stages, setStages] = useState<StageMap>(emptyStageMap);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setWhatsappNumber(resolveSalesWhatsApp(null));
  }, []);

  const showWhatsAppCta = messages.some(
    (m) =>
      m.role === "assistant" &&
      (m.readyForWhatsApp || (m.cards?.length ?? 0) > 0)
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4200);
  }, []);

  const applyStage = useCallback((id: SalesChatStageId, status: "active" | "done") => {
    setStages((prev) => {
      const next = { ...prev };
      if (status === "active") {
        for (const key of Object.keys(next) as SalesChatStageId[]) {
          if (next[key] === "active") next[key] = "done";
        }
        next[id] = "active";
      } else {
        next[id] = "done";
      }
      return next;
    });
  }, []);

  const scrollChatToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el || !stickToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const onListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = gap < 96;
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [messages, loading, pending, scrollChatToBottom]);

  useEffect(() => {
    if (!loading) return;
    const order: SalesChatStageId[] = [
      "understand",
      "dates",
      "flights",
      "transfers",
      "cars",
      "program",
    ];
    let i = 0;
    const timer = window.setInterval(() => {
      i = Math.min(i + 1, order.length - 1);
      applyStage(order[i], "active");
    }, 1400);
    return () => window.clearInterval(timer);
  }, [loading, applyStage]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      pending.forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (authLoading) return;

      if (user && (initialConversationId || conversationId)) {
        const id = initialConversationId || conversationId;
        try {
          const res = await fetch(`/api/account/conversations/${id}`, {
            cache: "no-store",
          });
          const data = await res.json();
          if (cancelled) return;
          if (data.ok && Array.isArray(data.conversation?.messages) && data.conversation.messages.length) {
            setConversationId(data.conversation.id);
            setMessages(data.conversation.messages);
            hydratedRef.current = true;
            setBooting(false);
            return;
          }
        } catch {
          /* fall through to welcome */
        }
      }

      if (!user) {
        try {
          const raw = sessionStorage.getItem(GUEST_CHAT_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as { messages?: ChatMessage[] };
            if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
              setMessages(parsed.messages);
              hydratedRef.current = true;
              setBooting(false);
              return;
            }
          }
        } catch {
          /* ignore */
        }
      }

      try {
        const res = await fetch("/api/gemini/sales-chat", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok) {
          setWhatsappNumber(resolveSalesWhatsApp(data.whatsappNumber));
          const welcome =
            locale === "ar"
              ? data.welcomeAr || t.chat.subtitle
              : data.welcomeEn || t.chat.subtitle;
          setMessages([
            {
              id: uid(),
              role: "assistant",
              text: welcome,
              createdAt: Date.now(),
            },
          ]);
        } else {
          setMessages([
            {
              id: uid(),
              role: "assistant",
              text:
                locale === "ar"
                  ? "مرحباً! كيف يمكنني مساعدتك في تخطيط رحلتك؟"
                  : "Hi! How can I help plan your trip?",
              createdAt: Date.now(),
            },
          ]);
        }
      } catch {
        if (!cancelled) {
          setMessages([
            {
              id: uid(),
              role: "assistant",
              text:
                locale === "ar"
                  ? "مرحباً! كيف يمكنني مساعدتك في تخطيط رحلتك؟"
                  : "Hi! How can I help plan your trip?",
              createdAt: Date.now(),
            },
          ]);
        }
      } finally {
        if (!cancelled) {
          hydratedRef.current = true;
          setBooting(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, authLoading, user?.id, initialConversationId]);

  useEffect(() => {
    if (booting || !hydratedRef.current || loading) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      const payload = messages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        cards: m.cards,
        itinerary: m.itinerary,
        readyForWhatsApp: m.readyForWhatsApp,
        attachments: m.attachments?.map((a) => ({
          id: a.id,
          name: a.name,
          mimeType: a.mimeType,
        })),
        createdAt: m.createdAt,
        flightHref: m.flightHref,
        transferHref: m.transferHref,
        carsHref: m.carsHref,
        hotelsHref: m.hotelsHref,
      }));
      if (!user) {
        try {
          sessionStorage.setItem(GUEST_CHAT_KEY, JSON.stringify({ messages: payload }));
        } catch {
          /* ignore */
        }
        return;
      }
      if (payload.filter((m) => m.role === "user").length === 0) return;
      void fetch("/api/account/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: conversationId || undefined,
          messages: payload,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok && d.conversation?.id) {
            setConversationId(d.conversation.id);
            try {
              sessionStorage.removeItem(GUEST_CHAT_KEY);
            } catch {
              /* ignore */
            }
          }
        })
        .catch(() => undefined);
    }, 700);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [messages, user, conversationId, booting, loading]);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;

      let room = 0;
      setPending((prev) => {
        room = Math.max(0, MAX_ATTACHMENTS - prev.length);
        if (room === 0 || list.length > room) {
          showToast(t.chat.maxAttachments);
        }
        return prev;
      });

      if (room === 0) return;
      const slice = list.slice(0, room);

      const next: PendingAttachment[] = [];
      for (const file of slice) {
        const mime = resolveMime(file);
        if (!mime || !ALLOWED_MIME.has(mime)) {
          showToast(t.chat.unsupportedType);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          showToast(t.chat.fileTooLarge);
          continue;
        }
        try {
          const dataBase64 = await readFileAsBase64(file);
          const previewUrl = isImageMime(mime)
            ? URL.createObjectURL(file)
            : undefined;
          next.push({
            id: uid(),
            name: file.name,
            mimeType: mime,
            size: file.size,
            dataBase64,
            previewUrl,
          });
        } catch {
          showToast(t.chat.error);
        }
      }

      if (next.length) {
        setPending((prev) => [...prev, ...next].slice(0, MAX_ATTACHMENTS));
      }
    },
    [showToast, t.chat.error, t.chat.fileTooLarge, t.chat.maxAttachments, t.chat.unsupportedType]
  );

  const removePending = useCallback((id: string) => {
    setPending((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if ((!text && pending.length === 0) || loading) return;

      setError("");
      const attachmentsSnapshot = pending.map((p) => ({
        id: p.id,
        name: p.name,
        mimeType: p.mimeType,
        previewUrl: p.previewUrl,
      }));
      const apiAttachments = pending.map((p) => ({
        name: p.name,
        mimeType: p.mimeType,
        dataBase64: p.dataBase64,
      }));

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        text,
        attachments: attachmentsSnapshot,
        createdAt: Date.now(),
      };

      stickToBottom.current = true;
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setPending([]);
      setLoading(true);
      setStages(() => {
        const next = emptyStageMap();
        next.understand = "active";
        return next;
      });

      try {
        const history = [...messages, userMsg].map((m) => {
          let content = m.text.trim();
          if (!content && m.attachments?.length) {
            content =
              locale === "ar"
                ? `يرجى مراجعة المرفقات: ${m.attachments.map((a) => a.name).join(", ")}`
                : `Please review the attached files: ${m.attachments.map((a) => a.name).join(", ")}`;
          }
          return { role: m.role, content };
        });

        const res = await fetch("/api/gemini/sales-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            messages: history,
            locale,
            attachments: apiAttachments,
            stream: true,
          }),
        });

        const contentType = res.headers.get("content-type") || "";
        let data: Record<string, unknown> = {};

        if (contentType.includes("text/event-stream") && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split("\n\n");
            buffer = chunks.pop() || "";
            for (const chunk of chunks) {
              let event = "message";
              let payload = "";
              for (const line of chunk.split("\n")) {
                if (line.startsWith("event:")) event = line.slice(6).trim();
                if (line.startsWith("data:")) payload += line.slice(5).trim();
              }
              if (!payload) continue;
              try {
                const parsed = JSON.parse(payload) as Record<string, unknown>;
                if (event === "stage") {
                  const id = String(parsed.id || "");
                  if (isSalesChatStageId(id)) {
                    applyStage(
                      id,
                      parsed.status === "done" ? "done" : "active"
                    );
                  }
                } else if (event === "result") {
                  data = parsed;
                } else if (event === "error") {
                  data = parsed;
                }
              } catch {
                /* ignore malformed event */
              }
            }
          }
        } else {
          data = (await res.json()) as Record<string, unknown>;
        }

        if (!data.ok) {
          const errText = String(data.error || t.chat.error);
          setError(errText);
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: "assistant",
              text: errText,
              createdAt: Date.now(),
            },
          ]);
          return;
        }

        setWhatsappNumber(resolveSalesWhatsApp(String(data.whatsappNumber || "")));

        const hydrated = hydrateSalesChatResponse(String(data.reply || ""), {
          cards: data.cards,
          itinerary: data.itinerary,
          locale,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: hydrated.reply,
            cards: hydrated.cards,
            itinerary: hydrated.itinerary,
            readyForWhatsApp:
              Boolean(data.readyForWhatsApp) || hydrated.readyForWhatsApp,
            flightHref: data.flightHref ? String(data.flightHref) : undefined,
            transferHref: data.transferHref
              ? String(data.transferHref)
              : undefined,
            carsHref: data.carsHref ? String(data.carsHref) : undefined,
            hotelsHref: data.hotelsHref ? String(data.hotelsHref) : undefined,
            createdAt: Date.now(),
          },
        ]);

        if (data.savedProgramId || data.programSaved) {
          window.dispatchEvent(new Event("ai-program-saved"));
        }
      } catch {
        setError(t.chat.error);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: t.chat.error,
            createdAt: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
        setStages((prev) => {
          const next = { ...prev };
          (Object.keys(next) as SalesChatStageId[]).forEach((id) => {
            next[id] = "done";
          });
          return next;
        });
        inputRef.current?.focus();
      }
    },
    [input, pending, loading, messages, locale, t.chat, applyStage]
  );

  const openWhatsApp = () => {
    const transcript = buildWhatsAppTranscript(
      messages,
      locale,
      {
        offers: t.admin.offersLabel,
        itinerary: t.admin.itineraryLabel,
        total: t.admin.totalLabel,
      },
      formatPrice
    );
    const url = buildWhatsAppLink(whatsappNumber, transcript);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const quickPrompts = [
    { label: t.chat.quickPlan, value: t.chat.quickPlan },
    { label: t.chat.quickHotelFlight, value: t.chat.quickHotelFlight },
    { label: t.chat.quickTransfer, value: t.chat.quickTransfer },
    { label: t.chat.quickMaldives, value: t.chat.quickMaldives },
  ];

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) void addFiles(e.target.files);
    e.target.value = "";
  };

  const canSend = !loading && !booting && (input.trim().length > 0 || pending.length > 0);

  return (
    <div
      dir={dir}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col overflow-hidden text-white",
        "bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_55%),linear-gradient(180deg,#07111f_0%,#0a1628_45%,#050d18_100%)]",
        embedded
          ? "h-full min-h-0 rounded-2xl border border-amber-500/15 shadow-2xl shadow-black/50"
          : "min-h-[70vh] rounded-3xl border border-amber-500/20 shadow-2xl shadow-black/40",
        className
      )}
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-500/10 to-transparent"
      />

      {/* Header */}
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0a1628]/80 px-4 py-3.5 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 shadow-lg shadow-amber-500/35 ring-2 ring-amber-300/30">
              <Bot size={20} className="text-white" />
            </div>
            <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-[#0a1628] bg-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold tracking-tight text-white">
              {t.chat.title}
            </h3>
            <p className="flex items-center gap-1.5 truncate text-xs text-emerald-400/90">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.chat.online}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={onListScroll}
        className="relative z-10 flex-1 space-y-5 overflow-y-auto px-3 py-4 sm:px-4"
      >
        {booting ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/40">
            <Loader2 size={22} className="animate-spin text-amber-400" />
            <span className="text-sm">{t.common.loading}</span>
          </div>
        ) : (
          <>
            {/* Soft welcome strip when only greeting */}
            {messages.length <= 1 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mb-2 max-w-md rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-sky-500/5 px-4 py-4 text-center"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                  <Sparkles size={18} />
                </div>
                <p className="text-xs leading-relaxed text-white/55">
                  {t.chat.welcomeHint}
                </p>
                <div className="mt-3 flex justify-center gap-3 text-amber-400/50">
                  <Plane size={14} />
                  <ImagePlus size={14} />
                  <FileText size={14} />
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const bubbleText =
                  msg.role === "assistant"
                    ? stripSalesChatJson(msg.text)
                    : msg.text;
                const showItinerary = Boolean(
                  msg.role === "assistant" &&
                    msg.itinerary &&
                    ((msg.itinerary.days && msg.itinerary.days.length > 0) ||
                      msg.itinerary.titleAr ||
                      msg.itinerary.titleEn ||
                      msg.itinerary.totalClientPrice > 0)
                );
                return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={cn(
                    "flex gap-2.5",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-md shadow-amber-900/40">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex max-w-[96%] flex-col sm:max-w-[90%]",
                      msg.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <MessageAttachments items={msg.attachments} />
                    )}
                    {bubbleText.trim().length > 0 && (
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-md",
                          msg.role === "user"
                            ? "rounded-ee-md bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-900/25"
                            : "rounded-es-md border border-white/10 bg-[#0d1c30]/95 text-white/90 shadow-black/30"
                        )}
                      >
                        {bubbleText}
                      </div>
                    )}
                    {msg.createdAt && (
                      <span className="mt-1 px-1 text-[10px] text-white/30">
                        {formatTime(msg.createdAt, locale)}
                      </span>
                    )}
                    {msg.role === "assistant" &&
                      msg.cards &&
                      msg.cards.length > 0 && (
                        <div className="mt-3 w-full min-w-[min(100%,280px)]">
                          <SalesOfferCards cards={msg.cards} />
                        </div>
                      )}
                    {showItinerary && msg.itinerary && (
                      <ItineraryBlock
                        itinerary={msg.itinerary}
                        locale={locale}
                      />
                    )}
                    {msg.role === "assistant" && (
                      <SearchCtaCards
                        flightHref={msg.flightHref}
                        transferHref={msg.transferHref}
                        carsHref={msg.carsHref}
                        hotelsHref={msg.hotelsHref}
                      />
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700/80 text-white/70 ring-1 ring-white/10">
                      <User size={14} />
                    </div>
                  )}
                </motion.div>
                );
              })}
            </AnimatePresence>
          </>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2.5"
          >
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600">
              <Bot size={14} className="text-white" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <WorkStagesTimeline stages={stages} />
              <p className="px-1 text-xs text-white/40">
                {pending.length === 0 &&
                messages[messages.length - 1]?.attachments?.some((a) =>
                  isImageMime(a.mimeType)
                )
                  ? t.chat.analyzingImage
                  : t.chat.typing}
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <p className="text-center text-xs text-red-400/90">{error}</p>
        )}
        <div aria-hidden className="h-1 shrink-0" />
      </div>

      {/* Quick prompts */}
      {!booting && messages.length <= 2 && !loading && (
        <div className="relative z-10 flex shrink-0 gap-2 overflow-x-auto border-t border-white/5 px-3 py-2.5 [scrollbar-width:none]">
          {quickPrompts.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => void send(q.value)}
              className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100/90 transition hover:bg-amber-500/20 hover:text-amber-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Sticky WhatsApp CTA */}
      {showWhatsAppCta && (
        <div className="relative z-10 shrink-0 border-t border-emerald-500/20 bg-emerald-950/30 px-3 py-2.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={openWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-[#20bd5a] active:scale-[0.99]"
          >
            <MessageCircle size={18} />
            {t.chat.whatsappCta}
          </button>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className={cn(
          "relative z-10 shrink-0 border-t border-white/10 bg-[#07111f]/95 p-3 backdrop-blur-md",
          dragOver && "ring-2 ring-inset ring-amber-400/50"
        )}
      >
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-b-2xl bg-amber-500/10 text-sm font-medium text-amber-200">
            {t.chat.dropFiles}
          </div>
        )}

        {pending.length > 0 && (
          <div className="mb-2.5">
            <AttachmentChips
              items={pending}
              onRemove={removePending}
              removeLabel={t.chat.removeAttachment}
            />
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            disabled={loading || booting || pending.length >= MAX_ATTACHMENTS}
            onClick={() => fileRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/60 text-amber-300/90 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200 disabled:opacity-40"
            aria-label={t.chat.attachFile}
            title={t.chat.attachFile}
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            disabled={loading || booting || pending.length >= MAX_ATTACHMENTS}
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = "image/jpeg,image/png,image/webp,image/gif";
                fileRef.current.click();
                // restore full accept after click scheduling
                window.setTimeout(() => {
                  if (fileRef.current) fileRef.current.accept = ACCEPT;
                }, 0);
              }
            }}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/60 text-amber-300/90 transition hover:border-amber-500/40 hover:bg-amber-500/10 sm:flex disabled:opacity-40"
            aria-label={t.chat.uploadImage}
            title={t.chat.uploadImage}
          >
            <ImagePlus size={18} />
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={t.chat.placeholder}
            disabled={loading || booting}
            className="max-h-[120px] min-h-[44px] min-w-0 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-900/35 transition hover:brightness-110 disabled:opacity-40"
            aria-label={t.chat.send}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} className="rtl:-scale-x-100" />
            )}
          </button>
        </div>
      </form>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute bottom-24 left-1/2 z-50 max-w-[90%] -translate-x-1/2 rounded-xl border border-red-400/30 bg-red-950/95 px-4 py-2.5 text-center text-xs font-medium text-red-100 shadow-xl backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
