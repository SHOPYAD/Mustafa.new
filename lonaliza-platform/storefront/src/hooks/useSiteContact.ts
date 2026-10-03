"use client";

import { useEffect, useState } from "react";
import {
  defaultSiteContact,
  getSiteContact,
  SITE_CONTACT_STORAGE_KEY,
  SITE_CONTACT_UPDATED_EVENT,
} from "@/data/site-contact";
import type { SiteContact } from "@/types/site-contact";

import { useStorefrontInit } from "@/providers/StorefrontInitProvider";

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

/** Live site contact CMS (localStorage + cross-tab sync + init context). */
export function useSiteContact(): SiteContact {
  const init = useStorefrontInit();
  const [contact, setContact] = useState<SiteContact>(() => {
    if (init.contact) return init.contact;
    return ssrContactPlaceholder();
  });

  useEffect(() => {
    if (init.contact) {
      setContact(init.contact);
    }
  }, [init.contact]);

  useEffect(() => {
    if (init.contact) {
      const onCustom = (e: Event) => {
        const detail = (e as CustomEvent<SiteContact>).detail;
        if (detail) setContact(detail);
      };
      const onStorage = (e: StorageEvent) => {
        if (e.key === SITE_CONTACT_STORAGE_KEY) setContact(getSiteContact());
      };
      window.addEventListener(SITE_CONTACT_UPDATED_EVENT, onCustom);
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(SITE_CONTACT_UPDATED_EVENT, onCustom);
        window.removeEventListener("storage", onStorage);
      };
    }

    const refresh = () => setContact(getSiteContact());
    refresh();

    // Fetch live settings from server only when outside bootstrap
    fetch("/api/public-contact")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.ok && payload.contact) {
          setContact(payload.contact);
          try {
            localStorage.setItem(SITE_CONTACT_STORAGE_KEY, JSON.stringify(payload.contact));
          } catch {}
        }
      })
      .catch(() => {});

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<SiteContact>).detail;
      if (detail) setContact(detail);
      else refresh();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === SITE_CONTACT_STORAGE_KEY) refresh();
    };

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
  }, [init.contact]);

  return contact;
}

