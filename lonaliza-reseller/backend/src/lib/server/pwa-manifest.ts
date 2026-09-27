import type { PwaSettings } from "@/data/pwa";
import {
  pwaNameForLocale,
  resolvedAppleTouchIcon,
  resolvedPwaIcon192,
  resolvedPwaIcon512,
} from "@/data/pwa";

export type WebAppManifest = {
  id: string;
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: "standalone" | "browser";
  display_override?: Array<"standalone" | "minimal-ui" | "browser">;
  orientation: "any";
  dir: "rtl" | "ltr";
  lang: string;
  theme_color: string;
  background_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
};

function localeFromRequest(request: Request): string {
  const url = new URL(request.url);
  const q = url.searchParams.get("lang")?.toLowerCase();
  if (q === "en" || q === "tr" || q === "ar") return q;
  const accept = request.headers.get("accept-language") || "";
  if (accept.toLowerCase().startsWith("en")) return "en";
  if (accept.toLowerCase().startsWith("tr")) return "tr";
  return "ar";
}

function dirForLocale(locale: string): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function buildWebManifest(input: {
  settings: PwaSettings;
  kind: "public" | "admin";
  locale: string;
  enabled: boolean;
}): WebAppManifest {
  const { settings, kind, locale, enabled } = input;
  const name = pwaNameForLocale(settings, locale);
  const short =
    settings.shortName ||
    (locale === "en" ? "Lonaliza" : locale === "tr" ? "Lonaliza" : "لوناليزا");
  const icon192 = resolvedPwaIcon192(settings);
  const icon512 = resolvedPwaIcon512(settings);
  const apple = resolvedAppleTouchIcon(settings);
  const isAdmin = kind === "admin";

  return {
    id: isAdmin ? "/admin" : "/",
    name: isAdmin ? `${name} — Admin` : name,
    short_name: isAdmin ? `${short}`.slice(0, 12) : short,
    description: isAdmin
      ? locale === "en"
        ? "Lonaliza control panel"
        : locale === "tr"
          ? "Lonaliza kontrol paneli"
          : "لوحة تحكم لوناليزا"
      : locale === "en"
        ? "Holiday packages, flights, and visas with Lonaliza Travel."
        : locale === "tr"
          ? "Lonaliza Travel ile tatil paketleri, uçuşlar ve vizeler."
          : "باقات العطلات والطيران والتأشيرات مع لوناليزا للسياحة والسفر.",
    start_url: isAdmin ? "/admin" : "/",
    scope: isAdmin ? "/admin" : "/",
    display: enabled ? "standalone" : "browser",
    display_override: enabled ? ["standalone", "minimal-ui", "browser"] : ["browser"],
    orientation: "any",
    dir: dirForLocale(locale),
    lang: locale,
    theme_color: settings.themeColor,
    background_color: settings.backgroundColor,
    icons: [
      { src: icon192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: icon512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: icon192, sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: icon512, sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: apple, sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}

export function manifestLocale(request: Request): string {
  return localeFromRequest(request);
}

export function manifestResponse(manifest: WebAppManifest): Response {
  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
