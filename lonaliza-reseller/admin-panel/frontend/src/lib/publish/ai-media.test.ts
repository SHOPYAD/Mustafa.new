import { describe, expect, it } from "vitest";
import { generatePublishVideo, listPublishVideoOptions } from "./ai-media";

describe("publish AI video options", () => {
  it("lists slides / veo-like options and does not mark Seedance available without a key", async () => {
    const prev = process.env.EVOLINK_API_KEY;
    delete process.env.EVOLINK_API_KEY;
    const rows = await listPublishVideoOptions();
    if (prev) process.env.EVOLINK_API_KEY = prev;
    expect(rows.map((row) => row.identifier)).toEqual(
      expect.arrayContaining(["image-text-slides", "veo", "omni", "seedance"])
    );
    expect(rows.find((row) => row.identifier === "seedance")?.available).toBe(false);
  });

  it("refuses an unavailable identifier without claiming success", async () => {
    const prev = process.env.EVOLINK_API_KEY;
    delete process.env.EVOLINK_API_KEY;
    const result = await generatePublishVideo({
      identifier: "seedance",
      prompt: "كابادوكيا عند الغروب",
    });
    if (prev) process.env.EVOLINK_API_KEY = prev;
    expect(result.ok).toBe(false);
    expect(result.approved).toBe(false);
    expect(result.media).toBeUndefined();
    expect(result.error).toMatch(/EVOLINK|غير/);
  });
});
