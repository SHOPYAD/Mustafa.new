"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  Compass,
  Lock,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Smile,
  User,
  Users,
} from "lucide-react";
import EmojiPickerPanel from "@/components/messaging/EmojiPickerPanel";
import VoiceNoteRecorder from "@/components/messaging/VoiceNoteRecorder";
import LonalizaAudioPlayer from "@/components/messaging/LonalizaAudioPlayer";
import InAppMessageToast from "@/components/messaging/InAppMessageToast";
import { uploadToBlossom } from "@/lib/nostr/blossom-uploader";
import {
  DEFAULT_DM_RELAYS,
  decryptDmText,
  decryptVoiceBytes,
  encryptDmText,
  encryptVoiceBytes,
  giftWrapText,
  publishGiftWrap,
} from "@/lib/nostr/encrypted-dm";
import { notifyIncomingMessage } from "@/lib/messaging/native-notify";
import { registerLocalNostrPubkey } from "@/lib/messaging/register-pubkey";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const MESSENGER_COPY: Record<
  "ar" | "en" | "tr" | "fr",
  {
    title: string;
    searchPlaceholder: string;
    findCompanions: string;
    noChats: string;
    noChatsHint: string;
    activeNow: string;
    encryptedNotice: string;
    typeMessage: string;
    send: string;
    profile: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    endToEndEncrypted: string;
    voiceNote: string;
    directMessage: string;
    verifiedTraveler: string;
    startChatting: string;
    loading: string;
    back: string;
  }
> = {
  ar: {
    title: "محادثات لوناليزا",
    searchPlaceholder: "ابحث في محادثاتك...",
    findCompanions: "استكشف رفقاء السفر",
    noChats: "لا توجد محادثات نشطة بعد",
    noChatsHint: "تواصل مع رفقاء السفر المعتمدين حول العالم ونسّق رحلاتك وجولاتك السياحية بكل سهولة وأمان.",
    activeNow: "متصل الآن • محادثة مشفرة",
    encryptedNotice: "المحادثات في شبكة لوناليزا محمية بتشفير مباشر لضمان خصوصيتك وأمان رحلتك",
    typeMessage: "اكتب رسالة...",
    send: "إرسال",
    profile: "الملف الشخصي",
    welcomeTitle: "مسنجر لوناليزا الذكي",
    welcomeSubtitle: "تنسيق فوري وآمن مع رفقاء السفر والوكالات السياحية المعتمدة. رسائلك متزامنة عبر كافة الأجهزة.",
    endToEndEncrypted: "محادثات مشفرة لحماية خصوصية سفرك",
    voiceNote: "تسجيل صوتي",
    directMessage: "رسالة مباشرة",
    verifiedTraveler: "عضو موثق",
    startChatting: "ابدأ المحادثة الآن",
    loading: "جارٍ التحميل...",
    back: "رجوع",
  },
  en: {
    title: "Lonaliza Messages",
    searchPlaceholder: "Search conversations...",
    findCompanions: "Find Travel Buddies",
    noChats: "No active conversations yet",
    noChatsHint: "Connect with verified travel companions worldwide and coordinate your custom journeys safely.",
    activeNow: "Active now • End-to-end secured",
    encryptedNotice: "All Lonaliza travel chats are directly encrypted to ensure your journey privacy and safety",
    typeMessage: "Type a message...",
    send: "Send",
    profile: "Profile",
    welcomeTitle: "Lonaliza Travel Messenger",
    welcomeSubtitle: "Instant travel coordination with verified companions and partner agencies. Synced securely across all devices.",
    endToEndEncrypted: "Encrypted for travel privacy",
    voiceNote: "Voice note",
    directMessage: "Direct message",
    verifiedTraveler: "Verified Traveler",
    startChatting: "Start conversation",
    loading: "Loading...",
    back: "Back",
  },
  tr: {
    title: "Lonaliza Mesajlar",
    searchPlaceholder: "Sohbetlerde ara...",
    findCompanions: "Yol Arkadaşlarını Keşfet",
    noChats: "Henüz aktif bir sohbet yok",
    noChatsHint: "Dünya genelindeki doğrulanmış seyahat arkadaşlarıyla iletişim kurun ve seyahatlerinizi güvenle planlayın.",
    activeNow: "Şimdi aktif • Uçtan uca şifreli",
    encryptedNotice: "Lonaliza seyahat sohbetleri gizliliğinizi korumak için doğrudan şifrelenir",
    typeMessage: "Bir mesaj yazın...",
    send: "Gönder",
    profile: "Profil",
    welcomeTitle: "Lonaliza Seyahat Mesajlaşması",
    welcomeSubtitle: "Doğrulanmış yol arkadaşları ve ajanslarla anlık koordinasyon. Tüm cihazlarınızda güvenle senkronize.",
    endToEndEncrypted: "Seyahat gizliliği için şifrelenmiştir",
    voiceNote: "Ses kaydı",
    directMessage: "Doğrudan mesaj",
    verifiedTraveler: "Doğrulanmış Gezgin",
    startChatting: "Sohbete başlayın",
    loading: "Yükleniyor...",
    back: "Geri",
  },
  fr: {
    title: "Messages Lonaliza",
    searchPlaceholder: "Rechercher...",
    findCompanions: "Explorer les compagnons",
    noChats: "Aucune conversation active",
    noChatsHint: "Connectez-vous avec des compagnons de voyage certifiés à travers le monde et organisez vos séjours en toute sécurité.",
    activeNow: "En ligne • Chiffré de bout en bout",
    encryptedNotice: "Les échanges Lonaliza sont protégés par un chiffrement direct pour préserver votre vie privée",
    typeMessage: "Écrire un message...",
    send: "Envoyer",
    profile: "Profil",
    welcomeTitle: "Messagerie Voyage Lonaliza",
    welcomeSubtitle: "Coordination instantanée avec vos compagnons de route et agences partenaires. Synchronisé sur tous vos appareils.",
    endToEndEncrypted: "Chiffré de bout en bout pour votre sécurité",
    voiceNote: "Message vocal",
    directMessage: "Message direct",
    verifiedTraveler: "Voyageur Vérifié",
    startChatting: "Commencer la discussion",
    loading: "Chargement...",
    back: "Retour",
  },
};

type ThreadSummary = {
  id: string;
  title: string;
  type: string;
  peerUserId?: string;
  peerName?: string;
  peerAvatar?: string;
  lastPreview?: string;
  updatedAt: string;
  unread: number;
};

type Msg = {
  id: string;
  fromUserId?: string;
  text: string;
  encrypted?: boolean;
  preview?: string;
  media?: { kind: "voice"; url: string; mime: string; durationMs: number; size: number; wrappedKey?: string };
  createdAt: string;
  mine?: boolean;
};

type ThreadDetail = {
  id: string;
  title: string;
  peerUserId?: string;
  peerName?: string;
  peerAvatar?: string;
  peerNostrPubkey?: string;
  messages: Msg[];
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "L"
  );
}

function formatChatTime(iso: string, locale: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" });
}

export default function WhatsAppMessenger({ initialThreadId }: { initialThreadId?: string }) {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";
  const isRtl = dir === "rtl" || isAr;
  const langKey = (["ar", "en", "tr", "fr"].includes(locale) ? locale : "ar") as "ar" | "en" | "tr" | "fr";
  const copy = MESSENGER_COPY[langKey];
  const searchParams = useSearchParams();
  const threadIdFromUrl = searchParams?.get("threadId");

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialThreadId || threadIdFromUrl || null);
  const selectedThreadIdRef = useRef<string | null>(initialThreadId || threadIdFromUrl || null);
  const hasInitializedRef = useRef(false);

  const [threadData, setThreadData] = useState<ThreadDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [plainMessages, setPlainMessages] = useState<Record<string, string>>({});
  const [voiceUrls, setVoiceUrls] = useState<Record<string, string>>({});
  const [inputText, setInputText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);
  const lastIncomingId = useRef("");

  // Keep ref in sync
  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
  }, [selectedThreadId]);

  // Robust thread selector that updates URL query without re-rendering the whole page
  function selectThread(id: string | null) {
    setSelectedThreadId(id);
    selectedThreadIdRef.current = id;
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (id) {
        url.searchParams.set("tab", "messages");
        url.searchParams.set("threadId", id);
      } else {
        url.searchParams.delete("threadId");
      }
      window.history.replaceState({}, "", url.toString());
    }
  }

  // Sync with initialThreadId or URL param ONLY on initial mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      const target = initialThreadId || threadIdFromUrl;
      if (target) {
        setSelectedThreadId(target);
        selectedThreadIdRef.current = target;
      }
      hasInitializedRef.current = true;
    }
  }, [initialThreadId, threadIdFromUrl]);

  // Load threads list from backend API
  async function loadThreadsList() {
    try {
      const res = await fetch("/api/account/inbox", { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.threads)) {
        setThreads(data.threads);
        // Auto select first thread ONLY if desktop and user has NEVER selected any thread
        if (!selectedThreadIdRef.current && data.threads.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
          selectThread(data.threads[0].id);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingThreads(false);
    }
  }

  // Decrypt thread messages & voice notes
  async function decryptThread(thread: ThreadDetail) {
    const theirKey = thread.peerNostrPubkey || "";
    const nextPlain: Record<string, string> = {};
    const nextVoice: Record<string, string> = {};

    for (const m of thread.messages) {
      // Handle voice notes
      if (m.media?.kind === "voice") {
        if (!m.media.wrappedKey || !theirKey) {
          nextVoice[m.id] = m.media.url;
        } else {
          try {
            const res = await fetch(m.media.url);
            const buf = new Uint8Array(await res.arrayBuffer());
            const opened = await decryptVoiceBytes(buf, m.media.wrappedKey, theirKey);
            const blob = new Blob([opened as unknown as BlobPart], { type: m.media.mime || "audio/webm" });
            nextVoice[m.id] = URL.createObjectURL(blob);
          } catch {
            nextVoice[m.id] = m.media.url;
          }
        }
        continue;
      }

      // Handle text messages
      if (!m.encrypted || !theirKey) {
        nextPlain[m.id] = m.text || m.preview || "";
        continue;
      }
      try {
        nextPlain[m.id] = decryptDmText(m.text, theirKey);
      } catch {
        nextPlain[m.id] = m.preview || m.text || copy.directMessage;
      }
    }

    setPlainMessages(nextPlain);
    setVoiceUrls((prev) => ({ ...prev, ...nextVoice }));
  }

  // Load active thread details
  async function loadActiveThread(id: string) {
    try {
      const res = await fetch(`/api/account/inbox/${id}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (data?.ok && data.thread) {
        const next = data.thread as ThreadDetail;
        const incoming = [...next.messages].reverse().find((m) => !m.mine);
        if (incoming && incoming.id !== lastIncomingId.current) {
          if (lastIncomingId.current) {
            notifyIncomingMessage(next.peerName || next.title, `/account?tab=messages&threadId=${id}`);
          }
          lastIncomingId.current = incoming.id;
        }
        setThreadData(next);
        void decryptThread(next);
      }
    } catch {
      // ignore
    }
  }

  // Initial load
  useEffect(() => {
    void registerLocalNostrPubkey();
    void loadThreadsList();
    const timer = window.setInterval(() => void loadThreadsList(), 6000);
    return () => window.clearInterval(timer);
  }, []);

  // Poll active thread
  useEffect(() => {
    if (!selectedThreadId) {
      setThreadData(null);
      prevMsgCountRef.current = 0;
      return;
    }
    prevMsgCountRef.current = 0;
    void loadActiveThread(selectedThreadId);
    const timer = window.setInterval(() => void loadActiveThread(selectedThreadId), 4000);
    return () => window.clearInterval(timer);
  }, [selectedThreadId]);

  // SMART AUTO-SCROLL: ONLY scrolls internal container when a NEW message arrives or on thread open
  useEffect(() => {
    if (!threadData?.messages) return;
    const currentCount = threadData.messages.length;
    const isNew = currentCount > prevMsgCountRef.current;
    const isInitial = prevMsgCountRef.current === 0 && currentCount > 0;
    prevMsgCountRef.current = currentCount;

    if (isInitial || isNew) {
      const container = scrollContainerRef.current;
      if (container) {
        // Small delay ensures DOM nodes have updated height
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: isInitial ? "auto" : "smooth",
          });
        }, 60);
      }
    }
  }, [threadData?.messages.length, selectedThreadId]);

  // Send Text Message
  async function handleSendText() {
    const activeId = selectedThreadIdRef.current || selectedThreadId;
    const body = inputText.trim();
    if (!body || !activeId) return;
    setSending(true);
    try {
      if (threadData?.peerNostrPubkey) {
        try {
          const cipher = encryptDmText(body, threadData.peerNostrPubkey);
          let giftWrapId = "";
          try {
            const wrap = giftWrapText(body, threadData.peerNostrPubkey);
            giftWrapId = wrap.id;
            void publishGiftWrap(wrap, DEFAULT_DM_RELAYS);
          } catch {
            /* relays optional */
          }
          await fetch(`/api/account/inbox/${activeId}`, {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              cipher,
              encrypted: true,
              preview: body,
              giftWrapId,
            }),
          });
          setInputText("");
          setEmojiOpen(false);
          await loadActiveThread(activeId);
          await loadThreadsList();
          return;
        } catch {
          // fallback to plain send
        }
      }

      await fetch(`/api/account/inbox/${activeId}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cipher: body,
          encrypted: false,
          preview: body,
        }),
      });
      setInputText("");
      setEmojiOpen(false);
      await loadActiveThread(activeId);
      await loadThreadsList();
    } finally {
      setSending(false);
    }
  }

  // Send Voice Note
  async function handleSendVoice(file: File, durationMs: number) {
    const activeId = selectedThreadIdRef.current || selectedThreadId;
    if (!activeId) return;
    setSending(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (threadData?.peerNostrPubkey) {
        try {
          const { ciphertext, wrappedKey } = await encryptVoiceBytes(bytes, threadData.peerNostrPubkey);
          const encryptedFile = new File([ciphertext as unknown as BlobPart], `enc-${file.name}.bin`, {
            type: "application/octet-stream",
          });
          const uploaded = await uploadToBlossom(encryptedFile);
          const cipher = encryptDmText(JSON.stringify({ t: "voice", url: uploaded.url }), threadData.peerNostrPubkey);
          await fetch(`/api/account/inbox/${activeId}`, {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              cipher,
              encrypted: true,
              preview: copy.voiceNote,
              media: {
                kind: "voice",
                url: uploaded.url,
                mime: file.type || "audio/webm",
                durationMs,
                size: uploaded.size,
                wrappedKey,
              },
            }),
          });
          await loadActiveThread(activeId);
          await loadThreadsList();
          return;
        } catch {
          // fallback to plain voice
        }
      }

      const uploaded = await uploadToBlossom(file).catch(() => null);
      if (uploaded?.url) {
        await fetch(`/api/account/inbox/${activeId}`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            cipher: "voice",
            encrypted: false,
            preview: copy.voiceNote,
            media: {
              kind: "voice",
              url: uploaded.url,
              mime: file.type || "audio/webm",
              durationMs,
              size: file.size,
            },
          }),
        });
        await loadActiveThread(selectedThreadId);
        await loadThreadsList();
      }
    } finally {
      setSending(false);
    }
  }

  // Filter threads
  const filteredThreads = threads.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.title?.toLowerCase().includes(q) ||
      t.peerName?.toLowerCase().includes(q) ||
      t.lastPreview?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-purple-200/60 bg-white shadow-2xl shadow-purple-950/10">
      <InAppMessageToast />

      {/* Strict 40% / 60% Split-Screen Layout Pinned to Viewport */}
      <div className="flex h-[calc(100vh-140px)] min-h-[500px] max-h-[820px] w-full overflow-hidden">
        {/* 40% Sidebar: Conversations List */}
        <aside
          className={`flex w-full flex-col min-h-0 border-e border-purple-100 bg-white md:w-[40%] md:flex ${
            selectedThreadId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Sidebar Header: Lonaliza Luxury Branding */}
          <div className="flex items-center justify-between border-b border-purple-100/80 bg-gradient-to-r from-[#1d0933] to-[#2d1052] px-4 py-3 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-amber-300 shadow-inner backdrop-blur-md ring-1 ring-amber-400/30">
                  <MessageCircle size={20} className="text-amber-400" />
                </div>
                <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-[#1d0933] bg-emerald-500" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">{copy.title}</h2>
                <p className="text-[11px] font-bold text-amber-300/80">
                  {threads.length} {isAr ? "محادثة" : "conversations"}
                </p>
              </div>
            </div>

            <Link
              href="/account?tab=buddies"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1.5 text-xs font-black text-amber-300 hover:bg-amber-400/30 transition-all shadow-sm"
            >
              <Compass size={14} className="text-amber-300" />
              <span className="hidden sm:inline">{copy.findCompanions}</span>
            </Link>
          </div>

          {/* Search Box */}
          <div className="border-b border-purple-50 bg-[#fdfcff] p-3 shrink-0">
            <div className="relative flex items-center rounded-2xl bg-purple-50/70 px-3 py-1.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-400/30">
              <Search size={16} className="shrink-0 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full bg-transparent px-2.5 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-purple-50/60">
            {loadingThreads ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-xs font-bold text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                <span>{copy.loading}</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-50 text-purple-600">
                  <Users size={26} />
                </div>
                <p className="text-sm font-black text-slate-800">{copy.noChats}</p>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">{copy.noChatsHint}</p>
                <Link
                  href="/account?tab=buddies"
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#2E1065] px-4 py-2 text-xs font-black text-amber-300 hover:bg-[#3B1582] shadow-sm transition-all"
                >
                  <Compass size={15} />
                  <span>{copy.findCompanions}</span>
                </Link>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === selectedThreadId;
                const contactName = t.peerName || t.title || copy.directMessage;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectThread(t.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-start transition-all ${
                      isSelected
                        ? "bg-purple-50/90 border-s-4 border-purple-700 font-semibold"
                        : "hover:bg-slate-50 active:bg-slate-100"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {t.peerAvatar ? (
                        <img
                          src={t.peerAvatar}
                          alt={contactName}
                          className="h-11 w-11 rounded-2xl object-cover shadow-xs ring-1 ring-purple-200"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2E1065] to-indigo-800 text-sm font-black text-amber-300 shadow-xs">
                          {initials(contactName)}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    </div>

                    {/* Preview Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-black text-slate-900">{contactName}</p>
                        <span className="shrink-0 text-[10px] font-bold text-slate-400 font-mono">
                          {formatChatTime(t.updatedAt, locale)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-1">
                        <p className={`truncate text-xs ${t.unread > 0 ? "font-bold text-purple-950" : "text-slate-500"}`}>
                          {t.lastPreview || copy.startChatting}
                        </p>
                        {t.unread > 0 && (
                          <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#7C3AED] px-1.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                            {t.unread > 9 ? "9+" : t.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* 60% Active Chat Pane */}
        <main
          className={`flex-1 flex flex-col min-w-0 min-h-0 bg-[#f8f7fc] relative md:w-[60%] ${
            !selectedThreadId ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedThreadId && threadData ? (
            <>
              {/* Lonaliza Luxury Chat Header (Pinned) */}
              <div className="flex items-center justify-between border-b border-purple-100 bg-white px-4 py-2.5 shadow-xs shrink-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => selectThread(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 md:hidden"
                    aria-label={copy.back}
                  >
                    {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                  </button>

                  {/* Peer Avatar */}
                  <div className="relative shrink-0">
                    {threadData.peerAvatar ? (
                      <img
                        src={threadData.peerAvatar}
                        alt=""
                        className="h-10 w-10 rounded-2xl object-cover shadow-xs ring-1 ring-purple-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2E1065] to-indigo-700 text-xs font-black text-amber-300">
                        {initials(threadData.peerName || threadData.title)}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>

                  {/* Peer Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-black text-slate-900">
                        {threadData.peerName || threadData.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-700">
                        {copy.verifiedTraveler}
                      </span>
                    </div>
                    <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{copy.activeNow}</span>
                    </p>
                  </div>
                </div>

                {/* Header Trailing Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    title={copy.endToEndEncrypted}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 border border-purple-200/70 shadow-xs"
                  >
                    <ShieldCheck size={18} />
                  </span>
                </div>
              </div>

              {/* Lonaliza Chat Message Feed (Internal Scroll Container Only) */}
              <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3"
                style={{
                  backgroundColor: "#f8f7fc",
                }}
              >
                {/* Security Privacy Notice */}
                <div className="my-1 flex justify-center">
                  <div className="inline-flex max-w-md items-center gap-2 rounded-2xl bg-purple-100/80 border border-purple-200/70 px-3.5 py-1.5 text-center text-[11px] font-bold text-purple-900 shadow-xs">
                    <ShieldCheck size={14} className="shrink-0 text-purple-700" />
                    <span>{copy.encryptedNotice}</span>
                  </div>
                </div>

                {/* Messages Stream */}
                {threadData.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                        m.mine
                          ? "rounded-ee-sm bg-[#EDE9FE] text-[#1E0836] border border-purple-300/60 shadow-purple-950/5"
                          : "rounded-es-sm bg-white text-slate-900 border border-slate-200 shadow-sm"
                      }`}
                    >
                      {/* Voice Note or Text */}
                      {m.media?.kind === "voice" ? (
                        <LonalizaAudioPlayer
                          src={voiceUrls[m.id] || m.media.url}
                          durationMs={m.media.durationMs}
                          bubbleTone={m.mine ? "purple" : "white"}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-6 font-medium">
                          {plainMessages[m.id] || m.preview || m.text || ""}
                        </p>
                      )}

                      {/* Timestamp and Double Checkmarks */}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString(isAr ? "ar-EG" : "en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {m.mine && <CheckCheck size={14} className="text-[#7C3AED]" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lonaliza Chat Input Toolbar (Pinned to Bottom) */}
              <div className="relative border-t border-purple-100 bg-white px-3.5 py-2.5 shrink-0 z-10">
                <EmojiPickerPanel
                  open={emojiOpen}
                  onClose={() => setEmojiOpen(false)}
                  onPick={(emoji) => setInputText((v) => v + emoji)}
                />
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendText();
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEmojiOpen((v) => !v)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                    aria-label="إيموجي"
                  >
                    <Smile size={20} />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={copy.typeMessage}
                    className="min-h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
                  />

                  {inputText.trim() ? (
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2E1065] to-[#7C3AED] text-amber-300 hover:scale-105 active:scale-95 disabled:opacity-40 shadow-md transition-all"
                      aria-label={copy.send}
                    >
                      <Send size={18} className={isRtl ? "rotate-180" : ""} />
                    </button>
                  ) : (
                    <VoiceNoteRecorder
                      disabled={sending}
                      onRecorded={(file, ms) => void handleSendVoice(file, ms)}
                    />
                  )}
                </form>
              </div>
            </>
          ) : (
            /* 60% Welcome Screen */
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#fdfcff] border-b-4 border-[#2E1065]">
              <div className="relative mb-6">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#1d0933] to-[#2d1052] text-amber-300 shadow-xl ring-4 ring-purple-100">
                  <MessageCircle size={52} className="text-amber-400" />
                </div>
                <span className="absolute -bottom-1 -end-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#7C3AED] text-white shadow-md">
                  <Lock size={16} />
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-900">{copy.welcomeTitle}</h2>
              <p className="mt-3 max-w-md text-xs sm:text-sm leading-6 text-slate-600">
                {copy.welcomeSubtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/account?tab=buddies"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2E1065] px-5 py-2.5 text-xs font-black text-amber-300 hover:bg-[#3B1582] shadow-md transition-all hover:scale-105"
                >
                  <Compass size={16} />
                  <span>{copy.findCompanions}</span>
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <ShieldCheck size={14} className="text-purple-600" />
                <span>{copy.endToEndEncrypted}</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
