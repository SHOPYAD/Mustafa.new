"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import BrandImage from "@/components/branding/BrandImage";
import { useBrandName, useBranding } from "@/components/branding/BrandingProvider";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  MessageCircle,
  Linkedin,
  Ghost,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useSiteContact } from "@/hooks/useSiteContact";
import {
  getEnabledSocialLinks,
  getPrimaryPhone,
  phoneToTelHref,
  resolveSocialHref,
} from "@/data/site-contact";
import type { SocialNetworkId } from "@/types/site-contact";
import { usePublicPages } from "@/hooks/usePublicPages";
import { useNavVisibility } from "@/hooks/useNavVisibility";
import {
  showsInFooter,
  compareNavOrder,
  type NavServiceKey,
} from "@/data/nav-visibility";
import { useNavOrder } from "@/hooks/useNavOrder";

const FOOTER_ICONS: Partial<Record<SocialNetworkId, LucideIcon>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  snapchat: Ghost,
};

export default function Footer() {
  const pathname = usePathname();
  const { t, locale } = useLocale();
  const contact = useSiteContact();
  const { footerPages } = usePublicPages();
  const visibility = useNavVisibility();
  const navOrder = useNavOrder();
  const branding = useBranding();
  const brandName = useBrandName(locale);
  const primaryPhone = getPrimaryPhone(contact);
  const social = getEnabledSocialLinks(contact).filter(
    (s) => s.enabled === true && FOOTER_ICONS[s.id]
  );

  const catalogLinks: { key: NavServiceKey | "about"; label: string; href: string }[] =
    [
      { key: "holidays", label: t.footer.holidayPackages, href: "/holidays" },
      { key: "hotels", label: t.nav.hotels, href: "/hotels" },
      { key: "vipDailyTours", label: t.nav.vipDailyTours, href: "/vip-tours" },
      { key: "transfers", label: t.nav.transfers, href: "/transfers" },
      { key: "cars", label: t.nav.cars, href: "/cars" },
      { key: "flights", label: t.footer.flightBooking, href: "/flights" },
      { key: "visa", label: t.footer.visaServices, href: "/visa" },
      { key: "blog", label: t.nav.blog, href: "/blog" },
      { key: "about", label: t.nav.about, href: "/about" },
      { key: "contact", label: t.nav.contact, href: "/contact" },
    ];

  const quickLinks = useMemo(
    () => [
      ...catalogLinks
        .filter((link) =>
          link.key === "about" ? true : showsInFooter(visibility[link.key])
        )
        .sort((a, b) => {
          if (a.key === "about") return 1;
          if (b.key === "about") return -1;
          return compareNavOrder(a.key, b.key, navOrder);
        }),
      ...footerPages.map((page) => ({
        label: locale === "ar" ? page.titleAr : page.titleEn,
        href: page.href,
      })),
    ],
    [catalogLinks, visibility, navOrder, footerPages, locale]
  );

  const destinations = [
    { label: t.nav.istanbul, href: "/holidays?q=Istanbul" },
    { label: t.nav.antalya, href: "/holidays?q=Antalya" },
    { label: t.nav.cappadocia, href: "/holidays?q=Cappadocia" },
    { label: t.nav.trabzon, href: "/holidays?q=Trabzon" },
    { label: t.nav.sapanca, href: "/holidays?q=Sapanca" },
  ];

  const phones = contact.customerServicePhones.length
    ? contact.customerServicePhones
    : primaryPhone
      ? [primaryPhone]
      : ["+90 532 179 67 63"];
  const email = contact.email || "info@lonaliza.com";
  const address = contact.address || t.footer.address;

  const isOrigin = (process.env.NEXT_PUBLIC_DEPLOYMENT_ROLE || "origin") !== "client";
  if (isOrigin && pathname === "/") return null;
  if (pathname?.startsWith("/flights/redirect")) return null;

  return (
    <footer className="alrayyan-site-footer relative text-white" style={{ backgroundColor: "var(--brand-footer)" }}>
      <div className="alrayyan-footer-main relative z-10 mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
        <div className="alrayyan-footer-grid grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-12 md:gap-x-8 md:gap-y-6">
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <BrandImage
                src={branding.logoUrl || "/logo.png"}
                alt={brandName}
                width={220}
                height={68}
                className="h-13 sm:h-14 w-auto max-w-[260px] object-contain"
              />
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/55">
              {t.footer.tagline}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {social.map((s) => {
                const Icon = FOOTER_ICONS[s.id]!;
                return (
                  <a
                    key={s.id}
                    href={resolveSocialHref(s, contact.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.id}
                    className="alrayyan-footer-icon flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-[color:var(--brand-primary)] hover:bg-white/10"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="alrayyan-footer-heading mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-300">
              {t.footer.explore}
            </h4>
            <ul className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-2 sm:gap-x-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-[13px] text-white/60 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="alrayyan-footer-heading mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-300">
              {t.footer.destinations}
            </h4>
            <ul className="space-y-1.5">
              {destinations.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-[13px] text-white/60 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-3">
            <h4 className="alrayyan-footer-heading mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-300">
              {t.footer.contact}
            </h4>
            <ul className="space-y-2">
              {address ? (
                <li className="flex items-start gap-2 text-[13px] text-white/60">
                  <MapPin size={14} className="alrayyan-footer-icon mt-0.5 shrink-0 text-emerald-400" />
                  <span className="leading-snug whitespace-pre-line">{address}</span>
                </li>
              ) : null}
              {phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={phoneToTelHref(phone)}
                    className="flex items-center gap-2 text-[13px] text-white/60 transition-colors hover:text-white"
                    dir="ltr"
                  >
                    <Phone size={14} className="alrayyan-footer-icon text-emerald-400" />
                    {phone}
                  </a>
                </li>
              ))}
              {email ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-[13px] text-white/60 transition-colors hover:text-white"
                  >
                    <Mail size={14} className="alrayyan-footer-icon text-emerald-400" />
                    {email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-3 text-[12px] text-white/45 sm:flex-row sm:px-6 lg:px-8">
          <p
            data-builder-id="footer.copyright"
            data-field="footer.copyright"
            data-builder-field="footer.copyright"
          >
            <span data-builder-text="">
              © {new Date().getFullYear()} {brandName}. {t.common.allRights}
            </span>
          </p>
          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
              data-builder-id="footer.privacy"
              data-field="footer.privacy"
              data-builder-field="footer.privacy"
            >
              <span data-builder-text="">{t.common.privacy}</span>
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-white"
              data-builder-id="footer.terms"
              data-field="footer.terms"
              data-builder-field="footer.terms"
            >
              <span data-builder-text="">{t.common.terms}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
