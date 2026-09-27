import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { publishToConnectedAccounts } from "./publish";
import { upsertStoredAccount } from "./token-store";

describe("publishToConnectedAccounts", () => {
  let dir: string;
  const prevPath = process.env.SOCIAL_TOKENS_PATH;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "alrayyan-social-"));
    process.env.SOCIAL_TOKENS_PATH = path.join(dir, "tokens.json");
    delete process.env.TIKTOK_CLIENT_KEY;
    delete process.env.TIKTOK_CLIENT_SECRET;
  });

  afterEach(() => {
    if (prevPath) process.env.SOCIAL_TOKENS_PATH = prevPath;
    else delete process.env.SOCIAL_TOKENS_PATH;
    rmSync(dir, { recursive: true, force: true });
  });

  it("refuses to publish unless approved=true", async () => {
    const result = await publishToConnectedAccounts({
      approved: false,
      platforms: ["facebook", "instagram"],
      mediaUrls: ["https://cdn.example.com/a.jpg"],
      caption: "تجربة",
    });
    expect(result.ok).toBe(false);
    expect(result.results).toHaveLength(2);
    expect(result.results.every((row) => !row.ok)).toBe(true);
    expect(
      result.results.every(
        (row) => !row.ok && row.error.code === "not_approved"
      )
    ).toBe(true);
  });

  it("rejects empty platforms", async () => {
    const result = await publishToConnectedAccounts({
      approved: true,
      platforms: [],
      mediaUrls: ["https://cdn.example.com/a.jpg"],
      caption: "تجربة",
    });
    expect(result.ok).toBe(false);
    expect(result.results[0]?.ok).toBe(false);
    if (result.results[0] && !result.results[0].ok) {
      expect(result.results[0].error.code).toBe("invalid_input");
    }
  });

  it("returns not_connected when no stored account", async () => {
    const result = await publishToConnectedAccounts({
      approved: true,
      platforms: ["facebook"],
      mediaUrls: ["https://cdn.example.com/a.jpg"],
      caption: "تجربة",
    });
    expect(result.ok).toBe(false);
    if (result.results[0] && !result.results[0].ok) {
      expect(result.results[0].error.code).toBe("not_connected");
    }
  });

  it("stubs TikTok without faking a publish when the app is missing", async () => {
    const result = await publishToConnectedAccounts({
      approved: true,
      platforms: ["tiktok"],
      mediaUrls: ["https://cdn.example.com/clip.mp4"],
      caption: "تجربة",
    });
    expect(result.ok).toBe(false);
    if (result.results[0] && !result.results[0].ok) {
      expect(result.results[0].error.code).toBe("tiktok_app_required");
    }
  });

  it("returns needs_reauth for a stored account marked as such", async () => {
    await upsertStoredAccount({
      platform: "youtube",
      displayName: "Test",
      externalId: "UC123",
      scopes: [],
      accessToken: "expired",
      status: "needs_reauth",
      lastError: "expired",
    });
    const result = await publishToConnectedAccounts({
      approved: true,
      platforms: ["youtube"],
      mediaUrls: ["https://cdn.example.com/clip.mp4"],
      caption: "تجربة",
    });
    expect(result.ok).toBe(false);
    if (result.results[0] && !result.results[0].ok) {
      expect(result.results[0].error.code).toBe("needs_reauth");
    }
  });
});
