"use client";

import LandingNavbar from "./LandingNavbar";
import LandingHero from "./LandingHero";
import LiveStatsTicker from "./LiveStatsTicker";
import EnginesShowcase from "./EnginesShowcase";
import AiAutomationSuite from "./AiAutomationSuite";
import VisualBuilderSection from "./VisualBuilderSection";
import EnterpriseCrmSection from "./EnterpriseCrmSection";
import CloudArchitecture from "./CloudArchitecture";
import InteractiveTourPreview from "./InteractiveTourPreview";
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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-white font-sans">
      <LandingNavbar />
      <LandingHero lifetimePrice={lifetimePrice} />
      <LiveStatsTicker />
      <EnginesShowcase />
      <AiAutomationSuite />
      <VisualBuilderSection />
      <EnterpriseCrmSection />
      <CloudArchitecture specsText={specsText} />
      <InteractiveTourPreview />
      <PricingSection
        lifetimePrice={lifetimePrice}
        updatePrice={updatePrice}
        supportWhatsapp={supportWhatsapp}
      />
      <FAQSection />
      <LandingFooter supportWhatsapp={supportWhatsapp} />
    </div>
  );
}
