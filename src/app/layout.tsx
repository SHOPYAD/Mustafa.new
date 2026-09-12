// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { CompareProvider } from "@/components/packages/CompareDrawer";
import { CurrencyProvider } from "@/components/ui/CurrencySelector";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import PublicConfigBootstrap from "@/components/PublicConfigBootstrap";
import AdminNotifyBridge from "@/components/admin/AdminNotifyBridge";
import PwaRegistrar from "@/components/pwa/PwaRegistrar";
import { getBranding } from "@/lib/server/branding-store";
import { getBrandTheme } from "@/lib/server/brand-theme-store";
import { getPwaSettings } from "@/lib/server/pwa-store";
import { resolvedAppleTouchIcon } from "@/data/pwa";
import {
  arabicFontStylesheetHref,
  latinFontStylesheetHref,
} from "@/lib/fonts/load-font";

const latin = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-latin",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sora",
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ar",
  display: "swap",
});

export async function generateViewport(): Promise<Viewport> {
  const pwa = await getPwaSettings();
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: pwa.themeColor,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  const pwa = await getPwaSettings();
  const title = `${branding.brandNameEn} | ${branding.brandNameAr}`;
  const logo = branding.logoUrl || "/logo.png";
  const favicon = branding.faviconUrl || "/favicon.png";
  const appleIcon = resolvedAppleTouchIcon(pwa);
  return {
    title,
    description:
      "اكتشف باقات العطلات وعروض الطيران وخدمات التأشيرات. شريكك الموثوق للسفر في تركيا.",
    keywords: [
      "وكالة سفر",
      "باقات عطلات",
      "طيران",
      "تأشيرات",
      "تركيا",
      "travel agency",
      "holiday packages",
      branding.brandNameEn,
      branding.brandNameAr,
    ],
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: pwa.enabledPublic || pwa.enabledAdmin,
      statusBarStyle: "black-translucent",
      title: pwa.shortName || branding.brandNameAr || branding.brandNameEn,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
        { url: favicon, type: "image/png", sizes: "256x256" },
        { url: "/icon-disc.png", type: "image/png", sizes: "256x256" },
      ],
      apple: [{ url: appleIcon, type: "image/png", sizes: "180x180" }],
    },
    openGraph: {
      title,
      description: "باقات عطلات، طيران، تأشيرات وجولات في تركيا.",
      type: "website",
      locale: "ar_AE",
      alternateLocale: "en_US",
      siteName: branding.brandNameEn,
      images: [{ url: logo }],
    },
  };
}

import { themeToCssText } from "@/lib/theme/tokens";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, branding] = await Promise.all([
    getBrandTheme(),
    getBranding(),
  ]);
  const customArabicHref = arabicFontStylesheetHref(theme.arabicFontId);
  const customLatinHref = latinFontStylesheetHref(theme.latinFontId);
  const sitePhone = branding.supportPhone || "+90 531 359 13 94";
  const siteEmail = branding.supportEmail || "info@lonaliza.com";
  const siteName = branding.brandNameEn || "Lonaliza Tourism";

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${latin.variable} ${sora.variable} ${arabic.variable}`}
      data-theme-preset={theme.presetId}
      data-arabic-font={theme.arabicFontId}
      data-latin-font={theme.latinFontId}
      data-image-treatment={theme.image?.treatment || "none"}
      suppressHydrationWarning
    >
      <head>
        <style
          id="brand-theme-vars"
          dangerouslySetInnerHTML={{ __html: themeToCssText(theme) }}
        />
        {customArabicHref ? (
          <link rel="stylesheet" href={customArabicHref} />
        ) : null}
        {customLatinHref ? (
          <link rel="stylesheet" href={customLatinHref} />
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              if(location.pathname.indexOf("/admin")===0){
                var t=localStorage.getItem("lonaliza_admin_theme")||localStorage.getItem("alrayyan_admin_theme");
                if(t!=="light"&&t!=="dark")t="light";
                document.documentElement.dataset.adminTheme=t;
                document.documentElement.classList.toggle("dark",t==="dark");
                document.documentElement.style.colorScheme=t;
              } else {
                document.documentElement.dataset.siteTheme="light";
                document.documentElement.classList.remove("dark");
                document.documentElement.style.colorScheme="light";
                try{localStorage.removeItem("lonaliza_site_theme");}catch(e){}
              }
            }catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: siteName,
              url: "https://lonaliza.com",
              logo: "https://lonaliza.com/logo.svg",
              description:
                "Lonaliza Tourism offers curated luxury holiday packages, flights, Turkey tours, hotels, transfers, and visa services.",
              email: siteEmail,
              telephone: sitePhone,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Istanbul",
                addressCountry: "TR",
              },
              openingHours: "Mo-Su 09:00-21:00",
              priceRange: "$$",
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <PublicConfigBootstrap />
        <AdminNotifyBridge />
        <LocaleProvider>
          <PwaRegistrar />
          <CurrencyProvider>
            <CompareProvider>{children}</CompareProvider>
          </CurrencyProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
