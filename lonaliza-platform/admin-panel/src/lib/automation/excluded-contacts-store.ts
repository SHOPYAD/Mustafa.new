import fs from "fs";
import path from "path";

export type ExcludedContact = {
  id: string;
  phone: string;
  normalizedPhone: string;
  name?: string;
  reason?: string;
  addedAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "whatsapp-excluded-contacts.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Normalizes phone numbers for bulletproof matching:
 * Removes non-digits, strips leading zeros, leading '+' or international prefixes.
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  // Strip leading double zeros (e.g. 00971... -> 971...)
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  return digits;
}

export function getExcludedContacts(): ExcludedContact[] {
  try {
    ensureDir();
    if (!fs.existsSync(STORE_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveExcludedContact(input: {
  phone: string;
  name?: string;
  reason?: string;
}): ExcludedContact {
  ensureDir();
  const normalized = normalizePhoneNumber(input.phone);
  if (!normalized) {
    throw new Error("رقم الهاتف غير صالح");
  }

  const list = getExcludedContacts();
  const existingIdx = list.findIndex(
    (c) => c.normalizedPhone === normalized || c.phone === input.phone
  );

  const contact: ExcludedContact = {
    id: existingIdx >= 0 ? list[existingIdx]!.id : `exc_${Date.now().toString(36)}`,
    phone: input.phone.trim(),
    normalizedPhone: normalized,
    name: input.name?.trim() || "",
    reason: input.reason?.trim() || "رقم شخصي / عائلي مستثنى",
    addedAt: existingIdx >= 0 ? list[existingIdx]!.addedAt : new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    list[existingIdx] = contact;
  } else {
    list.unshift(contact);
  }

  fs.writeFileSync(STORE_FILE, JSON.stringify(list, null, 2), "utf-8");
  return contact;
}

export function removeExcludedContact(idOrPhone: string): boolean {
  ensureDir();
  const normalized = normalizePhoneNumber(idOrPhone);
  const list = getExcludedContacts();
  const filtered = list.filter(
    (c) => c.id !== idOrPhone && c.phone !== idOrPhone && c.normalizedPhone !== normalized
  );
  if (filtered.length === list.length) return false;
  fs.writeFileSync(STORE_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

/**
 * Checks if a phone number is excluded from WhatsApp AI auto-replies.
 */
export function isPhoneNumberExcluded(phone: string): boolean {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return false;

  const list = getExcludedContacts();
  return list.some((c) => {
    const contactNorm = c.normalizedPhone || normalizePhoneNumber(c.phone);
    return (
      contactNorm === normalized ||
      normalized.endsWith(contactNorm) ||
      contactNorm.endsWith(normalized)
    );
  });
}
