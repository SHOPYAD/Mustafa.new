import {
  getLinkedInSocialEnv,
  isLinkedInConfigured,
  LINKEDIN_SCOPES,
  oauthRedirectUri,
  resolveSocialOrigin,
} from "../env";
import { fetchFormJson, fetchJsonWithRetry, SocialHttpError } from "../http";
import { expiresAtFromSeconds, upsertPublishOAuthChannel } from "../publish-channel-connect";
import type { PublishChannel } from "@/lib/publish/types";
import type { PublishOAuthProvider } from "../types";

const LI_AUTH = "https://www.linkedin.com/oauth/v2/authorization";
const LI_TOKEN = "https://www.linkedin.com/oauth/v2/accessToken";
const LI_USERINFO = "https://api.linkedin.com/v2/userinfo";
const LI_REST = "https://api.linkedin.com/rest";
const LI_V2 = "https://api.linkedin.com/v2";
const LI_VERSION = "202601";

export type LinkedInKind = "linkedin" | "linkedin-page";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

export type LinkedInOrg = { id: string; name: string; vanity?: string };

function liHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": LI_VERSION,
  };
}

function orgIdFromUrn(value: string): string {
  const match = String(value || "").match(/organization[:%3A]+(\d+)/i);
  if (match?.[1]) return match[1];
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits;
}

export async function buildLinkedInAuthorizeUrl(
  req: Request,
  state: string,
  kind: LinkedInKind
): Promise<string> {
  const env = await getLinkedInSocialEnv();
  if (!isLinkedInConfigured(env)) {
    throw new SocialHttpError("مفاتيح لينكدإن غير مهيأة (LINKEDIN_CLIENT_ID / SECRET)", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.clientId,
    redirect_uri: oauthRedirectUri(origin, kind),
    state,
    scope: LINKEDIN_SCOPES.join(" "),
  });
  return `${LI_AUTH}?${params.toString()}`;
}

export async function exchangeLinkedInCode(
  req: Request,
  code: string,
  kind: LinkedInKind
): Promise<{
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes: string[];
  personId: string;
  displayName: string;
  picture?: string;
}> {
  const env = await getLinkedInSocialEnv();
  if (!isLinkedInConfigured(env)) {
    throw new SocialHttpError("مفاتيح لينكدإن غير مهيأة", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const token = await fetchFormJson<TokenResponse>(LI_TOKEN, {
    grant_type: "authorization_code",
    code,
    redirect_uri: oauthRedirectUri(origin, kind),
    client_id: env.clientId,
    client_secret: env.clientSecret,
  });
  if (!token.access_token) {
    throw new SocialHttpError(
      token.error_description || token.error || "فشل تبادل رمز لينكدإن",
      400,
      false,
      token
    );
  }
  const profile = await fetchJsonWithRetry<{
    sub?: string;
    name?: string;
    given_name?: string;
    picture?: string;
    error_description?: string;
  }>(LI_USERINFO, { headers: { Authorization: `Bearer ${token.access_token}` } });
  const personId = (profile.sub || "").trim();
  if (!personId) {
    throw new SocialHttpError("تعذر قراءة ملف لينكدإن الشخصي", 400, false, profile);
  }
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenExpiresAt: expiresAtFromSeconds(token.expires_in),
    scopes: (token.scope || "").split(/[ ,]+/).filter(Boolean),
    personId,
    displayName: profile.name || profile.given_name || "LinkedIn",
    picture: profile.picture,
  };
}

export async function listLinkedInOrganizations(accessToken: string): Promise<LinkedInOrg[]> {
  const orgs = new Map<string, LinkedInOrg>();
  try {
    const rest = await fetchJsonWithRetry<{
      elements?: Array<{ organization?: string; roleAssignee?: string }>;
    }>(`${LI_REST}/organizationAcls?q=roleAssignee&count=50`, {
      headers: liHeaders(accessToken),
    });
    for (const row of rest.elements || []) {
      const id = orgIdFromUrn(String(row.organization || ""));
      if (id) orgs.set(id, { id, name: `Organization ${id}` });
    }
  } catch {
    /* fallback below */
  }
  if (orgs.size === 0) {
    try {
      const v2 = await fetchJsonWithRetry<{
        elements?: Array<{
          organization?: string;
          "organization~"?: { id?: number | string; localizedName?: string; vanityName?: string };
        }>;
      }>(
        `${LI_V2}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization,organization~(id,localizedName,vanityName)))`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      for (const row of v2.elements || []) {
        const nested = row["organization~"];
        const id = String(nested?.id || orgIdFromUrn(String(row.organization || "")));
        if (!id) continue;
        orgs.set(id, {
          id,
          name: nested?.localizedName || `Organization ${id}`,
          vanity: nested?.vanityName,
        });
      }
    } catch {
      /* empty list is handled by caller */
    }
  }
  for (const org of orgs.values()) {
    if (org.name.startsWith("Organization ")) {
      try {
        const detail = await fetchJsonWithRetry<{ localizedName?: string; vanityName?: string; id?: number }>(
          `${LI_REST}/organizations/${org.id}`,
          { headers: liHeaders(accessToken) }
        );
        org.name = detail.localizedName || org.name;
        org.vanity = detail.vanityName || org.vanity;
      } catch {
        /* keep fallback name */
      }
    }
  }
  return [...orgs.values()];
}

export async function saveLinkedInPersonal(input: {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes: string[];
  personId: string;
  displayName: string;
  picture?: string;
}): Promise<PublishChannel> {
  return upsertPublishOAuthChannel({
    provider: "linkedin",
    name: input.displayName,
    picture: input.picture,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    tokenExpiresAt: input.tokenExpiresAt,
    extra: {
      externalId: input.personId,
      username: input.displayName,
      scopes: input.scopes,
    },
  });
}

export async function saveLinkedInPage(input: {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes?: string[];
  org: LinkedInOrg;
}): Promise<PublishChannel> {
  if (!input.org.id) {
    throw new SocialHttpError("لم يتم اختيار صفحة لينكدإن", 400, false);
  }
  return upsertPublishOAuthChannel({
    provider: "linkedin-page" satisfies PublishOAuthProvider,
    name: input.org.name,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    tokenExpiresAt: input.tokenExpiresAt,
    extra: {
      externalId: input.org.id,
      pageId: input.org.id,
      username: input.org.vanity || input.org.name,
      scopes: input.scopes,
    },
  });
}

export async function completeLinkedInPersonalOAuth(req: Request, code: string): Promise<PublishChannel> {
  const exchanged = await exchangeLinkedInCode(req, code, "linkedin");
  return saveLinkedInPersonal(exchanged);
}
