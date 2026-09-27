"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function notifyNative(payload: Record<string, unknown>) {
  try {
    const bridge = (window as unknown as { LonalizaNativeBridge?: { postMessage: (m: string) => void } })
      .LonalizaNativeBridge;
    bridge?.postMessage(JSON.stringify(payload));
  } catch {
    /* web preview */
  }
}

/**
 * App-shell ready ping. SPA route changes must NOT paint a sticky overlay —
 * native loader dismissal is onPageFinished | pageReady | 6s | back, and
 * client navigations reuse the live DOM.
 */
export default function AppShellResilience() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    document.documentElement.classList.remove("lonaliza-shell-loading");
    document.documentElement.classList.add("lonaliza-app-shell");
    document.body?.classList.add("lonaliza-app-shell");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notifyNative({ type: "pageReady", href: window.location.href });
      });
    });
  }, [pathname, search]);

  return null;
}
