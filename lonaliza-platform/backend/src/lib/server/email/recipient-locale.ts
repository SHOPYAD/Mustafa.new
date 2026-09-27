import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type {
  CustomerRecord,
  EnquiryBookingRecord,
  HotelBookingRecord,
} from "@/lib/pocketbase/records";
import { SITE_LOCALE_STORAGE_KEY } from "@/lib/i18n/locale-storage";
import { defaultDirForCode, isValidLangCode, normalizeLangCode } from "@/lib/i18n/catalog";
import { listRegisteredLocales } from "@/lib/server/translations-store";
import { readRequestCookie } from "@/lib/http/cookies";

export const DEFAULT_EMAIL_LOCALE = "ar";

const LOCALE_ALIASES: Record<string, string> = {
  arabic: "ar",
  english: "en",
  turkish: "tr",
  turkce: "tr",
  türkçe: "tr",
  français: "fr",
  francais: "fr",
  french: "fr",
  العربية: "ar",
  الإنجليزية: "en",
  التركية: "tr",
};

export function localeDir(locale: string): "rtl" | "ltr" {
  return defaultDirForCode(locale);
}

export function pickLocaleFromUnknown(value: unknown): string {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (!raw) return "";
  const aliased = LOCALE_ALIASES[raw] || raw;
  const code = normalizeLangCode(aliased.split(/[\s,;/|]+/)[0] || "");
  if (!code || !isValidLangCode(code)) return "";
  return code;
}

export async function normalizeSiteLocale(raw: unknown): Promise<string> {
  const code = pickLocaleFromUnknown(raw);
  if (!code) return DEFAULT_EMAIL_LOCALE;
  try {
    const locales = await listRegisteredLocales();
    const known = new Set(locales.map((item) => item.code));
    if (known.has(code)) return code;
    const base = code.split("-")[0] || "";
    if (known.has(base)) return base;
  } catch {
    if (code === "ar" || code === "en" || code === "tr") return code;
  }
  if (code === "ar" || code === "en" || code === "tr") return code;
  return DEFAULT_EMAIL_LOCALE;
}

export function localeFromRequest(req: Request, body?: Record<string, unknown>): string {
  const fromBody = pickLocaleFromUnknown(body?.locale || body?.lang || body?.language);
  if (fromBody) return fromBody;
  const cookie = pickLocaleFromUnknown(readRequestCookie(req, SITE_LOCALE_STORAGE_KEY));
  return cookie || DEFAULT_EMAIL_LOCALE;
}

function localeFromMeta(meta: Record<string, unknown> | undefined): string {
  if (!meta) return "";
  return pickLocaleFromUnknown(meta.locale || meta.lang || meta.language);
}

export async function resolveRecipientLocale(input: {
  email?: string;
  explicit?: unknown;
  customerLocale?: unknown;
  bookingLocale?: unknown;
}): Promise<string> {
  const explicit = await normalizeSiteLocale(input.explicit);
  if (pickLocaleFromUnknown(input.explicit) && explicit) return explicit;

  const fromCustomer = pickLocaleFromUnknown(input.customerLocale);
  if (fromCustomer) return normalizeSiteLocale(fromCustomer);

  const fromBooking = pickLocaleFromUnknown(input.bookingLocale);
  if (fromBooking) return normalizeSiteLocale(fromBooking);

  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  if (!email) return DEFAULT_EMAIL_LOCALE;

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return DEFAULT_EMAIL_LOCALE;

  try {
    const customer = await pb
      .collection("customers")
      .getFirstListItem<CustomerRecord & { locale?: string }>(
        `email="${email.replace(/"/g, "")}"`
      );
    const saved = pickLocaleFromUnknown(customer.locale);
    if (saved) return normalizeSiteLocale(saved);
  } catch {
    /* no customer row */
  }

  try {
    const [hotels, enquiries] = await Promise.all([
      pb.collection("hotel_bookings").getList<HotelBookingRecord>(1, 1, {
        filter: `customer_email="${email.replace(/"/g, "")}"`,
        sort: "-created",
      }),
      pb.collection("enquiry_bookings").getList<EnquiryBookingRecord>(1, 1, {
        filter: `customer_email="${email.replace(/"/g, "")}"`,
        sort: "-created",
      }),
    ]);
    const hotel = hotels.items[0];
    const enquiry = enquiries.items[0];
    const hotelAt = hotel?.created || "";
    const enquiryAt = enquiry?.created || "";
    const newerIsHotel = hotel && (!enquiry || hotelAt >= enquiryAt);
    if (newerIsHotel && hotel) {
      const snap =
        hotel.offer_snapshot && typeof hotel.offer_snapshot === "object"
          ? hotel.offer_snapshot
          : {};
      const fromHotel = localeFromMeta(snap);
      if (fromHotel) return normalizeSiteLocale(fromHotel);
    }
    if (enquiry) {
      const fromEnquiry = localeFromMeta(enquiry.metadata);
      if (fromEnquiry) return normalizeSiteLocale(fromEnquiry);
    }
    if (hotel) {
      const snap =
        hotel.offer_snapshot && typeof hotel.offer_snapshot === "object"
          ? hotel.offer_snapshot
          : {};
      const fromHotel = localeFromMeta(snap);
      if (fromHotel) return normalizeSiteLocale(fromHotel);
    }
  } catch {
    /* bookings optional */
  }

  return DEFAULT_EMAIL_LOCALE;
}

export async function rememberCustomerLocale(
  email: string,
  locale: string,
  extra?: { name?: string; phone?: string; userId?: string }
): Promise<void> {
  const normalized = await normalizeSiteLocale(locale);
  const address = String(email || "")
    .trim()
    .toLowerCase();
  if (!address) return;
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  try {
    const existing = await pb
      .collection("customers")
      .getFirstListItem<CustomerRecord>(`email="${address.replace(/"/g, "")}"`);
    const patch: Record<string, string> = { locale: normalized };
    if (extra?.name && !existing.name) patch.name = extra.name;
    if (extra?.phone && !existing.phone) patch.phone = extra.phone;
    if (extra?.userId && !existing.user) patch.user = extra.userId;
    await pb.collection("customers").update(existing.id, patch);
  } catch {
    try {
      await pb.collection("customers").create({
        email: address,
        name: extra?.name || address,
        phone: extra?.phone || "",
        locale: normalized,
        ...(extra?.userId ? { user: extra.userId } : {}),
      });
    } catch {
      /* locale field may be missing until collections are ensured */
    }
  }
}
