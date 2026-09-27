"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  makeAssistantDataUI,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import {
  Bot,
  CalendarDays,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hotel,
  Loader2,
  Mic,
  Paperclip,
  Plane,
  Send,
  User,
  X,
  Maximize2,
  PanelRightClose,
} from "lucide-react";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import WorkStagesTimeline, {
  emptyStageMap,
} from "@/components/chat/WorkStagesTimeline";
import { setAdvisorExtras } from "@/components/chat/advisor/advisor-extras";
import { usePlanner } from "@/components/planner/PlannerStore";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { planSalesChatTools } from "@/lib/sales-chat-intent";
import TripFeedbackCard from "./TripFeedbackCard";
import { stripSalesChatJson } from "@/lib/sales-chat-parse";
import { blobToDataUrl, inspectVoiceBlob } from "@/lib/voice-wav";
import { cn } from "@/lib/utils";
import ChatProgram from "@/components/planner/ChatProgram";
import AdvisorDatesPickerCard from "@/components/chat/advisor/AdvisorDatesPickerCard";
import ThinkingSteps from "@/components/planner/ThinkingSteps";
import type { FlightSearchHints, SalesChatCard, SalesChatItinerary } from "@/types/sales-chat";

type OfferPayload = {
  cards?: SalesChatCard[];
  itinerary?: SalesChatItinerary | null;
  destination?: string;
  flightHref?: string;
  transferHref?: string;
  carsHref?: string;
  hotelsHref?: string;
  reply?: string;
  readyForWhatsApp?: boolean;
  flightSearch?: FlightSearchHints | null;
};

function tripDestinationOf(data: {
  destination?: string;
  itinerary?: SalesChatItinerary | null;
}): string {
  const direct = String(data.destination || data.itinerary?.destination || "").trim();
  if (direct) return direct;
  const title = String(data.itinerary?.titleEn || data.itinerary?.titleAr || "").trim();
  const city = title.split(/[-—|]/)[0]?.trim() || "";
  return city.length >= 3 ? city : "";
}

type PendingAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataBase64: string;
  previewUrl?: string;
};

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

const OffersDataUI = makeAssistantDataUI<OfferPayload>({
  name: "offers",
  render: ({ data }) => <AdvisorOffers data={data} />,
});

const PlannerTripUI = makeAssistantDataUI<{
  itinerary?: SalesChatItinerary | null;
  destination?: string;
}>({
  name: "planner-trip",
  render: ({ data }) => <PlannerTripApply data={data} />,
});

let lastGenerateKey = "";

function originFromOffer(data: OfferPayload, fallback: string) {
  if (data.flightSearch?.from) return data.flightSearch.from;
  if (data.flightSearch?.fromIata) return data.flightSearch.fromIata;
  const flight = (data.cards || []).find((c) => c.type === "flight");
  if (flight?.fromIata) return flight.fromIata;
  const blob = `${flight?.titleEn || ""} ${flight?.titleAr || ""} ${fallback}`;
  if (/london|لندن|lgw|lhr|stn|ltn/i.test(blob)) return "London";
  if (/riyadh|الرياض|ruh/i.test(blob)) return "Riyadh";
  if (/jeddah|جدة|jed/i.test(blob)) return "Jeddah";
  if (/dubai|دبي|dxb/i.test(blob)) return "Dubai";
  if (/kuwait|الكويت|kwi/i.test(blob)) return "Kuwait";
  return fallback || "Riyadh";
}

function PlannerTripApply({
  data,
}: {
  data: OfferPayload;
}) {
  const { locale } = useLocale();
  const { applyTrip, trip, intakeDraft } = usePlanner();
  useEffect(() => {
    const dest = tripDestinationOf(data);
    const titleBlob = `${data.itinerary?.titleAr || ""} ${data.itinerary?.titleEn || ""}`;
    const titleDaysMatch = titleBlob.match(/(\d+)\s*(أيام|ايام|يوم|days?)/i);
    const titleDays = titleDaysMatch ? parseInt(titleDaysMatch[1], 10) : 0;
    const itinDaysCount = data.itinerary?.days?.length || 0;
    const targetDays = Math.max(
      titleDays,
      itinDaysCount,
      intakeDraft.durationDays || 0,
      5
    );
    const origin = originFromOffer(data, intakeDraft.origin);
    const key = `${dest}|${targetDays}|${origin}|${locale}|live-v7`;
    if (!dest || lastGenerateKey === key) return;
    const flights = (trip?.cards || []).filter((c) => c.type === "flight" && Number(c.clientPrice) > 0);
    const hotels = (trip?.cards || []).filter((c) => c.type === "hotel" && Number(c.clientPrice) > 0);
    const cheapOk = flights.some((c) => Number(c.clientPrice) > 0 && Number(c.clientPrice) < 400);
    const sameTrip =
      trip &&
      trip.destination.trim().toLowerCase() === dest.toLowerCase() &&
      trip.durationDays === targetDays &&
      cheapOk &&
      hotels.length > 0;
    if (sameTrip) {
      lastGenerateKey = key;
      return;
    }
    lastGenerateKey = key;

    const agentDays =
      itinDaysCount >= targetDays && itinDaysCount > 1
        ? (data.itinerary?.days || []).map((d) => ({
            day: d.day,
            titleAr: d.titleAr,
            titleEn: d.titleEn,
            items: d.items || [],
          }))
        : undefined;

    void fetch("/internal/planner/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        locale,
        people: 1,
        destination: dest,
        durationDays: targetDays,
        arrivalDate: data.itinerary?.arrivalDate || intakeDraft.arrivalDate,
        departureDate: data.itinerary?.departureDate || intakeDraft.departureDate,
        destLat: intakeDraft.destLat,
        destLng: intakeDraft.destLng,
        radiusKm: intakeDraft.radiusKm || 25,
        transportMode: intakeDraft.transportMode || "car",
        prefs: intakeDraft.prefs,
        agentDays,
      }),
    }).then(async (res) => {
      const json = await res.json();
      if (json.ok && json.trip) applyTrip(json.trip, { keepMode: true });
    });
  }, [applyTrip, data, intakeDraft, locale, trip]);
  return null;
}

function GeneratedTripBlock() {
  const { trip } = usePlanner();
  if (!trip?.days.length) return null;
  return (
    <div className="mt-2 w-full min-w-0">
      <ChatProgram trip={trip} cards={trip.cards} />
    </div>
  );
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

function resolveMime(file: File): string {
  if (file.type && ALLOWED_MIME.has(file.type.toLowerCase())) {
    return file.type.toLowerCase() === "image/jpg" ? "image/jpeg" : file.type.toLowerCase();
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return EXT_MIME[ext] || file.type || "";
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

function renderInlineMarkdown(str: string): React.ReactNode {
  // Clean raw HTML br tags like <br/>, <br>, </br>, or >/br< that leak into markdown cells
  const sanitized = str
    .replace(/<\/?br\s*\/?>/gi, " • ")
    .replace(/>\/br</gi, " • ");

  const tokens = sanitized.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/[^)]+|\/[^)]+)\))/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-[#1E0B4B]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    const link = token.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)$/);
    if (link) {
      const href = link[2];
      const wa = /wa\.me|whatsapp/i.test(href);
      const isInternal = href.startsWith("/");
      return (
        <a
          key={idx}
          href={href}
          target={isInternal ? "_self" : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold transition mx-0.5",
            wa
              ? "bg-[#25D366] text-white hover:bg-[#1ebe5d]"
              : isInternal
              ? "bg-violet-600 text-white shadow-xs hover:bg-violet-700"
              : "bg-violet-100 text-[#6D28D9] hover:bg-violet-200"
          )}
        >
          {link[1]}
        </a>
      );
    }
    return token;
  });
}

function AdvisorText({ text }: { text: string }) {
  const cleaned = stripSalesChatJson(text).trim();
  if (!cleaned) return null;

  const lines = cleaned.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentTable: string[] = [];

  const flushTable = () => {
    if (currentTable.length === 0) return;
    const tableLines = [...currentTable];
    currentTable = [];

    const rows = tableLines
      .map((l) => l.trim())
      .filter((l) => l.startsWith("|") && l.endsWith("|"))
      .map((l) =>
        l
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim())
      );

    if (rows.length === 0) return;
    const header = rows[0];
    const bodyRows = rows.slice(1).filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));

    blocks.push(
      <div key={`table-${blocks.length}`} className="my-3 overflow-x-auto rounded-xl border border-violet-200/80 bg-white/95 shadow-xs">
        <table className="w-full text-start text-xs border-collapse">
          <thead className="bg-gradient-to-r from-violet-50 to-purple-50 text-[11px] font-bold text-[#2E1065] border-b border-violet-200">
            <tr>
              {header.map((col, cIdx) => (
                <th key={cIdx} className="px-3 py-2 text-start font-black whitespace-nowrap">
                  {renderInlineMarkdown(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-100/60">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-violet-50/20"}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 text-slate-700 leading-relaxed">
                    {renderInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      currentTable.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    if (!trimmed) {
      blocks.push(<div key={`sp-${i}`} className="h-1.5" />);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${i}`} className="mt-3 mb-1 text-sm font-black text-[#2E1065]">
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${i}`} className="mt-4 mb-1.5 text-[15px] font-black text-[#1E0B4B] border-b border-violet-100 pb-1">
          {renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1 key={`h1-${i}`} className="mt-4 mb-2 text-base font-black text-[#1E0B4B]">
          {renderInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
        </h1>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push(
        <div key={`li-${i}`} className="flex items-start gap-2 py-0.5 ps-1">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
          <span className="text-[14px] leading-relaxed text-slate-700">
            {renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}
          </span>
        </div>
      );
    } else {
      blocks.push(
        <p key={`p-${i}`} className="text-[14px] leading-relaxed text-slate-700">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    }
  }

  flushTable();

  return <div className="space-y-1.5 text-[14px] leading-relaxed text-slate-700">{blocks}</div>;
}

function AdvisorOffers({ data }: { data: OfferPayload }) {
  const { setOffers, setTrip, trip, offerCards } = usePlanner();
  const tripRef = useRef(trip);
  const cardsRef = useRef(offerCards);
  tripRef.current = trip;
  cardsRef.current = offerCards;
  useEffect(() => {
    const live = (data.cards || []).filter(
      (c) => Number(c.clientPrice) > 0 || Boolean(c.image && c.href)
    );
    if (!live.length) return;
    const haveHotels = (tripRef.current?.cards || []).some((c) => c.type === "hotel" && Number(c.clientPrice) > 0);
    if (tripRef.current?.cards?.length && haveHotels) return;
    const existing = cardsRef.current.length ? cardsRef.current : tripRef.current?.cards || [];
    const merged = [...existing];
    for (const card of live) {
      const dup = merged.some(
        (c) =>
          (c.id && card.id && c.id === card.id) ||
          (c.type === card.type && c.titleEn === card.titleEn)
      );
      if (!dup) merged.push(card);
    }
    if (merged.length === existing.length) return;
    setOffers(merged, data.itinerary?.totalClientPrice, data.itinerary?.currency);
    if (tripRef.current) {
      setTrip({
        ...tripRef.current,
        cards: merged,
        totalClientPrice: data.itinerary?.totalClientPrice || tripRef.current.totalClientPrice,
        currency: data.itinerary?.currency || tripRef.current.currency,
      });
    }
  }, [data.cards, data.itinerary?.currency, data.itinerary?.totalClientPrice, setOffers, setTrip]);
  const liveCards = (data.cards || []).filter((c) => Number(c.clientPrice) > 0 || Boolean(c.image && c.href));
  const preview = [
    ...liveCards.filter((c) => c.type === "flight").slice(0, 10),
    ...liveCards.filter((c) => c.type === "hotel").slice(0, 10),
    ...liveCards.filter((c) => c.type === "car").slice(0, 4),
    ...liveCards.filter((c) => c.type === "transfer").slice(0, 4),
  ];
  return (
    <>
      <PlannerTripApply data={data} />
      {trip?.days.length || !preview.length ? null : (
        <div className="mt-3 w-full min-w-0">
          <SalesOfferCards layout="slider" cards={preview} />
        </div>
      )}
    </>
  );
}

function UserBubble() {
  return (
    <MessagePrimitive.Root className="flex justify-end gap-2.5">
      <div className="max-w-[min(92%,36rem)] rounded-2xl rounded-ee-md bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-4 py-3 text-[15px] leading-relaxed text-white shadow-md shadow-violet-900/10">
        <MessagePrimitive.Parts />
      </div>
      <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[#2E1065] ring-2 ring-violet-200/80 sm:flex shadow-xs">
        <User size={15} />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantBubble() {
  return (
    <MessagePrimitive.Root className="flex justify-start gap-2.5">
      <MessagePrimitive.Parts
        components={{
          Text: ({ text }) => {
            if (!text || !text.trim()) return null;
            return (
              <div className="flex items-start gap-2.5 w-full">
                <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#7C3AED] shadow-sm ring-1 ring-amber-400/40 sm:flex">
                  <Bot size={15} className="text-amber-300" />
                </div>
                <div className="min-w-0 w-full max-w-full flex-1 rounded-2xl rounded-es-md border border-violet-100/90 bg-white px-4 py-3.5 shadow-[0_12px_32px_-20px_rgba(46,16,101,0.22)] sm:max-w-[min(100%,44rem)]">
                  <AdvisorText text={text} />
                </div>
              </div>
            );
          },
        }}
      />
    </MessagePrimitive.Root>
  );
}

function RunningStages() {
  const lastUser = useAuiState((state) => {
    const messages = (
      state as { thread?: { messages?: ReadonlyArray<{ role?: string; content?: unknown }> } }
    ).thread?.messages;
    if (!Array.isArray(messages)) return "";
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (msg?.role !== "user") continue;
      if (typeof msg.content === "string") return msg.content;
      if (Array.isArray(msg.content)) {
        return msg.content
          .map((part) => (typeof part === "string" ? part : (part as any)?.text || ""))
          .join(" ")
          .trim();
      }
    }
    return "";
  });
  const plan = useMemo(() => planSalesChatTools(lastUser || "", lastUser || ""), [lastUser]);
  const visibleStages = useMemo(() => {
    const raw = plan.stages && plan.stages.length > 0 ? plan.stages : ["understand", "flights", "hotels", "cars", "program"];
    const hasDaysOrDates = /\d{4}-\d{2}-\d{2}|\d{1,2}\s*(أيام|ايام|يوم|days?)|شهر|أسبوع|اسبوع|برنامج|رحلة|سياحي|روما|باريس|إسطنبول|اسطنبول/i.test(lastUser || "");
    if (hasDaysOrDates || plan.intent === "INTENT_PACKAGE_PLANNER") {
      return raw.filter((s) => s !== "dates");
    }
    return raw;
  }, [plan.stages, plan.intent, lastUser]);

  const [activeStageIdx, setActiveStageIdx] = useState(0);

  useEffect(() => {
    setActiveStageIdx(0);
    const intervals = [1000, 2500, 4500, 7000, 10000];
    const timers = intervals.map((delay) =>
      window.setTimeout(() => {
        setActiveStageIdx((prev) => Math.min(prev + 1, visibleStages.length - 1));
      }, delay)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [visibleStages.length]);

  const stages = emptyStageMap();
  visibleStages.forEach((stg, i) => {
    if (i < activeStageIdx) stages[stg] = "done";
    else if (i === activeStageIdx) stages[stg] = "active";
    else stages[stg] = "pending";
  });

  return <WorkStagesTimeline stages={stages} visible={visibleStages} />;
}

function SuggestionRail({
  items,
  disabled,
  onPick,
}: {
  items: { label: string; value: string }[];
  disabled?: boolean;
  onPick: (value: string) => void;
}) {
  const { dir } = useLocale();
  return (
    <div className="relative z-10 shrink-0 border-t border-violet-100/60 bg-gradient-to-b from-white/90 to-[#FAF8FD]/95 px-3 py-2 backdrop-blur-md">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <button
            key={it.value}
            type="button"
            disabled={disabled}
            onClick={() => onPick(it.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-200/80 bg-white px-3 py-1 text-xs font-semibold text-[#4C1D95] shadow-sm transition hover:border-[#7C3AED] hover:bg-violet-50/80 hover:text-[#2E1065] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
              dir === "rtl" ? "text-right" : "text-left"
            )}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdvisorThread({
  className,
  compact,
  embedded,
  onCollapse,
}: {
  className?: string;
  compact?: boolean;
  embedded?: boolean;
  onCollapse?: () => void;
}) {
  const { t, dir, locale } = useLocale();
  const pc = plannerCopy(locale);
  const { trip, offerCards } = usePlanner();
  const aui = useAui();
  const isRunning = useAuiState((s) => Boolean(s.thread?.isRunning));
  const composerText = useAuiState((s) => String(s.composer?.text || ""));
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingRef = useRef<PendingAttachment[]>([]);
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState("");
  const [ocrBusy, setOcrBusy] = useState(false);
  pendingRef.current = pending;

  const [showDatesPicker, setShowDatesPicker] = useState(false);

  const lastUserText = useAuiState((state) => {
    const messages = (
      state as { thread?: { messages?: ReadonlyArray<{ role?: string; content?: unknown }> } }
    ).thread?.messages;
    if (!Array.isArray(messages)) return "";
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (msg?.role !== "user") continue;
      if (typeof msg.content === "string") return msg.content;
    }
    return "";
  });

  const needsDatesPrompt = useMemo(() => {
    if (!lastUserText) return false;
    if (isRunning) return false;
    if (trip || (offerCards && offerCards.length > 0)) return false;
    const plan = planSalesChatTools(lastUserText, lastUserText);
    if (plan.intent === "INTENT_PACKAGE_PLANNER") return false;
    const hasDates = /\d{4}-\d{2}-\d{2}|\d{1,2}\s*(أيام|ايام|يوم|days?)|شهر|أسبوع|اسبوع/i.test(lastUserText);
    return plan.stages.includes("dates") && !hasDates;
  }, [lastUserText, isRunning, trip, offerCards]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  const intentStarters = useMemo(
    () => [
      {
        icon: Plane,
        label: locale === "ar" ? "طيران" : "Flights",
        value:
          locale === "ar"
            ? "أريد تذاكر طيران فقط: من الدار البيضاء إلى إسطنبول ذهاب وعودة، مسافران، أفضل التواريخ القريبة."
            : "I need flight tickets only: Casablanca to Istanbul return, 2 passengers, soonest good dates.",
      },
      {
        icon: Hotel,
        label: locale === "ar" ? "فندق" : "Hotels",
        value:
          locale === "ar"
            ? "ابحث لي عن فندق فقط في إسطنبول 4 ليالٍ لغرفتين، قرب السلطان أحمد."
            : "Hotel only in Istanbul, 4 nights, two rooms, near Sultanahmet.",
      },
      {
        icon: Car,
        label: locale === "ar" ? "سيارة" : "Car",
        value:
          locale === "ar"
            ? "أريد تأجير سيارة فقط في إسطنبول من المطار لثلاثة أيام."
            : "Car rental only in Istanbul from the airport for 3 days.",
      },
      {
        icon: CalendarDays,
        label: locale === "ar" ? "برنامج شامل" : "Package",
        value:
          locale === "ar"
            ? "أريد برنامجاً سياحياً متكاملاً: طيران + فندق + تنقل، إسطنبول 5 أيام لشخصين."
            : "Full holiday package: flight + hotel + ground, Istanbul 5 days for two.",
      },
    ],
    [locale]
  );

  const quickPrompts = useMemo(
    () => [
      {
        label: locale === "ar" ? "🗓️ تحديد التواريخ والمسافرين" : "🗓️ Set Dates & Travelers",
        value: "__TOGGLE_DATES__",
      },
      ...intentStarters.map((item) => ({ label: item.label, value: item.value })),
      {
        label: locale === "ar" ? "استقبال المطار" : "Airport transfer",
        value:
          locale === "ar"
            ? "أحتاج ترانسفير خاص من مطار إسطنبول إلى الفندق لشخصين."
            : "Private airport transfer from Istanbul Airport to the hotel for two.",
      },
      {
        label: locale === "ar" ? "رحلة مباشرة أرخص" : "Cheaper nonstop",
        value:
          locale === "ar"
            ? "أريد أرخص رحلة مباشرة من الدار البيضاء إلى إسطنبول."
            : "Find the cheapest nonstop from Casablanca to Istanbul.",
      },
    ],
    [intentStarters, locale]
  );

  const flushExtras = useCallback(() => {
    setAdvisorExtras({
      attachments: pendingRef.current.map((p) => ({
        name: p.name,
        mimeType: p.mimeType,
        dataBase64: p.dataBase64,
      })),
    });
  }, []);

  const clearPending = useCallback(() => {
    setPending((prev) => {
      prev.forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
      return [];
    });
  }, []);

  const sendPrompt = useCallback(
    (raw?: string) => {
      if (isRunning || recording) return;
      const text = (raw ?? composerText).trim();
      if (!text && pendingRef.current.length === 0) return;
      flushExtras();
      aui.composer.setText(
        text || (locale === "ar" ? "أرفقت ملفاً لمراجعته." : "I attached a file for you.")
      );
      aui.composer.send();
      clearPending();
    },
    [aui, clearPending, composerText, flushExtras, isRunning, locale, recording]
  );

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;
      const room = Math.max(0, MAX_ATTACHMENTS - pendingRef.current.length);
      if (room === 0) {
        showToast(t.chat.maxAttachments);
        return;
      }
      const next: PendingAttachment[] = [];
      for (const file of list.slice(0, room)) {
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
          next.push({
            id: uid(),
            name: file.name,
            mimeType: mime,
            size: file.size,
            dataBase64,
            previewUrl: isImageMime(mime) ? URL.createObjectURL(file) : undefined,
          });
        } catch {
          showToast(t.chat.error);
        }
      }
      if (next.length) setPending((prev) => [...prev, ...next].slice(0, MAX_ATTACHMENTS));
    },
    [showToast, t.chat.error, t.chat.fileTooLarge, t.chat.maxAttachments, t.chat.unsupportedType]
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
    if (isRunning) return;
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      showToast(locale === "ar" ? "الميكروفون غير مدعوم هنا." : "Microphone is not supported here.");
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
            showToast(locale === "ar" ? "لم يُلتقط صوت. قرّب الميكروفون." : "No audio captured.");
            return;
          }
          const base64 = await blobToDataUrl(blob);
          setAdvisorExtras({
            audio: { base64, mime: blob.type || mime || "audio/webm" },
          });
          aui.composer.setText(locale === "ar" ? "رسالة صوتية" : "Voice message");
          aui.composer.send();
        });
      };
      recorderRef.current = rec;
      rec.start(250);
      setRecording(true);
    } catch {
      showToast(locale === "ar" ? "تعذر فتح الميكروفون." : "Could not open the microphone.");
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
  };

  return (
    <ThreadPrimitive.Root
      dir={dir}
      data-advisor-panel=""
      data-keep-color="true"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-[#F8F7FC] text-[#1E1B4B]",
        className
      )}
    >
      <OffersDataUI />
      <PlannerTripUI />
      {embedded && onCollapse && (
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-violet-100/90 bg-white/95 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2E1065] text-amber-300">
              <Bot size={14} />
            </span>
            <span className="text-[13px] font-black text-[#1A1438] truncate">{t.chat.title}</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.chat.online}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onCollapse}
            title={locale === "ar" ? "ملء الشاشة للكانفاس وإخفاء الشات" : "Full-Screen Canvas & Collapse Chat"}
            className="flex items-center gap-1.5 rounded-xl border border-violet-200/80 bg-violet-50/70 px-2.5 py-1 text-[11px] font-black text-[#7C3AED] hover:bg-violet-100 transition-all hover:scale-102 active:scale-98 shadow-xs"
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">{locale === "ar" ? "ملء الشاشة للكانفاس" : "Full Canvas"}</span>
          </button>
        </div>
      )}
      <div className={cn(
        "relative z-10 flex shrink-0 items-center justify-between gap-2.5 border-b border-violet-100 bg-white/95 px-3 py-3 backdrop-blur-md sm:px-4",
        (compact || embedded) && "hidden"
      )}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#7C3AED] shadow-md ring-2 ring-amber-400/60">
              <Bot size={20} className="text-amber-300" />
            </div>
            <span className="absolute -bottom-0.5 -end-0.5 flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-black tracking-tight text-[#1A1438]">
                {t.chat.title}
              </h3>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-[#7C3AED]">
                VIP Advisor
              </span>
            </div>
            <p className="flex items-center gap-1.5 truncate text-[11px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{t.chat.online}</span>
            </p>
          </div>
        </div>
      </div>

      <ThreadPrimitive.Viewport
        data-advisor-thread=""
        turnAnchor="top"
        autoScroll
        className="relative z-10 min-h-0 flex-1 basis-0 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4 sm:px-5"
      >
        <ThreadPrimitive.Empty>
          {compact ? (
            <p className="px-4 py-8 text-center text-[13px] font-medium leading-6 text-[#5B5674]">{pc.askTrip}</p>
          ) : (
            <div className="mx-auto mb-4 w-full max-w-lg">
              <p className="mb-3 text-center text-[13px] leading-relaxed text-slate-500">
                {t.chat.welcomeHint}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {intentStarters.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => sendPrompt(item.value)}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border border-violet-100 bg-white px-3 py-2.5 text-start shadow-sm transition hover:border-[#7C3AED]/35 hover:shadow-md"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4F2FA] text-[#7C3AED]">
                        <Icon size={16} />
                      </span>
                      <span className="text-[13px] font-semibold text-[#2E1065]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </ThreadPrimitive.Empty>
        <div className="flex flex-col gap-5">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: UserBubble,
              AssistantMessage: AssistantBubble,
            }}
          />
          <ThreadPrimitive.If running>
            <div className="flex items-start gap-2.5 w-full">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2E1065] shadow-md ring-1 ring-amber-400/50">
                <Bot size={15} className="text-amber-300" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <ThinkingSteps active />
              </div>
            </div>
          </ThreadPrimitive.If>
          <GeneratedTripBlock />

          {/* Interactive Customer Feedback & Continuous Improvement */}
          {(trip || (offerCards && offerCards.length > 0)) && (
            <div className="px-1">
              <TripFeedbackCard
                destination={trip?.titleAr}
                tripTitle={trip?.titleAr}
                sessionId={aui.thread?.id}
              />
            </div>
          )}

          {/* Interactive Date & Guest Selector using Platform SearchCalendar */}
          {(showDatesPicker || needsDatesPrompt) && (
            <div className="px-1">
              <AdvisorDatesPickerCard
                onConfirm={(prompt) => {
                  sendPrompt(prompt);
                  setShowDatesPicker(false);
                }}
              />
            </div>
          )}
        </div>
      </ThreadPrimitive.Viewport>

      {compact ? null : (
        <SuggestionRail
          items={quickPrompts}
          disabled={isRunning || recording}
          onPick={(value) => {
            if (value === "__TOGGLE_DATES__") {
              setShowDatesPicker((v) => !v);
              return;
            }
            sendPrompt(value);
          }}
        />
      )}

      <ComposerPrimitive.Root className="relative z-20 shrink-0 border-t border-violet-100/80 bg-[#F4F2FA] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-2">
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-amber-50/80 text-sm font-medium text-amber-700">
            {t.chat.dropFiles}
          </div>
        )}
        {pending.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pending.map((att) => (
              <div
                key={att.id}
                className="relative flex max-w-[160px] items-center gap-2 overflow-hidden rounded-xl border border-violet-200 bg-white p-1.5 pe-2"
              >
                {isImageMime(att.mimeType) && att.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={att.previewUrl} alt={att.name} className="h-11 w-11 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <FileText size={18} />
                  </div>
                )}
                <p className="truncate text-[11px] font-medium text-slate-800">{att.name}</p>
                <button
                  type="button"
                  onClick={() =>
                    setPending((prev) => {
                      const found = prev.find((p) => p.id === att.id);
                      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
                      return prev.filter((p) => p.id !== att.id);
                    })
                  }
                  className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600"
                  aria-label={t.chat.removeAttachment}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
        {recording && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-50 via-rose-100/70 to-rose-50 p-2.5 text-rose-600 border border-rose-200/60 shadow-xs">
            <Mic size={16} className="animate-bounce text-rose-500" />
            <span className="text-[12px] font-black">
              {locale === "ar" ? "جارٍ الاستماع وتسجيل صوتك بدقة عالية..." : "Listening and recording your voice..."}
            </span>
            <div className="flex items-center gap-1 ms-2">
              <span className="h-2 w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-4 w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-3 w-1 bg-rose-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div className="flex items-end gap-1.5 rounded-[26px] border border-violet-200/90 bg-white px-2 py-1.5 shadow-[0_10px_30px_-16px_rgba(46,16,101,0.35)] focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-violet-200/50 transition-all sm:gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={isRunning || pending.length >= MAX_ATTACHMENTS}
            onClick={() => fileRef.current?.click()}
            data-keep-color="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6D28D9] transition hover:bg-violet-50 disabled:opacity-40"
            aria-label={t.chat.attachFile}
            title={t.chat.attachFile}
          >
            <Paperclip size={18} />
          </button>
          <label
            data-keep-color="true"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-amber-600 transition hover:bg-amber-50"
            title={locale === "ar" ? "مسح الجواز أو إضافة صورة" : "Scan passport or add photo"}
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
                  setOcrBusy(true);
                  const res = await fetch("/api/ai/passport-ocr", { method: "POST", body: formData });
                  const ocr = await res.json();
                  if (ocr.ok && ocr.traveler) {
                    const tr = ocr.traveler;
                    aui.composer.setText(
                      locale === "ar"
                        ? `أرسلت لك صورة جواز سفري: المسافر ${tr.firstName} ${tr.lastName}، رقم الجواز: ${tr.passportNumber}، تاريخ الميلاد: ${tr.dateOfBirth}، الجنسية: ${tr.nationality}. أرجو تجهيز بياناتي للحجز.`
                        : `Here is my passport: ${tr.firstName} ${tr.lastName}, passport: ${tr.passportNumber}, DOB: ${tr.dateOfBirth}, nationality: ${tr.nationality}. Please arrange my booking.`
                    );
                  } else {
                    await addFiles([file]);
                  }
                } catch {
                  await addFiles([file]);
                } finally {
                  setOcrBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <ComposerPrimitive.Input
            rows={1}
            placeholder={
              recording
                ? locale === "ar"
                  ? "جارٍ الاستماع…"
                  : "Listening…"
                : compact
                  ? pc.askTrip
                  : t.chat.placeholder
            }
            disabled={isRunning || recording}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) flushExtras();
            }}
            className="max-h-[120px] min-h-[40px] min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-[15px] text-[#1A1438] placeholder:text-slate-400 outline-none disabled:opacity-50 sm:px-2"
          />
          <button
            type="button"
            disabled={isRunning}
            onClick={() => void toggleRecord()}
            data-keep-color="true"
            className={cn(
              "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition",
              recording ? "bg-rose-500 text-white" : "text-[#7C3AED] hover:bg-violet-50"
            )}
            aria-label={recording ? (locale === "ar" ? "إيقاف التسجيل" : "Stop recording") : locale === "ar" ? "تسجيل صوتي" : "Voice recording"}
          >
            <Mic size={18} />
          </button>
          <button
            type="button"
            disabled={isRunning || recording || ocrBusy || (!composerText.trim() && pending.length === 0)}
            onClick={() => sendPrompt()}
            data-keep-color="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white transition hover:bg-[#6D28D9] disabled:bg-violet-200"
            aria-label={t.chat.send}
          >
            {isRunning || ocrBusy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} className="rtl:-scale-x-100" />
            )}
          </button>
        </div>
        {toast ? <p className="mt-1 text-center text-xs text-rose-500">{toast}</p> : null}
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
