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

import { getBrandTheme } from "@/lib/server/brand-theme-store";

export default async function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchTabs, theme] = await Promise.all([
    getSearchTabsConfig(),
    getBrandTheme(),
  ]);
  return (
    <>
      <SiteThemeStyle />
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
                <div className="notranslate" translate="no">
                  <Header />
                </div>
                <main className="min-h-screen">{children}</main>
                <div className="notranslate" translate="no">
                  <Footer />
                </div>
                <FloatingActionHub />
                <SocialSidebar />
                <CallbackBanner />
                <CompareDrawer />
                <AuthGoogleFeedback />
                <AuthModal />
              </SearchTabsProvider>
            </CustomerAuthProvider>
          </BrandingProvider>
        </BuilderModeProvider>
      </ThemeProvider>
    </>
  );
}
