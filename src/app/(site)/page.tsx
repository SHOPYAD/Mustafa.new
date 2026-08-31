import HomepageView from "@/components/home/template/HomepageView";
import { getPublishedHomepageDraft } from "@/lib/server/homepage-template-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialDraft = await getPublishedHomepageDraft();
  return <HomepageView initialDraft={initialDraft} />;
}
