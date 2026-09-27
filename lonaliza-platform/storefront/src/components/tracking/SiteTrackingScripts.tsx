"use client";

/**
 * Injects Search Console meta + marketing pixels on the public site only.
 * Loads public IDs from /api/tracking-config (server store + env) so admin
 * saves apply without a full process restart.
 * Mount from `(site)` layout — never under `/admin`.
 */

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  getGscVerificationContent,
  shouldLoadFacebookPixel,
  shouldLoadGtag,
  shouldLoadGtm,
  shouldLoadTikTokPixel,
} from "@/lib/integrations-env";
import type { SiteIntegrations } from "@/types/site-integrations";

function upsertGscMeta(content: string) {
  const name = "google-site-verification";
  let el = document.querySelector(
    `meta[name="${name}"]`
  ) as HTMLMetaElement | null;
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const emptyIntegrations: SiteIntegrations = {
  googleSearchConsole: {
    enabled: false,
    verificationMeta: "",
    propertyUrl: "",
  },
  googleAnalytics: { enabled: false, measurementId: "" },
  googleTagManager: { enabled: false, containerId: "" },
  googleAds: { enabled: false, conversionId: "", conversionLabel: "" },
  facebookPixel: { enabled: false, pixelId: "" },
  tiktokPixel: { enabled: false, pixelId: "" },
};

export default function SiteTrackingScripts() {
  const [integrations, setIntegrations] =
    useState<SiteIntegrations>(emptyIntegrations);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/tracking-config", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && data.integrations) {
          setIntegrations(data.integrations as SiteIntegrations);
        }
      } catch {
        /* keep empty */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const gscContent = getGscVerificationContent(integrations);
  const loadGtm = ready && shouldLoadGtm(integrations);
  const loadGtag = ready && shouldLoadGtag(integrations);
  const loadFb = ready && shouldLoadFacebookPixel(integrations);
  const loadTt = ready && shouldLoadTikTokPixel(integrations);

  const gtmId = integrations.googleTagManager.containerId;
  const gaId = integrations.googleAnalytics.measurementId;
  const adsId = integrations.googleAds.conversionId;
  const gaEnabled =
    integrations.googleAnalytics.enabled && /^G-[A-Z0-9]+$/i.test(gaId);
  const adsEnabled =
    integrations.googleAds.enabled && /^AW-[0-9]+$/i.test(adsId);
  const fbId = integrations.facebookPixel.pixelId;
  const ttId = integrations.tiktokPixel.pixelId;

  const gtagPrimaryId = gaEnabled ? gaId : adsEnabled ? adsId : "";

  useEffect(() => {
    if (!ready) return;
    upsertGscMeta(gscContent);
    return () => {
      document.querySelector('meta[name="google-site-verification"]')?.remove();
    };
  }, [gscContent, ready]);

  if (!ready) return null;

  return (
    <>
      {loadGtm && (
        <Script id="liotrip-gtm" strategy="afterInteractive">{`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');
        `}</Script>
      )}

      {loadGtag && gtagPrimaryId && (
        <>
          <Script
            id="liotrip-gtag-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagPrimaryId}`}
            strategy="afterInteractive"
          />
          <Script id="liotrip-gtag-init" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gaEnabled ? `gtag('config', '${gaId}');` : ""}
${adsEnabled ? `gtag('config', '${adsId}');` : ""}
          `}</Script>
        </>
      )}

      {loadFb && (
        <Script id="liotrip-fb-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${fbId}');
fbq('track', 'PageView');
        `}</Script>
      )}

      {loadTt && (
        <Script id="liotrip-tiktok-pixel" strategy="afterInteractive">{`
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(
    var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
  ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
  ttq._o=ttq._o||{};ttq._o[e]=n||{};n=document.createElement("script");
  n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;
  e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${ttId}');
  ttq.page();
}(window, document, 'ttq');
        `}</Script>
      )}
    </>
  );
}
