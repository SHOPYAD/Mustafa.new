"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import NativeAppBar from "@/components/chrome/NativeAppBar";
import SalesChatPanel from "@/components/chat/SalesChatPanel";

export default function AccountChatPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, openAuth } = useCustomerAuth();
  const { t, locale } = useLocale();
  const isAr = locale === "ar";

  useEffect(() => {
    if (!loading && !user) openAuth("login");
  }, [loading, user, openAuth]);

  if (loading) {
    return (
      <div className="lonaliza-web-header-offset flex min-h-[60vh] flex-col items-center justify-center pt-24">
        <NativeAppBar title={t.account.navChats} fallbackHref="/account?tab=chats" />
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="lonaliza-web-header-offset mx-auto max-w-lg px-4 py-28 text-center">
        <p className="font-semibold text-slate-700">{t.account.loginNotice}</p>
      </div>
    );
  }

  return (
    <div className="lonaliza-web-header-offset flex flex-col h-[100dvh] max-h-[100dvh] pt-16 md:pt-20 bg-[#FAF7F2]">
      <NativeAppBar
        title={isAr ? "المحادثة السياحية الذكية" : "AI Travel Advisor Chat"}
        fallbackHref="/account?tab=chats"
      />
      <main className="flex-1 min-h-0 w-full max-w-5xl mx-auto px-2 sm:px-4 pb-2">
        <div className="h-full rounded-2xl md:rounded-3xl border border-purple-200/70 bg-white shadow-xl overflow-hidden flex flex-col">
          <SalesChatPanel
            conversationId={id}
            embedded={true}
            fillViewport={true}
            className="flex-1 min-h-0"
          />
        </div>
      </main>
    </div>
  );
}
