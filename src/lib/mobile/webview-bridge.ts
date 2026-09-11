const ALLOWED_HOST_PATHS = ["/ai-chat", "/community", "/community/reels"];

export type MobileBridgeMessage = {
  type: "navigate" | "filter" | "book";
  href?: string;
  filters?: unknown;
  itineraryId?: string;
};

type FlutterBridge = { postMessage: (message: string) => void };

function flutterBridge(): FlutterBridge | null {
  if (typeof window === "undefined") return null;
  const candidate = (window as unknown as { LonalizaBridge?: FlutterBridge }).LonalizaBridge;
  return candidate && typeof candidate.postMessage === "function" ? candidate : null;
}

export function isMobileWebViewBridge(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("mobileBridge") === "1") return true;
  return flutterBridge() != null;
}

export function postMobileBridge(message: MobileBridgeMessage): boolean {
  const bridge = flutterBridge();
  if (!bridge) return false;
  const path = window.location.pathname;
  if (!ALLOWED_HOST_PATHS.includes(path)) return false;
  bridge.postMessage(JSON.stringify(message));
  return true;
}
