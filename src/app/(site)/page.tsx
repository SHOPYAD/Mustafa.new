import HomepageView from "@/components/home/template/HomepageView";
import LiotripLandingPage from "@/components/landing/LiotripLandingPage";
import { getPublishedHomepageDraft } from "@/lib/server/homepage-template-store";
import { getResellerSettings } from "@/lib/server/resale-store";
import { isOrigin } from "@/lib/server/deployment-role";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (isOrigin()) {
    const settings = await getResellerSettings();
    return <LiotripLandingPage settings={settings} />;
  }

  const initialDraft = await getPublishedHomepageDraft();
  return <HomepageView initialDraft={initialDraft} />;
}
