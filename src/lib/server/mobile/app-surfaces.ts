import type { SearchTabKey } from "@/data/search-tabs";

export type AppSurfaceMode = "native" | "webview";

export type AppSurface = {
  key: string;
  mode: AppSurfaceMode;
  path?: string;
  channel?: SearchTabKey;
};

/** Every public website customer surface the app must support. */
export const APP_SURFACES: AppSurface[] = [
  { key: "flight", mode: "native", channel: "flight" },
  { key: "hotel", mode: "native", channel: "hotel" },
  { key: "cars", mode: "native", channel: "cars" },
  { key: "transfers", mode: "native", channel: "transfers" },
  { key: "holiday", mode: "native", channel: "holiday" },
  { key: "tours", mode: "native", channel: "tours" },
  { key: "visa", mode: "webview", path: "/visa", channel: "visa" },
  { key: "insurance", mode: "webview", path: "/search?tab=insurance", channel: "insurance" },
  { key: "offers", mode: "webview", path: "/search?tab=offers", channel: "offers" },
  { key: "ai-chat", mode: "webview", path: "/ai-chat" },
  { key: "community", mode: "webview", path: "/community" },
  { key: "reels", mode: "webview", path: "/community/reels" },
  { key: "blog", mode: "webview", path: "/blog" },
  { key: "about", mode: "webview", path: "/about" },
  { key: "contact", mode: "webview", path: "/contact" },
  { key: "privacy", mode: "webview", path: "/privacy" },
  { key: "terms", mode: "webview", path: "/terms" },
  { key: "gdpr", mode: "webview", path: "/gdpr" },
  { key: "account-social", mode: "webview", path: "/account?tab=social" },
  { key: "account-chats", mode: "webview", path: "/account?tab=chats" },
  { key: "account-programs", mode: "webview", path: "/account?tab=programs" },
];

export const MOBILE_HANDOFF_PATHS = [
  "/ai-chat",
  "/community",
  "/community/reels",
  "/visa",
  "/search",
  "/blog",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/gdpr",
  "/account",
] as const;

export function isHandoffPath(raw: string): boolean {
  const path = raw.trim().split("?")[0]?.split("#")[0] || "";
  return (MOBILE_HANDOFF_PATHS as readonly string[]).includes(path);
}

export function surfacesForApp(enabled: string[]): AppSurface[] {
  return APP_SURFACES.filter((surface) => !surface.channel || enabled.includes(surface.channel));
}
