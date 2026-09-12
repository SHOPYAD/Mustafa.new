"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt?: number;
};

export default function AccountChatPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, openAuth } = useCustomerAuth();
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) openAuth("login");
  }, [loading, user, openAuth]);

  useEffect(() => {
    if (!user || !id) return;
    void fetch(`/api/account/conversations/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.conversation) {
          setTitle(d.conversation.title || "");
          setMessages(d.conversation.messages || []);
        }
      })
      .finally(() => setReady(true));
  }, [user, id]);

  if (loading || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24">
        <Loader2 className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-28 text-center">
        <p className="font-semibold">{t.account.loginNotice}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-28">
      <Link href="/account?tab=chats" className="text-sm font-semibold text-emerald-700">
        ← {t.account.navChats}
      </Link>
      <div className="mt-4 flex items-center gap-2">
        <MessageCircle className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-slate-900">
          {title || t.account.navChats}
        </h1>
      </div>
      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "ms-8 bg-slate-900 text-white"
                : "me-8 border border-slate-100 bg-white text-slate-800"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <Link
        href={`/ai-chat?c=${id}`}
        className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white"
      >
        {t.account.continueChat}
      </Link>
    </div>
  );
}
