"use client";

import { MessageCircle } from "lucide-react";
import { getWhatsAppMessage } from "@/data/site-contact";
import { useSiteContact } from "@/hooks/useSiteContact";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { resolveBusinessWhatsAppNumber } from "@/lib/site-whatsapp";
import { buildWhatsAppLink } from "@/lib/utils";

type AlrayyanServiceBannerProps = {
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
};

export default function AlrayyanServiceBanner({
  kicker,
  title,
  subtitle,
  cta,
}: AlrayyanServiceBannerProps) {
  const contact = useSiteContact();
  const { locale } = useLocale();
  const number = resolveBusinessWhatsAppNumber(contact.whatsappNumber);
  const messageLocale = locale === "ar" ? "ar" : "en";
  const href = buildWhatsAppLink(
    number,
    getWhatsAppMessage(contact, messageLocale)
  );

  return (
    <div className="relative w-full overflow-hidden bg-[#051741] text-white pt-[4.5rem] md:pt-[4.75rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 12% 28%, rgba(245,158,11,0.34), transparent 42%), radial-gradient(circle at 92% 8%, rgba(245,158,11,0.18), transparent 34%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-0 w-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="max-w-3xl">
          <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-[0.22em] uppercase mb-3">
            {kicker}
          </p>
          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {title}
          </h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#051741] font-bold px-6 py-3.5 shadow-lg shadow-amber-500/25 transition-colors"
        >
          <MessageCircle size={18} />
          {cta}
        </a>
      </div>
      <div
        aria-hidden
        className="h-1 w-full bg-gradient-to-l from-amber-300 via-amber-500 to-amber-700"
      />
    </div>
  );
}
