/** Site contact & social — localStorage CMS */

import type {
  SiteContact,
  SocialLinkConfig,
  SocialNetworkId,
} from "@/types/site-contact";
import type { Locale } from "@/lib/i18n/types";
import { buildWhatsAppLink, normalizeWhatsAppNumber } from "@/lib/utils";

const STORAGE_KEY = "liotrip_site_contact_v1";
const LEGACY_STORAGE_KEY = "oktravel_site_contact_v1";
export const SITE_CONTACT_STORAGE_KEY = STORAGE_KEY;
export const SITE_CONTACT_UPDATED_EVENT = "liotrip:site-contact-updated";

/** Default business WhatsApp (digits) — shared fallback for imports / forms */
export const DEFAULT_SITE_WHATSAPP = "905313591394";

export const SITE_PUBLIC_EMAIL = "info@lonaliza.com";
export const SITE_PUBLIC_PHONE = "+90 531 359 13 94";
export const SITE_PUBLIC_ADDRESS_AR = "إسطنبول، تركيا";
export const SITE_PUBLIC_ADDRESS_EN = "Istanbul, Turkey";
export const SITE_PUBLIC_ADDRESS = `${SITE_PUBLIC_ADDRESS_AR}\n${SITE_PUBLIC_ADDRESS_EN}`;

/** Legacy demo-company numbers (UAE template) — never show as Alrayyan contact. */
export const LEGACY_DEMO_PHONE_DIGITS = new Set([
  "971585255484",
  "9715852554840",
  "971525376367",
]);

const DEMO_EMAIL_RE = /oktravels?\.com|oktravels?\.ae/i;
const DEMO_ADDRESS_RE =
  /business\s*bay|الخليج\s*التجاري|united arab emirates|الإمارات العربية المتحدة/i;
const DEMO_SOCIAL_RE = /oktravel/i;

export function isDemoCompanyEmail(value: string): boolean {
  return DEMO_EMAIL_RE.test(String(value || ""));
}

export function isDemoCompanyAddress(value: string): boolean {
  return DEMO_ADDRESS_RE.test(String(value || ""));
}

export function isDemoCompanyPhone(value: string): boolean {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return false;
  if (LEGACY_DEMO_PHONE_DIGITS.has(digits)) return true;
  return digits.endsWith("585255484") || digits.endsWith("525376367");
}

export function isDemoCompanySocial(value: string): boolean {
  return DEMO_SOCIAL_RE.test(String(value || ""));
}

/** Default prefilled WhatsApp message for site-wide CTAs */
export const DEFAULT_WHATSAPP_MESSAGE_EN =
  "Hello Lonaliza Tourism! I would like help planning my trip to Turkey.";
export const DEFAULT_WHATSAPP_MESSAGE_AR =
  "مرحباً لوناليزا للسياحة! أرغب بالمساعدة في تخطيط رحلتي إلى تركيا.";

const defaultSocial: SocialLinkConfig[] = [
  {
    id: "whatsapp",
    enabled: true,
    url: "",
    handle: "24/7 Support",
  },
  {
    id: "instagram",
    enabled: false,
    url: "",
    handle: "",
  },
  {
    id: "facebook",
    enabled: false,
    url: "",
    handle: "",
  },
  {
    id: "youtube",
    enabled: false,
    url: "",
    handle: "",
  },
  {
    id: "tiktok",
    enabled: false,
    url: "",
    handle: "",
  },
  {
    id: "twitter",
    enabled: false,
    url: "",
    handle: "",
  },
  {
    id: "linkedin",
    enabled: false,
    url: "",
    handle: "",
  },
  {
    id: "snapchat",
    enabled: false,
    url: "",
    handle: "",
  },
];

export const defaultSiteContact: SiteContact = {
  whatsappNumber: DEFAULT_SITE_WHATSAPP,
  whatsappMessageEn: DEFAULT_WHATSAPP_MESSAGE_EN,
  whatsappMessageAr: DEFAULT_WHATSAPP_MESSAGE_AR,
  whatsappEnabled: true,
  customerServicePhones: [SITE_PUBLIC_PHONE],
  callbackPhone: SITE_PUBLIC_PHONE,
  email: SITE_PUBLIC_EMAIL,
  address: SITE_PUBLIC_ADDRESS,
  supportHours: "يوميًا: 9 صباحاً – 9 مساءً\nDaily: 9AM – 9PM",
  social: defaultSocial,
  floatingHubEnabled: true,
  floatingHubPosition: "right",
  floatingHubBottomPx: 24,
  callbackBannerEnabled: true,
  callbackBannerPosition: "right",
  callbackBannerBottomPx: 24,
  b2bAdvisorEnabled: true,
  b2bAdvisorPosition: "right",
  b2bAdvisorBottomPx: 24,
};

export const SOCIAL_NETWORK_IDS: SocialNetworkId[] = [
  "whatsapp",
  "instagram",
  "facebook",
  "youtube",
  "tiktok",
  "twitter",
  "linkedin",
  "snapchat",
];

function emit(detail: SiteContact) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SITE_CONTACT_UPDATED_EVENT, { detail })
  );
}

function persist(contact: SiteContact) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
  emit(contact);
}

function mergeSocial(
  stored: SocialLinkConfig[] | undefined
): SocialLinkConfig[] {
  const byId = new Map(
    (Array.isArray(stored) ? stored : []).map((s) => [s.id, s])
  );
  return defaultSocial.map((d) => {
    const s = byId.get(d.id);
    if (!s) return { ...d };
    const url = typeof s.url === "string" ? s.url : "";
    const handle = typeof s.handle === "string" ? s.handle : "";
    const demo = isDemoCompanySocial(url) || isDemoCompanySocial(handle);
    if (s.id === "whatsapp") {
      return {
        id: d.id,
        enabled: s.enabled === true,
        url: demo ? "" : url,
        handle: typeof s.handle === "string" ? s.handle : d.handle,
      };
    }
    if (demo) {
      return { id: d.id, enabled: false, url: "", handle: "" };
    }
    return {
      id: d.id,
      enabled: s.enabled === true && Boolean(url.trim()),
      url,
      handle,
    };
  });
}

function scrubContact(contact: SiteContact): SiteContact {
  const phones = contact.customerServicePhones.filter(
    (phone) => phone && !isDemoCompanyPhone(phone)
  );
  const whatsapp = isDemoCompanyPhone(contact.whatsappNumber)
    ? defaultSiteContact.whatsappNumber
    : contact.whatsappNumber;
  const callback = isDemoCompanyPhone(contact.callbackPhone)
    ? defaultSiteContact.callbackPhone
    : contact.callbackPhone;
  return {
    ...contact,
    whatsappNumber: whatsapp || defaultSiteContact.whatsappNumber,
    customerServicePhones:
      phones.length > 0 ? phones : [...defaultSiteContact.customerServicePhones],
    callbackPhone: callback || defaultSiteContact.callbackPhone,
    email: isDemoCompanyEmail(contact.email)
      ? defaultSiteContact.email
      : contact.email,
    address: isDemoCompanyAddress(contact.address)
      ? defaultSiteContact.address
      : contact.address,
  };
}

function contactNeedsPersist(before: SiteContact, after: SiteContact): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}

function normalize(raw: Partial<SiteContact> | null | undefined): SiteContact {
  const phones = Array.isArray(raw?.customerServicePhones)
    ? raw!.customerServicePhones.map(String).filter(Boolean)
    : defaultSiteContact.customerServicePhones;
  const next: SiteContact = {
    whatsappNumber:
      normalizeWhatsAppNumber(String(raw?.whatsappNumber || "")) ||
      defaultSiteContact.whatsappNumber,
    whatsappMessageEn:
      typeof raw?.whatsappMessageEn === "string" && raw.whatsappMessageEn.trim()
        ? raw.whatsappMessageEn.trim()
        : defaultSiteContact.whatsappMessageEn,
    whatsappMessageAr:
      typeof raw?.whatsappMessageAr === "string" && raw.whatsappMessageAr.trim()
        ? raw.whatsappMessageAr.trim()
        : defaultSiteContact.whatsappMessageAr,
    whatsappEnabled: raw?.whatsappEnabled !== false,
    customerServicePhones:
      phones.length > 0 ? phones : [...defaultSiteContact.customerServicePhones],
    callbackPhone:
      typeof raw?.callbackPhone === "string"
        ? raw.callbackPhone
        : defaultSiteContact.callbackPhone,
    email:
      typeof raw?.email === "string" && raw.email.trim()
        ? raw.email.trim()
        : defaultSiteContact.email,
    address:
      typeof raw?.address === "string"
        ? raw.address
        : defaultSiteContact.address,
    supportHours:
      typeof raw?.supportHours === "string"
        ? raw.supportHours
        : defaultSiteContact.supportHours,
    social: mergeSocial(raw?.social),
  };
  return scrubContact(next);
}

export function getSiteContact(): SiteContact {
  if (typeof window === "undefined") {
    return {
      ...defaultSiteContact,
      customerServicePhones: [...defaultSiteContact.customerServicePhones],
      social: defaultSocial.map((s) => ({ ...s })),
    };
  }
  const raw =
    localStorage.getItem(STORAGE_KEY) ||
    localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    const initial = normalize(defaultSiteContact);
    persist(initial);
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SiteContact>;
    const next = normalize(parsed);
    const previous = {
      ...parsed,
      social: Array.isArray(parsed.social) ? parsed.social : [],
    } as SiteContact;
    if (contactNeedsPersist(previous, next)) persist(next);
    return next;
  } catch {
    return normalize(defaultSiteContact);
  }
}

export function saveSiteContact(contact: SiteContact): SiteContact {
  const next = normalize(contact);
  persist(next);
  return next;
}

export function resetSiteContact(): SiteContact {
  const next = normalize(defaultSiteContact);
  persist(next);
  return next;
}

/** Primary customer phone for tel: links */
export function getPrimaryPhone(contact?: SiteContact): string {
  const c = contact || getSiteContact();
  return (
    c.customerServicePhones[0] ||
    c.callbackPhone ||
    `+${c.whatsappNumber}` ||
    ""
  );
}

/** Digits-only for tel: / display helpers */
export function phoneToTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return "#";
  return digits.startsWith("+") ? `tel:${digits}` : `tel:+${digits}`;
}

/** Resolve href for a social network entry */
export function resolveSocialHref(
  link: SocialLinkConfig,
  whatsappNumber: string
): string {
  if (link.id === "whatsapp") {
    if (link.url?.includes("wa.me") || link.url?.startsWith("http")) {
      if (isDemoCompanySocial(link.url)) {
        return buildWhatsAppLink(whatsappNumber || DEFAULT_SITE_WHATSAPP);
      }
      return link.url;
    }
    return buildWhatsAppLink(whatsappNumber || DEFAULT_SITE_WHATSAPP);
  }
  return link.url || "#";
}

export function getEnabledSocialLinks(contact?: SiteContact): SocialLinkConfig[] {
  const c = contact || getSiteContact();
  return c.social.filter((s) => {
    if (s.enabled !== true) return false;
    if (s.id === "whatsapp") {
      if (c.whatsappEnabled === false) return false;
      return Boolean(c.whatsappNumber?.trim() || s.url?.trim());
    }
    if (isDemoCompanySocial(s.url) || isDemoCompanySocial(s.handle)) return false;
    return Boolean(s.url?.trim());
  });
}

/** Resolve default WhatsApp prefilled message for locale */
export function getWhatsAppMessage(
  contact?: SiteContact,
  locale: Locale = "en"
): string {
  const c = contact || getSiteContact();
  if (locale === "ar") {
    return c.whatsappMessageAr || DEFAULT_WHATSAPP_MESSAGE_AR;
  }
  return c.whatsappMessageEn || DEFAULT_WHATSAPP_MESSAGE_EN;
}
