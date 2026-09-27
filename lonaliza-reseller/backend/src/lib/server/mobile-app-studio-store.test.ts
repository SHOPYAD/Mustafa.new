import { describe, expect, it } from "vitest";
import { ensureBottomNavTabs } from "@/lib/mobile-app-types";
import { DEFAULT_MOBILE_APP_STUDIO, saveMobileAppStudioSettings } from "./mobile-app-studio-store";

describe("mobile app studio store", () => {
  it("rejects javascript api bases and keeps https", async () => {
    const saved = await saveMobileAppStudioSettings({
      apiBase: "javascript:alert(1)",
      displayName: "Lonaliza QA",
    });
    expect(saved.apiBase).toBe(DEFAULT_MOBILE_APP_STUDIO.apiBase);
    expect(saved.displayName).toBe("Lonaliza QA");
  });

  it("appends the more tab when a 4-tab studio config is loaded", () => {
    const tabs = ensureBottomNavTabs([
      { id: "tab_home", titleAr: "الرئيسية", titleEn: "Home", path: "/", icon: "home", enabled: true, order: 1 },
      { id: "tab_wallet", titleAr: "المحفظة", titleEn: "Wallet", path: "/account?tab=wallet", icon: "wallet", enabled: true, order: 2 },
      { id: "tab_reels", titleAr: "السوشيال", titleEn: "Community", path: "/community", icon: "reels", enabled: true, order: 3 },
      { id: "tab_account", titleAr: "حسابي", titleEn: "Account", path: "/account", icon: "user", enabled: true, order: 4 },
    ]);
    expect(tabs).toHaveLength(5);
    expect(tabs[4]?.path).toBe("/menu");
    expect(tabs[4]?.id).toBe("tab_more");
  });
});
