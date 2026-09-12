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
                  className="sc-card group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="sc-card-image relative h-44">
                    <SafeImage
                      src={deal.image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-md"
                    >
                      <Flame size={12} className="text-slate-950 fill-slate-950" />
                      {badge || `${discount}%`}
                    </span>
                    <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/25 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                      <Users size={11} />
                      {deal.seatsLeft}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-700">{destination}</p>
                    <h3 className="sc-card-title mt-1 font-black text-base text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">{title}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Clock size={11} />
                        {t.home.offerEndsIn}
                      </span>
                      <CountdownTimer endsAt={new Date(deal.endsAt)} />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <span className="text-xs text-slate-400 line-through">${deal.originalPrice}</span>
                        <p className="sc-card-price text-xl font-black text-purple-950">${deal.salePrice}</p>
                      </div>
                      <span
                        className="sc-btn inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md transition-all active:scale-95"
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
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-[#120324] via-[#240a4a] to-[#3b1275] text-white">
        {/* Radiant Golden Wave & Ambient Glow Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-400/15 blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-600/30 blur-[140px]" />
          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 1440 400"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,218.7C672,235,768,213,864,181.3C960,149,1056,107,1152,106.7C1248,107,1344,149,1392,170.7L1440,192L1440,400L1392,400C1344,400,1248,400,1152,400C1056,400,960,400,864,400C768,400,672,400,576,400C480,400,384,400,288,400C192,400,96,400,48,400L0,400Z"
              fill="url(#trust-gold-wave-gradient)"
            />
            <defs>
              <linearGradient id="trust-gold-wave-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <HomeContainer className="relative z-10">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300 backdrop-blur-sm mb-4">
                {t.home.trustTitle || "شريكك المعتمد"}
              </span>
              <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl tracking-tight">
                <InteractiveHeading>
                  <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
                </InteractiveHeading>
              </h2>
              <EditableText
                instance={instance}
                field="subtitle"
                editorMode={editorMode}
                as="p"
                className="mt-3 text-base sm:text-lg leading-relaxed text-slate-200 font-medium"
                fallback={t.home.trustSubtitle}
              />
            </div>
            <SelectableField
              instance={instance}
              field="badges"
              editorMode={editorMode}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-white/10 px-4 py-3 backdrop-blur-md shadow-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md">
                  <Shield size={20} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-sm font-black text-white">{t.home.iataCertified}</p>
                  <p className="text-xs text-amber-300/80 font-bold">{t.home.licensedAgent}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-white/10 px-4 py-3 backdrop-blur-md shadow-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-md">
                  <Award size={20} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-sm font-black text-white">{t.home.dubaiTourism}</p>
                  <p className="text-xs text-amber-300/80 font-bold">{t.home.authorizedPartner}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-slate-950 shadow-xl shadow-amber-500/20">
                <Star size={20} className="fill-slate-950 text-slate-950" />
                <div>
                  <p className="text-sm font-black text-slate-950">4.9 / 5</p>
                  <p className="text-xs text-slate-900 font-extrabold">{t.home.reviewsCount}</p>
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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#18052e] via-[#240a4a] to-[#18052e] py-16 md:py-20 text-white border-t border-purple-900/30">
        <div
          aria-hidden={!editorMode}
          className={`absolute inset-0 opacity-25 ${editorMode ? "" : "pointer-events-none"}`}
          data-builder-id={`${instance.instanceId}.overlay`}
          data-field="overlay"
          data-builder-field="overlay"
          data-instance-id={instance.instanceId}
          style={{
            background:
              instance.styles.overlay ||
              "radial-gradient(circle at 80% 16%, rgba(245,158,11,0.2) 0 16%, transparent 17%), radial-gradient(circle at 12% 84%, rgba(124,58,237,0.3) 0 18%, transparent 19%)",
          }}
        />
        <HomeContainer className="relative z-10">
          <h2 className="text-3xl font-black text-white sm:text-4xl tracking-tight">
            <InteractiveHeading>
              <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
            </InteractiveHeading>
          </h2>
          <EditableText
            instance={instance}
            field="subtitle"
            editorMode={editorMode}
            as="p"
            className="mt-2 mb-8 max-w-2xl text-slate-300 font-medium"
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
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-purple-950 shadow-sm ring-1 ring-purple-900/10 group-hover:ring-amber-400/50 transition-all"
                      style={{ backgroundColor: `${accent}1f` }}
                    >
                      <Icon size={20} style={{ color: accent }} />
                    </span>
                    <span className="text-xs font-bold text-slate-900">{name}</span>
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
  const phone = contact.callbackPhone || contact.customerServicePhones[0] || "+90 531 359 13 94";
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
      <section className="relative overflow-hidden py-14 md:py-20 bg-gradient-to-br from-[#120324] via-[#240a4a] to-[#3b1275] text-white">
        {/* Ambient Golden and Royal Purple Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-400/15 blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-600/30 blur-[140px]" />
        </div>

        <HomeContainer className="relative z-10 min-w-0 max-w-full overflow-x-hidden">
          <div className="grid w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-amber-400/25 bg-white/10 shadow-[0_28px_60px_-20px_rgba(24,5,46,0.85)] backdrop-blur-xl md:grid-cols-2">
            {/* Left Panel: Instant Callback */}
            <div className="flex min-w-0 max-w-full flex-col justify-center gap-5 p-6 sm:p-8 md:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-300 backdrop-blur-sm w-fit">
                <Phone size={13} className="text-amber-400" />
                <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-white tracking-tight">
                <InteractiveHeading>
                  <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
                </InteractiveHeading>
              </h2>
              <EditableText
                instance={instance}
                field="subtitle"
                editorMode={editorMode}
                as="p"
                className="max-w-md text-sm leading-relaxed text-slate-200 sm:text-base font-medium"
              />
              {phone ? (
                <SelectableField instance={instance} field="phone" editorMode={editorMode}>
                  <a
                    href={phoneToTelHref(phone)}
                    dir="ltr"
                    className="inline-flex max-w-full flex-wrap items-center gap-2.5 text-lg sm:text-xl font-black font-mono text-amber-300 hover:text-amber-200 transition-colors"
                    onClick={(event) => preventBuilderNav(editorMode, event)}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      <Phone size={18} />
                    </span>
                    {phone}
                  </a>
                </SelectableField>
              ) : null}

              {status === "success" ? (
                <div className="flex items-center gap-2.5 rounded-2xl bg-purple-900/80 border border-amber-400/40 px-5 py-4 text-sm font-bold text-amber-300 shadow-lg">
                  <CheckCircle size={18} className="text-amber-400" />
                  {t.callback.successTitle}
                </div>
              ) : (
                <form
                  onSubmit={submitCallback}
                  onClickCapture={(event) => preventBuilderNav(editorMode, event)}
                  className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-stretch mt-2"
                >
                  <div
                    dir="ltr"
                    className="grid w-full min-w-0 max-w-full grid-cols-[auto_minmax(0,1fr)] overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 focus-within:ring-2 focus-within:ring-amber-400"
                  >
                    <select
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      className="w-[5rem] max-w-[5rem] shrink-0 border-e border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none sm:w-[5.5rem] sm:max-w-[5.5rem] sm:text-sm font-bold cursor-pointer"
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
                      className="min-w-0 w-full px-3.5 py-3.5 text-sm text-slate-900 font-semibold outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 transition-all active:scale-95 text-sm sm:text-base disabled:opacity-60 cursor-pointer"
                  >
                    {status === "loading" ? (
                      <Loader2 size={18} className="animate-spin text-slate-950" />
                    ) : (
                      <Phone size={18} className="text-slate-950" />
                    )}
                    <EditableText instance={instance} field="button" editorMode={editorMode} as="span" />
                  </button>
                </form>
              )}
            </div>

            {/* Right Panel: Direct VIP Concierge & Chat */}
            <div className="flex min-w-0 max-w-full flex-col justify-center gap-5 border-t border-white/15 bg-black/25 p-6 sm:p-8 md:p-10 md:border-s md:border-t-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300 w-fit">
                Lonaliza VIP Care
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                <InteractiveHeading>
                  <EditableText instance={instance} field="ctaTitle" editorMode={editorMode} as="span" />
                </InteractiveHeading>
              </h3>
              <EditableText
                instance={instance}
                field="ctaSubtitle"
                editorMode={editorMode}
                as="p"
                className="max-w-md text-sm sm:text-base leading-relaxed text-slate-200 font-medium"
              />
              <BuilderLink
                href={homepage.cta.buttonHref || "/contact"}
                editorMode={editorMode}
                instance={instance}
                field="ctaButton"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-purple-950/85 hover:bg-purple-900 text-amber-300 border border-amber-400/40 hover:border-amber-400 font-black shadow-lg transition-all active:scale-95 text-sm sm:text-base w-fit"
              >
                <MessageCircle size={18} className="text-amber-400" />
                <EditableText instance={instance} field="ctaButton" editorMode={editorMode} as="span" />
              </BuilderLink>
            </div>
          </div>
        </HomeContainer>
      </section>
    </SectionFrame>
  );
}
