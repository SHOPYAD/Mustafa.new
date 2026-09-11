import { describe, expect, it } from "vitest";
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
});
