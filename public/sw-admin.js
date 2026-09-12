/* Alrayyan admin alerts — keep this file at site root scope. */
const DEFAULT_TITLE = "لوناليزا للسياحة والسفر";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

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
