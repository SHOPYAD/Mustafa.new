/**
 * Per-service invoice templates — persisted in `.data/invoice-templates.json`.
 */

import { promises as fs } from "fs";
import path from "path";
import { isInvoiceService, type InvoiceService } from "@/lib/booking-service";
import {
  defaultInvoiceTemplate,
  emptyInvoiceTemplates,
  mergeInvoiceTemplate,
  sanitizeInvoiceTemplate,
} from "@/lib/invoice-template-model";
import type { InvoiceTemplate, InvoiceTemplatePatch, InvoiceTemplatesFile } from "@/types/invoice-template";

export {
  defaultInvoiceTemplate,
  mergeInvoiceTemplate,
  sanitizeInvoiceTemplate,
} from "@/lib/invoice-template-model";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "invoice-templates.json");

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-invoice-templates.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

async function readStore(): Promise<InvoiceTemplatesFile> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<InvoiceTemplatesFile>;
    const templates = emptyInvoiceTemplates().templates;
    for (const service of Object.keys(templates) as InvoiceService[]) {
      templates[service] = sanitizeInvoiceTemplate(service, parsed.templates?.[service]);
    }
    return { templates, updatedAt: parsed.updatedAt };
  } catch {
    return emptyInvoiceTemplates();
  }
}

async function writeStore(store: InvoiceTemplatesFile): Promise<InvoiceTemplatesFile> {
  await ensureDir();
  const next: InvoiceTemplatesFile = {
    templates: store.templates,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(next, null, 2));
  return next;
}

export async function getInvoiceTemplates(): Promise<InvoiceTemplatesFile> {
  return readStore();
}

export async function getInvoiceTemplate(service: InvoiceService): Promise<InvoiceTemplate> {
  const store = await readStore();
  return store.templates[service] || defaultInvoiceTemplate(service);
}

export async function saveInvoiceTemplate(
  service: InvoiceService,
  patch: InvoiceTemplatePatch
): Promise<InvoiceTemplatesFile> {
  const store = await readStore();
  store.templates[service] = mergeInvoiceTemplate(store.templates[service], patch);
  return writeStore(store);
}

export async function saveAllInvoiceTemplates(
  incoming: Partial<Record<InvoiceService, unknown>>
): Promise<InvoiceTemplatesFile> {
  const store = await readStore();
  for (const [key, value] of Object.entries(incoming)) {
    if (!isInvoiceService(key)) continue;
    store.templates[key] = sanitizeInvoiceTemplate(key, { ...store.templates[key], ...(value as object) });
  }
  return writeStore(store);
}

export async function resetInvoiceTemplate(service: InvoiceService): Promise<InvoiceTemplatesFile> {
  const store = await readStore();
  store.templates[service] = defaultInvoiceTemplate(service);
  return writeStore(store);
}
