"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Smile } from "lucide-react";
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
  media?: { kind: "voice"; url: string; mime: string; durationMs: number; size: number; wrappedKey: string };
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
        nextPlain[m.id] = m.encrypted ? m.preview || "" : m.text;
        continue;
      }
      try {
        nextPlain[m.id] = decryptDmText(m.text, theirKey);
      } catch {
        nextPlain[m.id] = m.preview || (isAr ? "رسالة مشفرة" : "Encrypted message");
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
    const id = window.setInterval(() => void load().catch(() => undefined), 6000);
    return () => window.clearInterval(id);
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, plain]);

  async function sendCipher(cipher: string, preview: string, rumorText: string, extra?: Record<string, unknown>) {
    if (!thread?.peerNostrPubkey) throw new Error("no_peer_key");
    let giftWrapId = "";
    try {
      const wrap = giftWrapText(rumorText, thread.peerNostrPubkey);
      giftWrapId = wrap.id;
      void publishGiftWrap(wrap, DEFAULT_DM_RELAYS);
    } catch {
      /* relays optional; ciphertext still persisted */
    }
    await fetch(`/api/account/inbox/${threadId}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cipher, encrypted: true, preview, giftWrapId, ...extra }),
    });
    setText("");
    setEmojiOpen(false);
    await load();
  }

  async function sendText() {
    const body = text.trim();
    if (!body || !thread?.peerNostrPubkey) return;
    setBusy(true);
    try {
      const cipher = encryptDmText(body, thread.peerNostrPubkey);
      await sendCipher(cipher, "رسالة مشفرة", body);
    } finally {
      setBusy(false);
    }
  }

  async function sendVoice(file: File, durationMs: number) {
    if (!thread?.peerNostrPubkey) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { ciphertext, wrappedKey } = await encryptVoiceBytes(bytes, thread.peerNostrPubkey);
      const encryptedFile = new File([ciphertext as unknown as BlobPart], `enc-${file.name}.bin`, { type: "application/octet-stream" });
      const uploaded = await uploadToBlossom(encryptedFile);
      const cipher = encryptDmText(JSON.stringify({ t: "voice", url: uploaded.url }), thread.peerNostrPubkey);
      await sendCipher(cipher, "رسالة صوتية", JSON.stringify({ t: "voice", url: uploaded.url }), {
        media: {
          kind: "voice",
          url: uploaded.url,
          mime: file.type || "audio/webm",
          durationMs,
          size: uploaded.size,
          wrappedKey,
        },
      });
    } finally {
      setBusy(false);
    }
  }

  async function playVoice(m: Msg) {
    if (!m.media || !thread?.peerNostrPubkey) return;
    if (voiceUrl[m.id]) return;
    const res = await fetch(m.media.url);
    const buf = new Uint8Array(await res.arrayBuffer());
    const opened = await decryptVoiceBytes(buf, m.media.wrappedKey, thread.peerNostrPubkey);
    const blob = new Blob([opened as unknown as BlobPart], { type: m.media.mime || "audio/webm" });
    setVoiceUrl((prev) => ({ ...prev, [m.id]: URL.createObjectURL(blob) }));
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
        …
      </div>
    );
  }

  const locked = !thread.peerNostrPubkey;

  return (
    <div className="lonaliza-web-header-offset mx-auto flex min-h-[100dvh] max-w-lg flex-col overflow-x-hidden bg-[#efeae2] pb-[env(safe-area-inset-bottom)]">
      <InAppMessageToast />
      <NativeAppBar
        title={thread.peerName || thread.title}
        subtitle={t.appChrome.encryptedChat}
        fallbackHref="/account?tab=messages"
        trailing={
          thread.peerUserId ? (
            <Link href={`/account/companions/${thread.peerUserId}`} className="text-xs font-black text-[#7C3AED]">
              {isAr ? "الملف" : "Profile"}
            </Link>
          ) : null
        }
      />
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                m.mine ? "rounded-ee-sm bg-[#d9fdd3] text-slate-900" : "rounded-es-sm bg-white text-slate-800"
              }`}
            >
              {m.media?.kind === "voice" ? (
                <button type="button" onClick={() => void playVoice(m)} className="min-h-11 text-start text-xs font-bold">
                  {voiceUrl[m.id] ? (
                    <audio controls src={voiceUrl[m.id]} className="max-w-full" />
                  ) : (
                    <span>▶ {isAr ? "تشغيل الرسالة الصوتية" : "Play voice note"}</span>
                  )}
                </button>
              ) : (
                <p className="whitespace-pre-wrap break-words leading-6">{plain[m.id] || m.preview || ""}</p>
              )}
              <p className="mt-1 text-end text-[10px] text-slate-500">
                {new Date(m.createdAt).toLocaleTimeString(isAr ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="relative border-t border-slate-200 bg-[#f0f2f5] px-2 py-2">
        {locked ? (
          <p className="px-3 py-3 text-center text-xs font-bold text-slate-500">
            {isAr ? "الرفيق لم يفعّل مفتاح التشفير بعد. اطلب منه فتح التطبيق مرة." : "Peer has no Nostr key yet. Ask them to open the app once."}
          </p>
        ) : (
          <>
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
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white"
                aria-label="إيموجي"
              >
                <Smile size={18} />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isAr ? "اكتب رسالة مشفرة" : "Encrypted message"}
                className="min-h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none"
              />
              {text.trim() ? (
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7C3AED] text-white disabled:opacity-40"
                  aria-label="إرسال"
                >
                  <Send size={16} />
                </button>
              ) : (
                <VoiceNoteRecorder disabled={busy} onRecorded={(file, ms) => void sendVoice(file, ms)} />
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
