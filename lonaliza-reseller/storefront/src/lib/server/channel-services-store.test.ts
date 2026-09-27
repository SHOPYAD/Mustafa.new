import { afterEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

describe("channel-services-store", () => {
  const files: string[] = [];

  afterEach(async () => {
    delete process.env.CHANNEL_SERVICES_STORE_FILE;
    await Promise.all(files.splice(0).map((file) => fs.rm(file, { force: true })));
  });

  async function isolatedStore() {
    const file = path.join(os.tmpdir(), `channel-services-${Date.now()}-${Math.random()}.json`);
    files.push(file);
    process.env.CHANNEL_SERVICES_STORE_FILE = file;
    return import("./channel-services-store");
  }

  it("defaults appEnabled from current website visibility and does not hide website tabs when app is off", async () => {
    const store = await isolatedStore();
    const seeded = await store.saveChannelServices({
      websiteEnabled: { ...store.defaultChannelFlags(), flight: true, hotel: true },
      appEnabled: { ...store.defaultChannelFlags(), flight: false, hotel: true },
    });
    expect(seeded.websiteEnabled.flight).toBe(true);
    expect(seeded.appEnabled.flight).toBe(false);
    expect(store.appEnabledKeys(seeded)).toEqual(
      expect.arrayContaining(["hotel"])
    );
    expect(store.appEnabledKeys(seeded)).not.toContain("flight");
  });

  it("resetAppChannel leaves website visibility intact", async () => {
    const store = await isolatedStore();
    await store.saveChannelServices({
      websiteEnabled: { ...store.defaultChannelFlags(), cars: false },
      appEnabled: { ...store.defaultChannelFlags(), cars: true },
    });
    const reset = await store.resetAppChannel();
    expect(reset.websiteEnabled.cars).toBe(false);
    expect(reset.appEnabled.cars).toBe(false);
  });
});
