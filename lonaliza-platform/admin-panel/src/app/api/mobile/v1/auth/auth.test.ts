import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const authWithPassword = vi.fn();
const authRefresh = vi.fn();
const usersUpdate = vi.fn();
const usersCreate = vi.fn();
const getFirstListItem = vi.fn();

vi.mock("pocketbase", () => {
  class PocketBase {
    authStore = { save: vi.fn() };
    autoCancellation() {}
    collection(name: string) {
      if (name === "users") {
        return {
          authWithPassword,
          authRefresh,
          create: usersCreate,
          update: usersUpdate,
        };
      }
      return { getFirstListItem };
    }
  }
  return { default: PocketBase };
});

vi.mock("@/lib/pocketbase/admin", () => ({
  getPocketBaseUrl: vi.fn(async () => "http://pb.test"),
  tryCreateAdminPocketBase: vi.fn(async () => ({
    collection: () => ({
      update: usersUpdate,
      create: vi.fn(),
      getFirstListItem,
    }),
  })),
}));

vi.mock("@/lib/pocketbase/google", () => ({
  authWithGoogleCode: vi.fn(async () => ({
    token: "google-jwt",
    user: { id: "u-google", email: "same@lonaliza.com", name: "Same User" },
  })),
  ensureUsersGoogleProviderFromEnv: vi.fn(async () => ({ ok: true, enabled: true })),
  getGoogleOAuthCredentials: vi.fn(async () => ({
    clientId: "cid",
    clientSecret: "secret",
  })),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  clientIp: () => "127.0.0.1",
  rateLimit: () => ({ ok: true }),
  rateLimitResponse: () => new Response("limited", { status: 429 }),
}));

describe("mobile auth + handoff", () => {
  afterEach(() => {
    vi.resetModules();
    authWithPassword.mockReset();
    authRefresh.mockReset();
    usersUpdate.mockReset();
    usersCreate.mockReset();
    getFirstListItem.mockReset();
    process.env.MOBILE_HANDOFF_STORE_FILE = "";
  });

  it("logs in a website-created email and returns the same users id as the website cookie model", async () => {
    authWithPassword.mockResolvedValueOnce({
      token: "users-jwt",
      record: { id: "user-42", email: "guest@lonaliza.com", name: "Guest" },
    });
    const { POST } = await import("./login/route");
    const req = new NextRequest("http://localhost/api/mobile/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "guest@lonaliza.com", password: "secret12" }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.token).toBe("users-jwt");
    expect(body.user.id).toBe("user-42");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("rejects Google OAuth started from an embedded WebView user-agent", async () => {
    const { GET } = await import("./google/route");
    const req = new NextRequest("http://localhost/api/mobile/v1/auth/google", {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it("bridges the Google https callback into the Lonaliza app scheme", async () => {
    const { GET } = await import("./google/callback/route");
    const res = await GET(
      new NextRequest("http://localhost/api/mobile/v1/auth/google/callback?code=abc&state=s1")
    );
    const html = await res.text();
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(html).toContain("lonaliza://auth/callback");
    expect(html).toContain("code=abc");
  });

  it("exchanges a Google Auth Tab code for the same email and a live JWT", async () => {
    const { POST } = await import("./google/route");
    const req = new NextRequest("http://localhost/api/mobile/v1/auth/google", {
      method: "POST",
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
      },
      body: JSON.stringify({
        code: "auth-code",
        verifier: "pkce",
        redirectUri: "https://lonaliza.com/api/mobile/v1/auth/google/callback",
      }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.user.email).toBe("same@lonaliza.com");
    expect(body.token).toBe("google-jwt");
  });

  it("mints a one-time handoff URL, consumes it once, then 404s on reuse", async () => {
    authRefresh.mockResolvedValue({
      token: "fresh-jwt",
      record: { id: "user-42", email: "guest@lonaliza.com", name: "Guest" },
    });
    const { POST } = await import("../session/handoff/route");
    const mint = new NextRequest("http://localhost/api/mobile/v1/session/handoff", {
      method: "POST",
      headers: { authorization: "Bearer live-jwt" },
      body: JSON.stringify({ path: "/community" }),
    });
    const minted = await POST(mint);
    const mintedBody = await minted.json();
    expect(mintedBody.ok).toBe(true);
    expect(mintedBody.url).toContain("/api/mobile/v1/session/handoff?code=");
    expect(mintedBody.url).not.toContain("live-jwt");

    const { GET } = await import("../session/handoff/route");
    const code = new URL(mintedBody.url, "http://localhost").searchParams.get("code")!;
    const first = await GET(
      new NextRequest(`http://localhost/api/mobile/v1/session/handoff?code=${code}`)
    );
    expect(first.status).toBe(302);
    expect(first.headers.get("set-cookie") || "").toContain("alrayyan_pb_auth=");
    expect(first.headers.get("location")).toBe("http://localhost/community");

    const second = await GET(
      new NextRequest(`http://localhost/api/mobile/v1/session/handoff?code=${code}`)
    );
    expect(second.status).toBe(404);
  });

  it("rejects an off-allowlist handoff path", async () => {
    authRefresh.mockResolvedValue({
      token: "fresh-jwt",
      record: { id: "user-42", email: "guest@lonaliza.com", name: "Guest" },
    });
    const { POST } = await import("../session/handoff/route");
    const res = await POST(
      new NextRequest("http://localhost/api/mobile/v1/session/handoff", {
        method: "POST",
        headers: { authorization: "Bearer live-jwt" },
        body: JSON.stringify({ path: "/admin" }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("revokes the JWT on logout so a later handoff cannot set the cookie", async () => {
    authRefresh
      .mockResolvedValueOnce({
        token: "fresh-jwt",
        record: { id: "user-42", email: "guest@lonaliza.com", name: "Guest" },
      })
      .mockRejectedValueOnce(new Error("revoked"));
    usersUpdate.mockResolvedValueOnce({ id: "user-42" });

    const { POST: logout } = await import("./logout/route");
    const out = await logout(
      new NextRequest("http://localhost/api/mobile/v1/auth/logout", {
        method: "POST",
        headers: { authorization: "Bearer live-jwt" },
      })
    );
    expect(out.status).toBe(200);
    expect(usersUpdate).toHaveBeenCalled();

    const { POST: mint } = await import("../session/handoff/route");
    const minted = await mint(
      new NextRequest("http://localhost/api/mobile/v1/session/handoff", {
        method: "POST",
        headers: { authorization: "Bearer live-jwt" },
        body: JSON.stringify({ path: "/community" }),
      })
    );
    expect(minted.status).toBe(401);
  });
});
