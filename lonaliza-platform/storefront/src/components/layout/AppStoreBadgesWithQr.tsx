"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { QrCode, Smartphone, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

import { useStorefrontInit } from "@/providers/StorefrontInitProvider";

interface AppLinksData {
  ok: boolean;
  googlePlayUrl: string;
  appStoreUrl: string;
  googlePlayQr: string;
  appStoreQr: string;
}

const DEFAULT_LINKS: AppLinksData = {
  ok: true,
  googlePlayUrl: "https://play.google.com/store/apps/details?id=com.lonaliza.app",
  appStoreUrl: "https://apps.apple.com/app/lonaliza-travel/id1669000000",
  googlePlayQr: "",
  appStoreQr: "",
};

export default function AppStoreBadgesWithQr({
  variant = "footer",
}: {
  variant?: "footer" | "landing" | "standalone" | "integrated-contact";
}) {
  const { locale } = useLocale();
  const init = useStorefrontInit();
  const [data, setData] = useState<AppLinksData>(() => {
    if (init.appLinks) {
      return {
        ok: true,
        googlePlayUrl: init.appLinks.googlePlayUrl,
        appStoreUrl: init.appLinks.appStoreUrl,
        googlePlayQr: init.appLinks.googlePlayQr || "",
        appStoreQr: init.appLinks.appStoreQr || "",
      };
    }
    return DEFAULT_LINKS;
  });
  const [activeQrModal, setActiveQrModal] = useState<"google" | "apple" | null>(null);

  useEffect(() => {
    if (init.appLinks) {
      setData({
        ok: true,
        googlePlayUrl: init.appLinks.googlePlayUrl,
        appStoreUrl: init.appLinks.appStoreUrl,
        googlePlayQr: init.appLinks.googlePlayQr || "",
        appStoreQr: init.appLinks.appStoreQr || "",
      });
      return;
    }
    let isMounted = true;
    fetch("/api/app-links", { cache: "no-store" })
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData && resData.ok) {
          setData(resData);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [init.appLinks]);


  const isDark = variant === "landing";

  const googlePlayHref = data.googlePlayUrl || DEFAULT_LINKS.googlePlayUrl;
  const appStoreHref = data.appStoreUrl || DEFAULT_LINKS.appStoreUrl;

  if (variant === "integrated-contact") {
    return (
      <div className="w-full">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Smartphone className="h-4 w-4 text-purple-700 shrink-0" />
          <h4 className="alrayyan-footer-heading text-[13px] font-black uppercase tracking-[0.14em] text-purple-950">
            {locale === "ar" ? "تطبيق الجوال" : "Mobile App"}
          </h4>
        </div>
        <p className="text-[11.5px] text-slate-600 mb-3 leading-relaxed">
          {locale === "ar"
            ? "امسح الرمز أو حمّل مباشرة:"
            : "Scan QR code or download:"}
        </p>

        {/* Desktop / Tablet view: Compact vertical cards */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-2.5 max-w-[250px]">
          {/* Google Play Vertical Card */}
          <div className="flex flex-col items-center gap-2 rounded-2xl p-2 bg-white border border-purple-200/90 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all">
            {data.googlePlayQr ? (
              <div className="relative shrink-0 rounded-xl overflow-hidden bg-white p-1 border border-slate-200 shadow-inner">
                <img
                  src={data.googlePlayQr}
                  alt="Google Play QR Code"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
              </div>
            ) : null}
            <a
              href={googlePlayHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1 rounded-xl bg-black px-1.5 py-1.5 text-white hover:bg-slate-800 transition-colors shadow-2xs active:scale-95"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.367-.61-.926-.61-1.619V3.433c0-.693.24-1.252.61-1.619z" />
                <path fill="#34A853" d="M17.156 8.636L13.792 12l3.364 3.364 3.792-2.188c.783-.452.783-1.888 0-2.34l-3.792-2.2z" />
                <path fill="#FBBC05" d="M13.792 12L3.609 1.814c.484-.482 1.255-.548 1.954-.145l11.593 6.967L13.792 12z" />
                <path fill="#EA4335" d="M13.792 12l3.364 3.364-11.593 6.967c-.699.403-1.47.337-1.954-.145L13.792 12z" />
              </svg>
              <div className="text-center leading-none">
                <div className="text-[7px] text-slate-300 font-medium">{locale === "ar" ? "متاح على" : "GET IT ON"}</div>
                <div className="text-[9px] font-black tracking-tight mt-0.5">Google Play</div>
              </div>
            </a>
          </div>

          {/* Apple App Store Vertical Card */}
          <div className="flex flex-col items-center gap-2 rounded-2xl p-2 bg-white border border-purple-200/90 shadow-2xs hover:border-indigo-500 hover:shadow-xs transition-all">
            {data.appStoreQr ? (
              <div className="relative shrink-0 rounded-xl overflow-hidden bg-white p-1 border border-slate-200 shadow-inner">
                <img
                  src={data.appStoreQr}
                  alt="App Store QR Code"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
              </div>
            ) : null}
            <a
              href={appStoreHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1 rounded-xl bg-black px-1.5 py-1.5 text-white hover:bg-slate-800 transition-colors shadow-2xs active:scale-95"
            >
              <svg className="h-3.5 w-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.64-1.05 1.7-0.92 2.73 1.01.08 2.02-.45 2.63-1.2z" />
              </svg>
              <div className="text-center leading-none">
                <div className="text-[7px] text-slate-300 font-medium">{locale === "ar" ? "تنزيل من" : "DOWNLOAD ON"}</div>
                <div className="text-[9px] font-black tracking-tight mt-0.5">App Store</div>
              </div>
            </a>
          </div>
        </div>

        {/* Mobile View: Direct Tap Buttons without QR code */}
        <div className="grid grid-cols-2 gap-2 sm:hidden max-w-[260px]">
          <a
            href={googlePlayHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-black px-2.5 py-2 text-white shadow-2xs active:scale-95 transition-transform"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.367-.61-.926-.61-1.619V3.433c0-.693.24-1.252.61-1.619z" />
              <path fill="#34A853" d="M17.156 8.636L13.792 12l3.364 3.364 3.792-2.188c.783-.452.783-1.888 0-2.34l-3.792-2.2z" />
              <path fill="#FBBC05" d="M13.792 12L3.609 1.814c.484-.482 1.255-.548 1.954-.145l11.593 6.967L13.792 12z" />
              <path fill="#EA4335" d="M13.792 12l3.364 3.364-11.593 6.967c-.699.403-1.47.337-1.954-.145L13.792 12z" />
            </svg>
            <span className="text-[11px] font-black">Google Play</span>
          </a>
          <a
            href={appStoreHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-black px-2.5 py-2 text-white shadow-2xs active:scale-95 transition-transform"
          >
            <svg className="h-4 w-4 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.64-1.05 1.7-0.92 2.73 1.01.08 2.02-.45 2.63-1.2z" />
            </svg>
            <span className="text-[11px] font-black">App Store</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. DESKTOP VIEW (hidden md:flex) - Badges + Auto QR Codes */}
      {/* ========================================================= */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Smartphone className={`h-4 w-4 ${isDark ? "text-amber-400" : "text-purple-700"}`} />
          <h4
            className={`text-xs font-black uppercase tracking-wider ${
              isDark ? "text-slate-200" : "text-purple-950"
            }`}
          >
            {locale === "ar" ? "تطبيق الجوال الرسمي (iOS & Android)" : "Official Mobile App"}
          </h4>
        </div>
        <p className={`text-xs leading-relaxed max-w-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {locale === "ar"
            ? "امسح رمز QR بكاميرا هاتفك للتحويل المباشر لمتجر التطبيقات أو انقر للفتح:"
            : "Scan the QR code with your phone camera or click to download directly:"}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {/* Google Play Card (Desktop: QR + Badge) */}
          <div
            className={`group relative flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-300 ${
              isDark
                ? "bg-slate-900/80 border border-slate-700/60 shadow-lg shadow-black/20 hover:border-emerald-500/50"
                : "bg-white/95 border border-purple-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md"
            }`}
          >
            {/* Auto Generated QR Code */}
            {data.googlePlayQr ? (
              <div className="relative shrink-0 rounded-xl overflow-hidden bg-white p-1 shadow-inner border border-slate-200">
                <img
                  src={data.googlePlayQr}
                  alt="Google Play QR Code"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                  <QrCode className="h-5 w-5 text-white" />
                </span>
              </div>
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-slate-400 animate-pulse" />
              </div>
            )}

            {/* Store Badge Link */}
            <div className="flex flex-col justify-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {locale === "ar" ? "متاح على" : "GET IT ON"}
              </span>
              <a
                href={googlePlayHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-3.5 py-1.5 text-white transition-all hover:bg-slate-800 active:scale-95 shadow-xs"
              >
                {/* Official Google Play Triangular Icon */}
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.367-.61-.926-.61-1.619V3.433c0-.693.24-1.252.61-1.619z"
                  />
                  <path
                    fill="#34A853"
                    d="M17.156 8.636L13.792 12l3.364 3.364 3.792-2.188c.783-.452.783-1.888 0-2.34l-3.792-2.2z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M13.792 12L3.609 1.814c.484-.482 1.255-.548 1.954-.145l11.593 6.967L13.792 12z"
                  />
                  <path
                    fill="#EA4335"
                    d="M13.792 12l3.364 3.364-11.593 6.967c-.699.403-1.47.337-1.954-.145L13.792 12z"
                  />
                </svg>
                <div className="text-right rtl:text-right ltr:text-left leading-tight">
                  <div className="text-[9px] text-slate-300 font-medium">Google Play</div>
                  <div className="text-[11px] font-black tracking-tight">Google Play</div>
                </div>
              </a>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {locale === "ar" ? "امسح أو انقر" : "Scan or click"}
              </span>
            </div>
          </div>

          {/* Apple App Store Card (Desktop: QR + Badge) */}
          <div
            className={`group relative flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-300 ${
              isDark
                ? "bg-slate-900/80 border border-slate-700/60 shadow-lg shadow-black/20 hover:border-indigo-500/50"
                : "bg-white/95 border border-purple-200/80 shadow-sm hover:border-indigo-500 hover:shadow-md"
            }`}
          >
            {/* Auto Generated QR Code */}
            {data.appStoreQr ? (
              <div className="relative shrink-0 rounded-xl overflow-hidden bg-white p-1 shadow-inner border border-slate-200">
                <img
                  src={data.appStoreQr}
                  alt="Apple App Store QR Code"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                  <QrCode className="h-5 w-5 text-white" />
                </span>
              </div>
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-slate-400 animate-pulse" />
              </div>
            )}

            {/* Store Badge Link */}
            <div className="flex flex-col justify-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {locale === "ar" ? "تنزيل من" : "DOWNLOAD ON"}
              </span>
              <a
                href={appStoreHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-3.5 py-1.5 text-white transition-all hover:bg-slate-800 active:scale-95 shadow-xs"
              >
                {/* Official Apple Silhouette Icon */}
                <svg className="h-4 w-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.64-1.05 1.7-0.92 2.73 1.01.08 2.02-.45 2.63-1.2z" />
                </svg>
                <div className="text-right rtl:text-right ltr:text-left leading-tight">
                  <div className="text-[9px] text-slate-300 font-medium">Download on the</div>
                  <div className="text-[11px] font-black tracking-tight">App Store</div>
                </div>
              </a>
              <span className="text-[9px] text-indigo-600 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                {locale === "ar" ? "امسح أو انقر" : "Scan or click"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MOBILE VIEW (flex md:hidden) - Clickable Store Badges ONLY */}
      {/* (Per user spec: NO QR codes on phone, direct store tap only) */}
      {/* ========================================================= */}
      <div className="flex md:hidden flex-col gap-3">
        <div className="flex items-center gap-2">
          <Smartphone className={`h-4 w-4 ${isDark ? "text-amber-400" : "text-purple-700"}`} />
          <h4
            className={`text-xs font-black uppercase tracking-wider ${
              isDark ? "text-slate-200" : "text-purple-950"
            }`}
          >
            {locale === "ar" ? "تطبيق لوناليزا للجوال" : "Lonaliza Mobile App"}
          </h4>
        </div>
        <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {locale === "ar"
            ? "حمل تطبيقنا الرسمي الآن واستمتع بحجز أسرع وعروض حصرية ومساعد السفر الذكي:"
            : "Download our official mobile app now for fast booking and exclusive deals:"}
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Google Play Direct Tap Button */}
          <a
            href={googlePlayHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-white shadow-md active:scale-95 transition-transform"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.367-.61-.926-.61-1.619V3.433c0-.693.24-1.252.61-1.619z"
              />
              <path
                fill="#34A853"
                d="M17.156 8.636L13.792 12l3.364 3.364 3.792-2.188c.783-.452.783-1.888 0-2.34l-3.792-2.2z"
              />
              <path
                fill="#FBBC05"
                d="M13.792 12L3.609 1.814c.484-.482 1.255-.548 1.954-.145l11.593 6.967L13.792 12z"
              />
              <path
                fill="#EA4335"
                d="M13.792 12l3.364 3.364-11.593 6.967c-.699.403-1.47.337-1.954-.145L13.792 12z"
              />
            </svg>
            <div className="text-right rtl:text-right ltr:text-left leading-tight">
              <div className="text-[9px] text-slate-300 font-medium">تحميل من</div>
              <div className="text-[12px] font-black tracking-tight">Google Play</div>
            </div>
          </a>

          {/* Apple App Store Direct Tap Button */}
          <a
            href={appStoreHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-white shadow-md active:scale-95 transition-transform"
          >
            <svg className="h-5 w-5 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.64-1.05 1.7-0.92 2.73 1.01.08 2.02-.45 2.63-1.2z" />
            </svg>
            <div className="text-right rtl:text-right ltr:text-left leading-tight">
              <div className="text-[9px] text-slate-300 font-medium">تنزيل من</div>
              <div className="text-[12px] font-black tracking-tight">App Store</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
