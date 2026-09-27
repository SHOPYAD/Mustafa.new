"use client";
/**
 * Section preview archetypes.
 *
 * Rendering a live iframe per catalog tile is prohibitive (most sections
 * require CMS/API context and there can be 80+ of them), so instead we
 * draw small, on-brand SVG/CSS mockups that *represent* the layout of
 * each section. Every archetype is parametrised with the category's
 * accent colour so Hotel sections feel warm, Flights feel cool, etc.
 *
 * The mapping at the bottom of this file lets the catalog panel look up
 * the right archetype for any section `type`. If a new section type is
 * added to GlobalSectionRegistry without a mapping it gracefully falls
 * back to the generic "block" preview.
 */

import type { CSSProperties } from "react";

export type SectionPreviewKey =
  | "hero"
  | "search"
  | "cards"
  | "places"
  | "people"
  | "testimonial"
  | "faq"
  | "stats"
  | "support"
  | "newsletter"
  | "blog"
  | "benefits"
  | "steps"
  | "contact"
  | "gallery"
  | "logos"
  | "about"
  | "offers"
  | "block";

export interface SectionPreviewProps {
  /** Tailwind colour family used as the tint for the archetype, e.g.
   *  "navy", "emerald", "sky", "amber". The component reads the 400/500/600
   *  shades via CSS vars so it does not need the full palette. */
  tone: string;
}

/* ---------- Small primitives used across archetypes ---------- */

function Bar({
  w = "70%",
  h = 6,
  style,
}: {
  w?: string | number;
  h?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className="block rounded-full bg-foreground/20"
      style={{ width: w, height: h, ...style }}
    />
  );
}

function Pill({
  w = 40,
  h = 14,
  tone,
}: {
  w?: number;
  h?: number;
  tone: string;
}) {
  return (
    <span
      className="block rounded-full"
      style={{
        width: w,
        height: h,
        background: `var(--preview-${tone}-600, currentColor)`,
      }}
    />
  );
}

function Tile({
  tone,
  className = "",
  children,
}: {
  tone?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-md border border-foreground/10 bg-background/70 p-1.5 ${className}`}
      style={
        tone
          ? {
              background: `linear-gradient(135deg, var(--preview-${tone}-200), var(--preview-${tone}-100))`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

/* ---------- Archetypes ---------- */

function HeroPreview({ tone }: SectionPreviewProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-end p-2 text-background"
      style={{
        background: `linear-gradient(135deg, var(--preview-${tone}-700), var(--preview-${tone}-500))`,
      }}
    >
      {/* Decorative sun/blur */}
      <span
        className="pointer-events-none absolute right-2 top-2 h-6 w-6 rounded-full opacity-80"
        style={{ background: `var(--preview-${tone}-300)` }}
      />
      <div className="space-y-1">
        <span className="block h-2 w-3/4 rounded-full bg-white/90" />
        <span className="block h-2 w-1/2 rounded-full bg-white/80" />
        <span className="block h-1.5 w-2/5 rounded-full bg-white/60" />
        <span
          className="mt-1 block h-3 w-12 rounded-full"
          style={{ background: `var(--preview-${tone}-200)` }}
        />
      </div>
    </div>
  );
}

function SearchPreview({ tone }: SectionPreviewProps) {
  return (
    <div
      className="flex h-full w-full flex-col items-stretch justify-center gap-1.5 p-2"
      style={{
        background: `linear-gradient(135deg, var(--preview-${tone}-100), var(--preview-${tone}-50))`,
      }}
    >
      <div
        className="flex items-center gap-1 rounded-md border border-foreground/10 bg-background/90 px-1.5 py-1.5 shadow-sm"
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: `var(--preview-${tone}-500)` }}
        />
        <Bar w="60%" h={3} />
        <span className="ml-auto">
          <Pill w={22} h={10} tone={tone} />
        </span>
      </div>
      <div className="flex gap-1">
        <Pill w={20} h={8} tone={tone} />
        <span className="block h-2 w-10 rounded-full bg-foreground/15" />
        <span className="block h-2 w-8 rounded-full bg-foreground/15" />
      </div>
    </div>
  );
}

function CardsPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <Bar w="40%" h={4} />
      <div className="mt-auto grid grid-cols-3 gap-1">
        {[0, 1, 2].map((i) => (
          <Tile key={i} tone={tone} className="flex h-10 flex-col justify-end">
            <Bar w="70%" h={3} style={{ background: `var(--preview-${tone}-700)` }} />
            <Bar w="40%" h={2} style={{ background: `var(--preview-${tone}-500)`, marginTop: 2 }} />
          </Tile>
        ))}
      </div>
    </div>
  );
}

function PlacesPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <Bar w="35%" h={4} />
      <div className="mt-auto grid grid-cols-2 gap-1">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-12 rounded-md"
            style={{
              background: `linear-gradient(160deg, var(--preview-${tone}-500), var(--preview-${tone}-300))`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PeoplePreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2">
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-6 w-6 rounded-full border-2 border-background"
            style={{
              background: `var(--preview-${tone}-${400 + i * 100})`,
              marginLeft: i === 0 ? 0 : -6,
            }}
          />
        ))}
      </div>
      <Bar w="55%" h={3} />
      <Bar w="35%" h={2} />
    </div>
  );
}

function TestimonialPreview({ tone }: SectionPreviewProps) {
  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-1 p-2"
      style={{
        background: `linear-gradient(135deg, var(--preview-${tone}-50), var(--preview-${tone}-100))`,
      }}
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rotate-45"
            style={{ background: `var(--preview-${tone}-500)` }}
          />
        ))}
      </div>
      <Bar w="80%" h={3} />
      <Bar w="65%" h={3} />
      <div className="mt-1 flex items-center gap-1">
        <span
          className="h-4 w-4 rounded-full"
          style={{ background: `var(--preview-${tone}-500)` }}
        />
        <Bar w={28} h={2} />
      </div>
    </div>
  );
}

function FaqPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1 p-2">
      {[
        { w: "90%", open: true },
        { w: "70%", open: false },
        { w: "80%", open: false },
      ].map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 rounded-md border border-foreground/10 bg-background/70 px-1.5 py-1"
          style={
            row.open
              ? { background: `var(--preview-${tone}-100)` }
              : undefined
          }
        >
          <Bar w={row.w} h={2.5} />
          <span
            className="ml-auto inline-block h-2 w-2 rotate-45 border-b-2 border-r-2"
            style={{
              borderColor: `var(--preview-${tone}-600)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function StatsPreview({ tone }: SectionPreviewProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-around gap-2 p-2"
      style={{
        background: `linear-gradient(135deg, var(--preview-${tone}-50), var(--preview-${tone}-100))`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-0.5"
        >
          <span
            className="text-[11px] font-bold"
            style={{ color: `var(--preview-${tone}-700)` }}
          >
            {i === 0 ? "12K" : i === 1 ? "850" : "4.9"}
          </span>
          <Bar w={22} h={2} />
        </div>
      ))}
    </div>
  );
}

function SupportPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full items-center gap-2 p-2">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: `var(--preview-${tone}-500)` }}
      >
        <span className="block h-4 w-4 rounded-full bg-background" />
      </span>
      <div className="flex flex-col gap-1">
        <Bar w={60} h={3} />
        <Bar w={44} h={2} />
        <span
          className="mt-0.5 block h-2.5 w-14 rounded-full"
          style={{ background: `var(--preview-${tone}-600)` }}
        />
      </div>
    </div>
  );
}

function NewsletterPreview({ tone }: SectionPreviewProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-end gap-1.5 overflow-hidden p-2"
      style={{
        background: `linear-gradient(120deg, #051741 0%, var(--preview-${tone}-700) 55%, var(--preview-${tone}-400) 100%)`,
      }}
    >
      <span className="absolute -end-2 -top-3 h-10 w-10 rounded-full bg-white/15" />
      <span className="block h-2 w-2/3 rounded-full bg-white/90" />
      <span className="block h-1.5 w-1/2 rounded-full bg-white/45" />
      <div className="mt-1 flex w-full items-center gap-1">
        <span className="h-4 flex-1 rounded-md bg-white" />
        <span
          className="h-4 w-10 rounded-md"
          style={{ background: `var(--preview-${tone}-800)` }}
        />
      </div>
    </div>
  );
}

function BlogPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <Bar w="40%" h={3} />
      <div className="mt-auto flex gap-1">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex flex-1 flex-col gap-1 overflow-hidden rounded-md border border-foreground/10 bg-background/70"
          >
            <div
              className="h-6"
              style={{
                background: `linear-gradient(135deg, var(--preview-${tone}-400), var(--preview-${tone}-200))`,
              }}
            />
            <div className="space-y-0.5 px-1 pb-1">
              <Bar w="80%" h={2} />
              <Bar w="50%" h={1.5} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenefitsPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="grid h-full w-full grid-cols-2 gap-1 p-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-1 rounded-md border border-foreground/10 bg-background/70 p-1"
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: `var(--preview-${tone}-500)` }}
          />
          <div className="flex flex-col gap-0.5">
            <Bar w={26} h={2} />
            <Bar w={18} h={1.5} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StepsPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-around gap-1 p-2">
      {[0, 1, 2].map((i, _, arr) => (
        <div
          key={i}
          className="relative flex flex-col items-center gap-1"
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-background"
            style={{ background: `var(--preview-${tone}-600)` }}
          >
            {i + 1}
          </span>
          <Bar w={22} h={2} />
          {i < arr.length - 1 && (
            <span
              className="absolute left-full top-3 -translate-y-1/2 h-px w-4 bg-foreground/20"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ContactPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <span className="block h-2 w-full rounded-sm bg-foreground/10" />
      <span className="block h-2 w-full rounded-sm bg-foreground/10" />
      <span className="block h-6 w-full rounded-sm bg-foreground/10" />
      <span
        className="mt-auto block h-3 w-12 self-start rounded-md"
        style={{ background: `var(--preview-${tone}-600)` }}
      />
    </div>
  );
}

function GalleryPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-1 p-2">
      {[300, 500, 400, 600, 300, 500].map((shade, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{ background: `var(--preview-${tone}-${shade})` }}
        />
      ))}
    </div>
  );
}

function LogosPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
      <Bar w="30%" h={2} />
      <div className="flex items-center justify-around gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block h-2.5 w-8 rounded-full"
            style={{
              background: `var(--preview-${tone}-${400 + (i % 3) * 100})`,
              opacity: 0.75,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AboutPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full items-stretch gap-1.5 p-2">
      <div
        className="h-full w-1/3 rounded-md"
        style={{
          background: `linear-gradient(160deg, var(--preview-${tone}-400), var(--preview-${tone}-600))`,
        }}
      />
      <div className="flex flex-1 flex-col justify-center gap-1">
        <Bar w="40%" h={3} />
        <Bar w="85%" h={2} />
        <Bar w="75%" h={2} />
        <Bar w="60%" h={2} />
        <span
          className="mt-0.5 block h-2.5 w-12 rounded-full"
          style={{ background: `var(--preview-${tone}-600)` }}
        />
      </div>
    </div>
  );
}

function OffersPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <div className="flex items-center justify-between">
        <Bar w="35%" h={3} />
        <span
          className="block h-2 w-8 rounded-full"
          style={{ background: `var(--preview-${tone}-500)` }}
        />
      </div>
      <div className="mt-auto flex gap-1">
        {["50%", "30%", "20%"].map((dc, i) => (
          <div
            key={i}
            className="relative flex flex-1 flex-col justify-end overflow-hidden rounded-md"
            style={{
              background: `linear-gradient(160deg, var(--preview-${tone}-500), var(--preview-${tone}-300))`,
              height: 40,
            }}
          >
            <span
              className="absolute right-1 top-1 rounded-sm px-1 text-[8px] font-bold text-background"
              style={{ background: `var(--preview-${tone}-800)` }}
            >
              {dc}
            </span>
            <span className="block h-1.5 w-2/3 rounded-full bg-background/80 m-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockPreview({ tone }: SectionPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2">
      <div
        className="h-8 w-4/5 rounded-md"
        style={{
          background: `linear-gradient(135deg, var(--preview-${tone}-300), var(--preview-${tone}-500))`,
        }}
      />
      <Bar w="50%" h={2} />
      <Bar w="35%" h={2} />
    </div>
  );
}

/* ---------- Registry + lookup ---------- */

const PREVIEWS: Record<SectionPreviewKey, React.ComponentType<SectionPreviewProps>> =
  {
    hero: HeroPreview,
    search: SearchPreview,
    cards: CardsPreview,
    places: PlacesPreview,
    people: PeoplePreview,
    testimonial: TestimonialPreview,
    faq: FaqPreview,
    stats: StatsPreview,
    support: SupportPreview,
    newsletter: NewsletterPreview,
    blog: BlogPreview,
    benefits: BenefitsPreview,
    steps: StepsPreview,
    contact: ContactPreview,
    gallery: GalleryPreview,
    logos: LogosPreview,
    about: AboutPreview,
    offers: OffersPreview,
    block: BlockPreview,
  };

/** Maps a GlobalSectionRegistry `type` to an archetype preview key. */
export const SECTION_TYPE_TO_PREVIEW: Record<string, SectionPreviewKey> = {
  hero: "hero",
  search: "search",
  categories: "cards",
  destinations: "places",
  flashDeals: "offers",
  packages: "cards",
  hotels: "cards",
  cars: "cards",
  transfers: "cards",
  visa: "block",
  flightDeals: "offers",
  vipTours: "places",
  whyUs: "benefits",
  stats: "stats",
  testimonials: "testimonial",
  trust: "benefits",
  partners: "logos",
  blog: "blog",
  newsletter: "newsletter",
  contact: "contact",
  cta: "block",
  coupons: "offers",
  points: "benefits",
  affiliate: "support",
  banners: "gallery",
  copilot: "block", /* Agent C: copilot pipeline */
  searchBy: "search",
  benefits: "benefits",
  places: "places",
  about: "about",
  experts: "people",
  updates: "blog",

  // Hotels
  hotelsHero: "hero",
  hotelsSearch: "search",
  hotelsTraveling: "about",
  hotelsSupport: "support",
  hotelsBenefits: "benefits",
  hotelsOffers: "offers",
  hotelsPopular: "places",
  hotelsAdvantages: "benefits",
  hotelsHowItWorks: "steps",
  hotelsTestimonials: "testimonial",
  hotelsFaq: "faq",
  hotelsBlog: "blog",
  hotelsNewsletter: "newsletter",

  // Flights
  flightsHero: "hero",
  flightsSearch: "search",
  flightsDestinations: "places",
  flightsAbout: "about",
  flightsClient: "people",
  flightsPlace: "places",
  flightsProvider: "logos",
  flightsTestimonials: "testimonial",
  flightsFaq: "faq",
  flightsBlog: "blog",

  // Cars
  carsHero: "hero",
  carsLocations: "places",
  carsFeedback: "testimonial",
  carsPopular: "cards",
  carsHowItWorks: "steps",
  carsSupport: "support",
  carsTrending: "cards",
  carsAbout: "about",
  carsTestimonials: "testimonial",
  carsFaq: "faq",
  carsBlog: "blog",

  // Tours
  toursHero: "hero",
  toursDestination: "places",
  toursPlace: "places",
  toursHowItWorks: "steps",
  toursProvider: "people",
  toursSupport: "support",
  toursAdvantages: "benefits",
  toursTestimonials: "testimonial",
  toursFaq: "faq",
  toursBlog: "blog",

  // Cruise
  cruiseHero: "hero",
  cruiseTypes: "cards",
  cruiseSupport: "support",
  cruiseDestinations: "places",
  cruisePopular: "cards",
  cruiseCompanies: "logos",
  cruiseFeatured: "offers",
  cruiseGallery: "gallery",
  cruiseFaq: "faq",
  cruiseTestimonials: "testimonial",
  cruiseContact: "contact",

  // Bus
  busHero: "hero",
  busSearch: "search",
  busStats: "stats",
  busAbout: "about",
  busSupport: "support",
  busPopular: "cards",
  busRoutes: "places",
  busWhyChooseUs: "benefits",
  busCountries: "places",
  busClients: "people",
  busBlog: "blog",
  busSubscribe: "newsletter",
};

export function SectionPreview({
  type,
  tone,
}: {
  type: string;
  tone: string;
}) {
  const key = SECTION_TYPE_TO_PREVIEW[type] ?? "block";
  const Component = PREVIEWS[key];
  return <Component tone={tone} />;
}
