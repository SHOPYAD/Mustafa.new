"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { destroyIyzicoArtifacts, installIyzicoViewportGuard } from "@/lib/payments/iyzico-viewport";

/** Global P0: never leave iyzico hosted iframes mounted after route/tab changes. */
export default function IyzicoViewportGuard() {
  const pathname = usePathname();

  useEffect(() => installIyzicoViewportGuard(), []);

  useEffect(() => {
    destroyIyzicoArtifacts();
    return () => {
      destroyIyzicoArtifacts();
    };
  }, [pathname]);

  return <div id="lonaliza-iyzico-viewport-guard" hidden aria-hidden="true" />;
}
