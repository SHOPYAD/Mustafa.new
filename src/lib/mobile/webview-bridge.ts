const ALLOWED_HOST_PATHS = [
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
];

export type MobileBridgeMessage = {
  type: "navigate" | "filter" | "book" | "notification" | "goHome";
  href?: string;
  path?: string;
  filters?: unknown;
  itineraryId?: string;
  title?: string;
  body?: string;
  senderName?: string;
  replace?: boolean;
};

export type LonalizaNavigateOpts = { replace?: boolean };

type FlutterBridge = { postMessage: (message: string) => void };

type LonalizaShellWindow = Window & {
  LonalizaNativeBridge?: FlutterBridge;
  LonalizaBridge?: FlutterBridge;
  __lonalizaNavigate?: (path: string, opts?: LonalizaNavigateOpts) => void;
  __lonalizaGoHome?: () => void;
  __lonalizaRouter?: {
    push: (path: string) => void;
    replace: (path: string) => void;
    prefetch?: (path: string) => void;
  };
  __lonalizaNavigateImpl?: (path: string, opts?: LonalizaNavigateOpts) => void;
  __lonalizaNavQueue?: Array<{ path: string; replace?: boolean }>;
  __lonalizaFlushNav?: () => void;
};

declare global {
  interface Window {
    __lonalizaNavigate?: (path: string, opts?: LonalizaNavigateOpts) => void;
    __lonalizaGoHome?: () => void;
    __lonalizaRouter?: {
      push: (path: string) => void;
      replace: (path: string) => void;
      prefetch?: (path: string) => void;
    };
    __lonalizaNavigateImpl?: (path: string, opts?: LonalizaNavigateOpts) => void;
    __lonalizaNavQueue?: Array<{ path: string; replace?: boolean }>;
    __lonalizaFlushNav?: () => void;
  }
}

function shellWindow(): LonalizaShellWindow | null {
  const g = globalThis as unknown as { window?: LonalizaShellWindow };
  return g.window ?? null;
}

function flutterBridge(): FlutterBridge | null {
  const w = shellWindow();
  if (!w) return null;
  const candidate = w.LonalizaNativeBridge || w.LonalizaBridge;
  return candidate && typeof candidate.postMessage === "function" ? candidate : null;
}

export function isMobileWebViewBridge(): boolean {
  const w = shellWindow();
  if (!w) return false;
  try {
    if (new URLSearchParams(w.location.search).get("mobileBridge") === "1") return true;
  } catch {
    /* node tests */
  }
  return flutterBridge() != null;
}

export function postMobileBridge(message: MobileBridgeMessage): boolean {
  const bridge = flutterBridge();
  const w = shellWindow();
  if (!bridge || !w) return false;
  const path = w.location?.pathname || "";
  if (!ALLOWED_HOST_PATHS.includes(path)) return false;
  bridge.postMessage(JSON.stringify(message));
  return true;
}

/** Navigation agent / native chrome: reuse the live Next.js router. */
export function navigate(path: string, opts?: LonalizaNavigateOpts): boolean {
  const w = shellWindow();
  if (!w) return false;
  if (typeof w.__lonalizaNavigate === "function") {
    w.__lonalizaNavigate(path, opts);
    return true;
  }
  if (typeof w.__lonalizaRouter?.push === "function") {
    if (opts?.replace && w.__lonalizaRouter.replace) w.__lonalizaRouter.replace(path);
    else w.__lonalizaRouter.push(path);
    return true;
  }
  return postMobileBridge({ type: "navigate", path, replace: opts?.replace });
}

export function goHome(): boolean {
  const w = shellWindow();
  if (!w) return false;
  if (typeof w.__lonalizaGoHome === "function") {
    w.__lonalizaGoHome();
    return true;
  }
  return navigate("/?app=1", { replace: true });
}
