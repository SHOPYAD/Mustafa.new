/** Public site contact + social accounts (CMS) */

export type SocialNetworkId =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "linkedin"
  | "snapchat";

export type SocialLinkConfig = {
  id: SocialNetworkId;
  enabled: boolean;
  /** Full profile/page URL (WhatsApp may be empty — uses whatsappNumber) */
  url: string;
  /** Short handle / label shown on hover */
  handle: string;
};

export type SiteContact = {
  /** Digits with country code, e.g. 905321796763 — floating WA + wa.me */
  whatsappNumber: string;
  /** Optional prefilled message (English) for site-wide WhatsApp CTAs */
  whatsappMessageEn?: string;
  /** Optional prefilled message (Arabic) for site-wide WhatsApp CTAs */
  whatsappMessageAr?: string;
  /** When false, floating WhatsApp and social WA link are hidden */
  whatsappEnabled?: boolean;
  /** Primary customer-service phone(s), display or E.164 */
  customerServicePhones: string[];
  /** Optional phone shown for “Get a Callback” / call-back display */
  callbackPhone: string;
  email: string;
  /** Short address for footer / contact page */
  address: string;
  /** Free-text support hours */
  supportHours: string;
  social: SocialLinkConfig[];
};
