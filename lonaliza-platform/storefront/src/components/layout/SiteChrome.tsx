"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActionHub from "@/components/ui/FloatingActionHub";
import SocialSidebar from "@/components/ui/SocialSidebar";
import CallbackBanner from "@/components/home/CallbackBanner";
import CompareDrawer from "@/components/packages/CompareDrawer";

function SiteChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname?.startsWith("/admin");
  const isFlightsRedirect = pathname?.startsWith("/flights/redirect");
  const editorMode =
    searchParams.get("editor") === "1" ||
    searchParams.get("editor") === "true" ||
    searchParams.get("builder") === "1" ||
    searchParams.get("builder") === "true";

  const isCommunity = pathname?.startsWith("/community");
  const isAdvisor = pathname?.startsWith("/ai-chat");

  if (isAdmin || isFlightsRedirect) {
    return <>{children}</>;
  }

  if (isAdvisor) {
    return <main className="h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      {!editorMode && !isCommunity && !isAdvisor && (
        <>
          <FloatingActionHub />
          <SocialSidebar />
          <CallbackBanner />
        </>
      )}
      {!editorMode && <CompareDrawer />}
    </>
  );
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <SiteChromeInner>{children}</SiteChromeInner>
    </Suspense>
  );
}
