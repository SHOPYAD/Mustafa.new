import type { PwaPublicConfig } from "@/data/pwa";
import { DEFAULT_PWA_SETTINGS, toPublicPwaConfig } from "@/data/pwa";

const PUBLIC_SW = "/sw.js";
const ADMIN_SW = "/sw-admin-pwa.js";

export async function fetchPwaConfig(): Promise<PwaPublicConfig> {
  try {
    const res = await fetch("/api/pwa", { cache: "no-store" });
    const data = (await res.json()) as Partial<PwaPublicConfig> & { ok?: boolean };
    if (!res.ok || !data?.ok) return toPublicPwaConfig(DEFAULT_PWA_SETTINGS);
    return {
      ...toPublicPwaConfig(DEFAULT_PWA_SETTINGS),
      ...data,
    };
  } catch {
    return toPublicPwaConfig(DEFAULT_PWA_SETTINGS);
  }
}

function scriptUrlOf(reg: ServiceWorkerRegistration): string {
  return (
    reg.active?.scriptURL ||
    reg.waiting?.scriptURL ||
    reg.installing?.scriptURL ||
    ""
  );
}

async function unregisterMatching(includes: string): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const reg of regs) {
    if (scriptUrlOf(reg).includes(includes)) {
      await reg.unregister();
    }
  }
}

export async function registerPublicPwaWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register(PUBLIC_SW, { scope: "/" });
  } catch {
    return null;
  }
}

export async function registerAdminPwaWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register(ADMIN_SW, { scope: "/admin" });
  } catch {
    return null;
  }
}

export async function syncPwaWorkers(config: PwaPublicConfig): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const path = window.location.pathname;
  const onAdmin = path.startsWith("/admin");

  if (config.enabledPublic) {
    if (!onAdmin) await registerPublicPwaWorker();
  } else {
    await unregisterMatching("/sw.js");
  }

  if (config.enabledAdmin) {
    if (onAdmin && path !== "/admin/login") await registerAdminPwaWorker();
  } else {
    await unregisterMatching("/sw-admin-pwa.js");
  }
}

export function applyPwaDocumentChrome(input: {
  config: PwaPublicConfig;
  isAdmin: boolean;
  locale: string;
}): void {
  if (typeof document === "undefined") return;
  const { config, isAdmin } = input;
  const enabled = isAdmin ? config.enabledAdmin : config.enabledPublic;
  const manifestHref = isAdmin ? config.adminManifestUrl : config.publicManifestUrl;

  upsertLink("manifest", manifestHref);
  upsertLink("apple-touch-icon", config.appleTouchIcon, { sizes: "180x180" });
  upsertMeta("theme-color", config.themeColor);
  upsertMeta("apple-mobile-web-app-capable", enabled ? "yes" : "no");
  upsertMeta("mobile-web-app-capable", enabled ? "yes" : "no");
  upsertMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
  upsertMeta(
    "apple-mobile-web-app-title",
    isAdmin ? `${config.shortName} Admin` : config.shortName
  );
}

function upsertLink(
  rel: string,
  href: string,
  extra?: { sizes?: string }
): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (extra?.sizes) el.sizes = extra.sizes;
}

function upsertMeta(name: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}
