"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/** True when a public page is embedded in the multi-page builder (`?builder=1`). */
export function useBuilderMode(): boolean {
  const searchParams = useSearchParams();
  return useMemo(() => {
    const v = searchParams.get("builder");
    return v === "1" || v === "true";
  }, [searchParams]);
}
