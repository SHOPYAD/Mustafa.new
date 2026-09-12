import { getParasutConfig } from "./parasut-store";
import { ParasutClient } from "./parasut-client";
import { saveParasutInvoice, getParasutInvoice } from "./parasut-invoices-store";
import { resolveOfficialInvoice } from "@/lib/server/invoice-resolver";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import type { ParasutInvoiceRecord } from "./types";

/**
 * Executes the complete official E-Arşiv pipeline for a paid booking:
 * 1. Authenticate & Verify customer in Parasut
 * 2. Create sales invoice draft with international tourism exemption
 * 3. Initiate official e-Archive signing (POST /e_archives)
 * 4. Poll trackable_jobs until done
 * 5. Extract GİB Invoice No (EAR...) and ETTN (UUID)
 * 6. Download official signed PDF (handling HTTP 204 retry)
 * 7. Store records and binary PDF locally
 */
export async function triggerParasutEArchiveIssue(bookingId: string): Promise<ParasutInvoiceRecord | null> {
  const cleanId = (bookingId || "").trim();
  if (!cleanId) return null;

  const config = await getParasutConfig();
  if (!config.enabled) {
    console.log(`[ParasutService] Parasut integration disabled. Skipping booking ${cleanId}.`);
    return null;
  }

  if (!config.companyId || !config.clientId || !config.clientSecret || !config.username || !config.password) {
    console.warn(`[ParasutService] Parasut credentials incomplete. Cannot issue invoice for ${cleanId}.`);
    return null;
  }

  // Check if already signed
  const existing = await getParasutInvoice(cleanId);
  if (existing && existing.status === "signed" && existing.pdfAvailable) {
    return existing;
  }

  const invoiceData = await resolveOfficialInvoice(cleanId);
  if (!invoiceData) {
    console.warn(`[ParasutService] Could not resolve booking details for ${cleanId}.`);
    return null;
  }

  const client = new ParasutClient(config);

  // Initial draft record
  let record: ParasutInvoiceRecord = {
    id: cleanId,
    bookingId: cleanId,
    salesInvoiceId: "",
    customerName: invoiceData.customer.name,
    customerEmail: invoiceData.customer.email,
    amount: invoiceData.pricing.netTotal,
    currency: invoiceData.pricing.currency || "USD",
    exchangeRate: 34.5, // approximate or standard rate
    serviceType: invoiceData.serviceType,
    status: "queued",
    issuedAt: new Date().toISOString(),
    pdfAvailable: false,
  };

  try {
    // 1. Get or Create Customer
    const contactId = await client.getOrCreateCustomer({
      name: invoiceData.customer.name,
      email: invoiceData.customer.email,
      phone: invoiceData.customer.phone,
      country: "France", // default international guest
      city: "Paris",
      address: invoiceData.company.address || "International Client",
      isAbroad: true,
    });

    // 2. Create Draft Sales Invoice
    const pnr = invoiceData.bookingDetails.pnr || cleanId.slice(0, 8).toUpperCase();
    const serviceTitle = invoiceData.bookingDetails.title || "International Travel Service";

    const salesInvoiceId = await client.createSalesInvoice({
      contactId,
      pnr,
      description: `Turizm Rezervasyonu - PNR: ${pnr} - ${serviceTitle}`,
      currency: invoiceData.pricing.currency || "USD",
      exchangeRate: 34.5,
      isAbroad: true,
      items: [
        {
          description: `${serviceTitle} (${pnr})`,
          quantity: 1,
          unitPrice: invoiceData.pricing.netTotal,
          vatRate: 0,
          discountValue: invoiceData.pricing.voucherDiscount || 0,
        },
      ],
    });

    record.salesInvoiceId = salesInvoiceId;
    await saveParasutInvoice(record);

    // 3. Initiate official e-Archive signing
    const { jobId } = await client.signEArchive(salesInvoiceId);

    // 4. Poll trackable_job until status === 'done'
    await client.pollTrackableJob(jobId, 25, 2000);

    // 5. Get e-Archive Details (Invoice Number & ETTN UUID)
    const eDoc = await client.getEArchiveDetails(salesInvoiceId);
    record.eArchiveId = eDoc.eArchiveId;
    record.invoiceNo = eDoc.invoiceNo;
    record.ettn = eDoc.uuid;
    record.gibStatus = "approved";
    record.status = "signed";

    // 6. Download official signed PDF
    let pdfBuffer: Buffer | undefined;
    try {
      const pdfDownload = await client.downloadSignedPdf(eDoc.eArchiveId);
      pdfBuffer = pdfDownload.pdfBuffer;
      record.pdfAvailable = true;
    } catch (pdfErr: any) {
      console.warn(`[ParasutService] Could not immediately download signed PDF:`, pdfErr.message);
    }

    // 7. Save local record and binary PDF
    const saved = await saveParasutInvoice(record, pdfBuffer);

    // 8. Patch PocketBase booking record if available
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      try {
        const row = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(cleanId);
        const snap = (row.offer_snapshot && typeof row.offer_snapshot === "object" ? row.offer_snapshot : {}) as Record<string, unknown>;
        await pb.collection("hotel_bookings").update(row.id, {
          offer_snapshot: {
            ...snap,
            parasut_invoice_no: record.invoiceNo,
            parasut_ettn: record.ettn,
            parasut_e_archive_id: record.eArchiveId,
            parasut_pdf_ready: record.pdfAvailable,
            parasut_issued_at: record.issuedAt,
          },
        });
      } catch {
        /* non-fatal */
      }
    }

    console.log(`[ParasutService] Successfully issued e-Archive invoice ${record.invoiceNo} (ETTN: ${record.ettn}) for booking ${cleanId}.`);
    return saved;
  } catch (err: any) {
    console.error(`[ParasutService Error for booking ${cleanId}]:`, err.message);
    record.status = "error";
    record.errorMessage = err.message || String(err);
    await saveParasutInvoice(record);
    return null;
  }
}
