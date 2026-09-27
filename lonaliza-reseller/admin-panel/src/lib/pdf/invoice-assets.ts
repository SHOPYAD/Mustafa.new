import { defaultSiteContact } from "@/data/site-contact";
import { loadPdfAssets } from "@/lib/pdf/program-html";
import { enrichFlightInvoiceModel } from "@/lib/pdf/flight-invoice-model";
import { sampleInvoiceModel } from "@/lib/pdf/invoice-sample";
import { renderServiceInvoiceHtml, type ServiceInvoiceModel } from "@/lib/pdf/service-invoice-html";
import type { InvoiceService } from "@/lib/booking-service";
import { readUploadedImage } from "@/lib/server/branding-files";
import { getBranding } from "@/lib/server/branding-store";
import { getInvoiceTemplate } from "@/lib/server/invoice-templates-store";
import { getServerEnv } from "@/lib/server/env-store";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import type { InvoiceTemplate } from "@/types/invoice-template";

export type InvoiceBrandExtras = Pick<
  ServiceInvoiceModel,
  "brandNameAr" | "brandNameEn" | "logoDataUri" | "fontDataUri" | "phone" | "email" | "address" | "siteUrl"
>;

function brandingFileName(logoUrl: string): string {
  const trimmed = logoUrl.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.includes("name=")) {
      return decodeURIComponent(trimmed.split("name=")[1] || "").split("&")[0] || "";
    }
    if (trimmed.startsWith("/uploads/")) {
      return trimmed.replace(/^\/uploads\//, "");
    }
  } catch {
    return "";
  }
  return "";
}

export async function resolveInvoiceLogoDataUri(logoUrl: string, fallback: string): Promise<string> {
  const url = logoUrl.trim();
  if (!url) return fallback;
  if (url.startsWith("data:image/")) return url;
  const name = brandingFileName(url);
  if (!name) return /^https?:\/\//i.test(url) ? url : fallback;
  const file = await readUploadedImage(name);
  if (!file) return fallback;
  return `data:${file.contentType};base64,${file.buffer.toString("base64")}`;
}

export async function loadInvoiceBrandExtras(template?: InvoiceTemplate | null): Promise<InvoiceBrandExtras> {
  const [branding, assets] = await Promise.all([getBranding(), loadPdfAssets()]);
  const siteUrl = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  const logoDataUri = await resolveInvoiceLogoDataUri(template?.logoUrl || "", assets.logoDataUri);
  return {
    brandNameAr: template?.companyNameAr || branding.brandNameAr || "لوناليزا للسياحة",
    brandNameEn: template?.companyNameEn || branding.brandNameEn || "Lonaliza Tourism",
    logoDataUri,
    fontDataUri: assets.fontDataUri,
    phone: defaultSiteContact.customerServicePhones[0] || defaultSiteContact.callbackPhone,
    email: defaultSiteContact.email,
    address: defaultSiteContact.address,
    siteUrl: siteUrl.replace(/^https?:\/\//, ""),
  };
}

export async function renderInvoiceHtmlForService(
  model: ServiceInvoiceModel,
  template?: InvoiceTemplate | null
): Promise<string> {
  const active = template || (await getInvoiceTemplate(model.service));
  const extras = await loadInvoiceBrandExtras(active);
  return renderServiceInvoiceHtml(
    {
      ...model,
      brandNameAr: extras.brandNameAr,
      brandNameEn: extras.brandNameEn,
      logoDataUri: extras.logoDataUri,
      fontDataUri: extras.fontDataUri,
      phone: model.phone || extras.phone,
      email: model.email || extras.email,
      address: model.address || extras.address,
      siteUrl: model.siteUrl || extras.siteUrl,
    },
    active
  );
}

export async function renderSampleInvoiceHtml(
  service: InvoiceService,
  template?: InvoiceTemplate | null
): Promise<string> {
  const active = template || (await getInvoiceTemplate(service));
  const extras = await loadInvoiceBrandExtras(active);
  const model = sampleInvoiceModel(service, extras);
  const ready =
    model.service === "flight" ? await enrichFlightInvoiceModel(model, active.language) : model;
  return renderServiceInvoiceHtml(ready, active);
}
