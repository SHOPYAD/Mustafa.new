export type NativeNotice = {
  type: "notification";
  title: string;
  body?: string;
  href?: string;
  senderName?: string;
};

function flutterBridge(): { postMessage: (m: string) => void } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    LonalizaNativeBridge?: { postMessage: (m: string) => void };
    LonalizaBridge?: { postMessage: (m: string) => void };
  };
  const bridge = w.LonalizaNativeBridge || w.LonalizaBridge;
  return bridge && typeof bridge.postMessage === "function" ? bridge : null;
}

export function postNativeNotification(notice: Omit<NativeNotice, "type">): boolean {
  const bridge = flutterBridge();
  if (!bridge) return false;
  try {
    bridge.postMessage(
      JSON.stringify({
        type: "notification",
        title: notice.title,
        body: notice.body || "",
        href: notice.href || "",
        senderName: notice.senderName || "",
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function notifyIncomingMessage(senderName: string, href?: string) {
  const title = `رسالة من ${senderName || "مسافر"}`;
  postNativeNotification({ title, body: title, href, senderName });
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("lonaliza-dm", { detail: { title, senderName, href } }),
    );
  }
}
