import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ACCOUNT_STATUS_AR } from "./types";
import {
  listPublicAccounts,
  removeStoredAccount,
  toPublicAccount,
  upsertStoredAccount,
} from "./token-store";

describe("social token store", () => {
  let dir: string;
  const prevPath = process.env.SOCIAL_TOKENS_PATH;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "alrayyan-social-"));
    process.env.SOCIAL_TOKENS_PATH = path.join(dir, "tokens.json");
  });

  afterEach(() => {
    if (prevPath) process.env.SOCIAL_TOKENS_PATH = prevPath;
    else delete process.env.SOCIAL_TOKENS_PATH;
    rmSync(dir, { recursive: true, force: true });
  });

  it("never exposes tokens on the public projection", async () => {
    const stored = await upsertStoredAccount({
      platform: "facebook",
      displayName: "Alrayyan",
      externalId: "111",
      scopes: ["pages_manage_posts"],
      accessToken: "USER_SECRET",
      pageAccessToken: "PAGE_SECRET",
      refreshToken: "REFRESH_SECRET",
    });
    const publicRow = toPublicAccount(stored);
    expect(publicRow.statusLabel).toBe(ACCOUNT_STATUS_AR.connected);
    expect(JSON.stringify(publicRow)).not.toContain("USER_SECRET");
    expect(JSON.stringify(publicRow)).not.toContain("PAGE_SECRET");
    expect(JSON.stringify(publicRow)).not.toContain("REFRESH_SECRET");
    expect(publicRow.hasAccessToken).toBe(true);
    expect(publicRow.hasRefreshToken).toBe(true);

    const listed = await listPublicAccounts();
    expect(listed).toHaveLength(1);
    expect(JSON.stringify(listed)).not.toContain("USER_SECRET");

    const raw = readFileSync(process.env.SOCIAL_TOKENS_PATH!, "utf8");
    expect(raw).toContain("USER_SECRET");
  });

  it("removes an account on disconnect", async () => {
    const stored = await upsertStoredAccount({
      platform: "instagram",
      displayName: "IG",
      externalId: "222",
      scopes: ["instagram_content_publish"],
      accessToken: "tok",
    });
    expect(await removeStoredAccount(stored.id)).toBe(true);
    expect(await listPublicAccounts()).toHaveLength(0);
  });
});
