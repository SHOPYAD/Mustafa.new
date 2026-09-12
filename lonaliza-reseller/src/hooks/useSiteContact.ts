"use client";

import { useEffect, useState } from "react";
import {
  defaultSiteContact,
  getSiteContact,
  SITE_CONTACT_STORAGE_KEY,
  SITE_CONTACT_UPDATED_EVENT,
} from "@/data/site-contact";
import type { SiteContact } from "@/types/site-contact";

/**
 * SSR placeholder: empty `social` so public chrome never paints the default
 * “all networks enabled” list before localStorage is read.
 */
function ssrContactPlaceholder(): SiteContact {
  return {
    ...defaultSiteContact,
    customerServicePhones: [...defaultSiteContact.customerServicePhones],
    social: [],
  };
}

/** Live site contact CMS (localStorage + cross-tab sync). */
export function useSiteContact(): SiteContact {
  // Same snapshot on server and the first client paint. Reading localStorage
  // in useState (via `typeof window`) made Footer/SocialSidebar HTML differ
  // from SSR and triggered React #418.
  const [contact, setContact] = useState<SiteContact>(() => ssrContactPlaceholder());

  useEffect(() => {
    const refresh = () => setContact(getSiteContact());
    refresh();

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<SiteContact>).detail;
      if (detail) setContact(detail);
      else refresh();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === SITE_CONTACT_STORAGE_KEY) refresh();
    };

    // Re-sync when returning to the tab (storage events only fire cross-tab)
    const onFocus = () => refresh();

    window.addEventListener(SITE_CONTACT_UPDATED_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onFocus);
    return () => {
      window.removeEventListener(SITE_CONTACT_UPDATED_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onFocus);
    };
  }, []);

  return contact;
}
