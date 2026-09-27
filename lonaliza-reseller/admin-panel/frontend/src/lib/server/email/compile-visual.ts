import {
  compileVisualEmail,
  documentToPlainText,
  embedVisualDocument,
  extractVisualDocument,
  sanitizeVisualDocument,
  type EmailVisualDocument,
} from "@/lib/email/visual-doc";
import { getEmailBrand, type EmailBrand } from "@/lib/server/email/brand";
import type { EmailTemplateRecord } from "@/lib/server/email/types";

export function resolveVisualDocument(
  template: Pick<EmailTemplateRecord, "html_ar" | "html_en" | "document">,
  brand: EmailBrand
): EmailVisualDocument {
  if (template.document) {
    return sanitizeVisualDocument(template.document, brand);
  }
  return (
    extractVisualDocument(template.html_ar || "", brand) ||
    extractVisualDocument(template.html_en || "", brand) ||
    sanitizeVisualDocument(null, brand)
  );
}

export function compileVisualTemplate(
  doc: unknown,
  brand: EmailBrand,
  locale = "ar"
): { html: string; text: string; document: EmailVisualDocument } {
  const clean = sanitizeVisualDocument(doc, brand);
  const compiled = compileVisualEmail(clean, brand, locale);
  return {
    html: embedVisualDocument(compiled, clean),
    text: documentToPlainText(clean, brand, locale),
    document: clean,
  };
}

export async function compileVisualTemplateWithBrand(doc: unknown) {
  const brand = await getEmailBrand();
  return { brand, ...compileVisualTemplate(sanitizeVisualDocument(doc, brand), brand) };
}
