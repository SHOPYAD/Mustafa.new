"use client";

import { ArrowUpRight, BadgePercent, Coins, Gift, MapPin, Share2, Star, Wallet } from "lucide-react";
import CouponSlider from "@/components/loyalty/CouponSlider";
import SafeImage from "@/components/ui/SafeImage";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import { DEFAULT_AFFILIATE_SETTINGS } from "@/lib/affiliate/types";
import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { resolveBoundImage } from "@/lib/visual-editor/live-bind";
import {
  BuilderLink,
  EditableText,
  SectionFrame,
  brandButtonClass,
  brandButtonStyle,
} from "./primitives";
import {
  InteractiveHeading,
  ServiceSurface,
  serviceEyebrowClass,
  serviceTitleClass,
  serviceTitleStyle,
} from "./surfaces";

type SectionProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
};

function RewardIntro({
  instance,
  editorMode,
}: {
  instance: HomepageSectionInstance;
  editorMode: boolean;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <EditableText
        instance={instance}
        field="eyebrow"
        editorMode={editorMode}
        as="p"
        className={serviceEyebrowClass()}
      />
      <h2 className={serviceTitleClass("rewards")} style={serviceTitleStyle("rewards")}>
        <InteractiveHeading>
          <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
        </InteractiveHeading>
      </h2>
      <EditableText
        instance={instance}
        field="subtitle"
        editorMode={editorMode}
        as="p"
        className="mt-3 text-base leading-relaxed text-slate-600"
      />
    </div>
  );
}

export function CouponsSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale } = useLocale();
  const { coupons } = useLoyalty("all", locale);

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="rewards" background={instance.styles.background || undefined}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RewardIntro instance={instance} editorMode={editorMode} />
          {coupons.length ? (
            <div className="rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--brand-accent)_8%,transparent)] bg-white/90 p-4 shadow-[0_20px_48px_-32px_rgba(5,23,65,0.4)] sm:p-6">
              <CouponSlider service="all" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: BadgePercent,
                  title: locale === "ar" ? "خصم على الخدمات" : "Service discounts",
                  hint: locale === "ar" ? "أكواد تظهر هنا عند تفعيلها من التسويق." : "Codes appear here once marketing publishes them.",
                },
                {
                  icon: Gift,
                  title: locale === "ar" ? "قسائم الحجز" : "Booking vouchers",
                  hint: locale === "ar" ? "تُطبَّق قبل الدفع مباشرة." : "Applied at checkout, before you pay.",
                },
                {
                  icon: Wallet,
                  title: locale === "ar" ? "لكل الخدمات" : "Across the catalog",
                  hint: locale === "ar" ? "طيران، فنادق، باقات والمزيد." : "Flights, hotels, packages and more.",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--brand-accent)_8%,transparent)] bg-white/90 p-5 shadow-[0_16px_36px_-28px_rgba(5,23,65,0.35)]"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--brand-primary)_14%,white)] text-[var(--brand-primary)]">
                      <Icon size={18} />
                    </span>
                    <p className="mt-4 text-sm font-bold text-[var(--brand-accent)]">{card.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{card.hint}</p>
                  </div>
                );
              })}
            </div>
          )}
          <BuilderLink
            href="/holidays"
            editorMode={editorMode}
            instance={instance}
            field="button"
            className={`${brandButtonClass} mt-8 px-5 py-2.5`}
            style={brandButtonStyle()}
          >
            <EditableText instance={instance} field="button" editorMode={editorMode} as="span" />
            <ArrowUpRight size={15} />
          </BuilderLink>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function PointsSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale } = useLocale();
  const { settings } = useLoyalty("all", locale);
  const rate = settings?.pointsPerUsd || 10;
  const redeem = settings?.pointsPerUsdRedeem || 100;

  const steps = [
    {
      icon: Coins,
      label: `${rate}`,
      title: locale === "ar" ? "نقطة لكل دولار" : "Points per $1",
      hint: locale === "ar" ? "تُضاف تلقائياً بعد تأكيد الحجز." : "Credited automatically after a confirmed booking.",
    },
    {
      icon: Wallet,
      label: `${redeem}`,
      title: locale === "ar" ? "نقطة = 1 دولار" : "Points = $1",
      hint: locale === "ar" ? "حوّلها إلى قسيمة من محفظتك." : "Convert them into a voucher from your wallet.",
    },
    {
      icon: Gift,
      label: settings?.enabled === false ? "—" : locale === "ar" ? "مفعّل" : "Live",
      title: locale === "ar" ? "برنامج الولاء" : "Loyalty program",
      hint: locale === "ar" ? "نفس الهوية على كل خدمات الريان." : "The same program across every Alrayyan service.",
    },
  ];

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="rewards" background={instance.styles.background || undefined}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RewardIntro instance={instance} editorMode={editorMode} />
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="relative rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--brand-accent)_8%,transparent)] bg-white/90 p-6 shadow-[0_16px_36px_-28px_rgba(5,23,65,0.35)]"
                >
                  <span className="absolute end-4 top-4 text-xs font-semibold text-slate-300">
                    0{index + 1}
                  </span>
                  <Icon size={20} className="text-[var(--brand-primary)]" />
                  <p className="mt-4 text-3xl font-bold text-[var(--brand-accent)]">{card.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--brand-accent)]">{card.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{card.hint}</p>
                </div>
              );
            })}
          </div>
          <BuilderLink
            href="/account"
            editorMode={editorMode}
            instance={instance}
            field="button"
            className={`${brandButtonClass} mt-8 px-5 py-2.5`}
            style={brandButtonStyle()}
          >
            <EditableText instance={instance} field="button" editorMode={editorMode} as="span" />
            <ArrowUpRight size={15} />
          </BuilderLink>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function AffiliateSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale } = useLocale();
  const rules = DEFAULT_AFFILIATE_SETTINGS.commissions;
  const rows = [
    ["flight", locale === "ar" ? "طيران" : "Flights", rules.flight],
    ["hotel", locale === "ar" ? "فنادق" : "Hotels", rules.hotel],
    ["car", locale === "ar" ? "سيارات" : "Cars", rules.car],
    ["transfer", locale === "ar" ? "ترانسفير" : "Transfers", rules.transfer],
    ["package", locale === "ar" ? "باقات" : "Packages", rules.package],
    ["other", locale === "ar" ? "خدمات أخرى" : "Other", rules.other],
  ] as const;

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="rewards" background={instance.styles.background || undefined}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RewardIntro instance={instance} editorMode={editorMode} />
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--brand-accent)_8%,transparent)] bg-white/90 shadow-[0_20px_48px_-32px_rgba(5,23,65,0.4)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[var(--brand-header)] px-5 py-4 text-white">
              <p className="text-sm font-semibold">
                {locale === "ar" ? "عمولة حسب الخدمة" : "Commission by service"}
              </p>
              <Share2 size={16} className="text-[var(--brand-primary)]" />
            </div>
            <div className="divide-y divide-slate-100">
              {rows.map(([key, label, rule]) => (
                <div key={key} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm font-semibold text-[var(--brand-accent)]">{label}</span>
                  <span className="text-sm font-bold text-[var(--brand-primary)]">
                    {rule.type === "percent" ? `${rule.value}%` : `$${rule.value}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <BuilderLink
            href="/account"
            editorMode={editorMode}
            instance={instance}
            field="button"
            className={`${brandButtonClass} mt-8 px-5 py-2.5`}
            style={brandButtonStyle()}
          >
            <Share2 size={15} />
            <EditableText instance={instance} field="button" editorMode={editorMode} as="span" />
          </BuilderLink>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function BannersSection({ instance, editorMode, selectedId }: SectionProps) {
  const homepage = useHomepageContent();
  const { locale, t } = useLocale();
  const banners = homepage.destinations.slice(0, 6);

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="destinations" background={instance.styles.background || undefined} className="py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <EditableText
              instance={instance}
              field="eyebrow"
              editorMode={editorMode}
              as="p"
              className={serviceEyebrowClass()}
            />
            <h2 className={serviceTitleClass("destinations")} style={serviceTitleStyle("destinations")}>
              <InteractiveHeading>
                <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
              </InteractiveHeading>
            </h2>
            <EditableText
              instance={instance}
              field="subtitle"
              editorMode={editorMode}
              as="p"
              className="mt-3 text-base leading-relaxed text-slate-600"
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((dest, index) => {
              const name = tContent(dest, "name", locale);
              const tall = index === 0 || index === 5;
              return (
                <BuilderLink
                  key={dest.id}
                  href={dest.href || "/holidays"}
                  editorMode={editorMode}
                  instance={instance}
                  field={`banner-${dest.id}`}
                  className={`group relative block overflow-hidden rounded-[1.35rem] shadow-[0_22px_48px_-28px_rgba(5,23,65,0.55)] ring-1 ring-[#051741]/10 ${
                    tall ? "min-h-[280px] sm:min-h-[300px]" : "min-h-[240px]"
                  }`}
                >
                  <SafeImage
                    src={resolveBoundImage(instance, `banner-${dest.id}`, dest.image)}
                    alt={name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                    builderId={`${instance.instanceId}.banner-${dest.id}`}
                    builderField={`banner-${dest.id}`}
                    builderInstanceId={instance.instanceId}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051741] via-[#051741]/35 to-transparent" />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                      <MapPin size={11} />
                      {tContent(dest, "country", locale)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[11px] font-bold text-[#051741]">
                      <Star size={11} className="fill-[#051741]" />
                      {dest.rating}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
                    <p className="mt-1 line-clamp-1 text-sm text-white/70">
                      {tContent(dest, "tagline", locale)}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-semibold text-emerald-300">
                        {t.common.from} ${dest.startingPrice}
                      </span>
                      <span className="inline-flex items-center gap-1 text-white/85 transition group-hover:translate-x-0.5 group-hover:text-emerald-200 rtl:group-hover:-translate-x-0.5">
                        {dest.packages} {t.home.packagesCount}
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </BuilderLink>
              );
            })}
          </div>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}
