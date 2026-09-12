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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getBrandTheme();
  const customArabicHref = arabicFontStylesheetHref(theme.arabicFontId);
  const customLatinHref = latinFontStylesheetHref(theme.latinFontId);
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${latin.variable} ${sora.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {customArabicHref ? (
          <link rel="stylesheet" href={customArabicHref} />
        ) : null}
        {customLatinHref ? (
          <link rel="stylesheet" href={customLatinHref} />
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.pathname.indexOf("/admin")!==0)return;var t=localStorage.getItem("alrayyan_admin_theme");if(t!=="light"&&t!=="dark")t="dark";document.documentElement.dataset.adminTheme=t;document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Alrayyan Tourism",
              url: "https://lonaliza.com",
              logo: "https://lonaliza.com/logo.png",
              description:
                "Alrayyan Tourism offers curated holiday packages, flights, Turkey tours, hotels, transfers, and visa services.",
              email: "info@lonaliza.com",
              telephone: "+90 532 179 67 63",
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
