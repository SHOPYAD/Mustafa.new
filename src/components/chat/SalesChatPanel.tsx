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
  Camera,
  Radio,
  Hotel,
  Car,
  Clock,
} from "lucide-react";
import { blobToDataUrl, inspectVoiceBlob } from "@/lib/voice-wav";
import { isClientAppMode } from "@/lib/mobile/app-mode";
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
  perks?: any;
  bundleCheckoutPayload?: any;
};

export type SalesChatPanelProps = {
  embedded?: boolean;
  fillViewport?: boolean;
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

function pickRecorderMime(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) || "";
}

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


function formatIsoDay(iso?: string, locale?: Locale) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  try {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    ).format(new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00`));
  } catch {
    return `${m[3]}/${m[2]}/${m[1]}`;
  }
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
  const dates = [formatIsoDay(itinerary.arrivalDate, locale), formatIsoDay(itinerary.departureDate, locale)]
    .filter(Boolean)
    .join(" — ");
  return (
    <div className="mt-3 w-full overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-[#0c1a2e]/95 to-[#071018]/95 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 border-b border-emerald-500/15 bg-emerald-500/10 px-4 py-2.5">
        <CalendarDays size={16} className="text-emerald-400" />
        <div className="min-w-0">
          <h5 className="text-sm font-bold text-emerald-50">{title}</h5>
          {dates ? <p className="text-[10px] text-emerald-200/60">{dates}</p> : null}
        </div>
      </div>
      {days.length > 0 && (
        <ol className="space-y-2 p-3">
          {days.map((d, i) => {
            const dayTitle = tContent(d, "title", locale);
            const dayDetail =
              tContent(d, "detail", locale) ||
              tContent(d, "description", locale);
            const items = d.items || [];
            return (
              <li
                key={`${d.day}-${i}`}
                className="rounded-xl border border-white/8 bg-black/20 px-4 py-3"
              >
                <p className="text-xs font-bold text-emerald-300">
                  {t.admin.dayLabel.replace("{n}", String(d.day || i + 1))}
                  {dayTitle ? ` — ${dayTitle}` : ""}
                </p>
                {items.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {items.map((item, idx) => {
                      const Icon =
                        item.kind === "flight"
                          ? Plane
                          : item.kind === "hotel"
                            ? Hotel
                            : item.kind === "transfer"
                              ? Car
                              : Clock;
                      const label =
                        locale === "ar"
                          ? item.labelAr || item.labelEn
                          : item.labelEn || item.labelAr;
                      return (
                        <li
                          key={`${item.kind}-${idx}`}
                          className="flex items-start gap-2 text-[12px] text-white/70"
                        >
                          <Icon size={12} className="mt-0.5 shrink-0 text-amber-300" />
                          <span>
                            {item.time ? (
                              <span className="me-1 font-bold text-amber-200/80">{item.time}</span>
                            ) : null}
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {dayDetail ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">{dayDetail}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
      {itinerary.totalClientPrice > 0 && (
        <div className="border-t border-white/5 bg-black/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{t.admin.totalLabel}</span>
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
      ? "طلب حجز من مستشار السفر الذكي — لوناليزا للسياحة والسفر"
      : locale === "tr"
        ? "Lonaliza Turizm AI danışmanı üzerinden rezervasyon talebi"
        : "Booking request via Lonaliza Travel AI consultant",
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
        const flightBits = [
          c.fromIata && c.toIata ? `${c.fromIata}→${c.toIata}` : "",
          c.departAt || "",
          c.airline || "",
        ]
          .filter(Boolean)
          .join(" ");
        lines.push(
          `• [${c.type}] ${title}${flightBits ? ` (${flightBits})` : ""} — ${money(c.clientPrice, c.currency)}`
        );
      }
    }

    if (m.itinerary) {
      const it = m.itinerary;
      lines.push(
        `${labels.itinerary}: ${tContent(it, "title", locale)}`
      );
      if (it.arrivalDate && it.departureDate) {
        lines.push(`${it.arrivalDate} → ${it.departureDate}`);
      }
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
  fillViewport = false,
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
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [kbInset, setKbInset] = useState(0);
  const native = fillViewport || isClientAppMode();

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
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKbInset(overlap);
    };
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    window.addEventListener("focusin", sync);
    window.addEventListener("focusout", sync);
    sync();
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      window.removeEventListener("focusin", sync);
      window.removeEventListener("focusout", sync);
    };
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [messages, loading, pending, recording, scrollChatToBottom]);

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
      try {
        recorderRef.current?.stop();
      } catch {
        /* ignore */
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
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
    async (raw?: string, voice?: { base64: string; mime: string }) => {
      const text = (raw ?? input).trim();
      if ((!text && pending.length === 0 && !voice) || loading) return;

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
        text:
          text ||
          (voice
            ? locale === "ar"
              ? "رسالة صوتية"
              : "Voice message"
            : ""),
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
            audioBase64: voice?.base64 || "",
            audioMime: voice?.mime || "",
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
        if (data.transcript) {
          const spoken = String(data.transcript);
          userMsg.text = spoken;
          setMessages((prev) =>
            prev.map((m) => (m.id === userMsg.id ? { ...m, text: spoken } : m))
          );
        }

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
            perks: (data.perks as any) || hydrated.perks,
            bundleCheckoutPayload: (data.bundleCheckoutPayload as any) || hydrated.bundleCheckoutPayload,
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

  const stopMicStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const toggleRecord = async () => {
    if (recording) {
      try {
        recorderRef.current?.requestData?.();
      } catch {
        /* older browsers */
      }
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (loading) return;
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      showToast(locale === "ar" ? "الميكروفون غير مدعوم في هذا المتصفح." : "Microphone is not supported here.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      const mime = pickRecorderMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        stopMicStream();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime || "audio/webm" });
        if (blob.size < 1200) {
          showToast(locale === "ar" ? "التسجيل قصير جداً." : "Recording was too short.");
          return;
        }
        void inspectVoiceBlob(blob).then(async (probe) => {
          if (!probe.audible) {
            showToast(locale === "ar" ? "لم يُلتقط صوت. قرّب الميكروفون." : "No audio captured. Check the mic.");
            return;
          }
          const base64 = await blobToDataUrl(blob);
          void send("", { base64, mime: blob.type || mime || "audio/webm" });
        });
      };
      recorderRef.current = rec;
      rec.start(250);
      setRecording(true);
    } catch {
      showToast(locale === "ar" ? "تعذر فتح الميكروفون." : "Could not open the microphone.");
    }
  };

  const waHref = buildWhatsAppLink(
    whatsappNumber,
    buildWhatsAppTranscript(
      messages,
      locale,
      {
        offers: t.admin.offersLabel,
        itinerary: t.admin.itineraryLabel,
        total: t.admin.totalLabel,
      },
      formatPrice
    )
  );

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
        "relative flex min-h-0 flex-col overflow-hidden text-white",
        "bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_55%),linear-gradient(180deg,#07111f_0%,#0a1628_45%,#050d18_100%)]",
        embedded || fillViewport || native
          ? "h-full rounded-none border-0 shadow-none sm:rounded-2xl sm:border sm:border-amber-500/15"
          : "min-h-[70vh] rounded-3xl border border-amber-500/20 shadow-2xl shadow-black/40",
        className
      )}
      style={{ paddingBottom: kbInset > 0 ? kbInset : undefined }}
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-500/10 to-transparent"
      />

      {/* Header */}
      <div className={cn(
        "relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0a1628]/80 px-4 py-3.5 backdrop-blur-md",
        (fillViewport || native) && "pt-[max(0.85rem,env(safe-area-inset-top))]"
      )}>
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
        className="relative z-10 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
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
                      ((msg.cards && msg.cards.length > 0) ||
                        Boolean(msg.flightHref || msg.hotelsHref || msg.transferHref || msg.carsHref)) && (
                        <div className="mt-3 w-full min-w-[min(100%,280px)]">
                          <SalesOfferCards
                            cards={msg.cards || []}
                            perks={msg.perks}
                            bundlePayload={msg.bundleCheckoutPayload}
                            emptyHint={
                              !msg.cards?.length
                                ? locale === "ar"
                                  ? "لا توجد نتائج حية قابلة للحجز بهذه التواريخ."
                                  : "No live bookable results for these dates."
                                : undefined
                            }
                          />
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
      {!booting && !loading && (
        <div className="relative z-10 flex shrink-0 gap-2 overflow-x-auto border-t border-white/5 px-3 py-2 [scrollbar-width:none]">
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
          <a
            href={waHref.startsWith("https://wa.me/") ? waHref : `https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-[#20bd5a] active:scale-[0.99]"
          >
            <MessageCircle size={18} />
            {t.chat.whatsappCta}
          </a>
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

          {/* Instant Passport OCR Camera Button */}
          <label
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/15 text-amber-300 transition hover:border-amber-400/70 hover:bg-amber-400/25 cursor-pointer"
            title={locale === "ar" ? "مسح الجواز بالذكاء الاصطناعي 📷" : "Scan Passport with AI 📷"}
          >
            <Camera size={18} />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("file", file);
                try {
                  setLoading(true);
                  const res = await fetch("/api/ai/passport-ocr", { method: "POST", body: formData });
                  const ocr = await res.json();
                  if (ocr.ok && ocr.traveler) {
                    const tr = ocr.traveler;
                    const prompt = locale === "ar"
                      ? `أرسلت لك صورة جواز سفري: المسافر ${tr.firstName} ${tr.lastName}، رقم الجواز: ${tr.passportNumber}، تاريخ الميلاد: ${tr.dateOfBirth}، الجنسية: ${tr.nationality}. أرجو تجهيز وتثبيت بياناتي لحجز الرحلة الكاملة.`
                      : `Here is my passport: ${tr.firstName} ${tr.lastName}, passport: ${tr.passportNumber}, DOB: ${tr.dateOfBirth}, nationality: ${tr.nationality}. Please arrange my trip with these details.`;
                    setInput(prompt);
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setLoading(false);
                  e.target.value = "";
                }
              }}
            />
          </label>

          <button
            type="button"
            disabled={loading || booting}
            onClick={() => void toggleRecord()}
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition",
              recording
                ? "bg-rose-500 text-white"
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            )}
            aria-label={recording ? (locale === "ar" ? "إيقاف التسجيل" : "Stop recording") : (locale === "ar" ? "تسجيل صوتي" : "Voice recording")}
            title={recording ? (locale === "ar" ? "إيقاف" : "Stop") : (locale === "ar" ? "ميكروفون" : "Mic")}
          >
            {recording ? (
              <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/40" />
            ) : (
              <span className="absolute inset-0 animate-pulse rounded-full bg-emerald-300/25" />
            )}
            <Radio size={18} className="relative" />
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={recording ? (locale === "ar" ? "جارٍ الاستماع…" : "Listening…") : t.chat.placeholder}
            disabled={loading || booting || recording}
            className="max-h-[160px] min-h-[44px] min-w-0 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canSend || recording}
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
