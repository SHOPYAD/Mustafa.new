import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  authWithGoogleCode,
  ensureUsersGoogleProviderFromEnv,
  getGoogleOAuthCredentials,
} from "@/lib/pocketbase/google";
import { isEmbeddedWebViewUserAgent } from "@/lib/server/mobile/handoff-allowlist";

export const runtime = "nodejs";

const MOBILE_REDIRECT = "lonaliza://auth/callback";

export async function GET(req: NextRequest) {
  if (isEmbeddedWebViewUserAgent(req.headers.get("user-agent") || "")) {
    return NextResponse.json({ ok: false, error: "webview_oauth_forbidden" }, { status: 400 });
  }

  const { clientId, clientSecret } = await getGoogleOAuthCredentials();
  if (!clientId || !clientSecret) {
    return NextResponse.json({ ok: false, error: "google_config" }, { status: 400 });
  }
  const synced = await ensureUsersGoogleProviderFromEnv();
  if (!synced.ok) {
    return NextResponse.json({ ok: false, error: "google_config" }, { status: 400 });
  }

  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("base64url");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: MOBILE_REDIRECT,
    response_type: "code",
    scope: "openid email profile",
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  return NextResponse.json({
    ok: true,
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    verifier,
    redirectUri: MOBILE_REDIRECT,
  });
}

export async function POST(req: NextRequest) {
  if (isEmbeddedWebViewUserAgent(req.headers.get("user-agent") || "")) {
    return NextResponse.json({ ok: false, error: "webview_oauth_forbidden" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const code = String(body.code || "").trim();
  const verifier = String(body.verifier || "").trim();
  const redirectUri = String(body.redirectUri || MOBILE_REDIRECT).trim();
  if (!code || !verifier) {
    return NextResponse.json({ ok: false, error: "code_required" }, { status: 400 });
  }

  try {
    await ensureUsersGoogleProviderFromEnv();
    const auth = await authWithGoogleCode({ code, verifier, redirectUri });
    return NextResponse.json({
      ok: true,
      token: auth.token,
      user: auth.user,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "google_failed" }, { status: 401 });
  }
}
