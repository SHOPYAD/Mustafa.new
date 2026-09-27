"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Smile, CheckCheck, ShieldCheck, User } from "lucide-react";
import NativeAppBar from "@/components/chrome/NativeAppBar";
import EmptyStateCard from "@/components/chrome/EmptyStateCard";
import EmojiPickerPanel from "@/components/messaging/EmojiPickerPanel";
import VoiceNoteRecorder from "@/components/messaging/VoiceNoteRecorder";
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

type Thread = {
  id: string;
  title: string;
  peerUserId?: string;
  peerName?: string;
  peerAvatar?: string;
  peerNostrPubkey?: string;
  messages: Msg[];
};

export default function ChatThreadView({ threadId }: { threadId: string }) {
  const { locale, t } = useLocale();
  const isAr = locale === "ar";
  const [thread, setThread] = useState<Thread | null>(null);
  const [plain, setPlain] = useState<Record<string, string>>({});
  const [voiceUrl, setVoiceUrl] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIncoming = useRef("");

  async function decryptThread(next: Thread) {
    const theirKey = next.peerNostrPubkey || "";
    const nextPlain: Record<string, string> = {};
    for (const m of next.messages) {
      if (!m.encrypted || !theirKey) {
        nextPlain[m.id] = m.text || m.preview || "";
        continue;
      }
      try {
        nextPlain[m.id] = decryptDmText(m.text, theirKey);
      } catch {
        nextPlain[m.id] = m.preview || m.text || (isAr ? "رسالة خاصة" : "Direct message");
      }
    }
    setPlain(nextPlain);
  }

  async function load() {
    const res = await fetch(`/api/account/inbox/${threadId}`, { credentials: "include", cache: "no-store" });
    const data = await res.json();
    if (!data.ok) {
      setError("not_found");
      return;
    }
    const next = data.thread as Thread;
    const incoming = [...next.messages].reverse().find((m) => !m.mine);
    if (incoming && incoming.id !== lastIncoming.current) {
      if (lastIncoming.current) notifyIncomingMessage(next.peerName || next.title, `/account/messages/${threadId}`);
      lastIncoming.current = incoming.id;
    }
    setThread(next);
    await decryptThread(next);
  }

  useEffect(() => {
    void registerLocalNostrPubkey();
    void load().catch(() => setError("load"));
    const id = window.setInterval(() => void load().catch(() => undefined), 5000);
    return () => window.clearInterval(id);
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, plain]);

  async function sendCipher(cipher: string, preview: string, rumorText: string, extra?: Record<string, unknown>) {
    let giftWrapId = "";
    if (thread?.peerNostrPubkey) {
      try {
        const wrap = giftWrapText(rumorText, thread.peerNostrPubkey);
        giftWrapId = wrap.id;
        void publishGiftWrap(wrap, DEFAULT_DM_RELAYS);
      } catch {
        /* relays optional */
      }
    }
    await fetch(`/api/account/inbox/${threadId}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cipher, encrypted: Boolean(thread?.peerNostrPubkey), preview, giftWrapId, ...extra }),
    });
    setText("");
    setEmojiOpen(false);
    await load();
  }

  async function sendText() {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      if (thread?.peerNostrPubkey) {
        try {
          const cipher = encryptDmText(body, thread.peerNostrPubkey);
          await sendCipher(cipher, body, body);
          return;
        } catch {
          // fallback to direct message
        }
      }
      await fetch(`/api/account/inbox/${threadId}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cipher: body, encrypted: false, preview: body }),
      });
      setText("");
      setEmojiOpen(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function sendVoice(file: File, durationMs: number) {
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (thread?.peerNostrPubkey) {
        try {
          const { ciphertext, wrappedKey } = await encryptVoiceBytes(bytes, thread.peerNostrPubkey);
          const encryptedFile = new File([ciphertext as unknown as BlobPart], `enc-${file.name}.bin`, { type: "application/octet-stream" });
          const uploaded = await uploadToBlossom(encryptedFile);
          const cipher = encryptDmText(JSON.stringify({ t: "voice", url: uploaded.url }), thread.peerNostrPubkey);
          await sendCipher(cipher, isAr ? "رسالة صوتية" : "Voice note", JSON.stringify({ t: "voice", url: uploaded.url }), {
            media: {
              kind: "voice",
              url: uploaded.url,
              mime: file.type || "audio/webm",
              durationMs,
              size: uploaded.size,
              wrappedKey,
            },
          });
          return;
        } catch {
          // fallback to regular voice upload
        }
      }
      const uploaded = await uploadToBlossom(file).catch(() => null);
      if (uploaded?.url) {
        await fetch(`/api/account/inbox/${threadId}`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            cipher: "voice",
            encrypted: false,
            preview: isAr ? "رسالة صوتية" : "Voice note",
            media: {
              kind: "voice",
              url: uploaded.url,
              mime: file.type || "audio/webm",
              durationMs,
              size: file.size,
            },
          }),
        });
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function playVoice(m: Msg) {
    if (!m.media) return;
    if (voiceUrl[m.id]) return;
    if (!m.media.wrappedKey || !thread?.peerNostrPubkey) {
      setVoiceUrl((prev) => ({ ...prev, [m.id]: m.media?.url || "" }));
      return;
    }
    try {
      const res = await fetch(m.media.url);
      const buf = new Uint8Array(await res.arrayBuffer());
      const opened = await decryptVoiceBytes(buf, m.media.wrappedKey, thread.peerNostrPubkey);
      const blob = new Blob([opened as unknown as BlobPart], { type: m.media.mime || "audio/webm" });
      setVoiceUrl((prev) => ({ ...prev, [m.id]: URL.createObjectURL(blob) }));
    } catch {
      setVoiceUrl((prev) => ({ ...prev, [m.id]: m.media?.url || "" }));
    }
  }

  if (error) {
    return (
      <div className="lonaliza-web-header-offset mx-auto max-w-lg px-4 pb-24 pt-24">
        <NativeAppBar title={t.account.shortMessages} fallbackHref="/account?tab=messages" />
        <EmptyStateCard title={t.appChrome.chatUnavailable} description={t.appChrome.chatUnavailableHint} />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="lonaliza-web-header-offset flex min-h-[50vh] items-center justify-center pt-24 text-sm font-bold text-slate-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="lonaliza-web-header-offset mx-auto flex min-h-[100dvh] max-w-2xl flex-col overflow-x-hidden bg-[#efeae2] pb-[env(safe-area-inset-bottom)]">
      <InAppMessageToast />
      <NativeAppBar
        title={thread.peerName || thread.title}
        subtitle={isAr ? "نشط الآن • خصوصية مشفرة" : "Active now • End-to-end encrypted"}
        fallbackHref="/account?tab=messages"
        trailing={
          thread.peerUserId ? (
            <Link
              href={`/account/companions/${thread.peerUserId}`}
              className="inline-flex items-center gap-1 rounded-full bg-purple-100/90 px-2.5 py-1 text-xs font-black text-[#7C3AED] hover:bg-purple-200"
            >
              <User size={12} />
              <span>{isAr ? "الملف" : "Profile"}</span>
            </Link>
          ) : null
        }
      />
      
      {/* WhatsApp Wallpaper message feed */}
      <div
        className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4"
        style={{
          backgroundImage: `radial-gradient(#d1d7db 0.8px, transparent 0.8px)`,
          backgroundSize: "20px 20px",
        }}
      >
        <div className="my-2 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3 py-1 text-[11px] font-bold text-amber-900 shadow-sm">
            <ShieldCheck size={13} className="text-amber-700" />
            {isAr ? "المحادثات في شبكة لونا ليزا مشفرة ومحمية لحماية رحلتك" : "Lonaliza travel chats are secured & encrypted for your privacy"}
          </span>
        </div>

        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm transition-all ${
                m.mine
                  ? "rounded-ee-sm bg-[#d9fdd3] text-slate-900 border border-emerald-200/50"
                  : "rounded-es-sm bg-white text-slate-800 border border-slate-100"
              }`}
            >
              {m.media?.kind === "voice" ? (
                <div className="min-w-[180px]">
                  <button
                    type="button"
                    onClick={() => void playVoice(m)}
                    className="flex w-full items-center gap-2 text-start text-xs font-bold text-purple-900"
                  >
                    {voiceUrl[m.id] ? (
                      <audio controls src={voiceUrl[m.id]} className="h-9 w-full max-w-full" />
                    ) : (
                      <span className="flex items-center gap-1.5 py-1">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">▶</span>
                        <span>{isAr ? "تشغيل الرسالة الصوتية" : "Play voice note"}</span>
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words leading-6">{plain[m.id] || m.preview || m.text || ""}</p>
              )}
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                <span>
                  {new Date(m.createdAt).toLocaleTimeString(isAr ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {m.mine && (
                  <CheckCheck size={13} className="text-[#53bdeb]" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* WhatsApp Input Bar */}
      <div className="relative border-t border-slate-200 bg-[#f0f2f5] px-2.5 py-2">
        <EmojiPickerPanel open={emojiOpen} onClose={() => setEmojiOpen(false)} onPick={(e) => setText((v) => v + e)} />
        <form
          className="flex items-end gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            void sendText();
          }}
        >
          <button
            type="button"
            onClick={() => setEmojiOpen((v) => !v)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 hover:text-purple-700 shadow-sm"
            aria-label="إيموجي"
          >
            <Smile size={20} />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAr ? "اكتب رسالة..." : "Type a message..."}
            className="min-h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3.5 text-sm outline-none shadow-sm focus:border-purple-500"
          />
          {text.trim() ? (
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white hover:bg-emerald-600 disabled:opacity-40 shadow-sm transition-all"
              aria-label="إرسال"
            >
              <Send size={17} className={isAr ? "rotate-180" : ""} />
            </button>
          ) : (
            <VoiceNoteRecorder disabled={busy} onRecorded={(file, ms) => void sendVoice(file, ms)} />
          )}
        </form>
      </div>
    </div>
  );
}
