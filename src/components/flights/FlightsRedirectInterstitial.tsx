"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import {
  FLIGHTS_REDIRECT_DELAY_MS,
  resolveFlightsRedirectTarget,
} from "@/lib/flights-redirect";

type Copy = {
  brandAr: string;
  brandEn: string;
  group: string;
  transferring: string;
  partnerFallback: string;
  completes: string;
  clickHere: string;
  invalid: string;
  backToFlights: string;
};

function copyFor(locale: Locale): Copy {
  switch (locale) {
    case "ar":
      return {
        brandAr: "الريان للسياحة",
        brandEn: "Alrayyan Tourism",
        group: "Alrayyan Group",
        transferring: "جاري تحويلك إلى شريك الحجز",
        partnerFallback: "شريك الحجز",
        completes: "سيتم إكمال الحجز على موقع الشريك.",
        clickHere: "اضغط هنا إذا لم يتم التحويل",
        invalid: "رابط التحويل غير صالح. لم يتم توجيهك إلى أي موقع خارجي.",
        backToFlights: "العودة إلى بحث الطيران",
      };
    case "en":
      return {
        brandAr: "الريان للسياحة",
        brandEn: "Alrayyan Tourism",
        group: "Alrayyan Group",
        transferring: "Redirecting you to our booking partner",
        partnerFallback: "booking partner",
        completes: "Your booking will be completed on the partner’s website.",
        clickHere: "Click here if you are not redirected",
        invalid: "This redirect link is not allowed. You were not sent to an external site.",
        backToFlights: "Back to flight search",
      };
    case "tr":
      return {
        brandAr: "الريان للسياحة",
        brandEn: "Alrayyan Tourism",
        group: "Alrayyan Group",
        transferring: "Rezervasyon ortağımıza yönlendiriliyorsunuz",
        partnerFallback: "rezervasyon ortağı",
        completes: "Rezervasyonunuz ortak sitede tamamlanacaktır.",
        clickHere: "Yönlendirme olmadıysa buraya tıklayın",
        invalid: "Bu yönlendirme bağlantısı izinli değil. Harici bir siteye gönderilmediniz.",
        backToFlights: "Uçuş aramasına dön",
      };
    default: {
      const _exhaustive: never = locale;
      void _exhaustive;
      return copyFor("ar");
    }
  }
}

export default function FlightsRedirectInterstitial() {
  const searchParams = useSearchParams();
  const { locale, dir } = useLocale();
  const copy = copyFor(locale);

  const target = useMemo(
    () =>
      resolveFlightsRedirectTarget(
        searchParams.get("url"),
        searchParams.get("gate_name") || searchParams.get("gate")
      ),
    [searchParams]
  );

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (!target) return;
    const timer = window.setTimeout(() => {
      window.location.replace(target.url);
    }, FLIGHTS_REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [target]);

  const partner = target?.gate || copy.partnerFallback;

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-[200] flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#051741] px-6 py-10"
    >
      <div
        className="pointer-events-none absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 end-0 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt={copy.brandAr}
          className="mb-5 h-16 w-auto object-contain md:h-20"
        />
        <p
          className="text-lg font-bold text-white md:text-xl"
          style={{
            fontFamily:
              locale === "ar" ? "var(--font-ar)" : "var(--font-latin)",
          }}
        >
          {locale === "en" ? copy.brandEn : copy.brandAr}
        </p>
        <p className="mt-1 text-sm tracking-wide text-amber-400">
          {locale === "ar" ? copy.brandEn : copy.group}
        </p>

        {target ? (
          <>
            <div
              className="mt-10 h-12 w-12 rounded-full border-[3px] border-white/15 border-t-amber-400 animate-spin"
              role="status"
              aria-label={copy.transferring}
            />
            <h1 className="mt-8 text-xl font-semibold leading-snug text-white md:text-2xl">
              {copy.transferring}
            </h1>
            <p className="mt-2 text-lg font-medium text-amber-400">{partner}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {copy.completes}
            </p>
            <a
              href={target.url}
              className="mt-8 text-sm text-white/55 underline decoration-white/25 underline-offset-4 transition-colors hover:text-amber-300"
            >
              {copy.clickHere}
            </a>
          </>
        ) : (
          <>
            <h1 className="mt-10 text-xl font-semibold text-white">{copy.invalid}</h1>
            <Link
              href="/flights"
              className="mt-8 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#051741] transition-colors hover:bg-amber-400"
            >
              {copy.backToFlights}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
