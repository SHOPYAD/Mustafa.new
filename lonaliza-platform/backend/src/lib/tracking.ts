/**
 * Conversion / event helpers for Meta & TikTok pixels.
 * No-op when pixels are missing or not yet loaded.
 * Checks runtime pixel presence (not build-time env) so admin-saved IDs work.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
      load: (id: string) => void;
    };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function fbReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function ttReady(): boolean {
  return (
    typeof window !== "undefined" && typeof window.ttq?.track === "function"
  );
}

/** Meta: Lead (enquiry / WhatsApp interest) */
export function trackFbLead(params?: Record<string, unknown>): void {
  if (!fbReady()) return;
  try {
    window.fbq!("track", "Lead", params || {});
  } catch {
    /* ignore */
  }
}

/** Meta: Contact */
export function trackFbContact(params?: Record<string, unknown>): void {
  if (!fbReady()) return;
  try {
    window.fbq!("track", "Contact", params || {});
  } catch {
    /* ignore */
  }
}

/** Meta: generic custom / standard event */
export function trackFbEvent(
  event: string,
  params?: Record<string, unknown>
): void {
  if (!fbReady() || !event) return;
  try {
    window.fbq!("track", event, params || {});
  } catch {
    /* ignore */
  }
}

/** TikTok: CompleteRegistration */
export function trackTikTokCompleteRegistration(
  params?: Record<string, unknown>
): void {
  if (!ttReady()) return;
  try {
    window.ttq!.track("CompleteRegistration", params || {});
  } catch {
    /* ignore */
  }
}

/** TikTok: Contact */
export function trackTikTokContact(params?: Record<string, unknown>): void {
  if (!ttReady()) return;
  try {
    window.ttq!.track("Contact", params || {});
  } catch {
    /* ignore */
  }
}

/** TikTok: SubmitForm */
export function trackTikTokSubmitForm(
  params?: Record<string, unknown>
): void {
  if (!ttReady()) return;
  try {
    window.ttq!.track("SubmitForm", params || {});
  } catch {
    /* ignore */
  }
}

/**
 * Fire common “lead / enquiry” events across enabled pixels.
 * Safe to call from WhatsApp CTA, contact form, callback request.
 */
export function trackLeadEnquiry(source?: string): void {
  const params = source ? { content_name: source } : undefined;
  trackFbLead(params);
  trackFbContact(params);
  trackTikTokContact(params);
  trackTikTokSubmitForm(params);
  trackTikTokCompleteRegistration(params);
}
