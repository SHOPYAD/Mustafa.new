"use client";

import { useEffect, useState } from "react";
import {
  defaultHomepageContent,
  getHomepageContent,
  HOMEPAGE_UPDATED_EVENT,
  HOMEPAGE_STORAGE_KEY,
} from "@/data/homepage";
import type { HomepageContent } from "@/types/homepage";
import {
  isEditorCmsSyncType,
  isEditorRefreshType,
} from "@/lib/editor-protocol";

/** Live homepage CMS content (localStorage + cross-tab / iframe sync). */
export function useHomepageContent(): HomepageContent {
  // Always seed with the compiled default so SSR HTML matches the first
  // client paint. getHomepageContent() reads localStorage on the client and
  // can return a different tree (and even write storage) during render.
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);

  useEffect(() => {
    setContent(getHomepageContent());

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<HomepageContent>).detail;
      if (detail) setContent(detail);
      else setContent(getHomepageContent());
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === HOMEPAGE_STORAGE_KEY) setContent(getHomepageContent());
    };

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (
        isEditorCmsSyncType(e.data?.type) ||
        isEditorRefreshType(e.data?.type)
      ) {
        setContent(getHomepageContent());
      }
    };

    window.addEventListener(HOMEPAGE_UPDATED_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener(HOMEPAGE_UPDATED_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return content;
}
