import {
  GMB_SCOPES,
  getGmbSocialEnv,
  isGmbConfigured,
  oauthRedirectUri,
  resolveSocialOrigin,
} from "../env";
import { fetchFormJson, fetchJsonWithRetry, SocialHttpError } from "../http";
import { expiresAtFromSeconds, upsertPublishOAuthChannel } from "../publish-channel-connect";
import type { PublishChannel } from "@/lib/publish/types";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GMB_ACCOUNTS = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
const GMB_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

export type GmbLocation = { id: string; name: string; address?: string };

export async function buildGmbAuthorizeUrl(req: Request, state: string): Promise<string> {
  const env = await getGmbSocialEnv();
  if (!isGmbConfigured(env)) {
    throw new SocialHttpError("مفاتيح جوجل أعمالي غير مهيأة", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const params = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: oauthRedirectUri(origin, "gmb"),
    response_type: "code",
    scope: GMB_SCOPES.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

export async function exchangeGmbCode(req: Request, code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes: string[];
}> {
  const env = await getGmbSocialEnv();
  if (!isGmbConfigured(env)) {
    throw new SocialHttpError("مفاتيح جوجل أعمالي غير مهيأة", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const token = await fetchFormJson<TokenResponse>(GOOGLE_TOKEN, {
    client_id: env.clientId,
    client_secret: env.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: oauthRedirectUri(origin, "gmb"),
  });
  if (!token.access_token) {
    throw new SocialHttpError(
      token.error_description || token.error || "فشل تبادل رمز جوجل أعمالي",
      400,
      false,
      token
    );
  }
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenExpiresAt: expiresAtFromSeconds(token.expires_in),
    scopes: (token.scope || "").split(/[ ,]+/).filter(Boolean),
  };
}

export async function listGmbLocations(accessToken: string): Promise<GmbLocation[]> {
  const accounts = await fetchJsonWithRetry<{ accounts?: Array<{ name?: string; accountName?: string }> }>(
    GMB_ACCOUNTS,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const locations: GmbLocation[] = [];
  for (const account of accounts.accounts || []) {
    const parent = (account.name || "").trim();
    if (!parent) continue;
    try {
      const listed = await fetchJsonWithRetry<{
        locations?: Array<{
          name?: string;
          title?: string;
          storefrontAddress?: { addressLines?: string[]; locality?: string };
        }>;
      }>(`${GMB_INFO}/${parent}/locations?readMask=name,title,storefrontAddress&pageSize=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      for (const loc of listed.locations || []) {
        if (!loc.name) continue;
        const address = [
          ...(loc.storefrontAddress?.addressLines || []),
          loc.storefrontAddress?.locality || "",
        ]
          .filter(Boolean)
          .join("، ");
        locations.push({
          id: loc.name,
          name: loc.title || loc.name,
          address,
        });
      }
    } catch {
      /* skip accounts without location access */
    }
  }
  return locations;
}

export async function saveGmbLocation(input: {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes?: string[];
  location: GmbLocation;
}): Promise<PublishChannel> {
  if (!input.location.id) {
    throw new SocialHttpError("لم يتم اختيار موقع جوجل أعمالي", 400, false);
  }
  return upsertPublishOAuthChannel({
    provider: "gmb",
    name: input.location.name,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    tokenExpiresAt: input.tokenExpiresAt,
    extra: {
      externalId: input.location.id,
      pageId: input.location.id,
      username: input.location.address || input.location.name,
      scopes: input.scopes,
    },
  });
}
