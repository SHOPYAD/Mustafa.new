const LEAK_HINTS = [
  "iyzipay",
  "iyzico",
  "iyziinit",
  "iyzi-checkout",
  "checkoutform",
  "checkout-form",
  "paywithiyzico",
  "pay-with-iyzico",
  "sandbox-api.iyzipay",
  "api.iyzipay.com",
];

const PROTECTED_IDS = new Set(["lonaliza-iyzico-card-sheet", "lonaliza-iyzico-3ds", "lonaliza-iyzico-viewport-guard"]);

export const IYZICO_3DS_MESSAGE = "lonaliza-iyzico-3ds";

export function isIyzicoLeakDescriptor(input: {
  tag?: string;
  id?: string;
  className?: string;
  name?: string;
  src?: string;
  text?: string;
}): boolean {
  const blob = [input.tag, input.id, input.className, input.name, input.src, input.text]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!blob) return false;
  if (PROTECTED_IDS.has(String(input.id || ""))) return false;
  return LEAK_HINTS.some((hint) => blob.includes(hint));
}

function blobOf(el: Element): {
  tag: string;
  id: string;
  className: string;
  name: string;
  src: string;
  text: string;
} {
  const src =
    el instanceof HTMLIFrameElement
      ? `${el.src} ${el.srcdoc || ""}`
      : el instanceof HTMLScriptElement
        ? `${el.src} ${(el.textContent || "").slice(0, 200)}`
        : "";
  return {
    tag: el.tagName,
    id: el.id || "",
    className: typeof el.className === "string" ? el.className : "",
    name: el.getAttribute("name") || "",
    src,
    text: "",
  };
}

function isProtected(el: Element): boolean {
  if (PROTECTED_IDS.has(el.id)) return true;
  return Boolean(el.closest("#lonaliza-iyzico-card-sheet, #lonaliza-iyzico-3ds"));
}

/**
 * iyzico Checkout Form / CF scripts append iframes to document.body.
 * Direct charge uses an in-page accordion iframe only — anything else is a leak.
 */
export function destroyIyzicoArtifacts(root: ParentNode | Document | null = typeof document === "undefined" ? null : document): number {
  if (!root || typeof document === "undefined") return 0;
  let removed = 0;
  const seen = new Set<Element>();
  const kill = (el: Element | null) => {
    if (!el || seen.has(el) || isProtected(el)) return;
    seen.add(el);
    el.remove();
    removed += 1;
  };

  const scan = (selector: string) => {
    root.querySelectorAll(selector).forEach((el) => {
      if (isIyzicoLeakDescriptor(blobOf(el))) kill(el);
    });
  };

  scan("iframe");
  scan("script");
  scan("form");

  ["iyzipay-checkout-form", "iyzico-checkout-form", "pay-with-iyzico", "iyzi-checkout-form"].forEach((id) => {
    kill(document.getElementById(id));
  });

  document.querySelectorAll("[id*='iyzi'], [class*='iyzi'], [name*='iyzi']").forEach((el) => {
    if (isIyzicoLeakDescriptor(blobOf(el))) kill(el);
  });

  return removed;
}

/** Strip body-injected CF/3DS chrome while the in-page accordion iframe stays mounted. */
export function observeIyzicoLeaks(): () => void {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => undefined;
  const mo = new MutationObserver(() => {
    try {
      destroyIyzicoArtifacts(document);
    } catch {
      /* ignore */
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  destroyIyzicoArtifacts(document);
  return () => {
    mo.disconnect();
    destroyIyzicoArtifacts(document);
  };
}

export function installIyzicoViewportGuard(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const run = () => {
    try {
      destroyIyzicoArtifacts(document);
    } catch {
      /* ignore */
    }
  };
  run();
  window.addEventListener("pagehide", run);
  window.addEventListener("beforeunload", run);
  window.addEventListener("popstate", run);
  window.addEventListener("visibilitychange", run);
  window.addEventListener("hashchange", run);
  document.addEventListener("visibilitychange", run);
  return () => {
    window.removeEventListener("pagehide", run);
    window.removeEventListener("beforeunload", run);
    window.removeEventListener("popstate", run);
    window.removeEventListener("visibilitychange", run);
    window.removeEventListener("hashchange", run);
    document.removeEventListener("visibilitychange", run);
    run();
  };
}
