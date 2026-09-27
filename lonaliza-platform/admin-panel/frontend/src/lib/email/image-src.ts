/**
 * Public URLs for email-template images (editor + compile).
 * Runtime uploads are served from `/api/branding/file`, not raw `.data/`.
 */

const UPLOAD_HREF =
  /(?:https?:\/\/[^/]+)?\/(?:uploads\/|api\/branding\/file\?name=)(email|branding)\/([A-Za-z0-9._-]+)\/?$/i;

export function normalizeUploadSrc(raw: string): string {
  let value = String(raw || "").trim();
  if (!value) return "";
  if (/^ds\/(branding|email)\//i.test(value)) {
    value = `/uploads/${value.slice(3)}`;
  } else if (/^uploads\/(branding|email)\//i.test(value)) {
    value = `/${value}`;
  }
  const match = value.match(UPLOAD_HREF);
  if (match) {
    return `/api/branding/file?name=${match[1].toLowerCase()}/${match[2]}`;
  }
  return value;
}

export function resolveEmailImageSrc(raw: string, siteUrl: string): string {
  const site = String(siteUrl || "").replace(/\/$/, "");
  const value = normalizeUploadSrc(raw);
  if (!value) return "";
  if (
    value.startsWith("data:") ||
    value.startsWith("cid:") ||
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }
  if (value.startsWith("/")) return site ? `${site}${value}` : value;
  return value;
}
