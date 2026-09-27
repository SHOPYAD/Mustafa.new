export function siteOrigin(req?: Request): string {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (configured && /^https?:\/\//i.test(configured)) return configured;
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}`.replace(/\/$/, "");
  }
  return "https://lonaliza.com";
}

export function commsWebhookUrls(origin?: string): { whatsapp: string; telegram: string } {
  const base = (origin || siteOrigin()).replace(/\/$/, "");
  return {
    whatsapp: `${base}/api/webhooks/whatsapp`,
    telegram: `${base}/api/webhooks/telegram`,
  };
}
