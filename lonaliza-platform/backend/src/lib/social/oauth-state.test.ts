import { describe, expect, it } from "vitest";
import { createOAuthState, verifyOAuthState } from "./oauth-state";

describe("social oauth state", () => {
  it("accepts a matching provider and rejects a mismatch", async () => {
    const token = await createOAuthState("meta");
    expect(await verifyOAuthState(token, "meta")).toBe(true);
    expect(await verifyOAuthState(token, "youtube")).toBe(false);
    expect(await verifyOAuthState("tampered.sig", "meta")).toBe(false);
  });

  it("accepts newly registered publish-engine providers", async () => {
    const token = await createOAuthState("linkedin");
    expect(await verifyOAuthState(token, "linkedin")).toBe(true);
    expect(await verifyOAuthState(token, "linkedin-page")).toBe(false);
  });
});
