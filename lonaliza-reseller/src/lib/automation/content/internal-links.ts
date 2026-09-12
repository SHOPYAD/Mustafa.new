import { packFor } from "@/lib/automation/content/catalog";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";
import { buildWhatsAppLink } from "@/lib/utils";
import type { DiscoveredTopic } from "@/lib/automation/types";

export type InternalLink = {
  href: string;
  labelAr: string;
  labelEn: string;
};

export function whatsappHref(topicTitle: string): string {
  return buildWhatsAppLink(
    DEFAULT_SITE_WHATSAPP,
    `مرحباً، أرغب في برنامج سياحي مرتبط بـ: ${topicTitle}`
  );
}

export function linksForTopic(topic: DiscoveredTopic): InternalLink[] {
  const pack = packFor(topic.destination);
  const links: InternalLink[] = [
    { href: "/holidays", labelAr: "برامج تركيا", labelEn: "Turkey holidays" },
  ];
  if (pack) {
    links.push({
      href: pack.holidayHref,
      labelAr: `عطلات ${pack.nameAr}`,
      labelEn: `${pack.nameEn} holidays`,
    });
    for (const slug of pack.packageSlugs.slice(0, 2)) {
      links.push({
        href: `/package/${slug}`,
        labelAr: `برنامج ${pack.nameAr}`,
        labelEn: `${pack.nameEn} package`,
      });
    }
  }
  if (topic.destination === "visa") {
    links.push({ href: "/visa", labelAr: "خدمات التأشيرة", labelEn: "Visa desk" });
  }
  links.push({
    href: "/contact",
    labelAr: "تواصل مع الريان",
    labelEn: "Contact Alrayyan",
  });
  return links;
}

export function renderLinksHtml(links: InternalLink[], locale: "ar" | "en"): string {
  const items = links
    .map((link) => {
      const label = locale === "ar" ? link.labelAr : link.labelEn;
      return `<li><a href="${link.href}">${escapeHtml(label)}</a></li>`;
    })
    .join("");
  return `<ul>${items}</ul>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
}
