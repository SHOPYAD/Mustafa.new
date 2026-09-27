import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActionHub from "@/components/ui/FloatingActionHub";
import SocialSidebar from "@/components/ui/SocialSidebar";
import CallbackBanner from "@/components/home/CallbackBanner";
import CompareDrawer from "@/components/packages/CompareDrawer";
import SiteTrackingScripts from "@/components/tracking/SiteTrackingScripts";
import BrandingProvider from "@/components/branding/BrandingProvider";
import ThemeProvider from "@/components/theme/ThemeProvider";
import SiteThemeStyle from "@/components/theme/SiteThemeStyle";
import CustomerAuthProvider from "@/components/auth/CustomerAuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import AuthGoogleFeedback from "@/components/auth/AuthGoogleFeedback";
import AffiliateTracker from "@/components/affiliate/AffiliateTracker";
import { BuilderModeProvider } from "@/components/builder/BuilderModeProvider";
import SearchTabsProvider from "@/components/search/SearchTabsProvider";
import { getSearchTabsConfig } from "@/lib/server/search-tabs-store";
import { isOrigin } from "@/lib/server/deployment-role";
import B2BLandingChatWidget from "@/components/chat/B2BLandingChatWidget";
import { headers, cookies } from "next/headers";
import { APP_SHELL_COOKIE, APP_SHELL_HEADER } from "@/lib/mobile/app-mode";
import AppModeClientSync from "@/components/mobile/AppModeClientSync";
import { cn } from "@/lib/utils";

import { getBrandTheme } from "@/lib/server/brand-theme-store";

/**
 * Public site chrome only — never wraps /admin (route group isolation).
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchTabs, theme, headerList, cookieStore] = await Promise.all([
    getSearchTabsConfig(),
    getBrandTheme(),
    headers(),
    cookies(),
  ]);
  const isMasterOrigin = isOrigin();
  const userAgent = headerList.get("user-agent") || "";
  const isDesktop = !/Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const isApp =
    headerList.get(APP_SHELL_HEADER) === "1" ||
    cookieStore.get(APP_SHELL_COOKIE)?.value === "1" ||
    userAgent.includes("LonalizaApp") ||
    (!isDesktop && (headerList.get("sec-ch-ua-mobile") === "?1"));
  const hideSiteChrome = isApp;

  return (
    <>
      <SiteThemeStyle />
      <AppModeClientSync initialIsApp={isApp} />
      <ThemeProvider initialTheme={theme}>
        <BuilderModeProvider>
          <BrandingProvider>
            <CustomerAuthProvider>
              <SearchTabsProvider
                initialVisibility={searchTabs.visibility}
                initialOrder={searchTabs.order}
              >
                <SiteTrackingScripts />
                <AffiliateTracker />
                {!hideSiteChrome && (
                  <div className="notranslate" translate="no">
                    <Header />
                  </div>
                )}
                <main className={cn("min-h-screen", isApp && "lonaliza-app-shell pb-24")}>
                  {children}
                </main>
                {!hideSiteChrome && (
                  <div className="notranslate" translate="no">
                    <Footer />
                  </div>
                )}
                {!hideSiteChrome && <FloatingActionHub />}
                {!hideSiteChrome && <SocialSidebar />}
                {!hideSiteChrome && <CallbackBanner />}
                <CompareDrawer />
                <AuthGoogleFeedback />
                <AuthModal />
                {!isApp && <B2BLandingChatWidget />}
              </SearchTabsProvider>
            </CustomerAuthProvider>
          </BrandingProvider>
        </BuilderModeProvider>
      </ThemeProvider>
    </>
  );
}

