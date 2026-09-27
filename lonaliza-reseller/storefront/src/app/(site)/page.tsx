import HomepageView from "@/components/home/template/HomepageView";
import LiotripLandingPage from "@/components/landing/LiotripLandingPage";
import { getPublishedHomepageDraft } from "@/lib/server/homepage-template-store";
import { getResellerSettings } from "@/lib/server/resale-store";
import { isOrigin } from "@/lib/server/deployment-role";
import { headers, cookies } from "next/headers";
import { APP_SHELL_COOKIE, APP_SHELL_HEADER } from "@/lib/mobile/app-mode";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);
  const userAgent = headerList.get("user-agent") || "";
  const isDesktop = !/Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const isApp =
    !isDesktop &&
    (headerList.get(APP_SHELL_HEADER) === "1" ||
      cookieStore.get(APP_SHELL_COOKIE)?.value === "1" ||
      userAgent.includes("LonalizaApp"));

  if (isApp) {
    const initialDraft = await getPublishedHomepageDraft();
    return <HomepageView initialDraft={initialDraft} />;
  }

  if (isOrigin()) {
    const settings = await getResellerSettings();
    return <LiotripLandingPage settings={settings} />;
  }

  const initialDraft = await getPublishedHomepageDraft();
  return <HomepageView initialDraft={initialDraft} />;
}

