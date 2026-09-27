import { promises as fs } from "fs";
import path from "path";
import { SITE_PUBLIC_URL } from "@/lib/pocketbase/constants";
import {
  applyEmailLogoSrc,
  EMAIL_LOGO_CID,
  type EmailBrand,
} from "@/lib/server/email/brand";

const LOGO_EXTS: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export type EmailLogoAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
  cid: string;
  contentDisposition: "inline";
};

function contentTypeFor(filePath: string, fallback = "image/png"): string {
  return LOGO_EXTS[path.extname(filePath).toLowerCase()] || fallback;
}

function publicFileFromSiteUrl(raw: string): string {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//")) {
    return path.join(process.cwd(), "public", value.replace(/^\/+/, ""));
  }
  const site = SITE_PUBLIC_URL.replace(/\/$/, "");
  if (value.startsWith(`${site}/`)) {
    return path.join(process.cwd(), "public", value.slice(site.length + 1));
  }
  return "";
}

async function readLocalImage(
  filePath: string,
  cid: string
): Promise<EmailLogoAttachment | null> {
  try {
    const content = await fs.readFile(filePath);
    if (!content.length) return null;
    const ext = path.extname(filePath).toLowerCase();
    const filename = ext ? `logo${ext}` : "logo.png";
    return {
      filename,
      content,
      contentType: contentTypeFor(filePath),
      cid,
      contentDisposition: "inline",
    };
  } catch {
    return null;
  }
}

function decodeDataImage(raw: string, cid: string): EmailLogoAttachment | null {
  const match = String(raw || "").match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/
  );
  if (!match) return null;
  try {
    const content = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
    if (!content.length) return null;
    const ext = match[1].includes("jpeg") ? "jpg" : match[1].split("/")[1] || "png";
    return {
      filename: `logo.${ext}`,
      content,
      contentType: match[1],
      cid,
      contentDisposition: "inline",
    };
  } catch {
    return null;
  }
}

async function latestBrandingUpload(cid: string): Promise<EmailLogoAttachment | null> {
  const dir = path.join(process.cwd(), "public", "uploads", "branding");
  try {
    const names = await fs.readdir(dir);
    const images = names.filter((name) => LOGO_EXTS[path.extname(name).toLowerCase()]);
    if (!images.length) return null;
    const ranked = await Promise.all(
      images.map(async (name) => {
        const filePath = path.join(dir, name);
        const stat = await fs.stat(filePath);
        return { filePath, mtime: stat.mtimeMs };
      })
    );
    ranked.sort((a, b) => b.mtime - a.mtime);
    for (const row of ranked) {
      const local = await readLocalImage(row.filePath, cid);
      if (local) return local;
    }
  } catch {
    /* no uploads dir */
  }
  return null;
}

/** Load the real brand logo for inline CID. Never throws. Zero-byte files are skipped. */
export async function loadEmailLogoAttachment(
  brand: EmailBrand,
  cid = EMAIL_LOGO_CID
): Promise<EmailLogoAttachment | null> {
  const data = decodeDataImage(brand.logoUrl, cid);
  if (data) return data;

  const candidates = [
    publicFileFromSiteUrl(brand.logoUrl),
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "public", "brand-logo.png"),
    path.join(process.cwd(), "public", "favicon.png"),
  ].filter(Boolean);

  for (const filePath of candidates) {
    const local = await readLocalImage(filePath, cid);
    if (local) return local;
  }

  const uploaded = await latestBrandingUpload(cid);
  if (uploaded) return uploaded;

  return null;
}

export function embedLogoInHtml(
  html: string,
  brand: EmailBrand,
  logo: EmailLogoAttachment | null,
  locale = "ar"
): string {
  return applyEmailLogoSrc(html, logo ? `cid:${logo.cid}` : null, brand, locale);
}
