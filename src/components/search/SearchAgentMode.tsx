"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pause, Play, Radio, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SearchTabKey } from "@/data/search-tabs";
import {
  emitSearchAgentEvent,
  hydrateVoiceClips,
  loadSearchAgentSession,
  navigateAgentHref,
  newSearchAgentSid,
  rememberVoiceClip,
  saveSearchAgentSession,
  searchAgentCopy,
  type SearchAgentMessage,
  type SearchAgentPage,
  type SearchAgentResponse,
} from "@/lib/search-agent";
import { blobToDataUrl, inspectVoiceBlob } from "@/lib/voice-wav";
import { postMobileBridge } from "@/lib/mobile/webview-bridge";

type Props = {
  tab: SearchTabKey;
  page?: SearchAgentPage;
  context?: string;
  compact?: boolean;
  className?: string;
  onNavigate?: (href: string) => void;
  onResponse?: (res: SearchAgentResponse) => void;
};

const TAB_NAME: Record<SearchTabKey, { ar: string; en: string; tr: string }> = {
  flight: { ar: "الطيران", en: "flights", tr: "uçuş" },
  hotel: { ar: "الفنادق", en: "hotels", tr: "otel" },
  cars: { ar: "السيارات", en: "cars", tr: "araç" },
  transfers: { ar: "الترانسفير", en: "transfers", tr: "transfer" },
  tours: { ar: "الرحلات", en: "tours", tr: "tur" },
  holiday: { ar: "البرامج", en: "holidays", tr: "tatil" },
  visa: { ar: "التأشيرات", en: "visa", tr: "vize" },
  insurance: { ar: "التأمين", en: "insurance", tr: "sigorta" },
  offers: { ar: "العروض", en: "offers", tr: "fırsat" },
};

function tabLabel(tab: SearchTabKey, locale: string) {
  const row = TAB_NAME[tab];
  if (locale === "tr") return row.tr;
  if (locale === "en" || locale === "fr") return row.en;
  return row.ar;
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

function VoiceClipPlayer({
  src,
  playLabel,
  pauseLabel,
}: {
  src: string;
  playLabel: string;
  pauseLabel: string;
}) {
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return () => {
      const node = playerRef.current;
      if (!node) return;
      node.pause();
      node.src = "";
      playerRef.current = null;
    };
  }, [src]);

  const ensurePlayer = () => {
    if (playerRef.current) return playerRef.current;
    const node = new Audio(src);
    node.preload = "auto";
    node.volume = 1;
    node.muted = false;
    node.addEventListener("play", () => setPlaying(true));
    node.addEventListener("pause", () => setPlaying(false));
    node.addEventListener("ended", () => setPlaying(false));
    playerRef.current = node;
    return node;
  };

  return (
    <div className="mb-1.5 flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const node = ensurePlayer();
          if (playing) {
            node.pause();
            return;
          }
          node.currentTime = 0;
          node.muted = false;
          node.volume = 1;
          void node.play().then(() => setFailed(false)).catch(() => setFailed(true));
        }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-amber-300 shadow-sm"
        title={playing ? pauseLabel : playLabel}
      >
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ms-0.5" />}
      </button>
      <span className="text-[12px] font-black text-slate-950">{playing ? pauseLabel : playLabel}</span>
      {failed ? (
        <audio src={src} controls preload="auto" className="h-8 max-w-[160px]" />
      ) : null}
    </div>
  );
}

const MemoizedMessageList = memo(function MessageList({
  messages,
  busy,
  busyKind,
  recording,
  copy,
  compact,
  listRef,
}: {
  messages: SearchAgentMessage[];
  busy: boolean;
  busyKind: "text" | "voice" | null;
  recording: boolean;
  copy: ReturnType<typeof searchAgentCopy>;
  compact?: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={listRef}
      className={cn(
        "relative space-y-2 overflow-y-auto px-3 py-3 sm:px-4",
        compact ? "h-[160px]" : "h-[220px]"
      )}
    >
      {messages.map((m) => (
        <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
              m.role === "user"
                ? "bg-amber-400 font-semibold text-slate-950"
                : "border border-white/10 bg-white/8 text-white"
            )}
          >
            {m.audioUrl ? (
              <VoiceClipPlayer src={m.audioUrl} playLabel={copy.playVoice} pauseLabel={copy.pauseVoice} />
            ) : m.voice ? (
              <span className="mb-0.5 block text-[10px] opacity-70">{copy.voiceSent}</span>
            ) : null}
            {m.text ? <p className="whitespace-pre-wrap">{m.text}</p> : null}
          </div>
        </div>
      ))}
      {busy ? (
        <div className="flex items-center gap-2 text-[12px] text-emerald-200">
          <Loader2 size={14} className="animate-spin" />
          {recording ? copy.listening : busyKind === "voice" ? copy.transcribing : copy.thinking}
        </div>
      ) : null}
    </div>
  );
});

const AgentChatInputBar = memo(function AgentChatInputBar({
  onSend,
  onToggleRecord,
  recording,
  busy,
  copy,
}: {
  onSend: (text: string) => void;
  onToggleRecord: () => void;
  recording: boolean;
  busy: boolean;
  copy: ReturnType<typeof searchAgentCopy>;
}) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || recording) return;
    setText("");
    onSend(trimmed);
  };

  return (
    <div className="relative flex items-end gap-2 border-t border-white/10 px-3 py-2.5 sm:px-4">
      <button
        type="button"
        onClick={onToggleRecord}
        disabled={busy && !recording}
        title={recording ? copy.stop : copy.mic}
        className={cn(
          "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition cursor-pointer",
          recording
            ? "bg-rose-500 text-white"
            : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
        )}
      >
        {recording ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/40" />
        ) : (
          <span className="absolute inset-0 animate-pulse rounded-full bg-emerald-300/25" />
        )}
        <Radio size={18} className="relative" />
      </button>
      <textarea
        value={text}
        rows={1}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={recording ? copy.listening : copy.placeholder}
        className="min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-amber-300/50"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={recording || !text.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 disabled:opacity-40 cursor-pointer"
        title={copy.send}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </div>
  );
});

export function SearchAiModeSwitch({
  on,
  onChange,
  label,
  tone = "dark",
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
  tone?: "dark" | "light" | "brand";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-black tracking-wide transition",
        tone === "brand"
          ? on
            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
            : "border-amber-400 bg-amber-400 text-slate-950 shadow-sm hover:bg-amber-300"
          : tone === "light"
            ? on
              ? "border-emerald-600/40 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            : on
              ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100"
              : "border-white/15 bg-white/8 text-white/80 hover:bg-white/12"
      )}
    >
      <span
        className={cn(
          "relative flex h-5 w-9 items-center rounded-full px-0.5 transition",
          on ? "justify-end bg-emerald-400" : "justify-start bg-white/25"
        )}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
      </span>
      <span className="inline-flex items-center gap-1">
        {on ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> : null}
        {label}
      </span>
    </button>
  );
}

export default function SearchAgentMode({
  tab,
  page = "hero",
  context,
  compact = false,
  className,
  onNavigate,
  onResponse,
}: Props) {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = useMemo(() => searchAgentCopy(locale), [locale]);
  const listRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  const [sid, setSid] = useState("");
  const [messages, setMessages] = useState<SearchAgentMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [busyKind, setBusyKind] = useState<"text" | "voice" | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef<SearchAgentMessage[]>([]);
  const contextRef = useRef(context);
  messagesRef.current = messages;
  contextRef.current = context;

  useEffect(() => {
    const existing = loadSearchAgentSession();
    const nextSid = existing?.sid || newSearchAgentSid();
    setSid(nextSid);
    if (existing?.messages?.length) {
      setMessages(hydrateVoiceClips(existing.messages));
      return;
    }
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: copy.welcome(tabLabel(tab, locale)),
        at: Date.now(),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sid || !messages.length) return;
    const prev = loadSearchAgentSession();
    saveSearchAgentSession({
      sid,
      tab,
      messages,
      lastHref: prev?.lastHref,
      lastFlightHref: prev?.lastFlightHref,
      pendingFilters: prev?.pendingFilters,
      updatedAt: Date.now(),
    });
  }, [messages, sid, tab]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const persistAndGo = useCallback(
    (href: string, nextMessages?: SearchAgentMessage[]) => {
      const prev = loadSearchAgentSession();
      const toFlights = href.startsWith("/flights");
      saveSearchAgentSession({
        sid,
        tab,
        messages: nextMessages || messagesRef.current,
        lastHref: href,
        lastFlightHref: toFlights ? href : prev?.lastFlightHref,
        pendingFilters: prev?.pendingFilters,
        updatedAt: Date.now(),
      });
      if (postMobileBridge({ type: href.includes("/book") ? "book" : "navigate", href })) {
        return;
      }
      if (onNavigate) onNavigate(href);
      else navigateAgentHref(href, (next) => router.push(next));
    },
    [onNavigate, router, sid, tab]
  );

  const callAgent = useCallback(
    async (
      userText: string,
      voice?: { base64: string; mime: string; audioUrl?: string; blob?: Blob; existingId?: string }
    ) => {
      abortRef.current?.abort();
      const myId = ++reqIdRef.current;
      const ac = new AbortController();
      abortRef.current = ac;
      const timeout = window.setTimeout(() => ac.abort(), voice ? 55000 : 25000);
      setBusy(true);
      setBusyKind(voice ? "voice" : "text");
      setError("");
      let audioBase64 = voice?.base64 || "";
      if (voice?.blob && !audioBase64) {
        audioBase64 = await blobToDataUrl(voice.blob);
      }
      if (myId !== reqIdRef.current) {
        window.clearTimeout(timeout);
        return;
      }
      const existing = voice?.existingId
        ? messagesRef.current.find((m) => m.id === voice.existingId)
        : undefined;
      const userMsg: SearchAgentMessage = existing
        ? { ...existing, audioUrl: existing.audioUrl || voice?.audioUrl }
        : {
            id: `u_${Date.now()}`,
            role: "user",
            text: userText,
            voice: Boolean(voice),
            audioUrl: voice?.audioUrl,
            at: Date.now(),
          };
      const nextMessages = existing
        ? messagesRef.current.map((m) => (m.id === userMsg.id ? userMsg : m))
        : [...messagesRef.current, userMsg];
      setMessages(nextMessages);
      messagesRef.current = nextMessages;
      try {
        const session = loadSearchAgentSession();
        const pageUrl = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
        const history = nextMessages
          .filter((m) => m.id !== "welcome")
          .slice(-16)
          .map((m) => ({ role: m.role, content: m.text || " " }));
        const res = await fetch("/api/gemini/search-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            messages: history.length
              ? history
              : [{ role: "user", content: userText }],
            locale,
            tab,
            page,
            sid,
            context: contextRef.current,
            lastHref: session?.lastHref || pageUrl,
            lastFlightHref: session?.lastFlightHref || "",
            pageUrl,
            audioBase64,
            audioMime: voice?.mime,
          }),
        });
        const data = (await res.json()) as SearchAgentResponse | { ok: false; error?: string };
        if (myId !== reqIdRef.current) return;
        if (!res.ok || !("ok" in data) || !data.ok) {
          throw new Error(("error" in data && data.error) || copy.offline);
        }
        if (data.transcript) {
          userMsg.text = data.transcript;
        }
        const assistantMsg: SearchAgentMessage = {
          id: `a_${Date.now()}`,
          role: "assistant",
          text: data.reply,
          at: Date.now(),
        };
        const committed = [
          ...nextMessages.map((m) => (m.id === userMsg.id ? userMsg : m)),
          assistantMsg,
        ];
        setMessages(committed);
        saveSearchAgentSession({
          sid,
          tab,
          messages: committed,
          lastHref: data.href || session?.lastHref,
          lastFlightHref: data.href?.startsWith("/flights") ? data.href : session?.lastFlightHref,
          pendingFilters: data.filters,
          updatedAt: Date.now(),
        });
        onResponse?.(data);
        emitSearchAgentEvent({ ...data, source: page });
        if ((data.action === "navigate" || data.action.startsWith("upsell_") || data.action === "book") && data.href) {
          window.setTimeout(() => {
            if (myId === reqIdRef.current) persistAndGo(data.href!, committed);
          }, 200);
        }
      } catch (err) {
        if (myId !== reqIdRef.current) return;
        const timedOut =
          (err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")) ||
          /timeout|aborted/i.test(err instanceof Error ? err.message : "");
        const notice = timedOut ? (voice ? copy.voiceSlow : copy.offline) : err instanceof Error ? err.message : copy.offline;
        setError(notice);
        setMessages((prev) => [
          ...prev,
          { id: `e_${Date.now()}`, role: "assistant", text: notice, at: Date.now() },
        ]);
      } finally {
        window.clearTimeout(timeout);
        if (myId === reqIdRef.current) {
          setBusy(false);
          setBusyKind(null);
        }
      }
    },
    [copy.offline, copy.voiceSlow, locale, onResponse, page, persistAndGo, sid, tab]
  );

  const handleSendText = useCallback(
    (text: string) => {
      void callAgent(text);
    },
    [callAgent]
  );

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
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
    if (busy) return;
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(copy.voiceUnsupported);
      return;
    }
    try {
      try {
        const perm = await navigator.permissions?.query({ name: "microphone" as PermissionName });
        if (perm?.state === "denied") {
          setError(copy.micDenied);
          return;
        }
      } catch {
        /* permissions API optional */
      }
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
        stopStream();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime || "audio/webm" });
        if (blob.size < 1200) {
          setError(copy.voiceTooShort);
          return;
        }
        void inspectVoiceBlob(blob).then((probe) => {
          if (!probe.audible) {
            setError(copy.voiceSilent);
            return;
          }
          const audioUrl = URL.createObjectURL(blob);
          const userMsg: SearchAgentMessage = {
            id: `u_${Date.now()}`,
            role: "user",
            text: "",
            voice: true,
            audioUrl,
            at: Date.now(),
          };
          setMessages((prev) => {
            const next = [...prev, userMsg];
            messagesRef.current = next;
            return next;
          });
          void blobToDataUrl(blob).then((dataUrl) => rememberVoiceClip(userMsg.id, dataUrl));
          void callAgent(copy.voiceSent, {
            base64: "",
            mime: blob.type || "audio/webm",
            audioUrl,
            blob,
            existingId: userMsg.id,
          });
        });
      };
      recorderRef.current = rec;
      rec.start(250);
      setRecording(true);
      setError("");
      window.setTimeout(() => {
        if (recorderRef.current === rec && rec.state === "recording") {
          try {
            rec.requestData();
          } catch {
            /* ignore */
          }
          rec.stop();
          setRecording(false);
        }
      }, 20000);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? copy.micDenied
          : "تعذر تفعيل الميكروفون. يرجى التأكد من منح إذن الميكروفون لتطبيق لوناليزا في إعدادات الهاتف."
      );
    }
  };

  useEffect(() => () => stopStream(), []);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#12081f] text-white",
        compact ? "min-h-[220px]" : "min-h-[280px]",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/40">
            <Radio size={18} className="text-emerald-300" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-black tracking-tight">{copy.liveWith}</p>
            <p className="truncate text-[11px] text-white/60">{copy.liveHint}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {copy.live}
        </span>
      </div>

      <MemoizedMessageList
        messages={messages}
        busy={busy}
        busyKind={busyKind}
        recording={recording}
        copy={copy}
        compact={compact}
        listRef={listRef}
      />

      {error ? <p className="px-4 pb-1 text-[11px] text-rose-300">{error}</p> : null}

      <AgentChatInputBar
        onSend={handleSendText}
        onToggleRecord={() => void toggleRecord()}
        recording={recording}
        busy={busy}
        copy={copy}
      />
    </div>
  );
}
