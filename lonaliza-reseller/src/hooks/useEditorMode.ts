"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/** True when a page is embedded in the Visual AI Editor (`?editor=1` or `?builder=1`). */
export function useEditorMode(): boolean {
  const searchParams = useSearchParams();
  return useMemo(() => {
    const editor = searchParams.get("editor");
    const builder = searchParams.get("builder");
    return editor === "1" || editor === "true" || builder === "1" || builder === "true";
  }, [searchParams]);
}
