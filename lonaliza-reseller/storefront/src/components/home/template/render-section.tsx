"use client";

import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { assertNever } from "@/lib/visual-editor/schema";
import { HeroSection, SearchSection } from "./HeroSearchSections";
import {
  DestinationsSection,
  PackagesSection,
  HotelsSection,
  CarsSection,
} from "./CatalogSections";
import {
  WhyUsSection,
  StatsSection,
  TestimonialsSection,
  BlogSection,
  NewsletterSection,
} from "./StorySections";
import {
  FlashDealsSection,
  VisaSection,
  FlightDealsWrap,
  VipToursSection,
  TrustSection,
  PartnersSection,
  CategoriesSection,
  TransfersSection,
  ContactSection,
} from "./ExtraSections";
import {
  AffiliateSection,
  BannersSection,
  CouponsSection,
  PointsSection,
} from "./RewardSections";
import { CopilotCustomSection } from "./copilot-sections/CopilotCustomSection"; /* Agent C: copilot pipeline */

export type RenderSectionProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
};

export function RenderHomepageSection(props: RenderSectionProps) {
  switch (props.instance.type) {
    case "hero":
      return <HeroSection {...props} />;
    case "search":
      return <SearchSection {...props} />;
    case "categories":
      return <CategoriesSection {...props} />;
    case "destinations":
      return <DestinationsSection {...props} />;
    case "packages":
      return <PackagesSection {...props} />;
    case "hotels":
      return <HotelsSection {...props} />;
    case "cars":
      return <CarsSection {...props} />;
    case "transfers":
      return <TransfersSection {...props} />;
    case "whyUs":
      return <WhyUsSection {...props} />;
    case "stats":
      return <StatsSection {...props} />;
    case "testimonials":
      return <TestimonialsSection {...props} />;
    case "blog":
      return <BlogSection {...props} />;
    case "newsletter":
      return <NewsletterSection {...props} />;
    case "contact":
    case "cta":
      return <ContactSection {...props} />;
    case "flashDeals":
      return <FlashDealsSection {...props} />;
    case "visa":
      return <VisaSection {...props} />;
    case "flightDeals":
      return <FlightDealsWrap {...props} />;
    case "vipTours":
      return <VipToursSection {...props} />;
    case "trust":
      return <TrustSection {...props} />;
    case "partners":
      return <PartnersSection {...props} />;
    case "coupons":
      return <CouponsSection {...props} />;
    case "points":
      return <PointsSection {...props} />;
    case "affiliate":
      return <AffiliateSection {...props} />;
    case "banners":
      return <BannersSection {...props} />;
    case "copilot": /* Agent C: copilot pipeline */
      return <CopilotCustomSection {...props} />;
    default:
      return assertNever(props.instance.type, "Unknown homepage section");
  }
}
