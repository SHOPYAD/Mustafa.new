/* Alrayyan admin PWA — /admin scope. App shell only; never cache /api. */
const CACHE = "alrayyan-admin-pwa-v2";
const SHELL = ["/admin", "/admin/manifest.webmanifest", "/logo.png", "/favicon.png"];

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
            .filter((key) => key !== CACHE && key.startsWith("alrayyan-admin-pwa-"))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function shouldBypass(url) {
  const path = url.pathname.toLowerCase();
  if (url.origin !== self.location.origin) return true;
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
    event.respondWith(networkFirst(req, "/admin"));
    return;
  }
  if (isAsset(url)) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirst(req, fallbackPath) {
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
    const shell = await caches.match(fallbackPath);
    if (shell) return shell;
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
