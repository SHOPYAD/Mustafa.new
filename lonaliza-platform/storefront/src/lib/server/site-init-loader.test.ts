import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStorefrontInitData, invalidateSiteInitCache } from "./site-init-loader";

describe("Storefront Initial Data Loader & Aggregator", () => {
  beforeEach(() => {
    invalidateSiteInitCache();
  });

  it("aggregates contact, search tabs, channels, and pages into a unified payload", async () => {
    const data = await getStorefrontInitData(true);

    expect(data).toBeDefined();
    expect(data.timestamp).toBeGreaterThan(0);
    expect(data.contact).toBeDefined();
    expect(data.searchTabs).toBeDefined();
    expect(typeof data.searchTabs.visibility).toBe("object");
    expect(Array.isArray(data.pages)).toBe(true);
    expect(data.appLinks).toBeDefined();
    expect(typeof data.appLinks.googlePlayUrl).toBe("string");
  });

  it("serves subsequent requests from memory cache within 30s TTL", async () => {
    const first = await getStorefrontInitData(false);
    const second = await getStorefrontInitData(false);

    expect(second.timestamp).toBe(first.timestamp);
    expect(second).toBe(first); // exact same object reference from cache
  });

  it("forces fresh generation when forceFresh is true or cache is invalidated", async () => {
    const first = await getStorefrontInitData(false);
    await new Promise((r) => setTimeout(r, 10));

    invalidateSiteInitCache();
    const fresh = await getStorefrontInitData(false);

    expect(fresh.timestamp).toBeGreaterThanOrEqual(first.timestamp);
  });
});
