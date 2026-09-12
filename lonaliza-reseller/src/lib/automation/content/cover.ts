import { saveUploadedBuffer } from "@/lib/server/branding-files";
import { escapeHtml } from "@/lib/automation/content/internal-links";

export async function saveBrandedCover(input: {
  titleAr: string;
  titleEn: string;
  destinationEn: string;
  dryRun: boolean;
}): Promise<{ svg: string; url: string }> {
  const title = escapeHtml((input.titleEn || input.titleAr).slice(0, 72));
  const dest = escapeHtml(input.destinationEn || "Turkey");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Alrayyan cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#1e3a2f"/>
      <stop offset="100%" stop-color="#c8922a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="48" y="48" width="1104" height="534" rx="28" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>
  <text x="80" y="140" fill="#f4e4b4" font-family="Georgia, Times, serif" font-size="28" letter-spacing="4">ALRAYYAN TOURISM</text>
  <text x="80" y="178" fill="#ffffff" font-family="Tahoma, Arial, sans-serif" font-size="22">الريان للسياحة · تركيا</text>
  <text x="80" y="300" fill="#ffffff" font-family="Georgia, Times, serif" font-size="46">${title}</text>
  <text x="80" y="520" fill="#f8f1d8" font-family="Tahoma, Arial, sans-serif" font-size="24">${dest} · دليل أصلي من فريق الريان</text>
</svg>`;

  if (input.dryRun) {
    return { svg, url: "" };
  }
  const saved = await saveUploadedBuffer({
    buffer: Buffer.from(svg, "utf8"),
    folder: "media",
    filenameHint: `og-${dest.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "cover"}.svg`,
    contentType: "image/svg+xml",
  });
  return { svg, url: saved.url };
}
