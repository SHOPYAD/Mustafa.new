import crypto from "crypto";
import QRCode from "qrcode";
import { getServerEnv } from "@/lib/server/env-store";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";

const DEFAULT_SECRET = "LonaLiza2026InvoiceSecretKey_987123456_Secure";

export async function getInvoiceSecret(): Promise<string> {
  const envSecret = await getServerEnv("INVOICE_SIGNING_SECRET");
  return envSecret && envSecret.trim() ? envSecret.trim() : DEFAULT_SECRET;
}

/**
 * Creates an HMAC-SHA256 signature for a booking invoice
 */
export async function signInvoice(bookingId: string, invoiceNumber: string): Promise<string> {
  const secret = await getInvoiceSecret();
  const data = `${bookingId.trim()}:${invoiceNumber.trim()}:lonaliza_official_v1`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex").slice(0, 32);
}

/**
 * Validates whether the given signature matches the booking invoice
 */
export async function verifyInvoiceSignature(bookingId: string, invoiceNumber: string, signature: string): Promise<boolean> {
  if (!signature || !bookingId) return false;
  const expected = await signInvoice(bookingId, invoiceNumber);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return expected === signature;
  }
}

/**
 * Generates the full public verification URL for the invoice
 */
export async function getInvoiceVerificationUrl(
  bookingId: string,
  invoiceNumber: string,
  ettn?: string
): Promise<string> {
  const envUrl = await getServerEnv("NEXT_PUBLIC_SITE_URL");
  const baseUrl = resolveSitePublicUrl(envUrl || "https://lonaliza.com");
  const sig = await signInvoice(bookingId, invoiceNumber);
  const params = new URLSearchParams({
    id: bookingId,
    inv: invoiceNumber,
    sig,
    ...(ettn ? { ettn } : {}),
  });
  return `${baseUrl}/invoice/verify?${params.toString()}`;
}

/**
 * Generates an official branded QR Code Data URL that points directly to the verification URL
 */
export async function generateInvoiceQrCode(verifyUrl: string): Promise<string> {
  return await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 220,
    color: {
      dark: "#18082e", // Lonaliza deep purple brand color
      light: "#ffffff",
    },
  });
}
