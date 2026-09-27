import { promises as fs } from "fs";
import path from "path";
import type { ParasutInvoiceRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const INVOICES_INDEX_FILE = path.join(DATA_DIR, "parasut-invoices.json");
const PDFS_DIR = path.join(DATA_DIR, "parasut-pdfs");

async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(PDFS_DIR, { recursive: true });
}

export async function listParasutInvoices(): Promise<ParasutInvoiceRecord[]> {
  try {
    const raw = await fs.readFile(INVOICES_INDEX_FILE, "utf8");
    const list: ParasutInvoiceRecord[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function getParasutInvoice(bookingId: string): Promise<ParasutInvoiceRecord | null> {
  const cleanId = bookingId.trim();
  const list = await listParasutInvoices();
  return list.find((inv) => inv.bookingId === cleanId || inv.id === cleanId) || null;
}

export async function saveParasutInvoice(
  record: ParasutInvoiceRecord,
  pdfBuffer?: Buffer
): Promise<ParasutInvoiceRecord> {
  await ensureDirs();

  let pdfPath = record.pdfPath;

  // Save binary signed PDF locally if buffer provided
  if (pdfBuffer && pdfBuffer.length > 0) {
    const filename = `${record.bookingId}-${record.invoiceNo || "draft"}.pdf`.replace(/[^a-zA-Z0-9.-]/g, "_");
    const dest = path.join(PDFS_DIR, filename);
    await fs.writeFile(dest, pdfBuffer);
    pdfPath = dest;
    record.pdfAvailable = true;
    record.pdfPath = pdfPath;
  }

  const list = await listParasutInvoices();
  const existingIdx = list.findIndex((x) => x.bookingId === record.bookingId);

  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...record, pdfPath };
  } else {
    list.unshift({ ...record, pdfPath });
  }

  await fs.writeFile(INVOICES_INDEX_FILE, JSON.stringify(list, null, 2), "utf8");
  return record;
}

export async function getParasutInvoicePdfBuffer(bookingId: string): Promise<{ buffer: Buffer; filename: string } | null> {
  const inv = await getParasutInvoice(bookingId);
  if (!inv || !inv.pdfPath) return null;

  try {
    const buffer = await fs.readFile(inv.pdfPath);
    const filename = `TC-GIB-E-Arsiv-${inv.invoiceNo || bookingId}.pdf`;
    return { buffer, filename };
  } catch (err: any) {
    console.error("[getParasutInvoicePdfBuffer error]:", err);
    return null;
  }
}
