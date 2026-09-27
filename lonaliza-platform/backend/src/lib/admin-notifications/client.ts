import {
  announceKeysForNotification,
  titleArForType,
  type AdminNotificationRecord,
} from "@/lib/admin-notifications/types";

const ANNOUNCED_KEY = "alrayyan_admin_announced_ids";
const LAST_SEEN_KEY = "alrayyan_admin_notif_last_seen";
const ENABLED_KEY = "alrayyan_admin_browser_alerts";
const MAX_ANNOUNCED = 120;
const SW_PATH = "/sw-admin.js";

function readAnnounced(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANNOUNCED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.map((id) => String(id)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function writeAnnounced(ids: string[]): void {
  try {
    localStorage.setItem(
      ANNOUNCED_KEY,
      JSON.stringify(ids.slice(-MAX_ANNOUNCED))
    );
  } catch {
    /* private mode */
  }
}

export function wasAnnounced(key: string): boolean {
  return readAnnounced().includes(key);
}

export function markAnnounced(keys: string[]): void {
  const next = new Set(readAnnounced());
  for (const key of keys) {
    if (key) next.add(key);
  }
  writeAnnounced([...next]);
}

/** Returns keys that were not yet announced, and marks them so callers cannot double-fire. */
export function consumeAnnounceKeys(keys: string[]): string[] {
  const seen = new Set(readAnnounced());
  const fresh = keys.filter((key) => key && !seen.has(key));
  if (fresh.length) markAnnounced(fresh);
  return fresh;
}

export function getLastSeenNotificationId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(LAST_SEEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setLastSeenNotificationId(id: string): void {
  if (!id) return;
  try {
    localStorage.setItem(LAST_SEEN_KEY, id);
  } catch {
    /* ignore */
  }
}

export function markBrowserAlertsEnabled(): void {
  try {
    localStorage.setItem(ENABLED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function wantsBrowserAlerts(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

function playGeneratedChime(): void {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.11;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.52);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.54);
    });
    window.setTimeout(() => void ctx.close(), 900);
  } catch {
    /* audio unavailable */
  }
}

let audioUnlocked = false;

/** Soft chime from a local file, with oscillator fallback. */
export function playAdminChime(): void {
  if (!audioUnlocked) return;
  try {
    const audio = new Audio("/sounds/admin-chime.wav");
    audio.volume = 0.45;
    const played = audio.play();
    if (played && typeof played.catch === "function") {
      void played.catch(() => playGeneratedChime());
    }
  } catch {
    playGeneratedChime();
  }
}

export function unlockAdminAudio(): void {
  try {
    const audio = new Audio("/sounds/admin-chime.wav");
    audio.volume = 0.001;
    void audio
      .play()
      .then(() => {
        audioUnlocked = true;
        audio.pause();
        audio.currentTime = 0;
      })
      .catch(() => {
        /* autoplay blocked — wait for a later gesture */
      });
  } catch {
    /* ignore */
  }
}

export function getNotifyPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const existing = await navigator.serviceWorker.getRegistration("/");
    const script =
      existing?.active?.scriptURL ||
      existing?.waiting?.scriptURL ||
      existing?.installing?.scriptURL ||
      "";
    if (
      script.includes("/sw.js") ||
      script.includes("/sw-admin.js")
    ) {
      return existing ?? null;
    }
    return await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export async function subscribeAdminPush(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  if (!("PushManager" in window)) return false;
  if (getNotifyPermission() !== "granted") return false;

  try {
    const keyRes = await fetch("/api/admin/push/public-key", {
      cache: "no-store",
      credentials: "same-origin",
    });
    const keyJson = (await keyRes.json()) as { ok?: boolean; publicKey?: string };
    if (!keyRes.ok || !keyJson.publicKey) return false;

    const reg =
      (await navigator.serviceWorker.getRegistration(SW_PATH)) ||
      (await registerAdminServiceWorker());
    if (!reg) return false;
    await navigator.serviceWorker.ready;

    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyJson.publicKey),
      }));

    const res = await fetch("/api/admin/push/subscribe", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function unsubscribeAdminPush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/admin/push/subscribe", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
  } catch {
    /* ignore */
  }
}

/** User-gesture request: permission + SW + Web Push. */
export async function enableAdminBrowserAlerts(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  unlockAdminAudio();
  markBrowserAlertsEnabled();
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  await registerAdminServiceWorker();
  if (permission === "granted") {
    await subscribeAdminPush();
  }
  return permission;
}

/** Soft first-visit prompt — browsers often ignore this without a gesture. */
export function requestAdminNotifyPermission(): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "default") return;
  void Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      markBrowserAlertsEnabled();
      void registerAdminServiceWorker().then(() => subscribeAdminPush());
    }
  });
}

export async function showAdminOsNotification(
  item: AdminNotificationRecord
): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const title = item.title_ar || titleArForType(item.type);
  const tag = `admin-${item.id}`;
  const href = item.href || "/admin";

  try {
    const reg =
      (await navigator.serviceWorker.getRegistration(SW_PATH)) ||
      (await navigator.serviceWorker.ready.catch(() => null));
    if (reg?.showNotification) {
      await reg.showNotification(title, {
        body: item.body_ar || "",
        tag,
        lang: "ar",
        dir: "rtl",
        icon: "/logo.png",
        badge: "/favicon.png",
        data: { href, id: item.id },
      });
      return;
    }
  } catch {
    /* fall through */
  }

  const n = new Notification(title, {
    body: item.body_ar || "",
    tag,
    lang: "ar",
    icon: "/logo.png",
  });
  n.onclick = () => {
    try {
      window.focus();
      if (href) window.location.assign(href);
    } catch {
      /* ignore */
    }
    n.close();
  };
}

export function ingestAdminNotifications(
  items: AdminNotificationRecord[]
): AdminNotificationRecord[] {
  if (!items.length) return [];
  const newest = items[0];
  const lastSeen = getLastSeenNotificationId();
  if (!lastSeen) {
    setLastSeenNotificationId(newest.id);
    markAnnounced(items.flatMap((item) => announceKeysForNotification(item)));
    return [];
  }
  if (newest.id === lastSeen) return [];

  const lastCreated = items.find((row) => row.id === lastSeen)?.created || "";
  const fresh = lastCreated
    ? items.filter((row) => row.created > lastCreated)
    : items.slice(0, 4);
  const announced = announceNewNotifications(fresh);
  setLastSeenNotificationId(newest.id);
  return announced;
}

export function announceNewNotifications(
  items: AdminNotificationRecord[]
): AdminNotificationRecord[] {
  if (!items.length) return [];
  const fresh = items.filter((item) => {
    const keys = announceKeysForNotification(item);
    if (keys.some((key) => wasAnnounced(key))) return false;
    markAnnounced(keys);
    return true;
  });
  if (!fresh.length) return [];
  playAdminChime();
  for (const item of fresh.slice(0, 4)) {
    void showAdminOsNotification(item);
  }
  return fresh;
}

export function markPushItemAnnounced(id: string): void {
  if (!id) return;
  markAnnounced([`notif:${id}`]);
  const lastSeen = getLastSeenNotificationId();
  if (!lastSeen) setLastSeenNotificationId(id);
}
