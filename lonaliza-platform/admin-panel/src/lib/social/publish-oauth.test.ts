import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { oauthRedirectUri } from "./env";
import { upsertPublishOAuthChannel } from "./publish-channel-connect";
import { decryptChannelSecrets } from "@/lib/publish/channels";
import { getStoredChannel } from "@/lib/publish/store";
import { resetPublishFileMemory } from "@/lib/publish/file-store";
import { resetPublishCryptoCache } from "@/lib/publish/crypto";
import { buildLinkedInAuthorizeUrl } from "./platforms/linkedin";
import { buildThreadsAuthorizeUrl } from "./platforms/threads";
import { buildPinterestAuthorizeUrl } from "./platforms/pinterest";
import { buildGmbAuthorizeUrl } from "./platforms/gmb";
import { completeTelegramConnect } from "./platforms/telegram";

describe("publish OAuth helpers", () => {
  let dir: string;
  const prev = {
    store: process.env.PUBLISH_STORE_DIR,
    force: process.env.PUBLISH_FORCE_FILE,
    secret: process.env.PUBLISH_TOKEN_SECRET,
    apps: process.env.SOCIAL_OAUTH_APPS_PATH,
    pending: process.env.SOCIAL_OAUTH_PENDING_PATH,
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-oauth-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    process.env.SOCIAL_OAUTH_APPS_PATH = path.join(dir, "apps.json");
    process.env.SOCIAL_OAUTH_PENDING_PATH = path.join(dir, "pending.json");
    resetPublishFileMemory();
    resetPublishCryptoCache();
  });

  afterEach(() => {
    resetPublishFileMemory();
    resetPublishCryptoCache();
    for (const [key, value] of Object.entries({
      PUBLISH_STORE_DIR: prev.store,
      PUBLISH_FORCE_FILE: prev.force,
      PUBLISH_TOKEN_SECRET: prev.secret,
      SOCIAL_OAUTH_APPS_PATH: prev.apps,
      SOCIAL_OAUTH_PENDING_PATH: prev.pending,
    })) {
      if (value) process.env[key] = value;
      else delete process.env[key];
    }
    rmSync(dir, { recursive: true, force: true });
  });

  it("documents callback URLs for the six extra networks", () => {
    const origin = "https://lonaliza.com";
    expect(oauthRedirectUri(origin, "linkedin")).toBe("https://lonaliza.com/api/oauth/linkedin/callback");
    expect(oauthRedirectUri(origin, "linkedin-page")).toBe(
      "https://lonaliza.com/api/oauth/linkedin-page/callback"
    );
    expect(oauthRedirectUri(origin, "threads")).toBe("https://lonaliza.com/api/oauth/threads/callback");
    expect(oauthRedirectUri(origin, "pinterest")).toBe("https://lonaliza.com/api/oauth/pinterest/callback");
    expect(oauthRedirectUri(origin, "gmb")).toBe("https://lonaliza.com/api/oauth/gmb/callback");
    expect(oauthRedirectUri(origin, "telegram")).toBe("https://lonaliza.com/api/oauth/telegram");
  });

  it("refuses to upsert a channel without a token", async () => {
    await expect(
      upsertPublishOAuthChannel({
        provider: "linkedin",
        name: "fake",
        accessToken: "",
        extra: { externalId: "1" },
      })
    ).rejects.toThrow(/بلا رمز/);
  });

  it("encrypts tokens into the publish channel store", async () => {
    const publicRow = await upsertPublishOAuthChannel({
      provider: "threads",
      name: "ثريدز",
      accessToken: "THREADS_SECRET",
      refreshToken: "THREADS_REFRESH",
      extra: { externalId: "th-1", username: "lonaliza" },
    });
    expect(publicRow.provider).toBe("threads");
    expect(JSON.stringify(publicRow)).not.toContain("THREADS_SECRET");
    const stored = await getStoredChannel(publicRow.id);
    expect(stored?.accessTokenEnc).toBeTruthy();
    expect(stored?.accessTokenEnc).not.toContain("THREADS_SECRET");
    const secrets = await decryptChannelSecrets(stored!);
    expect(secrets.accessToken).toBe("THREADS_SECRET");
    expect(secrets.refreshToken).toBe("THREADS_REFRESH");
    expect(secrets.extra.externalId).toBe("th-1");
  });

  it("builds official authorize URLs when keys exist", async () => {
    process.env.LINKEDIN_CLIENT_ID = "li-id";
    process.env.LINKEDIN_CLIENT_SECRET = "li-secret";
    process.env.THREADS_APP_ID = "th-id";
    process.env.THREADS_APP_SECRET = "th-secret";
    process.env.PINTEREST_CLIENT_ID = "pin-id";
    process.env.PINTEREST_CLIENT_SECRET = "pin-secret";
    process.env.GOOGLE_GMB_CLIENT_ID = "gmb-id";
    process.env.GOOGLE_GMB_CLIENT_SECRET = "gmb-secret";
    const req = new Request("https://lonaliza.com/admin");
    const linkedin = await buildLinkedInAuthorizeUrl(req, "state-li", "linkedin");
    expect(linkedin).toContain("linkedin.com/oauth/v2/authorization");
    expect(decodeURIComponent(linkedin)).toContain("/api/oauth/linkedin/callback");
    const page = await buildLinkedInAuthorizeUrl(req, "state-page", "linkedin-page");
    expect(decodeURIComponent(page)).toContain("/api/oauth/linkedin-page/callback");
    const threads = await buildThreadsAuthorizeUrl(req, "state-th");
    expect(threads).toContain("threads.net/oauth/authorize");
    expect(threads).toContain("threads_content_publish");
    const pinterest = await buildPinterestAuthorizeUrl(req, "state-pin");
    expect(pinterest).toContain("pinterest.com/oauth");
    const gmb = await buildGmbAuthorizeUrl(req, "state-gmb");
    expect(gmb).toContain("accounts.google.com");
    expect(gmb).toContain("business.manage");
    delete process.env.LINKEDIN_CLIENT_ID;
    delete process.env.LINKEDIN_CLIENT_SECRET;
    delete process.env.THREADS_APP_ID;
    delete process.env.THREADS_APP_SECRET;
    delete process.env.PINTEREST_CLIENT_ID;
    delete process.env.PINTEREST_CLIENT_SECRET;
    delete process.env.GOOGLE_GMB_CLIENT_ID;
    delete process.env.GOOGLE_GMB_CLIENT_SECRET;
  });

  it("saves telegram bot token + chat id only after getMe and getChat succeed", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/getMe")) {
        return new Response(JSON.stringify({ ok: true, result: { id: 9, username: "lonaliza_bot" } }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/getChat")) {
        return new Response(
          JSON.stringify({ ok: true, result: { id: -1001, title: "عروض لوناليزا", username: "lonaliza_offers" } }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response("no", { status: 500 });
    });
    const original = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    try {
      const channel = await completeTelegramConnect({
        botToken: "123:ABC",
        chatId: "-1001",
      });
      expect(channel.provider).toBe("telegram");
      expect(channel.name).toContain("لوناليزا");
      const stored = await getStoredChannel(channel.id);
      const secrets = await decryptChannelSecrets(stored!);
      expect(secrets.accessToken).toBe("-1001");
      expect(secrets.pageAccessToken).toBe("123:ABC");
      expect(secrets.extra.externalId).toBe("-1001");
    } finally {
      globalThis.fetch = original;
    }
  });

  it("does not connect telegram when getChat fails", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/getMe")) {
        return new Response(JSON.stringify({ ok: true, result: { id: 9 } }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: false, description: "chat not found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const original = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    try {
      await expect(completeTelegramConnect({ botToken: "123:ABC", chatId: "nope" })).rejects.toThrow(/محادثة/);
    } finally {
      globalThis.fetch = original;
    }
  });
});
