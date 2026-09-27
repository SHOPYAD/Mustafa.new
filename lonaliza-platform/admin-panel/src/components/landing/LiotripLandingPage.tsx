"use client";

import LandingNavbar from "./LandingNavbar";
import LandingHero from "./LandingHero";
import LiveStatsTicker from "./LiveStatsTicker";
import MasterDashboardIframeViewer from "./MasterDashboardIframeViewer";
import AiSwarmWarRoomShowcase from "./AiSwarmWarRoomShowcase";
import EnginesShowcase from "./EnginesShowcase";
import VisualBuilderSection from "./VisualBuilderSection";
import CustomerBookingPortalShowcase from "./CustomerBookingPortalShowcase";
import SocialCommunityReelsShowcase from "./SocialCommunityReelsShowcase";
import OmnichannelAiMarketingSection from "./OmnichannelAiMarketingSection";
import MasterclassBlogJournalism from "./MasterclassBlogJournalism";
import EnterpriseCrmSection from "./EnterpriseCrmSection";
import FinancialSafeguardsVault from "./FinancialSafeguardsVault";
import EnterpriseOwnershipAndInfrastructure from "./EnterpriseOwnershipAndInfrastructure";
import CloudArchitecture from "./CloudArchitecture";
import InteractiveTourPreview from "./InteractiveTourPreview";
import WhiteLabelShowcaseSection from "./WhiteLabelShowcaseSection";
import PricingSection from "./PricingSection";
import FAQSection from "./FAQSection";
import LandingFooter from "./LandingFooter";
import type { ResellerSettings } from "@/lib/server/resale-store";

export default function LiotripLandingPage({ settings }: { settings?: ResellerSettings }) {
  const lifetimePrice = settings?.lifetimePrice || 1990;
  const updatePrice = settings?.updatePrice || 50;
  const supportWhatsapp = settings?.supportWhatsapp || "+905015709201";
  const specsText = settings?.contaboSpecs;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#2e1065] selection:text-amber-300 font-sans antialiased">
      {/* 1. Modern Luxury Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section with Real Embedded Dashboard Iframe */}
      <LandingHero lifetimePrice={lifetimePrice} />

      {/* 3. Live Platform Metrics Ribbon */}
      <LiveStatsTicker />

      {/* 4. Interactive Master Dashboard Preview (Real Embedded Iframes with Viewport & Fullscreen Toggles) */}
      <div id="interactive-demo">
        <MasterDashboardIframeViewer />
      </div>

      {/* 5. Live Customer Booking Journey & Storefront Preview (6-Tab Carousel) */}
      <CustomerBookingPortalShowcase />

      {/* 6. Autonomous AI Swarm War Room & Telegram Bot */}
      <AiSwarmWarRoomShowcase />

      {/* 7. 6 Unified Engines & Dynamic Margin Simulator (Bento Grid 2.0) */}
      <EnginesShowcase />

      {/* 8. Real Visual Drag & Drop Builder Studio Embed */}
      <VisualBuilderSection />

      {/* 9. Decentralized Nostr Travel Network, iPhone Reels & Official Admin Badge */}
      <SocialCommunityReelsShowcase />

      {/* 10. Autonomous Omnichannel AI Marketing & Video Generation Suite */}
      <OmnichannelAiMarketingSection />

      {/* 11. Masterclass Travel Journalism (5,000-Word SEO Guides & Booking Cards) */}
      <MasterclassBlogJournalism />

      {/* 10. Omnichannel CRM & WhatsApp Baileys Direct Gateway */}
      <EnterpriseCrmSection />

      {/* 11. Financial Safeguards & Anti-Loss Vault */}
      <FinancialSafeguardsVault />

      {/* 12. Single-Domain Enterprise Technical Ownership & Data Sovereignty */}
      <EnterpriseOwnershipAndInfrastructure />

      {/* 13. Dedicated German Contabo Cloud VPS Architecture */}
      <CloudArchitecture specsText={specsText} />

      {/* 14. Interactive Onboarding Tour Preview */}
      <InteractiveTourPreview />

      {/* 15. White Label Ecosystem & Lifetime Ownership Showcase */}
      <WhiteLabelShowcaseSection />

      {/* 16. Transparent Lifetime Pricing & Annual Savings Calculator */}
      <PricingSection
        lifetimePrice={lifetimePrice}
        updatePrice={updatePrice}
        supportWhatsapp={supportWhatsapp}
      />

      {/* 16. Frequently Asked Questions */}
      <FAQSection />

      {/* 17. High-Contrast Footer */}
      <LandingFooter supportWhatsapp={supportWhatsapp} />
    </div>
  );
}
