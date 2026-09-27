import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type {
  CustomerRecord,
  EnquiryBookingRecord,
  HotelBookingRecord,
} from "@/lib/pocketbase/records";
import { getOptInStore } from "@/lib/automation/optin-store";
import {
  assertNeverSegment,
  type CommsSegment,
  type CrmContact,
} from "@/lib/automation/types";

function normEmail(value?: string): string {
  return String(value || "").trim().toLowerCase();
}

function normPhone(value?: string): string {
  return String(value || "").replace(/\D/g, "");
}

function mergeContact(map: Map<string, CrmContact>, next: CrmContact): void {
  const key = next.email || next.phone || next.telegramChatId || next.id;
  const prev = map.get(key);
  if (!prev) {
    map.set(key, next);
    return;
  }
  map.set(key, {
    ...prev,
    name: prev.name || next.name,
    email: prev.email || next.email,
    phone: prev.phone || next.phone,
    telegramChatId: prev.telegramChatId || next.telegramChatId,
    locale: prev.locale || next.locale,
    marketingEmail: prev.marketingEmail || next.marketingEmail,
    marketingWhatsapp: prev.marketingWhatsapp || next.marketingWhatsapp,
    marketingTelegram: prev.marketingTelegram || next.marketingTelegram,
  });
}

function fromCustomer(
  row: CustomerRecord,
  optin: Awaited<ReturnType<typeof getOptInStore>>
): CrmContact {
  const email = normEmail(row.email);
  const phone = normPhone(row.phone);
  return {
    id: row.id,
    name: row.name || "",
    email: email || undefined,
    phone: phone || undefined,
    locale: row.locale,
    source: "customers",
    marketingEmail: Boolean(email) && !optin.emailUnsubscribed.includes(email),
    marketingWhatsapp: Boolean(phone) && optin.whatsappOptIn.includes(phone),
    marketingTelegram: false,
  };
}

function fromBooking(
  row: HotelBookingRecord | EnquiryBookingRecord,
  source: CrmContact["source"],
  optin: Awaited<ReturnType<typeof getOptInStore>>
): CrmContact {
  const email = normEmail("customer_email" in row ? row.customer_email : "");
  const phone = normPhone("customer_phone" in row ? row.customer_phone : "");
  return {
    id: row.id,
    name: row.customer_name || "",
    email: email || undefined,
    phone: phone || undefined,
    source,
    marketingEmail: Boolean(email) && !optin.emailUnsubscribed.includes(email),
    marketingWhatsapp: Boolean(phone) && optin.whatsappOptIn.includes(phone),
    marketingTelegram: false,
  };
}

export async function loadCrmContacts(segment: CommsSegment): Promise<CrmContact[]> {
  const [pb, optin] = await Promise.all([tryCreateAdminPocketBase(), getOptInStore()]);
  const map = new Map<string, CrmContact>();

  const addCustomers = async () => {
    if (!pb) return;
    try {
      const rows = await pb.collection("customers").getFullList<CustomerRecord>({
        fields: "id,name,email,phone,locale",
      });
      for (const row of rows) mergeContact(map, fromCustomer(row, optin));
    } catch {
      /* collection optional */
    }
  };

  const addBookings = async (abandonedOnly: boolean) => {
    if (!pb) return;
    try {
      const hotels = await pb.collection("hotel_bookings").getFullList<HotelBookingRecord>({
        fields: "id,customer_name,customer_email,customer_phone,status,payment_status",
      });
      for (const row of hotels) {
        const pending =
          row.status === "pending_payment" ||
          String(row.payment_status || "").toLowerCase() === "pending";
        if (abandonedOnly && !pending) continue;
        if (!abandonedOnly && pending) continue;
        mergeContact(map, fromBooking(row, "booking", optin));
      }
    } catch {
      /* optional */
    }
    try {
      const enquiries = await pb.collection("enquiry_bookings").getFullList<EnquiryBookingRecord>({
        fields: "id,customer_name,customer_email,customer_phone,status,type",
      });
      for (const row of enquiries) {
        const abandoned = row.status === "new" || row.status === "pending";
        if (abandonedOnly && !abandoned) continue;
        mergeContact(map, fromBooking(row, "enquiry", optin));
      }
    } catch {
      /* optional */
    }
  };

  switch (segment) {
    case "customers":
      await addCustomers();
      break;
    case "newsletter":
      await addCustomers();
      for (const email of optin.newsletter) {
        if (optin.emailUnsubscribed.includes(email)) continue;
        mergeContact(map, {
          id: `nl:${email}`,
          name: "",
          email,
          source: "newsletter",
          marketingEmail: true,
          marketingWhatsapp: false,
          marketingTelegram: false,
        });
      }
      return [...map.values()].filter((row) => row.marketingEmail && row.email);
    case "whatsapp_optin":
      await addCustomers();
      await addBookings(false);
      for (const phone of optin.whatsappOptIn) {
        mergeContact(map, {
          id: `wa:${phone}`,
          name: "",
          phone,
          source: "whatsapp_optin",
          marketingEmail: false,
          marketingWhatsapp: true,
          marketingTelegram: false,
        });
      }
      return [...map.values()].filter((row) => row.marketingWhatsapp && row.phone);
    case "telegram_optin":
      for (const chatId of optin.telegramOptIn) {
        mergeContact(map, {
          id: `tg:${chatId}`,
          name: "",
          telegramChatId: chatId,
          source: "telegram_optin",
          marketingEmail: false,
          marketingWhatsapp: false,
          marketingTelegram: true,
        });
      }
      break;
    case "past_guests":
      await addBookings(false);
      break;
    case "abandoned":
      await addBookings(true);
      break;
    case "inbound_leads":
      await addCustomers();
      await addBookings(true);
      for (const email of optin.newsletter) {
        if (optin.emailUnsubscribed.includes(email)) continue;
        mergeContact(map, {
          id: `nl:${email}`,
          name: "",
          email,
          source: "newsletter",
          marketingEmail: true,
          marketingWhatsapp: false,
          marketingTelegram: false,
        });
      }
      break;
    default:
      return assertNeverSegment(segment);
  }

  return [...map.values()];
}

export async function contactExistsInCrm(to: string): Promise<boolean> {
  const target = String(to || "").trim().toLowerCase();
  const phone = target.replace(/\D/g, "");
  const [pb, optin] = await Promise.all([tryCreateAdminPocketBase(), getOptInStore()]);
  if (target.includes("@")) {
    if (optin.newsletter.includes(target) || optin.emailUnsubscribed.includes(target)) return true;
  }
  if (phone && optin.whatsappOptIn.includes(phone)) return true;
  if (optin.telegramOptIn.includes(target)) return true;
  if (!pb) return false;
  try {
    const safe = target.replace(/"/g, "");
    const filter = phone
      ? `email="${safe}" || phone ~ "${phone}"`
      : `email="${safe}"`;
    const page = await pb.collection("customers").getList(1, 1, { filter });
    if (page.totalItems > 0) return true;
  } catch {
    /* continue */
  }
  try {
    const safe = target.replace(/"/g, "");
    const filter = phone
      ? `customer_email="${safe}" || customer_phone ~ "${phone}"`
      : `customer_email="${safe}"`;
    const hotels = await pb.collection("hotel_bookings").getList(1, 1, { filter });
    if (hotels.totalItems > 0) return true;
  } catch {
    /* continue */
  }
  try {
    const safe = target.replace(/"/g, "");
    const filter = phone
      ? `customer_email="${safe}" || customer_phone ~ "${phone}"`
      : `customer_email="${safe}"`;
    const enquiries = await pb.collection("enquiry_bookings").getList(1, 1, { filter });
    if (enquiries.totalItems > 0) return true;
  } catch {
    /* continue */
  }
  return false;
}

export function marketingAudience(
  contacts: CrmContact[],
  channel: "email" | "whatsapp" | "telegram"
): CrmContact[] {
  switch (channel) {
    case "email":
      return contacts.filter((row) => row.marketingEmail && row.email);
    case "whatsapp":
      return contacts.filter((row) => row.marketingWhatsapp && row.phone);
    case "telegram":
      return contacts.filter((row) => row.marketingTelegram && row.telegramChatId);
    default: {
      const _never: never = channel;
      return _never;
    }
  }
}

export function parseSegment(raw: unknown, fallback: CommsSegment): CommsSegment {
  const value = String(raw || "").trim();
  if (
    value === "customers" ||
    value === "newsletter" ||
    value === "whatsapp_optin" ||
    value === "telegram_optin" ||
    value === "past_guests" ||
    value === "abandoned" ||
    value === "inbound_leads"
  ) {
    return value;
  }
  return fallback;
}
