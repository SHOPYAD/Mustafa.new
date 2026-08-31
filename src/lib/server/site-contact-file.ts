/**
 * Persist support-contact fields into `.data/site-contact.json`
 * so email/PDF branding can read the same numbers as the public site.
 */

import { promises as fs } from "fs";
import path from "path";
import { defaultSiteContact } from "@/data/site-contact";
import type { SiteContact } from "@/types/site-contact";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "site-contact.json");

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-site-contact.json");
  }
  return STORE_FILE;
}

export type SupportContactPatch = {
  email?: string;
  phone?: string;
  whatsapp?: string;
};

async function readExisting(): Promise<Partial<SiteContact>> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteContact>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function mergeSupportContact(
  patch: SupportContactPatch
): Promise<void> {
  const current = await readExisting();
  const phones = Array.isArray(current.customerServicePhones)
    ? [...current.customerServicePhones]
    : [...defaultSiteContact.customerServicePhones];
  const phone = (patch.phone || "").trim();
  if (phone) {
    phones[0] = phone;
  }
  const next: SiteContact = {
    ...defaultSiteContact,
    ...current,
    email: (patch.email || current.email || defaultSiteContact.email).trim(),
    callbackPhone: phone || current.callbackPhone || defaultSiteContact.callbackPhone,
    customerServicePhones: phones.filter(Boolean),
    whatsappNumber:
      (patch.whatsapp || current.whatsappNumber || defaultSiteContact.whatsappNumber)
        .replace(/\D/g, "") || defaultSiteContact.whatsappNumber,
    social: Array.isArray(current.social)
      ? current.social
      : defaultSiteContact.social,
  };
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
  await fs.writeFile(getStoreFile(), JSON.stringify(next, null, 2), {
    mode: 0o600,
  });
}
