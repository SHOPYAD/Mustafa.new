"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { neutralBlogLabel } from "@/lib/blog/neutral-chrome";
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
import AppStoreBadgesWithQr from "@/components/layout/AppStoreBadgesWithQr";

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
      {
        label: locale === "ar" ? "رادار تتبع الطيران ✈️" : locale === "tr" ? "Canlı Uçuş Radarı ✈️" : "Live Flight Radar ✈️",
        href: "/flight-tracker",
      },
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
      : ["+90 531 359 13 94"];
  const email = contact.email || "info@lonaliza.com";
  const address = neutralBlogLabel(contact.address || t.footer.address, pathname) || "Lonaliza";

  const isOrigin = (process.env.NEXT_PUBLIC_DEPLOYMENT_ROLE || "origin") !== "client";
  if (isOrigin && pathname === "/") return null;
  if (pathname?.startsWith("/flights/redirect")) return null;

  return (
    <footer
      className="alrayyan-site-footer relative bg-gradient-to-b from-[#faf5fe] via-[#f5edfc] to-[#ede3f8] text-slate-800 border-t border-purple-200/80"
      style={{
        backgroundImage: "radial-gradient(rgba(147, 51, 234, 0.12) 1.25px, transparent 1.25px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="alrayyan-footer-main relative z-10 mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="alrayyan-footer-grid grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-12 md:gap-x-6 md:gap-y-6">
          {/* Col 1: Brand (3 cols) */}
          <div className="col-span-2 md:col-span-3">
            <Link
              href={pathname?.startsWith("/demo") ? "/demo" : "/"}
              className="inline-flex items-center gap-2"
            >
              <BrandImage
                src={branding.logoUrl || "/logo.png"}
                alt={brandName}
                width={220}
                height={68}
                className="h-14 sm:h-16 w-auto max-w-[260px] object-contain drop-shadow-xs"
              />
            </Link>
            <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-slate-600 font-medium">
              {t.footer.tagline}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {social.map((s) => {
                const Icon = FOOTER_ICONS[s.id]!;
                return (
                  <a
                    key={s.id}
                    href={resolveSocialHref(s, contact.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.id}
                    className="alrayyan-footer-icon flex h-8 w-8 items-center justify-center rounded-xl border border-purple-200 bg-white/90 text-purple-900 shadow-2xs transition-all duration-200 hover:border-amber-400 hover:bg-[#2e1065] hover:text-amber-300 hover:scale-105"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Explore (3 cols, 2 sub-columns of 5 links each so "من نحن" stays aligned!) */}
          <div className="col-span-2 sm:col-span-1 md:col-span-3">
            <h4 className="alrayyan-footer-heading mb-3 text-[13px] font-black uppercase tracking-[0.14em] text-purple-950">
              {t.footer.explore}
            </h4>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-[12.5px] font-semibold text-slate-700 transition-colors hover:text-purple-950 truncate"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Destinations (2 cols) */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="alrayyan-footer-heading mb-3 text-[13px] font-black uppercase tracking-[0.14em] text-purple-950">
              {t.footer.destinations}
            </h4>
            <ul className="space-y-2">
              {destinations.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-[12.5px] font-semibold text-slate-700 transition-colors hover:text-purple-950 truncate"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact Us (2 cols) */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="alrayyan-footer-heading mb-3 text-[13px] font-black uppercase tracking-[0.14em] text-purple-950">
              {t.footer.contact}
            </h4>
            <ul className="space-y-2.5">
              {address ? (
                <li className="flex items-start gap-2 text-[12.5px] font-medium text-slate-700">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-100/90 text-purple-700">
                    <MapPin size={13} />
                  </div>
                  <span className="leading-tight whitespace-pre-line">{address}</span>
                </li>
              ) : null}
              {phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={phoneToTelHref(phone)}
                    className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:text-purple-950"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-100/90 text-purple-700">
                      <Phone size={13} />
                    </div>
                    <span dir="ltr">{phone}</span>
                  </a>
                </li>
              ))}
              {email ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:text-purple-950"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-100/90 text-purple-700">
                      <Mail size={13} />
                    </div>
                    <span className="truncate">{email}</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          {/* Col 5: Official Mobile Apps & QR (2 cols) */}
          <div className="col-span-2 md:col-span-2">
            <AppStoreBadgesWithQr variant="integrated-contact" />
          </div>
        </div>
      </div>

      <div className="border-t border-purple-200/80 bg-purple-100/60">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-3.5 text-[12px] font-medium text-slate-600 sm:flex-row sm:px-6 lg:px-8 sm:pe-36">
          <p
            data-builder-id="footer.copyright"
            data-field="footer.copyright"
            data-builder-field="footer.copyright"
          >
            <span data-builder-text="">
              © {new Date().getFullYear()} {brandName}. {t.common.allRights}
            </span>
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 font-semibold">
            <Link
              href="/privacy"
              className="text-slate-600 hover:text-purple-950 transition-colors"
              data-builder-id="footer.privacy"
              data-field="footer.privacy"
              data-builder-field="footer.privacy"
            >
              <span data-builder-text="">{t.common.privacy}</span>
            </Link>
            <Link
              href="/terms"
              className="text-slate-600 hover:text-purple-950 transition-colors"
              data-builder-id="footer.terms"
              data-field="footer.terms"
              data-builder-field="footer.terms"
            >
              <span data-builder-text="">{t.common.terms}</span>
            </Link>
            <Link
              href="/gdpr"
              className="text-slate-600 hover:text-purple-950 transition-colors"
              data-builder-id="footer.gdpr"
              data-field="footer.gdpr"
              data-builder-field="footer.gdpr"
            >
              <span data-builder-text="">GDPR / KVKK</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
