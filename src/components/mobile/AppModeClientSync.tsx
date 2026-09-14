"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { APP_SHELL_COOKIE, isAppModeQuery } from "@/lib/mobile/app-mode";
import AppShellResilience from "@/components/mobile/AppShellResilience";

const PREFETCH_PATHS = [
  "/?app=1",
  "/account?tab=wallet&app=1",
  "/community?app=1",
  "/account?app=1",
  "/flights?app=1",
  "/hotels?app=1",
  "/cars?app=1",
  "/packages?app=1",
  "/menu?app=1",
];

function withAppParam(path: string): string {
  try {
    const url = new URL(path, typeof window === "undefined" ? "https://lonaliza.com" : window.location.origin);
    if (!url.searchParams.has("app")) url.searchParams.set("app", "1");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return path.includes("app=1") ? path : `${path}${path.includes("?") ? "&" : "?"}app=1`;
  }
}

export default function AppModeClientSync({ initialIsApp }: { initialIsApp?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasQuery = isAppModeQuery(`?${searchParams.toString()}`);
  const isApp = Boolean(initialIsApp || hasQuery);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const run = (path: string, opts?: { replace?: boolean }) => {
      const next = withAppParam(path);
      try {
        if (opts?.replace) router.replace(next);
        else router.push(next);
      } catch {
        router.push(next);
      }
    };

    window.__lonalizaRouter = router;
    window.__lonalizaNavigateImpl = run;
    window.__lonalizaNavigate = (path: string, opts?: { replace?: boolean }) => run(path, opts);
    window.__lonalizaGoHome = () => run("/?app=1", { replace: true });
    if (typeof window.__lonalizaFlushNav === "function") {
      window.__lonalizaFlushNav();
    } else if (Array.isArray(window.__lonalizaNavQueue) && window.__lonalizaNavQueue.length) {
      const queued = window.__lonalizaNavQueue.slice();
      window.__lonalizaNavQueue = [];
      queued.forEach((item) => run(item.path, { replace: item.replace }));
    }

    const hasQueryNow = isAppModeQuery(window.location.search);
    const isNativeApp = Boolean(initialIsApp || navigator.userAgent.includes("LonalizaApp"));
    const inApp = isNativeApp || hasQueryNow;

    if (inApp) {
      document.documentElement.classList.add("lonaliza-app-shell");
      document.body.classList.add("lonaliza-app-shell");
      for (const path of PREFETCH_PATHS) {
        try {
          router.prefetch(path);
        } catch {
          /* prefetch is best-effort */
        }
      }
    } else {
      document.documentElement.classList.remove("lonaliza-app-shell");
      document.body.classList.remove("lonaliza-app-shell");
      if (document.cookie.includes(APP_SHELL_COOKIE)) {
        document.cookie = `${APP_SHELL_COOKIE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
  }, [searchParams, initialIsApp, router]);

  return isApp ? (
    <Suspense fallback={null}>
      <AppShellResilience />
    </Suspense>
  ) : null;
}
