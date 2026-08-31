"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Award,
  Building2,
  Car,
  CheckCircle,
  Clock,
  FileText,
  Flame,
  Loader2,
  MessageCircle,
  Phone,
  Plane,
  Route,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { createBooking } from "@/data/bookings";
import { phoneToTelHref } from "@/data/site-contact";
import { trackLeadEnquiry } from "@/lib/tracking";
import VisaCards from "@/components/visa/VisaCards";
import FlightDealsSection from "@/components/home/FlightDealsSection";
import TransferOffersSection from "@/components/home/TransferOffersSection";
import TransferCard from "@/components/transfers/TransferCard";
import PartnersMarquee from "@/components/home/PartnersMarquee";
import TrustLogoSliders from "@/components/home/TrustLogoSliders";
import CardSlider from "@/components/ui/CardSlider";
import SafeImage from "@/components/ui/SafeImage";
import { getFeaturedVipDailyTours } from "@/data/transfers";
import { useSiteContact } from "@/hooks/useSiteContact";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { pickCopy } from "@/lib/visual-editor/schema";
import { resolveBoundImage } from "@/lib/visual-editor/live-bind";
import {
  BuilderLink,
  EditableText,
  HomeContainer,
  SectionFrame,
  SelectableField,
  brandButtonClass,
  brandButtonStyle,
  preventBuilderNav,
  sectionAccent,
} from "./primitives";
import {
  InteractiveHeading,
  ServiceSurface,
  serviceEyebrowClass,
  serviceTitleClass,
  serviceTitleStyle,
  type ServiceSurfaceKind,
} from "./surfaces";

type SectionProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
};

function TitledWrap({
  instance,
  editorMode,
  selectedId,
  children,
  kind,
}: SectionProps & { children: ReactNode; kind: ServiceSurfaceKind }) {
  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind={kind} background={instance.styles.background || undefined} className="py-12 md:py-16">
        {/* Agent B: public homepage content */}
        <HomeContainer>
          <h2 className={serviceTitleClass(kind)} style={serviceTitleStyle(kind)}>
            <InteractiveHeading>
              <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
            </InteractiveHeading>
          </h2>
          <EditableText
            instance={instance}
            field="subtitle"
            editorMode={editorMode}
            as="p"
            className="mt-2 pb-4 text-slate-600"
          />
          <div onClickCapture={(e) => preventBuilderNav(editorMode, e)}>{children}</div>
        </HomeContainer>
      </ServiceSurface>
    </SectionFrame>
  );
}

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endsAt.getTime() - Date.now());
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="flex gap-1">
      {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((value, index) => (
        <span
          key={index}
          className="min-w-[2rem] rounded-md bg-[#051741] px-1.5 py-1 text-center text-[11px] font-bold text-white"
        >
          {String(value).padStart(2, "0")}
        </span>
      ))}
    </div>
  );
}

export function FlashDealsSection({ instance, editorMode, selectedId }: SectionProps) {
  const homepage = useHomepageContent();
  const { locale, t } = useLocale();
  const offers = homepage.offers;
  const accent = sectionAccent(instance);

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="offers" background={instance.styles.background || undefined}>
        <HomeContainer>
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <EditableText
                instance={instance}
                field="eyebrow"
                editorMode={editorMode}
                as="p"
                className={serviceEyebrowClass()}
              />
              <h2 className={serviceTitleClass("offers")} style={serviceTitleStyle("offers")}>
                <InteractiveHeading>
                  <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
                </InteractiveHeading>
              </h2>
              <EditableText
                instance={instance}
                field="subtitle"
                editorMode={editorMode}
                as="p"
                className="mt-2 max-w-xl text-slate-600"
              />
            </div>
            <BuilderLink
              href="/holidays?filter=deals"
              editorMode={editorMode}
              instance={instance}
              field="viewAll"
              className={`${brandButtonClass} sc-btn px-5 py-2.5`}
              style={brandButtonStyle()}
            >
              {t.home.viewAllDeals}
            </BuilderLink>
          </div>
          <div className="sc-grid grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {offers.slice(0, 4).map((deal) => {
              const title = tContent(deal, "title", locale);
              const destination = tContent(deal, "destination", locale);
              const badge = tContent(deal, "badge", locale);
              const discount = Math.round(
                (1 - deal.salePrice / Math.max(deal.originalPrice, 1)) * 100
              );
              return (
                <BuilderLink
                  key={deal.id}
                  href={deal.href || "/holidays"}
                  editorMode={editorMode}
                  instance={instance}
                  field={`deal-${deal.id}`}
                  className="sc-card group overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-28px_rgba(5,23,65,0.45)] ring-1 ring-[#051741]/8 hover:-translate-y-1 transition"
                >
                  <div className="sc-card-image relative h-44">
                    <SafeImage
                      src={deal.image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#051741]"
                      style={{ backgroundColor: accent }}
                    >
                      <Flame size={12} />
                      {badge || `${discount}%`}
                    </span>
                    <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-[#051741]/80 px-2 py-1 text-[11px] text-white">
                      <Users size={11} />
                      {deal.seatsLeft}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-emerald-600">{destination}</p>
                    <h3 className="sc-card-title mt-1 font-bold text-[#051741] line-clamp-1">{title}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock size={11} />
                        {t.home.offerEndsIn}
                      </span>
                      <CountdownTimer endsAt={new Date(deal.endsAt)} />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <span className="text-xs text-slate-400 line-through">${deal.originalPrice}</span>
                        <p className="sc-card-price text-xl font-bold text-[#051741]">${deal.salePrice}</p>
                      </div>
                      <span
                        className="sc-btn whitespace-nowrap px-3 py-1.5 text-xs font-bold text-white"
                        style={{
                          backgroundColor: "var(--brand-button)",
                          borderRadius: "var(--radius-button)",
                        }}
                      >
                        {t.home.book}
                      </span>
                    </div>
                  </div>
                </BuilderLink>
              );
            })}
          </div>
        </HomeContainer>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function VisaSection({ instance, editorMode, selectedId }: SectionProps) {
  return (
    <TitledWrap instance={instance} editorMode={editorMode} selectedId={selectedId} kind="visa">
      <VisaCards embedded />
    </TitledWrap>
  );
}

export function FlightDealsWrap({ instance, editorMode, selectedId }: SectionProps) {
  return (
    <TitledWrap instance={instance} editorMode={editorMode} selectedId={selectedId} kind="flights">
      <FlightDealsSection embedded />
    </TitledWrap>
  );
}

export function VipToursSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale } = useLocale();
  const tours = getFeaturedVipDailyTours().slice(0, 10);
  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="tours" background={instance.styles.background || undefined}>
        <HomeContainer>
          <h2 className={`${serviceTitleClass("tours")} mb-2`} style={serviceTitleStyle("tours")}>
            <InteractiveHeading>
              <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
            </InteractiveHeading>
          </h2>
          <EditableText
            instance={instance}
            field="subtitle"
            editorMode={editorMode}
            as="p"
            className="mb-8 text-slate-600"
          />
          {tours.length ? (
            <CardSlider title="" tone="light">
              {tours.map((item) => (
                <SelectableField
                  key={item.id}
                  instance={instance}
                  field={`tour-${item.id}`}
                  editorMode={editorMode}
                  className="snap-start shrink-0 w-[240px] sm:w-[260px]"
                >
                  <div onClickCapture={(e) => preventBuilderNav(editorMode, e)} className="sc-card">
                    <TransferCard transfer={item} compact />
                  </div>
                </SelectableField>
              ))}
            </CardSlider>
          ) : null}
          <span className="sr-only">{pickCopy(instance.texts.title, locale)}</span>
        </HomeContainer>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function TrustSection({ instance, editorMode, selectedId }: SectionProps) {
  const { t } = useLocale();
  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      {/* Agent B: public homepage content */}
      <section className="relative overflow-hidden bg-[#051741] py-16 md:py-20">
        <div
          aria-hidden={!editorMode}
          className={`absolute inset-0 opacity-40 ${editorMode ? "" : "pointer-events-none"}`}
          data-builder-id={`${instance.instanceId}.overlay`}
          data-field="overlay"
          data-builder-field="overlay"
          data-instance-id={instance.instanceId}
          style={{
            background:
              instance.styles.overlay ||
              "radial-gradient(circle at 18% 20%, rgba(16,185,129,0.22) 0 18%, transparent 19%), radial-gradient(circle at 88% 80%, rgba(14,116,144,0.28) 0 16%, transparent 17%)",
          }}
        />
        <HomeContainer className="relative z-10">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                <InteractiveHeading>
                  <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
                </InteractiveHeading>
              </h2>
              <p className="mt-2 text-white/65">{t.home.trustTitle}</p>
              <EditableText
                instance={instance}
                field="subtitle"
                editorMode={editorMode}
                as="p"
                className="mt-2 text-white/55"
                fallback={t.home.trustSubtitle}
              />
            </div>
            <SelectableField
              instance={instance}
              field="badges"
              editorMode={editorMode}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-[#051741]">
                  <Shield size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{t.home.iataCertified}</p>
                  <p className="text-xs text-white/60">{t.home.licensedAgent}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400 text-[#051741]">
                  <Award size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{t.home.dubaiTourism}</p>
                  <p className="text-xs text-white/60">{t.home.authorizedPartner}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-4 py-3 text-[#051741]">
                <Star size={18} className="fill-[#051741]" />
                <div>
                  <p className="text-sm font-bold">4.9 / 5</p>
                  <p className="text-xs opacity-70">{t.home.reviewsCount}</p>
                </div>
              </div>
            </SelectableField>
          </div>
          <TrustLogoSliders instance={instance} editorMode={editorMode} />
        </HomeContainer>
      </section>
    </SectionFrame>
  );
}

export function PartnersSection({ instance, editorMode, selectedId }: SectionProps) {
  const { t } = useLocale();
  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      {/* Agent B: public homepage content */}
      <section className="relative overflow-hidden bg-[#062033] py-16 md:py-20">
        <div
          aria-hidden={!editorMode}
          className={`absolute inset-0 opacity-35 ${editorMode ? "" : "pointer-events-none"}`}
          data-builder-id={`${instance.instanceId}.overlay`}
          data-field="overlay"
          data-builder-field="overlay"
          data-instance-id={instance.instanceId}
          style={{
            background:
              instance.styles.overlay ||
              "radial-gradient(circle at 80% 16%, rgba(16,185,129,0.2) 0 16%, transparent 17%), radial-gradient(circle at 12% 84%, rgba(8,47,73,0.5) 0 18%, transparent 19%)",
          }}
        />
        <HomeContainer className="relative z-10">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            <InteractiveHeading>
              <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
            </InteractiveHeading>
          </h2>
          <EditableText
            instance={instance}
            field="subtitle"
            editorMode={editorMode}
            as="p"
            className="mt-2 mb-8 max-w-2xl text-white/60"
            fallback={t.home.partnersSubtitle}
          />
          <SelectableField instance={instance} field="marquee" editorMode={editorMode}>
            <PartnersMarquee instance={instance} editorMode={editorMode} />
          </SelectableField>
        </HomeContainer>
      </section>
    </SectionFrame>
  );
}

const SERVICE_ITEMS = [
  { href: "/flights", icon: Plane, key: "flights", ar: "طيران", en: "Flights", tr: "Uçuşlar" },
  { href: "/hotels", icon: Building2, key: "hotels", ar: "فنادق", en: "Hotels", tr: "Oteller" },
  { href: "/holidays", icon: Sparkles, key: "packages", ar: "باقات", en: "Packages", tr: "Paketler" },
  { href: "/cars", icon: Car, key: "cars", ar: "سيارات", en: "Cars", tr: "Araçlar" },
  { href: "/transfers", icon: Route, key: "transfers", ar: "ترانسفير", en: "Transfers", tr: "Transfer" },
  { href: "/visa", icon: FileText, key: "visa", ar: "تأشيرات", en: "Visa", tr: "Vize" },
] as const;

export function CategoriesSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale } = useLocale();
  const accent = sectionAccent(instance);
  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="neutral" className="py-10 md:py-12">
        <HomeContainer>
          <div className="rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--brand-accent)_8%,transparent)] bg-white/90 px-3 py-5 shadow-[0_22px_55px_-28px_rgba(5,23,65,0.25)] sm:px-6">
            <h2 className="mb-4 text-center">
              <InteractiveHeading className={serviceTitleClass("neutral", "text-xl md:text-2xl")} style={serviceTitleStyle("neutral")}>
                <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
              </InteractiveHeading>
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SERVICE_ITEMS.map((item) => {
                const Icon = item.icon;
                const name = locale === "en" ? item.en : locale === "tr" ? item.tr : item.ar;
                return (
                  <BuilderLink
                    key={item.href}
                    href={item.href}
                    editorMode={editorMode}
                    instance={instance}
                    field={`service-${item.key}`}
                    className="sc-card group flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition hover:bg-[#f4f7fb]"
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-[#051741] shadow-sm ring-1 ring-[#051741]/8 group-hover:ring-emerald-400/40"
                      style={{ backgroundColor: `${accent}1f` }}
                    >
                      <Icon size={20} style={{ color: accent }} />
                    </span>
                    <span className="text-xs font-semibold text-[#051741]">{name}</span>
                  </BuilderLink>
                );
              })}
            </div>
          </div>
        </HomeContainer>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function TransfersSection({ instance, editorMode, selectedId }: SectionProps) {
  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="transfers" background={instance.styles.background || undefined}>
        <HomeContainer>
          <EditableText
            instance={instance}
            field="eyebrow"
            editorMode={editorMode}
            as="p"
            className={serviceEyebrowClass()}
          />
          <h2 className={serviceTitleClass("transfers")} style={serviceTitleStyle("transfers")}>
            <InteractiveHeading>
              <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
            </InteractiveHeading>
          </h2>
          <EditableText
            instance={instance}
            field="subtitle"
            editorMode={editorMode}
            as="p"
            className="mt-2 pb-4 text-slate-600"
          />
          <div onClickCapture={(e) => preventBuilderNav(editorMode, e)}>
            <TransferOffersSection embedded />
          </div>
        </HomeContainer>
      </ServiceSurface>
    </SectionFrame>
  );
}

const CALLBACK_COUNTRY_CODES = [
  { code: "+90", country: "TR", flag: "🇹🇷" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+974", country: "QA", flag: "🇶🇦" },
  { code: "+965", country: "KW", flag: "🇰🇼" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
] as const;

export function ContactSection({ instance, editorMode, selectedId }: SectionProps) {
  const contact = useSiteContact();
  const homepage = useHomepageContent();
  const { t } = useLocale();
  const accent = sectionAccent(instance);
  const phone = contact.callbackPhone || contact.customerServicePhones[0] || "+90 532 179 67 63";
  const photo = resolveBoundImage(instance, "image", homepage.cta.image);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+90");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const submitCallback = async (event: FormEvent) => {
    event.preventDefault();
    if (editorMode || !phoneNumber.trim()) return;
    setStatus("loading");
    const fullPhone = `${countryCode}${phoneNumber.trim()}`;
    await createBooking({
      type: "callback",
      packageName: "Callback request",
      name: "Callback",
      phone: fullPhone,
      message: `Callback requested at ${fullPhone}`,
      metadata: { source: "homepage_contact_section", countryCode },
    });
    trackLeadEnquiry("callback_request");
    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setPhoneNumber("");
    }, 3200);
  };

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <section className="relative overflow-x-hidden overflow-y-hidden py-10 md:py-14">
        <div className="absolute inset-0">
          <SafeImage
            src={photo}
            alt=""
            fill
            className="object-cover"
            builderId={`${instance.instanceId}.image`}
            builderField="image"
            builderInstanceId={instance.instanceId}
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,color-mix(in_srgb,#051741_88%,transparent)_0%,color-mix(in_srgb,#051741_62%,transparent)_48%,color-mix(in_srgb,#0f766e_55%,transparent)_100%)]" />
        </div>
        <HomeContainer className="relative z-10 min-w-0 max-w-full overflow-x-hidden">
          <div className="grid w-full min-w-0 max-w-full overflow-hidden rounded-[1.6rem] border border-white/15 bg-white/10 shadow-[0_28px_60px_-32px_rgba(5,23,65,0.65)] backdrop-blur-md md:grid-cols-2">
            <div className="flex min-w-0 max-w-full flex-col justify-center gap-4 p-4 sm:p-6 md:p-8">
              <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
                <InteractiveHeading>
                  <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
                </InteractiveHeading>
              </h2>
              <EditableText
                instance={instance}
                field="subtitle"
                editorMode={editorMode}
                as="p"
                className="max-w-md text-sm leading-relaxed text-white/75 md:text-base"
              />
              {phone ? (
                <SelectableField instance={instance} field="phone" editorMode={editorMode}>
                  <a
                    href={phoneToTelHref(phone)}
                    dir="ltr"
                    className="inline-flex max-w-full flex-wrap items-center gap-2 text-lg font-semibold text-emerald-300 hover:text-emerald-200"
                    onClick={(event) => preventBuilderNav(editorMode, event)}
                  >
                    <Phone size={18} />
                    {phone}
                  </a>
                </SelectableField>
              ) : null}
              {status === "success" ? (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200">
                  <CheckCircle size={16} />
                  {t.callback.successTitle}
                </div>
              ) : (
                <form
                  onSubmit={submitCallback}
                  onClickCapture={(event) => preventBuilderNav(editorMode, event)}
                  className="flex w-full min-w-0 max-w-full flex-col gap-2 md:flex-row md:items-stretch"
                >
                  <div
                    dir="ltr"
                    className="grid w-full min-w-0 max-w-full grid-cols-[auto_minmax(0,1fr)] overflow-hidden rounded-[var(--radius-input)] bg-white shadow-sm"
                  >
                    <select
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      className="w-[4.75rem] max-w-[4.75rem] shrink-0 border-e border-slate-200 bg-slate-50 px-1.5 text-xs text-[#051741] outline-none sm:w-[5.25rem] sm:max-w-[5.25rem] sm:text-sm"
                      aria-label={t.callback.phoneLabel}
                    >
                      {CALLBACK_COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder={t.callback.phonePlaceholder}
                      required
                      dir="ltr"
                      className="min-w-0 w-full px-3 py-3 text-sm text-[#051741] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`${brandButtonClass} w-full shrink-0 px-5 py-3 md:w-auto`}
                    style={{ ...brandButtonStyle(), backgroundColor: accent || "var(--brand-button)" }}
                  >
                    {status === "loading" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Phone size={16} />
                    )}
                    <EditableText instance={instance} field="button" editorMode={editorMode} as="span" />
                  </button>
                </form>
              )}
            </div>
            <div className="flex min-w-0 max-w-full flex-col justify-center gap-4 border-t border-white/10 bg-[#051741]/35 p-4 sm:p-6 md:p-8 md:border-s md:border-t-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
                Alrayyan
              </p>
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                <InteractiveHeading>
                  <EditableText instance={instance} field="ctaTitle" editorMode={editorMode} as="span" />
                </InteractiveHeading>
              </h3>
              <EditableText
                instance={instance}
                field="ctaSubtitle"
                editorMode={editorMode}
                as="p"
                className="max-w-sm text-sm leading-relaxed text-white/70"
              />
              <BuilderLink
                href={homepage.cta.buttonHref || "/contact"}
                editorMode={editorMode}
                instance={instance}
                field="ctaButton"
                className={`${brandButtonClass} w-fit px-6 py-3`}
                style={{ ...brandButtonStyle(), backgroundColor: accent || "var(--brand-button)" }}
              >
                <MessageCircle size={16} />
                <EditableText instance={instance} field="ctaButton" editorMode={editorMode} as="span" />
              </BuilderLink>
            </div>
          </div>
        </HomeContainer>
      </section>
    </SectionFrame>
  );
}
