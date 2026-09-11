import { describe, expect, it } from "vitest";
import { isHandoffPath } from "@/lib/server/mobile/app-surfaces";

describe("mobile website surfaces", () => {
  it("allows customer website pages and rejects admin", () => {
    expect(isHandoffPath("/account?tab=social")).toBe(true);
    expect(isHandoffPath("/visa")).toBe(true);
    expect(isHandoffPath("/blog")).toBe(true);
    expect(isHandoffPath("/admin")).toBe(false);
  });
});
