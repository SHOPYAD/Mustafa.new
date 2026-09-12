/* Alrayyan public PWA — app-shell cache. Never stores secrets or /api. */
const CACHE = "alrayyan-public-v1";
const SHELL = [
  "/",
  "/manifest.webmanifest",
  "/logo.png",
  "/favicon.png",
  "/apple-touch-icon.png",
];
const DEFAULT_TITLE = "الريان للسياحة";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE && key.startsWith("alrayyan-public-"))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function shouldBypass(url) {
  const path = url.pathname.toLowerCase();
  if (url.origin !== self.location.origin) return true;
  if (path.startsWith("/admin")) return true;
  if (path.startsWith("/api/")) return true;
  if (path.includes(".env") || path.endsWith("/env")) return true;
  if (path.includes("credentials") || path.includes("secret")) return true;
  return false;
}

function isAsset(url) {
  return /\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp|ico|webmanifest)$/i.test(
    url.pathname
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (shouldBypass(url)) return;

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }
  if (isAsset(url)) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok && fresh.type !== "opaqueredirect") {
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    const home = await caches.match("/");
    if (home) return home;
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const fetching = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || fetching;
}

function payloadFromEvent(event) {
  const fallback = {
    title: DEFAULT_TITLE,
    body: "إشعار جديد",
    href: "/admin",
    tag: "admin",
    id: "",
  };
  try {
    if (!event.data) return fallback;
    const data = event.data.json();
    return {
      title: String(data.title || fallback.title),
      body: String(data.body || ""),
      href: String(data.href || "/admin"),
      tag: String(data.tag || (data.id ? `admin-${data.id}` : "admin")),
      id: String(data.id || ""),
    };
  } catch {
    try {
      const text = event.data && event.data.text ? String(event.data.text()) : "";
      return { ...fallback, body: text.slice(0, 180) };
    } catch {
      return fallback;
    }
  }
}

function showAdminNotification(data) {
  return self.registration.showNotification(data.title || DEFAULT_TITLE, {
    body: data.body || "",
    tag: data.tag || (data.id ? `admin-${data.id}` : "admin"),
    lang: "ar",
    dir: "rtl",
    icon: "/logo.png",
    badge: "/favicon.png",
    data: { href: data.href || "/admin", id: data.id || "" },
    renotify: false,
  });
}

self.addEventListener("push", (event) => {
  const data = payloadFromEvent(event);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        client.postMessage({ type: "admin-push", item: data });
      }
      await showAdminNotification(data);
    })()
  );
});

self.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg || msg.type !== "admin-notify") return;
  event.waitUntil(
    showAdminNotification({
      title: msg.title,
      body: msg.body,
      href: msg.href,
      tag: msg.tag,
      id: msg.id,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href =
    (event.notification.data && event.notification.data.href) || "/admin";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ("focus" in client) {
            if (href && client.navigate) {
              return client.navigate(href).then((opened) => {
                if (opened && "focus" in opened) return opened.focus();
                return client.focus();
              });
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(href);
        return undefined;
      })
  );
});
