import type { EmailLogoAttachment } from "@/lib/server/email/logo";

/**
 * Gmail shows unused CID parts as downloadable files (logo.png).
 * Attach the brand mark only when the HTML header actually references it.
 */
export function logoAttachmentForHtml(
  html: string,
  logo: EmailLogoAttachment | null
): Array<{
  filename: string;
  content: Buffer;
  contentType: string;
  cid: string;
  contentDisposition: "inline";
}> {
  if (!logo) return [];
  const cidRef = `cid:${logo.cid}`;
  if (!String(html || "").includes(cidRef)) return [];
  return [
    {
      filename: "brand-logo",
      content: logo.content,
      contentType: logo.contentType,
      cid: logo.cid,
      contentDisposition: "inline",
    },
  ];
}
