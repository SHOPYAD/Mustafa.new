"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AFFILIATE_VISIT_SESSION_PREFIX } from "@/lib/affiliate/types";

const TRACKED = new Set(["/", "/flights", "/hotels", "/cars", "/transfers"]);

function pathService(path: string): string {
  if (path === "/flights") return "flight";
  if (path === "/hotels") return "hotel";
  if (path === "/cars") return "car";
  if (path === "/transfers") return "transfer";
  return "other";
}

export default function AffiliateTracker() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    const path = pathname.split("?")[0] || "/";
    if (!TRACKED.has(path)) return;
    if (path.startsWith("/admin")) return;

    const key = `${AFFILIATE_VISIT_SESSION_PREFIX}${path}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* private mode */
    }

    const hasRef =
      typeof document !== "undefined" &&
      document.cookie.split(";").some((c) => c.trim().startsWith("alrayyan_ref="));
    if (!hasRef) return;

    void fetch("/api/affiliate/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, service: pathService(path) }),
    })
      .then(() => {
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          /* ignore */
        }
      })
      .catch(() => undefined);
  }, [pathname]);

  return null;
}
